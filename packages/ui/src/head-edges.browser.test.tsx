import "./head-edges.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { Button } from "./components/button/button";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/alert-dialog/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/dialog/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "./components/drawer/drawer";
import {
  NotificationCenterHeader,
  NotificationCenterTitle,
} from "./components/notification-center/notification-center";
import {
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxTitle,
  LightboxToolbar,
} from "./components/lightbox/lightbox";
import { PanelAction } from "./components/panel/panel-action";
import { PanelToggleAction } from "./components/panel/panel-toggle-action";
import {
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelSectionHeader,
  PanelTitle,
} from "./components/panel/panel-header";
import { SidebarHeader, SidebarHeaderTitle } from "./components/sidebar/sidebar";
import {
  ThreadPanelActions,
  ThreadPanelHeader,
  ThreadPanelTitle,
} from "./components/thread-panel/thread-panel";

// The icon buttons at the two ends of a header put their icon box, not the
// button, on the column's content margin: 16px on a phone, 20px from 768px,
// whatever the button's size (32px with an 18px icon with a mouse, 44px with a
// 22px icon on a phone and a touch screen). The empty hit area hangs outward
// and the two ends mirror (design/foundations/alignment.md#the-ends-of-a-header).
// Measured in a real browser with touch emulated through CDP; jsdom has no
// media queries or layout.

const it = test.skipIf(typeof window === "undefined");

// Turning touch emulation off again leaves Chromium reporting `pointer: none`,
// not `fine`, so every mouse screen runs first, before the first finger.
const SCREENS = [
  { name: "desktop 1280x800", width: 1280, height: 800, pointer: "fine", size: 32, icon: 18 },
  { name: "desktop 1440x900", width: 1440, height: 900, pointer: "fine", size: 32, icon: 18 },
  { name: "short desktop 1280x560", width: 1280, height: 560, pointer: "fine", size: 32, icon: 18 },
  {
    name: "touch tablet 768x1024",
    width: 768,
    height: 1024,
    pointer: "coarse",
    size: 44,
    icon: 22,
  },
  {
    name: "touch tablet 1024x1366",
    width: 1024,
    height: 1366,
    pointer: "coarse",
    size: 44,
    icon: 22,
  },
  { name: "phone 320x568", width: 320, height: 568, pointer: "coarse", size: 44, icon: 22 },
  { name: "phone 390x844", width: 390, height: 844, pointer: "coarse", size: 44, icon: 22 },
  { name: "phone 430x932", width: 430, height: 932, pointer: "coarse", size: 44, icon: 22 },
] as const;

type Screen = (typeof SCREENS)[number];

let touching = false;

async function setScreen(s: Screen) {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(s.width, s.height);
  if (s.pointer === "coarse" && !touching) {
    touching = true;
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "pointer", value: "coarse" }],
    });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
  expect(matchMedia(`(pointer: ${s.pointer})`).matches).toBe(true);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  if (touching) {
    await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  }
  await page.viewport(414, 896);
});

const Icon = ({ id }: { id: string }) => <svg data-testid={id} viewBox="0 0 24 24" />;

/** A phone column is 16px; from 768px (the desktop layout) 20px. */
const panelMargin = (s: Screen) => (s.width < 768 ? 16 : 20);

type Head = {
  name: string;
  margin: (s: Screen) => number;
  /** The size of the edge buttons, when they follow the control height. */
  control: boolean;
  ui: () => ReactNode;
};

