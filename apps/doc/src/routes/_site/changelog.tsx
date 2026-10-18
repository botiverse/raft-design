import { createFileRoute } from "@tanstack/react-router";

import { DocLayout } from "#/components/site/doc-layout.tsx";
import { DocMarkdown } from "#/components/site/doc-markdown.tsx";
import { raftUiChangelogMarkdown, raftUiVersion } from "#/data/raft-ui-release.ts";
import { REPOSITORY_URL } from "#/lib/content/links.ts";
import { headingSlug } from "#/lib/content/slug.ts";

const SUMMARY = "What changed in each release of raft-ui, newest first.";

/** packages/ui/CHANGELOG.md is Markdown already; the page renders it as written. */
const BODY = raftUiChangelogMarkdown.replace(/^\s*# .+\n+/, "").trim();

/** Release headings (`## [0.7.0](…) (2026-10-18)`) as they read: `0.7.0 (2026-10-18)`. */
const TOC = [...BODY.matchAll(/^## (.+)$/gm)].map(([, heading]) => {
  const title = heading!.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
  return { id: headingSlug(title), title, depth: 2 as const };
});

async function getMarkdown() {
  return `# Changelog\n\n> ${SUMMARY}\n\n${BODY}\n`;
}

export const Route = createFileRoute("/_site/changelog")({
  head: () => ({
    meta: [{ name: "description", content: SUMMARY }],
    links: [{ rel: "alternate", type: "text/markdown", href: "/changelog.md" }],
  }),
  component: Changelog,
});

function Changelog() {
  return (
    <DocLayout
      eyebrow={`raft-ui ${raftUiVersion}`}
      title="Changelog"
      summary={SUMMARY}
      markdownPath="/changelog.md"
      sourceHref={`${REPOSITORY_URL}/blob/main/packages/ui/CHANGELOG.md`}
      getMarkdown={getMarkdown}
      toc={TOC}
    >
      <DocMarkdown sourcePath="packages/ui/CHANGELOG.md">{BODY}</DocMarkdown>
    </DocLayout>
  );
}
