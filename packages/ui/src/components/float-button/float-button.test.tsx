/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { FloatButton, FloatButtonGroup } from "./float-button";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never;
}

afterEach(cleanup);

describe("FloatButton", () => {
  test("renders default button with base slot attributes", () => {
    render(<FloatButton>Action</FloatButton>);
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.getAttribute("data-slot")).toBe("float-button");
    expect(button.getAttribute("data-shape")).toBe("circle");
    expect(button.getAttribute("data-size")).toBe("md");
    expect(button.getAttribute("data-variant")).toBe("default");
  });

  test("renders with icon and description", () => {
    render(<FloatButton icon={<span data-testid="test-icon">icon</span>} description="Top" />);
    expect(screen.getByTestId("test-icon")).toBeDefined();
    const desc = screen.getByText("Top");
    expect(desc.getAttribute("data-slot")).toBe("float-button-description");
  });

  test("calculates fixed position and side offsets correctly", () => {
    render(
      <FloatButton position="fixed" side="bottom-right" offset={[24, 32]}>
        Pos
      </FloatButton>,
    );
    const button = screen.getByRole("button");
    expect(button.style.position).toBe("fixed");
    expect(button.style.right).toBe("24px");
    expect(button.style.bottom).toBe("32px");
  });

  test("respects relative position", () => {
    render(<FloatButton position="relative">Rel</FloatButton>);
    const button = screen.getByRole("button");
    expect(button.style.position).toBe("relative");
  });

  test("renders native button attributes and respects disabled state", () => {
    render(<FloatButton disabled>Disabled</FloatButton>);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  for (const theme of ["brutal", "elegant"] as const) {
    test(`${theme}: renders recipe classes correctly`, () => {
      render(
        <ThemeProvider theme={theme}>
          <FloatButton shape="square" size="lg" variant="primary">
            Theme
          </FloatButton>
        </ThemeProvider>,
      );
      const button = screen.getByRole("button");
      if (theme === "brutal") {
        expect(button.className).toContain("border-2");
        expect(button.className).toContain("rounded-none");
      } else {
        expect(button.className).toContain("rounded-lg");
      }
    });
  }
});

describe("FloatButtonGroup", () => {
  test("renders group with child buttons", () => {
    render(
      <FloatButtonGroup position="fixed" side="top-left" offset={20}>
        <FloatButton>1</FloatButton>
        <FloatButton>2</FloatButton>
      </FloatButtonGroup>,
    );
    const group = screen.getByRole("group");
    expect(group.getAttribute("data-slot")).toBe("float-button-group");
    expect(group.style.position).toBe("fixed");
    expect(group.style.top).toBe("20px");
    expect(group.style.left).toBe("20px");
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  test("supports attached mode and horizontal direction", () => {
    render(
      <FloatButtonGroup direction="horizontal" attached shape="square">
        <FloatButton>A</FloatButton>
        <FloatButton>B</FloatButton>
      </FloatButtonGroup>,
    );
    const group = screen.getByRole("group");
    expect(group.getAttribute("data-direction")).toBe("horizontal");
    expect(group.getAttribute("data-attached")).toBe("true");
  });
});
