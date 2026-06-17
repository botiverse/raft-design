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
  DropdownMenuSurface,
  DropdownMenuTrigger,
} from "@slock/ui";
import { Check } from "lucide-react";
import {
  IconBellOutline18,
  IconChevronRightOutline18,
  IconCreditCardOutline18,
  IconGridCircleOutline18,
  IconMoonStarsOutline18,
  IconPersonDoorOutline18,
  IconProfileAnalyticsOutline18,
  IconTrashOutline18,
  IconUserOutline18,
} from "nucleo-ui-outline-18";
import type { ReactNode, RefObject } from "react";
import { useId, useRef } from "react";

import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  SERVER_SWITCHER_MENU_COMPOSITION_PATH,
  SERVER_SWITCHER_MENU_CONTENT_SNIPPET,
  ServerSwitcherMenuComposition,
  ServerSwitcherMenuSourcePreview,
} from "#/compositions/server-switcher-menu.tsx";
import { SelectionPopover as LegacySelectionPopover } from "../../../../../packages/ui/src/legacy/selection-popover.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "submenu", title: "Submenu" },
  { id: "radio-group", title: "Radio group" },
  { id: "plain-picker", title: "Plain picker" },
  { id: "headerless-picker", title: "Headerless picker" },
  { id: "options-list", title: "Options list" },
  { id: "checkboxes", title: "Checkboxes" },
  { id: "switch", title: "Switch" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "migration", title: "Migration" },
] as const;

const TODOS = ["Add group part when a source callsite needs it"] as const;

type PlaygroundValues = {
  open: boolean;
  label: string;
};

const PROFILE_MENU_SNIPPET = `    <DropdownMenuLabel>Account</DropdownMenuLabel>
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
    <DropdownMenuSubmenu>
      <DropdownMenuSubmenuTrigger openOnHover>
        <IconMoonStarsOutline18 />
        <span className="min-w-0 flex-1 truncate">Theme</span>
        <IconChevronRightOutline18 className="ml-auto" />
      </DropdownMenuSubmenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={10} className="flex w-36 min-w-36 flex-col">
        <DropdownMenuItem>System</DropdownMenuItem>
        <DropdownMenuItem>Light</DropdownMenuItem>
        <DropdownMenuItem>Dark</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuSubmenu>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <IconPersonDoorOutline18 />
      <span className="min-w-0 flex-1 truncate">Sign out</span>
      <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuItem className="text-danger-base hover:bg-danger-lighter hover:text-danger-base data-[highlighted]:bg-danger-lighter data-[highlighted]:text-danger-base [&>svg]:text-danger-base hover:[&>svg]:text-danger-base data-[highlighted]:[&>svg]:text-danger-base">
      <IconTrashOutline18 />
      <span className="min-w-0 flex-1 truncate">Delete account</span>
    </DropdownMenuItem>`;

const SWITCH_MENU_SNIPPET = `<DropdownMenu open modal={false} triggerId="switch-menu-trigger">
  <DropdownMenuTrigger id="switch-menu-trigger" render={<Button variant="outline" size="md" />}>
    Switch
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
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
  </DropdownMenuContent>
</DropdownMenu>`;

const CHECKBOXES_MENU_SNIPPET = `<DropdownMenu open modal={false} triggerId="checkboxes-menu-trigger">
  <DropdownMenuTrigger id="checkboxes-menu-trigger" render={<Button variant="outline" size="md" />}>
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

const RADIO_GROUP_MENU_SNIPPET = `<DropdownMenu open modal={false} triggerId="radio-group-menu-trigger">
  <DropdownMenuTrigger id="radio-group-menu-trigger" render={<Button variant="outline" size="md" />}>
    Radio group
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
    <DropdownMenuRadioGroup defaultValue="system">
      <DropdownMenuRadioItem value="system">
        System theme
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="light">
        Light theme
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`;

const PLAIN_PICKER_SNIPPET = `<DropdownMenu open modal={false} triggerId="plain-picker-trigger">
  <DropdownMenuTrigger id="plain-picker-trigger" render={<Button variant="outline" size="md" />}>
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
  <DropdownMenuTrigger id="headerless-picker-trigger" render={<Button variant="outline" size="md" />}>
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

