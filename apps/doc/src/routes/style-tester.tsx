import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Check,
  CheckCircle,
  Files,
  MessageSquare,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { IconCircleCheckFill18 } from "nucleo-ui-fill-18";
import {
  IconBellOutline18,
  IconChatBubbleOutline18,
  IconCreditCardOutline18,
  IconFilesOutline18,
  IconGearOutline18,
  IconHouseOutline18,
  IconPlusOutline18,
  IconUsersOutline18,
  IconXmarkOutline18,
} from "nucleo-ui-outline-18";
import {
  Badge,
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuActionItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemCount,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
  PanelHeader,
  PanelHeaderActions,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeaderSubtitle,
  PanelHeaderTitle,
  PanelHeaderTitleRow,
  Status,
  Tabs,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  ThemeProvider,
} from "@slock/ui";

import { DocPage } from "#/components/doc-page.tsx";

const TOC = [] as const;
const SHADE_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

const STYLE_SHADE_SCALES = {
  brutal: {
    primary: [
      "#fefce8",
      "#fef9c3",
      "#fef08a",
      "#fde047",
      "#facc15",
      "#eab308",
      "#ca8a04",
      "#a16207",
      "#854d0e",
      "#713f12",
      "#422006",
    ],
    secondary: [
      "#fafafa",
      "#f5f5f5",
      "#e5e5e5",
      "#d4d4d4",
      "#a3a3a3",
      "#737373",
      "#525252",
      "#404040",
      "#262626",
      "#171717",
      "#0a0a0a",
    ],
    success: [
      "#f7fee7",
      "#ecfccb",
      "#d9f99d",
      "#bef264",
      "#a3e635",
      "#84cc16",
      "#65a30d",
      "#4d7c0f",
      "#3f6212",
      "#365314",
      "#1a2e05",
    ],
    information: [
      "#eff6ff",
      "#dbeafe",
      "#bfdbfe",
      "#93c5fd",
      "#60a5fa",
      "#3b82f6",
      "#2563eb",
      "#1d4ed8",
      "#1e40af",
      "#1e3a8a",
      "#172554",
    ],
    warning: [
      "#fff7ed",
      "#ffedd5",
      "#fed7aa",
      "#fdba74",
      "#fb923c",
      "#f97316",
      "#ea580c",
      "#c2410c",
      "#9a3412",
      "#7c2d12",
      "#431407",
    ],
    error: [
      "#fff1f2",
      "#ffe4e6",
      "#fecdd3",
      "#fda4af",
      "#fb7185",
      "#f43f5e",
      "#e11d48",
      "#be123c",
      "#9f1239",
      "#881337",
      "#4c0519",
    ],
    accent: [
      "#fdf2f8",
      "#fce7f3",
      "#fbcfe8",
      "#f9a8d4",
      "#f472b6",
      "#fe7da8",
      "#db2777",
      "#be185d",
      "#9d174d",
      "#831843",
      "#500724",
    ],
  },
  elegant: {
    primary: [
      "#fefce8",
      "#fef9c3",
      "#fef08a",
      "#fde047",
      "#facc15",
      "#eab308",
      "#ca8a04",
      "#a16207",
      "#854d0e",
      "#713f12",
      "#422006",
    ],
    secondary: [
      "#fafafa",
      "#f4f4f5",
      "#e4e4e7",
      "#d4d4d8",
      "#a1a1aa",
      "#71717a",
      "#52525b",
      "#3f3f46",
      "#27272a",
      "#18181b",
      "#09090b",
    ],
    success: [
      "#f0fdf4",
      "#dcfce7",
      "#bbf7d0",
      "#86efac",
      "#4ade80",
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#166534",
      "#14532d",
      "#052e16",
    ],
    information: [
      "#f0f9ff",
      "#e0f2fe",
      "#bae6fd",
      "#7dd3fc",
      "#38bdf8",
      "#0ea5e9",
      "#0284c7",
      "#0369a1",
      "#075985",
      "#0c4a6e",
      "#082f49",
    ],
    warning: [
      "#fffbeb",
      "#fef3c7",
      "#fde68a",
      "#fcd34d",
      "#fbbf24",
      "#f59e0b",
      "#d97706",
      "#b45309",
      "#92400e",
      "#78350f",
      "#451a03",
    ],
    error: [
      "#fef2f2",
      "#fee2e2",
      "#fecaca",
      "#fca5a5",
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
      "#450a0a",
    ],
    accent: [
      "#fdf2f8",
      "#fce7f3",
      "#fbcfe8",
      "#f9a8d4",
      "#f472b6",
      "#fe7da8",
      "#db2777",
      "#be185d",
      "#9d174d",
      "#831843",
      "#500724",
    ],
  },
  "elegant-dark": {
    primary: [
      "#422006",
      "#713f12",
      "#854d0e",
      "#a16207",
      "#ca8a04",
      "#eab308",
      "#facc15",
      "#fde047",
      "#fef08a",
      "#fef9c3",
      "#fefce8",
    ],
    secondary: [
      "#09090b",
      "#18181b",
      "#27272a",
      "#3f3f46",
      "#52525b",
      "#71717a",
      "#a1a1aa",
      "#d4d4d8",
      "#e4e4e7",
      "#f4f4f5",
      "#fafafa",
    ],
    success: [
      "#052e16",
      "#14532d",
      "#166534",
      "#15803d",
      "#16a34a",
      "#22c55e",
      "#4ade80",
      "#86efac",
      "#bbf7d0",
      "#dcfce7",
      "#f0fdf4",
    ],
    information: [
      "#082f49",
      "#0c4a6e",
      "#075985",
      "#0369a1",
      "#0284c7",
      "#0ea5e9",
      "#38bdf8",
      "#7dd3fc",
      "#bae6fd",
      "#e0f2fe",
      "#f0f9ff",
    ],
    warning: [
      "#451a03",
      "#78350f",
      "#92400e",
      "#b45309",
      "#d97706",
      "#f59e0b",
      "#fbbf24",
      "#fcd34d",
      "#fde68a",
      "#fef3c7",
      "#fffbeb",
    ],
    error: [
      "#450a0a",
      "#7f1d1d",
      "#991b1b",
      "#b91c1c",
      "#dc2626",
      "#ef4444",
      "#f87171",
      "#fca5a5",
      "#fecaca",
      "#fee2e2",
      "#fef2f2",
    ],
    accent: [
      "#500724",
      "#831843",
      "#9d174d",
      "#be185d",
      "#db2777",
      "#fe7da8",
      "#f472b6",
      "#f9a8d4",
      "#fbcfe8",
      "#fce7f3",
      "#fdf2f8",
    ],
  },
} as const;

