// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { MessageReferenceReadMark, MessageReferenceText } from "./message-reference";

afterEach(cleanup);

test("the read mark is a decorative check after the mention's text, not a status light", () => {
  render(
    <p>
      Ask{" "}
      <MessageReferenceText data-testid="mention">
        @Atlas
        <MessageReferenceReadMark>Read</MessageReferenceReadMark>
      </MessageReferenceText>
    </p>,
  );
  const mention = screen.getByTestId("mention");
  const mark = mention.querySelector("[data-slot=message-reference-read-mark]");

  expect(mark).not.toBeNull();
  const check = mark!.querySelector("svg.lucide-check");
  expect(check).not.toBeNull();
  expect(check!.getAttribute("aria-hidden")).toBe("true");
  // The state is said in text, which a screen reader reads with the name.
  expect(mention.textContent).toBe("@AtlasRead");
  expect(screen.getByText("Read").className).toContain("sr-only");
  // After the label, in the line: the text node comes first, the mark last.
  expect(mention.firstChild?.textContent).toBe("@Atlas");
  expect(mention.lastElementChild).toBe(mark);
  expect(mention.querySelector("[data-slot=status]")).toBeNull();
  expect(mention.querySelector("[data-slot=message-reference-indicator]")).toBeNull();
});

test("the mark is muted, centred on the letters and not raised like a superscript", () => {
  render(<MessageReferenceReadMark data-testid="mark">Read</MessageReferenceReadMark>);
  const classes = screen.getByTestId("mark").className.split(/\s+/);
  expect(classes).toEqual(
    expect.arrayContaining([
      "text-foreground-hint",
      "self-center",
      "align-[calc(0.7em/2-0.857em/2)]",
      "[&>svg]:size-[0.857em]",
    ]),
  );
  for (const raised of ["absolute", "align-super", "-right-1.5", "top-0"]) {
    expect(classes).not.toContain(raised);
  }
});

test("without children the mark adds no hidden text", () => {
  render(<MessageReferenceReadMark data-testid="mark" aria-label="Read" role="img" />);
  const mark = screen.getByRole("img", { name: "Read" });
  expect(mark.textContent).toBe("");
});
