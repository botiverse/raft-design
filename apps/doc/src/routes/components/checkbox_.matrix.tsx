import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Checkbox, ThemeProvider, type CheckboxProps, type Theme } from "raft-ui";

export const Route = createFileRoute("/components/checkbox_/matrix")({
  staticData: { standalone: true },
  component: CheckboxMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

type MatrixCase = {
  label: string;
  render: (theme: Theme) => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "default unchecked",
    render: () => <Checkbox aria-label="Default unchecked" />,
  },
  {
    label: "primary unchecked",
    render: () => <Checkbox variant="primary" aria-label="Primary unchecked" />,
  },
  {
    label: "default checked",
    render: () => <Checkbox defaultChecked aria-label="Default checked" />,
  },
  {
    label: "primary checked",
    render: () => <Checkbox variant="primary" defaultChecked aria-label="Primary checked" />,
  },
  {
    label: "default mixed",
    render: () => <Checkbox indeterminate aria-label="Default mixed" />,
  },
  {
    label: "primary mixed",
    render: () => <Checkbox variant="primary" indeterminate aria-label="Primary mixed" />,
  },
  {
    label: "disabled unchecked",
    render: () => <Checkbox disabled aria-label="Disabled unchecked" />,
  },
  {
    label: "disabled checked",
    render: () => <Checkbox defaultChecked disabled aria-label="Disabled checked" />,
  },
  {
    label: "disabled mixed",
    render: () => <Checkbox indeterminate disabled aria-label="Disabled mixed" />,
  },
  {
    label: "primary disabled",
    render: () => <Checkbox variant="primary" disabled aria-label="Primary disabled" />,
  },
  {
    label: "primary checked disabled",
    render: () => (
      <Checkbox variant="primary" defaultChecked disabled aria-label="Primary checked disabled" />
    ),
  },
  {
    label: "primary mixed disabled",
    render: () => (
      <Checkbox variant="primary" indeterminate disabled aria-label="Primary mixed disabled" />
    ),
  },
  ...(["sm", "md"] as const satisfies readonly NonNullable<CheckboxProps["size"]>[]).flatMap(
    (size) => [
      {
        label: `${size} unchecked`,
        render: () => <Checkbox size={size} aria-label={`${size} unchecked`} />,
      },
      {
        label: `${size} checked`,
        render: () => <Checkbox size={size} defaultChecked aria-label={`${size} checked`} />,
      },
    ],
  ),
];

function CheckboxMatrixPage() {
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
