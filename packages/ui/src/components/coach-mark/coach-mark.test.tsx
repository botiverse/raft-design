/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { Button } from "../button/button";
import { PopoverBody, PopoverClose, PopoverDescription, PopoverTitle } from "../popover/popover";
import {
  CoachMark,
  CoachMarkActions,
  CoachMarkContent,
  CoachMarkCount,
  CoachMarkNext,
} from "./coach-mark";

afterEach(cleanup);

function Tour({
  open = true,
  onDismiss,
  withField = false,
}: {
  open?: boolean;
  onDismiss?: () => void;
  withField?: boolean;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  return (
    <>
      <div data-testid="target" ref={setTarget}>
        Bell
      </div>
      {withField ? <textarea data-testid="field" autoFocus /> : null}
      {target ? (
        <CoachMark anchor={target} open={open} onDismiss={onDismiss}>
          <CoachMarkContent>
            <PopoverBody>
              <PopoverTitle>Notifications</PopoverTitle>
              <PopoverDescription>What needs you shows up here.</PopoverDescription>
            </PopoverBody>
            <CoachMarkActions>
              <CoachMarkCount>2 of 6</CoachMarkCount>
              <Button variant="ghost">Skip</Button>
              <CoachMarkNext>Next</CoachMarkNext>
            </CoachMarkActions>
          </CoachMarkContent>
        </CoachMark>
      ) : null}
    </>
  );
}

test("the target holds the located wash while its stop is open, and loses it after", async () => {
  const { rerender } = render(<Tour />);
  const target = screen.getByTestId("target");
  await waitFor(() => expect(target.getAttribute("data-located")).toBe("held"));
  rerender(<Tour open={false} />);
  expect(target.hasAttribute("data-located")).toBe(false);
});

test("the bubble is 300px, with the pink Next, the count and an arrow", async () => {
  render(<Tour />);
  const popup = await waitFor(() => {
    const el = document.querySelector('[data-slot="coach-mark-content"]');
    if (!el) throw new Error("no bubble");
    return el;
  });
  expect(popup.className).toContain("w-[300px]");
  expect(popup.className).toContain("overflow-visible");
  expect(popup.className).not.toContain("overflow-hidden");
  expect(popup.querySelector('[data-slot="popover-arrow"]')).not.toBeNull();
  expect(screen.getByText("2 of 6").className).toContain("font-mono");
  expect(screen.getByRole("button", { name: "Next" }).className).toContain("bg-attention-400");
});

test("focus goes to Next when the stop opens", async () => {
  render(<Tour />);
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next" })),
  );
});

test("focus stays in a field the person is typing in", async () => {
  render(<Tour withField />);
  const field = screen.getByTestId("field");
  field.focus();
  await screen.findByRole("button", { name: "Next" });
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  expect(document.activeElement).toBe(field);
});

