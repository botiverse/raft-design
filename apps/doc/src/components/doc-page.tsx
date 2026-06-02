import type { ReactNode } from "react";
import { Toc, type TocItem } from "./toc.tsx";

type DocPageProps = {
  title: string;
  description?: string;
  /** Quick summary of what this component changes versus its upstream original. */
  overview?: ReactNode;
  toc: readonly TocItem[];
  children: ReactNode;
};

export function DocPage({ title, description, overview, toc, children }: DocPageProps) {
  return (
    <>
      <article className="mx-auto w-full min-w-0 max-w-160 px-8 py-12 xl:max-w-4xl 2xl:max-w-6xl">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          {description ? <p className="mt-3 text-lg text-gray-600">{description}</p> : null}
          {overview ? (
            <div className="mt-4 border-l-2 border-gray-200 pl-4 text-sm leading-relaxed text-gray-500">
              {overview}
            </div>
          ) : null}
        </header>
        {children}
      </article>
      <Toc items={toc} />
    </>
  );
}