const PALETTE_ROLES = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "success", label: "Success" },
  { key: "information", label: "Information" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
  { key: "accent", label: "Accent" },
] as const;

const STYLES = [
  {
    id: "elegant",
    label: "Elegant",
    theme: "elegant",
    className: "light",
    headingFont: "Georgia, serif",
    bodyFont: "var(--display-font)",
    labelFont: "var(--mono-font)",
  },
  {
    id: "elegant-dark",
    label: "Elegant dark",
    theme: "elegant",
    className: "dark",
    headingFont: "Georgia, serif",
    bodyFont: "var(--display-font)",
    labelFont: "var(--mono-font)",
  },
  {
    id: "brutal",
    label: "Brutal",
    theme: "brutal",
    className: "",
    headingFont: "Georgia, serif",
    bodyFont: "var(--display-font)",
    labelFont: "var(--mono-font)",
  },
] as const;

type StyleSpec = (typeof STYLES)[number];
type PaletteRole = (typeof PALETTE_ROLES)[number];

export const Route = createFileRoute("/style-tester")({ component: StyleTesterDoc });

function StyleTesterDoc() {
  return (
    <DocPage
      title="Style Tester"
      description="Standalone visual tester for shade scales and real @slock/ui component rendering across brutal, elegant, and elegant dark."
      toc={TOC}
      showToc={false}
    >
      <div className="pb-16">
        {STYLES.map((style) => (
          <StyleBoard key={style.id} style={style} />
        ))}
      </div>
    </DocPage>
  );
}

