import type { ReactNode } from "react";

type DocSectionProps = {
  id: string;
  title: string;
  /** Optional inline marker (e.g. a WIP badge) rendered after the title. */
  badge?: ReactNode;
  children: ReactNode;
};

export function DocSection({ id, title, badge, children }: DocSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-8 border-t border-line-subtle py-10 first:border-t-0 first:pt-0"
    >
      <h2 className="group flex items-center gap-2 text-lg font-medium tracking-tight text-foreground-strong">
        <a href={`#${id}`} className="no-underline">
          {title}
          <span className="ml-2 text-foreground-placeholder opacity-0 transition-opacity group-hover:opacity-100">
            #
          </span>
        </a>
        {badge}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
