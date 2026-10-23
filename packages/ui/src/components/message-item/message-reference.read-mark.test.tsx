// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { MessageReferenceReadMark, MessageReferenceText } from "./message-reference";

afterEach(cleanup);

test("the read mark is the online light with an ink check, last inside the mention", () => {
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
  const light = mark!.querySelector("[data-slot=status]");
  expect(light).not.toBeNull();
  expect(light!.getAttribute("data-presence")).toBe("online");
  expect(light!.getAttribute("aria-hidden")).toBe("true");
  const check = mark!.querySelector("svg.lucide-check");
  expect(check).not.toBeNull();
  expect(check!.getAttribute("aria-hidden")).toBe("true");
  expect(check!.getAttribute("stroke-width")).toBe("3");
  // The state is said in text, which a screen reader reads with the name.
  expect(mention.textContent).toBe("@AtlasRead");
  expect(screen.getByText("Read").className).toContain("sr-only");
  expect(mention.firstChild?.textContent).toBe("@Atlas");
  expect(mention.lastElementChild).toBe(mark);
});

test("the mark sits in the indicator's top-right slot, clear of the name, with an ink check", () => {
  render(<MessageReferenceReadMark data-testid="mark">Read</MessageReferenceReadMark>);
  const classes = screen.getByTestId("mark").className.split(/\s+/);
  expect(classes).toEqual(
    expect.arrayContaining([
      "absolute",
      "-right-2.5",
      "top-0",
      "size-2",
      "[&>svg]:size-[6.5px]!",
      "[&>svg]:text-sticker-ink",
    ]),
  );
  expect(classes).not.toContain("-right-1.5");
});

test("without children the mark adds no hidden text", () => {
  render(<MessageReferenceReadMark data-testid="mark" aria-label="Read" role="img" />);
  const mark = screen.getByRole("img", { name: "Read" });
  expect(mark.textContent).toBe("");
});
