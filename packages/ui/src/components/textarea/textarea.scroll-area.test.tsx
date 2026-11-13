/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ScrollAreaTextarea } from "../scroll-area/scroll-area-textarea";
import { Textarea, textareaScrollAreaVariants } from "./index";

afterEach(cleanup);

// The field's classes are shared with `textareaScrollAreaVariants` now; Textarea's own, and their
// order, are what they were before the split.
test("Textarea's classes are unchanged by sharing them with the scrolling field", () => {
  render(<Textarea data-testid="textarea" />);
  expect(screen.getByTestId("textarea").className).toBe(
    [
      "block w-full min-h-[calc(var(--field-line-height)*3+--spacing(6))] resize-y pl-3 pr-(--ta-pr,0.75rem)",
      "scroll-pb-(--ta-scroll-pb,0)",
      "font-heading text-field font-field outline-none",
      "py-2.5",
      "rounded-(--control-radius) border-[1.5px] border-line-field bg-layer-card",
      "text-foreground placeholder:text-foreground-hint",
      "shadow-none transition-shadow duration-90 ease-out focus-visible:shadow-focus",
      "data-invalid:border-danger-strong",
      "disabled:cursor-not-allowed disabled:resize-none disabled:border-line-hairline disabled:bg-fill-muted disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
    ].join(" "),
  );
});

test("the scrolling field splits Textarea's look over ScrollAreaTextarea's frame and textarea", () => {
  const { wrapper, textarea } = textareaScrollAreaVariants();
  render(
    <ScrollAreaTextarea
      data-testid="textarea"
      wrapperClassName={wrapper()}
      className={textarea({ className: "max-h-40" })}
    />,
  );
  const field = screen.getByTestId("textarea");
  const frame = field.parentElement!;
  expect(frame.dataset.slot).toBe("scroll-area-textarea");

  // The frame draws the field: its border, radius and background, and the states of the textarea in it.
  for (const name of [
    "rounded-(--control-radius)",
    "border-[1.5px]",
    "border-line-field",
    "bg-layer-card",
    "has-focus-visible:shadow-focus",
    "has-data-invalid:border-danger-strong",
    "has-disabled:border-line-hairline",
    "has-disabled:bg-fill-muted",
  ]) {
    expect(frame.classList, name).toContain(name);
  }
  // The textarea keeps the field's type and padding, and draws no frame of its own.
  for (const name of [
    "text-field",
    "font-field",
    "font-heading",
    "pl-3",
    "py-2.5",
    "border-0",
    "bg-transparent",
    "outline-none",
    "placeholder:text-foreground-hint",
    "disabled:text-foreground-disabled",
    "max-h-40",
  ]) {
    expect(field.classList, name).toContain(name);
  }
  for (const name of ["border-line-field", "bg-layer-card", "focus-visible:shadow-focus"]) {
    expect(field.classList, name).not.toContain(name);
  }
});
