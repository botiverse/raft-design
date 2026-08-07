import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownUp, ChevronDown, Clock, MessageSquare, Search } from "lucide-react";
import {
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
  Field,
  FieldDescription,
  FieldLabel,
} from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "recent", label: "Most recent" },
  { value: "comments", label: "Most commented" },
] as const;

const SORT_ICON_OPTIONS = [
  { value: "relevance", label: "Relevance", icon: Search },
  { value: "recent", label: "Most recent", icon: Clock },
  { value: "comments", label: "Most commented", icon: MessageSquare },
] as const;

const BRANCH_OPTIONS = [
  { value: "main", label: "main", group: "Production" },
  { value: "release", label: "release/2026-06", group: "Production" },
  { value: "staging", label: "staging", group: "Preview" },
] as const;

const PRODUCTION_BRANCH_OPTIONS = BRANCH_OPTIONS.filter((option) => option.group === "Production");
const PREVIEW_BRANCH_OPTIONS = BRANCH_OPTIONS.filter((option) => option.group === "Preview");
const FIELD_SORT_OPTIONS = SORT_OPTIONS.filter((option) => option.value !== "comments");

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

type SortIconValue = (typeof SORT_ICON_OPTIONS)[number]["value"];

const SNIPPETS = {
  preview: `const sortOptions = [
  { value: "relevance", label: "Relevance", icon: Search },
  { value: "recent", label: "Most recent", icon: Clock },
  { value: "comments", label: "Most commented", icon: MessageSquare },
] as const;

<Select defaultValue="relevance" items={sortOptions}>
  <SelectTrigger>
    <SelectValue placeholder="Sort">
      {(selectedValue) => {
        const selected = sortOptions.find((option) => option.value === selectedValue);
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
</Select>`,
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
} from "raft-ui";

<Select defaultValue="option">
  <SelectTrigger>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectList>
      <SelectItem value="option">
        <SelectItemText />
        <SelectItemIndicator />
      </SelectItem>
    </SelectList>
  </SelectContent>
</Select>`,
  icons: `import { useState } from "react";
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
} from "raft-ui";

const sortOptions = [
  { value: "relevance", label: "Relevance", icon: Search },
  { value: "recent", label: "Most recent", icon: Clock },
  { value: "comments", label: "Most commented", icon: MessageSquare },
] as const;

`,
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

const sortIconOptions = [
  { value: "relevance", label: "Relevance", icon: Search },
  { value: "recent", label: "Most recent", icon: Clock },
  { value: "comments", label: "Most commented", icon: MessageSquare },
] as const;

<Select defaultValue="relevance" items={sortIconOptions}>
  <SelectTrigger>
    <SelectValue placeholder="Sort">
      {(selectedValue) => {
        const selected = sortIconOptions.find((option) => option.value === selectedValue);
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
  <SelectContent className="w-[220px]">
    <SelectList>
      {sortIconOptions.map((option) => {
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

<Select disabled defaultValue="recent" items={sortOptions}>
  <SelectTrigger>
    <SelectValue />
    <SelectIcon />
  </SelectTrigger>
</Select>`,
  scrolling: `const regionOptions = [
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
  return (
    <Select defaultValue="us-east" items={regionOptions}>
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
  customTrigger: `import { ArrowDownUp, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "raft-ui";

const sortOptions = [
  { value: "relevance", label: "Relevant" },
  { value: "recent", label: "Recent" },
] as const;

<Select defaultValue="relevance" items={sortOptions}>
  <SelectTrigger
    render={(props) => (
      <button
        {...props}
        type="button"
        className="inline-flex items-center gap-2 border-2 border-black/30 bg-white px-3 py-1.5 text-xs font-bold text-black/70 transition-colors hover:border-black"
      >
        <ArrowDownUp aria-hidden className="size-3.5" />
        {props.children}
        <ChevronDown aria-hidden className="size-3" />
      </button>
    )}
  >
    <SelectValue />
  </SelectTrigger>
  <SelectContent className="w-[180px]">
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
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.Root.Props<Value, Multiple>",
    description:
      "Owns value, hidden input, open state, keyboard navigation, typeahead, and form submission metadata.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description:
      "Replaces the trigger element entirely. When provided, the default Button and its recipe styles are skipped; pass event and aria props to your own element.",
  },
  {
    name: "...props",
    type: "Base UI Select.Trigger.Props",
    description:
      "Default trigger renders an outline md Button. Compose SelectValue, icons, or custom inline content as children.",
  },
];

