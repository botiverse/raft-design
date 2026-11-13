// A ScrollAreaTextarea drawn as the field (`textareaScrollAreaVariants`; textarea.md, "A field
// that scrolls") beside a plain Textarea, in a real browser: the same outer box, border, radius,
// padding, type and states, and raft-ui's scrollbar once the text is taller than the field.
//
// Revert to fail: textarea.tsx, in `textareaScrollAreaVariants`: the wrapper's `min-h` (an empty
// field is then two lines high, not three), its `grid-rows-[minmax(0,1fr)]` (a capped field's
// textarea then runs out of the frame instead of scrolling), `fieldSurface` in `wrapper` (no
// border or radius), or the `has-*` classes (no focus ring, invalid or disabled look).
import "./textarea.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { cn } from "../../lib/cn";
import { ScrollAreaTextarea } from "../scroll-area/scroll-area-textarea";
import { Textarea, textareaScrollAreaVariants } from "./index";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const settle = async () => {
  for (let i = 0; i < 2; i += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
  }
};

const LONG = Array.from({ length: 30 }, (_, index) => `Line ${index + 1} of the draft.`).join("\n");

type FieldProps = {
  disabled?: boolean;
  invalid?: boolean;
  defaultValue?: string;
  /** The field's greatest height: on Textarea itself, on the scrolling field's frame. */
  cap?: string;
  /** A class of the textarea in both, such as `field-sizing-content`. */
  className?: string;
  rows?: number;
};

function Fields({ disabled, invalid, defaultValue, cap, className, rows }: FieldProps) {
  const { wrapper, textarea } = textareaScrollAreaVariants();
  return (
    // A plain block, not a grid: a grid would stretch the frame's row for it.
    <div className="w-80 p-4">
      <Textarea
        aria-label="Plain"
        className={cn(className, cap)}
        data-invalid={invalid || undefined}
        data-testid="plain"
        defaultValue={defaultValue}
        disabled={disabled}
        rows={rows}
      />
      <div className="h-6" />
      <ScrollAreaTextarea
        aria-invalid={invalid || undefined}
        aria-label="Scrolling"
        className={textarea({ className })}
        data-invalid={invalid || undefined}
        data-testid="scrolling"
        defaultValue={defaultValue}
        disabled={disabled}
        rows={rows}
        wrapperClassName={wrapper({ className: cap })}
      />
    </div>
  );
}

const BOX = [
  "borderTopWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopColor",
  "borderTopLeftRadius",
  "borderBottomRightRadius",
  "backgroundColor",
  "boxShadow",
] as const;
const TEXT = [
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "color",
  "cursor",
] as const;

const pick = (element: Element, names: readonly (keyof CSSStyleDeclaration)[]) => {
  const style = getComputedStyle(element);
  return Object.fromEntries(names.map((name) => [name, style[name]]));
};

/** The plain Textarea, and the scrolling field's frame and textarea. */
function fields() {
  const plain = screen.getByTestId<HTMLTextAreaElement>("plain");
  const textarea = screen.getByTestId<HTMLTextAreaElement>("scrolling");
  return { plain, textarea, frame: textarea.parentElement! };
}

function expectSameField() {
  const { plain, textarea, frame } = fields();
  const a = plain.getBoundingClientRect();
  const b = frame.getBoundingClientRect();
  expect({ width: b.width, height: b.height }).toEqual({ width: a.width, height: a.height });
  expect(pick(frame, BOX)).toEqual(pick(plain, BOX));
  expect(pick(textarea, TEXT)).toEqual(pick(plain, TEXT));
  // The text starts at the same place in both: the frame's border plus the textarea's padding.
  expect(textarea.getBoundingClientRect().left - b.left + textarea.clientLeft).toBe(
    plain.clientLeft,
  );
  // The textarea draws nothing of the frame itself.
  expect(getComputedStyle(textarea).borderTopWidth).toBe("0px");
  expect(getComputedStyle(textarea).backgroundColor).toBe("rgba(0, 0, 0, 0)");
}

