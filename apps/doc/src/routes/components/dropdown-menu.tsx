import { createFileRoute } from "@tanstack/react-router";
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
  InlineCode,
  Switch,
} from "raft-ui";
import {
  Bell,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CreditCard,
  Grid2X2,
  LogOut,
  Monitor,
  MoonStar,
  Sun,
  Trash,
  User,
} from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSourceMap } from "#/lib/source-comparison-code.ts";
import messageSearchTimeFilterCompositionSource from "#/compositions/message-search-time-filter-composition.tsx?raw";
import {
  MESSAGE_SEARCH_TIME_FILTER_COMPOSITION_PATH,
  MessageSearchTimeFilterComposition,
  MessageSearchTimeFilterSourcePreview,
} from "#/compositions/message-search-time-filter.tsx";
import serverSwitcherMenuCompositionSource from "#/compositions/server-switcher-menu-composition.tsx?raw";
import {
  SERVER_SWITCHER_MENU_COMPOSITION_PATH,
  ServerSwitcherMenuComposition,
  ServerSwitcherMenuSourcePreview,
} from "#/compositions/server-switcher-menu.tsx";
import sidebarSortMenuCompositionSource from "#/compositions/sidebar-sort-menu-composition.tsx?raw";
import {
  SIDEBAR_SORT_MENU_COMPOSITION_PATH,
  SidebarSortMenuComposition,
  SidebarSortMenuSourcePreview,
} from "#/compositions/sidebar-sort-menu.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "submenu", title: "Submenu" },
  { id: "radio-group", title: "Radio group" },
  { id: "plain-picker", title: "Plain picker" },
  { id: "headerless-picker", title: "Headerless picker" },
  { id: "checkboxes", title: "Checkboxes" },
  { id: "switch", title: "Switch" },
  { id: "api", title: "API" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [
      { id: "source-comparison-server-switcher", title: "Server switcher" },
      { id: "source-comparison-time-filter", title: "Time filter" },
      { id: "source-comparison-sort-menu", title: "Sort menu" },
    ],
  },
] as const;
const SOURCE_SCENES = [
  {
    label: "Switcher, filter, sort, and option menus",
    scenes: [
      {
        label: "LeftRail.tsx:110",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/LeftRail.tsx:110",
      },
      {
        label: "Sidebar.tsx:751,1242",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:751,1242",
      },
      {
        label: "MessageSearchPage.tsx:863",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/search/MessageSearchPage.tsx:863",
      },
      {
        label: "Select.tsx:80",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/Select.tsx:80",
      },
    ],
  },
] as const;

const DROPDOWN_MENU_COMPOSITION_SOURCES = createCompositionSourceMap({
  messageSearchTimeFilterComposition: messageSearchTimeFilterCompositionSource,
  serverSwitcherComposition: serverSwitcherMenuCompositionSource,
  sidebarSortMenuComposition: sidebarSortMenuCompositionSource,
} as const);

const PROFILE_MENU_SNIPPET = `    <DropdownMenuLabel>Account</DropdownMenuLabel>
    <DropdownMenuItem>
      <User />
      <span className="min-w-0 flex-1 truncate">Profile</span>
      <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Bell />
      <span className="min-w-0 flex-1 truncate">Notifications</span>
      <DropdownMenuItemCount>3</DropdownMenuItemCount>
    </DropdownMenuItem>
    <DropdownMenuItem>
      <CreditCard />
      <span className="min-w-0 flex-1 truncate">Billing</span>
    </DropdownMenuItem>
    <DropdownMenuSubmenu>
      <DropdownMenuSubmenuTrigger openOnHover>
        <MoonStar />
        <span className="min-w-0 flex-1 truncate">Theme</span>
        <ChevronRight className="ml-auto" />
      </DropdownMenuSubmenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={10} className="flex w-36 min-w-36 flex-col">
        <DropdownMenuItem>System</DropdownMenuItem>
        <DropdownMenuItem>Light</DropdownMenuItem>
        <DropdownMenuItem>Dark</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuSubmenu>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <LogOut />
      <span className="min-w-0 flex-1 truncate">Sign out</span>
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem className="text-danger-base hover:bg-danger-lighter hover:text-danger-base data-[highlighted]:bg-danger-lighter data-[highlighted]:text-danger-base [&>svg]:text-danger-base hover:[&>svg]:text-danger-base data-[highlighted]:[&>svg]:text-danger-base">
      <Trash />
      <span className="min-w-0 flex-1 truncate">Delete account</span>
    </DropdownMenuItem>`;

