import { createFileRoute } from "@tanstack/react-router";
import { Button, InputGroup, InputGroupAddon, InputGroupInput, InlineCode, Kbd } from "raft-ui";
import { Field, FieldError, FieldLabel } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import {
  createCompositionPanelProps,
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import inputGroupInvalidStateCompositionSource from "#/modules/input-group/compositions/invalid-state.composition.tsx?raw";
import inputGroupSearchInputCompositionSource from "#/modules/input-group/compositions/search-input.composition.tsx?raw";
import inputGroupSlugInputCompositionSource from "#/modules/input-group/compositions/slug-input.composition.tsx?raw";
import {
  INPUT_GROUP_SOURCE_COMPARISON_COMPOSITION,
  INPUT_GROUP_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/modules/input-group/input-group.source-comparison.tsx";
import { Search, Upload } from "lucide-react";
import LegacySearchInput from "../../../../../packages/ui/src/legacy/SearchInput.tsx";
import LegacySlugInput from "../../../../../packages/ui/src/legacy/SlugInput.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "addons", title: "Addons" },
  { id: "text-affixes", title: "Text affixes" },
  { id: "addon-variants", title: "Addon variants" },
  { id: "actions", title: "Actions" },
  { id: "states", title: "States" },
  { id: "field", title: "With Field" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Search, slug, and prefixed inputs",
    scenes: [
      {
        label: "SearchInput.tsx:15,17",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SearchInput.tsx:15,17",
      },
      {
        label: "SlugInput.tsx:15,23",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SlugInput.tsx:15,23",
      },
      {
        label: "ServerSelector.tsx:75",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/ServerSelector.tsx:75",
      },
      {
        label: "CreateJointChannelDialog.tsx:219",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateJointChannelDialog.tsx:219",
      },
      {
        label: "SettingsPanel.tsx:2335",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:2335",
      },
      {
        label: "SelectionPopover.tsx:136,146",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SelectionPopover.tsx:136,146",
      },
    ],
  },
] as const;

const COMPARISON_INPUT_CLASS = "w-80 max-w-full min-w-0";

const SNIPPETS = {
  anatomy: `<InputGroup>
  <InputGroupInput />
</InputGroup>`,
  addons: `import { Search } from "lucide-react";

<InputGroup>
  <InputGroupAddon>
    <Search />
  </InputGroupAddon>
  <InputGroupInput aria-label="Search" placeholder="Search..." />
</InputGroup>

<InputGroup>
  <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
  <InputGroupInput aria-label="Server slug" placeholder="my-server" />
</InputGroup>`,
  textAffixes: `<InputGroup>
  <InputGroupAddon.Text>$</InputGroupAddon.Text>
  <InputGroupInput aria-label="Amount" placeholder="0.00" inputMode="decimal" />
  <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
</InputGroup>

<InputGroup>
  <InputGroupInput aria-label="Email username" placeholder="alex" />
  <InputGroupAddon.Text align="inline-end">@example.com</InputGroupAddon.Text>
</InputGroup>`,
  addonVariants: `import { InputGroup, InputGroupAddon, InputGroupInput } from "raft-ui";

<InputGroup>
  <InputGroupAddon variant="container">
    <Upload />
  </InputGroupAddon>
  <InputGroupInput aria-label="Upload target" placeholder="Default" />
</InputGroup>

<InputGroup>
  <InputGroupAddon.Text variant="container">https://</InputGroupAddon.Text>
  <InputGroupInput aria-label="Domain" placeholder="Default" />
  <InputGroupAddon.Text align="inline-end" variant="container">.com</InputGroupAddon.Text>
</InputGroup>

<InputGroup>
  <InputGroupInput aria-label="Project slug" placeholder="Default" />
  <InputGroupAddon variant="container" align="inline-end">
    <Upload />
  </InputGroupAddon>
</InputGroup>`,
  actions: `import { Search } from "lucide-react";

<InputGroup>
  <InputGroupAddon>
    <Search />
  </InputGroupAddon>
  <InputGroupInput aria-label="Search" placeholder="Search projects..." />
  <InputGroupAddon align="inline-end">
    <Kbd>Cmd K</Kbd>
  </InputGroupAddon>
</InputGroup>

<InputGroup>
  <InputGroupInput aria-label="Invite email" placeholder="teammate@example.com" />
  <InputGroupAddon align="inline-end" className="px-1">
    <Button size="xs">Invite</Button>
  </InputGroupAddon>
</InputGroup>`,
  states: `import { Search } from "lucide-react";

<InputGroup>
  <InputGroupAddon>
    <Search />
  </InputGroupAddon>
  <InputGroupInput aria-label="Search" placeholder="Search..." />
</InputGroup>

<InputGroup>
  <InputGroupAddon>
    <Search />
  </InputGroupAddon>
  <InputGroupInput aria-label="Search" aria-invalid defaultValue="???" />
</InputGroup>

<InputGroup>
  <InputGroupAddon.Text>$</InputGroupAddon.Text>
  <InputGroupInput aria-label="Amount" disabled placeholder="0.00" />
  <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
</InputGroup>

<InputGroup>
  <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
  <InputGroupInput aria-label="Server slug" aria-invalid defaultValue="Bad Slug" />
</InputGroup>`,
  field: `import { Field, FieldError, FieldLabel, InputGroup, InputGroupInput } from "raft-ui";

<Field invalid>
  <FieldLabel htmlFor="invite-email">Invite email</FieldLabel>
  <InputGroup>
    <InputGroupInput id="invite-email" type="email" defaultValue="oops" />
  </InputGroup>
  <FieldError match>Use a valid email.</FieldError>
</Field>`,
  migrationSearch: `import { Search } from "lucide-react";

// Source
<SearchInput aria-label="Search" placeholder="Search..." />

// Current, preserving the old no-focus-lift shell
<InputGroup className="has-[[data-slot=input-group-control]:focus]:!shadow-sm">
  <InputGroupAddon>
    <Search />
  </InputGroupAddon>
  <InputGroupInput aria-label="Search" placeholder="Search..." />
</InputGroup>`,
  migrationSlug: `// Source
<SlugInput aria-label="Server slug" placeholder="my-server" />

// Current
<InputGroup>
  <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
  <InputGroupInput aria-label="Server slug" placeholder="my-server" />
</InputGroup>`,
  migrationInvalid: `import { Search } from "lucide-react";

// Source
<SearchInput
  className="!border-brutal-red bg-brutal-red/5 ring-2 ring-brutal-red/60"
  defaultValue="oops"
/>

// Current
<InputGroup>
  <InputGroupAddon>
    <Search />
  </InputGroupAddon>
  <InputGroupInput aria-label="Search" aria-invalid defaultValue="oops" />
</InputGroup>`,
} as const;

type PlaygroundValues = {
  addonVariant: "default" | "container";
  disabled: boolean;
  invalid: boolean;
  placeholder: string;
};

const GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description:
      "Native div attributes. Renders the shell that owns border, background, focus, invalid, and disabled styling.",
  },
];

