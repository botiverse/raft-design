import type { ReactNode } from "react";
import { StatusBadge } from "./status-badge.tsx";

type DocSectionProps = {
  id: string;
  title: string;
  /** Optional inline marker (e.g. a WIP badge) rendered after the title. */
  badge?: ReactNode;
  children: ReactNode;
};

export function DocSection({ id, title, badge, children }: DocSectionProps) {
  const resolvedBadge =
    id === "api" ? (
      <>
        <StatusBadge status="in-progress" />
        {badge}
      </>
    ) : (
      badge
    );

  return (
    <section id={id} className="scroll-mt-8 py-10 first:pt-0">
      <h2 className="group flex items-center gap-2 text-lg font-medium tracking-tight text-foreground-strong">
        <a href={`#${id}`} className="no-underline">
          {title}
          <span className="ml-2 text-foreground-placeholder opacity-0 transition-opacity group-hover:opacity-100">
            #
          </span>
        </a>
        {resolvedBadge}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
