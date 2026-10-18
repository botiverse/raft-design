import { raftUiChangelogMarkdown } from "#/data/raft-ui-release.ts";

import apiIndex from "../../data/api/_index.json";

// The generated component API (scripts/build-api.mjs): a small index of every
// component folder, loaded eagerly, and one props file per folder, loaded with
// its page.

export type ApiProp = {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
  deprecated?: string | true;
  from: "raft-ui" | "base-ui";
};

export type ApiComponent = {
  name: string;
  entry: "raft-ui" | "raft-ui/wip";
  description?: string;
  deprecated?: string | true;
  /** Also takes its element's own attributes. */
  native: boolean;
  props: ApiProp[];
};

export type ApiFolder = {
  names: string[];
  status: "stable" | "experimental" | "deprecated";
  description?: string;
};

export const API_INDEX = apiIndex as Record<string, ApiFolder>;

const folderFiles = import.meta.glob<ApiComponent[]>(
  ["../../data/api/*.json", "!../../data/api/_index.json"],
  { import: "default" },
);

export async function loadComponentApi(folder: string): Promise<ApiComponent[]> {
  const load = folderFiles[`../../data/api/${folder}.json`];
  return load ? load() : [];
}

function cell(text: string) {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/** The API as the `.md` twin shows it: one table per exported part. */
export function apiMarkdown(components: readonly ApiComponent[]) {
  if (components.length === 0) return "";
  const sections = components.map((component) => {
    const lines = [`### ${component.name}`, ""];
    if (component.deprecated) {
      lines.push(
        `Deprecated${typeof component.deprecated === "string" ? `: ${component.deprecated}` : "."}`,
        "",
      );
    }
    if (component.description) lines.push(component.description, "");
    if (component.props.length) {
      lines.push("| Prop | Type | Default | Description |", "| --- | --- | --- | --- |");
      for (const prop of component.props) {
        const name = `\`${prop.name}\`${prop.required ? " (required)" : ""}`;
        const description = [prop.deprecated ? "Deprecated." : "", prop.description ?? ""]
          .filter(Boolean)
          .join(" ");
        lines.push(
          `| ${name} | \`${cell(prop.type)}\` | ${prop.default ? `\`${cell(prop.default)}\`` : ""} | ${cell(description)} |`,
        );
      }
      lines.push("");
    }
    if (component.native) lines.push("Also takes the attributes of its element.", "");
    return lines.join("\n").trim();
  });
  return `## API\n\n${sections.join("\n\n")}`;
}

export type ChangeEntry = { version: string; kind: string; text: string };

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
        // Drop the trailing PR links; the version links to the release.
        text: line
          .slice(2)
          .replace(/\s*\((\[#\d+\]\([^)]*\)(,\s*)?)+\)\s*$/, "")
          .trim(),
      });
    }
  }
  return entries;
}

const CHANGES = parseChangelog(raftUiChangelogMarkdown);

/** The newest changelog entries, for the home page. */
export function latestChanges(limit: number): ChangeEntry[] {
  return CHANGES.slice(0, limit);
}

/** Changelog entries that name one of the folder's exports as code (`Button`, `Button` `variant`). */
export function changesFor(folder: string, limit = 8): ChangeEntry[] {
  const names = API_INDEX[folder]?.names ?? [];
  if (names.length === 0) return [];
  const pattern = new RegExp("`(" + names.join("|") + ")(?![\\w])");
  return CHANGES.filter((entry) => pattern.test(entry.text)).slice(0, limit);
}

export function changesMarkdown(changes: readonly ChangeEntry[]) {
  if (changes.length === 0) return "";
  return `## Changes\n\n${changes.map((change) => `- ${change.version} (${change.kind}): ${change.text}`).join("\n")}`;
}
