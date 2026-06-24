import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Label, ThemeProvider, type Theme } from "raft-ui";

export const Route = createFileRoute("/components/label_/matrix")({
  staticData: { standalone: true },
  component: LabelMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

type MatrixCase = {
  label: string;
  render: (theme: Theme) => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "default",
    render: (theme) => <Label htmlFor={`${theme}-matrix-email`}>Email address</Label>,
  },
  {
    label: "required",
    render: (theme) => (
      <Label htmlFor={`${theme}-matrix-required-email`}>
        Email address
        <Label.Asterisk />
      </Label>
    ),
  },
  {
    label: "optional",
    render: (theme) => (
      <Label htmlFor={`${theme}-matrix-middle-name`}>
        Middle name
        <Label.Sub>(optional)</Label.Sub>
      </Label>
    ),
  },
  {
    label: "information icon",
    render: (theme) => (
      <Label htmlFor={`${theme}-matrix-project-url`}>
        Project URL
        <Info aria-hidden className="size-3.5 text-foreground/40" />
      </Label>
    ),
  },
  {
    label: "small",
    render: (theme) => (
      <Label htmlFor={`${theme}-matrix-compact-name`} size="sm">
        Display name
      </Label>
    ),
  },
  {
    label: "small optional",
    render: (theme) => (
      <Label htmlFor={`${theme}-matrix-compact-note`} size="sm">
        Internal note
        <Label.Sub>(optional)</Label.Sub>
      </Label>
    ),
  },
  {
    label: "disabled",
    render: (theme) => (
      <Label htmlFor={`${theme}-matrix-disabled-email`} disabled>
        Email address
      </Label>
    ),
  },
  {
    label: "disabled required",
    render: (theme) => (
      <Label htmlFor={`${theme}-matrix-disabled-required-email`} disabled>
        Email address
        <Label.Asterisk />
      </Label>
    ),
  },
];

function LabelMatrixPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(10rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] md:grid-cols-2 xl:grid-cols-4">
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
    <ThemeProvider theme={theme} syncDom={false}>
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
