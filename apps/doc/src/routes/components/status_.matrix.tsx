import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Status, ThemeProvider, type StatusProps, type Theme } from "@raft/ui";

export const Route = createFileRoute("/components/status_/matrix")({
  staticData: { standalone: true },
  component: StatusMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];
const VARIANTS = [
  "default",
  "primary",
  "information",
  "muted",
  "accent",
  "success",
  "warning",
  "danger",
] as const satisfies readonly NonNullable<StatusProps["variant"]>[];
const SIZES = ["xs", "sm", "md", "lg"] as const satisfies readonly NonNullable<
  StatusProps["size"]
>[];

type MatrixCase = {
  label: string;
  render: (theme: Theme) => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  ...VARIANTS.map((variant) => ({
    label: variant,
    render: () => <Status variant={variant} />,
  })),
  ...SIZES.map((size) => ({
    label: `size ${size}`,
    render: () => <Status size={size} variant="success" />,
  })),
  ...VARIANTS.map((variant) => ({
    label: `${variant} pulse`,
    render: () => <Status variant={variant} pulse />,
  })),
  {
    label: "custom",
    render: () => <Status className="[--status-color:var(--color-brutal-purple-300)]" />,
  },
  {
    label: "custom pulse",
    render: () => <Status pulse className="[--status-color:var(--color-brutal-purple-300)]" />,
  },
  {
    label: "large danger pulse",
    render: () => <Status size="lg" variant="danger" pulse />,
  },
  {
    label: "large warning",
    render: () => <Status size="lg" variant="warning" />,
  },
];

function StatusMatrixPage() {
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
