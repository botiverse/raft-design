import { useRef, useState, type ReactNode, type RefObject } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  Badge,
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  Checkbox,
  Combobox,
  ComboboxHeader,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxPopup,
  ComboboxSeparator,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Input,
  InlineCode,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label,
  NotificationCenterActionButton,
  NotificationCenterCount,
  NotificationCenterHeader,
  NotificationCenterItem,
  NotificationCenterItemActions,
  NotificationCenterItemBody,
  NotificationCenterItemContent,
  NotificationCenterItemIcon,
  NotificationCenterItemRow,
  NotificationCenterItemTitle,
  NotificationCenterList,
  NotificationCenterScroller,
  NotificationCenterTitle,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  Spinner,
  Status,
  Tabs,
  TabsBackground,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  Textarea,
  TextareaCounter,
  TextareaGroup,
  ThemeProvider,
  type Theme,
} from "@raft/ui";
import {
  IconCircleCheckFill18,
  IconCircleInfoFill18,
  IconCircleWarningFill18,
} from "nucleo-ui-fill-18";
import {
  IconArchive2Outline18,
  IconBellOutline18,
  IconClockOutline18,
  IconCopyOutline18,
  IconCreditCardOutline18,
  IconGearOutline18,
  IconInboxOutline18,
  IconInputSearchOutline18,
  IconMessageOutline18,
  IconPinOutline18,
  IconTrashOutline18,
  IconUserOutline18,
} from "nucleo-ui-outline-18";
import { Plus, Search, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

type ComponentRoute =
  | "/components/button"
  | "/components/checkbox"
  | "/components/combobox"
  | "/components/context-menu"
  | "/components/dropdown-menu"
  | "/components/label"
  | "/components/input"
  | "/components/input-group"
  | "/components/select"
  | "/components/textarea"
  | "/components/avatar"
  | "/components/badge"
  | "/components/inline-code"
  | "/components/status"
  | "/components/spinner"
  | "/components/tabs"
  | "/components/banner"
  | "/components/empty-state"
  | "/components/notification-center"
  | "/components/popover";

type ComponentGridItem = {
  label: string;
  to: ComponentRoute;
  preview: ReactNode;
};

type ThemePreset = {
  id: "brutal" | "elegant";
  label: string;
  family: Theme;
  mode: "light";
};

const THEME_PRESETS = [
  { id: "brutal", label: "brutal", family: "brutal", mode: "light" },
  { id: "elegant", label: "elegant", family: "elegant", mode: "light" },
] as const satisfies readonly ThemePreset[];

const avatarSvg = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const HOME_AVATAR_IMAGES = [
  avatarSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
      <rect width="8" height="8" fill="#27CCF3"/>
      <rect x="1" y="0" width="6" height="1" fill="#141111"/>
      <rect x="0" y="1" width="1" height="3" fill="#141111"/>
      <rect x="2" y="1" width="1" height="3" fill="#141111"/>
      <rect x="5" y="1" width="1" height="3" fill="#141111"/>
      <rect x="7" y="1" width="1" height="3" fill="#141111"/>
      <rect x="3" y="1" width="2" height="2" fill="#FFFFFF"/>
      <rect x="1" y="2" width="1" height="1" fill="#FFFFFF"/>
      <rect x="6" y="2" width="1" height="1" fill="#FFFFFF"/>
      <rect x="1" y="3" width="1" height="5" fill="#141111"/>
      <rect x="3" y="3" width="2" height="3" fill="#141111"/>
      <rect x="6" y="3" width="1" height="5" fill="#141111"/>
      <rect x="2" y="4" width="1" height="1" fill="#FFFFFF"/>
      <rect x="5" y="4" width="1" height="1" fill="#FFFFFF"/>
      <rect x="2" y="5" width="1" height="3" fill="#141111"/>
      <rect x="5" y="5" width="1" height="3" fill="#141111"/>
    </svg>
  `),
  avatarSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="18" y1="10" x2="142" y2="150" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ffe2f2"/>
          <stop offset="1" stop-color="#9fd7ff"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" fill="url(#g)"/>
      <path d="M35 154c9-35 32-52 45-52s36 17 45 52" fill="#3f2b7b"/>
      <circle cx="80" cy="70" r="34" fill="#ffd9bd"/>
      <path d="M45 68c0-27 16-45 39-45 19 0 34 13 37 34-20-1-37-10-52-25-7 18-16 28-24 36Z" fill="#251523"/>
      <circle cx="67" cy="72" r="4" fill="#24161c"/>
      <circle cx="94" cy="72" r="4" fill="#24161c"/>
      <path d="M70 90c7 7 14 7 21 0" fill="none" stroke="#24161c" stroke-width="5" stroke-linecap="round"/>
    </svg>
  `),
  avatarSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#ffd84d"/>
      <circle cx="80" cy="76" r="50" fill="#0b101b"/>
      <circle cx="80" cy="79" r="37" fill="#ffbf8c"/>
      <path d="M43 75c5-31 23-48 49-48 15 8 24 22 27 42-23-3-43-13-59-31-2 16-8 28-17 37Z" fill="#0b101b"/>
      <circle cx="67" cy="80" r="4" fill="#0b101b"/>
      <circle cx="94" cy="80" r="4" fill="#0b101b"/>
      <path d="M71 98c6 5 13 5 19 0" fill="none" stroke="#0b101b" stroke-width="5" stroke-linecap="round"/>
      <path d="M31 160c8-31 30-48 49-48s41 17 49 48" fill="#ffffff"/>
    </svg>
  `),
  avatarSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="12" y1="148" x2="148" y2="12" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0f766e"/>
          <stop offset="1" stop-color="#c4f55f"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" fill="url(#g)"/>
      <rect x="33" y="36" width="94" height="94" rx="30" fill="#eef8d8"/>
      <rect x="48" y="58" width="24" height="24" rx="8" fill="#0f2924"/>
      <rect x="88" y="58" width="24" height="24" rx="8" fill="#0f2924"/>
      <path d="M59 101c12 10 30 10 42 0" fill="none" stroke="#0f2924" stroke-width="9" stroke-linecap="round"/>
      <path d="M34 55c15-23 33-34 54-34 25 0 40 17 44 48-31-2-55-13-72-35-5 9-14 16-26 21Z" fill="#0f2924"/>
    </svg>
  `),
] as const;

