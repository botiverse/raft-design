import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button, Collapsible, CollapsiblePanel, CollapsibleTrigger, InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "raft-ui";

<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsiblePanel>Content</CollapsiblePanel>
</Collapsible>`,
  basic: `<Collapsible defaultOpen className="rounded-lg border border-line p-4">
  <div className="flex items-center justify-between">
    <span className="font-semibold text-sm">Collapsible Section</span>
    <CollapsibleTrigger
      render={
        <Button variant="ghost" size="icon-sm" aria-label="Toggle section">
          <ChevronDown className="size-4 transition-transform group-data-panel-open:rotate-180" />
        </Button>
      }
    />
  </div>
  <CollapsiblePanel>
    <div className="pt-3 text-sm text-foreground-muted">
      This is the disclosure content revealed when open. It gracefully animates height transitions.
    </div>
  </CollapsiblePanel>
</Collapsible>`,
  controlled: `const [open, setOpen] = useState(false);

<Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
  <CollapsibleTrigger
    render={
      <Button variant="outline" size="sm">
        {open ? "Hide advanced settings" : "Show advanced settings"}
      </Button>
    }
  />
  <CollapsiblePanel className="rounded-md border border-line-muted p-3 text-xs text-foreground-muted">
    Advanced debugging preferences and feature flags.
  </CollapsiblePanel>
</Collapsible>`,
} as const;

const COLLAPSIBLE_ROOT_PROPS: PropRow[] = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state of the collapsible panel.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Initial open state for uncontrolled usage.",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean, eventDetails: CollapsibleRootChangeEventDetails) => void",
    description: "Event handler called when open state changes.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Whether the trigger and panel interaction is disabled.",
  },
  {
    name: "render",
    type: "ReactElement | ((props: ComponentProps) => ReactElement)",
    description: "Custom render element or render function for the root container.",
  },
];

const COLLAPSIBLE_TRIGGER_PROPS: PropRow[] = [
  {
    name: "render",
    type: "ReactElement | ((props: ComponentProps) => ReactElement)",
    description: "Custom element to render as the trigger (e.g. Button or disclosure header).",
  },
  {
    name: "disabled",
    type: "boolean",
    description: "Overrides the disabled state of the parent Collapsible.",
  },
];

const COLLAPSIBLE_PANEL_PROPS: PropRow[] = [
  {
    name: "hiddenUntilFound",
    type: "boolean",
    default: "false",
    description: "Uses hidden='until-found' so in-page search can discover and open the panel.",
  },
  {
    name: "keepMounted",
    type: "boolean",
    default: "false",
    description: "Whether to keep panel content mounted in DOM when closed.",
  },
  {
    name: "render",
    type: "ReactElement | ((props: ComponentProps) => ReactElement)",
    description: "Custom render element or render function for the panel container.",
  },
];

function BasicExample() {
  return (
    <Collapsible defaultOpen className="w-full max-w-md rounded-lg border border-line p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">Collapsible Section</span>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Toggle section">
              <ChevronDown className="size-4" />
            </Button>
          }
        />
      </div>
      <CollapsiblePanel>
        <div className="pt-3 text-sm text-foreground-muted">
          This is the disclosure content revealed when open. It supports height transition and
          automatically manages ARIA relationships.
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

function ControlledExample() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-md space-y-2">
      <CollapsibleTrigger
        render={
          <Button variant="outline" size="sm">
            {open ? "Hide details" : "Show details"}
          </Button>
        }
      />
      <CollapsiblePanel className="rounded-md border border-line-muted p-3 text-xs text-foreground-muted">
        Controlled disclosure panel content driven by external React state.
      </CollapsiblePanel>
    </Collapsible>
  );
}

export const Route = createFileRoute("/components/collapsible")({
  loader: () => highlightSnippets({ data: SNIPPETS }),
  component: CollapsibleDocPage,
});

function CollapsibleDocPage() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Collapsible"
      description="An interactive disclosure primitive for expanding and collapsing content sections without domain styling assumptions."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Preview>
          <Preview.Canvas>
            <BasicExample />
          </Preview.Canvas>
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="basic" title="Basic">
            <p className="text-foreground-muted text-sm">
              Uncontrolled disclosure using <InlineCode>defaultOpen</InlineCode>.
            </p>
            <Preview>
              <Preview.Canvas>
                <BasicExample />
              </Preview.Canvas>
              <Preview.Code html={code.basic} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="controlled" title="Controlled">
            <p className="text-foreground-muted text-sm">
              Controlled disclosure via <InlineCode>open</InlineCode> and{" "}
              <InlineCode>onOpenChange</InlineCode>.
            </p>
            <Preview>
              <Preview.Canvas>
                <ControlledExample />
              </Preview.Canvas>
              <Preview.Code html={code.controlled} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <DocSubsection parentId="api" id="collapsible" title="Collapsible">
          <PropsTable rows={COLLAPSIBLE_ROOT_PROPS} />
        </DocSubsection>

        <DocSubsection parentId="api" id="collapsible-trigger" title="CollapsibleTrigger">
          <PropsTable rows={COLLAPSIBLE_TRIGGER_PROPS} />
        </DocSubsection>

        <DocSubsection parentId="api" id="collapsible-panel" title="CollapsiblePanel">
          <PropsTable rows={COLLAPSIBLE_PANEL_PROPS} />
        </DocSubsection>
      </DocSection>
    </DocPage>
  );
}
