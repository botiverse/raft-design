import {
  QuotedPreviewFeedbackComposition,
  QuotedPreviewMessageComposition,
} from "./message-product-states.composition.tsx";

export function MessageQuotedPreviewShowcaseComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <QuotedPreviewMessageComposition />
      <QuotedPreviewFeedbackComposition />
    </div>
  );
}