const OPTIONS_LIST_SNIPPET = `<DropdownMenu open modal={false} triggerId="options-list-trigger">
  <DropdownMenuTrigger id="options-list-trigger" render={<Button variant="outline" size="md" />}>
    Options
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex min-w-[220px] flex-col">
    <DropdownMenuRadioGroup defaultValue="relevance">
      <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="recent">Most recent</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`;

const SUBMENU_SNIPPET = `<DropdownMenu open modal={false} triggerId="submenu-trigger">
  <DropdownMenuTrigger id="submenu-trigger" render={<Button variant="outline" size="md" />}>
    Submenu
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
    <DropdownMenuItem>
      <IconUserOutline18 />
      <span className="min-w-0 flex-1 truncate">Profile</span>
    </DropdownMenuItem>
    <DropdownMenuSubmenu>
      <DropdownMenuSubmenuTrigger openOnHover>
        <IconMoonStarsOutline18 />
        <span className="min-w-0 flex-1 truncate">Theme</span>
        <IconChevronRightOutline18 className="ml-auto" />
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
  anatomy: `import {
  Button,
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
} from "@slock/ui";
import {
  IconBellOutline18,
  IconChevronRightOutline18,
  IconCreditCardOutline18,
  IconMoonStarsOutline18,
  IconPersonDoorOutline18,
  IconProfileAnalyticsOutline18,
  IconTrashOutline18,
  IconUserOutline18,
} from "nucleo-ui-outline-18";

<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="outline" size="md" />}>
    <IconProfileAnalyticsOutline18 />
    Profile
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
${PROFILE_MENU_SNIPPET}
  </DropdownMenuContent>
</DropdownMenu>`,
  submenu: SUBMENU_SNIPPET,
  switchMenu: SWITCH_MENU_SNIPPET,
  checkboxesMenu: CHECKBOXES_MENU_SNIPPET,
  radioGroupMenu: RADIO_GROUP_MENU_SNIPPET,
  plainPicker: PLAIN_PICKER_SNIPPET,
  headerlessPicker: HEADERLESS_PICKER_SNIPPET,
  optionsList: OPTIONS_LIST_SNIPPET,
  sourceServerSwitcher: `<ServerSwitcherMenu
  servers={servers}
  selectedServerId={selectedServerId}
  unreadCounts={unreadCounts}
  onSelectServer={setSelectedServerId}
  onJoinCommunity={joinCommunity}
  onCreateServer={createServer}
/>`,
  currentServerSwitcher: `<DropdownMenu open modal={false} triggerId={triggerId}>
  <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
  <DropdownMenuSurface className="flex w-64 flex-col">
${SERVER_SWITCHER_MENU_CONTENT_SNIPPET}
  </DropdownMenuSurface>
</DropdownMenu>`,
  migrationServerSwitcher: `// Source
<ServerSwitcherMenu
  servers={servers}
  selectedServerId={selectedServerId}
  unreadCounts={unreadCounts}
  onSelectServer={setSelectedServerId}
  onJoinCommunity={joinCommunity}
  onCreateServer={createServer}
/>

// Current
<DropdownMenu open={isServerMenuOpen} onOpenChange={setIsServerMenuOpen}>
  <DropdownMenuTrigger render={<Button variant="outline" size="md" />}>
    Switch server
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex w-64 flex-col">
${SERVER_SWITCHER_MENU_CONTENT_SNIPPET}
  </DropdownMenuContent>
</DropdownMenu>`,
  migrationPlainPicker: `// Source — MessageSearchPage.tsx
<SelectionPopover
  title="Time"
  options={[
    { key: "any", checked: true, label: "Any time", onClick: () => setTimeRange("any") },
    { key: "today", checked: false, label: "Today", onClick: () => setTimeRange("today") },
    { key: "7d", checked: false, label: "Last 7 days", onClick: () => setTimeRange("7d") },
  ]}
/>

