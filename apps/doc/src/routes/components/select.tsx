import { useRef, useState, type RefObject } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  IconClockOutline18,
  IconInputSearchOutline18,
  IconMessageOutline18,
} from "nucleo-ui-outline-18";
import {
  Field,
  FieldDescription,
  FieldLabel,
  InlineCode,
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@raft/ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { createCompositionSourceMap } from "#/lib/source-comparison-code.ts";
import selectOptionsListCompositionSource from "#/compositions/select-options-list-composition.tsx?raw";
import {
  SELECT_OPTIONS_LIST_COMPOSITION_PATH,
  SelectOptionsListComposition,
  SelectOptionsListSourcePreview,
} from "#/compositions/select-options-list.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "icons", title: "Icons" },
  { id: "groups", title: "Groups" },
  { id: "states", title: "States" },
  { id: "scrolling", title: "Scrolling" },
  { id: "field", title: "With Field" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Most recent" },
  { value: "comments", label: "Most commented" },
] as const;

const SORT_ICON_OPTIONS = [
  { value: "relevance", label: "Relevance", icon: IconInputSearchOutline18 },
  { value: "recent", label: "Most recent", icon: IconClockOutline18 },
  { value: "comments", label: "Most commented", icon: IconMessageOutline18 },
] as const;

const BRANCH_OPTIONS = [
  { value: "main", label: "main", group: "Production" },
  { value: "release", label: "release/2026-06", group: "Production" },
  { value: "staging", label: "staging", group: "Preview" },
] as const;

const REGION_OPTIONS = [
  { value: "us-east", label: "US East" },
  { value: "us-west", label: "US West" },
  { value: "eu-west", label: "EU West" },
  { value: "eu-central", label: "EU Central" },
  { value: "ap-south", label: "AP South" },
  { value: "ap-northeast", label: "AP Northeast" },
  { value: "ap-southeast", label: "AP Southeast" },
  { value: "ap-east", label: "AP East" },
  { value: "sa-east", label: "SA East" },
  { value: "af-south", label: "AF South" },
  { value: "ca-central", label: "Canada Central" },
  { value: "me-central", label: "Middle East" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];
type SortIconValue = (typeof SORT_ICON_OPTIONS)[number]["value"];

const SNIPPETS = {
  anatomy: `import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@raft/ui";

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Most recent" },
  { value: "comments", label: "Most commented" },
] as const;

<Select defaultValue="relevance" items={sortOptions}>
  <SelectTrigger>
    <SelectValue placeholder="Sort" />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent className="w-[220px]">
    <SelectList>
      {sortOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          <SelectItemText>{option.label}</SelectItemText>
          <SelectItemIndicator />
        </SelectItem>
      ))}
    </SelectList>
  </SelectContent>
</Select>`,
  icons: `import { useState } from "react";
import {
  IconClockOutline18,
  IconInputSearchOutline18,
  IconMessageOutline18,
} from "nucleo-ui-outline-18";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "@raft/ui";

const sortOptions = [
  { value: "relevance", label: "Relevance", icon: IconInputSearchOutline18 },
  { value: "recent", label: "Most recent", icon: IconClockOutline18 },
  { value: "comments", label: "Most commented", icon: IconMessageOutline18 },
] as const;

function SortSelectWithIcons() {
  const [value, setValue] = useState("relevance");

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          setValue(nextValue);
        }
      }}
      items={sortOptions}
    >
      <SelectTrigger>
        <SelectValue>
          {(selectedValue) => {
            const selected = sortOptions.find((option) => option.value === selectedValue);
            const Icon = selected?.icon;

            return selected && Icon ? (
              <span className="flex min-w-0 items-center gap-2">
                <Icon aria-hidden className="size-3.5 shrink-0 stroke-[1.5]" />
                <span className="truncate">{selected.label}</span>
              </span>
            ) : (
              "Sort"
            );
          }}
        </SelectValue>
        <SelectIcon />
      </SelectTrigger>
      <SelectContent className="w-[220px]">
        <SelectList>
          {sortOptions.map((option) => {
            const Icon = option.icon;

            return (
              <SelectItem key={option.value} value={option.value}>
                <Icon aria-hidden className="size-3.5 shrink-0 stroke-[1.5] opacity-80" />
                <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            );
          })}
        </SelectList>
      </SelectContent>
    </Select>
  );
}`,
  groups: `const branchOptions = [
  { value: "main", label: "main", group: "Production" },
  { value: "release", label: "release/2026-06", group: "Production" },
  { value: "staging", label: "staging", group: "Preview" },
] as const;

<Select defaultValue="main" items={branchOptions}>
  <SelectTrigger>
    <SelectValue placeholder="Branch" />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent className="w-[240px]">
    <SelectList>
      <SelectGroup>
        <SelectGroupLabel>Production</SelectGroupLabel>
        {branchOptions
          .filter((option) => option.group === "Production")
          .map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectItemText>{option.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
      </SelectGroup>
      <SelectSeparator />
      <SelectGroup>
        <SelectGroupLabel>Preview</SelectGroupLabel>
        {branchOptions
          .filter((option) => option.group === "Preview")
          .map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectItemText>{option.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
      </SelectGroup>
    </SelectList>
  </SelectContent>
</Select>`,
  states: `const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Most recent" },
  { value: "comments", label: "Most commented" },
] as const;

<Select defaultValue="relevance" items={sortOptions}>
  <SelectTrigger>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent className="w-[220px]">
    <SelectList>
      {sortOptions.map((option) => (
        <SelectItem
          key={option.value}
          value={option.value}
          disabled={option.value === "comments"}
        >
          <SelectItemText>{option.label}</SelectItemText>
          <SelectItemIndicator />
        </SelectItem>
      ))}
    </SelectList>
  </SelectContent>
</Select>

<Select disabled defaultValue="recent" items={sortOptions}>
  <SelectTrigger>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
</Select>`,
  scrolling: `import { useState } from "react";

const regionOptions = [
  { value: "us-east", label: "US East" },
  { value: "us-west", label: "US West" },
  { value: "eu-west", label: "EU West" },
  { value: "eu-central", label: "EU Central" },
  { value: "ap-south", label: "AP South" },
  { value: "ap-northeast", label: "AP Northeast" },
  { value: "ap-southeast", label: "AP Southeast" },
  { value: "ap-east", label: "AP East" },
  { value: "sa-east", label: "SA East" },
  { value: "af-south", label: "AF South" },
  { value: "ca-central", label: "Canada Central" },
  { value: "me-central", label: "Middle East" },
] as const;

function RegionSelect() {
  const [open, setOpen] = useState(true);

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      defaultValue="us-east"
      items={regionOptions}
    >
      <SelectTrigger>
        <SelectValue placeholder="Region" />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent className="w-[220px]">
        <SelectList className="max-h-44">
          {regionOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectItemText>{option.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}`,
  field: `const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Most recent" },
] as const;

<Field className="w-[220px] max-w-full">
  <FieldLabel>Default sort</FieldLabel>
  <Select name="sort" defaultValue="relevance" items={sortOptions}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Choose sort" />
      <SelectIcon />
    </SelectTrigger>
    <SelectContent className="w-[220px]">
      <SelectList>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <SelectItemText>{option.label}</SelectItemText>
            <SelectItemIndicator />
          </SelectItem>
        ))}
      </SelectList>
    </SelectContent>
  </Select>
  <FieldDescription>Submitted through the hidden input named sort.</FieldDescription>
</Field>`,
} as const;

const SELECT_COMPOSITION_SOURCES = createCompositionSourceMap({
  selectOptionsListComposition: selectOptionsListCompositionSource,
} as const);

type PlaygroundValues = {
  disabled: boolean;
  open: boolean;
  value: SortValue;
};

const PROPS: readonly PropRow[] = [
  {
    name: "Select",
    type: "Base UI Select.Root.Props<Value, Multiple>",
    description:
      "Owns value, hidden input, open state, keyboard navigation, typeahead, and form submission metadata.",
  },
  {
    name: "SelectTrigger",
    type: "Base UI Select.Trigger.Props",
    description:
      "Button trigger rendered through Button by default. Compose SelectValue, icons, or custom inline content as children.",
  },
  {
    name: "SelectValue",
    type: "Base UI Select.Value.Props",
    description:
      "Selected value display. Use placeholder for the empty state, or pass children to format the value.",
  },
  {
    name: "SelectContent",
    type: "Base UI Select.Popup + Positioner props",
    description:
      "Portaled options shell. Defaults to side=bottom, align=start, sideOffset=4, disableAnchorTracking=true, and positionMethod=fixed.",
  },
  {
    name: "SelectItem",
    type: "Base UI Select.Item.Props",
    description:
      "Option row. Selection, highlight, and disabled states are exposed through Base UI data attributes.",
  },
  {
    name: "SelectItemIndicator",
    type: "Base UI Select.ItemIndicator.Props",
    description: "Selected-state indicator. Renders a check icon by default.",
  },
  {
    name: "SelectLabel",
    type: "Base UI Select.Label.Props",
    description:
      "Accessible label automatically associated with the select trigger when Field is not the outer owner.",
  },
  {
    name: "SelectGroup / SelectGroupLabel",
    type: "Base UI Select.Group props",
    description: "Optional grouping parts for long option lists.",
  },
];

export const Route = createFileRoute("/components/select")({
  component: SelectDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...SELECT_COMPOSITION_SOURCES,
      },
    }),
});

