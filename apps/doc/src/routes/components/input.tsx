import { createFileRoute, Link } from "@tanstack/react-router";
import { InlineCode, Input } from "raft-ui";
import { Field, FieldError, FieldLabel } from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
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
import { InputPlaygroundPreview } from "#/modules/input/input.preview.tsx";
import inputDefaultCompositionSource from "#/modules/input/compositions/default.composition.tsx?raw";
import inputDisabledStylingCompositionSource from "#/modules/input/compositions/disabled-styling.composition.tsx?raw";
import inputInvalidDisabledPriorityCompositionSource from "#/modules/input/compositions/invalid-disabled-priority.composition.tsx?raw";
import inputInvalidStateCompositionSource from "#/modules/input/compositions/invalid-state.composition.tsx?raw";
import inputPasswordManagerSuppressionCompositionSource from "#/modules/input/compositions/password-manager-suppression.composition.tsx?raw";
import {
  INPUT_SOURCE_COMPARISON_COMPOSITION,
  INPUT_SOURCE_COMPARISON_COMPOSITION_PATHS,
} from "#/modules/input/input.source-comparison.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Auth, identity, and search inputs",
    scenes: [
      {
        label: "DeviceLoginPage.tsx:90",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/pages/DeviceLoginPage.tsx:90",
      },
      {
        label: "HumanDetailPanel.tsx:185",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/HumanDetailPanel.tsx:185",
      },
      {
        label: "CreateTaskDialog.tsx:77",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/task/CreateTaskDialog.tsx:77",
      },
      {
        label: "InviteHumanDialog.tsx:145",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/member/InviteHumanDialog.tsx:145",
      },
      {
        label: "MessageSearchPage.tsx:697",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/search/MessageSearchPage.tsx:697",
      },
      {
        label: "SearchInput.tsx:17",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SearchInput.tsx:17",
      },
      {
        label: "EmailVerificationPage.tsx:143",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/EmailVerificationPage.tsx:143",
      },
      {
        label: "ForgotPasswordPage.tsx:69",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/ForgotPasswordPage.tsx:69",
      },
      {
        label: "RegisterPage.tsx:71,84,96",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/RegisterPage.tsx:71,84,96",
      },
      {
        label: "LoginPage.tsx:114,126",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/LoginPage.tsx:114,126",
      },
      {
        label: "ResetPasswordPage.tsx:83,96",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/ResetPasswordPage.tsx:83,96",
      },
    ],
  },
  {
    label: "Channel, agent, message, and settings inputs",
    scenes: [
      {
        label: "AddMachineDialog.tsx:335",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/AddMachineDialog.tsx:335",
      },
      {
        label: "MessageInput.tsx:1032,1044",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageInput.tsx:1032,1044",
      },
      {
        label: "MachineDetailPanel.tsx:732",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/machine/MachineDetailPanel.tsx:732",
      },
      {
        label: "ServerSelector.tsx:61",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/auth/ServerSelector.tsx:61",
      },
      {
        label: "ChannelMembers.tsx:265",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/ChannelMembers.tsx:265",
      },
      {
        label: "SelectionPopover.tsx:136",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SelectionPopover.tsx:136",
      },
      {
        label: "CreateAgentDialog.tsx:400",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/CreateAgentDialog.tsx:400",
      },
      {
        label: "RuntimeConfigFields.tsx:78,90,208,222,273",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/RuntimeConfigFields.tsx:78,90,208,222,273",
      },
      {
        label: "AgentDetailPanel.tsx:354,366,800,1810",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/agent/AgentDetailPanel.tsx:354,366,800,1810",
      },
      {
        label: "CreateJointChannelDialog.tsx:197,250",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateJointChannelDialog.tsx:197,250",
      },
      {
        label:
          "SettingsPanel.tsx:318,345,447,456,466,1127,1534,1546,2532,2542,2551,2560,2603,2612,2621,2789",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/SettingsPanel.tsx:318,345,447,456,466,1127,1534,1546,2532,2542,2551,2560,2603,2612,2621,2789",
      },
      {
        label: "OwnerOnboardingModal.tsx:936,1070",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/OwnerOnboardingModal.tsx:936,1070",
      },
      {
        label: "EditChannelDialog.tsx:154",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/EditChannelDialog.tsx:154",
      },
      {
        label: "SlugInput.tsx:23",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SlugInput.tsx:23",
      },
      {
        label: "CreateChannelDialog.tsx:261,296",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/channel/CreateChannelDialog.tsx:261,296",
      },
    ],
  },
] as const;