// Current
<DropdownMenu open={timeMenuOpen} onOpenChange={setTimeMenuOpen}>
  <DropdownMenuTrigger render={<FilterChip />}>Time</DropdownMenuTrigger>
  <DropdownMenuContent className="flex min-w-[220px] flex-col">
    <DropdownMenuLabel>Time</DropdownMenuLabel>
    <DropdownMenuRadioGroup value={timeRange} onValueChange={setTimeRange}>
      <DropdownMenuRadioItem value="any">Any time</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="7d">Last 7 days</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
  migrationHeaderlessPicker: `// Source — Sidebar.tsx
<SelectionPopover
  title="Sort"
  showHeader={false}
  className="min-w-[136px]"
  options={[
    { key: "manual", checked: true, label: "Manual", onClick: () => setSort("manual") },
    { key: "recent", checked: false, label: "Recent", onClick: () => setSort("recent") },
    { key: "az", checked: false, label: "A-Z", onClick: () => setSort("az") },
  ]}
/>

// Current
<DropdownMenu open={sortMenuOpen} onOpenChange={setSortMenuOpen}>
  <DropdownMenuTrigger render={<IconButton aria-label="Sort channels" />}>
    <ArrowUpDown />
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex min-w-[136px] flex-col">
    <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
      <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="recent">Recent</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="az">A-Z</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
  migrationOptionsList: `// Source — Select.tsx
<SelectionPopover
  title="Options"
  showHeader={false}
  options={[
    { key: "relevance", checked: true, label: "Relevance", reserveLeadingSlot: true, onClick: () => setValue("relevance") },
    { key: "recent", checked: false, label: "Most recent", reserveLeadingSlot: true, onClick: () => setValue("recent") },
  ]}
/>

// Current
<DropdownMenu open={optionsOpen} onOpenChange={setOptionsOpen}>
  <DropdownMenuTrigger render={<SelectTrigger />}>
    {selectedLabel}
  </DropdownMenuTrigger>
  <DropdownMenuContent className="flex min-w-[220px] flex-col">
    <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
      <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="recent">Most recent</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
} as const;