const COMPONENT_GRID = [
  {
    label: "Button",
    to: "/components/button",
    preview: (
      <div className="grid justify-items-center gap-2">
        <Button variant="default" size="sm">
          Filter
        </Button>
        <Button variant="primary" size="sm">
          <Plus data-icon="inline-start" />
          New
        </Button>
        <Button variant="outline" size="sm">
          Details
        </Button>
        <Button variant="danger" size="sm">
          <Trash2 data-icon="inline-start" />
          Delete thread
        </Button>
      </div>
    ),
  },
  {
    label: "Checkbox",
    to: "/components/checkbox",
    preview: (
      <div className="grid grid-cols-2 gap-3">
        <Checkbox defaultChecked aria-label="Checked checkbox" />
        <Checkbox aria-label="Unchecked checkbox" />
        <Checkbox indeterminate aria-label="Indeterminate checkbox" />
        <Checkbox defaultChecked variant="primary" aria-label="Primary checked checkbox" />
      </div>
    ),
  },
  {
    label: "DropdownMenu",
    to: "/components/dropdown-menu",
    preview: <DropdownMenuPreview />,
  },
  {
    label: "ContextMenu",
    to: "/components/context-menu",
    preview: <ContextMenuPreview />,
  },
  {
    label: "Popover",
    to: "/components/popover",
    preview: <PopoverPreview />,
  },
  {
    label: "Label",
    to: "/components/label",
    preview: (
      <div className="grid w-64 gap-3">
        <Label htmlFor="home-label-email">Email address</Label>
        <Label htmlFor="home-label-required">
          Workspace
          <Label.Asterisk />
        </Label>
        <Label htmlFor="home-label-optional">
          Middle name
          <Label.Sub>(optional)</Label.Sub>
        </Label>
        <Label htmlFor="home-label-project-url">
          Project URL
          <IconCircleInfoFill18 aria-hidden className="size-3.5 text-foreground/40" />
        </Label>
      </div>
    ),
  },
  {
    label: "Input",
    to: "/components/input",
    preview: (
      <div className="grid w-64 gap-2">
        <Input aria-label="Email" placeholder="you@example.com" />
        <Input aria-label="Workspace" defaultValue="raft-design" />
        <Input aria-label="Invalid email" aria-invalid defaultValue="oops" />
      </div>
    ),
  },
  {
    label: "InputGroup",
    to: "/components/input-group",
    preview: (
      <div className="grid w-64 gap-2">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search" placeholder="Search..." />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon.Text variant="container">$</InputGroupAddon.Text>
          <InputGroupInput aria-label="Amount" placeholder="0.00" inputMode="decimal" />
          <InputGroupAddon.Text align="inline-end" variant="container">
            USD
          </InputGroupAddon.Text>
        </InputGroup>
      </div>
    ),
  },
  {
    label: "Combobox",
    to: "/components/combobox",
    preview: <ComboboxPreview />,
  },
  {
    label: "Select",
    to: "/components/select",
    preview: <SelectPreview />,
  },
  {
    label: "Textarea",
    to: "/components/textarea",
    preview: (
      <div className="grid w-64 gap-2">
        <TextareaGroup>
          <Textarea
            aria-label="Message"
            rows={4}
            defaultValue="Draft the release note."
            className="resize-none"
          />
          <TextareaCounter value="Draft the release note." limit={120} />
        </TextareaGroup>
      </div>
    ),
  },
  {
    label: "Badge",
    to: "/components/badge",
    preview: (
      <div className="grid justify-items-center gap-2">
        <div className="flex max-w-64 flex-wrap items-center justify-center gap-2">
          <Badge>Saved</Badge>
          <Badge variant="accent">New</Badge>
          <Badge variant="success">Live</Badge>
          <Badge variant="danger">Failed</Badge>
        </div>
        <div className="flex max-w-64 flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">
            <IconCircleCheckFill18 className="size-3" />
            Approved
          </Badge>
          <Badge appearance="outline" variant="success">
            <Status size="xs" variant="success" />
            Online
          </Badge>
          <Badge appearance="outline" variant="information">
            task #42 @bugen
          </Badge>
        </div>
      </div>
    ),
  },
  {
    label: "Avatar",
    to: "/components/avatar",
    preview: (
      <div className="grid justify-items-center gap-5">
        <AvatarGroup>
          {HOME_AVATAR_IMAGES.slice(0, 3).map((src, index) => (
            <Avatar key={src} size="sm" type={index === 1 ? "human" : "agent"}>
              <AvatarImage src={src} alt="" />
              <AvatarFallback />
            </Avatar>
          ))}
          <AvatarGroupCount size="sm">+3</AvatarGroupCount>
        </AvatarGroup>
        <div className="flex items-end gap-4">
          <Avatar size="lg" type="agent">
            <AvatarImage src={HOME_AVATAR_IMAGES[0]} alt="" />
            <AvatarFallback />
            <AvatarBadge />
          </Avatar>
          <Avatar size="lg" type="human">
            <AvatarFallback />
            <AvatarBadge className="bg-info-base" />
          </Avatar>
        </div>
      </div>
    ),
  },
  {
    label: "InlineCode",
    to: "/components/inline-code",
    preview: (
      <div className="flex max-w-72 flex-wrap items-center justify-center gap-2 text-sm leading-6 text-foreground-muted">
        <span>Set</span>
        <InlineCode>aria-invalid</InlineCode>
        <span>with</span>
        <InlineCode>disabled</InlineCode>
        <span>state.</span>
      </div>
    ),
  },
  {
    label: "Status",
    to: "/components/status",
    preview: (
      <div className="flex items-center gap-4">
        <Status variant="success" pulse aria-label="Online" />
        <Status variant="primary" aria-label="Queued" />
        <Status variant="accent" aria-label="Unread" />
      </div>
    ),
  },
  {
    label: "Spinner",
    to: "/components/spinner",
    preview: (
      <div className="grid justify-items-center gap-4">
        <div className="flex items-center gap-4">
          <Spinner />
          <Spinner size="lg" />
        </div>
        <Button loading>Loading</Button>
        <Badge variant="primary">
          <Spinner data-icon="inline-start" />
          Syncing
        </Badge>
      </div>
    ),
  },
  {
    label: "Banner",
    to: "/components/banner",
    preview: (
      <div className="grid w-72 gap-3">
        <Banner status="warning" size="sm">
          <IconCircleWarningFill18 />
          <BannerTitle>Review required</BannerTitle>
          <BannerDescription>Check billing details.</BannerDescription>
          <BannerAction>
            <Button variant="outline" size="xs">
              Review
            </Button>
          </BannerAction>
        </Banner>
        <Banner status="success" size="sm">
          <IconCircleCheckFill18 />
          <BannerDescription>Deployment is live.</BannerDescription>
        </Banner>
      </div>
    ),
  },
  {
    label: "EmptyState",
    to: "/components/empty-state",
    preview: (
      <EmptyState className="min-h-56 w-72 px-4 py-8">
        <EmptyStateContent>
          <EmptyStateIcon>
            <IconInboxOutline18 />
          </EmptyStateIcon>
          <EmptyStateTitle>No messages yet</EmptyStateTitle>
          <EmptyStateDescription>Conversations you start will show up here.</EmptyStateDescription>
        </EmptyStateContent>
      </EmptyState>
    ),
  },
  {
    label: "NotificationCenter",
    to: "/components/notification-center",
    preview: <NotificationCenterPreview />,
  },
  {
    label: "Tabs",
    to: "/components/tabs",
    preview: (
      <div className="grid justify-items-center gap-8">
        <Tabs defaultValue="overview" className="flex justify-center overflow-visible">
          <TabsList>
            <TabsBackground />
            <TabsTab value="overview">
              <IconMessageOutline18 />
              <TabsLabel>Overview</TabsLabel>
            </TabsTab>
            <TabsTab value="billing">
              <IconCreditCardOutline18 />
              <TabsLabel>Billing</TabsLabel>
            </TabsTab>
            <TabsTab value="settings">
              <IconGearOutline18 />
              <TabsLabel>Settings</TabsLabel>
            </TabsTab>
          </TabsList>
          <TabsPanel value="overview" className="sr-only">
            Overview
          </TabsPanel>
          <TabsPanel value="billing" className="sr-only">
            Billing
          </TabsPanel>
          <TabsPanel value="settings" className="sr-only">
            Settings
          </TabsPanel>
        </Tabs>
        <Tabs defaultValue="messages" className="flex justify-center overflow-visible">
          <TabsList variant="underline">
            <TabsTab value="messages" aria-label="Messages">
              <IconMessageOutline18 />
            </TabsTab>
            <TabsTab value="alerts" aria-label="Alerts">
              <IconBellOutline18 />
            </TabsTab>
            <TabsTab value="settings" aria-label="Settings">
              <IconGearOutline18 />
            </TabsTab>
          </TabsList>
          <TabsPanel value="messages" className="sr-only">
            Messages
          </TabsPanel>
          <TabsPanel value="alerts" className="sr-only">
            Alerts
          </TabsPanel>
          <TabsPanel value="settings" className="sr-only">
            Settings
          </TabsPanel>
        </Tabs>
      </div>
    ),
  },
] as const satisfies readonly ComponentGridItem[];

