import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { loadExample } from "#/proposal/examples.ts";

// The phone view of an `example` block: the same composition in its own
// document, so media queries and viewport units see a 375px phone.
export const Route = createFileRoute("/iframe/proposal-example")({
  ssr: false,
  staticData: { standalone: true },
  validateSearch: (search) => ({
    path: typeof search.path === "string" ? search.path : "",
    mode: search.mode === "dark" ? ("dark" as const) : ("light" as const),
  }),
  component: ProposalExampleFrame,
});

function ProposalExampleFrame() {
  const { path, mode } = Route.useSearch();
  const [Example, setExample] = useState<ComponentType | null>(null);

  useEffect(() => {
    void loadExample(path).then((component) => setExample(() => component));
  }, [path]);

  return (
    <PreviewThemeScope
      mode={mode}
      className="flex h-dvh items-center justify-center overflow-auto bg-layer-canvas p-4"
    >
      {Example ? <Example /> : null}
    </PreviewThemeScope>
  );
}
