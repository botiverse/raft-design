import type { ReactNode } from "react";
import { Toc, type TocItem } from "./toc.tsx";

type DocPageProps = {
  title: string;
  description?: string;
  toc: readonly TocItem[];
  children: ReactNode;
};

export function DocPage({ title, description, toc, children }: DocPageProps) {
  return (
    <div className="mx-auto flex max-w-5xl gap-12 px-8 py-12">
      <article className="min-w-0 flex-1">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          {description ? <p className="mt-3 text-lg text-gray-600">{description}</p> : null}
        </header>
        {children}
      </article>
      <Toc items={toc} />
    </div>
  );
}
