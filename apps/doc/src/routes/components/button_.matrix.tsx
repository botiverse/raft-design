import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChevronRight, Plus, X } from "lucide-react";
import { Button, ThemeProvider, useTheme, type ButtonProps, type Theme } from "raft-ui";

export const Route = createFileRoute("/components/button_/matrix")({
  staticData: { standalone: true },
  component: ButtonMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];
const ELEGANT_BUTTON_FOCUS_VISIBLE_PREVIEW_CLASS_NAME =
  "outline outline-[1px] outline-offset-2 outline-[var(--button-focus-outline,transparent)]";
const FOCUS_VARIANTS = [
  "default",
  "primary",
  "outline",
  "information",
  "muted",
  "accent",
  "warning",
  "danger",
  "danger-secondary",
  "danger-outline",
] as const satisfies readonly NonNullable<ButtonProps["variant"]>[];

type MatrixCase = {
  label: string;
  render: (theme: Theme) => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "default",
    render: () => <Button>Default</Button>,
  },
  {
    label: "primary",
    render: () => <Button variant="primary">Primary</Button>,
  },
  {
    label: "outline",
    render: () => <Button variant="outline">Outline</Button>,
  },
  {
    label: "information",
    render: () => <Button variant="information">Information</Button>,
  },
  {
    label: "muted",
    render: () => <Button variant="muted">Muted</Button>,
  },
  {
    label: "accent",
    render: () => <Button variant="accent">Accent</Button>,
  },
  {
    label: "warning",
    render: () => <Button variant="warning">Warning</Button>,
  },
  {
    label: "danger",
    render: () => <Button variant="danger">Danger</Button>,
  },
  {
    label: "danger secondary",
    render: () => <Button variant="danger-secondary">Delete</Button>,
  },
  {
    label: "danger outline",
    render: () => <Button variant="danger-outline">Remove</Button>,
  },
  {
    label: "ghost",
    render: () => <Button variant="ghost">Ghost</Button>,
  },
  {
    label: "link",
    render: () => <Button variant="link">Link</Button>,
  },
  {
    label: "xs",
    render: () => <Button size="xs">Extra small</Button>,
  },
  {
    label: "sm",
    render: () => <Button size="sm">Small</Button>,
  },
  {
    label: "md",
    render: () => <Button size="md">Medium</Button>,
  },
  {
    label: "lg",
    render: () => <Button size="lg">Large</Button>,
  },
  {
    label: "icon xs",
    render: () => (
      <Button size="icon-xs" aria-label="Icon xs">
        <Plus />
      </Button>
    ),
  },
  {
    label: "icon sm",
    render: () => (
      <Button size="icon-sm" aria-label="Icon sm">
        <Plus />
      </Button>
    ),
  },
  {
    label: "icon md",
    render: () => (
      <Button size="icon-md" aria-label="Icon md">
        <Plus />
      </Button>
    ),
  },
  {
    label: "icon lg",
    render: () => (
      <Button size="icon-lg" aria-label="Icon lg">
        <Plus />
      </Button>
    ),
  },
  {
    label: "leading icon",
    render: () => (
      <Button variant="primary">
        <Plus data-icon="inline-start" />
        New
      </Button>
    ),
  },
  {
    label: "trailing icon",
    render: (theme) => (
      <Button variant="outline">
        Next
        {theme === "elegant" ? (
          <ChevronRight data-icon="inline-end" className="size-3" />
        ) : (
          <ChevronRight data-icon="inline-end" />
        )}
      </Button>
    ),
  },
  {
    label: "danger icon",
    render: () => (
      <Button variant="danger">
        <X data-icon="inline-start" />
        Delete
      </Button>
    ),
  },
  {
    label: "disabled",
    render: () => <Button disabled>Disabled</Button>,
  },
  ...FOCUS_VARIANTS.map((variant) => ({
    label: `${variant} focus visible`,
    render: () => (
      <ButtonFocusVisiblePreview variant={variant}>{variant}</ButtonFocusVisiblePreview>
    ),
  })),
  {
    label: "primary disabled",
    render: () => (
      <Button variant="primary" disabled>
        Primary
      </Button>
    ),
  },
  {
    label: "danger disabled",
    render: () => (
      <Button variant="danger" disabled>
        Danger
      </Button>
    ),
  },
  {
    label: "outline disabled",
    render: () => (
      <Button variant="outline" disabled>
        Outline
      </Button>
    ),
  },
  {
    label: "loading",
    render: () => <Button loading>Saving</Button>,
  },
  {
    label: "danger loading",
    render: () => (
      <Button variant="danger" loading loadingLabel="Deleting">
        Delete
      </Button>
    ),
  },
  ...(["xs", "sm", "md", "lg"] as const satisfies readonly NonNullable<ButtonProps["size"]>[]).map(
    (size) => ({
      label: `primary ${size}`,
      render: () => (
        <Button variant="primary" size={size}>
          {size.toUpperCase()}
        </Button>
      ),
    }),
  ),
] as const;

function ButtonFocusVisiblePreview({
  children,
  variant,
}: {
  children: ReactNode;
  variant?: ButtonProps["variant"];
}) {
  const { theme } = useTheme();

  return (
    <Button
      variant={variant}
      className={theme === "elegant" ? ELEGANT_BUTTON_FOCUS_VISIBLE_PREVIEW_CLASS_NAME : undefined}
    >
      {children}
    </Button>
  );
}

function ButtonMatrixPage() {
  return (
    <main className="min-h-screen bg-white text-foreground">
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
        className="relative flex min-w-0 items-center justify-center bg-white p-6 text-foreground"
      >
        <span className="absolute top-4 left-4 font-mono text-[10px] leading-none font-medium tracking-wide text-foreground-placeholder uppercase">
          {label}
        </span>
        <div className="flex min-h-12 items-center justify-center">{children}</div>
      </div>
    </ThemeProvider>
  );
}
