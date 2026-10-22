/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { Dialog, DialogClose, DialogHeader, DialogSheetBack, DialogTitle } from "./dialog";
import { DialogCommit, DialogSheetContent } from "./dialog-sheet";

// The sheet's head moves its × (or Back) to the start by finding it among
// DialogHeader's direct children. One wrapped in a Tooltip, a Fragment or an
// app component isn't found and would stay after the title, so in
// development the head says so.

function setPhone(phone: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: phone && query.includes("max-width: 767px"),
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function Wrapped({ children }: { children: ReactNode }) {
  return <span>{children}</span>;
}

function renderHead(head: ReactNode) {
  render(
    <Dialog open>
      <DialogSheetContent>{head}</DialogSheetContent>
    </Dialog>,
  );
}

const warning = expect.stringContaining("no DialogClose (or DialogSheetBack) as a direct child");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("warns when the sheet's × is wrapped", () => {
  setPhone(true);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  renderHead(
    <DialogHeader>
      <DialogTitle>Create Channel</DialogTitle>
      <Wrapped>
        <DialogClose />
      </Wrapped>
    </DialogHeader>,
  );
  expect(warn).toHaveBeenCalledWith(warning);
});

test("doesn't warn when × or Back is a direct child", () => {
  setPhone(true);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  renderHead(
    <DialogHeader>
      <DialogTitle>Create Channel</DialogTitle>
      <DialogClose />
    </DialogHeader>,
  );
  cleanup();
  renderHead(
    <DialogHeader>
      <DialogSheetBack />
      <DialogTitle>Create Channel</DialogTitle>
    </DialogHeader>,
  );
  expect(warn).not.toHaveBeenCalledWith(warning);
});

test("doesn't warn outside a sheet", () => {
  setPhone(false);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  renderHead(
    <DialogHeader>
      <DialogTitle>Create Channel</DialogTitle>
      <Wrapped>
        <DialogClose />
      </Wrapped>
    </DialogHeader>,
  );
  expect(warn).not.toHaveBeenCalledWith(warning);
});

// DialogCommit is drawn in the head, outside its form, and only the form's id
// ties the two: without it Enter in a field submits nothing, on a phone only.
const noIdWarning = expect.stringContaining("the form has no id");

function renderCommit(form: ReactNode) {
  renderHead(
    <>
      <DialogHeader>
        <DialogTitle>Create Channel</DialogTitle>
        <DialogClose />
      </DialogHeader>
      {form}
    </>,
  );
}

test("warns when a sheet's submit DialogCommit is in a form without an id", () => {
  setPhone(true);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  renderCommit(
    <form>
      <input name="name" />
      <DialogCommit type="submit">Create</DialogCommit>
    </form>,
  );
  expect(warn).toHaveBeenCalledWith(noIdWarning);
});

test("doesn't warn for a form with an id, a `form` prop, a plain button or outside a sheet", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  setPhone(true);
  renderCommit(
    <form id="create-channel">
      <input name="name" />
      <DialogCommit type="submit">Create</DialogCommit>
    </form>,
  );
  cleanup();
  renderCommit(
    <>
      <form id="create-channel-2" />
      <DialogCommit type="submit" form="create-channel-2">
        Create
      </DialogCommit>
    </>,
  );
  cleanup();
  renderCommit(
    <form>
      <DialogCommit>Next</DialogCommit>
    </form>,
  );
  cleanup();
  setPhone(false);
  renderCommit(
    <form>
      <DialogCommit type="submit">Create</DialogCommit>
    </form>,
  );
  expect(warn).not.toHaveBeenCalled();
});
