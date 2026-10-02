import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ContextMenu,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuShortcut,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
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
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  InlineCode,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
  KbdGroup,
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
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardSeparator,
  PreviewCardTitle,
  PreviewCardTrigger,
  RadioGroup,
  RadioGroupItem,
  Separator,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
  Spinner,
  Status,
  Switch,
  Tabs,
  TabsBackground,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
  Textarea,
  TextareaCounter,
  TextareaGroup,
  ThemeProvider,
  createToastManager,
  ToastAction,
  ToastActions,
  ToastBody,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastIcon,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  useToastManager,
} from "raft-ui";
import type { Theme } from "raft-ui";
import {
  Archive,
  AtSign,
  Bell,
  CircleAlert,
  CircleCheck,
  Clock,
  Columns3,
  Copy,
  CreditCard,
  Inbox,
  Info,
  List,
  MessageSquare,
  Pin,
  Plus,
  Search,
  Settings,
  SmilePlus,
  Sparkles,
  Trash,
  Trash2,
  User,
} from "lucide-react";

import { ComboboxPreviewComposition } from "#/modules/combobox-select/compositions/preview.composition.tsx";

import { usePreviewTheme, useResolvedPreviewMode } from "#/components/preview-theme.tsx";

export const Route = createFileRoute("/")({
  component: Home,
});

type ComponentRoute =
  | "/components/button"
  | "/components/checkbox"
  | "/components/combobox"
  | "/components/combobox-select"
  | "/components/context-menu"
  | "/components/copyable-code"
  | "/components/dropdown-menu"
  | "/components/field"
  | "/components/label"
  | "/components/input"
  | "/components/input-group"
  | "/components/radio-group"
  | "/components/select"
  | "/components/segmented-control"
  | "/components/switch"
  | "/components/textarea"
  | "/components/avatar"
  | "/components/badge"
  | "/components/inline-code"
  | "/components/kbd"
  | "/components/tooltip"
  | "/components/status"
  | "/components/skeleton"
  | "/components/spinner"
  | "/components/separator"
  | "/components/tabs"
  | "/components/text"
  | "/components/banner"
  | "/components/empty-state"
  | "/components/notification-center"
  | "/components/toast"
  | "/components/popover"
  | "/components/preview-card"
  | "/components/dialog"
  | "/components/alert-dialog";

type ComponentGridItem = {
  label: string;
  to: ComponentRoute;
  preview: ReactNode;
};

type ThemePreset = {
  id: "brutal" | "elegant" | "elegant-dark";
  label: string;
  family: Theme;
  mode: "light" | "dark";
};