const SWITCH_MENU_SNIPPET = `<DropdownMenu open modal={false} triggerId="switch-menu-trigger">
  <DropdownMenuTrigger id="switch-menu-trigger">
    Switch
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
    <DropdownMenuItem>
      <span className="min-w-0 flex-1 truncate">Desktop notifications</span>
      <Switch className="pointer-events-none ml-auto" checked readOnly tabIndex={-1} aria-hidden />
    </DropdownMenuItem>
    <DropdownMenuItem>
      <span className="min-w-0 flex-1 truncate">Marketing updates</span>
      <Switch className="pointer-events-none ml-auto" readOnly tabIndex={-1} aria-hidden />
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`;

const CHECKBOXES_MENU_SNIPPET = `<DropdownMenu open modal={false} triggerId="checkboxes-menu-trigger">
  <DropdownMenuTrigger id="checkboxes-menu-trigger">
    Checkboxes
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
    <DropdownMenuCheckboxItem defaultChecked>
      Include archived projects
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem>
      Sync starred items
    </DropdownMenuCheckboxItem>
  </DropdownMenuContent>
</DropdownMenu>`;

const RADIO_GROUP_MENU_SNIPPET = `import { Monitor, Sun } from "lucide-react";

<DropdownMenu open modal={false} triggerId="radio-group-menu-trigger">
  <DropdownMenuTrigger id="radio-group-menu-trigger">
    Radio group
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
    <DropdownMenuRadioGroup defaultValue="system">
      <DropdownMenuRadioItem value="system">
        <Monitor />
        <span className="min-w-0 flex-1 truncate">System theme</span>
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="light">
        <Sun />
        <span className="min-w-0 flex-1 truncate">Light theme</span>
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`;

const PLAIN_PICKER_SNIPPET = `<DropdownMenu open modal={false} triggerId="plain-picker-trigger">
  <DropdownMenuTrigger id="plain-picker-trigger">
    Time
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex min-w-[220px] flex-col">
    <DropdownMenuLabel>Time</DropdownMenuLabel>
    <DropdownMenuRadioGroup defaultValue="any">
      <DropdownMenuRadioItem value="any">Any time</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="7d">Last 7 days</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`;

const HEADERLESS_PICKER_SNIPPET = `<DropdownMenu open modal={false} triggerId="headerless-picker-trigger">
  <DropdownMenuTrigger id="headerless-picker-trigger">
    Sort
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex min-w-[136px] flex-col">
    <DropdownMenuRadioGroup defaultValue="manual">
      <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="recent">Recent</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="az">A-Z</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`;

const SUBMENU_SNIPPET = `<DropdownMenu open modal={false} triggerId="submenu-trigger">
  <DropdownMenuTrigger id="submenu-trigger">
    Submenu
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
    <DropdownMenuItem>
      <User />
      <span className="min-w-0 flex-1 truncate">Profile</span>
    </DropdownMenuItem>
    <DropdownMenuSubmenu>
      <DropdownMenuSubmenuTrigger openOnHover>
        <MoonStar />
        <span className="min-w-0 flex-1 truncate">Theme</span>
        <ChevronRight className="ml-auto" />
      </DropdownMenuSubmenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={10} className="flex w-36 min-w-36 flex-col">
        <DropdownMenuItem>System</DropdownMenuItem>
        <DropdownMenuItem>Light</DropdownMenuItem>
        <DropdownMenuItem>Dark</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuSubmenu>
  </DropdownMenuContent>
</DropdownMenu>`;

const SNIPPETS = {
  preview: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger,
} from "raft-ui";

<DropdownMenu defaultOpen modal={false} triggerId="preview-profile-trigger">
  <DropdownMenuTrigger id="preview-profile-trigger">
    <ChartNoAxesCombined />
    Profile
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
${PROFILE_MENU_SNIPPET}
  </DropdownMenuContent>
</DropdownMenu>`,
  anatomy: `<DropdownMenu>
  <DropdownMenuTrigger />
  <DropdownMenuContent>
    <DropdownMenuLabel />
    <DropdownMenuItem>
      <DropdownMenuShortcut />
    </DropdownMenuItem>
    <DropdownMenuSubmenu>
      <DropdownMenuSubmenuTrigger />
      <DropdownMenuContent>
        <DropdownMenuItem />
      </DropdownMenuContent>
    </DropdownMenuSubmenu>
    <DropdownMenuSeparator />
  </DropdownMenuContent>
