import type { ReactNode } from "react";

export function SearchComparisonPreviewFrame({ children }: { children: ReactNode }) {
  return (
    <section className="flex h-[42rem] max-h-[80vh] w-full min-w-0 flex-col overflow-hidden bg-layer-panel">
      {children}
    </section>
  );
}
