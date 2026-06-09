import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, CheckCircle, FileText, Inbox, Plus, Settings, TriangleAlert } from "lucide-react";
import {
  Badge,
  Banner,
  BannerDescription,
  BannerTitle,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuActionItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Status,
  Tabs,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  ThemeProvider,
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupLabel,
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
  },
} as const;

const PALETTE_ROLES = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "success", label: "Success" },
  { key: "information", label: "Information" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
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
          isElegantBoard ? "[--radius:0.125rem] [&_[data-tester-surface]]:!shadow-none" : "",
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
          <div className="space-y-4">
            <div className="grid auto-rows-[13rem] gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              <TypographyCard style={style} />
              <ButtonCard />
              <SearchCard />
              <ToggleCard />
              <FieldCard />
            </div>
            <div className="grid auto-rows-[18rem] gap-4 lg:grid-cols-4">
              <DropdownMenuCard />
              <TabsCard />
              <BadgesCard />
              <SelectionCard />
              <FeedbackCard />
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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-tester-surface
      className={`min-w-0 border border-border bg-surface p-6 shadow-[var(--surface-shadow-sm)] ${className}`}
      style={{ borderRadius: "var(--radius)" }}
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
      <TesterTile className="grid h-full content-between gap-4">
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
    <TesterTile className="flex items-center justify-center">
      <div className="grid gap-3 text-center">
        <Button size="lg" variant="primary">
          Primary
        </Button>
        <Button size="lg" variant="default">
          Secondary
        </Button>
        <Button size="lg" variant="ghost">
          Ghost
        </Button>
      </div>
    </TesterTile>
  );
}

function SearchCard() {
  return (
    <TesterTile className="flex items-center justify-center">
      <InputGroup className="max-w-72">
        <InputGroupAddon.Search />
        <InputGroupInput placeholder="Search" />
        <InputGroupAddon align="inline-end">
          <Kbd>⌘S</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </TesterTile>
  );
}

function FieldCard() {
  return (
    <TesterTile className="flex items-center justify-center">
      <Field className="w-full max-w-72">
        <FieldLabel required>Email</FieldLabel>
        <Input type="email" defaultValue="name@example.com" aria-label="Email" />
        <FieldDescription>Used for notifications.</FieldDescription>
      </Field>
    </TesterTile>
  );
}

function ToggleCard() {
  const [value, setValue] = useState("color");

  return (
    <TesterTile className="flex items-center justify-center">
      <ToggleGroup
        ariaLabel="Style tester sample group"
        value={value}
        onValueChange={setValue}
        className="max-w-72"
      >
        <ToggleGroupItem value="color">
          <ToggleGroupLabel>Color</ToggleGroupLabel>
        </ToggleGroupItem>
        <ToggleGroupItem value="type">
          <ToggleGroupLabel>Type</ToggleGroupLabel>
        </ToggleGroupItem>
        <ToggleGroupItem value="state">
          <ToggleGroupLabel>State</ToggleGroupLabel>
        </ToggleGroupItem>
      </ToggleGroup>
    </TesterTile>
  );
}

function TabsCard() {
  return (
    <TesterTile className="flex items-center justify-center lg:col-span-2">
      <Tabs defaultValue="tab-1" className="max-w-72">
        <TabsList>
          <TabsTab value="tab-1">
            <Inbox />
            <TabsLabel>Tab</TabsLabel>
          </TabsTab>
          <TabsTab value="tab-2">
            <FileText />
            <TabsLabel>Tab</TabsLabel>
          </TabsTab>
          <TabsTab value="tab-3">
            <Settings />
            <TabsLabel>Tab</TabsLabel>
          </TabsTab>
        </TabsList>
        <TabsPanel value="tab-1" className="sr-only">
          Tab 1
        </TabsPanel>
      </Tabs>
    </TesterTile>
  );
}

function BadgesCard() {
  return (
    <TesterTile className="flex items-center justify-center">
      <div className="grid justify-items-center gap-2">
        <Badge variant="accent">queued</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="success">
          <Check className="size-3" aria-hidden="true" />
          Success
        </Badge>
        <Badge variant="destructive">
          <TriangleAlert className="size-3" aria-hidden="true" />
          Failed
        </Badge>
        <Badge variant="information">Passed</Badge>
      </div>
    </TesterTile>
  );
}

function SelectionCard() {
  return (
    <TesterTile className="grid place-items-center">
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

function DropdownMenuCard() {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const anchor = useMemo(
    () => ({
      getBoundingClientRect() {
        const rect = containerElement?.getBoundingClientRect();
        const contentWidth = 256;
        return DOMRect.fromRect({
          x: (rect?.left ?? 0) + Math.max(24, ((rect?.width ?? contentWidth) - contentWidth) / 2),
          y: (rect?.top ?? 0) + 82,
          width: 0,
          height: 0,
        });
      },
    }),
    [containerElement],
  );

  return (
    <div
      data-tester-surface
      className="relative min-w-0 overflow-hidden border border-border bg-surface p-6 shadow-[var(--surface-shadow-sm)] lg:col-span-2"
      ref={setContainerElement}
      style={{ borderRadius: "var(--radius)" }}
    >
      {containerElement ? (
        <DropdownMenu open modal={false}>
          <DropdownMenuTrigger
            render={
              <Button
                size="sm"
                variant="outline"
                className="absolute top-10 left-1/2 -translate-x-1/2"
              />
            }
          >
            Options
          </DropdownMenuTrigger>
          <DropdownMenuContent
            anchor={anchor}
            side="bottom"
            align="start"
            sideOffset={8}
            className="flex w-64 flex-col"
            portalProps={{ container: containerElement }}
          >
            <DropdownMenuItem className="font-bold">
              <Check />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate">Default view</div>
                <div className="truncate font-mono text-xs text-black/40">Current setting</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Check className="opacity-0" />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate">Compact view</div>
                <div className="truncate font-mono text-xs text-black/40">Reduced spacing</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuActionItem>
              <Plus />
              <span className="min-w-0 flex-1 text-left">Create preset</span>
              <DropdownMenuShortcut>N</DropdownMenuShortcut>
            </DropdownMenuActionItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function FeedbackCard() {
  return (
    <TesterTile className="flex items-center justify-center lg:col-span-2">
      <Banner status="success" className="w-full max-w-md">
        <CheckCircle />
        <BannerTitle>Changes saved</BannerTitle>
        <BannerDescription>Your preferences are up to date.</BannerDescription>
      </Banner>
    </TesterTile>
  );
}