function ProfileMenuRows() {
  return (
    <>
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
      <DropdownMenuSubmenu>
        <DropdownMenuSubmenuTrigger openOnHover>
          <IconMoonStarsOutline18 />
          <span className="min-w-0 flex-1 truncate">Theme</span>
          <IconChevronRightOutline18 className="ml-auto" />
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
        <IconPersonDoorOutline18 />
        <span className="min-w-0 flex-1 truncate">Sign out</span>
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
      <DropdownMenuItem className="text-danger-base hover:bg-danger-lighter hover:text-danger-base data-[highlighted]:bg-danger-lighter data-[highlighted]:text-danger-base [&>svg]:text-danger-base hover:[&>svg]:text-danger-base data-[highlighted]:[&>svg]:text-danger-base">
        <IconTrashOutline18 />
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
      <DropdownMenuRadioItem value="system">System theme</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="light">Light theme</DropdownMenuRadioItem>
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

function OptionsListRows() {
  return (
    <DropdownMenuRadioGroup defaultValue="relevance">
      <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="recent">Most recent</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}

const noop = () => {};

function SourcePopoverMount({
  contentClassName = "w-[220px]",
  children,
}: {
  contentClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <div
        className={["relative shrink-0 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]", contentClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function ComparisonDropdownMount({
  frameClassName = "w-[220px]",
  contentClassName = "min-w-[220px]",
  children,
}: {
  frameClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const triggerId = useId();

  return (
    <div className="flex h-full min-h-56 w-full items-center justify-center">
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId} render={<span aria-hidden className="sr-only" />} />
        <DropdownMenuSurface
          className={[contentClassName, frameClassName].filter(Boolean).join(" ")}
        >
          {children}
        </DropdownMenuSurface>
      </DropdownMenu>
    </div>
  );
}

function SourceMessageSearchTimeComparison() {
  return (
    <SourcePopoverMount>
      <LegacySelectionPopover
        title="Time"
        options={[
          { key: "any", checked: true, label: "Any time", onClick: noop },
          { key: "today", checked: false, label: "Today", onClick: noop },
          { key: "7d", checked: false, label: "Last 7 days", onClick: noop },
        ]}
      />
    </SourcePopoverMount>
  );
}

function CurrentMessageSearchTimeComparison() {
  return (
    <ComparisonDropdownMount>
      <PlainPickerRows />
    </ComparisonDropdownMount>
  );
}

function SourceSidebarSortComparison() {
  return (
    <SourcePopoverMount contentClassName="w-[136px]">
      <LegacySelectionPopover
        title="Sort"
        showHeader={false}
        className="min-w-[136px]"
        options={[
          { key: "manual", checked: true, label: "Manual", onClick: noop },
          { key: "recent", checked: false, label: "Recent", onClick: noop },
          { key: "az", checked: false, label: "A-Z", onClick: noop },
        ]}
      />
    </SourcePopoverMount>
  );
}

function CurrentSidebarSortComparison() {
  return (
    <ComparisonDropdownMount frameClassName="w-[136px]" contentClassName="min-w-[136px] w-[136px]">
      <HeaderlessSortRows />
    </ComparisonDropdownMount>
  );
}

function SourceSelectComparison() {
  return (
    <SourcePopoverMount>
      <LegacySelectionPopover
        title="Options"
        showHeader={false}
        options={[
          {
            key: "relevance",
            checked: true,
            label: "Relevance",
            reserveLeadingSlot: true,
            onClick: noop,
          },
          {
            key: "recent",
            checked: false,
            label: "Most recent",
            reserveLeadingSlot: true,
            onClick: noop,
          },
        ]}
      />
    </SourcePopoverMount>
  );
}

function CurrentSelectComparison() {
  return (
    <ComparisonDropdownMount>
      <OptionsListRows />
    </ComparisonDropdownMount>
  );
}

function SubmenuRows() {
  return (
    <>
      <DropdownMenuItem>
        <IconUserOutline18 />
        <span className="min-w-0 flex-1 truncate">Profile</span>
      </DropdownMenuItem>
      <DropdownMenuSubmenu>
        <DropdownMenuSubmenuTrigger openOnHover>
          <IconMoonStarsOutline18 />
          <span className="min-w-0 flex-1 truncate">Theme</span>
          <IconChevronRightOutline18 className="ml-auto" />
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
        <DropdownMenuTrigger id={triggerId} render={<Button variant="outline" size="md" />}>
          {label}
        </DropdownMenuTrigger>
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

function ProfilePreviewMenu({ open, label }: { open: boolean; label: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <DropdownMenu open={open} modal={false} triggerId="preview-profile-trigger">
        <DropdownMenuTrigger
          id="preview-profile-trigger"
          render={<Button variant="outline" size="md" />}
        >
          <IconProfileAnalyticsOutline18 />
          {label}
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
    description: "Button-like trigger. Compose custom controls with Base UI's render prop.",
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
  loader: () => highlightSnippets({ data: SNIPPETS }),
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
          <IconGridCircleOutline18 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
      sectionDividers={false}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Preview models a profile menu. Icons, trailing chevrons, shortcuts, counters, and selected
          state indicators are composed as children so product code can choose its own visual
          language without a dedicated icon prop.
        </p>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            open: true,
            label: "Profile",
          }}
          controls={[
            { name: "open", label: "Open", type: "boolean" },
            { name: "label", label: "Label", type: "text" },
          ]}
          previewClassName="min-h-[30rem] items-start pt-24"
          render={(values) => <ProfilePreviewMenu open={values.open} label={values.label} />}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="submenu" title="Submenu">
        <Example html={code.submenu} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample triggerId="submenu-trigger" label="Submenu">
            <SubmenuRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="radio-group" title="Radio group">
        <Example html={code.radioGroupMenu} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample triggerId="radio-group-menu-trigger" label="Radio group">
            <RadioGroupMenuRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="plain-picker" title="Plain picker">
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

      <DocSection id="headerless-picker" title="Headerless picker">
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

      <DocSection id="options-list" title="Options list">
        <Example html={code.optionsList} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample
            triggerId="options-list-trigger"
            label="Options"
            contentClassName="flex min-w-[220px] flex-col"
          >
            <OptionsListRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="checkboxes" title="Checkboxes">
        <Example html={code.checkboxesMenu} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenMenuExample triggerId="checkboxes-menu-trigger" label="Checkboxes">
            <CheckboxesMenuRows />
          </OpenMenuExample>
        </Example>
      </DocSection>

      <DocSection id="switch" title="Switch">
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
          layout="grid"
          items={[
            {
              label: "Server switcher menu",
              status: "difference",
              note: "Source exposed one business-shaped ServerSwitcherMenu. Current keeps the same row, separator, badge, and action structure but moves the API to a generic Base UI menu composition.",
              source: <ServerSwitcherMenuSourcePreview />,
              brutal: <ServerSwitcherMenuComposition />,
              elegant: <ServerSwitcherMenuComposition />,
              elegantDark: <ServerSwitcherMenuComposition />,
              compositionCode: code.currentServerSwitcher,
              compositionPath: SERVER_SWITCHER_MENU_COMPOSITION_PATH,
              compositionSource: SNIPPETS.currentServerSwitcher,
              compositionShowLineNumbers: false,
            },
            {
              label: "Message search — time filter",
              status: "difference",
              note: "`MessageSearchPage.tsx`. Plain single-select list for search time ranges (`any`, `today`, `7d`, `30d`) with no search field. Menu semantics fit better than a popover shell.",
              source: <SourceMessageSearchTimeComparison />,
              brutal: <CurrentMessageSearchTimeComparison />,
              elegant: <CurrentMessageSearchTimeComparison />,
              elegantDark: <CurrentMessageSearchTimeComparison />,
            },
            {
              label: "Sidebar — sort menu",
              status: "difference",
              note: "`Sidebar.tsx`. Compact sort dropdown with `showHeader={false}` and a narrower `min-w-[136px]` shell aligned to the section icon button.",
              source: <SourceSidebarSortComparison />,
              brutal: <CurrentSidebarSortComparison />,
              elegant: <CurrentSidebarSortComparison />,
              elegantDark: <CurrentSidebarSortComparison />,
            },
            {
              label: "Select — options list",
              status: "difference",
              note: "`Select.tsx`. Headerless options surface mounted under a brutal select trigger. Rows reserve the leading slot for baseline alignment even without avatars.",
              source: <SourceSelectComparison />,
              brutal: <CurrentSelectComparison />,
              elegant: <CurrentSelectComparison />,
              elegantDark: <CurrentSelectComparison />,
            },
          ]}
        />
      </DocSection>

      <DocSection id="migration" title="Migration">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground-strong">
              Server Switcher Composition
            </h3>
            <p className="text-sm text-foreground-muted">
              Replace the business-shaped server switcher with a generic Base UI menu composition.
              Server data, navigation, join flow, unread counts, and open state stay app-owned.
            </p>
            <CodeBlock html={code.migrationServerSwitcher} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground-strong">
              Plain picker composition
            </h3>
            <p className="text-sm text-foreground-muted">
              Replace headered SelectionPopover pickers with DropdownMenuLabel plus
              DropdownMenuRadioGroup. Selection state and onChange stay app-owned.
            </p>
            <CodeBlock html={code.migrationPlainPicker} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground-strong">
              Headerless picker composition
            </h3>
            <p className="text-sm text-foreground-muted">
              Replace compact headerless SelectionPopover menus with a radio group only. Width and
              trigger alignment stay app-owned.
            </p>
            <CodeBlock html={code.migrationHeaderlessPicker} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground-strong">
              Options list composition
            </h3>
            <p className="text-sm text-foreground-muted">
              Replace Select's headerless SelectionPopover options with DropdownMenuRadioGroup under
              the select trigger. Value, labels, and reserved leading-slot alignment stay app-owned.
            </p>
            <CodeBlock html={code.migrationOptionsList} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
