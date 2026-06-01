import type { ReactNode } from "react";

type DocSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function DocSection({ id, title, children }: DocSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-8 border-t border-gray-100 py-10 first:border-t-0 first:pt-0"
    >
      <h2 className="group text-xl font-semibold tracking-tight text-gray-900">
        <a href={`#${id}`} className="no-underline">
          {title}
          <span className="ml-2 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100">
            #
          </span>
        </a>
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
