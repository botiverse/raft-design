/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
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

  test("renders only the size, shape, variant and content modifiers", () => {
    render(
      <FloatButton shape="square" size="lg" variant="primary">
        Square
      </FloatButton>,
    );
    expect(screen.getByRole("button").className).toBe(
      "r-float-button r-float-button--lg r-float-button--square r-float-button--primary r-float-button--with-text",
    );
  });
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

  test("renders only the direction, attached and shape modifiers", () => {
    render(
      <FloatButtonGroup attached>
        <FloatButton>Child</FloatButton>
      </FloatButtonGroup>,
    );
    expect(screen.getByRole("group").className).toBe(
      "r-float-button-group r-float-button-group--vertical r-float-button-group--attached r-float-button-group--circle",
    );
  });
});