const VALUE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.Value.Props",
    description:
      "Selected value display. Use placeholder for the empty state, or pass children to format the value.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.Popup + Positioner props",
    description:
      "Portaled options shell. Defaults to side=bottom, align=start, sideOffset=4, disableAnchorTracking=true, and positionMethod=fixed.",
  },
];

const ITEM_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.Item.Props",
    description:
      "Option row. Selection, highlight, and disabled states are exposed through Base UI data attributes.",
  },
];

const ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.Icon.Props",
    description: "Chevron or custom indicator inside the trigger.",
  },
];

const PORTAL_PROPS: readonly PropRow[] = [
  {
    name: "container",
    type: "HTMLElement | RefObject | null",
    description: "Custom portal container for framed previews or contained overlays.",
  },
  {
    name: "...props",
    type: "Base UI Select.Portal.Props",
    description: "Portals the select list to the body or a custom container.",
  },
];

const POPUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"div">',
    description: "Static panel shell for docs previews and non-portaled comparison panes.",
  },
];

const LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.List.Props",
    description: "Scrollable list container inside the popup.",
  },
];

const ITEM_TEXT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.ItemText.Props",
    description: "Text span inside SelectItem.",
  },
];

const SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'StyledProps<ComponentPropsWithRef<"div">>',
    description: "Horizontal divider between option groups.",
  },
];

const SCROLL_UP_ARROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.ScrollUpArrow.Props",
    description: "Scroll hint shown at the top when the list overflows.",
  },
];

const SCROLL_DOWN_ARROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.ScrollDownArrow.Props",
    description: "Scroll hint shown at the bottom when the list overflows.",
  },
];

const ARROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.Arrow.Props",
    description: "Optional arrow pointing at the trigger.",
  },
];

const ITEM_LEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "React.ComponentPropsWithRef<'span'>",
    description:
      "Optional leading slot for icons, avatars, or a reserved source-parity column before SelectItemText.",
  },
];

const ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.ItemIndicator.Props",
    description: "Selected-state indicator. Renders a check icon by default.",
  },
];

const LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.Label.Props",
    description:
      "Accessible label automatically associated with the select trigger when Field is not the outer owner.",
  },
];

const GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.Group.Props",
    description: "Optional grouping container for long option lists.",
  },
];

