import { useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Input,
  InlineCode,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Label,
  NotificationCenter,
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
  NotificationCenterPopup,
  NotificationCenterScroller,
  NotificationCenterTitle,
  NotificationCenterTrigger,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
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
  IconBellOutline18,
  IconClockOutline18,
  IconCreditCardOutline18,
  IconGearOutline18,
  IconInputSearchOutline18,
  IconMessageOutline18,
  IconUserOutline18,
} from "nucleo-ui-outline-18";
import { Plus, Search, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

type ComponentRoute =
  | "/components/button"
  | "/components/checkbox"
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
  | "/components/tabs"
  | "/components/banner"
  | "/components/notification-center";

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

const FLOAT_ACTIONS_SHADOW =
  "oklch(0.145 0.002 286.131 / 0.071) 0px 0.5px 0px, oklch(0.145 0.002 286.131 / 0.039) 0px 1px 2px -1px";

const AVATAR_PHOTOS = [
  "https://unsplash.com/photos/n4KewLKFOZw/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/H6FbE_vxaxQ/download?force=true&w=160&h=160&fit=crop&crop=faces",
  "https://unsplash.com/photos/mxwcEIqJ63Y/download?force=true&w=160&h=160&fit=crop&crop=faces",
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
          {AVATAR_PHOTOS.map((src, index) => (
            <Avatar key={src} size="sm" type={index === 1 ? "human" : "agent"}>
              <AvatarImage src={src} alt="" />
              <AvatarFallback />
            </Avatar>
          ))}
          <AvatarGroupCount size="sm">+3</AvatarGroupCount>
        </AvatarGroup>
        <div className="flex items-end gap-4">
          <Avatar size="lg" type="agent">
            <AvatarImage src={AVATAR_PHOTOS[0]} alt="" />
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

function SelectPreview() {
  const portalRef = useRef<HTMLDivElement>(null);

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
  const anchor = useMemo(
    () => ({
      getBoundingClientRect() {
        const rect = portalRef.current?.getBoundingClientRect();
        return DOMRect.fromRect({
          x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2,
          y: (rect?.top ?? 0) + (rect?.height ?? 0) / 2 - 104,
          width: 0,
          height: 0,
        });
      },
    }),
    [],
  );

  return (
    <div ref={portalRef} className="relative h-56 w-72">
      <DropdownMenu open modal={false} triggerId="home-dropdown-menu-trigger">
        <DropdownMenuTrigger
          id="home-dropdown-menu-trigger"
          render={
            <button
              type="button"
              aria-label="Profile menu"
              className="absolute top-1/2 left-1/2 size-px -translate-x-1/2 -translate-y-1/2 overflow-hidden p-0 opacity-0"
            />
          }
        />
        <DropdownMenuContent
          anchor={anchor}
          align="center"
          sideOffset={0}
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

function NotificationCenterPreview() {
  const triggerId = "home-notification-center-trigger";
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={portalRef}
      className="relative flex h-72 w-72 max-w-full items-start justify-center pt-8"
    >
      <NotificationCenter open modal={false} triggerId={triggerId}>
        <div className="relative size-9">
          <NotificationCenterTrigger
            id={triggerId}
            render={<Button variant="outline" size="icon-md" className="size-9 p-0" />}
          >
            <IconBellOutline18 aria-hidden />
          </NotificationCenterTrigger>
          <Status
            aria-hidden
            variant="primary"
            size="md"
            className="pointer-events-none absolute -top-1 -right-1"
          />
        </div>
        <NotificationCenterPopup
          viewport="desktop"
          size="sm"
          className="w-72"
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          side="bottom"
          align="center"
          collisionAvoidance={{ side: "none", align: "none" }}
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
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
        </NotificationCenterPopup>
      </NotificationCenter>
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
            "inline-flex items-center gap-1 rounded-md border border-black/10 bg-white/95 p-1 text-black backdrop-blur",
          ].join(" ")}
          style={{ boxShadow: FLOAT_ACTIONS_SHADOW }}
        >
          {THEME_PRESETS.map((preset) => {
            const isActive = themePreset.id === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isActive}
                className={[
                  "h-8 rounded-md px-3 text-xs font-medium outline-none",
                  "focus-visible:ring-2 focus-visible:ring-black/20",
                  isActive ? "rounded-full bg-black/5 text-black" : "text-black/45",
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
