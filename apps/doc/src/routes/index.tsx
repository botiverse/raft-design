import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Status,
  Textarea,
  TextareaCounter,
  TextareaGroup,
  ThemeProvider,
  type Theme,
} from "@slock/ui";
import { IconCircleCheckFill18 } from "nucleo-ui-fill-18";
import { Plus, Search, Trash2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

type ComponentRoute =
  | "/components/button"
  | "/components/checkbox"
  | "/components/input"
  | "/components/input-group"
  | "/components/textarea"
  | "/components/badge"
  | "/components/status";

type ComponentGridItem = {
  label: string;
  to: ComponentRoute;
  preview: ReactNode;
};

type ThemePreset = {
  id: "brutal" | "elegant";
  label: string;
  family: Theme;
  mode: "light";
};

const THEME_PRESETS = [
  { id: "brutal", label: "brutal", family: "brutal", mode: "light" },
  { id: "elegant", label: "elegant", family: "elegant", mode: "light" },
] as const satisfies readonly ThemePreset[];

const FLOAT_ACTIONS_SHADOW =
  "oklch(0.145 0.002 286.131 / 0.071) 0px 0.5px 0px, oklch(0.145 0.002 286.131 / 0.039) 0px 1px 2px -1px";

const COMPONENT_GRID = [
  {
    label: "Button",
    to: "/components/button",
    preview: (
      <div className="grid justify-items-center gap-2">
        <Button variant="default" size="sm">
          Filter
        </Button>
        <Button variant="primary" size="sm">
          <Plus data-icon="inline-start" />
          New
        </Button>
        <Button variant="outline" size="sm">
          Details
        </Button>
        <Button variant="danger" size="sm">
          <Trash2 data-icon="inline-start" />
          Delete thread
        </Button>
      </div>
    ),
  },
  {
    label: "Checkbox",
    to: "/components/checkbox",
    preview: (
      <div className="grid grid-cols-2 gap-3">
        <Checkbox defaultChecked aria-label="Checked checkbox" />
        <Checkbox aria-label="Unchecked checkbox" />
        <Checkbox indeterminate aria-label="Indeterminate checkbox" />
        <Checkbox defaultChecked variant="primary" aria-label="Primary checked checkbox" />
      </div>
    ),
  },
  {
    label: "Input",
    to: "/components/input",
    preview: (
      <div className="grid w-64 gap-2">
        <Input aria-label="Email" placeholder="you@example.com" />
        <Input aria-label="Workspace" defaultValue="raft-design" />
        <Input aria-label="Invalid email" aria-invalid defaultValue="oops" />
      </div>
    ),
  },
  {
    label: "InputGroup",
    to: "/components/input-group",
    preview: (
      <div className="grid w-64 gap-2">
        <InputGroup>
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput aria-label="Search" placeholder="Search..." />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon.Text variant="container">$</InputGroupAddon.Text>
          <InputGroupInput aria-label="Amount" placeholder="0.00" inputMode="decimal" />
          <InputGroupAddon.Text align="inline-end" variant="container">
            USD
          </InputGroupAddon.Text>
        </InputGroup>
      </div>
    ),
  },
  {
    label: "Textarea",
    to: "/components/textarea",
    preview: (
      <div className="grid w-64 gap-2">
        <TextareaGroup>
          <Textarea
            aria-label="Message"
            rows={4}
            defaultValue="Draft the release note."
            className="resize-none"
          />
          <TextareaCounter value="Draft the release note." limit={120} />
        </TextareaGroup>
      </div>
    ),
  },
  {
    label: "Badge",
    to: "/components/badge",
    preview: (
      <div className="grid justify-items-center gap-2">
        <div className="flex max-w-64 flex-wrap items-center justify-center gap-2">
          <Badge>Saved</Badge>
          <Badge variant="accent">New</Badge>
          <Badge variant="success">Live</Badge>
          <Badge variant="danger">Failed</Badge>
        </div>
        <div className="flex max-w-64 flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">
            <IconCircleCheckFill18 className="size-3" />
            Approved
          </Badge>
          <Badge appearance="outline" variant="success">
            <Status size="xs" variant="success" />
            Online
          </Badge>
          <Badge appearance="outline" variant="information">
            task #42 @bugen
          </Badge>
        </div>
      </div>
    ),
  },
  {
    label: "Status",
    to: "/components/status",
    preview: (
      <div className="flex items-center gap-4">
        <Status variant="success" pulse aria-label="Online" />
        <Status variant="primary" aria-label="Queued" />
        <Status variant="accent" aria-label="Unread" />
      </div>
    ),
  },
] as const satisfies readonly ComponentGridItem[];

function Home() {
  const [themePreset, setThemePreset] = useState<ThemePreset>(THEME_PRESETS[1]);

  return (
    <ThemeProvider theme={themePreset.family}>
      <div
        data-theme={themePreset.family}
        className="min-h-screen bg-background pb-28 text-foreground"
        style={{ colorScheme: themePreset.mode }}
      >
        <div className="grid grid-cols-1 border-l border-line-subtle bg-background sm:grid-cols-2 xl:grid-cols-4">
          {COMPONENT_GRID.map((item) => (
            <article
              key={item.label}
              className={[
                "relative isolate h-[420px] overflow-hidden",
                "border-b border-r border-line-subtle bg-background",
              ].join(" ")}
            >
              <Link
                to={item.to}
                aria-label={`Open ${item.label} details`}
                className="absolute inset-0 z-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              />
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-8 py-10">
                <div className="pointer-events-auto flex max-w-full items-center justify-center">
                  {item.preview}
                </div>
              </div>
              <h2 className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-xs font-medium text-foreground-placeholder">
                {item.label}
              </h2>
            </article>
          ))}
        </div>

        <fieldset
          aria-label="Preview theme"
          className={[
            "fixed bottom-6 left-[calc(50vw+var(--rail-w)/2)] z-20 -translate-x-1/2",
            "inline-flex items-center gap-1 rounded-md border border-black/10 bg-white/95 p-1 text-black backdrop-blur",
          ].join(" ")}
          style={{ boxShadow: FLOAT_ACTIONS_SHADOW }}
        >
          {THEME_PRESETS.map((preset) => {
            const isActive = themePreset.id === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={isActive}
                className={[
                  "h-8 rounded-md px-3 text-xs font-medium outline-none",
                  "focus-visible:ring-2 focus-visible:ring-black/20",
                  isActive ? "rounded-full bg-black/5 text-black" : "text-black/45",
                ].join(" ")}
                onClick={() => setThemePreset(preset)}
              >
                {preset.label}
              </button>
            );
          })}
        </fieldset>
      </div>
    </ThemeProvider>
  );
}
