import "./dialog.test.css";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useCallback, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "../select/select";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import type { DialogProps } from "./dialog";

type Details = Parameters<NonNullable<DialogProps["onOpenChange"]>>[1];

// Esc closes the topmost thing that is open, and only that (dialog.md#behavior).
// A Base UI popup opened from the dialog, a Menu or a Select, closes alone: it
// handles Esc first and stops it. A widget of the app's own that closes on Esc,
// such as an @-mention list in a text box, has to stop the event too. Base UI
// closes the dialog on Esc without looking at `defaultPrevented`
// (floating-ui-react/hooks/useDismiss: closeOnEscapeKeyDown, on the popup's
// onKeyDown and on the document), so preventDefault alone doesn't keep it open.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function context() {
  return import("vite-plus/test/browser/context");
}

const frames = async (count = 3) => {
  for (let index = 0; index < count; index += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

function Rename({
  children,
  onOpenChange,
}: {
  children?: ReactNode;
  onOpenChange?: (open: boolean, details: Details) => void;
}) {
  const [open, setOpen] = useState(true);
  const handleOpenChange = useCallback(
    (next: boolean, details: Details) => {
      onOpenChange?.(next, details);
      if (!details.isCanceled) setOpen(next);
    },
    [onOpenChange],
  );
  return (
    <ThemeProvider>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename channel</DialogTitle>
          </DialogHeader>
          <DialogBody>{children}</DialogBody>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

// An @-mention list of the app's own: Esc closes the list, not the dialog.
function Mentions({ stop }: { stop: "propagation" | "default" }) {
  const [listOpen, setListOpen] = useState(true);
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Escape" || !listOpen) return;
    setListOpen(false);
    event.preventDefault();
    if (stop === "propagation") event.stopPropagation();
  };
  return (
    <>
      <textarea aria-label="Message" defaultValue="@ga" onKeyDown={onKeyDown} />
      {listOpen ? (
        <ul aria-label="Suggestions">
          <li>galileo</li>
        </ul>
      ) : null}
    </>
  );
}

// What a dialog can do when it can't change the widget: an Esc the widget has
// already prevented doesn't close it.
function keepOpenOnPreventedEscape(next: boolean, details: Details) {
  if (!next && details.reason === "escape-key" && details.event.defaultPrevented) {
    details.cancel();
  }
}

const dialogOpen = () => screen.queryByRole("dialog") !== null;

it("Esc in the dialog body closes the dialog", async () => {
  const { userEvent } = await context();
  render(
    <Rename>
      <input aria-label="Name" />
    </Rename>,
  );
  await screen.findByRole("dialog");
  screen.getByRole("textbox", { name: "Name" }).focus();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(dialogOpen()).toBe(false));
});

it("Esc in an open menu closes the menu and leaves the dialog open", async () => {
  const { userEvent } = await context();
  const changes = vi.fn();
  render(
    <Rename onOpenChange={changes}>
      <DropdownMenu>
        <DropdownMenuTrigger>Options</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Rename>,
  );
  await screen.findByRole("dialog");
  await userEvent.click(screen.getByRole("button", { name: "Options" }));
  await screen.findByRole("menu");
  await waitFor(() => expect(screen.getByRole("menu").contains(document.activeElement)).toBe(true));
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  await frames();
  expect(dialogOpen()).toBe(true);
  expect(changes).not.toHaveBeenCalled();
  // The next Esc is the dialog's.
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(dialogOpen()).toBe(false));
});

it("Esc in an open select closes the select and leaves the dialog open", async () => {
  const { userEvent } = await context();
  const changes = vi.fn();
  render(
    <Rename onOpenChange={changes}>
      <Select defaultValue="Public">
        <SelectTrigger aria-label="Visibility">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectList>
            {["Public", "Private"].map((value) => (
              <SelectItem key={value} value={value}>
                <SelectItemText>{value}</SelectItemText>
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </Rename>,
  );
  await screen.findByRole("dialog");
  await userEvent.click(screen.getByRole("combobox", { name: "Visibility" }));
  await screen.findByRole("listbox");
  await waitFor(() =>
    expect(screen.getByRole("listbox").contains(document.activeElement)).toBe(true),
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  await frames();
  expect(dialogOpen()).toBe(true);
  expect(changes).not.toHaveBeenCalled();
});

it("a widget that handles Esc and stops it keeps the dialog open", async () => {
  const { userEvent } = await context();
  const changes = vi.fn();
  render(
    <Rename onOpenChange={changes}>
      <Mentions stop="propagation" />
    </Rename>,
  );
  await screen.findByRole("dialog");
  screen.getByRole("textbox", { name: "Message" }).focus();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("list", { name: "Suggestions" })).toBeNull());
  await frames();
  expect(dialogOpen()).toBe(true);
  expect(changes).not.toHaveBeenCalled();
  // With the list closed, the next Esc is the dialog's.
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(dialogOpen()).toBe(false));
});

it("preventDefault alone doesn't keep the dialog open", async () => {
  const { userEvent } = await context();
  const changes = vi.fn();
  render(
    <Rename onOpenChange={changes}>
      <Mentions stop="default" />
    </Rename>,
  );
  await screen.findByRole("dialog");
  screen.getByRole("textbox", { name: "Message" }).focus();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(dialogOpen()).toBe(false));
  expect(changes).toHaveBeenCalledOnce();
  const [, details] = changes.mock.calls[0] as [boolean, Details];
  expect(details.reason).toBe("escape-key");
  expect((details.event as Event).defaultPrevented).toBe(true);
});

it("a dialog can keep itself open on an Esc a child has already prevented", async () => {
  const { userEvent } = await context();
  render(
    <Rename onOpenChange={keepOpenOnPreventedEscape}>
      <Mentions stop="default" />
    </Rename>,
  );
  await screen.findByRole("dialog");
  screen.getByRole("textbox", { name: "Message" }).focus();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("list", { name: "Suggestions" })).toBeNull());
  await frames();
  expect(dialogOpen()).toBe(true);
});
