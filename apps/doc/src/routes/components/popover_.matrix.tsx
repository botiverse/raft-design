import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode, RefObject } from "react";
import { useId, useRef } from "react";
import { Check, SlidersHorizontal } from "lucide-react";
import {
  Button,
  Field,
  FieldLabel,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  ThemeProvider,
  type Theme,
} from "@slock/ui";

export const Route = createFileRoute("/components/popover_/matrix")({
  staticData: { standalone: true },
  component: PopoverMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

const OPTIONS = ["All", "Unread", "Mentions", "Archived"] as const;

type MatrixCase = {
  label: string;
  render: () => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "filter",
    render: () => <MatrixFilterPopover />,
  },
  {
    label: "form",
    render: () => <MatrixFormPopover />,
  },
  {
    label: "opened",
    render: () => <MatrixOpenedPopover />,
  },
];

function PopoverMatrixPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(18rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] lg:grid-cols-2 2xl:grid-cols-4">
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
    <ThemeProvider theme={theme}>
      <div
        data-theme={theme}
        className="relative flex min-w-0 items-start justify-center bg-background p-6 pt-12 text-foreground"
      >
        <span className="absolute top-4 left-4 font-mono text-[10px] leading-none font-medium tracking-wide text-foreground-placeholder uppercase">
          {label}
        </span>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </ThemeProvider>
  );
}

function MatrixPopoverShell({
  label,
  children,
  open = true,
}: {
  label: string;
  children: ReactNode;
  open?: boolean;
}) {
  const triggerId = useId();
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex min-h-56 w-full items-start justify-center">
      <Popover open={open} modal={false} triggerId={triggerId}>
        <PopoverTrigger id={triggerId} render={<Button variant="outline" size="sm" />}>
          <SlidersHorizontal />
          {label}
        </PopoverTrigger>
        <PopoverContent
          align="center"
          positionMethod="absolute"
          sideOffset={8}
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="min-w-[220px]"
        >
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function MatrixFilterPopover() {
  return (
    <MatrixPopoverShell label="Filter">
      <PopoverHeader>
        <PopoverTitle>Filter</PopoverTitle>
      </PopoverHeader>
      <MatrixOptionRows selected="Unread" />
    </MatrixPopoverShell>
  );
}

function MatrixFormPopover() {
  return (
    <MatrixPopoverShell label="Edit">
      <PopoverHeader>
        <PopoverTitle>Edit profile</PopoverTitle>
      </PopoverHeader>
      <div className="space-y-3 p-3">
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input defaultValue="Ada Lovelace" />
        </Field>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input defaultValue="ada@example.com" />
        </Field>
      </div>
    </MatrixPopoverShell>
  );
}

function MatrixOpenedPopover() {
  return (
    <MatrixPopoverShell label="Details">
      <PopoverHeader>
        <PopoverTitle>Details</PopoverTitle>
        <PopoverClose>Close</PopoverClose>
      </PopoverHeader>
      <div className="space-y-1 px-3 py-3">
        <PopoverDescription>
          Popover shell styling is theme-owned; body content stays caller-composed.
        </PopoverDescription>
      </div>
    </MatrixPopoverShell>
  );
}

function MatrixOptionRows({ selected }: { selected: string }) {
  return (
    <div className="max-h-64 overflow-y-auto">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className="flex h-9 w-full items-center justify-between gap-2 overflow-hidden border-b border-black/10 bg-white px-3 text-left text-xs font-bold last:border-b-0 hover:bg-brutal-yellow/30"
        >
          <span className="truncate leading-6">{option}</span>
          {selected === option ? <Check size={12} className="shrink-0" /> : null}
        </button>
      ))}
    </div>
  );
}
