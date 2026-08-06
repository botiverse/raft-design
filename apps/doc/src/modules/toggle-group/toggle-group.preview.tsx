import { Preview } from "#/components/preview.tsx";
import { ToggleGroupFormattingComposition } from "./compositions/formatting.composition.tsx";

export function ToggleGroupPreview({
  code,
  collapsedCode,
}: {
  code: string;
  collapsedCode: string;
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
