/**
 * A press into an `<iframe>` is a press outside (popover.md#closing). The
 * press reaches the frame's document, never the page's, so Base UI never sees
 * it; the frame element takes focus and the page's window blurs, and the
 * popover closes on that, as an outside press. A frame inside the popover is
 * the popover's own, and a CoachMark stays open on a press outside. Only a
 * browser moves focus into a frame and blurs the window.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/popover`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { PortalContainerProvider } from "../../lib/portal-container";
import { CoachMark, CoachMarkActions, CoachMarkContent, CoachMarkNext } from "../coach-mark";
import { Popover, PopoverBody, PopoverContent, PopoverTrigger } from "./popover";
import type { PopoverProps } from "./popover";

const it = test.skipIf(typeof window === "undefined");

const frames: HTMLIFrameElement[] = [];

type Change = { open: boolean; reason: string; event: Event };

/** Every open change the popovers under test report. */
const changes: Change[] = [];
const recordChange: NonNullable<PopoverProps["onOpenChange"]> = (open, details) => {
  changes.push({ open, reason: details.reason, event: details.event });
};

afterEach(() => {
  cleanup();
  changes.length = 0;
  for (const frame of frames.splice(0)) frame.remove();
  (document.activeElement as HTMLElement | null)?.blur();
  window.focus();
});

const settle = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 40))),
  );

function frameIn(doc: Document, testId: string): HTMLIFrameElement {
  const frame = doc.createElement("iframe");
  frame.dataset.testid = testId;
  frame.style.cssText = "width:200px;height:100px;border:0";
  doc.body.append(frame);
  frames.push(frame);
  return frame;
}

function Subject({ children, ...props }: PopoverProps & { children?: ReactNode }) {
  return (
    <Popover defaultOpen {...props}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <PopoverBody>Popover body{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

it("closes when focus moves into an iframe on the page, as an outside press", async () => {
  render(<Subject onOpenChange={recordChange} />);
  await screen.findByText("Popover body");
  await settle();
  const frame = frameIn(document, "page-frame");
  frame.focus();
  await waitFor(() => expect(screen.queryByText("Popover body")).toBeNull());
  expect(changes).toHaveLength(1);
  expect(changes[0]).toMatchObject({ open: false, reason: "outside-press" });
  expect(changes[0]!.event.type).toBe("blur");
});

it("stays open when focus moves into an iframe inside the popover", async () => {
  let inner: HTMLIFrameElement | null = null;
  render(
    <Subject>
      <iframe
        title="Embed"
        ref={(node) => {
          inner = node;
        }}
        style={{ width: 120, height: 60, border: 0 }}
      />
    </Subject>,
  );
  await screen.findByText("Popover body");
  await settle();
  inner!.focus();
  await settle();
  expect(document.activeElement).toBe(inner);
  expect(screen.queryByText("Popover body")).not.toBeNull();
});

it("stays open when the window blurs with no frame focused (switching apps)", async () => {
  render(<Subject />);
  await screen.findByText("Popover body");
  await settle();
  window.dispatchEvent(new FocusEvent("blur"));
  await settle();
  expect(screen.queryByText("Popover body")).not.toBeNull();
});

it("leaves a CoachMark open when focus moves into an iframe", async () => {
  function Stop() {
    const ref = useRef<HTMLButtonElement>(null);
    return (
      <div style={{ padding: 80 }}>
        <button type="button" ref={ref}>
          Bell
        </button>
        <CoachMark anchor={ref}>
          <CoachMarkContent>
            <PopoverBody>Coach body</PopoverBody>
            <CoachMarkActions>
              <CoachMarkNext>Next</CoachMarkNext>
            </CoachMarkActions>
          </CoachMarkContent>
        </CoachMark>
      </div>
    );
  }
  render(<Stop />);
  await screen.findByText("Coach body");
  await settle();
  const frame = frameIn(document, "page-frame");
  frame.focus();
  await settle();
  expect(document.activeElement).toBe(frame);
  expect(screen.queryByText("Coach body")).not.toBeNull();
});

// An object window: the popover portalled into another document (here an
// about:blank iframe's), whose elements are of that window's realm. The blur
// is that window's, and its frame is not an instance of this window's
// HTMLIFrameElement.
it("closes in another window's document when focus moves into a frame there", async () => {
  const host = frameIn(document, "object-window");
  host.style.cssText = "position:fixed;top:0;left:0;width:800px;height:600px;border:0";
  const doc = host.contentDocument!;
  doc.open();
  doc.write("<!doctype html><html><head></head><body></body></html>");
  doc.close();
  render(
    createPortal(
      <PortalContainerProvider container={doc.body}>
        <Subject onOpenChange={recordChange} />
      </PortalContainerProvider>,
      doc.body,
    ),
  );
  await waitFor(() => expect(doc.querySelector("[data-slot=popover-content]")).not.toBeNull());
  await settle();
  const frame = frameIn(doc, "frame-in-object-window");
  expect(frame instanceof HTMLIFrameElement).toBe(false);
  frame.focus();
  await waitFor(() => expect(doc.querySelector("[data-slot=popover-content]")).toBeNull());
  expect(changes.map((change) => change.reason)).toEqual(["outside-press"]);
});
