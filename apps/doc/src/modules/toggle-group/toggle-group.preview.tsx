import { Preview } from "#/components/preview.tsx";
import type { HighlightedSnippet } from "#/lib/highlight.tsx";
import { ToggleGroupFormattingComposition } from "./compositions/formatting.composition.tsx";

export function ToggleGroupPreview({
  code,
  collapsedCode,
}: {
  code: HighlightedSnippet;
  collapsedCode: HighlightedSnippet;
}) {
  return (
    <Preview>
      <Preview.Canvas>
        <ToggleGroupFormattingComposition />
      </Preview.Canvas>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