function SortSelect({
  disabled = false,
  open,
  value,
}: {
  disabled?: boolean;
  open?: boolean;
  value?: SortValue;
}) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Select
        disabled={disabled}
        modal={false}
        open={open}
        defaultValue={value === undefined ? "relevance" : undefined}
        value={value}
        items={SORT_ICON_OPTIONS}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort">
            {(selectedValue) => {
              const selected = SORT_ICON_OPTIONS.find((option) => option.value === selectedValue);
              const Icon = selected?.icon;

              return selected && Icon ? (
                <span className="flex min-w-0 items-center gap-2">
                  <Icon aria-hidden className="size-3.5 shrink-0 stroke-[1.5] opacity-80" />
                  <span className="truncate">{selected.label}</span>
                </span>
              ) : (
                "Sort"
              );
            }}
          </SelectValue>
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
        >
          <SelectList>
            {SORT_ICON_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <SelectItem key={option.value} value={option.value}>
                  <Icon aria-hidden className="size-3.5 shrink-0 stroke-[1.5] opacity-80" />
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              );
            })}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}

function IconSelect() {
  const [value, setValue] = useState<SortIconValue>("relevance");
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            setValue(nextValue);
          }
        }}
        items={SORT_ICON_OPTIONS}
        modal={false}
      >
        <SelectTrigger>
          <SelectValue>
            {(selectedValue) => {
              const selected = SORT_ICON_OPTIONS.find((option) => option.value === selectedValue);
              const Icon = selected?.icon;

              return selected && Icon ? (
                <span className="flex min-w-0 items-center gap-2">
                  <Icon aria-hidden className="size-3.5 shrink-0 stroke-[1.5] opacity-80" />
                  <span className="truncate">{selected.label}</span>
                </span>
              ) : (
                "Sort"
              );
            }}
          </SelectValue>
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
        >
          <SelectList>
            {SORT_ICON_OPTIONS.map((option) => {
              const Icon = option.icon;

              return (
                <SelectItem key={option.value} value={option.value}>
                  <Icon aria-hidden className="size-3.5 shrink-0 stroke-[1.5] opacity-80" />
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              );
            })}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}