const SELECT_PREVIEW_OPTIONS = [
  { value: "relevance", label: "Relevance", icon: IconInputSearchOutline18 },
  { value: "recent", label: "Most recent", icon: IconClockOutline18 },
  { value: "comments", label: "Most commented", icon: IconMessageOutline18 },
] as const;

const HOME_COMBOBOX_OPTIONS = [
  { id: "design", label: "#design", description: "Component reviews" },
  { id: "runtime", label: "#runtime", description: "Agent health" },
  { id: "release", label: "#release", description: "Ship notes" },
] as const;

type HomeComboboxOption = (typeof HOME_COMBOBOX_OPTIONS)[number];

function ComboboxPreview() {
  const [selectedChannel, setSelectedChannel] = useState<HomeComboboxOption | null>(
    HOME_COMBOBOX_OPTIONS[0],
  );

  return (
    <div className="flex h-64 w-72 items-center justify-center">
      <Combobox<HomeComboboxOption>
        autoHighlight
        items={HOME_COMBOBOX_OPTIONS}
        isItemEqualToValue={(item, value) => item.id === value.id}
        itemToStringLabel={(channel) => channel.label}
        value={selectedChannel}
        onValueChange={setSelectedChannel}
      >
        <ComboboxPopup className="w-[240px]">
          <ComboboxHeader>
            <ComboboxLabel>Channels</ComboboxLabel>
          </ComboboxHeader>
          <ComboboxSeparator />
          <ComboboxInputGroup>
            <ComboboxInput
              aria-label="Search channels"
              placeholder="Search..."
              suppressPasswordManager
            />
          </ComboboxInputGroup>
          <ComboboxList>
            {(channel: HomeComboboxOption) => (
              <ComboboxItem key={channel.id} value={channel}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex size-4 shrink-0 items-center justify-center text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/60">
                    #
                  </span>
                  <span className="grid min-w-0">
                    <span className="truncate leading-5">{channel.label}</span>
                    <span className="truncate text-[11px] leading-4 text-foreground-placeholder [[data-theme=brutal]_&]:text-black/50">
                      {channel.description}
                    </span>
                  </span>
                </span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxPopup>
      </Combobox>
    </div>
  );
}

function SelectPreview() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  return (
    <div ref={portalRef} className="relative flex h-56 w-72 items-start justify-center pt-14">
      <Select
        open={open}
        onOpenChange={setOpen}
        defaultValue="relevance"
        items={SELECT_PREVIEW_OPTIONS}
        modal={false}
      >
        <SelectTrigger>
          <SelectValue>
            {(selectedValue) => {
              const selected = SELECT_PREVIEW_OPTIONS.find(
                (option) => option.value === selectedValue,
              );
              const Icon = selected?.icon;

              return selected && Icon ? (
                <span className="flex min-w-0 items-center gap-2">
                  <Icon aria-hidden className="size-3.5 shrink-0 stroke-[1.5] opacity-80" />
                  <span className="truncate">{selected.label}</span>
                </span>
              ) : (
                "Sort"
              );
            }}
          </SelectValue>
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
        >
          <SelectList>
            {SELECT_PREVIEW_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <SelectItem key={option.value} value={option.value}>
                  <Icon aria-hidden className="size-3.5 shrink-0 stroke-[1.5] opacity-80" />
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              );
            })}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}