const ADDON_PROPS: readonly PropRow[] = [
  {
    name: "align",
    type: '"inline-start" | "inline-end"',
    default: '"inline-start"',
    description: "Which edge the addon hugs.",
  },
  {
    name: "variant",
    type: '"default" | "container"',
    default: '"default"',
    description: "Use container for a muted addon box with an internal divider.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"div">',
    description:
      "Native div attributes for icons, buttons, keyboard hints, or custom addon content.",
  },
];

const TEXT_PROPS: readonly PropRow[] = [
  {
    name: "align",
    type: '"inline-start" | "inline-end"',
    default: '"inline-start"',
    description: "Which edge the static text hugs.",
  },
  {
    name: "variant",
    type: '"default" | "container"',
    default: '"default"',
    description: "Use container for a muted text box with an internal divider.",
  },
  {
    name: "...props",
    type: 'ComponentProps<"span">',
    description:
      "Native span attributes for non-interactive text affixes such as currency or unit.",
  },
];

const INPUT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "InputProps",
    description:
      "Same native input props as Input, including suppressPasswordManager. Carries data-slot=input-group-control.",
  },
];

const InputGroupCurrent = INPUT_GROUP_SOURCE_COMPARISON_COMPOSITION;

const INPUT_GROUP_COMPOSITION_RAW_SOURCES = {
  InvalidState: inputGroupInvalidStateCompositionSource,
  SearchInput: inputGroupSearchInputCompositionSource,
  SlugInput: inputGroupSlugInputCompositionSource,
} as const;

