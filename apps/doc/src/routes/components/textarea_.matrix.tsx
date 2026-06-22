import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Textarea,
  TextareaCounter,
  TextareaGroup,
  ThemeProvider,
  type Theme,
} from "@raft/ui";

export const Route = createFileRoute("/components/textarea_/matrix")({
  staticData: { standalone: true },
  component: TextareaMatrixPage,
});

const THEMES = ["brutal", "elegant"] as const satisfies readonly Theme[];

type MatrixCase = {
  label: string;
  render: (theme: Theme) => ReactNode;
};

const CASES: readonly MatrixCase[] = [
  {
    label: "default",
    render: () => <Textarea aria-label="Message" rows={4} placeholder="Type your message here." />,
  },
  {
    label: "value",
    render: () => <Textarea aria-label="Message" rows={4} defaultValue="Hello world." />,
  },
  {
    label: "invalid",
    render: () => <Textarea aria-label="Message" rows={4} aria-invalid defaultValue="oops" />,
  },
  {
    label: "disabled",
    render: () => <Textarea aria-label="Message" rows={4} disabled placeholder="Disabled" />,
  },
  {
    label: "invalid disabled",
    render: () => (
      <Textarea aria-label="Message" rows={4} aria-invalid disabled defaultValue="Locked error" />
    ),
  },
  {
    label: "counter",
    render: () => (
      <TextareaGroup>
        <Textarea aria-label="Message" rows={4} defaultValue="The quick brown fox." />
        <TextareaCounter value="The quick brown fox." limit={24} />
      </TextareaGroup>
    ),
  },
  {
    label: "over limit",
    render: () => (
      <TextareaGroup>
        <Textarea aria-label="Message" rows={4} defaultValue="The quick brown fox jumps." />
        <TextareaCounter value="The quick brown fox jumps." limit={24} />
      </TextareaGroup>
    ),
  },
  {
    label: "auto grow",
    render: () => (
      <Textarea
        aria-label="Auto growing message"
        className="field-sizing-content max-h-80 resize-none overflow-y-auto"
        placeholder="Type a few lines..."
      />
    ),
  },
  {
    label: "field",
    render: (theme) => (
      <Field>
        <FieldLabel htmlFor={`${theme}-matrix-message`}>Message</FieldLabel>
        <TextareaGroup>
          <Textarea id={`${theme}-matrix-message`} rows={4} defaultValue="Hello world." />
          <TextareaCounter value="Hello world." limit={120} />
        </TextareaGroup>
        <FieldDescription>Enter your message below.</FieldDescription>
      </Field>
    ),
  },
  {
    label: "field invalid",
    render: (theme) => (
      <Field invalid>
        <FieldLabel htmlFor={`${theme}-matrix-invalid-message`}>Message</FieldLabel>
        <TextareaGroup>
          <Textarea
            id={`${theme}-matrix-invalid-message`}
            rows={4}
            aria-invalid
            defaultValue="oops"
          />
          <TextareaCounter value="oops" limit={120} />
        </TextareaGroup>
        <FieldError match>Message is required.</FieldError>
      </Field>
    ),
  },
];

function TextareaMatrixPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen auto-rows-[minmax(17rem,1fr)] grid-cols-1 gap-px bg-[oklch(0_0_0_/_0.08)] lg:grid-cols-2 2xl:grid-cols-4">
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
