import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InlineCode,
  Kbd,
  Field,
  FieldError,
  FieldLabel,
} from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { InputGroupPlaygroundPreview } from "#/modules/input-group/input-group.preview.tsx";
import { Search, Upload } from "lucide-react";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  preview: `<InputGroup>
  <InputGroupAddon.Text variant="container">https://</InputGroupAddon.Text>
  <InputGroupInput placeholder="Default" />
  <InputGroupAddon.Text align="inline-end" variant="container">.com</InputGroupAddon.Text>
</InputGroup>`,
  anatomy: `import { InputGroup, InputGroupInput } from "raft-ui";

<InputGroup>
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
  <InputGroupInput aria-label="Search" data-invalid defaultValue="???" />
</InputGroup>

<InputGroup>
  <InputGroupAddon.Text>$</InputGroupAddon.Text>
  <InputGroupInput aria-label="Amount" disabled placeholder="0.00" />
  <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
</InputGroup>

<InputGroup>
  <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
  <InputGroupInput aria-label="Server slug" data-invalid defaultValue="Bad Slug" />
</InputGroup>`,
  field: `import { Field, FieldError, FieldLabel, InputGroup, InputGroupInput } from "raft-ui";

<Field invalid>
  <FieldLabel htmlFor="invite-email">Invite email</FieldLabel>
  <InputGroup>
    <InputGroupInput id="invite-email" type="email" defaultValue="oops" />
  </InputGroup>
  <FieldError match>Use a valid email.</FieldError>
</Field>`,
} as const;

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

export const Route = createFileRoute("/components/input-group")({
  component: InputGroupDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
      },
    }),
});

function InputGroupDoc() {
  const code = Route.useLoaderData();
  return (
    <DocPage
      title="InputGroup"
      description="A single-line input composition shell with leading or trailing addons."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <InputGroupPlaygroundPreview code={code.preview} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="addons" title="Addons">
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.addons} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="text-affixes" title="Text affixes">
            <Preview>
              <Preview.Canvas>
                <InputGroup className="w-80">
                  <InputGroupAddon.Text>$</InputGroupAddon.Text>
                  <InputGroupInput aria-label="Amount" placeholder="0.00" inputMode="decimal" />
                  <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
                </InputGroup>
                <InputGroup className="w-80">
                  <InputGroupInput aria-label="Email username" placeholder="alex" />
                  <InputGroupAddon.Text align="inline-end">@example.com</InputGroupAddon.Text>
                </InputGroup>
              </Preview.Canvas>
              <Preview.Code html={code.textAffixes} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="addon-variants" title="Addon variants">
            <div className="space-y-4">
              <DocNote>
                Use <InlineCode>variant="default"</InlineCode> for light inline adornments such as
                search icons or keyboard hints. Use <InlineCode>variant="container"</InlineCode>{" "}
                when the addon is part of the value structure, like a protocol, domain suffix, unit,
                or icon box.
              </DocNote>
              <Preview>
                <Preview.Canvas>
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
                </Preview.Canvas>
                <Preview.Code html={code.addonVariants} />
              </Preview>
            </div>
          </DocSubsection>

          <DocSubsection parentId="usage" id="actions" title="Actions">
            <Preview>
              <Preview.Canvas>
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
              </Preview.Canvas>
              <Preview.Code html={code.actions} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="states" title="States">
            <div className="space-y-4">
              <DocNote>
                Put <InlineCode>data-invalid</InlineCode> and <InlineCode>disabled</InlineCode> on{" "}
                <InlineCode>InputGroupInput</InlineCode>. The wrapper owns the visible state through{" "}
                <InlineCode>has-*</InlineCode>.
              </DocNote>
              <Preview>
                <Preview.Canvas>
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
                      <InputGroupInput aria-label="Search" data-invalid defaultValue="???" />
                    </InputGroup>
                    <InputGroup>
                      <InputGroupAddon.Text>$</InputGroupAddon.Text>
                      <InputGroupInput aria-label="Amount" disabled placeholder="0.00" />
                      <InputGroupAddon.Text align="inline-end">USD</InputGroupAddon.Text>
                    </InputGroup>
                    <InputGroup>
                      <InputGroupAddon.Text variant="container">/</InputGroupAddon.Text>
                      <InputGroupInput
                        aria-label="Server slug"
                        data-invalid
                        defaultValue="Bad Slug"
                      />
                    </InputGroup>
                  </div>
                </Preview.Canvas>
                <Preview.Code html={code.states} />
              </Preview>
            </div>
          </DocSubsection>

          <DocSubsection parentId="usage" id="field" title="With Field">
            <Preview>
              <Preview.Canvas>
                <Field className="w-80" invalid>
                  <FieldLabel htmlFor="invite-email">Invite email</FieldLabel>
                  <InputGroup>
                    <InputGroupInput id="invite-email" type="email" defaultValue="oops" />
                  </InputGroup>
                  <FieldError match>Use a valid email.</FieldError>
                </Field>
              </Preview.Canvas>
              <Preview.Code html={code.field} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="InputGroup">
            <PropsTable rows={GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-addon" title="InputGroupAddon">
            <PropsTable rows={ADDON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-addon-text" title="InputGroupAddon.Text">
            <PropsTable rows={TEXT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-input" title="InputGroupInput">
            <PropsTable rows={INPUT_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
