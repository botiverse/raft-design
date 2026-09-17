/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { Dialog, DialogContent } from "./components/dialog/dialog";
import { AlertDialog, AlertDialogContent } from "./components/alert-dialog/alert-dialog";
import { Drawer, DrawerContent } from "./components/drawer/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./components/popover/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "./components/tooltip/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./components/select/select";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe("z-index token integration in overlay components", () => {
  it("DialogContent and DialogOverlay apply z-modal and layer=1 elevation", () => {
    render(
      <ThemeProvider theme="brutal">
        <Dialog open modal={false}>
          <DialogContent layer={0} data-testid="dialog-0">
            Content 0
          </DialogContent>
        </Dialog>
        <Dialog open modal={false}>
          <DialogContent layer={1} data-testid="dialog-1">
            Content 1
          </DialogContent>
        </Dialog>
      </ThemeProvider>,
    );

    const d0 = screen.getByTestId("dialog-0");
    const d1 = screen.getByTestId("dialog-1");

    expect(d0.className).toContain("z-modal");
    expect(d1.className).toContain("z-[calc(var(--r-z-modal)+100)]");
  });

  it("AlertDialogContent applies z-modal", () => {
    render(
      <ThemeProvider theme="elegant">
        <AlertDialog open modal={false}>
          <AlertDialogContent data-testid="alert-dialog">Alert</AlertDialogContent>
        </AlertDialog>
      </ThemeProvider>,
    );

    const alert = screen.getByTestId("alert-dialog");
    expect(alert.className).toContain("z-modal");
  });

  it("DrawerContent applies z-modal", () => {
    render(
      <ThemeProvider theme="elegant">
        <Drawer open modal={false}>
          <DrawerContent data-testid="drawer">Drawer</DrawerContent>
        </Drawer>
      </ThemeProvider>,
    );

    const drawer = screen.getByTestId("drawer");
    expect(drawer.className).toContain("z-modal");
  });

  it("PopoverContent applies z-dropdown to positioner", () => {
    render(
      <ThemeProvider theme="elegant">
        <Popover open>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent data-testid="popover">Popover Content</PopoverContent>
        </Popover>
      </ThemeProvider>,
    );

    const popover = screen.getByTestId("popover");
    const positioner = popover.parentElement;
    expect(positioner?.className).toContain("z-dropdown");
  });

  it("TooltipContent applies z-tooltip to positioner", () => {
    render(
      <ThemeProvider theme="elegant">
        <Tooltip open>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent data-testid="tooltip">Tooltip Content</TooltipContent>
        </Tooltip>
      </ThemeProvider>,
    );

    const tooltip = screen.getByTestId("tooltip");
    const positioner = tooltip.parentElement;
    expect(positioner?.className).toContain("z-tooltip");
  });

  it("nested Select within DialogContent elevates above dialog layer via ZIndexScope", () => {
    function DialogSelectDemo() {
      return (
        <Dialog open modal={false}>
          <DialogContent data-testid="dialog-container">
            Dialog
            <Select open defaultValue="apple">
              <SelectTrigger data-testid="select-trigger">Pick</SelectTrigger>
              <SelectContent data-testid="select-content">
                <SelectItem value="apple">Apple</SelectItem>
              </SelectContent>
            </Select>
          </DialogContent>
        </Dialog>
      );
    }

    render(
      <ThemeProvider theme="elegant">
        <DialogSelectDemo />
      </ThemeProvider>,
    );

    const dialogContent = screen.getByTestId("dialog-container");
    const selectContent = screen.getByTestId("select-content");
    const selectPositioner = selectContent.parentElement;

    expect(dialogContent.style.zIndex).toBe("var(--r-z-modal)");
    expect(selectPositioner?.style.zIndex).toBe("calc(var(--r-z-modal) + 100)");
  });
});