const HEADS: Head[] = [
  {
    name: "panel header",
    margin: panelMargin,
    control: true,
    ui: () => (
      <PanelHeader data-testid="head">
        <PanelAction aria-label="Back" data-testid="start">
          <Icon id="start-icon" />
        </PanelAction>
        <PanelHeaderContent>
          <PanelTitle>proj-frontend</PanelTitle>
        </PanelHeaderContent>
        <PanelActions>
          <PanelAction aria-label="Search">
            <Icon id="mid-icon" />
          </PanelAction>
          <PanelToggleAction aria-label="Details" data-testid="end">
            <Icon id="end-icon" />
          </PanelToggleAction>
        </PanelActions>
      </PanelHeader>
    ),
  },
  {
    // As in the product: Back only below 1024px, Close only from 1024px, so
    // the visible last action is not always the last child.
    name: "thread panel header",
    margin: panelMargin,
    control: true,
    ui: () => (
      <ThreadPanelHeader data-testid="head">
        <PanelAction className="lg:hidden" aria-label="Back" data-testid="start">
          <Icon id="start-icon" />
        </PanelAction>
        <ThreadPanelTitle>Thread</ThreadPanelTitle>
        <ThreadPanelActions>
          <PanelAction aria-label="More thread actions" data-testid="end-before">
            <Icon id="end-before-icon" />
          </PanelAction>
          <PanelAction className="max-lg:hidden" aria-label="Close" data-testid="end">
            <Icon id="end-icon" />
          </PanelAction>
        </ThreadPanelActions>
      </ThreadPanelHeader>
    ),
  },
  {
    name: "phone top bar (section header)",
    margin: panelMargin,
    control: true,
    ui: () => (
      <PanelSectionHeader data-testid="head">
        <PanelAction aria-label="Back" data-testid="start">
          <Icon id="start-icon" />
        </PanelAction>
        <PanelHeaderContent>
          <PanelTitle>Settings</PanelTitle>
        </PanelHeaderContent>
        <PanelActions>
          <PanelAction aria-label="More" data-testid="end">
            <Icon id="end-icon" />
          </PanelAction>
        </PanelActions>
      </PanelSectionHeader>
    ),
  },
  {
    name: "sidebar header",
    margin: panelMargin,
    control: true,
    ui: () => (
      <SidebarHeader data-testid="head">
        <div className="min-w-0 flex-1">
          <SidebarHeaderTitle>Chat</SidebarHeaderTitle>
        </div>
        <Button variant="ghost" size="icon-lg" aria-label="Notifications" data-testid="end">
          <Icon id="end-icon" />
        </Button>
      </SidebarHeader>
    ),
  },
  {
    name: "drawer header",
    margin: panelMargin,
    control: true,
    ui: () => (
      <Drawer open swipeDirection="right">
        <DrawerContent>
          <DrawerHeader data-testid="head">
            <PanelAction aria-label="Back" data-testid="start">
              <Icon id="start-icon" />
            </PanelAction>
            <DrawerTitle>Member details</DrawerTitle>
            <DrawerClose data-testid="end">
              <Icon id="end-icon" />
            </DrawerClose>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    ),
  },
  {
    name: "dialog header",
    margin: () => 20,
    control: false,
    ui: () => (
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="head">
            <DialogTitle>Edit channel</DialogTitle>
            <DialogClose data-testid="end">
              <Icon id="end-icon" />
            </DialogClose>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    name: "alert dialog header",
    margin: () => 20,
    control: false,
    ui: () => (
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader data-testid="head">
            <AlertDialogTitle>Delete channel?</AlertDialogTitle>
            <AlertDialogClose data-testid="end">
              <Icon id="end-icon" />
            </AlertDialogClose>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  {
    // Raft Chat closes a file with a frameless PanelAction at the toolbar's end.
    name: "lightbox toolbar",
    margin: () => 16,
    control: true,
    ui: () => (
      <Lightbox open modal={false}>
        <LightboxContent>
          <LightboxToolbar data-testid="head">
            <LightboxTitle>diagram-export.html</LightboxTitle>
            <LightboxActions>
              <PanelAction aria-label="Download">
                <Icon id="mid-icon" />
              </PanelAction>
              <LightboxClose render={<PanelAction aria-label="Close" data-testid="end" />}>
                <Icon id="end-icon" />
              </LightboxClose>
            </LightboxActions>
          </LightboxToolbar>
        </LightboxContent>
      </Lightbox>
    ),
  },
  {
    name: "notification center header",
    margin: () => 16,
    control: false,
    ui: () => (
      <div className="w-[360px]">
        <NotificationCenterHeader data-testid="head">
          <NotificationCenterTitle>Notifications</NotificationCenterTitle>
          <Button
            className="ml-auto"
            variant="ghost"
            size="icon-md"
            aria-label="Mark all read"
            data-testid="end"
          >
            <Icon id="end-icon" />
          </Button>
        </NotificationCenterHeader>
      </div>
    ),
  },
];

const visible = (el: Element | null): el is Element =>
  el != null && el.getBoundingClientRect().width > 0;

/** The visible icon among those ids, if any. */
function shown(...ids: string[]) {
  return ids.map((id) => screen.queryByTestId(id)).find(visible) ?? null;
}

for (const s of SCREENS) {
  for (const head of HEADS) {
    it(`${s.name}: the ${head.name}'s edge icon boxes sit on the margin and mirror`, async () => {
      await setScreen(s);
      render(<ThemeProvider mode="light">{head.ui()}</ThemeProvider>);
      const box = screen.getByTestId("head").getBoundingClientRect();
      const margin = head.margin(s);
      const start = shown("start-icon");
      const end = shown("end-icon", "end-before-icon");
      expect(end, "the last icon shows").not.toBeNull();
      const endIcon = end!.getBoundingClientRect();
      const endInset = box.right - endIcon.right;
      expect(endInset).toBeCloseTo(margin, 1);
      if (head.control) expect(endIcon.width).toBe(s.icon);
      if (start) {
        const startIcon = start.getBoundingClientRect();
        const startInset = startIcon.left - box.left;
        expect(startInset).toBeCloseTo(margin, 1);
        expect(startInset).toBeCloseTo(endInset, 1);
      }
      // The hit area hangs outward but never past the head's edge.
      for (const id of ["start", "end", "end-before"]) {
        const button = screen.queryByTestId(id);
        if (!visible(button)) continue;
        const rect = button.getBoundingClientRect();
        if (head.control) expect(rect.width).toBe(s.size);
        expect(rect.left).toBeGreaterThanOrEqual(box.left);
        expect(rect.right).toBeLessThanOrEqual(box.right);
      }
    });
  }
}
