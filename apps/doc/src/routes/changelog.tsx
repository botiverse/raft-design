import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Badge, InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { raftUiChangelogMarkdown, raftUiVersion } from "#/data/raft-ui-release.ts";

type ChangelogSection = {
  title: string;
  entries: string[];
};

type ChangelogRelease = {
  version: string;
  href?: string;
  date?: string;
  sections: ChangelogSection[];
};

const releaseHeadingPattern = /^##\s+(?:\[([^\]]+)\]\(([^)]+)\)|([^\s]+))(?:\s+\(([^)]+)\))?\s*$/;
const inlineTokenPattern = /(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;

function parseChangelog(markdown: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let currentRelease: ChangelogRelease | undefined;
  let currentSection: ChangelogSection | undefined;

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    const releaseMatch = line.match(releaseHeadingPattern);

    if (releaseMatch) {
      currentRelease = {
        version: releaseMatch[1] ?? releaseMatch[3] ?? "",
        href: releaseMatch[2],
        date: releaseMatch[4],
        sections: [],
      };
      releases.push(currentRelease);
      currentSection = undefined;
      continue;
    }

    if (!currentRelease || !line) {
      continue;
    }

    if (line.startsWith("### ")) {
      currentSection = { title: line.slice(4).trim(), entries: [] };
      currentRelease.sections.push(currentSection);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!currentSection) {
        currentSection = { title: "Changes", entries: [] };
        currentRelease.sections.push(currentSection);
      }
      currentSection.entries.push(line.slice(2).trim());
      continue;
    }

    const lastEntry = currentSection?.entries.at(-1);
    if (lastEntry && currentSection) {
      currentSection.entries[currentSection.entries.length - 1] = `${lastEntry} ${line}`;
    }
  }

  return releases;
}

function releaseId(version: string) {
  return `version-${version.replace(/[^a-zA-Z0-9]+/g, "-")}`;
}

function renderInlineMarkdown(value: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of value.matchAll(inlineTokenPattern)) {
    const token = match[0];
    const offset = match.index;
    const key = `${offset}-${token}`;

    if (offset > cursor) {
      nodes.push(value.slice(cursor, offset));
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(<InlineCode key={key}>{token.slice(1, -1)}</InlineCode>);
      cursor = offset + token.length;
      continue;
    }

    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      nodes.push(
        <a
          key={key}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground underline decoration-line-hairline underline-offset-4 transition-colors hover:decoration-foreground-muted"
        >
          {linkMatch[1]}
        </a>,
      );
      cursor = offset + token.length;
      continue;
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
      cursor = offset + token.length;
    }
  }

  if (cursor < value.length) {
    nodes.push(value.slice(cursor));
  }

  return nodes;
}

const releases = parseChangelog(raftUiChangelogMarkdown);
const toc = releases.map((release) => ({
  id: releaseId(release.version),
  title: `v${release.version}`,
}));

export const Route = createFileRoute("/changelog")({
  component: ChangelogDoc,
});

function ChangelogDoc() {
  return (
    <DocPage
      title="Changelog"
      description="Consumer-facing changes to the stable raft-ui package surface."
      toc={toc}
      headerAction={
        <Badge appearance="soft" variant="primary" className="font-mono">
          v{raftUiVersion}
        </Badge>
      }
    >
      {releases.length ? (
        <div className="space-y-14">
          {releases.map((release, releaseIndex) => (
            <section
              key={release.version}
              id={releaseId(release.version)}
              className="scroll-mt-8 border-t border-line-hairline pt-10 first:border-t-0 first:pt-0"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">
                    v{release.version}
                  </h2>
                  {releaseIndex === 0 ? (
                    <Badge appearance="soft" variant="muted">
                      Latest
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground-muted">
                  {release.date ? <time dateTime={release.date}>{release.date}</time> : null}
                  {release.href ? (
                    <a
                      href={release.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground underline decoration-line-hairline underline-offset-4 transition-colors hover:decoration-foreground-muted"
                    >
                      Compare
                    </a>
                  ) : null}
                </div>
              </header>

              <div className="mt-8 space-y-8">
                {release.sections.map((section) => (
                  <section key={section.title}>
                    <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground-muted">
                      {section.entries.map((entry) => (
                        <li key={entry} className="grid grid-cols-[0.375rem_1fr] gap-3">
                          <span
                            aria-hidden
                            className="mt-[0.625rem] size-1.5 rounded-full bg-foreground-hint"
                          />
                          <span>{renderInlineMarkdown(entry)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-6 text-foreground-muted">
          No stable package changes have been published yet.
        </p>
      )}
    </DocPage>
  );
}