</DropdownMenu>`,
  submenu: SUBMENU_SNIPPET,
  switchMenu: SWITCH_MENU_SNIPPET,
  checkboxesMenu: CHECKBOXES_MENU_SNIPPET,
  radioGroupMenu: RADIO_GROUP_MENU_SNIPPET,
  plainPicker: PLAIN_PICKER_SNIPPET,
  headerlessPicker: HEADERLESS_PICKER_SNIPPET,
} as const;

function ProfileMenuRows() {
  return (
    <>
      <DropdownMenuLabel>Account</DropdownMenuLabel>
      <DropdownMenuItem>
        <User />
        <span className="min-w-0 flex-1 truncate">Profile</span>
        <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Bell />
        <span className="min-w-0 flex-1 truncate">Notifications</span>
        <DropdownMenuItemCount>3</DropdownMenuItemCount>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <CreditCard />
        <span className="min-w-0 flex-1 truncate">Billing</span>
      </DropdownMenuItem>
      <DropdownMenuSubmenu>
        <DropdownMenuSubmenuTrigger openOnHover>
          <MoonStar />
          <span className="min-w-0 flex-1 truncate">Theme</span>
          <ChevronRight className="ml-auto" />
        </DropdownMenuSubmenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="flex w-36 min-w-36 flex-col"
        >
          <DropdownMenuItem>
            <span className="flex size-3.5 shrink-0 items-center justify-center">
              <Check size={14} />
            </span>
            <span className="min-w-0 flex-1 truncate">System</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
              <Check size={14} className="opacity-0" />
            </span>
            <span className="min-w-0 flex-1 truncate">Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span className="flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
              <Check size={14} className="opacity-0" />
            </span>
            <span className="min-w-0 flex-1 truncate">Dark</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSubmenu>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogOut />
        <span className="min-w-0 flex-1 truncate">Sign out</span>
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem className="text-danger-base hover:bg-danger-lighter hover:text-danger-base data-[highlighted]:bg-danger-lighter data-[highlighted]:text-danger-base [&>svg]:text-danger-base hover:[&>svg]:text-danger-base data-[highlighted]:[&>svg]:text-danger-base">
        <Trash />
        <span className="min-w-0 flex-1 truncate">Delete account</span>
      </DropdownMenuItem>
    </>
  );
}

function SwitchMenuRows() {
  return (
    <>
      <DropdownMenuItem>
        <span className="min-w-0 flex-1 truncate">Desktop notifications</span>
        <Switch
          className="pointer-events-none ml-auto"
          checked
          readOnly
          tabIndex={-1}
          aria-hidden
        />
      </DropdownMenuItem>
      <DropdownMenuItem>
        <span className="min-w-0 flex-1 truncate">Marketing updates</span>
        <Switch className="pointer-events-none ml-auto" readOnly tabIndex={-1} aria-hidden />
      </DropdownMenuItem>
    </>
  );
}

function CheckboxesMenuRows() {
  return (
    <>
      <DropdownMenuCheckboxItem defaultChecked>Include archived projects</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem>Sync starred items</DropdownMenuCheckboxItem>
    </>
  );
}

function RadioGroupMenuRows() {
  return (
    <DropdownMenuRadioGroup defaultValue="system">
      <DropdownMenuRadioItem value="system">
        <Monitor />
        <span className="min-w-0 flex-1 truncate">System theme</span>
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="light">
        <Sun />
        <span className="min-w-0 flex-1 truncate">Light theme</span>
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}

function PlainPickerRows() {
  return (
    <>
      <DropdownMenuLabel>Time</DropdownMenuLabel>
      <DropdownMenuRadioGroup defaultValue="any">
        <DropdownMenuRadioItem value="any">Any time</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="7d">Last 7 days</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>
  );
}

function HeaderlessSortRows() {
  return (
    <DropdownMenuRadioGroup defaultValue="manual">
      <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="recent">Recent</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="az">A-Z</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}

function SubmenuRows() {
  return (
    <>
      <DropdownMenuItem>
        <User />
        <span className="min-w-0 flex-1 truncate">Profile</span>
      </DropdownMenuItem>
      <DropdownMenuSubmenu>
        <DropdownMenuSubmenuTrigger openOnHover>
          <MoonStar />
          <span className="min-w-0 flex-1 truncate">Theme</span>
          <ChevronRight className="ml-auto" />
        </DropdownMenuSubmenuTrigger>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="flex w-36 min-w-36 flex-col"
        >
          <DropdownMenuItem>System</DropdownMenuItem>
          <DropdownMenuItem>Light</DropdownMenuItem>
          <DropdownMenuItem>Dark</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuSubmenu>
    </>
  );
}

function OpenMenuExample({
  triggerId,
  label,
  children,
  contentClassName = "flex w-64 flex-col",
}: {
  triggerId: string;
  label: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId}>{label}</DropdownMenuTrigger>
        <DropdownMenuContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className={contentClassName}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ProfilePreviewMenu() {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <DropdownMenu defaultOpen modal={false} triggerId="preview-profile-trigger">
        <DropdownMenuTrigger id="preview-profile-trigger">
          <ChartNoAxesCombined />
          Profile
        </DropdownMenuTrigger>
        <DropdownMenuContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="flex w-64 flex-col"
        >
          <ProfileMenuRows />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const PROPS: readonly PropRow[] = [
  {
    name: "DropdownMenu",
    type: "Base UI Menu.Root.Props",
    description: "Owns open state, focus, Escape, outside press, and menu dismissal.",
  },
  {
    name: "DropdownMenuTrigger",
    type: "Base UI Menu.Trigger.Props",
    description:
      "Button-like trigger. Defaults to an outline md Button; pass render for a custom control.",
  },
  {
    name: "DropdownMenuContent",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled card shell. Defaults to side=bottom, align=start, sideOffset=4, disableAnchorTracking=false, and positionMethod=fixed.",
  },
  {
    name: "DropdownMenuItem",
    type: "Base UI Menu.Item.Props",
    description:
      "Source server-switcher row styling with keyboard highlight. Compose special rows with className.",
  },
  {
    name: "DropdownMenuRadioGroup",
    type: "Base UI Menu.RadioGroup.Props",
    description:
      "Groups radio items for single-select behavior. Use value/defaultValue/onValueChange.",
  },
  {
    name: "DropdownMenuRadioItem",
    type: "Base UI Menu.RadioItem.Props",
    description:
      "Single-select item inside RadioGroup. Uses same item styling as DropdownMenuItem with built-in check indicator. closeOnClick defaults to false.",
  },
  {
    name: "DropdownMenuRadioItemIndicator",
    type: "Base UI Menu.RadioItemIndicator.Props",
    description:
      "Lower-level indicator for custom composition. Renders children only when the parent radio item is selected.",
  },
  {
    name: "DropdownMenuCheckboxItem",
    type: "Base UI Menu.CheckboxItem.Props",
    description:
      "Independent toggle item. Uses same item styling as DropdownMenuItem with built-in check indicator. closeOnClick defaults to false.",
  },
  {
    name: "DropdownMenuCheckboxItemIndicator",
    type: "Base UI Menu.CheckboxItemIndicator.Props",
    description:
      "Lower-level indicator for custom composition (e.g. switch visuals). Renders children only when the parent checkbox item is checked. Use keepMounted to preserve layout when unchecked.",
  },
  {
    name: "DropdownMenuLabel",
    type: "div props",
    description: "Non-interactive section label composed inside DropdownMenuContent.",
  },
  {
    name: "DropdownMenuSubmenu",
    type: "Base UI Menu.SubmenuRoot.Props",
    description: "Nested menu root for secondary action groups.",
  },
  {
    name: "DropdownMenuSubmenuTrigger",
    type: "Base UI Menu.SubmenuTrigger.Props",
    description: "Item-like trigger that opens a nested DropdownMenuContent.",
  },
  {
    name: "DropdownMenuShortcut",
    type: "Kbd props",
    description: "Right-aligned keyboard hint composed inside DropdownMenuItem.",
  },
  {
    name: "DropdownMenuItemCount",
    type: "Badge props",
    description: "Right-aligned count chip composed from Badge with its default state.",
  },
  {
    name: "DropdownMenuSeparator",
    type: "Base UI Separator.Props",
    description: "Source server-switcher divider styling as the separator part.",
  },
];

export const Route = createFileRoute("/components/dropdown-menu")({
  component: DropdownMenuDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...DROPDOWN_MENU_COMPOSITION_SOURCES,
      },
    }),
});

function DropdownMenuDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="DropdownMenu"
      description="A trigger-driven menu family built on Base UI Menu for account, action, and nested command surfaces."
      headerAction={
        <Button
          render={<a href="/components/dropdown-menu/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <Grid2X2 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Preview models a profile menu. Icons, trailing chevrons, shortcuts, counters, and selected
          state indicators are composed as children so product code can choose its own visual
          language without a dedicated icon prop.
        </p>
        <Example html={code.preview} previewClassName="min-h-[30rem] items-start pt-24">
          <ProfilePreviewMenu />
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="submenu" title="Submenu" showThemeSwitcher>
        <Example html={code.submenu} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample triggerId="submenu-trigger" label="Submenu">
            <SubmenuRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="radio-group" title="Radio group" showThemeSwitcher>
        <Example html={code.radioGroupMenu} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample triggerId="radio-group-menu-trigger" label="Radio group">
            <RadioGroupMenuRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="plain-picker" title="Plain picker" showThemeSwitcher>
        <Example html={code.plainPicker} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample
            triggerId="plain-picker-trigger"
            label="Time"
            contentClassName="flex min-w-[220px] flex-col"
          >
            <PlainPickerRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="headerless-picker" title="Headerless picker" showThemeSwitcher>
        <Example html={code.headerlessPicker} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample
            triggerId="headerless-picker-trigger"
            label="Sort"
            contentClassName="flex min-w-[136px] flex-col"
          >
            <HeaderlessSortRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="checkboxes" title="Checkboxes" showThemeSwitcher>
        <Example html={code.checkboxesMenu} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample triggerId="checkboxes-menu-trigger" label="Checkboxes">
            <CheckboxesMenuRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="switch" title="Switch" showThemeSwitcher>
        <Example html={code.switchMenu} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample triggerId="switch-menu-trigger" label="Switch">
            <SwitchMenuRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              id: "source-comparison-server-switcher",
              label: "Server switcher",
              status: "difference",
              note: (
                <>
                  Source exposed one business-shaped <InlineCode>ServerSwitcherMenu</InlineCode>.
                  Current keeps the same row, separator, badge, and action structure but moves the
                  API to a generic Base UI menu composition.
                </>
              ),
              source: <ServerSwitcherMenuSourcePreview />,
              brutal: <ServerSwitcherMenuComposition />,
              elegant: <ServerSwitcherMenuComposition />,
              elegantDark: <ServerSwitcherMenuComposition />,
              compositionCode: code.serverSwitcherComposition,
              compositionCollapsedCode: code.serverSwitcherCompositionBody,
              compositionPath: SERVER_SWITCHER_MENU_COMPOSITION_PATH,
              compositionSource: DROPDOWN_MENU_COMPOSITION_SOURCES.serverSwitcherComposition,
              compositionShowLineNumbers: false,
            },
            {
              id: "source-comparison-time-filter",
              label: "Time filter",
              status: "difference",
              note: (
                <>
                  Search time range filter from <InlineCode>MessageSearchPage.tsx</InlineCode>. The
                  trigger opens one radio group (<InlineCode>any</InlineCode>,{" "}
                  <InlineCode>today</InlineCode>, <InlineCode>7d</InlineCode>,{" "}
                  <InlineCode>30d</InlineCode>) without search or rich content, so a menu maps more
                  directly to the interaction than a popover shell.
                </>
              ),
              source: <MessageSearchTimeFilterSourcePreview />,
              brutal: <MessageSearchTimeFilterComposition />,
              elegant: <MessageSearchTimeFilterComposition />,
              elegantDark: <MessageSearchTimeFilterComposition />,
              compositionCode: code.messageSearchTimeFilterComposition,
              compositionCollapsedCode: code.messageSearchTimeFilterCompositionBody,
              compositionPath: MESSAGE_SEARCH_TIME_FILTER_COMPOSITION_PATH,
              compositionSource:
                DROPDOWN_MENU_COMPOSITION_SOURCES.messageSearchTimeFilterComposition,
              compositionShowLineNumbers: false,
            },
            {
              id: "source-comparison-sort-menu",
              label: "Sort menu",
              status: "difference",
              note: (
                <>
                  <InlineCode>Sidebar.tsx</InlineCode>. Compact sort dropdown with{" "}
                  <InlineCode>showHeader={false}</InlineCode> and a narrower{" "}
                  <InlineCode>min-w-[136px]</InlineCode> shell aligned to the section icon button.
                </>
              ),
              source: <SidebarSortMenuSourcePreview />,
              brutal: <SidebarSortMenuComposition />,
              elegant: <SidebarSortMenuComposition />,
              elegantDark: <SidebarSortMenuComposition />,
              compositionCode: code.sidebarSortMenuComposition,
              compositionCollapsedCode: code.sidebarSortMenuCompositionBody,
              compositionPath: SIDEBAR_SORT_MENU_COMPOSITION_PATH,
              compositionSource: DROPDOWN_MENU_COMPOSITION_SOURCES.sidebarSortMenuComposition,
              compositionShowLineNumbers: false,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