const INPUT_GROUP_COMPOSITION_SOURCES = createCompositionSourceMap(
  INPUT_GROUP_COMPOSITION_RAW_SOURCES,
);

const INPUT_GROUP_COMPOSITION_SNIPPET_IDS = {
  InvalidState: "inputGroupInvalidStateComposition",
  SearchInput: "inputGroupSearchInputComposition",
  SlugInput: "inputGroupSlugInputComposition",
} as const;

type InputGroupCompositionKey = keyof typeof INPUT_GROUP_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/input-group")({
  component: InputGroupDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(
          INPUT_GROUP_COMPOSITION_SOURCES,
          INPUT_GROUP_COMPOSITION_SNIPPET_IDS,
        ),
      },
    }),
});

function InputGroupDoc() {
  const code = Route.useLoaderData();
  const inputGroupComposition = (key: InputGroupCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: INPUT_GROUP_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: INPUT_GROUP_COMPOSITION_SNIPPET_IDS,
      sources: INPUT_GROUP_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="InputGroup"
      description="A single-line input composition shell with leading or trailing addons."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            addonVariant: "container",
            disabled: false,
            invalid: false,
            placeholder: "Default",
          }}
          controls={[
            {
              name: "addonVariant",
              label: "Addon",
              type: "select",
              options: ["default", "container"],
            },
            { name: "disabled", label: "Disabled", type: "boolean" },
            { name: "invalid", label: "Invalid", type: "boolean" },
            { name: "placeholder", label: "Placeholder", type: "text" },
          ]}
          render={(values) => (
            <InputGroup className="w-96">
              <InputGroupAddon.Text variant={values.addonVariant}>https://</InputGroupAddon.Text>
              <InputGroupInput
                placeholder={values.placeholder}
                disabled={values.disabled}
                aria-invalid={values.invalid || undefined}
              />
              <InputGroupAddon.Text align="inline-end" variant={values.addonVariant}>
                .com
              </InputGroupAddon.Text>
            </InputGroup>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="addons" title="Addons" showThemeSwitcher>
        <Example html={code.addons}>
          <InputGroup className="w-80">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput aria-label="Search" placeholder="Search..." />
          </InputGroup>
          <InputGroup className="w-80">
            <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
            <InputGroupInput aria-label="Server slug" placeholder="my-server" />
          </InputGroup>
        </Example>
      </DocSection>

      <DocSection id="text-affixes" title="Text affixes" showThemeSwitcher>
        <Example html={code.textAffixes}>
          <InputGroup className="w-80">
            <InputGroupAddon.Text>$</InputGroupAddon.Text>
            <InputGroupInput aria-label="Amount" placeholder="0.00" inputMode="decimal" />
            <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
          </InputGroup>
          <InputGroup className="w-80">
            <InputGroupInput aria-label="Email username" placeholder="alex" />
            <InputGroupAddon.Text align="inline-end">@example.com</InputGroupAddon.Text>
          </InputGroup>
        </Example>
      </DocSection>

      <DocSection id="addon-variants" title="Addon variants" showThemeSwitcher>
        <div className="space-y-4">
          <DocNote>
            Use <InlineCode>variant="default"</InlineCode> for light inline adornments such as
            search icons or keyboard hints. Use <InlineCode>variant="container"</InlineCode> when
            the addon is part of the value structure, like a protocol, domain suffix, unit, or icon
            box.
          </DocNote>
          <Example html={code.addonVariants}>
            <InputGroup className="w-80">
              <InputGroupAddon variant="container">
                <Upload />
              </InputGroupAddon>
              <InputGroupInput aria-label="Upload target" placeholder="Default" />
            </InputGroup>
            <InputGroup className="w-96">
              <InputGroupAddon.Text variant="container">https://</InputGroupAddon.Text>
              <InputGroupInput aria-label="Domain" placeholder="Default" />
              <InputGroupAddon.Text align="inline-end" variant="container">
                .com
              </InputGroupAddon.Text>
            </InputGroup>
            <InputGroup className="w-80">
              <InputGroupInput aria-label="Project slug" placeholder="Default" />
              <InputGroupAddon variant="container" align="inline-end">
                <Upload />
              </InputGroupAddon>
            </InputGroup>
          </Example>
        </div>
      </DocSection>

      <DocSection id="actions" title="Actions" showThemeSwitcher>
        <Example html={code.actions}>
          <InputGroup className="w-80">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput aria-label="Search" placeholder="Search projects..." />
            <InputGroupAddon align="inline-end">
              <Kbd>Cmd K</Kbd>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup className="w-80">
            <InputGroupInput aria-label="Invite email" placeholder="teammate@example.com" />
            <InputGroupAddon align="inline-end" className="px-1">
              <Button size="xs">Invite</Button>
            </InputGroupAddon>
          </InputGroup>
        </Example>
      </DocSection>

      <DocSection id="states" title="States" showThemeSwitcher>
        <div className="space-y-4">
          <DocNote>
            Put <InlineCode>aria-invalid</InlineCode> and <InlineCode>disabled</InlineCode> on{" "}
            <InlineCode>InputGroupInput</InlineCode>. The wrapper owns the visible state through{" "}
            <InlineCode>has-*</InlineCode>.
          </DocNote>
          <Example html={code.states}>
            <div className="grid w-full max-w-96 gap-3">
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput aria-label="Search" placeholder="Search..." />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput aria-label="Search" aria-invalid defaultValue="???" />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon.Text>$</InputGroupAddon.Text>
                <InputGroupInput aria-label="Amount" disabled placeholder="0.00" />
                <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
              </InputGroup>
              <InputGroup>
                <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
                <InputGroupInput aria-label="Server slug" aria-invalid defaultValue="Bad Slug" />
              </InputGroup>
            </div>
          </Example>
        </div>
      </DocSection>

      <DocSection id="field" title="With Field" showThemeSwitcher>
        <Example html={code.field}>
          <Field className="w-80" invalid>
            <FieldLabel htmlFor="invite-email">Invite email</FieldLabel>
            <InputGroup>
              <InputGroupInput id="invite-email" type="email" defaultValue="oops" />
            </InputGroup>
            <FieldError match>Use a valid email.</FieldError>
          </Field>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">InputGroup</h3>
            <PropsTable rows={GROUP_PROPS} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">InputGroupAddon</h3>
            <PropsTable rows={ADDON_PROPS} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">InputGroupAddon.Text</h3>
            <PropsTable rows={TEXT_PROPS} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">InputGroupInput</h3>
            <PropsTable rows={INPUT_PROPS} />
          </div>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "SearchInput",
              status: "match",
              source: (
                <div className={COMPARISON_INPUT_CLASS}>
                  <LegacySearchInput aria-label="Search" placeholder="Search..." />
                </div>
              ),
              brutal: <InputGroupCurrent.SearchInput />,
              elegant: <InputGroupCurrent.SearchInput />,
              elegantDark: <InputGroupCurrent.SearchInput />,
              ...inputGroupComposition("SearchInput"),
            },
            {
              label: "SlugInput",
              status: "difference",
              source: (
                <div className={COMPARISON_INPUT_CLASS}>
                  <LegacySlugInput aria-label="Server slug" placeholder="my-server" />
                </div>
              ),
              brutal: <InputGroupCurrent.SlugInput />,
              elegant: <InputGroupCurrent.SlugInput />,
              elegantDark: <InputGroupCurrent.SlugInput />,
              ...inputGroupComposition("SlugInput"),
            },
            {
              label: "Invalid state",
              status: "match",
              source: (
                <div className={COMPARISON_INPUT_CLASS}>
                  <LegacySearchInput
                    className="!border-brutal-red bg-brutal-red/5 ring-2 ring-brutal-red/60"
                    aria-label="Search"
                    defaultValue="oops"
                  />
                </div>
              ),
              brutal: <InputGroupCurrent.InvalidState />,
              elegant: <InputGroupCurrent.InvalidState />,
              elegantDark: <InputGroupCurrent.InvalidState />,
              ...inputGroupComposition("InvalidState"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
