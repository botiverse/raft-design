import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Checkbox,
  Input,
  Textarea,
  TextareaCounter,
  TextareaGroup,
  ThemeProvider,
  type Theme,
} from "raft-ui";
import { Field, FieldDescription, FieldError, FieldItem, FieldLabel } from "raft-ui/wip";

export const Route = createFileRoute("/components/field_/matrix")({
  staticData: { standalone: true },
  component: FieldMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

type MatrixCase = {
  label: string;
  render: (theme: Theme) => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "default",
    render: (theme) => (
      <Field>
        <FieldLabel htmlFor={`${theme}-matrix-email`}>Email</FieldLabel>
        <Input id={`${theme}-matrix-email`} placeholder="you@example.com" />
      </Field>
    ),
  },
  {
    label: "required",
    render: (theme) => (
      <Field>
        <FieldLabel htmlFor={`${theme}-matrix-required-email`} required>
          Email
        </FieldLabel>
        <Input id={`${theme}-matrix-required-email`} placeholder="you@example.com" />
      </Field>
    ),
  },
  {
    label: "optional",
    render: (theme) => (
      <Field>
        <FieldLabel htmlFor={`${theme}-matrix-middle-name`} optional>
          Middle name
        </FieldLabel>
        <Input id={`${theme}-matrix-middle-name`} placeholder="Alex" />
      </Field>
    ),
  },
  {
    label: "description",
    render: (theme) => (
      <Field>
        <FieldLabel htmlFor={`${theme}-matrix-workspace`}>Workspace</FieldLabel>
        <Input id={`${theme}-matrix-workspace`} defaultValue="raft-design" />
        <FieldDescription>Visible to everyone in this server.</FieldDescription>
      </Field>
    ),
  },
  {
    label: "invalid",
    render: (theme) => (
      <Field invalid>
        <FieldLabel htmlFor={`${theme}-matrix-invalid-email`}>Email</FieldLabel>
        <Input id={`${theme}-matrix-invalid-email`} aria-invalid defaultValue="oops" />
        <FieldError match>Email is required.</FieldError>
      </Field>
    ),
  },
  {
    label: "disabled",
    render: (theme) => (
      <Field disabled>
        <FieldLabel htmlFor={`${theme}-matrix-disabled-email`}>Email</FieldLabel>
        <Input id={`${theme}-matrix-disabled-email`} disabled placeholder="Disabled" />
        <FieldDescription>This field is locked.</FieldDescription>
      </Field>
    ),
  },
  {
    label: "small label",
    render: (theme) => (
      <Field>
        <FieldLabel htmlFor={`${theme}-matrix-display-name`} size="sm">
          Display name
        </FieldLabel>
        <Input id={`${theme}-matrix-display-name`} defaultValue="Alex" />
      </Field>
    ),
  },
  {
    label: "textarea",
    render: (theme) => (
      <Field>
        <FieldLabel htmlFor={`${theme}-matrix-message`}>Message</FieldLabel>
        <TextareaGroup>
          <Textarea id={`${theme}-matrix-message`} rows={4} defaultValue="Draft a note." />
          <TextareaCounter value="Draft a note." limit={120} />
        </TextareaGroup>
        <FieldDescription>Markdown is supported.</FieldDescription>
      </Field>
    ),
  },
  {
    label: "textarea invalid",
    render: (theme) => (
      <Field invalid>
        <FieldLabel htmlFor={`${theme}-matrix-invalid-message`}>Message</FieldLabel>
        <TextareaGroup>
          <Textarea
            id={`${theme}-matrix-invalid-message`}
            rows={4}
            aria-invalid
            defaultValue="Hi."
          />
          <TextareaCounter value="Hi." limit={120} />
        </TextareaGroup>
        <FieldError match>Tell us a bit more.</FieldError>
      </Field>
    ),
  },
  {
    label: "choice item",
    render: (theme) => (
      <Field>
        <FieldItem>
          <Checkbox id={`${theme}-matrix-notify`} defaultChecked />
          <div>
            <FieldLabel htmlFor={`${theme}-matrix-notify`}>Notify teammates</FieldLabel>
            <FieldDescription>Send an update when this changes.</FieldDescription>
          </div>
        </FieldItem>
      </Field>
    ),
  },
];

function FieldMatrixPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(16rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] lg:grid-cols-2 2xl:grid-cols-4">
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
        <div className="flex w-80 max-w-full items-center justify-center">{children}</div>
      </div>
    </ThemeProvider>
  );
}
