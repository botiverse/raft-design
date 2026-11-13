import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { ScrollArea } from "@botiverse/raft-ui";
import { createFileRoute } from "@tanstack/react-router";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { loadExample } from "#/lib/examples.ts";

// The phone view of an `example` block: the same composition in its own
// document, so media queries and viewport units see a 375px phone.
export const Route = createFileRoute("/iframe/example")({
  ssr: false,
  staticData: { standalone: true },
  validateSearch: (search) => ({
    path: typeof search.path === "string" ? search.path : "",
    mode: search.mode === "dark" ? ("dark" as const) : ("light" as const),
  }),
  component: ExampleFrame,
});

function ExampleFrame() {
  const { path, mode } = Route.useSearch();
  const [Example, setExample] = useState<ComponentType | null>(null);

  useEffect(() => {
    void loadExample(path).then((component) => setExample(() => component));
  }, [path]);

  return (
    <PreviewThemeScope mode={mode} className="h-dvh bg-layer-canvas">
      {/* The frame's page: the content centers the example and pads it, so the area's gutters
          are no flex item of that box. It stays as wide as the frame (`size-full`), so an
          example with a scroller of its own shrinks to the frame and scrolls inside itself. */}
      <ScrollArea
        orientation="both"
        className="h-full"
        contentClassName="flex size-full items-center justify-center p-4"
      >
        {Example ? <Example /> : null}
      </ScrollArea>
    </PreviewThemeScope>
  );
}
