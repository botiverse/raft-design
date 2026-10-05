/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, expectTypeOf, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { FloatButton, FloatButtonGroup } from "./float-button";
import type { FloatButtonGroupProps, FloatButtonProps } from "./float-button";

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

const fixedOffset: [number, number] = [24, 32];

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
    expect(button.className).toContain("r-float-button");
    expect(button.className).toContain("r-float-button--circle");
    expect(button.className).toContain("r-float-button--md");
    expect(button.className).toContain("r-float-button--default");
  });

  test("renders with icon and description", () => {
    render(<FloatButton icon={<span data-testid="test-icon">icon</span>} description="Top" />);
    expect(screen.getByTestId("test-icon")).toBeDefined();
    const desc = screen.getByText("Top");
    expect(desc.getAttribute("data-slot")).toBe("float-button-description");
    expect(desc.className).toContain("r-float-button__desc");
  });

  test("calculates fixed position and side offsets correctly", () => {
    render(
      <FloatButton position="fixed" side="bottom-right" offset={fixedOffset}>
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

  test("supports xs size", () => {
    render(<FloatButton size="xs">XS</FloatButton>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-size")).toBe("xs");
    expect(button.className).toContain("r-float-button--xs");
  });

  test("renders native button attributes and respects disabled state", () => {
    render(<FloatButton disabled>Disabled</FloatButton>);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  test("renders text content with wrapper slot and data-with-text", () => {
    render(<FloatButton>189 new messages</FloatButton>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-with-text")).toBe("true");
    expect(button.className).toContain("r-float-button--with-text");
    const textSpan = screen.getByText("189 new messages");
    expect(textSpan.getAttribute("data-slot")).toBe("float-button-text");
    expect(textSpan.className).toContain("r-float-button__text");
  });

  test("supports pill shape", () => {
    render(<FloatButton shape="pill">Back to bottom</FloatButton>);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-shape")).toBe("pill");
    expect(button.className).toContain("r-float-button--pill");
  });

  test("renders icon alongside text seamlessly", () => {
    render(
      <FloatButton icon={<span data-testid="down-arrow">↓</span>} shape="pill" variant="primary">
        99+
      </FloatButton>,
    );
    const button = screen.getByRole("button");
    expect(screen.getByTestId("down-arrow")).toBeDefined();
    expect(screen.getByText("99+")).toBeDefined();
    expect(button.getAttribute("data-shape")).toBe("pill");
    expect(button.getAttribute("data-with-text")).toBe("true");
  });

  for (const theme of ["brutal", "elegant"] as const) {
    test(`${theme}: renders classes correctly`, () => {
      render(
        <ThemeProvider theme={theme}>
          <FloatButton shape="square" size="lg" variant="primary">
            Theme
          </FloatButton>
        </ThemeProvider>,
      );
      const button = screen.getByRole("button");
      expect(button.className).toContain("r-float-button");
      expect(button.className).toContain("r-float-button--square");
      expect(button.className).toContain("r-float-button--lg");
      expect(button.className).toContain("r-float-button--primary");
      if (theme === "elegant") {
        expect(button.className).toContain("r-float-button--elegant");
      } else {
        expect(button.className).not.toContain("r-float-button--elegant");
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
    expect(group.className).toContain("r-float-button-group");
    expect(group.className).toContain("r-float-button-group--vertical");
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
    expect(group.className).toContain("r-float-button-group--horizontal");
    expect(group.className).toContain("r-float-button-group--attached");
    expect(group.className).toContain("r-float-button-group--square");
  });

  test("provides context shape and size to child buttons", () => {
    render(
      <FloatButtonGroup shape="square" size="sm">
        <FloatButton>Child</FloatButton>
      </FloatButtonGroup>,
    );
    const button = screen.getByRole("button");
    expect(button.className).toContain("r-float-button--square");
    expect(button.className).toContain("r-float-button--sm");
  });

  for (const theme of ["brutal", "elegant"] as const) {
    test(`${theme}: resolves its theme class from ThemeProvider`, () => {
      render(
        <ThemeProvider theme={theme}>
          <FloatButtonGroup>
            <FloatButton>Child</FloatButton>
          </FloatButtonGroup>
        </ThemeProvider>,
      );
      const group = screen.getByRole("group");
      if (theme === "elegant") {
        expect(group.className).toContain("r-float-button-group--elegant");
      } else {
        expect(group.className).not.toContain("r-float-button-group--elegant");
      }
    });
  }
});

/**
 * The theme family is owned by ThemeProvider, not by individual components:
 * every other component omits `theme` from its props and reads
 * useThemeFamily(). FloatButton and FloatButtonGroup accepted a public `theme`
 * that overrode the provider, so one button could render in a different family
 * from the surface around it. expectTypeOf is compile-time only: `vp check`
 * type-checks this file and fails if either props type regains `theme`.
 */
test("theme is not a public prop on FloatButton or FloatButtonGroup", () => {
  expectTypeOf<FloatButtonProps>().not.toHaveProperty("theme");
  expectTypeOf<FloatButtonGroupProps>().not.toHaveProperty("theme");
});
