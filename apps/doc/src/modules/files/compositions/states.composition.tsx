import type { ReactNode } from "react";

import { FilesPanelComposition } from "./files-panel.composition.tsx";

export function FilesPanelStatesComposition() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-3">
      <FilesPanelState label="Loading">
        <FilesPanelComposition files={[]} loading />
      </FilesPanelState>
      <FilesPanelState label="Error">
        <FilesPanelComposition files={[]} error="Could not load files." />
      </FilesPanelState>
      <FilesPanelState label="Empty">
        <FilesPanelComposition files={[]} />
      </FilesPanelState>
    </div>
  );
}

function FilesPanelState({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section className="flex min-h-80 flex-col overflow-hidden border border-line-subtle">
      <h3 className="border-b border-line-subtle bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </h3>
      {children}
    </section>
  );
}
