import "./focus-ring.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { Button } from "./components/button/button";
import { Composer, ComposerInput } from "./components/composer";
import { Input } from "./components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./components/input-group";
import { ListRow } from "./components/list-row";
import { Textarea } from "./components/textarea";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./components/dialog";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

/**
 * Focus rings show only after keyboard navigation
 * (design/foundations/states.md#focus). Real CDP clicks and key presses, so
 * the tracker ThemeProvider installs sees the same events a person makes.
 */

/** The ring is the 4px ink layer of `focus-ring`; nothing else here casts one. */
const RING = /0px 0px 0px 4px/;
const ringed = (el: Element) => RING.test(getComputedStyle(el).boxShadow);
/** The inset ring of a row that touches its container's edge (`keyboard:` variant). */
const insetRinged = (el: Element, pseudo: string | null = null) =>
  /0px 0px 0px 2px inset/.test(getComputedStyle(el, pseudo).boxShadow);

async function context() {
  const { userEvent } = await import("vite-plus/test/browser/context");
  return userEvent;
}

/** Waits out the 90ms box-shadow transition. */
const settle = () => new Promise((r) => setTimeout(r, 150));

function Fields({ mode = "light" }: { mode?: "light" | "dark" }) {
  return (
    <ThemeProvider mode={mode}>
      <div className="flex w-[480px] flex-col gap-4 p-4">
        <button type="button" data-testid="before">
          Before
        </button>
        <Input data-testid="input" aria-label="Name" />
        <Textarea data-testid="textarea" aria-label="Description" />
        <InputGroup data-testid="group">
          <InputGroupInput aria-label="Search" defaultValue="launch" />
          <InputGroupAddon align="inline-end">
            <button type="button" data-testid="clear" aria-label="Clear Search">
              x
            </button>
          </InputGroupAddon>
        </InputGroup>
        <Composer data-testid="composer">
          <ComposerInput data-testid="composer-input" aria-label="Message" />
        </Composer>
      </div>
    </ThemeProvider>
  );
}

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: a field clicked with the mouse shows no ring; Tab to it shows the ring`, async () => {
    const userEvent = await context();
    render(<Fields mode={mode} />);
    for (const id of ["input", "textarea"]) {
      const field = screen.getByTestId(id);
      await userEvent.click(field);
      await settle();
      expect(document.activeElement).toBe(field);
      expect(ringed(field), `${id} clicked`).toBe(false);
    }

    // Positive control: the same field rings when Tab reaches it.
    await userEvent.click(screen.getByTestId("before"));
    await userEvent.keyboard("{Tab}");
    await settle();
    expect(document.activeElement).toBe(screen.getByTestId("input"));
    expect(ringed(screen.getByTestId("input")), "input tabbed to").toBe(true);
    await userEvent.keyboard("{Tab}");
    await settle();
    expect(ringed(screen.getByTestId("textarea")), "textarea tabbed to").toBe(true);
  });
}

it("InputGroup: clicking the field or the clear button inside it shows no ring; Tab to the field does", async () => {
  const userEvent = await context();
  render(<Fields />);
  const group = screen.getByTestId("group");
  await userEvent.click(screen.getByRole("textbox", { name: "Search" }));
  await settle();
  expect(ringed(group), "field clicked").toBe(false);
  await userEvent.click(screen.getByTestId("clear"));
  await settle();
  expect(document.activeElement).toBe(screen.getByTestId("clear"));
  expect(ringed(group), "clear button clicked").toBe(false);

  await userEvent.click(screen.getByTestId("textarea"));
  await userEvent.keyboard("{Tab}");
  await settle();
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Search" }));
  expect(ringed(group), "field tabbed to").toBe(true);
});

it("Composer: typing after a click keeps it un-ringed; Tab into it rings it", async () => {
  const userEvent = await context();
  render(<Fields />);
  const composer = screen.getByTestId("composer");
  const input = screen.getByTestId("composer-input");
  await userEvent.click(input);
  await userEvent.keyboard("Ship it on Friday{Enter}{ArrowLeft}{ArrowUp}{Home} ok");
  await settle();
  expect(document.activeElement).toBe(input);
  expect(ringed(composer), "typing after a click").toBe(false);

  await userEvent.click(screen.getByTestId("before"));
  // before -> Input -> Textarea -> the group's field -> its clear button -> composer
  await userEvent.keyboard("{Tab}{Tab}{Tab}{Tab}{Tab}");
  await settle();
  expect(document.activeElement).toBe(input);
  expect(ringed(composer), "tabbed into").toBe(true);
  // Typing keeps the keyboard ring: it is still where the person is.
  await userEvent.keyboard("abc");
  await settle();
  expect(ringed(composer), "typing after Tab").toBe(true);
});

function Island({ children }: { children: ReactNode }) {
  return <div className="dark bg-layer-canvas p-4">{children}</div>;
}

it("a dark island inside a light page is gated too", async () => {
  const userEvent = await context();
  render(
    <ThemeProvider mode="light">
      <button type="button" data-testid="before">
        Before
      </button>
      <Island>
        <Input data-testid="island-input" aria-label="Name" />
      </Island>
    </ThemeProvider>,
  );
  const field = screen.getByTestId("island-input");
  await userEvent.click(field);
  await settle();
  expect(ringed(field), "clicked").toBe(false);
  await userEvent.click(screen.getByTestId("before"));
  await userEvent.keyboard("{Tab}");
  await settle();
  expect(ringed(field), "tabbed to").toBe(true);
});

it("without the tracker (no ThemeProvider, no script) a focused field keeps its ring", async () => {
  const userEvent = await context();
  render(<Input data-testid="bare" aria-label="Name" />);
  expect(document.documentElement.hasAttribute("data-input-modality")).toBe(false);
  await userEvent.click(screen.getByTestId("bare"));
  await settle();
  expect(ringed(screen.getByTestId("bare"))).toBe(true);
});

it("without the tracker, clicking a button inside a group still does not ring the group", async () => {
  // Isolates the selector: the group rings for focus-visible inside it, not
  // for any focus inside it (focus-within), whatever the modality.
  const userEvent = await context();
  render(
    <InputGroup data-testid="bare-group">
      <InputGroupInput aria-label="Search" defaultValue="launch" />
      <InputGroupAddon align="inline-end">
        <button type="button" data-testid="bare-clear" aria-label="Clear Search">
          x
        </button>
      </InputGroupAddon>
    </InputGroup>,
  );
  await userEvent.click(screen.getByTestId("bare-clear"));
  await settle();
  expect(document.activeElement).toBe(screen.getByTestId("bare-clear"));
  expect(ringed(screen.getByTestId("bare-group"))).toBe(false);
  // Positive control: the field inside still rings the group.
  await userEvent.click(screen.getByRole("textbox", { name: "Search" }));
  await settle();
  expect(ringed(screen.getByTestId("bare-group"))).toBe(true);
});

it("focus moved by code after a click shows no ring, token or inset; after Tab it does", async () => {
  const userEvent = await context();
  render(
    <ThemeProvider>
      <Input data-testid="input" aria-label="Name" />
      <Button data-testid="button">Create Task</Button>
      <ListRow data-testid="row">Launch week</ListRow>
    </ThemeProvider>,
  );
  const button = screen.getByTestId("button");
  const row = screen.getByTestId("row");
  // Typing is a key press, so Chromium treats the focus code moves next as
  // focus-visible; the person still last navigated with the pointer.
  await userEvent.click(screen.getByTestId("input"));
  await userEvent.keyboard("Bugen");
  button.focus();
  await settle();
  expect(button.matches(":focus-visible")).toBe(true);
  expect(ringed(button), "button focused by code").toBe(false);
  await userEvent.click(screen.getByTestId("input"));
  await userEvent.keyboard("Wug");
  row.focus();
  await settle();
  expect(row.matches(":focus-visible")).toBe(true);
  // A list cell draws its ring on its inset shape (lib/list-cell.ts).
  expect(insetRinged(row, "::before"), "row focused by code").toBe(false);

  await userEvent.click(screen.getByTestId("input"));
  await userEvent.keyboard("{Tab}");
  await settle();
  expect(ringed(button), "button tabbed to").toBe(true);
  await userEvent.keyboard("{Tab}");
  await settle();
  expect(insetRinged(row, "::before"), "row tabbed to").toBe(true);
});

it("Esc in a field inside a dialog opened with the mouse returns focus to the trigger with a ring", async () => {
  // Kirby's case: the key edits in a text field but sends focus elsewhere, so
  // the person is on the keyboard and must see where focus landed.
  const userEvent = await context();
  render(
    <ThemeProvider>
      <Dialog>
        <DialogTrigger render={<Button data-testid="trigger">Rename</Button>} />
        <DialogContent>
          <DialogTitle>Rename</DialogTitle>
          <Input data-testid="dialog-field" aria-label="New name" />
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  const trigger = screen.getByTestId("trigger");
  await userEvent.click(trigger);
  const field = await screen.findByTestId("dialog-field");
  await userEvent.click(field);
  await userEvent.keyboard("abc");
  await settle();
  expect(ringed(field), "typing after a click").toBe(false);
  await userEvent.keyboard("{Escape}");
  await settle();
  await settle();
  expect(document.activeElement).toBe(trigger);
  expect(ringed(trigger), "focus returned by Esc").toBe(true);
});
