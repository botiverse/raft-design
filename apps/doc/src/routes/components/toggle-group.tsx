import { createFileRoute } from "@tanstack/react-router";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { stripSourceCodeBlocks } from "#/lib/source-code.ts";
import { ToggleGroupAlignmentComposition } from "#/modules/toggle-group/compositions/alignment.composition.tsx";
import toggleGroupAlignmentCompositionSource from "#/modules/toggle-group/compositions/alignment.composition.tsx?raw";
import { ToggleGroupDisabledComposition } from "#/modules/toggle-group/compositions/disabled.composition.tsx";
import toggleGroupDisabledCompositionSource from "#/modules/toggle-group/compositions/disabled.composition.tsx?raw";
import toggleGroupFormattingCompositionSource from "#/modules/toggle-group/compositions/formatting.composition.tsx?raw";
import { ToggleGroupItemDisabledComposition } from "#/modules/toggle-group/compositions/item-disabled.composition.tsx";
import toggleGroupItemDisabledCompositionSource from "#/modules/toggle-group/compositions/item-disabled.composition.tsx?raw";
import { ToggleGroupPreview } from "#/modules/toggle-group/toggle-group.preview.tsx";
import { ToggleGroupVerticalComposition } from "#/modules/toggle-group/compositions/vertical.composition.tsx";
import toggleGroupVerticalCompositionSource from "#/modules/toggle-group/compositions/vertical.composition.tsx?raw";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import { ToggleGroup, ToggleGroupItem, ToggleGroupLabel } from "raft-ui";

<ToggleGroup multiple defaultValue={["bold"]} aria-label="Text formatting">
  <ToggleGroupItem value="bold">
    <ToggleGroupLabel>Bold</ToggleGroupLabel>
  </ToggleGroupItem>
</ToggleGroup>`,
  formatting: stripSourceCodeBlocks(toggleGroupFormattingCompositionSource),
  alignment: stripSourceCodeBlocks(toggleGroupAlignmentCompositionSource),
  vertical: stripSourceCodeBlocks(toggleGroupVerticalCompositionSource),
  itemDisabled: stripSourceCodeBlocks(toggleGroupItemDisabledCompositionSource),
  disabled: stripSourceCodeBlocks(toggleGroupDisabledCompositionSource),
} as const;

const TOGGLE_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "readonly T[]",
    description: "Pressed item values for controlled use.",
  },
  {
    name: "defaultValue",
    type: "readonly T[]",
    description: "Initially pressed item values for uncontrolled use.",
  },
  {
    name: "onValueChange",
    type: "(value: T[], eventDetails: ToggleGroup.ChangeEventDetails) => void",
    description: "Called when the pressed item collection changes.",
  },
  {
    name: "multiple",
    type: "boolean",
    default: "false",
    description: "Allows more than one item to stay pressed.",
  },
  {
    name: "orientation",
    type: '"horizontal" | "vertical"',
    default: '"horizontal"',
    description: "Controls visual layout and arrow-key navigation.",
  },
  {
    name: "loopFocus",
    type: "boolean",
    default: "true",
    description: "Wraps roving keyboard focus at either end of the group.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables every item in the group.",
  },
  {
    name: "...props",
    type: "Base UI ToggleGroup.Props<T>",
    description: "Native div attributes, render substitution, styling, and ARIA labeling.",
  },
];

const TOGGLE_GROUP_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "value",
    type: "T",
    description: "Required unique value tracked in the parent group's pressed collection.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables this item without disabling its siblings.",
  },
  {
    name: "onPressedChange",
    type: "(pressed: boolean, eventDetails: Toggle.ChangeEventDetails) => void",
    description:
      "Per-item callback fired when this item's pressed state changes, before the group's onValueChange. Use eventDetails.cancel() to reject a single item's press.",
  },
  {
    name: "...props",
    type: "ToggleGroupItemProps<T>",
    description:
      "Base UI Toggle props without standalone pressed/defaultPressed state, plus a required value.",
  },
];

const TOGGLE_GROUP_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentPropsWithRef<"span">',
    description: "Visible item label with truncation and native span attributes.",
  },
];

export const Route = createFileRoute("/components/toggle-group")({
  component: ToggleGroupDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ToggleGroupDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ToggleGroup"
      description="A compact group of toggle buttons for independent or optional pressed states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ToggleGroupPreview code={code.formatting} collapsedCode={code.formattingBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="grid gap-10">
          <DocNote>
            Use ToggleGroup when an item may be toggled off. Use SegmentedControl for a persistent
            one-of-many value that changes a view, filter, or mode.
          </DocNote>

          <DocSubsection parentId="usage" id="one-or-none" title="One or none">
            <Preview>
              <Preview.Canvas>
                <ToggleGroupAlignmentComposition />
              </Preview.Canvas>
              <Preview.Code html={code.alignment} collapsedHtml={code.alignmentBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="vertical-orientation" title="Vertical orientation">
            <Preview>
              <Preview.Canvas>
                <ToggleGroupVerticalComposition />
              </Preview.Canvas>
              <Preview.Code html={code.vertical} collapsedHtml={code.verticalBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="disabled-item" title="Disabled item">
            <Preview>
              <Preview.Canvas>
                <ToggleGroupItemDisabledComposition />
              </Preview.Canvas>
              <Preview.Code html={code.itemDisabled} collapsedHtml={code.itemDisabledBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="disabled-group" title="Disabled group">
            <Preview>
              <Preview.Canvas>
                <ToggleGroupDisabledComposition />
              </Preview.Canvas>
              <Preview.Code html={code.disabled} collapsedHtml={code.disabledBody} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-toggle-group" title="ToggleGroup">
            <PropsTable rows={TOGGLE_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-toggle-group-item" title="ToggleGroupItem">
            <PropsTable rows={TOGGLE_GROUP_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-toggle-group-label" title="ToggleGroupLabel">
            <PropsTable rows={TOGGLE_GROUP_LABEL_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
