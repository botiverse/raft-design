import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { MarkdownHeading } from "@botiverse/raft-ui";

import { componentItems } from "#/lib/content/nav.ts";
import { pageAt, sectionIntro, sectionOf } from "#/lib/content/pages.ts";

import { DocMarkdown } from "./doc-markdown.tsx";
import { StatusLabel } from "./status-label.tsx";
import type { ComponentStatus } from "./status-label.tsx";

const ITEMS = componentItems();
const INTRO = sectionIntro("components");

/**
 * /components: the overview (design/components/overview.md), then every
 * component raft-ui exports by layer and category, with its summary and
 * status. Deprecated components are not listed; their pages stay.
 */
export function ComponentIndex() {
  const info = sectionOf("components");
  return (
    <div className="mx-auto max-w-[760px] px-4 pt-8 pb-24 md:px-10 md:pt-10">
      <header className="mb-8 flex flex-col gap-3">
        <h1 className="text-display font-bold">{INTRO?.frontMatter.title ?? info.title}</h1>
        <p className="text-body text-foreground-muted">
          {INTRO?.frontMatter.summary ?? info.summary}
        </p>
      </header>
      {INTRO?.body ? (
        <div className="mb-4">
          <DocMarkdown sourcePath={INTRO.repoPath}>{INTRO.body}</DocMarkdown>
        </div>
      ) : null}
      {ITEMS.map((item, index) => {
        const previous = ITEMS[index - 1];
        const startsLayer = item.layer !== undefined && item.layer !== previous?.layer;
        const startsGroup = startsLayer || item.group !== previous?.group;
        return (
          <Fragment key={item.url}>
            {startsLayer ? (
              <MarkdownHeading level={2} className="mt-12 mb-2">
                {item.layer}
              </MarkdownHeading>
            ) : null}
            {startsGroup ? (
              <MarkdownHeading
                level={item.layer === undefined ? 2 : 3}
                className={item.layer === undefined ? "mt-12 mb-2" : "mt-8 mb-2"}
              >
                {item.group}
              </MarkdownHeading>
            ) : null}
            <Link
              to={item.url}
              className="flex flex-col gap-1 border-b border-line-hairline py-3 outline-none hover:overlay-subtle focus-visible:shadow-focus"
            >
              <span className="flex items-center gap-2">
                <span className="text-subhead font-semibold text-foreground">{item.title}</span>
                {item.status && item.status !== "stable" ? (
                  <StatusLabel status={item.status as ComponentStatus} />
                ) : null}
              </span>
              <span className="text-callout text-foreground-muted">
                {pageAt(item.url)?.frontMatter.summary}
              </span>
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}