const GROUP_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Select.GroupLabel.Props",
    description: "Label for a SelectGroup.",
  },
];
export const Route = createFileRoute("/components/select")({
  component: SelectDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SortSelect({ disabled = false }: { disabled?: boolean }) {
  return (
    <div className="flex justify-center">
      <Select disabled={disabled} modal={false} defaultValue="relevance" items={SORT_ICON_OPTIONS}>
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
        <SelectContent className="w-[220px]">
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

  return (
    <div className="flex justify-center">
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
        <SelectContent className="w-[220px]">
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
  return (
    <div className="flex justify-center">
      <Select defaultValue="main" items={BRANCH_OPTIONS} modal={false}>
        <SelectTrigger>
          <SelectValue placeholder="Branch" />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent className="w-[240px]">
          <SelectList>
            <SelectGroup>
              <SelectGroupLabel>Production</SelectGroupLabel>
              {PRODUCTION_BRANCH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectGroupLabel>Preview</SelectGroupLabel>
              {PREVIEW_BRANCH_OPTIONS.map((option) => (
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
      <SortSelect />
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
  return (
    <div className="flex justify-center">
      <Select defaultValue="us-east" items={REGION_OPTIONS} modal={false}>
        <SelectTrigger>
          <SelectValue placeholder="Region" />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent className="w-[220px]">
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
  return (
    <div>
      <Field className="w-[220px] max-w-full">
        <FieldLabel>Default sort</FieldLabel>
        <Select name="sort" defaultValue="relevance" items={SORT_OPTIONS} modal={false}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose sort" />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent className="w-[220px]">
            <SelectList>
              {FIELD_SORT_OPTIONS.map((option) => (
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

function CustomTriggerSelect() {
  return (
    <div className="flex justify-center">
      <Select defaultValue="relevance" items={SORT_OPTIONS} modal={false}>
        <SelectTrigger
          render={(props) => (
            <button
              {...props}
              type="button"
              className="inline-flex items-center gap-2 border-2 border-black/30 bg-white px-3 py-1.5 text-xs font-bold text-black/70 transition-colors hover:border-black"
            >
              <ArrowDownUp aria-hidden className="size-3.5" />
              {props.children}
              <ChevronDown aria-hidden className="size-3" />
            </button>
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="w-[180px]">
          <SelectList>
            {SORT_OPTIONS.map((option) => (
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

function SelectPreview({ code }: { code: ReturnType<typeof Route.useLoaderData>["preview"] }) {
  const [disabled, setDisabled] = useState(false);

  return (
    <Preview previewClassName="min-h-[18rem] items-start pt-20">
      <Preview.Canvas>
        <SortSelect disabled={disabled} />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Disabled" htmlFor="select-preview-disabled">
          <Preview.Checkbox
            id="select-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <SelectPreview code={code.preview} />
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
          <DocSubsection parentId="usage" id="icons" title="Icons">
            <Preview previewClassName="min-h-[18rem] items-start pt-20">
              <Preview.Canvas>
                <IconSelect />
              </Preview.Canvas>
              <Preview.Code html={code.icons} collapsedHtml={code.iconsBody} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="groups" title="Groups">
            <Preview previewClassName="min-h-[18rem] items-start pt-20">
              <Preview.Canvas>
                <BranchSelect />
              </Preview.Canvas>
              <Preview.Code html={code.groups} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="states" title="States">
            <Preview previewClassName="min-h-[18rem] items-start pt-20">
              <Preview.Canvas>
                <StateSelects />
              </Preview.Canvas>
              <Preview.Code html={code.states} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="scrolling" title="Scrolling">
            <Preview previewClassName="min-h-[18rem] items-start pt-20">
              <Preview.Canvas>
                <RegionSelect />
              </Preview.Canvas>
              <Preview.Code html={code.scrolling} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="field" title="With Field">
            <Preview previewClassName="min-h-[18rem] items-start pt-16">
              <Preview.Canvas>
                <FieldSelect />
              </Preview.Canvas>
              <Preview.Code html={code.field} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="custom-trigger" title="Custom trigger">
            <Preview previewClassName="min-h-[18rem] items-start pt-24">
              <Preview.Canvas>
                <CustomTriggerSelect />
              </Preview.Canvas>
              <Preview.Code html={code.customTrigger} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Select">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="SelectTrigger">
            <PropsTable rows={TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-value" title="SelectValue">
            <PropsTable rows={VALUE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-icon" title="SelectIcon">
            <PropsTable rows={ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="SelectContent">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-portal" title="SelectPortal">
            <PropsTable rows={PORTAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popup" title="SelectPopup">
            <PropsTable rows={POPUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-list" title="SelectList">
            <PropsTable rows={LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item" title="SelectItem">
            <PropsTable rows={ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-leading" title="SelectItemLeading">
            <PropsTable rows={ITEM_LEADING_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-text" title="SelectItemText">
            <PropsTable rows={ITEM_TEXT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-item-indicator" title="SelectItemIndicator">
            <PropsTable rows={ITEM_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-label" title="SelectLabel">
            <PropsTable rows={LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-group" title="SelectGroup">
            <PropsTable rows={GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-group-label" title="SelectGroupLabel">
            <PropsTable rows={GROUP_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-separator" title="SelectSeparator">
            <PropsTable rows={SEPARATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-scroll-up-arrow" title="SelectScrollUpArrow">
            <PropsTable rows={SCROLL_UP_ARROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-scroll-down-arrow" title="SelectScrollDownArrow">
            <PropsTable rows={SCROLL_DOWN_ARROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-arrow" title="SelectArrow">
            <PropsTable rows={ARROW_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
