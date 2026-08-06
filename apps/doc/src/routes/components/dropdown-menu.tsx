import { createFileRoute } from "@tanstack/react-router";
import {
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
  Switch,
} from "raft-ui";
import {
  Bell,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CreditCard,
  LogOut,
  Monitor,
  MoonStar,
  Sun,
  Trash,
  User,
} from "lucide-react";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

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
    <DropdownMenuItem className="text-danger hover:bg-danger-soft hover:text-danger data-[highlighted]:bg-danger-soft data-[highlighted]:text-danger [&>svg]:text-danger hover:[&>svg]:text-danger data-[highlighted]:[&>svg]:text-danger">
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
  anatomy: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger,
} from "raft-ui";

<DropdownMenu>
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
      <DropdownMenuItem className="text-danger hover:bg-danger-soft hover:text-danger data-[highlighted]:bg-danger-soft data-[highlighted]:text-danger [&>svg]:text-danger hover:[&>svg]:text-danger data-[highlighted]:[&>svg]:text-danger">
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
  return (
    <div className="relative flex justify-center">
      <DropdownMenu open modal={false} triggerId={triggerId}>
        <DropdownMenuTrigger id={triggerId}>{label}</DropdownMenuTrigger>
        <DropdownMenuContent className={contentClassName}>{children}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ProfilePreviewMenu() {
  return (
    <div className="relative flex justify-center">
      <DropdownMenu defaultOpen modal={false} triggerId="preview-profile-trigger">
        <DropdownMenuTrigger id="preview-profile-trigger">
          <ChartNoAxesCombined />
          Profile
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex w-64 flex-col">
          <ProfileMenuRows />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const DROPDOWN_MENU_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.Root.Props",
    description: "Owns open state, focus, Escape, outside press, and menu dismissal.",
  },
];

const DROPDOWN_MENU_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.Trigger.Props",
    description:
      "Button-like trigger. Defaults to an outline md Button; pass render for a custom control.",
  },
];

const DROPDOWN_MENU_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled card shell. Defaults to side=bottom, align=start, sideOffset=4, disableAnchorTracking=false, and positionMethod=fixed.",
  },
];

const DROPDOWN_MENU_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.Item.Props",
    description:
      "Source server-switcher row styling with keyboard highlight. Compose special rows with className.",
  },
];

const DROPDOWN_MENU_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Non-interactive section label composed inside DropdownMenuContent.",
  },
];

const DROPDOWN_MENU_SHORTCUT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Kbd props",
    description: "Right-aligned keyboard hint composed inside DropdownMenuItem.",
  },
];

const DROPDOWN_MENU_ITEM_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Badge props",
    description: "Right-aligned count chip composed from Badge with its default state.",
  },
];

const DROPDOWN_MENU_SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Separator.Props",
    description: "Source server-switcher divider styling as the separator part.",
  },
];

const DROPDOWN_MENU_RADIO_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.RadioGroup.Props",
    description:
      "Groups radio items for single-select behavior. Use value/defaultValue/onValueChange.",
  },
];

const DROPDOWN_MENU_RADIO_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.RadioItem.Props",
    description:
      "Single-select item inside RadioGroup. Uses same item styling as DropdownMenuItem with built-in check indicator. closeOnClick defaults to false.",
  },
];

const DROPDOWN_MENU_RADIO_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.RadioItemIndicator.Props",
    description:
      "Lower-level indicator for custom composition. Renders children only when the parent radio item is selected.",
  },
];

const DROPDOWN_MENU_CHECKBOX_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.CheckboxItem.Props",
    description:
      "Independent toggle item. Uses same item styling as DropdownMenuItem with built-in check indicator. closeOnClick defaults to false.",
  },
];

const DROPDOWN_MENU_CHECKBOX_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.CheckboxItemIndicator.Props",
    description:
      "Lower-level indicator for custom composition (e.g. switch visuals). Renders children only when the parent checkbox item is checked. Use keepMounted to preserve layout when unchecked.",
  },
];

const DROPDOWN_MENU_SUBMENU_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.SubmenuRoot.Props",
    description: "Nested menu root for secondary action groups.",
  },
];

const DROPDOWN_MENU_SUBMENU_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Menu.SubmenuTrigger.Props",
    description: "Item-like trigger that opens a nested DropdownMenuContent.",
  },
];

export const Route = createFileRoute("/components/dropdown-menu")({
  component: DropdownMenuDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
      },
    }),
});

function DropdownMenuDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="DropdownMenu"
      description="A trigger-driven menu family built on Base UI Menu for account, action, and nested command surfaces."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Preview models a profile menu. Icons, trailing chevrons, shortcuts, counters, and selected
          state indicators are composed as children so product code can choose its own visual
          language without a dedicated icon prop.
        </p>
        <Preview previewClassName="min-h-[30rem] items-start pt-24">
          <Preview.Canvas>
            <ProfilePreviewMenu />
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="submenu" title="Submenu">
            <Preview previewClassName="min-h-[18rem] items-start pt-28">
              <Preview.Canvas>
                <OpenMenuExample triggerId="submenu-trigger" label="Submenu">
                  <SubmenuRows />
                </OpenMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.submenu} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="radio-group" title="Radio group">
            <Preview previewClassName="min-h-[18rem] items-start pt-28">
              <Preview.Canvas>
                <OpenMenuExample triggerId="radio-group-menu-trigger" label="Radio group">
                  <RadioGroupMenuRows />
                </OpenMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.radioGroupMenu} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="plain-picker" title="Plain picker">
            <Preview previewClassName="min-h-[18rem] items-start pt-28">
              <Preview.Canvas>
                <OpenMenuExample
                  triggerId="plain-picker-trigger"
                  label="Time"
                  contentClassName="flex min-w-[220px] flex-col"
                >
                  <PlainPickerRows />
                </OpenMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.plainPicker} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="headerless-picker" title="Headerless picker">
            <Preview previewClassName="min-h-[18rem] items-start pt-28">
              <Preview.Canvas>
                <OpenMenuExample
                  triggerId="headerless-picker-trigger"
                  label="Sort"
                  contentClassName="flex min-w-[136px] flex-col"
                >
                  <HeaderlessSortRows />
                </OpenMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.headerlessPicker} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="checkboxes" title="Checkboxes">
            <Preview previewClassName="min-h-[18rem] items-start pt-28">
              <Preview.Canvas>
                <OpenMenuExample triggerId="checkboxes-menu-trigger" label="Checkboxes">
                  <CheckboxesMenuRows />
                </OpenMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.checkboxesMenu} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="switch" title="Switch">
            <Preview previewClassName="min-h-[18rem] items-start pt-28">
              <Preview.Canvas>
                <OpenMenuExample triggerId="switch-menu-trigger" label="Switch">
                  <SwitchMenuRows />
                </OpenMenuExample>
              </Preview.Canvas>
              <Preview.Code html={code.switchMenu} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-dropdown-menu" title="DropdownMenu">
            <PropsTable rows={DROPDOWN_MENU_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-dropdown-menu-trigger" title="DropdownMenuTrigger">
            <PropsTable rows={DROPDOWN_MENU_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-dropdown-menu-content" title="DropdownMenuContent">
            <PropsTable rows={DROPDOWN_MENU_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-dropdown-menu-item" title="DropdownMenuItem">
            <PropsTable rows={DROPDOWN_MENU_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-dropdown-menu-label" title="DropdownMenuLabel">
            <PropsTable rows={DROPDOWN_MENU_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-shortcut"
            title="DropdownMenuShortcut"
          >
            <PropsTable rows={DROPDOWN_MENU_SHORTCUT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-item-count"
            title="DropdownMenuItemCount"
          >
            <PropsTable rows={DROPDOWN_MENU_ITEM_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-separator"
            title="DropdownMenuSeparator"
          >
            <PropsTable rows={DROPDOWN_MENU_SEPARATOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-radio-group"
            title="DropdownMenuRadioGroup"
          >
            <PropsTable rows={DROPDOWN_MENU_RADIO_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-radio-item"
            title="DropdownMenuRadioItem"
          >
            <PropsTable rows={DROPDOWN_MENU_RADIO_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-radio-item-indicator"
            title="DropdownMenuRadioItemIndicator"
          >
            <PropsTable rows={DROPDOWN_MENU_RADIO_ITEM_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-checkbox-item"
            title="DropdownMenuCheckboxItem"
          >
            <PropsTable rows={DROPDOWN_MENU_CHECKBOX_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-checkbox-item-indicator"
            title="DropdownMenuCheckboxItemIndicator"
          >
            <PropsTable rows={DROPDOWN_MENU_CHECKBOX_ITEM_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-dropdown-menu-submenu" title="DropdownMenuSubmenu">
            <PropsTable rows={DROPDOWN_MENU_SUBMENU_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-dropdown-menu-submenu-trigger"
            title="DropdownMenuSubmenuTrigger"
          >
            <PropsTable rows={DROPDOWN_MENU_SUBMENU_TRIGGER_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
