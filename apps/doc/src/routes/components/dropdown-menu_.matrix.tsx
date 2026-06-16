import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode, RefObject } from "react";
import { useId, useRef } from "react";
import {
  IconCircleCheckFill18,
  IconCircleInfoFill18,
  IconCircleWarningFill18,
} from "nucleo-ui-fill-18";
import {
  IconBellOutline18,
  IconChevronRightOutline18,
  IconCreditCardOutline18,
  IconMoonStarsOutline18,
  IconPersonDoorOutline18,
  IconTrashOutline18,
  IconUserOutline18,
} from "nucleo-ui-outline-18";
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger,
  ThemeProvider,
  type Theme,
} from "@slock/ui";

export const Route = createFileRoute("/components/dropdown-menu_/matrix")({
  staticData: { standalone: true },
  component: DropdownMenuMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

type MatrixCase = {
  label: string;
  render: () => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "profile",
    render: () => (
      <MatrixMenu label="Profile">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem>
          <IconUserOutline18 />
          <span className="min-w-0 flex-1 truncate">Profile</span>
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconBellOutline18 />
          <span className="min-w-0 flex-1 truncate">Notifications</span>
          <DropdownMenuItemCount>3</DropdownMenuItemCount>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconCreditCardOutline18 />
          <span className="min-w-0 flex-1 truncate">Billing</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconPersonDoorOutline18 />
          <span className="min-w-0 flex-1 truncate">Sign out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </MatrixMenu>
    ),
  },
  {
    label: "selected",
    render: () => (
      <MatrixMenu label="Server">
        <DropdownMenuItem data-selected>
          <IconCircleCheckFill18 />
          <span className="min-w-0 flex-1 truncate">Slock</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="min-w-0 flex-1 truncate">Design Guild</span>
          <DropdownMenuItemCount>4</DropdownMenuItemCount>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="min-w-0 flex-1 truncate">Open Source</span>
          <DropdownMenuItemCount>12</DropdownMenuItemCount>
        </DropdownMenuItem>
      </MatrixMenu>
    ),
  },
  {
    label: "disabled",
    render: () => (
      <MatrixMenu label="Actions">
        <DropdownMenuItem>
          <IconCircleInfoFill18 />
          <span className="min-w-0 flex-1 truncate">View details</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <IconCircleWarningFill18 />
          <span className="min-w-0 flex-1 truncate">Archived project</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconTrashOutline18 />
          <span className="min-w-0 flex-1 truncate">Delete project</span>
        </DropdownMenuItem>
      </MatrixMenu>
    ),
  },
  {
    label: "checkbox",
    render: () => (
      <MatrixMenu label="Filters">
        <DropdownMenuCheckboxItem defaultChecked>Include archived</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>Sync starred</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem disabled>Private channels</DropdownMenuCheckboxItem>
      </MatrixMenu>
    ),
  },
  {
    label: "radio",
    render: () => (
      <MatrixMenu label="Theme">
        <DropdownMenuRadioGroup defaultValue="system">
          <DropdownMenuRadioItem value="system">System theme</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">Light theme</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark theme</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </MatrixMenu>
    ),
  },
  {
    label: "submenu",
    render: () => (
      <MatrixMenu label="More">
        <DropdownMenuItem>
          <IconUserOutline18 />
          <span className="min-w-0 flex-1 truncate">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSubmenu>
          <DropdownMenuSubmenuTrigger>
            <IconMoonStarsOutline18 />
            <span className="min-w-0 flex-1 truncate">Theme</span>
            <IconChevronRightOutline18 className="ml-auto" />
          </DropdownMenuSubmenuTrigger>
          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={10}
            className="flex w-36 flex-col"
          >
            <DropdownMenuItem>System</DropdownMenuItem>
            <DropdownMenuItem>Light</DropdownMenuItem>
            <DropdownMenuItem>Dark</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuSubmenu>
      </MatrixMenu>
    ),
  },
  {
    label: "switch",
    render: () => (
      <MatrixMenu label="Settings">
        <DropdownMenuItem>
          <span className="min-w-0 flex-1 truncate">Desktop notifications</span>
          <span className="ml-auto inline-flex h-4 w-7 items-center justify-end rounded-full bg-foreground-strong p-0.5">
            <span className="size-3 rounded-full bg-layer-popover shadow-sm" />
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="min-w-0 flex-1 truncate">Marketing updates</span>
          <span className="ml-auto inline-flex h-4 w-7 items-center rounded-full bg-foreground/[0.12] p-0.5">
            <span className="size-3 rounded-full bg-layer-popover shadow-sm" />
          </span>
        </DropdownMenuItem>
      </MatrixMenu>
    ),
  },
  {
    label: "long content",
    render: () => (
      <MatrixMenu label="Overflow">
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuItem>
          <IconUserOutline18 />
          <span className="min-w-0 flex-1 truncate">Very long workspace member display name</span>
          <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconBellOutline18 />
          <span className="min-w-0 flex-1 truncate">Notification preferences and digest</span>
        </DropdownMenuItem>
      </MatrixMenu>
    ),
  },
];

function DropdownMenuMatrixPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(18rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] lg:grid-cols-2 2xl:grid-cols-4">
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
        className="relative flex min-w-0 items-start justify-center bg-background p-6 pt-12 text-foreground"
      >
        <span className="absolute top-4 left-4 font-mono text-[10px] leading-none font-medium tracking-wide text-foreground-placeholder uppercase">
          {label}
        </span>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </ThemeProvider>
  );
}

function MatrixMenu({ label, children }: { label: string; children: ReactNode }) {
  const triggerId = useId();
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex min-h-56 w-full items-start justify-center">
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<Button variant="outline" size="sm" />}>
          {label}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          positionMethod="absolute"
          sideOffset={8}
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="flex w-64 flex-col"
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
