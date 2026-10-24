// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { MessageReferenceReadMark, MessageReferenceText } from "./message-reference";
import { messageReference } from "./message-reference.recipe";

afterEach(cleanup);

test("the read mark is a bare check, no light, last inside the mention", () => {
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
  expect(mark!.querySelector("[data-slot=status]") === null, "no status light").toBe(true);
  const check = mark!.querySelector("svg.lucide-check");
  expect(check).not.toBeNull();
  expect(check!.getAttribute("aria-hidden")).toBe("true");
  expect(check!.getAttribute("stroke-width")).toBe("2.5");
  // The state is said in text, which a screen reader reads with the name.
  expect(mention.textContent).toBe("@AtlasRead");
  expect(screen.getByText("Read").className).toContain("sr-only");
  expect(mention.firstChild?.textContent).toBe("@Atlas");
  expect(mention.lastElementChild).toBe(mark);
});

test("the mark is a 10px lime check, 2px after the name, and the mention reserves 12px", () => {
  render(<MessageReferenceReadMark data-testid="mark">Read</MessageReferenceReadMark>);
  const classes = screen.getByTestId("mark").className.split(/\s+/);
  expect(classes).toEqual(
    expect.arrayContaining([
      "absolute",
      "-right-3",
      "top-0",
      "size-2.5",
      "[&>svg]:size-2.5!",
      "[&>svg]:text-read-mark",
    ]),
  );
  expect(classes).not.toContain("[&>svg]:text-sticker-ink");
  const root = messageReference().root().split(/\s+/);
  expect(root).toContain("has-[>[data-slot=message-reference-read-mark]]:mr-3");
  expect(root).toContain("has-[>[data-slot=message-reference-indicator]]:mr-2.5");
});

test("without children the mark adds no hidden text", () => {
  render(<MessageReferenceReadMark data-testid="mark" aria-label="Read" role="img" />);
  const mark = screen.getByRole("img", { name: "Read" });
  expect(mark.textContent).toBe("");
});
