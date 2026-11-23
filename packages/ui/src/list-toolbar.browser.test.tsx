import "./head-edges.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { Button } from "./components/button/button";
import { ActivityInboxControls } from "./components/activity-inbox/activity-inbox-toolbar";
import { ConversationPanelTabs } from "./components/conversation-panel/conversation-panel";
import { Tabs, TabsList, TabsTab } from "./components/tabs/tabs";
import {
  TasksPanelRoot,
  TasksPanelToolbar,
  TasksPanelToolbarFilters,
} from "./components/tasks/tasks-panel";

const it = test.skipIf(typeof window === "undefined");

// The toolbar over a list reads `list-toolbar` (design/foundations/tokens.md#component-tokens):
// 8px above and below its 32px controls, 49px with its seam on a phone; on a
// desktop the 44px header. A narrow window with a mouse takes the phone's.
const SCREENS = [
  { name: "phone 390", width: 390, toolbar: 49, activity: 48 },
  { name: "desktop 1280", width: 1280, toolbar: 44, activity: 44 },
] as const;

async function setWidth(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

afterEach(cleanup);
afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

function show(ui: ReactNode) {
  return render(
    <ThemeProvider mode="light">
      <div style={{ width: "100%" }}>{ui}</div>
    </ThemeProvider>,
  );
}

function height(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`no ${selector}`);
  return el.getBoundingClientRect().height;
}

for (const screen of SCREENS) {
  it(`${screen.name}: the tasks toolbar is ${screen.toolbar}px with its seam`, async () => {
    await setWidth(screen.width);
    show(
      <TasksPanelRoot>
        <TasksPanelToolbar>
          <TasksPanelToolbarFilters>
            <Button size="md">Filter</Button>
          </TasksPanelToolbarFilters>
        </TasksPanelToolbar>
      </TasksPanelRoot>,
    );
    expect(height("[data-slot=tasks-panel-toolbar]")).toBe(screen.toolbar);
  });

  it(`${screen.name}: a conversation's tab row is ${screen.toolbar}px with its seam`, async () => {
    await setWidth(screen.width);
    show(
      <ConversationPanelTabs render={<Tabs defaultValue="chat" />}>
        <TabsList>
          <TabsTab value="chat">Chat</TabsTab>
          <TabsTab value="tasks">Tasks</TabsTab>
        </TabsList>
      </ConversationPanelTabs>,
    );
    expect(height("[data-slot=conversation-panel-tabs]")).toBe(screen.toolbar);
  });

  // Activity's controls draw no seam of their own: the 49px toolbar less it
  // on a phone, the 44px header row on a desktop.
  it(`${screen.name}: Activity's controls are ${screen.activity}px`, async () => {
    await setWidth(screen.width);
    show(
      <ActivityInboxControls>
        <Button size="md">Unread</Button>
      </ActivityInboxControls>,
    );
    expect(height("[data-slot=activity-inbox-controls]")).toBe(screen.activity);
  });
}