function StyleBoard({ style }: { style: StyleSpec }) {
  const isDarkSection = style.id === "elegant-dark";
  const isElegantBoard = style.theme === "elegant";

  return (
    <ThemeProvider theme={style.theme}>
      <section
        data-theme={style.theme}
        className={[
          style.className,
          "min-w-0 py-[240px] text-foreground",
          isElegantBoard ? "[--radius:0px] [&_[data-tester-surface]]:!shadow-none" : "",
          isDarkSection ? "-mx-8 bg-black px-8 text-white" : "",
        ].join(" ")}
        style={{ fontFamily: "var(--display-font)" }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{style.label}</h2>
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="grid content-start gap-4 self-start sm:grid-cols-2 xl:grid-cols-1">
            {PALETTE_ROLES.map((role) => (
              <PaletteCard key={role.key} role={role} styleId={style.id} />
            ))}
          </div>
          <div className={isElegantBoard ? "" : "space-y-4"}>
            <div
              className={[
                "grid auto-rows-[13rem] lg:grid-cols-2 2xl:grid-cols-3",
                isElegantBoard ? "gap-0 [&>*]:-mt-px [&>*]:-ml-px" : "gap-4",
              ].join(" ")}
            >
              <TypographyCard style={style} />
              <ButtonCard />
              <SearchCard />
              <PanelHeaderCard />
              <FieldCard />
            </div>
            <div
              className={[
                "grid auto-rows-[18rem] lg:grid-cols-4",
                isElegantBoard ? "gap-0 [&>*]:-mt-px [&>*]:-ml-px" : "gap-4",
              ].join(" ")}
            >
              <DropdownMenuCard style={style} />
              <TabsCard style={style} />
              <BadgesCard />
              <SelectionCard />
              <FeedbackCard style={style} />
            </div>
          </div>
        </div>
      </section>
    </ThemeProvider>
  );
}

function PaletteCard({
  role,
  styleId,
}: {
  role: PaletteRole;
  styleId: keyof typeof STYLE_SHADE_SCALES;
}) {
  const shades = STYLE_SHADE_SCALES[styleId][role.key];
  const heroBackground = shades[5];
  const heroText = shades[0];

  return (
    <div
      data-tester-surface
      className="grid h-36 overflow-hidden rounded-none border border-border bg-surface shadow-[var(--surface-shadow-sm)]"
    >
      <div
        className="flex items-start px-4 py-4 text-lg font-semibold"
        style={{ background: heroBackground, color: heroText }}
      >
        {role.label}
      </div>
      <div className="grid grid-cols-11">
        {shades.map((color, index) => (
          <div
            key={`${role.key}-${SHADE_STEPS[index]}`}
            title={`${role.label} ${SHADE_STEPS[index]} ${color}`}
            aria-label={`${role.label} ${SHADE_STEPS[index]}`}
            style={{ background: color }}
          />
        ))}
      </div>
    </div>
  );
}

function TesterTile({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      data-tester-surface
      className={`min-w-0 border border-border bg-surface p-6 shadow-[var(--surface-shadow-sm)] ${className}`}
      style={{ borderRadius: "var(--radius)", ...style }}
    >
      {children}
    </div>
  );
}

function TypographyCard({ style }: { style: StyleSpec }) {
  const samples = [
    {
      title: "Headline",
      fontFamily: style.headingFont,
      className: "text-[4.75rem] sm:text-[5.5rem]",
      sample: "The quick brown fox jumps over the lazy dog.",
    },
    {
      title: "Body",
      fontFamily: style.bodyFont,
      className: "text-[4.25rem] sm:text-[5rem]",
      sample: "The quick brown fox jumps over the lazy dog.",
    },
    {
      title: "Mono",
      fontFamily: style.labelFont,
      className: "text-[3.25rem] sm:text-[4rem]",
      sample: "The quick brown fox jumps over the lazy dog.",
    },
  ];

  return (
    <div className="row-span-2 min-w-0 lg:col-span-2 2xl:col-span-1">
      <TesterTile
        className="grid h-full content-between gap-4"
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        {samples.map((sample) => (
          <div
            key={sample.title}
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-stretch gap-4"
          >
            <div className="grid min-w-0 content-between">
              <p className="text-sm font-medium text-[color:var(--surface-muted-foreground)]">
                {sample.title}
              </p>
              <p
                className="truncate text-sm text-[color:var(--surface-muted-foreground)]"
                style={{ fontFamily: sample.fontFamily }}
              >
                {sample.sample}
              </p>
            </div>
            <div className="flex items-end">
              <div
                className={`${sample.className} leading-none`}
                style={{ fontFamily: sample.fontFamily }}
              >
                Aa
              </div>
            </div>
          </div>
        ))}
      </TesterTile>
    </div>
  );
}

function ButtonCard() {
  return (
    <TesterTile
      className="flex items-center justify-center"
      style={{
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }}
    >
      <div className="grid grid-cols-3 gap-3 text-center">
        <Button size="md" variant="default">
          Default
        </Button>
        <Button size="md" variant="primary">
          Primary
        </Button>
        <Button size="md" variant="outline">
          Outline
        </Button>
        <Button size="md" variant="ghost">
          Ghost
        </Button>
        <Button size="md" variant="destructive">
          Destructive
        </Button>
        <Button size="md" variant="destructive-outline">
          Destructive
        </Button>
        <Button size="md" variant="accent">
          Accent
        </Button>
        <Button size="md" variant="link">
          Link
        </Button>
        <Button size="md" variant="muted">
          Muted
        </Button>
      </div>
    </TesterTile>
  );
}

function SearchCard() {
  return (
    <TesterTile
      className="flex items-center justify-center"
      style={{
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <InputGroup className="max-w-72">
        <InputGroupAddon.Search />
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘S</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </TesterTile>
  );
}

function FieldCard() {
  return (
    <TesterTile
      className="flex items-center justify-center"
      style={{
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <Field className="w-full max-w-72">
        <FieldLabel required>Email</FieldLabel>
        <Input type="email" defaultValue="name@example.com" aria-label="Email" />
        <FieldDescription>Used for notifications.</FieldDescription>
      </Field>
    </TesterTile>
  );
}

function PanelHeaderCard() {
  return (
    <TesterTile className="flex items-center justify-center">
      <PanelHeader className="w-full max-w-sm border border-border bg-surface px-4">
        <PanelHeaderIcon className="flex border-border bg-surface-muted">
          <Bookmark />
        </PanelHeaderIcon>
        <PanelHeaderContent>
          <PanelHeaderTitleRow>
            <PanelHeaderTitle>Saved</PanelHeaderTitle>
          </PanelHeaderTitleRow>
          <PanelHeaderSubtitle>12 saved</PanelHeaderSubtitle>
        </PanelHeaderContent>
        <PanelHeaderActions>
          <Button size="icon-sm" aria-label="Settings">
            <Settings />
          </Button>
        </PanelHeaderActions>
      </PanelHeader>
    </TesterTile>
  );
}

type StyleTesterTabItem = {
  brutalIcon: ReactNode;
  elegantIcon: ReactNode;
  label: string;
  value: string;
};

const STYLE_TESTER_WORKSPACE_TABS: StyleTesterTabItem[] = [
  {
    value: "chat",
    label: "Chat",
    elegantIcon: <IconChatBubbleOutline18 strokeWidth={1} />,
    brutalIcon: <MessageSquare />,
  },
  {
    value: "files",
    label: "Files",
    elegantIcon: <IconFilesOutline18 strokeWidth={1} />,
    brutalIcon: <Files />,
  },
  {
    value: "members",
    label: "Members",
    elegantIcon: <IconUsersOutline18 strokeWidth={1} />,
    brutalIcon: <Users />,
  },
  {
    value: "alerts",
    label: "Alerts",
    elegantIcon: <IconBellOutline18 strokeWidth={1} />,
    brutalIcon: <Bell />,
  },
];

const STYLE_TESTER_ACCOUNT_TABS: StyleTesterTabItem[] = [
  {
    value: "overview",
    label: "Overview",
    elegantIcon: <IconHouseOutline18 strokeWidth={1} />,
    brutalIcon: <Settings />,
  },
  {
    value: "billing",
    label: "Billing",
    elegantIcon: <IconCreditCardOutline18 strokeWidth={1} />,
    brutalIcon: <Settings />,
  },
  {
    value: "settings",
    label: "Settings",
    elegantIcon: <IconGearOutline18 strokeWidth={1} />,
    brutalIcon: <Settings />,
  },
];

function StyleTesterTabs({
  elegant,
  activeAccent = false,
  items,
  defaultValue,
}: {
  elegant: boolean;
  activeAccent?: boolean;
  defaultValue: string;
  items: StyleTesterTabItem[];
}) {
  return (
    <Tabs defaultValue={defaultValue} className={elegant ? "w-full max-w-xl" : "max-w-72"}>
      <TabsList activeAccent={activeAccent}>
        {items.map((tab) => (
          <TabsTab key={tab.value} value={tab.value}>
            {elegant ? tab.elegantIcon : tab.brutalIcon}
            <TabsLabel>{tab.label}</TabsLabel>
          </TabsTab>
        ))}
      </TabsList>
      <TabsPanel value={defaultValue} className="sr-only">
        {items.find((tab) => tab.value === defaultValue)?.label ?? defaultValue}
      </TabsPanel>
    </Tabs>
  );
}

function TabsCard({ style }: { style: StyleSpec }) {
  const isElegant = style.theme === "elegant";

  return (
    <TesterTile
      className="flex items-center justify-center lg:col-span-2"
      style={{
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <div className="flex w-full flex-col items-center gap-10">
        <StyleTesterTabs
          elegant={isElegant}
          defaultValue="chat"
          items={STYLE_TESTER_WORKSPACE_TABS}
        />
        {isElegant ? (
          <StyleTesterTabs
            elegant
            activeAccent
            defaultValue="overview"
            items={STYLE_TESTER_ACCOUNT_TABS}
          />
        ) : null}
      </div>
    </TesterTile>
  );
}

function BadgesCard() {
  return (
    <TesterTile
      className="flex items-center justify-center"
      style={{
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <div className="grid justify-items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="accent">queued</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="success">
          <Check className="size-2.5" aria-hidden="true" />
          Success
        </Badge>
        <Badge variant="destructive">
          <X className="size-2.5" aria-hidden="true" />
          Failed
        </Badge>
        <Badge variant="information">Passed</Badge>
      </div>
    </TesterTile>
  );
}

function SelectionCard() {
  return (
    <TesterTile
      className="grid place-items-center"
      style={{
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <div className="grid grid-cols-3 items-center gap-x-10 gap-y-7">
        <Status size="lg" fill="gray" />
        <Status size="lg" fill="lime" />
        <Status.Attention />
        <Checkbox size="md" aria-label="Unchecked" />
        <Checkbox size="md" defaultChecked aria-label="Checked" />
        <Checkbox size="md" defaultChecked disabled aria-label="Disabled checked" />
      </div>
    </TesterTile>
  );
}

function DropdownMenuCard({ style }: { style: StyleSpec }) {
  const isElegant = style.theme === "elegant";
  const serverTriggerId = `opened-server-trigger-${style.id}`;
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const anchor = useMemo(
    () => ({
      getBoundingClientRect() {
        const trigger = containerElement?.querySelector<HTMLElement>(`#${serverTriggerId}`);
        const rect = trigger?.getBoundingClientRect();
        return DOMRect.fromRect({
          x: rect?.left ?? 0,
          y: rect?.bottom ?? 0,
          width: rect?.width ?? 0,
          height: 0,
        });
      },
    }),
    [containerElement, serverTriggerId],
  );

  return (
    <div
      data-tester-surface
      className="relative min-w-0 overflow-hidden border border-border bg-surface p-6 shadow-[var(--surface-shadow-sm)] lg:col-span-2"
      ref={setContainerElement}
      style={{
        borderRadius: "var(--radius)",
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
    >
      {containerElement ? (
        <DropdownMenu open modal={false} triggerId={serverTriggerId}>
          <DropdownMenuTrigger
            id={serverTriggerId}
            render={
              <Button
                size={isElegant ? "md" : "sm"}
                variant={isElegant ? "default" : "outline"}
                className="absolute top-10 left-1/2 -translate-x-1/2"
              />
            }
          >
            {isElegant ? "Switch server" : "Options"}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            anchor={anchor}
            side="bottom"
            align={isElegant ? "center" : "start"}
            sideOffset={4}
            className={isElegant ? "flex w-64 flex-col" : "w-64"}
            portalProps={{ container: containerElement }}
          >
            {isElegant ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <DropdownMenuItem className="items-center gap-1 py-2 pl-3.5">
                    <IconCircleCheckFill18 />
                    <span className="flex h-6 min-w-0 flex-1 items-center truncate font-medium text-left">
                      Slock
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="items-center gap-1 py-2 pl-3.5">
                    <IconCircleCheckFill18 className="opacity-0" />
                    <span className="flex h-6 min-w-0 flex-1 items-center truncate text-left">
                      Design Guild
                    </span>
                    <DropdownMenuItemCount>4</DropdownMenuItemCount>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="items-center gap-1 py-2 pl-3.5">
                    <IconCircleCheckFill18 className="opacity-0" />
                    <span className="flex h-6 min-w-0 flex-1 items-center truncate text-left">
                      Open Source
                    </span>
                    <DropdownMenuItemCount>12</DropdownMenuItemCount>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuActionItem>
                  <IconUsersOutline18 strokeWidth={1.5} />
                  <span className="flex h-6 min-w-0 flex-1 items-center text-left">
                    Join Community
                  </span>
                  <DropdownMenuShortcut>J</DropdownMenuShortcut>
                </DropdownMenuActionItem>
                <DropdownMenuActionItem>
                  <IconPlusOutline18 strokeWidth={1.5} />
                  <span className="flex h-6 min-w-0 flex-1 items-center text-left">
                    Switch or Create Server
                  </span>
                  <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                </DropdownMenuActionItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel>View</DropdownMenuLabel>
                <DropdownMenuItem className="font-bold">
                  <Check />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate">Default view</div>
                    <div className="truncate font-mono text-xs text-[var(--dropdown-muted-foreground)]">
                      Current setting
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Check className="opacity-0" />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate">Compact view</div>
                    <div className="truncate font-mono text-xs text-[var(--dropdown-muted-foreground)]">
                      Reduced spacing
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuActionItem>
                  <Plus />
                  <span className="min-w-0 flex-1 text-left">Create preset</span>
                  <DropdownMenuShortcut>N</DropdownMenuShortcut>
                </DropdownMenuActionItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function FeedbackCard({ style }: { style: StyleSpec }) {
  const isElegant = style.theme === "elegant";

  return (
    <TesterTile
      className="flex items-center justify-center lg:col-span-2"
      style={{
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <Banner status="success" className="w-full max-w-md">
        {isElegant ? <IconCircleCheckFill18 className="size-5 shrink-0" /> : <CheckCircle />}
        <BannerTitle>Changes saved</BannerTitle>
        <BannerDescription>Your preferences are up to date.</BannerDescription>
        {isElegant ? (
          <BannerAction>
            <Button variant="ghost" size="icon-xs" aria-label="Dismiss">
              <IconXmarkOutline18 strokeWidth={1} />
            </Button>
          </BannerAction>
        ) : null}
      </Banner>
    </TesterTile>
  );
}