function BranchSelect() {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Select defaultValue="main" items={BRANCH_OPTIONS} modal={false}>
        <SelectTrigger>
          <SelectValue placeholder="Branch" />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[240px]"
        >
          <SelectList>
            <SelectGroup>
              <SelectGroupLabel>Production</SelectGroupLabel>
              {BRANCH_OPTIONS.filter((option) => option.group === "Production").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectGroupLabel>Preview</SelectGroupLabel>
              {BRANCH_OPTIONS.filter((option) => option.group === "Preview").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}

function StateSelects() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <SortSelect open />
      <Select disabled defaultValue="recent" items={SORT_OPTIONS} modal={false}>
        <SelectTrigger>
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
      </Select>
    </div>
  );
}

function RegionSelect() {
  const [open, setOpen] = useState(true);
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Select
        open={open}
        onOpenChange={setOpen}
        defaultValue="us-east"
        items={REGION_OPTIONS}
        modal={false}
      >
        <SelectTrigger>
          <SelectValue placeholder="Region" />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[220px]"
        >
          <SelectList className="max-h-44">
            {REGION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <SelectItemText>{option.label}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}

function FieldSelect() {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative">
      <Field className="w-[220px] max-w-full">
        <FieldLabel>Default sort</FieldLabel>
        <Select name="sort" defaultValue="relevance" items={SORT_OPTIONS} modal={false}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose sort" />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent
            positionMethod="absolute"
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className="w-[220px]"
          >
            <SelectList>
              {SORT_OPTIONS.filter((option) => option.value !== "comments").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </Select>
        <FieldDescription>Submitted through the hidden input named sort.</FieldDescription>
      </Field>
    </div>
  );
}

function SelectDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Select"
      description="A single-select field built on Base UI Select for value display, typeahead, keyboard navigation, and form submission."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            disabled: false,
            open: true,
            value: "relevance",
          }}
          controls={[
            { name: "open", label: "Open", type: "boolean" },
            { name: "disabled", label: "Disabled", type: "boolean" },
            {
              name: "value",
              label: "Value",
              type: "select",
              options: SORT_OPTIONS.map((option) => option.value),
            },
          ]}
          previewClassName="min-h-[18rem] items-start pt-20"
          render={(values) => (
            <SortSelect disabled={values.disabled} open={values.open} value={values.value} />
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Select.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="icons" title="Icons">
        <Example html={code.icons} previewClassName="min-h-[18rem] items-start pt-20">
          <IconSelect />
        </Example>
      </DocSection>

      <DocSection id="groups" title="Groups">
        <Example html={code.groups} previewClassName="min-h-[18rem] items-start pt-20">
          <BranchSelect />
        </Example>
      </DocSection>

      <DocSection id="states" title="States">
        <Example html={code.states} previewClassName="min-h-[18rem] items-start pt-20">
          <StateSelects />
        </Example>
      </DocSection>

      <DocSection id="scrolling" title="Scrolling">
        <Example html={code.scrolling} previewClassName="min-h-[18rem] items-start pt-20">
          <RegionSelect />
        </Example>
      </DocSection>

      <DocSection id="field" title="With Field">
        <Example html={code.field} previewClassName="min-h-[18rem] items-start pt-16">
          <FieldSelect />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              id: "source-comparison-options-list",
              label: "Options list",
              status: "difference",
              note: (
                <>
                  <InlineCode>Select.tsx</InlineCode>. Headerless legacy options now map to Select
                  items, with the selected row owned by Base UI value state instead of a menu radio
                  group.
                </>
              ),
              source: <SelectOptionsListSourcePreview />,
              brutal: <SelectOptionsListComposition />,
              elegant: <SelectOptionsListComposition />,
              elegantDark: <SelectOptionsListComposition />,
              compositionCode: code.selectOptionsListComposition,
              compositionCollapsedCode: code.selectOptionsListCompositionBody,
              compositionPath: SELECT_OPTIONS_LIST_COMPOSITION_PATH,
              compositionSource: SELECT_COMPOSITION_SOURCES.selectOptionsListComposition,
              compositionShowLineNumbers: false,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
