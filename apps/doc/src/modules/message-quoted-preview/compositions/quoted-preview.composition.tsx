import { QuotedPreviewDirectMessageComposition } from "./quoted-preview-direct-message.composition.tsx";
import { QuotedPreviewLoadingComposition } from "./quoted-preview-loading.composition.tsx";
import { QuotedPreviewMessageComposition } from "./quoted-preview-message.composition.tsx";
import { QuotedPreviewUnavailableComposition } from "./quoted-preview-unavailable.composition.tsx";

export function MessageQuotedPreviewShowcaseComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <QuotedPreviewMessageComposition />
      <QuotedPreviewDirectMessageComposition />
      <QuotedPreviewLoadingComposition />
      <QuotedPreviewUnavailableComposition />
    </div>
  );
}
