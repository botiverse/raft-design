import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Search, Upload } from "lucide-react";
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
  ThemeProvider,
  type Theme,
} from "raft-ui";

export const Route = createFileRoute("/components/input-group_/matrix")({
  staticData: { standalone: true },
  component: InputGroupMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

type MatrixCase = {
  label: string;
  render: () => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "default",
    render: () => (
      <InputGroup>
        <InputGroupInput aria-label="Email" placeholder="you@example.com" />
      </InputGroup>
    ),
  },
  {
    label: "search",
    render: () => (
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search..." />
      </InputGroup>
    ),
  },
  {
    label: "slug",
    render: () => (
      <InputGroup>
        <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
        <InputGroupInput aria-label="Server slug" placeholder="my-server" />
      </InputGroup>
    ),
  },
  {
    label: "domain",
    render: () => (
      <InputGroup>
        <InputGroupAddon.Text variant="container">https://</InputGroupAddon.Text>
        <InputGroupInput aria-label="Domain" placeholder="Default" />
        <InputGroupAddon.Text align="inline-end" variant="container">
          .com
        </InputGroupAddon.Text>
      </InputGroup>
    ),
  },
  {
    label: "currency",
    render: () => (
      <InputGroup>
        <InputGroupAddon.Text>$</InputGroupAddon.Text>
        <InputGroupInput aria-label="Amount" placeholder="0.00" inputMode="decimal" />
        <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
      </InputGroup>
    ),
  },
  {
    label: "container icon",
    render: () => (
      <InputGroup>
        <InputGroupAddon variant="container">
          <Upload />
        </InputGroupAddon>
        <InputGroupInput aria-label="Upload target" placeholder="Default" />
      </InputGroup>
    ),
  },
  {
    label: "kbd action",
    render: () => (
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" placeholder="Search projects..." />
        <InputGroupAddon align="inline-end">
          <Kbd>Cmd K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    ),
  },
  {
    label: "button action",
    render: () => (
      <InputGroup>
        <InputGroupInput aria-label="Invite email" placeholder="teammate@example.com" />
        <InputGroupAddon align="inline-end" className="px-1">
          <Button size="xs">Invite</Button>
        </InputGroupAddon>
      </InputGroup>
    ),
  },
  {
    label: "invalid",
    render: () => (
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput aria-label="Search" aria-invalid defaultValue="???" />
      </InputGroup>
    ),
  },
  {
    label: "disabled",
    render: () => (
      <InputGroup>
        <InputGroupAddon.Text>$</InputGroupAddon.Text>
        <InputGroupInput aria-label="Amount" disabled placeholder="0.00" />
        <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
      </InputGroup>
    ),
  },
  {
    label: "invalid container",
    render: () => (
      <InputGroup>
        <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
        <InputGroupInput aria-label="Server slug" aria-invalid defaultValue="Bad Slug" />
      </InputGroup>
    ),
  },
  {
    label: "end container",
    render: () => (
      <InputGroup>
        <InputGroupInput aria-label="Project slug" placeholder="Default" />
        <InputGroupAddon variant="container" align="inline-end">
          <Upload />
        </InputGroupAddon>
      </InputGroup>
    ),
  },
];

function InputGroupMatrixPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(12rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] lg:grid-cols-2 2xl:grid-cols-4">
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
        className="relative flex min-w-0 items-center justify-center bg-background p-6 text-foreground"
      >
        <span className="absolute top-4 left-4 font-mono text-[10px] leading-none font-medium tracking-wide text-foreground-placeholder uppercase">
          {label}
        </span>
        <div className="flex w-96 max-w-full items-center justify-center">{children}</div>
      </div>
    </ThemeProvider>
  );
}
