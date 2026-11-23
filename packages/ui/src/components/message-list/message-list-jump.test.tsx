/**
 * @vitest-environment jsdom
 *
 * The jump pills carry the classes of a Button at `outline md` (one recipe,
 * so they can't drift from it), the dismiss button joins the pill on one
 * shared edge, and the controls float on the edge they are given. A loading
 * pill behaves as a loading Button (focusable, aria-disabled, presses
 * ignored, the spinner named by loadingLabel) and keeps its colors, so the
 * edge it shares with the dismiss button doesn't turn grey on one side.
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button, buttonVariants } from "../button/button";
import {
  MessageListJumpControls,
  MessageListJumpPill,
  MessageListJumpPillDismiss,
  MessageListJumpPillGroup,
} from "./message-list-jump";

afterEach(cleanup);

const classes = (element: Element) => element.className.split(/\s+/).sort();

test("a pill has exactly the classes of a Button at outline md", () => {
  render(
    <>
      <Button variant="outline" size="md">
        Back to Bottom
      </Button>
      <MessageListJumpPill>Next Unread Thread</MessageListJumpPill>
    </>,
  );
  const button = screen.getByRole("button", { name: "Back to Bottom" });
  const pill = screen.getByRole("button", { name: "Next Unread Thread" });
  expect(classes(pill)).toEqual(classes(button));
  expect(pill.getAttribute("data-slot")).toBe("message-list-jump-pill");
  expect(pill.getAttribute("type")).toBe("button");
  expect(classes(pill.firstElementChild!)).toEqual(classes(button.firstElementChild!));
});

test("the dismiss button takes its name from the consumer and shares the pill's edge", () => {
  render(
    <MessageListJumpPillGroup>
      <MessageListJumpPill>Next Unread Thread</MessageListJumpPill>
      <MessageListJumpPillDismiss aria-label="Dismiss">
        <svg />
      </MessageListJumpPillDismiss>
    </MessageListJumpPillGroup>,
  );
  const dismiss = screen.getByRole("button", { name: "Dismiss" });
  const names = classes(dismiss);
  expect(names).toEqual(expect.arrayContaining(["border-s-0", "rounded-s-none", "size-8"]));
  expect(names).toEqual(expect.arrayContaining(["border-line-strong", "bg-layer-card"]));
  expect(names).toContain("[&_svg:not([class*='size-'])]:size-4");
  expect(names).not.toContain("[&_svg:not([class*='size-'])]:size-[18px]");
  const group = dismiss.parentElement!;
  expect(group.getAttribute("data-slot")).toBe("message-list-jump-pill-group");
  expect(group.className).toContain("*:data-[slot=message-list-jump-pill]:rounded-e-none");
});

test("the controls float at the bottom by default, above what floats there", () => {
  render(
    <>
      <MessageListJumpControls data-testid="bottom" />
      <MessageListJumpControls data-testid="top" side="top" />
    </>,
  );
  const bottom = screen.getByTestId("bottom");
  const top = screen.getByTestId("top");
  expect(bottom.getAttribute("data-side")).toBe("bottom");
  expect(bottom.className).toContain(
    "bottom-[calc(--spacing(3)+var(--message-list-bottom-inset,0px))]",
  );
  expect(top.getAttribute("data-side")).toBe("top");
  expect(top.className).toContain("top-3");
  expect(top.className).not.toContain("bottom-");
});

test("a loading pill stays focusable, aria-disabled and not natively disabled, and ignores presses", () => {
  const onClick = vi.fn();
  const Pill = ({ loading }: { loading: boolean }) => (
    <MessageListJumpPill loading={loading} loadingLabel="Opening thread" onClick={onClick}>
      Next Unread Thread
    </MessageListJumpPill>
  );
  const { rerender } = render(<Pill loading={false} />);
  const pill = screen.getByRole("button", { name: "Next Unread Thread" });
  act(() => pill.focus());
  rerender(<Pill loading />);

  expect(pill.getAttribute("data-loading")).toBe("true");
  expect(pill.getAttribute("aria-disabled")).toBe("true");
  expect(pill.hasAttribute("disabled")).toBe(false);
  expect(pill.tabIndex).toBe(0);
  expect(document.activeElement).toBe(pill);
  fireEvent.click(pill);
  expect(onClick).not.toHaveBeenCalled();
});

test("a loading pill shows the Button's spinner, named by loadingLabel, over its hidden label", () => {
  render(
    <MessageListJumpPill loading loadingLabel="Opening thread">
      Next Unread Thread
    </MessageListJumpPill>,
  );
  const pill = screen.getByRole("button", { name: /Opening thread/ });
  const { loadingIndicator } = buttonVariants({ variant: "outline", size: "md" });
  const indicator = pill.querySelector("[data-slot=message-list-jump-pill-loading-indicator]")!;
  expect(classes(indicator)).toEqual(loadingIndicator().split(/\s+/).sort());
  expect(indicator.querySelector("[data-slot=spinner]")?.getAttribute("aria-label")).toBe(
    "Opening thread",
  );
  const content = pill.querySelector("[data-slot=message-list-jump-pill-content]")!;
  expect(content.getAttribute("data-loading")).toBe("true");
  expect(content.className).toContain("data-[loading=true]:invisible");
});

test("a loading pill keeps its ink edge and card, not the disabled grey, beside its dismiss", () => {
  render(
    <MessageListJumpPillGroup>
      <MessageListJumpPill loading>Next Unread Thread</MessageListJumpPill>
      <MessageListJumpPillDismiss aria-label="Dismiss">
        <svg />
      </MessageListJumpPillDismiss>
    </MessageListJumpPillGroup>,
  );
  const pill = screen.getByRole("button", { name: /Loading/ });
  const names = classes(pill);
  expect(names).toEqual(
    expect.arrayContaining([
      "aria-disabled:border-line-strong",
      "aria-disabled:bg-layer-card",
      "aria-disabled:text-foreground",
    ]),
  );
  expect(names).not.toContain("aria-disabled:border-line-hairline");
  expect(names).not.toContain("aria-disabled:bg-fill-muted");
  expect(names).not.toContain("aria-disabled:text-foreground-disabled");
  expect(names).toContain("border-line-strong");
});

test("a disabled pill, loading or not, is natively disabled with the disabled look", () => {
  render(
    <>
      <MessageListJumpPill disabled>Idle</MessageListJumpPill>
      <MessageListJumpPill disabled loading loadingLabel="Busy">
        Busy
      </MessageListJumpPill>
    </>,
  );
  for (const pill of [
    screen.getByRole("button", { name: "Idle" }),
    screen.getByRole("button", { name: /Busy/ }),
  ]) {
    expect(pill.hasAttribute("disabled")).toBe(true);
    expect(classes(pill)).toContain("aria-disabled:border-line-hairline");
    expect(classes(pill)).not.toContain("aria-disabled:border-line-strong");
  }
});