it("an empty scrolling field has the box of an empty Textarea: three lines high", async () => {
  render(<Fields />);
  await settle();
  const { plain } = fields();
  // The 1.5px border is drawn at 1px on a 1x screen.
  expect(Number.parseFloat(getComputedStyle(plain).borderTopWidth)).toBeGreaterThanOrEqual(1);
  expect(plain.getBoundingClientRect().height).toBeGreaterThan(80);
  expectSameField();
});

it.each([
  ["invalid", { invalid: true }],
  ["disabled", { disabled: true }],
  ["disabled and invalid: disabled wins", { disabled: true, invalid: true }],
] as const)("the scrolling field looks like a Textarea when %s", async (_name, props) => {
  render(<Fields {...props} />);
  await settle();
  expectSameField();
  const { plain, textarea } = fields();
  expect(getComputedStyle(textarea).resize).toBe(getComputedStyle(plain).resize);
});

it("the invalid and the disabled frame differ from the frame at rest", async () => {
  const { rerender } = render(<Fields />);
  await settle();
  const rest = pick(fields().frame, BOX);
  rerender(<Fields invalid />);
  expect(pick(fields().frame, BOX).borderTopColor).not.toBe(rest.borderTopColor);
  rerender(<Fields disabled />);
  expect(pick(fields().frame, BOX).backgroundColor).not.toBe(rest.backgroundColor);
});

it("the focus ring is drawn on the frame, as on a focused Textarea", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<Fields />);
  await settle();
  const { plain, textarea, frame } = fields();
  const rest = getComputedStyle(frame).boxShadow;

  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(plain);
  await expect.poll(() => getComputedStyle(plain).boxShadow).not.toBe(rest);
  // Let the shadow's transition end before it is read.
  await new Promise((resolve) => setTimeout(resolve, 200));
  const ring = getComputedStyle(plain).boxShadow;

  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(textarea);
  await new Promise((resolve) => setTimeout(resolve, 200));
  expect(getComputedStyle(frame).boxShadow).toBe(ring);
  expect(getComputedStyle(textarea).boxShadow).toBe("none");
  expect(getComputedStyle(textarea).outlineStyle).toBe("none");
});

it("a capped field with a long draft scrolls under raft-ui's scrollbar, in the same box", async () => {
  render(<Fields cap="max-h-40" className="field-sizing-content" defaultValue={LONG} />);
  await settle();
  const { plain, textarea, frame } = fields();
  expectSameField();
  expect(frame.getBoundingClientRect().height).toBe(160);

  // The textarea ends inside the frame and scrolls there; it doesn't run out of it.
  expect(textarea.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    frame.getBoundingClientRect().bottom,
  );
  expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  // The platform's scrollbar is gone from the scrolling field, and takes no room.
  expect(getComputedStyle(textarea).scrollbarWidth).toBe("none");
  expect(getComputedStyle(plain).scrollbarWidth).not.toBe("none");
  // raft-ui's is drawn over the frame, beside the textarea, with a thumb.
  const gutter = frame.querySelector<HTMLElement>(
    ":scope > .r-scroll-area__gutters > .r-scroll-area__gutter--vertical",
  )!;
  expect(gutter).not.toBeNull();
  const thumb = gutter.querySelector<HTMLElement>(".r-scroll-area__thumb")!;
  expect(thumb.getBoundingClientRect().height).toBeGreaterThan(0);
  expect(thumb.getBoundingClientRect().height).toBeLessThan(gutter.getBoundingClientRect().height);
  const frameRect = frame.getBoundingClientRect();
  const gutterRect = gutter.getBoundingClientRect();
  expect(gutterRect.right).toBeLessThanOrEqual(frameRect.right);
  expect(gutterRect.left).toBeGreaterThan(frameRect.right - 20);
});

it("a field of fixed rows with a long draft scrolls in the same box as a Textarea's", async () => {
  render(<Fields defaultValue={LONG} rows={5} />);
  await settle();
  expectSameField();
  const { textarea, frame } = fields();
  expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  expect(frame.querySelector(".r-scroll-area__gutter--vertical")).not.toBeNull();
});

it("a short draft in a capped field draws no scrollbar", async () => {
  render(
    <Fields cap="max-h-40" className="field-sizing-content" defaultValue="Weekly launch update" />,
  );
  await settle();
  const { frame } = fields();
  expect(frame.querySelector(".r-scroll-area__gutter--vertical")).toBeNull();
  expectSameField();
});