const SNIPPETS = {
  anatomy: `<Input />`,
  types: `<Input
  aria-label="Email"
  type="email"
  name="email"
  autoComplete="email"
  spellCheck={false}
  placeholder="you@example.com"
/>

<Input
  aria-label="Verification code"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="123456"
/>`,
  states: `<Input aria-label="Email" placeholder="you@example.com" />
<Input aria-label="Email" defaultValue="alex@example.com" />
<Input aria-label="Email" aria-invalid defaultValue="oops" />
<Input aria-label="Email" disabled placeholder="Disabled" />
<Input aria-label="Email" aria-invalid disabled defaultValue="Locked error" />`,
  field: `import { Field, FieldError, FieldLabel, Input } from "raft-ui";

<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" defaultValue="oops" />
  <FieldError match>Email is required.</FieldError>
</Field>`,
  passwordManagers: `<Input
  aria-label="Search"
  suppressPasswordManager
  placeholder="Search customers..."
/>`,
  migrationShell: `// Source
<input className="input-brutal" placeholder="you@example.com" />

// Current
<Input aria-label="Email" placeholder="you@example.com" />`,
  migrationInvalid: `// Source
<input
  className="input-brutal !border-brutal-red bg-brutal-red/5 ring-2 ring-brutal-red/60"
  defaultValue="oops"
/>

// Current
<Input aria-label="Email" aria-invalid defaultValue="oops" />`,
  migrationField: `// Source
<FormField label="Email" error="Email is required.">
  <input className="input-brutal" defaultValue="oops" />
</FormField>

// Current
<Field invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" defaultValue="oops" />
  <FieldError match>Email is required.</FieldError>
</Field>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "aria-invalid",
    type: "boolean",
    description:
      "Standalone invalid styling. Inside Field, prefer Field invalid; Base UI passes invalid state to the control.",
  },
  {
    name: "onValueChange",
    type: "(value, eventDetails) => void",
    description: "Base UI change callback for controlled composition.",
  },
  {
    name: "suppressPasswordManager",
    type: "boolean",
    default: "false",
    description:
      "Adds common password-manager ignore hints for non-credential fields where extension overlays would obscure custom UI.",
  },
  {
    name: "ref",
    type: "Ref<HTMLInputElement>",
    description: "Forwarded to the underlying input (React 19 ref prop).",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Replace the rendered element or compose with another component (Base UI).",
  },
  {
    name: "...props",
    type: "Base UI Input.Props",
    description: "All native input attributes (value, onChange, type, placeholder, etc.).",
  },
];

function MissingSource() {
  return (
    <span className="font-mono text-[10px] font-medium text-foreground-placeholder uppercase">
      Missing
    </span>
  );
}

const InputCurrent = INPUT_SOURCE_COMPARISON_COMPOSITION;

const INPUT_COMPOSITION_RAW_SOURCES = {
  Default: inputDefaultCompositionSource,
  DisabledStyling: inputDisabledStylingCompositionSource,
  InvalidDisabledPriority: inputInvalidDisabledPriorityCompositionSource,
  InvalidState: inputInvalidStateCompositionSource,
  PasswordManagerSuppression: inputPasswordManagerSuppressionCompositionSource,
} as const;

const INPUT_COMPOSITION_SOURCES = createCompositionSourceMap(INPUT_COMPOSITION_RAW_SOURCES);

const INPUT_COMPOSITION_SNIPPET_IDS = {
  Default: "inputDefaultComposition",
  DisabledStyling: "inputDisabledStylingComposition",
  InvalidDisabledPriority: "inputInvalidDisabledPriorityComposition",
  InvalidState: "inputInvalidStateComposition",
  PasswordManagerSuppression: "inputPasswordManagerSuppressionComposition",
} as const;

type InputCompositionKey = keyof typeof INPUT_COMPOSITION_SOURCES;

export const Route = createFileRoute("/components/input")({
  component: InputDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        ...createCompositionSnippetMap(INPUT_COMPOSITION_SOURCES, INPUT_COMPOSITION_SNIPPET_IDS),
      },
    }),
});

function InputDoc() {
  const code = Route.useLoaderData();
  const inputComposition = (key: InputCompositionKey) =>
    createCompositionPanelProps({
      code,
      key,
      paths: INPUT_SOURCE_COMPARISON_COMPOSITION_PATHS,
      snippetIds: INPUT_COMPOSITION_SNIPPET_IDS,
      sources: INPUT_COMPOSITION_SOURCES,
    });

  return (
    <DocPage
      title="Input"
      description="A single-line text control with theme-aware focus, invalid, and disabled states."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <InputPlaygroundPreview />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="types" title="Types">
            <Example html={code.types}>
              <Input
                className="w-80"
                aria-label="Email"
                type="email"
                name="email"
                autoComplete="email"
                spellCheck={false}
                placeholder="you@example.com"
              />
              <Input
                className="w-80"
                aria-label="Verification code"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
              />
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <DocNote>
              <InlineCode>disabled</InlineCode> wins over <InlineCode>aria-invalid</InlineCode>. A
              disabled invalid input keeps the disabled border and removes the invalid ring because
              the user cannot edit it.
            </DocNote>
            <Example html={code.states}>
              <div className="grid w-full max-w-96 gap-3">
                <Input aria-label="Email" placeholder="you@example.com" />
                <Input aria-label="Email" defaultValue="alex@example.com" />
                <Input aria-label="Email" aria-invalid defaultValue="oops" />
                <Input aria-label="Email" disabled placeholder="Disabled" />
                <Input aria-label="Email" aria-invalid disabled defaultValue="Locked error" />
              </div>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="field" title="With Field">
            <DocNote>
              Label and message come from <Link to="/components/field">Field</Link>. Input stays a
              pure control; set <InlineCode>invalid</InlineCode> on the field when the message
              belongs to the same validation state.
            </DocNote>
            <Example html={code.field}>
              <Field className="w-80" invalid>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" defaultValue="oops" />
                <FieldError match>Email is required.</FieldError>
              </Field>
            </Example>
          </DocSubsection>

          <DocSubsection parentId="usage" id="password-managers" title="Password managers">
            <DocNote>
              Use <InlineCode>suppressPasswordManager</InlineCode> only for non-credential fields
              where extension overlays would cover custom UI. Credential fields should keep native
              browser and password-manager help.
            </DocNote>
            <Example html={code.passwordManagers}>
              <Input
                className="w-80"
                aria-label="Search"
                suppressPasswordManager
                placeholder="Search customers..."
              />
            </Example>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              label: "Default",
              status: "match",
              note: "Source used the global input-brutal utility. Brutal keeps the same shell; Elegant remaps the same control API to the quieter input surface.",
              source: (
                <input
                  aria-label="Email"
                  className="input-brutal w-80"
                  placeholder="you@example.com"
                />
              ),
              brutal: <InputCurrent.Default />,
              elegant: <InputCurrent.Default />,
              elegantDark: <InputCurrent.Default />,
              ...inputComposition("Default"),
            },
            {
              label: "Invalid state",
              status: "match",
              note: "Source callers added red border/ring classes ad hoc. Current Input centralizes invalid styling behind aria-invalid or Field invalid.",
              source: (
                <input
                  aria-label="Email"
                  className="input-brutal w-80 !border-brutal-red bg-brutal-red/5 ring-2 ring-brutal-red/60"
                  defaultValue="oops"
                />
              ),
              brutal: <InputCurrent.InvalidState />,
              elegant: <InputCurrent.InvalidState />,
              elegantDark: <InputCurrent.InvalidState />,
              ...inputComposition("InvalidState"),
            },
            {
              label: "Disabled styling",
              status: "new",
              note: "Source input-brutal did not own a disabled visual state. Current Input adds one so unavailable fields remain readable without looking actionable.",
              source: <MissingSource />,
              brutal: <InputCurrent.DisabledStyling />,
              elegant: <InputCurrent.DisabledStyling />,
              elegantDark: <InputCurrent.DisabledStyling />,
              ...inputComposition("DisabledStyling"),
            },
            {
              label: "Invalid disabled priority",
              status: "new",
              note: "When invalid and disabled are both present, disabled wins because the user cannot edit the value in place.",
              source: <MissingSource />,
              brutal: <InputCurrent.InvalidDisabledPriority />,
              elegant: <InputCurrent.InvalidDisabledPriority />,
              elegantDark: <InputCurrent.InvalidDisabledPriority />,
              ...inputComposition("InvalidDisabledPriority"),
            },
            {
              label: "Password-manager suppression",
              status: "new",
              note: "A narrow escape hatch for non-credential fields where extension overlays obscure custom UI. It is intentionally opt-in.",
              source: <MissingSource />,
              brutal: <InputCurrent.PasswordManagerSuppression />,
              elegant: <InputCurrent.PasswordManagerSuppression />,
              elegantDark: <InputCurrent.PasswordManagerSuppression />,
              ...inputComposition("PasswordManagerSuppression"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
