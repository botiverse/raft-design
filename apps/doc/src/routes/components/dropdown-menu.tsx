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
} from "@slock/ui";
import { IconCircleCheckFill18 } from "nucleo-ui-fill-18";
import {
  IconBellOutline18,
  IconChevronRightOutline18,
  IconCreditCardOutline18,
  IconMoonStarsOutline18,
  IconPersonDoorOutline18,
  IconPlusOutline18,
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
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { ServerSwitcherMenu as LegacyServerSwitcherMenu } from "../../../../../packages/ui/src/legacy/server-switcher-menu.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "submenu", title: "Submenu" },
  { id: "radio-group", title: "Radio group" },
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

const SERVER_SWITCHER_MENU_CONTENT_SNIPPET = `    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <DropdownMenuItem className="font-bold">
        <IconCircleCheckFill18 />
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">Slock</div>
          <div className="truncate font-mono text-xs text-black/40">/slock</div>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem className="font-medium">
        <IconCircleCheckFill18 className="opacity-0" />
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">Design Guild</div>
          <div className="truncate font-mono text-xs text-black/40">/design</div>
        </div>
        <DropdownMenuItemCount>4</DropdownMenuItemCount>
      </DropdownMenuItem>
      <DropdownMenuItem className="font-medium">
        <IconCircleCheckFill18 className="opacity-0" />
        <div className="min-w-0 flex-1 text-left">
          <div className="truncate">Open Source</div>
          <div className="truncate font-mono text-xs text-black/40">/oss</div>
        </div>
        <DropdownMenuItemCount>12</DropdownMenuItemCount>
      </DropdownMenuItem>
    </div>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="font-bold hover:bg-brutal-pink data-[highlighted]:bg-brutal-pink">
      <IconPlusOutline18 />
      <span className="flex h-6 min-w-0 flex-1 items-center text-left">Join Community</span>
    </DropdownMenuItem>
    <DropdownMenuItem className="font-bold hover:bg-brutal-pink data-[highlighted]:bg-brutal-pink">
      <IconPlusOutline18 />
      <span className="flex h-6 min-w-0 flex-1 items-center text-left">Switch or Create Server</span>
    </DropdownMenuItem>`;

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
  sourceServerSwitcher: `<ServerSwitcherMenu
  servers={servers}
  selectedServerId={selectedServerId}
  unreadCounts={unreadCounts}
  onSelectServer={setSelectedServerId}
  onJoinCommunity={joinCommunity}
  onCreateServer={createServer}
/>`,
  currentServerSwitcher: `<DropdownMenu open modal={false}>
  <DropdownMenuContent className="flex w-64 flex-col">
${SERVER_SWITCHER_MENU_CONTENT_SNIPPET}
  </DropdownMenuContent>
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
            <IconCircleCheckFill18 />
            <span className="min-w-0 flex-1 truncate">System</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCircleCheckFill18 className="opacity-0" />
            <span className="min-w-0 flex-1 truncate">Light</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCircleCheckFill18 className="opacity-0" />
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
}: {
  triggerId: string;
  label: string;
  children: ReactNode;
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
          className="flex w-64 flex-col"
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

const COMPARISON_SERVERS = [
  { id: "slock", name: "Slock", slug: "slock" },
  { id: "design", name: "Design Guild", slug: "design" },
  { id: "oss", name: "Open Source", slug: "oss" },
] as const;

const COMPARISON_UNREAD_COUNTS = {
  design: 4,
  oss: 12,
} as const;

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

function CurrentServerSwitcherMenuComparison({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();

  return (
    <div ref={portalRef} className={["relative w-64", className].filter(Boolean).join(" ")}>
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger
          id={triggerId}
          render={
            <button
              type="button"
              aria-label="Server switcher"
              className="absolute top-0 left-0 size-px overflow-hidden p-0 opacity-0"
            />
          }
        />
        <DropdownMenuContent
          collisionAvoidance={{ side: "none", align: "none", fallbackAxisSide: "none" }}
          positionMethod="absolute"
          side="bottom"
          align="start"
          sideOffset={0}
          alignOffset={0}
          className="flex w-64 flex-col"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <DropdownMenuItem className="font-bold">
              <IconCircleCheckFill18 />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate">Slock</div>
                <div className="truncate font-mono text-xs text-black/40">/slock</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-medium">
              <IconCircleCheckFill18 className="opacity-0" />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate">Design Guild</div>
                <div className="truncate font-mono text-xs text-black/40">/design</div>
              </div>
              <DropdownMenuItemCount>4</DropdownMenuItemCount>
            </DropdownMenuItem>
            <DropdownMenuItem className="font-medium">
              <IconCircleCheckFill18 className="opacity-0" />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate">Open Source</div>
                <div className="truncate font-mono text-xs text-black/40">/oss</div>
              </div>
              <DropdownMenuItemCount>12</DropdownMenuItemCount>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="font-bold hover:bg-brutal-pink data-[highlighted]:bg-brutal-pink">
            <IconPlusOutline18 />
            <span className="min-w-0 flex-1 text-left">Join Community</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="font-bold hover:bg-brutal-pink data-[highlighted]:bg-brutal-pink">
            <IconPlusOutline18 />
            <span className="min-w-0 flex-1 text-left">Switch or Create Server</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SourceServerSwitcherMenuComparison() {
  return (
    <PreviewThemeScope family="brutal" mode="light" className="contents">
      <div className="relative h-[234px] w-64 [--shadow-hover:4px_4px_0px_oklch(0_0_0)]">
        <LegacyServerSwitcherMenu
          servers={[...COMPARISON_SERVERS]}
          currentServerId="slock"
          serverUnreadCounts={COMPARISON_UNREAD_COUNTS}
          joinOptions={[{ slug: "community", label: "Join Community" }]}
          className="w-64"
          onSelectServer={() => {}}
          onJoinCommunity={() => {}}
          onSwitchOrCreate={() => {}}
        />
      </div>
    </PreviewThemeScope>
  );
}

function DropdownMenuDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="DropdownMenu"
      description="A trigger-driven menu family built on Base UI Menu for account, action, and nested command surfaces."
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
              source: <SourceServerSwitcherMenuComparison />,
              brutal: <CurrentServerSwitcherMenuComparison className="h-[234px]" />,
              elegant: <CurrentServerSwitcherMenuComparison className="h-[251px]" />,
              elegantDark: <CurrentServerSwitcherMenuComparison className="h-[251px]" />,
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
        </div>
      </DocSection>
    </DocPage>
  );
}
