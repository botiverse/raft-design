import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { MarkdownHeading } from "raft-ui";

import { componentGroup, componentPages } from "#/lib/content/nav.ts";
import { SECTIONS } from "#/lib/content/pages.ts";

import { StatusLabel } from "./status-label.tsx";
import type { ComponentStatus } from "./status-label.tsx";

const PAGES = componentPages();

/** /components: every component raft-ui exports, by category, with its summary and status. */
export function ComponentIndex() {
  const info = SECTIONS.find((section) => section.id === "components")!;
  return (
    <div className="mx-auto max-w-[760px] px-4 pt-8 pb-24 md:px-10 md:pt-10">
      <header className="mb-8 flex flex-col gap-3">
        <h1 className="text-display font-bold">{info.title}</h1>
        <p className="text-body text-foreground-muted">{info.summary}</p>
      </header>
      {PAGES.map((page, index) => {
        const group = componentGroup(page);
        const startsGroup = group !== (index > 0 ? componentGroup(PAGES[index - 1]!) : undefined);
        return (
          <Fragment key={page.url}>
            {startsGroup ? (
              <MarkdownHeading level={2} className="mt-10 mb-2">
                {group}
              </MarkdownHeading>
            ) : null}
            <Link
              to={page.url}
              className="flex flex-col gap-1 border-b border-line-hairline py-3 outline-none hover:press-overlay focus-visible:shadow-focus"
            >
              <span className="flex items-center gap-2">
                <span className="text-subhead font-semibold text-foreground">
                  {page.frontMatter.title}
                </span>
                {page.frontMatter.status && page.frontMatter.status !== "stable" ? (
                  <StatusLabel status={page.frontMatter.status as ComponentStatus} />
                ) : null}
              </span>
              <span className="text-callout text-foreground-muted">{page.frontMatter.summary}</span>
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}
