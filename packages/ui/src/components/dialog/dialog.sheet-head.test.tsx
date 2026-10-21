/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { Dialog, DialogClose, DialogHeader, DialogSheetBack, DialogTitle } from "./dialog";
import { DialogSheetContent } from "./dialog-sheet";

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
