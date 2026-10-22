/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { MessageItemContinuationTime, MessageItemGutter } from "./message-item-gutter";
import {
  MessageItemHeader,
  MessageItemSender,
  MessageItemSenderButton,
  MessageItemTime,
} from "./message-item-header";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import { MessageItem } from "./message-item-root";

/**
 * A message is announced as an article named by its sender and its time
 * (design/foundations/states.md#located), so a screen reader landing on a
 * row a keyboard jump focused hears whose message it is and when.
 */

afterEach(cleanup);

/** The words `aria-labelledby` points at, in its order; fails on an id that isn't there. */
function labelledByText(el: Element) {
  const ids = el.getAttribute("aria-labelledby")?.split(/\s+/) ?? [];
  return ids
    .map((id) => {
      const target = document.getElementById(id);
      expect(target, `#${id} is in the document`).not.toBeNull();
      return target?.textContent;
    })
    .join(" ");
}

function FullRow(props: { sender?: "text" | "button" } = {}) {
  return (
    <MessageItem data-testid="row">
      <MessageItemContent>
        <MessageItemHeader>
          {props.sender === "button" ? (
            <MessageItemSenderButton>Atlas</MessageItemSenderButton>
          ) : (
            <MessageItemSender>Atlas</MessageItemSender>
          )}
          <MessageItemTime dateTime="2026-10-22T14:20:00Z">2:20 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Please add the owner to the release review thread.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

test("a message is an article named by its sender, then its time", () => {
  render(<FullRow />);
  const row = screen.getByTestId("row");
  expect(row.getAttribute("role")).toBe("article");
  expect(labelledByText(row)).toBe("Atlas 2:20 PM");
  expect(screen.getByRole("article", { name: "Atlas 2:20 PM" })).toBe(row);
});

test("a sender that is a button names the row the same way", () => {
  render(<FullRow sender="button" />);
  expect(labelledByText(screen.getByTestId("row"))).toBe("Atlas 2:20 PM");
  expect(screen.getByRole("article", { name: "Atlas 2:20 PM" })).toBeTruthy();
});

test("a continuation row, with no sender, is named by its time and points at no missing id", () => {
  render(
    <MessageItem compact data-testid="row">
      <MessageItemGutter>
        <MessageItemContinuationTime dateTime="2026-10-22T14:21:00Z">
          2:21
        </MessageItemContinuationTime>
      </MessageItemGutter>
      <MessageItemContent>
        <MessageItemBody>And the changelog.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>,
  );
  expect(labelledByText(screen.getByTestId("row"))).toBe("2:21");
});

test("a row with nothing to name it by is a plain div, not an unnamed article", () => {
  // Such as slock's receipt for a message an assistant sent: a compact row
  // with a gutter and a card, and no sender or time part.
  render(
    <>
      <MessageItem compact data-testid="row">
        <MessageItemGutter />
        <MessageItemContent>
          <MessageItemBody>Body only.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem data-testid="labelled" aria-label="Sent for Martin">
        <MessageItemContent>
          <MessageItemBody>Body only.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </>,
  );
  const row = screen.getByTestId("row");
  expect(row.hasAttribute("role")).toBe(false);
  expect(row.hasAttribute("aria-labelledby")).toBe(false);
  expect(screen.queryAllByRole("article")).toEqual([screen.getByTestId("labelled")]);
});

test("the row becomes an article when a part that names it mounts, and stops when it goes", () => {
  const Row = ({ time }: { time: boolean }) => (
    <MessageItem compact data-testid="row">
      <MessageItemGutter>
        {time ? <MessageItemContinuationTime>2:21</MessageItemContinuationTime> : null}
      </MessageItemGutter>
      <MessageItemContent>
        <MessageItemBody>Text</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
  const { rerender } = render(<Row time={false} />);
  expect(screen.getByTestId("row").hasAttribute("role")).toBe(false);
  rerender(<Row time />);
  expect(screen.getByRole("article", { name: "2:21" })).toBe(screen.getByTestId("row"));
  rerender(<Row time={false} />);
  expect(screen.getByTestId("row").hasAttribute("role")).toBe(false);
});

test("overrides on the render element count like props on MessageItem", () => {
  render(
    <>
      <MessageItem data-testid="label" render={<div aria-label="Message from Atlas" />}>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:20 PM</MessageItemTime>
          </MessageItemHeader>
        </MessageItemContent>
      </MessageItem>
      <MessageItem data-testid="role" render={<div role="listitem" />}>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Mia</MessageItemSender>
          </MessageItemHeader>
        </MessageItemContent>
      </MessageItem>
      <MessageItem data-testid="none" render={<div role="presentation" />}>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Mia</MessageItemSender>
          </MessageItemHeader>
        </MessageItemContent>
      </MessageItem>
    </>,
  );
  const label = screen.getByTestId("label");
  expect(label.hasAttribute("aria-labelledby")).toBe(false);
  expect(screen.getByRole("article", { name: "Message from Atlas" })).toBe(label);
  const role = screen.getByTestId("role");
  expect(role.getAttribute("role")).toBe("listitem");
  expect(labelledByText(role)).toBe("Mia");
  const none = screen.getByTestId("none");
  expect(none.getAttribute("role")).toBe("presentation");
  expect(none.hasAttribute("aria-labelledby")).toBe(false);
});

test("a role or name the consumer adds later is left to React, and removing it hands back", () => {
  const Row = ({ label }: { label?: string }) => (
    <MessageItem data-testid="row" role={label ? "region" : undefined} aria-label={label}>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemTime>2:20 PM</MessageItemTime>
        </MessageItemHeader>
      </MessageItemContent>
    </MessageItem>
  );
  const { rerender } = render(<Row />);
  rerender(<Row label="Pinned message" />);
  const row = screen.getByTestId("row");
  expect(row.getAttribute("role")).toBe("region");
  expect(row.hasAttribute("aria-labelledby")).toBe(false);
  rerender(<Row />);
  expect(row.getAttribute("role")).toBe("article");
  expect(labelledByText(row)).toBe("Atlas 2:20 PM");
});

test("the name follows the header: removing it leaves the time, adding it back names both", () => {
  const Row = ({ header }: { header: boolean }) => (
    <MessageItem data-testid="row">
      {header ? null : (
        <MessageItemGutter>
          <MessageItemContinuationTime>2:21</MessageItemContinuationTime>
        </MessageItemGutter>
      )}
      <MessageItemContent>
        {header ? (
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:20 PM</MessageItemTime>
          </MessageItemHeader>
        ) : null}
        <MessageItemBody>Text</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
  const { rerender } = render(<Row header />);
  expect(labelledByText(screen.getByTestId("row"))).toBe("Atlas 2:20 PM");
  rerender(<Row header={false} />);
  expect(labelledByText(screen.getByTestId("row"))).toBe("2:21");
  rerender(<Row header />);
  expect(labelledByText(screen.getByTestId("row"))).toBe("Atlas 2:20 PM");
});

test("a consumer's own id on a part is the one the row points at", () => {
  render(
    <MessageItem data-testid="row">
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender id="sender-42">Atlas</MessageItemSender>
          <MessageItemTime id="time-42">2:20 PM</MessageItemTime>
        </MessageItemHeader>
      </MessageItemContent>
    </MessageItem>,
  );
  expect(screen.getByTestId("row").getAttribute("aria-labelledby")).toBe("sender-42 time-42");
});

test("the consumer overrides: aria-labelledby as given, aria-label alone, and the role", () => {
  render(
    <>
      <span id="custom-name">Atlas, 2:20 PM, edited</span>
      <MessageItem data-testid="labelledby" aria-labelledby="custom-name">
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:20 PM</MessageItemTime>
          </MessageItemHeader>
        </MessageItemContent>
      </MessageItem>
      <MessageItem data-testid="label" aria-label="Message from Atlas">
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:20 PM</MessageItemTime>
          </MessageItemHeader>
        </MessageItemContent>
      </MessageItem>
      <MessageItem data-testid="none" role="none">
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
          </MessageItemHeader>
        </MessageItemContent>
      </MessageItem>
    </>,
  );
  expect(screen.getByTestId("labelledby").getAttribute("aria-labelledby")).toBe("custom-name");
  expect(screen.getByRole("article", { name: "Atlas, 2:20 PM, edited" })).toBe(
    screen.getByTestId("labelledby"),
  );
  // aria-labelledby would win over the label, so the row writes none.
  expect(screen.getByTestId("label").hasAttribute("aria-labelledby")).toBe(false);
  expect(screen.getByRole("article", { name: "Message from Atlas" })).toBe(
    screen.getByTestId("label"),
  );
  expect(screen.getByTestId("none").getAttribute("role")).toBe("none");
  expect(screen.getByTestId("none").hasAttribute("aria-labelledby")).toBe(false);
});

test("a message inside a message names only its own row", () => {
  render(
    <MessageItem data-testid="outer">
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemTime>2:20 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItem data-testid="inner">
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Mia</MessageItemSender>
              <MessageItemTime>Jul 15, 2:12 PM</MessageItemTime>
            </MessageItemHeader>
          </MessageItemContent>
        </MessageItem>
      </MessageItemContent>
    </MessageItem>,
  );
  expect(labelledByText(screen.getByTestId("outer"))).toBe("Atlas 2:20 PM");
  expect(labelledByText(screen.getByTestId("inner"))).toBe("Mia Jul 15, 2:12 PM");
});

test("outside a MessageItem the parts render no id", () => {
  render(
    <MessageItemHeader>
      <MessageItemSender data-testid="sender">Atlas</MessageItemSender>
      <MessageItemTime data-testid="time">2:20 PM</MessageItemTime>
    </MessageItemHeader>,
  );
  expect(screen.getByTestId("sender").hasAttribute("id")).toBe(false);
  expect(screen.getByTestId("time").hasAttribute("id")).toBe(false);
});
