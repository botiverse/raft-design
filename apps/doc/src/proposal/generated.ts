import type { PropRow } from "#/components/props-table.tsx";
import { raftUiChangelogMarkdown } from "#/data/raft-ui-release.ts";

export type ChangeEntry = { version: string; kind: string; text: string };

/** Every changelog bullet, with the release and the kind (Added, Changed, …) it sits under. */
function parseChangelog(markdown: string): ChangeEntry[] {
  const entries: ChangeEntry[] = [];
  let version = "";
  let kind = "";
  for (const line of markdown.split("\n")) {
    const release = line.match(/^## \[?([\d.]+)/);
    if (release) {
      version = release[1]!;
      continue;
    }
    const heading = line.match(/^### (.+)/);
    if (heading) {
      kind = heading[1]!.trim();
      continue;
    }
    if (line.startsWith("- ") && version) {
      entries.push({
        version,
        kind,
        text: line
          .slice(2)
          .replace(/\s*\(\[#\d+\]\([^)]*\)(, \[#\d+\]\([^)]*\))*\)/g, "")
          .trim(),
      });
    }
  }
  return entries;
}

const CHANGES = parseChangelog(raftUiChangelogMarkdown);

/**
 * The "Changes" section of a component page: changelog bullets that name the
 * component as code (`Button`, `ButtonProps`, `Button` `variant`…). The
 * implementation can key this on Changesets' package scopes instead.
 */
export function changesFor(title: string, limit = 6) {
  const name = new RegExp("`" + title + "[`A-Z ]");
  return CHANGES.filter((entry) => name.test(entry.text)).slice(0, limit);
}

export const LATEST_CHANGES = CHANGES.slice(0, 4);

/**
 * Props tables are generated from the component's TypeScript in the
 * implementation (react-docgen-typescript or the TS compiler API at build
 * time). The mock hard-codes Button's.
 */
export const MOCK_PROPS: Record<string, readonly PropRow[]> = {
  button: [
    {
      name: "variant",
      type: '"default" | "accent" | "outline" | "ghost" | "on-frame" | "warning" | "danger" | …',
      default: '"default"',
      description:
        "What the action is: the primary action, a secondary action, or one with a consequence.",
    },
    {
      name: "size",
      type: '"md" | "lg" | "xl" | "inline" | "icon-md" | "icon-lg"',
      default: '"md"',
      description: "Height and shape.",
    },
    {
      name: "loading",
      type: "boolean",
      default: "false",
      description: "Shows the pixel spinner and keeps the width.",
    },
    {
      name: "loadingLabel",
      type: "string",
      default: '"Loading"',
      description: "Accessible label while loading.",
    },
    {
      name: "render",
      type: "ReactElement | (props, state) => ReactElement",
      description: "Render another element, such as a link.",
    },
  ],
};

export function propsMarkdown(rows: readonly PropRow[]) {
  return [
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| \`${row.name}\` | \`${row.type.replace(/\|/g, "\\|")}\` | ${row.default ?? ""} | ${row.description} |`,
    ),
  ].join("\n");
}
