import type { ReactNode } from "react";
import { StatusBadge } from "./status-badge.tsx";
import { ThemeSwitcher } from "./theme-switcher.tsx";
import { isMarkdownMode } from "#/lib/markdown-mode.ts";

type DocSectionProps = {
  id: string;
  title: string;
  /** Optional inline marker (e.g. a WIP badge) rendered after the title. */
  badge?: ReactNode;
  showThemeSwitcher?: boolean;
  children: ReactNode;
};

type DocSubsectionProps = {
  parentId: string;
  id: string;
  title: string;
  badge?: ReactNode;
  showThemeSwitcher?: boolean;
  children: ReactNode;
};

export function DocSection({
  id,
  title,
  badge,
  showThemeSwitcher = false,
  children,
}: DocSectionProps) {
  const resolvedBadge =
    id === "api" ? (
      <>
        <StatusBadge status="in-progress" />
        {badge}
      </>
    ) : (
      badge
    );

  if (isMarkdownMode()) {
    return (
      <section id={id}>
        <h2>{title}</h2>
        {children}
      </section>
    );
  }

  return (
    <section id={id} className="scroll-mt-8 py-10 first:pt-0">
      <div className="flex items-center justify-between gap-4">
        <h2 className="group flex items-center gap-2 text-lg font-medium tracking-tight text-foreground">
          <a href={`#${id}`} className="no-underline">
            {title}
            <span className="ml-2 text-foreground-hint opacity-0 transition-opacity group-hover:opacity-100">
              #
            </span>
          </a>
          {resolvedBadge}
        </h2>
        {showThemeSwitcher ? <ThemeSwitcher /> : null}
      </div>
      <div data-doc-section-content className="mt-5">
        {children}
      </div>
    </section>
  );
}

export function DocSubsection({
  parentId,
  id,
  title,
  badge,
  showThemeSwitcher,
  children,
}: DocSubsectionProps) {
  const showSwitcher = showThemeSwitcher ?? parentId === "usage";

  const includeInToc = parentId !== "api";

  if (isMarkdownMode()) {
    return (
      <section id={id}>
        <h3>{title}</h3>
        {children}
      </section>
    );
  }

  return (
    <section
      id={id}
      {...(includeInToc ? { "data-doc-toc-parent": parentId, "data-doc-toc-item": title } : {})}
      className="scroll-mt-8 space-y-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="group flex items-center gap-2 text-sm font-medium text-foreground">
          <a href={`#${id}`} className="no-underline">
            {title}
            <span className="ml-2 text-foreground-hint opacity-0 transition-opacity group-hover:opacity-100">
              #
            </span>
          </a>
          {badge}
        </h3>
        {showSwitcher ? <ThemeSwitcher /> : null}
      </div>
      {children}
    </section>
  );
}