// Title Case, matching the other two theme switchers (theme-switcher.tsx and
// playground-theme-select.tsx). These were lower case while the home switcher
// was hand-rolled buttons and looked nothing like the others, so the casing
// difference read as a different control. rui#271 put all three on the same
// SegmentedControl, and with identical geometry the only remaining difference
// was the copy — same control, same three options, two spellings (@Artea).
const THEME_PRESETS = [
  { id: "brutal", label: "Brutal", family: "brutal", mode: "light" },
  { id: "elegant", label: "Elegant", family: "elegant", mode: "light" },
  { id: "elegant-dark", label: "Elegant dark", family: "elegant", mode: "dark" },
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
    label: "Switch",
    to: "/components/switch",
    preview: (
      <div className="grid gap-3">
        <div className="flex w-56 items-center justify-between gap-4 text-sm font-medium">
          Desktop notifications
          <Switch defaultChecked aria-label="Desktop notifications" />
        </div>
        <div className="flex w-56 items-center justify-between gap-4 text-sm font-medium text-foreground-muted">
          Marketing updates
          <Switch aria-label="Marketing updates" />
        </div>
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
    label: "Tooltip",
    to: "/components/tooltip",
    preview: <TooltipPreview />,
  },
  {
    label: "Popover",
    to: "/components/popover",
    preview: <PopoverPreview />,
  },
  {
    label: "PreviewCard",
    to: "/components/preview-card",
    preview: <PreviewCardPreview />,
  },
  {
    label: "Dialog",
    to: "/components/dialog",
    preview: <DialogPreview />,
  },
  {
    label: "AlertDialog",
    to: "/components/alert-dialog",
    preview: <AlertDialogPreview />,
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
          <Info aria-hidden className="size-3.5 text-foreground-strong/40" />
        </Label>
      </div>
    ),
  },
  {
    label: "Field",
    to: "/components/field",
    preview: (
      <div className="grid w-64 gap-3">
        <Field>
          <FieldLabel htmlFor="home-field-workspace" required>
            Workspace
          </FieldLabel>
          <Input id="home-field-workspace" defaultValue="raft-design" />
          <FieldDescription>Visible in the project switcher.</FieldDescription>
        </Field>
        <Field invalid>
          <FieldLabel htmlFor="home-field-email">Email</FieldLabel>
          <Input id="home-field-email" data-invalid defaultValue="oops" />
          <FieldError match>Email is required.</FieldError>
        </Field>
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
        <Input aria-label="Invalid email" data-invalid defaultValue="oops" />
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
    label: "ComboboxSelect",
    to: "/components/combobox-select",
    preview: <ComboboxSelectPreview />,
  },
  {
    label: "Select",
    to: "/components/select",
    preview: <SelectPreview />,
  },
  {
    label: "RadioGroup",
    to: "/components/radio-group",
    preview: (
      <RadioGroup defaultValue="restart" aria-label="Restart mode" className="w-fit">
        <label className="flex items-center gap-3 text-sm">
          <RadioGroupItem value="restart" />
          Restart
        </label>
        <label className="flex items-center gap-3 text-sm">
          <RadioGroupItem value="session" />
          Reset session
        </label>
        <label className="flex items-center gap-3 text-sm">
          <RadioGroupItem value="full" />
          Full reset
        </label>
      </RadioGroup>
    ),
  },
  {
    label: "SegmentedControl",
    to: "/components/segmented-control",
    preview: <SegmentedControlPreview />,
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
            <CircleCheck className="size-3" />
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
            <AvatarBadge className="bg-info" />
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
        <InlineCode>data-invalid</InlineCode>
        <span>with</span>
        <InlineCode>disabled</InlineCode>
        <span>state.</span>
      </div>
    ),
  },
  {
    label: "CopyableCode",
    to: "/components/copyable-code",
    preview: (
      <div className="grid w-72 gap-3">
        <CopyableCodeRoot size="sm">
          <CopyableCode truncate>
            npx @botiverse/raft-daemon@latest --server-url https://api.raft.build
          </CopyableCode>
          <CopyableCodeAction aria-label="Copy daemon command" />
        </CopyableCodeRoot>
      </div>
    ),
  },
  {
    label: "Kbd",
    to: "/components/kbd",
    preview: (
      <div className="grid w-64 justify-items-center gap-4">
        <div className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium">
          <span className="min-w-0 flex-1 truncate">Copy link</span>
          <Kbd>⌘C</Kbd>
        </div>
        <InputGroup>
          <InputGroupAddon>
            <Search aria-hidden />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search messages" placeholder="Search messages" />
          <InputGroupAddon align="inline-end">
            <Kbd>Cmd K</Kbd>
          </InputGroupAddon>
        </InputGroup>
        <div className="flex items-center gap-3 text-sm font-medium">
          <span>Command menu</span>
          <KbdGroup aria-label="Command K">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </div>
      </div>
    ),
  },
  {
    label: "Text",
    to: "/components/text",
    preview: (
      <div className="grid w-64 gap-2">
        <Text.Heading level={5}>Workspace updates</Text.Heading>
        <Text.Sans size="small" variant="muted">
          3 unread messages
        </Text.Sans>
        <Text.Mono size="meta">raft-ui@0.0.1</Text.Mono>
        <Text.Sans size="small" variant="success">
          Ready for review
        </Text.Sans>
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
    label: "Skeleton",
    to: "/components/skeleton",
    preview: (
      <div className="grid w-64 gap-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" className="size-9 shrink-0" />
          <div className="grid min-w-0 flex-1 gap-2">
            <Skeleton variant="line" className="w-28" />
            <Skeleton variant="line" className="w-40" />
          </div>
        </div>
        <div className="grid gap-2">
          <Skeleton variant="block" className="h-10 w-full" />
          <Skeleton variant="line" className="w-3/4" />
        </div>
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
    label: "Separator",
    to: "/components/separator",
    preview: (
      <div className="grid w-64 gap-5">
        <div className="grid gap-3">
          <Text.Sans size="small" className="font-medium">
            Channel details
          </Text.Sans>
          <Separator />
          <Text.Sans size="small" variant="muted">
            Shared dividers for panels, menus, and form breaks.
          </Text.Sans>
        </div>
        <div className="flex h-14 items-stretch justify-center gap-5">
          <Separator orientation="vertical" />
          <Separator orientation="vertical" />
          <Separator orientation="vertical" />
        </div>
      </div>
    ),
  },
  {
    label: "Banner",
    to: "/components/banner",
    preview: (
      <div className="grid w-72 gap-3">
        <Banner status="warning" size="sm">
          <CircleAlert />
          <BannerTitle>Review required</BannerTitle>
          <BannerDescription>Check billing details.</BannerDescription>
          <BannerAction>
            <Button variant="outline" size="xs">
              Review
            </Button>
          </BannerAction>
        </Banner>
        <Banner status="success" size="sm">
          <CircleCheck />
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
            <Inbox />
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
    label: "Toast",
    to: "/components/toast",
    preview: <ToastPreview />,
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
              <MessageSquare />
              <TabsLabel>Overview</TabsLabel>
            </TabsTab>
            <TabsTab value="billing">
              <CreditCard />
              <TabsLabel>Billing</TabsLabel>
            </TabsTab>
            <TabsTab value="settings">
              <Settings />
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
              <MessageSquare />
            </TabsTab>
            <TabsTab value="alerts" aria-label="Alerts">
              <Bell />
            </TabsTab>
            <TabsTab value="settings" aria-label="Settings">
              <Settings />
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
  { value: "relevance", label: "Relevance", icon: Search },
  { value: "recent", label: "Most recent", icon: Clock },
  { value: "comments", label: "Most commented", icon: MessageSquare },
] as const;

const HOME_COMBOBOX_OPTIONS = [
  { id: "reasoning", label: "Raft Reasoning", description: "Long-context planning" },
  { id: "fast", label: "Raft Fast", description: "Low-latency responses" },
  { id: "code", label: "Raft Code", description: "Repository-aware coding" },
] as const;

type HomeComboboxOption = (typeof HOME_COMBOBOX_OPTIONS)[number];

const NO_COLLISION_AVOIDANCE = { side: "none", align: "none", fallbackAxisSide: "none" } as const;

function isSameComboboxOption(item: HomeComboboxOption, value: HomeComboboxOption) {
  return item.id === value.id;
}

function getComboboxOptionLabel(option: HomeComboboxOption) {
  return option.label;
}

function usePreviewPortal() {
  const portalRef = useRef<HTMLDivElement>(null);
  const portalProps = useMemo(
    () => ({ container: portalRef as RefObject<HTMLElement | null> }),
    [],
  );

  return { portalRef, portalProps };
}

function ComboboxPreview() {
  const { portalRef, portalProps } = usePreviewPortal();
  const [selectedModel, setSelectedModel] = useState<HomeComboboxOption | null>(
    HOME_COMBOBOX_OPTIONS[0],
  );

  return (
    <div ref={portalRef} className="relative flex h-64 w-72 items-start justify-center pt-12">
      <Combobox<HomeComboboxOption>
        autoHighlight
        open
        items={HOME_COMBOBOX_OPTIONS}
        isItemEqualToValue={isSameComboboxOption}
        itemToStringLabel={getComboboxOptionLabel}
        value={selectedModel}
        onValueChange={setSelectedModel}
      >
        <Field className="w-[240px] gap-1.5">
          <FieldLabel>Model</FieldLabel>
          <ComboboxControl>
            <Sparkles
              aria-hidden
              className="text-foreground-muted in-data-[theme=brutal]:text-black/60"
            />
            <ComboboxInput
              aria-label="Search models"
              placeholder="Search models..."
              suppressPasswordManager
            />
            <ComboboxClear aria-label="Clear model" />
          </ComboboxControl>
        </Field>
        <ComboboxContent
          positionMethod="absolute"
          portalProps={portalProps}
          initialFocus={false}
          finalFocus={false}
          className="w-[240px]"
        >
          <ComboboxList>
            {(model: HomeComboboxOption) => (
              <ComboboxItem key={model.id} value={model}>
                <span className="truncate leading-5">{model.label}</span>
                <ComboboxItemIndicator />
              </ComboboxItem>
            )}
          </ComboboxList>
          <ComboboxEmpty>No models found</ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

function ComboboxSelectPreview() {
  return (
    <div className="flex h-56 w-72 items-start justify-center pt-14">
      <ComboboxPreviewComposition className="w-[240px]" />
    </div>
  );
}

function SelectPreview() {
  const { portalRef, portalProps } = usePreviewPortal();

  return (
    <div ref={portalRef} className="relative flex h-56 w-72 items-start justify-center pt-14">
      <Select open defaultValue="relevance" items={SELECT_PREVIEW_OPTIONS} modal={false}>
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
        <SelectContent positionMethod="absolute" portalProps={portalProps} className="w-[220px]">
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

function SegmentedControlPreview() {
  const [value, setValue] = useState("board");
  const [filter, setFilter] = useState("all");

  return (
    <div className="grid justify-items-center gap-4">
      <SegmentedControl aria-label="Task view" value={value} onValueChange={setValue}>
        <SegmentedControlItem value="board">
          <Columns3 />
          <SegmentedControlLabel>Board</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="list">
          <List />
          <SegmentedControlLabel>List</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Filter messages" value={filter} onValueChange={setFilter}>
        <SegmentedControlItem value="all">
          <Inbox />
          <SegmentedControlLabel>All</SegmentedControlLabel>
          <SegmentedControlCount>12</SegmentedControlCount>
        </SegmentedControlItem>
        <SegmentedControlItem value="unread">
          <SegmentedControlLabel>Unread</SegmentedControlLabel>
          <SegmentedControlCount>3</SegmentedControlCount>
        </SegmentedControlItem>
        <SegmentedControlItem value="mentions">
          <AtSign />
          <SegmentedControlLabel>Mentions</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

function DropdownMenuPreview() {
  const { portalRef, portalProps } = usePreviewPortal();

  return (
    <div ref={portalRef} className="relative flex h-64 w-72 items-start justify-center pt-12">
      <DropdownMenu open modal={false} triggerId="home-menu-trigger">
        <DropdownMenuTrigger id="home-menu-trigger" render={<Button variant="outline" size="md" />}>
          <User aria-hidden />
          Account
        </DropdownMenuTrigger>
        <DropdownMenuContent
          positionMethod="absolute"
          portalProps={portalProps}
          className="flex w-64 flex-col"
        >
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
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings />
            <span className="min-w-0 flex-1 truncate">Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ContextMenuPreview() {
  return (
    <div className="relative flex h-64 w-72 flex-col items-center justify-start gap-2 pt-9">
      <div
        className={[
          "flex min-h-14 w-56 items-center justify-center px-4 text-center",
          "border border-dashed border-line-strong bg-layer-panel text-sm font-medium text-foreground-muted",
          "[[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-cream [[data-theme=brutal]_&]:font-sans [[data-theme=brutal]_&]:text-xs [[data-theme=brutal]_&]:font-bold [[data-theme=brutal]_&]:text-black",
        ].join(" ")}
      >
        Right click thread
      </div>
      <ContextMenu>
        <ContextMenuPopup className="flex w-60 min-w-60 flex-col">
          <ContextMenuLabel>Thread actions</ContextMenuLabel>
          <ContextMenuItem>
            <Pin />
            <span className="min-w-0 flex-1 truncate">Pin thread</span>
          </ContextMenuItem>
          <ContextMenuItem>
            <Copy />
            <span className="min-w-0 flex-1 truncate">Copy link</span>
            <ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <Archive />
            <span className="min-w-0 flex-1 truncate">Archive</span>
          </ContextMenuItem>
          <ContextMenuItem>
            <Trash />
            <span className="min-w-0 flex-1 truncate">Delete</span>
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuPopup>
      </ContextMenu>
    </div>
  );
}

function PopoverPreview() {
  const { portalRef, portalProps } = usePreviewPortal();

  return (
    <div ref={portalRef} className="relative flex h-64 w-72 items-start justify-center pt-12">
      <Popover open modal={false} triggerId="home-popover-trigger">
        <PopoverTrigger id="home-popover-trigger" render={<Button variant="outline" size="md" />}>
          <Info aria-hidden />
          Usage notes
        </PopoverTrigger>
        <PopoverContent
          positionMethod="absolute"
          initialFocus={false}
          finalFocus={false}
          align="center"
          collisionAvoidance={NO_COLLISION_AVOIDANCE}
          portalProps={portalProps}
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
            <div className="grid gap-1 rounded-sm bg-foreground-strong/4 px-2 py-2 font-mono text-xs text-foreground-strong/60 in-data-[theme=brutal]:rounded-none in-data-[theme=brutal]:border in-data-[theme=brutal]:border-black/10 in-data-[theme=brutal]:bg-brutal-yellow/20 in-data-[theme=brutal]:text-black/70">
              <span className="truncate">#design "token audit"</span>
              <span className="truncate">@atlas migration notes</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function PreviewCardPreview() {
  const { portalRef, portalProps } = usePreviewPortal();
  const triggerId = useId();

  return (
    <div
      ref={portalRef}
      className="relative flex h-64 w-full max-w-[22rem] min-w-0 items-start justify-center px-1 pt-14"
    >
      <PreviewCard open triggerId={triggerId}>
        <p className="m-0 max-w-full text-center text-sm leading-6 text-foreground-strong">
          Follow up with{" "}
          <PreviewCardTrigger
            id={triggerId}
            render={
              <Link
                to="/components/avatar"
                className="cursor-default select-text font-bold text-foreground underline decoration-foreground-strong/30 decoration-2 underline-offset-2 hover:text-accent-600 hover:decoration-accent-600 in-data-[theme=brutal]:text-black in-data-[theme=brutal]:decoration-black/30 in-data-[theme=brutal]:hover:text-brutal-pink in-data-[theme=brutal]:hover:decoration-brutal-pink"
              />
            }
          >
            @Atlas
          </PreviewCardTrigger>
        </p>
        <PreviewCardContent
          positionMethod="absolute"
          align="center"
          collisionAvoidance={NO_COLLISION_AVOIDANCE}
          portalProps={portalProps}
          className="w-[17.5rem] max-w-[calc(100vw-2rem)]"
        >
          <PreviewCardHeader>
            <Avatar size="md" type="agent">
              <AvatarImage src={HOME_AVATAR_IMAGES[0]} alt="" />
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <PreviewCardTitle>Atlas</PreviewCardTitle>
                <Status aria-hidden size="sm" variant="success" />
                <span className="truncate font-mono text-xs text-foreground-muted in-data-[theme=brutal]:text-black/60">
                  Online
                </span>
              </div>
              <div className="truncate font-mono text-xs text-foreground-muted in-data-[theme=brutal]:text-black/60">
                @atlas
              </div>
            </div>
          </PreviewCardHeader>
          <PreviewCardSeparator />
          <PreviewCardDescription title="Reviewing the token migration in #design-system.">
            Reviewing the token migration in #design-system.
          </PreviewCardDescription>
        </PreviewCardContent>
      </PreviewCard>
    </div>
  );
}

function AlertDialogPreview() {
  const { portalRef, portalProps } = usePreviewPortal();

  return (
    <div
      ref={portalRef}
      className="relative flex h-64 w-full max-w-[22rem] min-w-0 items-start justify-center px-1 pt-12"
    >
      <AlertDialog open modal={false}>
        <AlertDialogContent
          overlay={false}
          initialFocus={false}
          finalFocus={false}
          portalProps={portalProps}
          className="relative top-auto left-auto z-0 w-full max-w-[22rem] translate-x-0 translate-y-0"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody className="grid gap-2">
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            <p className="m-0 text-sm leading-5 wrap-break-word text-foreground-strong/60 in-data-[theme=brutal]:text-black/70">
              Delete task <strong className="font-bold text-foreground-strong">#42</strong>{" "}
              <strong className="font-bold text-foreground-strong">
                "Review dialog migration"
              </strong>
              ?
            </p>
          </AlertDialogBody>
          <AlertDialogFooter className="grid grid-cols-2 gap-2">
            <AlertDialogCancel size="sm" className="w-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="danger" size="sm">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DialogPreview() {
  const { portalRef, portalProps } = usePreviewPortal();

  return (
    <div
      ref={portalRef}
      className="relative flex h-64 w-full max-w-[22rem] min-w-0 items-start justify-center px-1 pt-10"
    >
      <Dialog open modal={false}>
        <DialogContent
          overlay={false}
          initialFocus={false}
          finalFocus={false}
          portalProps={portalProps}
          className="relative top-auto left-auto z-0 w-full max-w-[22rem] translate-x-0 translate-y-0"
        >
          <DialogHeader>
            <DialogTitle>Edit channel</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody className="grid gap-3">
            <DialogDescription>Update channel details for the workspace.</DialogDescription>
            <Field>
              <FieldLabel htmlFor="home-dialog-name">Name</FieldLabel>
              <Input id="home-dialog-name" defaultValue="design-system" />
            </Field>
          </DialogBody>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <DialogClose render={<Button variant="outline" size="sm" className="w-full" />}>
              Cancel
            </DialogClose>
            <Button variant="primary" size="sm" className="w-full">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TooltipPreview() {
  const { portalRef, portalProps } = usePreviewPortal();
  const triggerId = useId();

  return (
    <div ref={portalRef} className="relative flex h-56 w-72 items-center justify-center">
      <Tooltip open triggerId={triggerId}>
        <TooltipTrigger
          id={triggerId}
          render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}
        >
          <SmilePlus />
        </TooltipTrigger>
        <TooltipContent positionMethod="absolute" portalProps={portalProps}>
          Add reaction
          <Kbd>R</Kbd>
        </TooltipContent>
      </Tooltip>
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
          <Bell aria-hidden />
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
          "[[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-white [[data-theme=brutal]_&]:shadow-raft-md",
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

function ToastPreview() {
  const [toastManager] = useState(() => createToastManager());

  return (
    <ToastProvider toastManager={toastManager} timeout={0} renderViewport={false}>
      <SeedHomeToast />
      <HomeToastList />
    </ToastProvider>
  );
}

function SeedHomeToast() {
  const seededRef = useRef(false);
  const toastManager = useToastManager<{ hasIcon?: boolean; hasClose?: boolean }>();

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;

    toastManager.add({
      id: "home-toast",
      type: "success",
      title: "Link copied.",
      description: "Ready to paste into the thread.",
      actionProps: {
        children: "Undo",
        onClick: () => toastManager.close("home-toast"),
      },
      data: { hasIcon: true, hasClose: true },
    });
  }, [toastManager]);

  return null;
}

function HomeToastList() {
  const { toasts } = useToastManager<{ hasIcon?: boolean; hasClose?: boolean }>();

  return (
    <div className="relative flex h-64 w-72 items-center justify-center overflow-hidden bg-layer-panel p-4">
      <div className="absolute inset-x-5 top-9 h-8 rounded-md bg-layer-canvas-muted/80 in-data-[theme=brutal]:rounded-none in-data-[theme=brutal]:border-2 in-data-[theme=brutal]:border-black in-data-[theme=brutal]:bg-brutal-cyan/20" />
      <div className="absolute inset-x-5 top-24 grid grid-cols-3 gap-2">
        <div className="h-10 rounded-md bg-layer-canvas-muted/65 in-data-[theme=brutal]:rounded-none in-data-[theme=brutal]:border-2 in-data-[theme=brutal]:border-black/30 in-data-[theme=brutal]:bg-brutal-yellow/20" />
        <div className="h-10 rounded-md bg-layer-canvas-muted/65 in-data-[theme=brutal]:rounded-none in-data-[theme=brutal]:border-2 in-data-[theme=brutal]:border-black/30 in-data-[theme=brutal]:bg-brutal-yellow/20" />
        <div className="h-10 rounded-md bg-layer-canvas-muted/65 in-data-[theme=brutal]:rounded-none in-data-[theme=brutal]:border-2 in-data-[theme=brutal]:border-black/30 in-data-[theme=brutal]:bg-brutal-yellow/20" />
      </div>
      <div className="relative z-10">
        {toasts.map((toastObject) => (
          <ToastRoot key={toastObject.id} toast={toastObject} layout="inline">
            <ToastContent>
              <ToastIcon>
                <CircleCheck aria-hidden />
              </ToastIcon>
              <ToastBody>
                <ToastTitle />
                <ToastDescription />
              </ToastBody>
              <ToastActions>
                <ToastClose />
                <ToastAction />
              </ToastActions>
            </ToastContent>
          </ToastRoot>
        ))}
      </div>
    </div>
  );
}

function Home() {
  const previewTheme = usePreviewTheme();
  const resolvedMode = useResolvedPreviewMode();
  const themePreset =
    THEME_PRESETS.find(
      (preset) => preset.family === previewTheme.theme && preset.mode === resolvedMode,
    ) ?? THEME_PRESETS[0];

  const handleThemePresetChange = useCallback(
    (value: string) => {
      const preset = THEME_PRESETS.find((candidate) => candidate.id === value);
      if (!preset) return;
      previewTheme.setTheme(preset.family, { mode: preset.mode });
    },
    [previewTheme],
  );

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    window.history.scrollRestoration = "manual";

    const resetScroll = () => window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(resetScroll);
    const timeout = window.setTimeout(resetScroll, 150);

    resetScroll();

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <ThemeProvider theme={themePreset.family} mode={themePreset.mode} syncDom={false}>
      <div
        data-theme={themePreset.family}
        className={`${themePreset.family === "elegant" ? themePreset.mode : "light"} min-h-screen bg-layer-panel pb-28 text-foreground-strong`}
        style={{ colorScheme: themePreset.mode }}
      >
        <header className="border-b border-line-muted px-6 py-12 sm:px-10 sm:py-16">
          <div className="flex max-w-3xl flex-col gap-5">
            <Text.Heading level={3} render={<h1 />}>
              Build something bold with rUI.
            </Text.Heading>
            <Text.Sans size="large">
              A UI system with expressive visuals and playful interactions, shaped by Raft and made
              for whatever you build next.
            </Text.Sans>
          </div>
        </header>
        <div className="grid grid-cols-1 border-l border-line-muted bg-layer-panel md:grid-cols-2 xl:grid-cols-3">
          {COMPONENT_GRID.map((item) => (
            <article
              key={item.label}
              className={[
                "relative isolate h-[clamp(420px,36vh,520px)] overflow-hidden",
                "border-b border-r border-line-muted bg-layer-panel",
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

        <SegmentedControl
          aria-label="Preview theme"
          value={themePreset.id}
          onValueChange={handleThemePresetChange}
          className="fixed bottom-6 left-[calc(50vw+var(--sidebar-w)/2)] z-80 -translate-x-1/2"
        >
          {THEME_PRESETS.map((preset) => (
            <SegmentedControlItem key={preset.id} value={preset.id}>
              <SegmentedControlLabel>{preset.label}</SegmentedControlLabel>
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
    </ThemeProvider>
  );
}