function DropdownMenuPreview() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  return (
    <div ref={portalRef} className="relative flex h-64 w-72 items-start justify-center pt-12">
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false} triggerId="home-menu-trigger">
        <DropdownMenuTrigger id="home-menu-trigger" render={<Button variant="outline" size="md" />}>
          <IconUserOutline18 aria-hidden />
          Account
        </DropdownMenuTrigger>
        <DropdownMenuContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="flex w-64 flex-col"
        >
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
            <IconGearOutline18 />
            <span className="min-w-0 flex-1 truncate">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ContextMenuPreview() {
  const portalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [hasCursorAnchor, setHasCursorAnchor] = useState(false);
  const anchor = {
    getBoundingClientRect() {
      const rect = triggerRef.current?.getBoundingClientRect();
      return DOMRect.fromRect({
        x: rect?.right ?? 0,
        y: rect?.bottom ?? 0,
        width: 0,
        height: 0,
      });
    },
  };

  return (
    <div ref={portalRef} className="relative flex h-64 w-72 items-start justify-center pt-9">
      <ContextMenu open={open} onOpenChange={setOpen}>
        <div ref={triggerRef} onContextMenuCapture={() => setHasCursorAnchor(true)}>
          <ContextMenuTrigger
            className={[
              "flex min-h-14 w-56 items-center justify-center px-4 text-center",
              "bg-[oklch(0.955_0.003_286)] text-sm font-medium text-[oklch(0.32_0.006_286)]",
              "[[data-theme=brutal]_&]:font-sans [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:font-bold",
            ].join(" ")}
            onClick={() => {
              setHasCursorAnchor(false);
              setOpen((currentOpen) => !currentOpen);
            }}
          >
            Right click thread
          </ContextMenuTrigger>
        </div>
        <ContextMenuContent
          anchor={hasCursorAnchor ? undefined : anchor}
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="flex w-60 min-w-60 flex-col"
        >
          <ContextMenuLabel>Thread actions</ContextMenuLabel>
          <ContextMenuItem>
            <IconPinOutline18 />
            <span className="min-w-0 flex-1 truncate">Pin thread</span>
          </ContextMenuItem>
          <ContextMenuItem>
            <IconCopyOutline18 />
            <span className="min-w-0 flex-1 truncate">Copy link</span>
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <IconArchive2Outline18 />
            <span className="min-w-0 flex-1 truncate">Archive</span>
          </ContextMenuItem>
          <ContextMenuItem>
            <IconTrashOutline18 />
            <span className="min-w-0 flex-1 truncate">Delete</span>
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

function PopoverPreview() {
  const portalRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  return (
    <div ref={portalRef} className="relative flex h-64 w-72 items-start justify-center pt-12">
      <Popover open={open} onOpenChange={setOpen} modal={false} triggerId="home-popover-trigger">
        <PopoverTrigger id="home-popover-trigger" render={<Button variant="outline" size="md" />}>
          <IconCircleInfoFill18 aria-hidden />
          Usage notes
        </PopoverTrigger>
        <PopoverContent
          initialFocus={false}
          finalFocus={false}
          align="center"
          collisionAvoidance={{ side: "none", align: "none", fallbackAxisSide: "none" }}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[248px]"
        >
          <PopoverHeader>
            <PopoverTitle>Search guide</PopoverTitle>
            <PopoverClose>Close</PopoverClose>
          </PopoverHeader>
          <PopoverSeparator />
          <div className="grid gap-3 px-3 py-3">
            <PopoverDescription>
              Mix channels, people, and quoted phrases to narrow message history.
            </PopoverDescription>
            <div className="grid gap-1 rounded-sm bg-foreground/[0.04] px-2 py-2 font-mono text-xs text-foreground/60 [[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border [[data-theme=brutal]_&]:border-black/10 [[data-theme=brutal]_&]:bg-brutal-yellow/20 [[data-theme=brutal]_&]:text-black/70">
              <span className="truncate">#design "token audit"</span>
              <span className="truncate">@atlas migration notes</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function NotificationCenterPreview() {
  return (
    <div className="grid h-72 w-72 max-w-full justify-items-center gap-3 pt-5">
      <div className="relative size-9">
        <Button
          type="button"
          variant="outline"
          size="icon-md"
          className="size-9 p-0"
          aria-label="Notifications"
        >
          <IconBellOutline18 aria-hidden />
        </Button>
        <Status
          aria-hidden
          variant="primary"
          size="md"
          className="pointer-events-none absolute -top-1 -right-1"
        />
      </div>
      <div
        data-slot="notification-center-popup"
        className={[
          "flex h-56 w-72 flex-col overflow-hidden rounded-md bg-layer-popover",
          "shadow-[0_1px_1px_oklch(0.21_0.006_285_/_0.10),0_0_0_1px_oklch(0.21_0.006_285_/_0.04),0_2px_12px_-4px_oklch(0.21_0.006_285_/_0.16)]",
          "[[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-white [[data-theme=brutal]_&]:shadow-[var(--shadow-hover,4px_4px_0px_var(--color-black))]",
        ].join(" ")}
      >
        <NotificationCenterHeader>
          <NotificationCenterTitle>Notifications</NotificationCenterTitle>
          <NotificationCenterCount>2 items</NotificationCenterCount>
        </NotificationCenterHeader>
        <NotificationCenterScroller>
          <NotificationCenterList>
            <NotificationCenterItem>
              <NotificationCenterItemRow>
                <NotificationCenterItemIcon status="warning" />
                <NotificationCenterItemContent>
                  <NotificationCenterItemTitle>Runtime stalled</NotificationCenterItemTitle>
                  <NotificationCenterItemBody>
                    Atlas has not reported activity for 15 minutes.
                  </NotificationCenterItemBody>
                  <NotificationCenterItemActions>
                    <NotificationCenterActionButton variant="primary">
                      View
                    </NotificationCenterActionButton>
                    <NotificationCenterActionButton>Dismiss</NotificationCenterActionButton>
                  </NotificationCenterItemActions>
                </NotificationCenterItemContent>
              </NotificationCenterItemRow>
            </NotificationCenterItem>
            <NotificationCenterItem read>
              <NotificationCenterItemRow>
                <NotificationCenterItemIcon status="success" />
                <NotificationCenterItemContent>
                  <NotificationCenterItemTitle>Deploy completed</NotificationCenterItemTitle>
                  <NotificationCenterItemBody>
                    raft-ui shipped to production.
                  </NotificationCenterItemBody>
                </NotificationCenterItemContent>
              </NotificationCenterItemRow>
            </NotificationCenterItem>
          </NotificationCenterList>
        </NotificationCenterScroller>
      </div>
    </div>
  );
}

function Home() {
  const [themePreset, setThemePreset] = useState<ThemePreset>(THEME_PRESETS[1]);

  return (
    <ThemeProvider theme={themePreset.family}>
      <div
        data-theme={themePreset.family}
        className="min-h-screen bg-background pb-28 text-foreground"
        style={{ colorScheme: themePreset.mode }}
      >
        <div className="grid grid-cols-1 border-l border-line-subtle bg-background sm:grid-cols-2 xl:grid-cols-4">
          {COMPONENT_GRID.map((item) => (
            <article
              key={item.label}
              className={[
                "relative isolate h-[420px] overflow-hidden",
                "border-b border-r border-line-subtle bg-background",
              ].join(" ")}
            >
              <Link
                to={item.to}
                aria-label={`Open ${item.label} details`}
                className="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              />
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-8 py-10">
                <div className="pointer-events-auto flex max-w-full items-center justify-center">
                  {item.preview}
                </div>
              </div>
              <h2 className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-xs font-medium text-foreground-placeholder">
                {item.label}
              </h2>
            </article>
          ))}
        </div>

        <fieldset
          aria-label="Preview theme"
          className={[
            "fixed bottom-6 left-[calc(50vw+var(--rail-w)/2)] z-20 -translate-x-1/2",
            "grid grid-cols-2 overflow-hidden rounded-none bg-layer-panel text-foreground backdrop-blur",
            "shadow-[0_0_0_0.5px_oklch(0_0_0_/_0.22)]",
          ].join(" ")}
        >
          {THEME_PRESETS.map((preset) => {
            const isActive = themePreset.id === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isActive}
                className={[
                  "h-9 min-w-20 px-4 text-xs font-medium outline-none transition-colors",
                  "border-l border-line-subtle first:border-l-0",
                  "hover:bg-layer-muted hover:text-foreground-strong",
                  "focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isActive
                    ? "bg-layer-muted text-foreground-strong"
                    : "text-foreground-placeholder",
                ].join(" ")}
                onClick={() => setThemePreset(preset)}
              >
                {preset.label}
              </button>
            );
          })}
        </fieldset>
      </div>
    </ThemeProvider>
  );
}
