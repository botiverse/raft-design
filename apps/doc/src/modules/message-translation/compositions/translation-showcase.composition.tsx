import { MessageTranslationBilingualComposition } from "./bilingual.composition.tsx";
import { MessageTranslationStatesComposition } from "./translation-states.composition.tsx";
import { MessageTranslationTranslatedComposition } from "./translated.composition.tsx";

export function MessageTranslationShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageTranslationTranslatedComposition />
      <MessageTranslationBilingualComposition />
      <MessageTranslationStatesComposition />
    </div>
  );
}
