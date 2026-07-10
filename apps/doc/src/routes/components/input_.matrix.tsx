import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Input, ThemeProvider, type Theme } from "raft-ui";

export const Route = createFileRoute("/components/input_/matrix")({
  staticData: { standalone: true },
  component: InputMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

type MatrixCase = {
  label: string;
  render: () => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "default",
    render: () => <Input aria-label="Email" placeholder="you@example.com" />,
  },
  {
    label: "value",
    render: () => <Input aria-label="Email" defaultValue="alex@example.com" />,
  },
  {
    label: "email",
    render: () => (
      <Input
        aria-label="Email"
        type="email"
        name="email"
        autoComplete="email"
        spellCheck={false}
        placeholder="you@example.com"
      />
    ),
  },
  {
    label: "numeric",
    render: () => (
      <Input
        aria-label="Verification code"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="123456"
      />
    ),
  },
  {
    label: "invalid",
    render: () => <Input aria-label="Email" aria-invalid defaultValue="oops" />,
  },
  {
    label: "disabled",
    render: () => <Input aria-label="Email" disabled placeholder="Disabled" />,
  },
  {
    label: "invalid disabled",
    render: () => <Input aria-label="Email" aria-invalid disabled defaultValue="Locked error" />,
  },
  {
    label: "password managers",
    render: () => (
      <Input aria-label="Search" suppressPasswordManager placeholder="Search customers..." />
    ),
  },
];

function InputMatrixPage() {
  return (
    <main className="min-h-screen bg-white text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(11rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] md:grid-cols-2 xl:grid-cols-4">
        {THEMES.flatMap((theme) =>
          CASES.map((item) => (
            <MatrixCell
              key={`${theme}-${item.label}`}
              theme={theme}
              label={`${theme} / ${item.label}`}
            >
              {item.render()}
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
        className="relative flex min-w-0 items-center justify-center bg-white p-6 text-foreground"
      >
        <span className="absolute top-4 left-4 font-mono text-[10px] leading-none font-medium tracking-wide text-foreground-placeholder uppercase">
          {label}
        </span>
        <div className="flex w-80 max-w-full items-center justify-center">{children}</div>
      </div>
    </ThemeProvider>
  );
}
