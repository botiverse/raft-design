import "./dialog.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/index";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

// The footer stacks only when its buttons don't fit on one line
// (dialog.md#the-footer), and it counts only what is laid out in the row
// (responsive.md, "Measure only what is laid out in the row"). An open menu
// puts Base UI focus guards beside its trigger and a Select always adds a
// hidden input, each fixed at the window's corner: counted, they stretched the
// row to the window's left edge and stacked it at any width. Real layout only.

const it = test.skipIf(typeof window === "undefined");

const frames = async (count = 3) => {
  for (let i = 0; i < count; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
  await frames(1);
}

afterEach(cleanup);

function renderFooter(middle: ReactNode) {
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
          </DialogHeader>
          <DialogFooter data-testid="footer">
            <DialogClose render={<Button variant="ghost" size="lg" />}>Cancel</DialogClose>
            {middle}
            <Button variant="primary" size="lg">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  return screen.getByTestId("footer");
}

/** The footer's controls share one line. */
function expectOneRow(...controls: HTMLElement[]) {
  const [first, ...rest] = controls.map((control) => control.getBoundingClientRect().top);
  for (const top of rest) expect(top).toBeCloseTo(first!, 0);
}

const button = (name: string) => screen.getByRole("button", { name });

it("a menu opened from the footer leaves its row as it was", async () => {
  await viewport(1280);
  const footer = renderFooter(
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="lg" />}>
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>As PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await screen.findByRole("dialog");
  await frames();
  // Found before the menu opens, which may hide the rest from the a11y tree.
  const controls = [button("Cancel"), button("Export"), button("Save")];
  expect(footer.hasAttribute("data-stacked")).toBe(false);
  expectOneRow(...controls);

  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(controls[1]!);
  await screen.findByRole("menu");
  // The menu's focus guards sit in the footer's row, fixed at the window's corner.
  await waitFor(() => expect(footer.querySelector("[data-base-ui-focus-guard]")).not.toBeNull());
  await frames();
  expect(footer.hasAttribute("data-stacked")).toBe(false);
  expectOneRow(...controls);
});

it("a Select in the footer keeps the row while it fits", async () => {
  await viewport(1280);
  const footer = renderFooter(
    <Select defaultValue="Team">
      <SelectTrigger aria-label="Visibility" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectList>
          {["Team", "Anyone"].map((value) => (
            <SelectItem key={value} value={value}>
              <SelectItemText>{value}</SelectItemText>
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>,
  );
  await screen.findByRole("dialog");
  // The Select's hidden input sits in the footer's row, nothing open.
  expect(footer.querySelector("input[aria-hidden]")).not.toBeNull();
  await frames();
  expect(footer.hasAttribute("data-stacked")).toBe(false);
  expectOneRow(
    button("Cancel"),
    screen.getByRole("combobox", { name: "Visibility" }),
    button("Save"),
  );
});
