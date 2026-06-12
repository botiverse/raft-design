import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { IconCircleCheckFill18 } from "nucleo-ui-fill-18";
import { IconXmarkOutline18 } from "nucleo-ui-outline-18";
import { Badge, Status, ThemeProvider, type BadgeProps, type Theme } from "@slock/ui";

export const Route = createFileRoute("/components/badge_/matrix")({
  staticData: { standalone: true },
  component: BadgeMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];
const APPEARANCES = ["solid", "soft", "outline"] as const satisfies readonly NonNullable<
  BadgeProps["appearance"]
>[];
const VARIANTS = [
  "default",
  "primary",
  "information",
  "muted",
  "accent",
  "success",
  "danger",
] as const satisfies readonly NonNullable<BadgeProps["variant"]>[];

type MatrixCase = {
  label: string;
  render: (theme: Theme) => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  ...APPEARANCES.flatMap((appearance) =>
    VARIANTS.map((variant) => ({
      label: `${appearance} ${variant}`,
      render: () => (
        <Badge appearance={appearance} variant={variant}>
          {formatLabel(variant)}
        </Badge>
      ),
    })),
  ),
  {
    label: "uppercase",
    render: () => (
      <Badge variant="primary" uppercase>
        In Progress
      </Badge>
    ),
  },
  {
    label: "leading icon",
    render: () => (
      <Badge variant="success">
        <IconCircleCheckFill18 className="size-3" />
        Approved
      </Badge>
    ),
  },
  {
    label: "status icon",
    render: () => (
      <Badge appearance="outline" variant="success">
        <Status size="xs" variant="success" />
        Online
      </Badge>
    ),
  },
  {
    label: "removable",
    render: () => (
      <Badge appearance="soft" variant="danger">
        @bugen
        <IconXmarkOutline18 className="size-3" />
      </Badge>
    ),
  },
  {
    label: "experimental",
    render: () => <Badge.Experimental />,
  },
  {
    label: "button",
    render: () => (
      <Badge
        render={<button type="button" aria-label="Open thread replies" />}
        variant="information"
      >
        3 replies
      </Badge>
    ),
  },
  {
    label: "metadata",
    render: () => (
      <Badge appearance="outline" variant="muted">
        workspace-sync
      </Badge>
    ),
  },
];

function BadgeMatrixPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(10rem,1fr)] grid-cols-2 gap-px bg-[oklch(0_0_0_/_0.08)] md:grid-cols-4 xl:grid-cols-8">
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
    <ThemeProvider theme={theme}>
      <div
        data-theme={theme}
        className="relative flex min-w-0 items-center justify-center bg-background p-6 text-foreground"
      >
        <span className="absolute top-4 left-4 font-mono text-[10px] leading-none font-medium tracking-wide text-foreground-placeholder uppercase">
          {label}
        </span>
        <div className="flex min-h-12 items-center justify-center">{children}</div>
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
