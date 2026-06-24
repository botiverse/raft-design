import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, CircleX, Info, X } from "lucide-react";
import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  ThemeProvider,
  type BannerProps,
  type Theme,
} from "raft-ui";

export const Route = createFileRoute("/components/banner_/matrix")({
  staticData: { standalone: true },
  component: BannerMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];
const STATUSES = [
  "default",
  "destructive",
  "warning",
  "info",
  "success",
] as const satisfies readonly BannerProps["status"][];
const SIZES = ["sm", "md", "lg"] as const satisfies readonly NonNullable<BannerProps["size"]>[];
const WIDE_COLUMN_COUNT = 4;

const STATUS_ICON = {
  default: Info,
  destructive: CircleX,
  warning: CircleAlert,
  info: Info,
  success: CircleCheck,
} as const;

type MatrixCase = {
  label: string;
  render: (theme: Theme) => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  ...STATUSES.map((status) => ({
    label: status,
    render: () => {
      const Icon = STATUS_ICON[status];
      return (
        <Banner status={status} className="w-full max-w-md">
          <Icon />
          <BannerTitle>{formatLabel(status)}</BannerTitle>
          <BannerDescription>{getStatusDescription(status)}</BannerDescription>
        </Banner>
      );
    },
  })),
  ...SIZES.map((size) => ({
    label: `size ${size}`,
    render: () => (
      <Banner status="info" size={size} className="w-full max-w-md">
        <Info />
        <BannerTitle>{formatLabel(size)} banner</BannerTitle>
        <BannerDescription>{getSizeDescription(size)}</BannerDescription>
      </Banner>
    ),
  })),
  {
    label: "iconless",
    render: () => (
      <Banner status="warning" className="w-fit max-w-full">
        <BannerDescription>Please fix the highlighted fields.</BannerDescription>
      </Banner>
    ),
  },
  {
    label: "description only",
    render: () => (
      <Banner status="default" className="w-full max-w-md">
        <BannerDescription>Rules now apply to every project.</BannerDescription>
      </Banner>
    ),
  },
  {
    label: "title only",
    render: () => (
      <Banner status="success" className="w-full max-w-md">
        <CircleCheck />
        <BannerTitle>Deployment live</BannerTitle>
      </Banner>
    ),
  },
  {
    label: "action",
    render: () => (
      <Banner status="warning" className="w-full max-w-md">
        <CircleAlert />
        <BannerDescription>Add billing email and tax ID.</BannerDescription>
        <BannerAction>
          <Button variant="outline" size="xs">
            Review
          </Button>
        </BannerAction>
      </Banner>
    ),
  },
  {
    label: "dismiss action",
    render: () => (
      <Banner status="info" className="w-full max-w-md">
        <Info />
        <BannerDescription>You&rsquo;re on the free plan.</BannerDescription>
        <BannerAction>
          <Button size="icon-xs" aria-label="Dismiss">
            <X />
          </Button>
        </BannerAction>
      </Banner>
    ),
  },
  {
    label: "top action",
    render: () => (
      <Banner status="destructive" className="w-full max-w-md">
        <CircleX />
        <BannerTitle>Payment failed</BannerTitle>
        <BannerDescription>Retry to keep automations running.</BannerDescription>
        <BannerAction align="top">
          <Button variant="ghost" size="xs">
            Retry
          </Button>
        </BannerAction>
      </Banner>
    ),
  },
  {
    label: "large action",
    render: () => (
      <Banner status="info" size="lg" className="w-full max-w-md">
        <Info />
        <BannerDescription>You&rsquo;re on the free plan.</BannerDescription>
        <BannerAction>
          <Button size="icon-xs" aria-label="Dismiss">
            <X />
          </Button>
        </BannerAction>
      </Banner>
    ),
  },
];

const FILLER_CELL_COUNT =
  (WIDE_COLUMN_COUNT - ((THEMES.length * CASES.length) % WIDE_COLUMN_COUNT)) % WIDE_COLUMN_COUNT;

function BannerMatrixPage() {
  return (
    <main className="min-h-screen bg-white text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(13rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] lg:grid-cols-2 2xl:grid-cols-4">
        {THEMES.flatMap((theme) =>
          CASES.map((item) => (
            <MatrixCell
              key={`${theme}-${item.label}`}
              theme={theme}
              label={`${theme} / ${item.label}`}
            >
              {item.render(theme)}
            </MatrixCell>
          )),
        )}
        {Array.from({ length: FILLER_CELL_COUNT }).map((_, index) => (
          <div
            key={`filler-${index}`}
            data-matrix-filler
            aria-hidden
            className="hidden bg-white 2xl:block"
          />
        ))}
      </div>
    </main>
  );
}

function MatrixCell({
  theme,
  label,
  children,
}: {
  theme: Theme;
  label: string;
  children: ReactNode;
}) {
  return (
    <ThemeProvider theme={theme} syncDom={false}>
      <div
        data-theme={theme}
        className="relative flex min-w-0 items-center justify-center bg-white p-6 text-foreground"
      >
        <span className="absolute top-4 left-4 font-mono text-[10px] leading-none font-medium tracking-wide text-foreground-placeholder uppercase">
          {label}
        </span>
        <div className="flex w-full items-center justify-center">{children}</div>
      </div>
    </ThemeProvider>
  );
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusDescription(status: BannerProps["status"]) {
  switch (status) {
    case "default":
      return "Rules now apply to every project.";
    case "destructive":
      return "Retry to keep automations running.";
    case "warning":
      return "Add billing email and tax ID.";
    case "info":
      return "Upgrade to keep projects available.";
    case "success":
      return "Version 1.8.4 is in production.";
  }
}

function getSizeDescription(size: NonNullable<BannerProps["size"]>) {
  switch (size) {
    case "sm":
      return "Tight form-error banner.";
    case "md":
      return "Default banner.";
    case "lg":
      return "Prominent surface banner.";
  }
}