test("Esc in the bubble dismisses the tour; Esc elsewhere and a press outside don't", async () => {
  const onDismiss = vi.fn();
  render(<Tour onDismiss={onDismiss} withField />);
  const next = await screen.findByRole("button", { name: "Next" });

  fireEvent.keyDown(screen.getByTestId("field"), { key: "Escape" });
  fireEvent.pointerDown(document.body);
  fireEvent.mouseDown(document.body);
  expect(onDismiss).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Next" })).toBe(next);

  fireEvent.keyDown(next, { key: "Escape" });
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

test("a stop opened with open, after rendering closed, focuses Next", async () => {
  const { rerender } = render(<Tour open={false} />);
  rerender(<Tour open />);
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next" })),
  );
});

test("Esc in a field outside the bubble goes on to the page", async () => {
  const onDismiss = vi.fn();
  const onPageKey = vi.fn((event: KeyboardEvent) => event.defaultPrevented);
  window.addEventListener("keydown", onPageKey);
  try {
    render(<Tour onDismiss={onDismiss} withField />);
    await screen.findByRole("button", { name: "Next" });
    fireEvent.keyDown(screen.getByTestId("field"), { key: "Escape" });
    expect(onPageKey).toHaveBeenCalledTimes(1);
    expect(onPageKey.mock.results[0]?.value).toBe(false);
    expect(onDismiss).not.toHaveBeenCalled();
  } finally {
    window.removeEventListener("keydown", onPageKey);
  }
});

test("a PopoverClose in the bubble dismisses the tour", async () => {
  const onDismiss = vi.fn();
  function WithClose() {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <>
        <div ref={ref}>Bell</div>
        <CoachMark anchor={ref} onDismiss={onDismiss}>
          <CoachMarkContent>
            <PopoverClose>Close</PopoverClose>
          </CoachMarkContent>
        </CoachMark>
      </>
    );
  }
  render(<WithClose />);
  fireEvent.click(await screen.findByRole("button", { name: "Close" }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

test("a ref anchor that moves to a new element moves the wash with it", async () => {
  function Keyed({ id }: { id: string }) {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <>
        <div key={id} ref={ref} data-testid={id}>
          Row
        </div>
        <CoachMark anchor={ref}>
          <CoachMarkContent>
            <CoachMarkNext>Next</CoachMarkNext>
          </CoachMarkContent>
        </CoachMark>
      </>
    );
  }
  const { rerender } = render(<Keyed id="a" />);
  await waitFor(() => expect(screen.getByTestId("a").getAttribute("data-located")).toBe("held"));
  rerender(<Keyed id="b" />);
  await waitFor(() => expect(screen.getByTestId("b").getAttribute("data-located")).toBe("held"));
});

test("in the Tab order the bubble comes right after its target", async () => {
  function Page() {
    const ref = useRef<HTMLButtonElement>(null);
    return (
      <>
        <button type="button">Before</button>
        <button type="button" ref={ref}>
          Bell
        </button>
        <button type="button">After</button>
        <CoachMark anchor={ref}>
          <CoachMarkContent>
            <CoachMarkActions>
              <Button variant="ghost">Skip</Button>
              <CoachMarkNext>Next</CoachMarkNext>
            </CoachMarkActions>
          </CoachMarkContent>
        </CoachMark>
      </>
    );
  }
  render(<Page />);
  const bell = screen.getByRole("button", { name: "Bell" });
  const after = screen.getByRole("button", { name: "After" });
  const skip = await screen.findByRole("button", { name: "Skip" });
  const next = screen.getByRole("button", { name: "Next" });

  next.focus();
  fireEvent.keyDown(next, { key: "Tab" });
  expect(document.activeElement).toBe(after);
  fireEvent.keyDown(after, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(next);
  skip.focus();
  fireEvent.keyDown(skip, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(bell);
  fireEvent.keyDown(bell, { key: "Tab" });
  expect(document.activeElement).toBe(skip);
});

test("a control that takes Tab itself keeps it while a stop is open", async () => {
  function Page() {
    const ref = useRef<HTMLInputElement>(null);
    return (
      <>
        <input
          ref={ref}
          aria-label="Message"
          onKeyDown={(event) => {
            if (event.key === "Tab") event.preventDefault();
          }}
        />
        <CoachMark anchor={ref}>
          <CoachMarkContent>
            <CoachMarkNext>Next</CoachMarkNext>
          </CoachMarkContent>
        </CoachMark>
      </>
    );
  }
  render(<Page />);
  const field = screen.getByRole("textbox", { name: "Message" });
  field.focus();
  await screen.findByRole("button", { name: "Next" });
  fireEvent.keyDown(field, { key: "Tab" });
  expect(document.activeElement).toBe(field);
});

test("moving on to the next stop focuses its Next, wherever focus was", async () => {
  function TwoStops() {
    const first = useRef<HTMLButtonElement>(null);
    const second = useRef<HTMLButtonElement>(null);
    const [stop, setStop] = useState(0);
    return (
      <>
        <button type="button" ref={first} onClick={() => setStop(1)}>
          Channel
        </button>
        <button type="button" ref={second}>
          Bell
        </button>
        <CoachMark anchor={stop === 0 ? first : second}>
          <CoachMarkContent>
            <CoachMarkNext>{stop === 0 ? "Next" : "Done"}</CoachMarkNext>
          </CoachMarkContent>
        </CoachMark>
      </>
    );
  }
  render(<TwoStops />);
  await screen.findByRole("button", { name: "Next" });
  const channel = screen.getByRole("button", { name: "Channel" });
  channel.focus();
  fireEvent.click(channel);
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Done" })),
  );
});

test("a ref anchor given a new element leaves focus where it was outside the bubble", async () => {
  function Keyed({ id }: { id: string }) {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <>
        <div key={id} ref={ref}>
          Row
        </div>
        <button type="button">Elsewhere</button>
        <CoachMark anchor={ref}>
          <CoachMarkContent>
            <CoachMarkNext>Next</CoachMarkNext>
          </CoachMarkContent>
        </CoachMark>
      </>
    );
  }
  const { rerender } = render(<Keyed id="a" />);
  const next = await screen.findByRole("button", { name: "Next" });
  await waitFor(() => expect(document.activeElement).toBe(next));
  const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
  elsewhere.focus();
  rerender(<Keyed id="b" />);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  expect(document.activeElement).toBe(elsewhere);
});
