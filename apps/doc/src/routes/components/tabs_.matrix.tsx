import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bell, Files, MessageSquare, Users } from "lucide-react";
import {
  Tabs,
  TabsBackground,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  ThemeProvider,
  type Theme,
} from "@raft/ui";

export const Route = createFileRoute("/components/tabs_/matrix")({
  staticData: { standalone: true },
  component: TabsMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

type MatrixCase = {
  label: string;
  render: () => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "default background",
    render: () => <DemoTabs background />,
  },
  {
    label: "default",
    render: () => <DemoTabs />,
  },
  {
    label: "underline background",
    render: () => <DemoTabs background variant="underline" />,
  },
  {
    label: "underline",
    render: () => <DemoTabs variant="underline" />,
  },
  {
    label: "icon default",
    render: () => <DemoTabs background iconOnly />,
  },
  {
    label: "icon underline",
    render: () => <DemoTabs iconOnly variant="underline" />,
  },
  {
    label: "disabled default",
    render: () => <DemoTabs background disabled />,
  },
  {
    label: "disabled underline",
    render: () => <DemoTabs disabled variant="underline" />,
  },
];

function TabsMatrixPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(12rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] lg:grid-cols-2 2xl:grid-cols-4">
        {THEMES.flatMap((theme) =>
          CASES.map((item) => (
            <MatrixCell
              key={`${theme}-${item.label}`}
              theme={theme}
              label={`${theme} / ${item.label}`}
            >
              {item.render()}
            </MatrixCell>
          )),
        )}
      </div>
    </main>
  );
}

function MatrixCell({
  theme,
  label,
  children,
}: {
  theme: Theme;
  label: string;
  children: ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <div
        data-theme={theme}
        className="relative flex min-w-0 items-center justify-center bg-background p-6 text-foreground"
      >
        <span className="absolute top-4 left-4 font-mono text-[10px] leading-none font-medium tracking-wide text-foreground-placeholder uppercase">
          {label}
        </span>
        <div className="flex w-full max-w-md items-center justify-center">{children}</div>
      </div>
    </ThemeProvider>
  );
}

function DemoTabs({
  background = false,
  disabled = false,
  iconOnly = false,
  variant = "default",
}: {
  background?: boolean;
  disabled?: boolean;
  iconOnly?: boolean;
  variant?: "default" | "underline";
}) {
  return (
    <Tabs defaultValue="chat" className="flex justify-center overflow-visible">
      <TabsList variant={variant}>
        {background ? <TabsBackground /> : null}
        <TabsTab value="chat" aria-label={iconOnly ? "Chat" : undefined}>
          <MessageSquare />
          {iconOnly ? null : <TabsLabel>Chat</TabsLabel>}
        </TabsTab>
        <TabsTab value="files" aria-label={iconOnly ? "Files" : undefined}>
          <Files />
          {iconOnly ? null : <TabsLabel>Files</TabsLabel>}
        </TabsTab>
        <TabsTab value="members" aria-label={iconOnly ? "Members" : undefined} disabled={disabled}>
          <Users />
          {iconOnly ? null : <TabsLabel>Members</TabsLabel>}
        </TabsTab>
        <TabsTab value="alerts" aria-label={iconOnly ? "Alerts" : undefined}>
          <Bell />
          {iconOnly ? null : <TabsLabel>Alerts</TabsLabel>}
        </TabsTab>
      </TabsList>
      <TabsPanel value="chat" className="sr-only">
        Chat
      </TabsPanel>
      <TabsPanel value="files" className="sr-only">
        Files
      </TabsPanel>
      <TabsPanel value="members" className="sr-only">
        Members
      </TabsPanel>
      <TabsPanel value="alerts" className="sr-only">
        Alerts
      </TabsPanel>
    </Tabs>
  );
}
