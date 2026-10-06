import { createFileRoute } from "@tanstack/react-router";
import {
  InlineCode,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableColgroup,
  TableColumn,
  TableHead,
  TableHeader,
  TableRow,
} from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
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

const ACCESS_OPTIONS = [
  { value: "none", label: "No access" },
  { value: "read", label: "Read only" },
  { value: "write", label: "Writable" },
] as const;

type AccessValue = (typeof ACCESS_OPTIONS)[number]["value"];

const PERMISSION_ROWS: readonly { resource: string; detail: string; access: AccessValue }[] = [
  { resource: "Messages", detail: "Post and edit messages in joined channels.", access: "write" },
  { resource: "Reminders", detail: "Read and complete reminder cards.", access: "read" },
  { resource: "Changelog", detail: "Private to owners and admins.", access: "none" },
];

const SNIPPETS = {
  preview: `import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "raft-ui";

const accessOptions = [
  { value: "none", label: "No access" },
  { value: "read", label: "Read only" },
  { value: "write", label: "Writable" },
] as const;

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Resource</TableHead>
      <TableHead>Access</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <div>Messages</div>
        <div>Post and edit messages in joined channels.</div>
      </TableCell>
      <TableCell>
        <Select defaultValue="write" items={accessOptions}>
          <SelectTrigger aria-label="Access for Messages">
            <SelectValue />
            <SelectIcon />
          </SelectTrigger>
          <SelectContent>
            <SelectList>
              {accessOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <SelectItemText>{option.label}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  anatomy: `import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "raft-ui";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead />
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell />
    </TableRow>
  </TableBody>
</Table>`,
  accessibleName: `import { Table, TableBody, TableCaption, TableCell, TableRow } from "raft-ui";

<Table>
  <TableCaption>Recent builds</TableCaption>
  <TableBody>
    <TableRow>
      <TableCell>2026.10.6</TableCell>
      <TableCell>Succeeded</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  columnWidths: `import { Table, TableBody, TableCell, TableColgroup, TableColumn, TableRow } from "raft-ui";

<Table className="table-fixed">
  <TableColgroup>
    <TableColumn className="w-3/5" />
    <TableColumn className="w-2/5" />
  </TableColgroup>
  <TableBody>
    <TableRow>
      <TableCell>Messages</TableCell>
      <TableCell>Writable</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  longContent: `<Table>
  <TableBody>
    <TableRow>
      <TableCell>repo:botiverse/raft_ui_identifier_without_spaces</TableCell>
      <TableCell>Read only</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
} as const;

const TABLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"table">',
    description:
      "Native table root. The base writes no table-layout, so table-fixed stays available; pair it with TableColgroup when stable widths matter.",
  },
];

const HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"thead">',
    description: "Column-header row group.",
  },
];

const BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"tbody">',
    description:
      "Body rows. The last row drops its cell separators — scoped to tbody, so the header row keeps its line.",
  },
];

const ROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"tr">',
    description: "One row; separators are painted by its cells.",
  },
];

const HEAD_PROPS: readonly PropRow[] = [
  {
    name: "scope",
    type: 'ComponentProps<"th">["scope"]',
    default: '"col"',
    description: "Header cell. Row headers are allowed but not restyled in v1.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"th">',
    description: "Native header cell attributes.",
  },
];

const CELL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"td">',
    description: "Body cell; wraps on any character and aligns to the top.",
  },
];

const CAPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"caption">',
    description:
      "The table's accessible name, rendered below the table. Hide it with sr-only when the design does not show one.",
  },
];

const COLGROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"colgroup">',
    description: "Column-width declarations; pair with the table-fixed class on Table.",
  },
];

const COLUMN_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"col">',
    description: "One column's width declaration (w-* utilities or an inline width).",
  },
];

function AccessSelect({ label, defaultValue }: { label: string; defaultValue: AccessValue }) {
  return (
    <Select defaultValue={defaultValue} items={ACCESS_OPTIONS}>
      <SelectTrigger aria-label={`Access for ${label}`}>
        <SelectValue />
        <SelectIcon />
      </SelectTrigger>
      <SelectContent>
        <SelectList>
          {ACCESS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <SelectItemText>{option.label}</SelectItemText>
              <SelectItemIndicator />
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}

function PermissionsTable() {
  return (
    <Table className="w-[480px]">
      <TableCaption className="sr-only">Application permissions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Resource</TableHead>
          <TableHead>Access</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {PERMISSION_ROWS.map((row) => (
          <TableRow key={row.resource}>
            <TableCell>
              <div className="font-medium">{row.resource}</div>
              <div className="text-xs text-foreground-muted">{row.detail}</div>
            </TableCell>
            <TableCell>
              <AccessSelect label={row.resource} defaultValue={row.access} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const Route = createFileRoute("/components/table")({
  component: TableDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TableDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Table"
      description="Rows and columns of data with a themed header, row separators and cell padding, over native table semantics."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <PermissionsTable />
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
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
        <div className="space-y-8">
          <DocSubsection parentId="usage" id="accessible-name" title="Accessible name">
            <DocNote>
              Every table carries a name: a visible <InlineCode>TableCaption</InlineCode>, or the
              same caption hidden with <InlineCode>sr-only</InlineCode> when the design does not
              show one. Reach for <InlineCode>aria-label</InlineCode> only when a caption cannot
              exist at all.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <Table className="w-[480px]">
                  <TableCaption>Recent builds</TableCaption>
                  <TableBody>
                    <TableRow>
                      <TableCell>2026.10.6</TableCell>
                      <TableCell className="text-right">Succeeded</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2026.10.5</TableCell>
                      <TableCell className="text-right">Succeeded</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Preview.Canvas>
              <Preview.Code html={code.accessibleName} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="column-widths" title="Column widths">
            <DocNote>
              Column widths stay the caller's business: the base writes no{" "}
              <InlineCode>table-layout</InlineCode>. Switch to <InlineCode>table-fixed</InlineCode>{" "}
              and declare the split with <InlineCode>TableColgroup</InlineCode> /{" "}
              <InlineCode>TableColumn</InlineCode> when content-driven sizing would make the columns
              jump.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <Table className="w-[480px] table-fixed">
                  <TableColgroup>
                    <TableColumn className="w-3/5" />
                    <TableColumn className="w-2/5" />
                  </TableColgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Access</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Messages</TableCell>
                      <TableCell>Writable</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Audit log</TableCell>
                      <TableCell>No access</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Preview.Canvas>
              <Preview.Code html={code.columnWidths} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="long-content" title="Long content">
            <DocNote>
              Cell text wraps on any character, so identifier-like names without spaces still break
              inside a narrow column instead of pushing the table past its container.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <Table className="w-[320px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Access</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>repo:botiverse/raft_ui_identifier_without_spaces</TableCell>
                      <TableCell>Read only</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Preview.Canvas>
              <Preview.Code html={code.longContent} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-table" title="Table">
            <PropsTable rows={TABLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-table-header" title="TableHeader">
            <PropsTable rows={HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-table-body" title="TableBody">
            <PropsTable rows={BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-table-row" title="TableRow">
            <PropsTable rows={ROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-table-head" title="TableHead">
            <PropsTable rows={HEAD_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-table-cell" title="TableCell">
            <PropsTable rows={CELL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-table-caption" title="TableCaption">
            <PropsTable rows={CAPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-table-colgroup" title="TableColgroup">
            <PropsTable rows={COLGROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-table-column" title="TableColumn">
            <PropsTable rows={COLUMN_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
