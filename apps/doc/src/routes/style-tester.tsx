import { forwardRef, useMemo, useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
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
  IconEarthSearchOutline18,
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
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
  ListItem,
  ListItemBody,
  ListItemDescription,
  ListItemIcon,
  ListItemRow,
  ListItemTitle,
  Tabs,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  ThemeProvider,
} from "@slock/ui";

import { DocPage } from "#/components/doc-page.tsx";

const TOC = [] as const;

const STYLES = [
  {
    id: "elegant",
    label: "Elegant",
    theme: "elegant",
    className: "light",
    headingFont: "var(--heading-font)",
    headingFontVariation: "var(--heading-font-variation)",
    bodyFont: "var(--display-font)",
    labelFont: "var(--mono-font)",
  },
  {
    id: "elegant-dark",
    label: "Elegant dark",
    theme: "elegant",
    className: "dark",
    headingFont: "var(--heading-font)",
    headingFontVariation: "var(--heading-font-variation)",
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

const ACTIVE_STYLES = STYLES.filter((style) => style.id === "elegant");

type StyleSpec = (typeof STYLES)[number];

export const Route = createFileRoute("/style-tester")({ component: StyleTesterDoc });

function StyleTesterDoc() {
  return (
    <DocPage title="Style Tester" toc={TOC} showToc={false} showHeader={false}>
      <div className="pb-16">
        {ACTIVE_STYLES.map((style) => (
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
            <ListItemCard />
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
      </section>
    </ThemeProvider>
  );
}

const TesterTile = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    className?: string;
    label?: string;
    style?: React.CSSProperties;
  }
>(function TesterTile({ children, className = "", label, style }, ref) {
  return (
    <div
      ref={ref}
      data-tester-surface
      className={`relative min-w-0 border border-border bg-surface p-6 shadow-[var(--surface-shadow-sm)] ${className}`}
      style={{ borderRadius: "var(--radius)", ...style }}
    >
      {label ? (
        <span className="pointer-events-none absolute top-6 left-6 font-mono text-[0.6875rem] font-medium uppercase tracking-wide text-[color:var(--surface-muted-foreground)]/45">
          {label}
        </span>
      ) : null}
      {children}
    </div>
  );
});

function TypographyCard({ style }: { style: StyleSpec }) {
  const headingFontVariation =
    "headingFontVariation" in style ? style.headingFontVariation : undefined;

  const samples = [
    {
      title: "Headline",
      fontFamily: style.headingFont,
      fontVariationSettings: headingFontVariation,
      labelFontFamily: style.bodyFont,
      labelClassName: "text-sm font-medium text-[color:var(--surface-muted-foreground)]",
      sampleClassName:
        "truncate text-[1.75rem] font-medium leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[2rem]",
      specimenClassName:
        "text-[4.75rem] font-medium leading-none tracking-[-0.05em] sm:text-[5.5rem]",
      sample: "The quick brown fox jumps over the lazy dog.",
    },
    {
      title: "Body",
      fontFamily: style.bodyFont,
      labelFontFamily: style.bodyFont,
      labelClassName: "text-sm font-medium text-[color:var(--surface-muted-foreground)]",
      sampleClassName: "truncate text-sm text-[color:var(--surface-muted-foreground)]",
      specimenClassName: "text-[4.25rem] leading-none sm:text-[5rem]",
      sample: "The quick brown fox jumps over the lazy dog.",
    },
    {
      title: "Mono",
      fontFamily: style.labelFont,
      labelFontFamily: style.bodyFont,
      labelClassName: "text-sm font-medium text-[color:var(--surface-muted-foreground)]",
      sampleClassName: "truncate text-sm text-[color:var(--surface-muted-foreground)]",
      specimenClassName: "text-[3.25rem] leading-none sm:text-[4rem]",
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
              <p className={sample.labelClassName} style={{ fontFamily: sample.labelFontFamily }}>
                {sample.title}
              </p>
              <p
                className={sample.sampleClassName}
                style={{
                  fontFamily: sample.fontFamily,
                  fontVariationSettings: sample.fontVariationSettings,
                }}
              >
                {sample.sample}
              </p>
            </div>
            <div className="flex items-end">
              <div
                className={sample.specimenClassName}
                style={{
                  fontFamily: sample.fontFamily,
                  fontVariationSettings: sample.fontVariationSettings,
                }}
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
      label="Button"
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
      label="Input Group"
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
      label="Field"
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

function ListItemCard() {
  return (
    <TesterTile label="List Item" className="flex items-center justify-center">
      <ListItem className="w-full max-w-sm">
        <ListItemBody>
          <ListItemIcon>
            <IconEarthSearchOutline18 aria-hidden />
          </ListItemIcon>
          <ListItemRow>
            <ListItemTitle>Web Search</ListItemTitle>
            <Badge
              variant="success"
              uppercase
              className="inline-block h-auto py-0 leading-normal tracking-normal"
            >
              /web
            </Badge>
          </ListItemRow>
          <ListItemDescription className="line-clamp-2">
            Search the web from a running agent.
          </ListItemDescription>
        </ListItemBody>
      </ListItem>
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
  variant = "underline",
  items,
  defaultValue,
}: {
  elegant: boolean;
  variant?: "underline" | "chip";
  defaultValue: string;
  items: StyleTesterTabItem[];
}) {
  return (
    <Tabs
      defaultValue={defaultValue}
      className={elegant ? "w-full max-w-xl overflow-visible" : "max-w-72"}
    >
      <TabsList variant={elegant ? variant : "underline"}>
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
      label="Tabs"
      className="flex items-center justify-center overflow-visible lg:col-span-2"
      style={{
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <div className="flex w-full flex-col items-center gap-10 overflow-visible px-1">
        <StyleTesterTabs
          elegant={isElegant}
          variant="underline"
          defaultValue="chat"
          items={STYLE_TESTER_WORKSPACE_TABS}
        />
        {isElegant ? (
          <StyleTesterTabs
            elegant
            variant="chip"
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
      label="Badge"
      className="flex items-center justify-center"
      style={{
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <div className="grid grid-cols-3 justify-items-center gap-x-3 gap-y-2">
        <Badge>Public</Badge>
        <Badge variant="accent">Pro</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="success">
          <Check className="size-2.5" aria-hidden="true" />
          Active
        </Badge>
        <Badge variant="destructive">
          <X className="size-2.5" aria-hidden="true" />
          Banned
        </Badge>
        <Badge variant="information">Unread</Badge>
      </div>
    </TesterTile>
  );
}

function SelectionCard() {
  return (
    <TesterTile
      label="Checkbox"
      className="grid place-items-center"
      style={{
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      }}
    >
      <div className="grid grid-cols-3 items-center gap-x-10 gap-y-7">
        <Checkbox size="md" aria-label="Unchecked" />
        <Checkbox size="md" color="default" defaultChecked aria-label="Checked default" />
        <Checkbox size="md" color="primary" defaultChecked aria-label="Checked primary" />
        <Checkbox size="md" indeterminate aria-label="Indeterminate" />
        <Checkbox size="md" variant="outline" aria-label="Outline unchecked" />
        <Checkbox size="md" variant="outline" defaultChecked aria-label="Outline checked" />
      </div>
    </TesterTile>
  );
}

function DropdownMenuCard({ style }: { style: StyleSpec }) {
  const isElegant = style.theme === "elegant";
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const anchor = useMemo(
    () => ({
      getBoundingClientRect() {
        const rect = containerElement?.getBoundingClientRect();
        const inset = 24;
        return DOMRect.fromRect({
          x: (rect?.left ?? 0) + (rect?.width ?? 0) / 2,
          y: (rect?.top ?? 0) + inset,
          width: 0,
          height: 0,
        });
      },
    }),
    [containerElement],
  );

  return (
    <TesterTile
      label="Dropdown Menu"
      className="overflow-hidden lg:col-span-2"
      ref={setContainerElement}
      style={{
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      }}
    >
      {containerElement ? (
        <DropdownMenu open modal={false}>
          <DropdownMenuContent
            anchor={anchor}
            side="bottom"
            align="center"
            sideOffset={0}
            className={isElegant ? "flex w-64 flex-col" : "w-64"}
            portalProps={{ container: containerElement }}
          >
            {isElegant ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <DropdownMenuItem className="items-center gap-1 py-2 pl-3.5">
                    <IconCircleCheckFill18 />
                    <span className="flex h-6 min-w-0 flex-1 items-center truncate text-left">
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
    </TesterTile>
  );
}

function FeedbackCard({ style }: { style: StyleSpec }) {
  const isElegant = style.theme === "elegant";

  return (
    <TesterTile
      label="Banner"
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
