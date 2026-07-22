import { MESSAGE_FIXTURE_IMAGE_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import {
  MessageCodeBlockComposition,
  MessageMarkdownComposition,
} from "./content.compositions.tsx";

export function MessageMarkdownShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <MessageMarkdownComposition imageSrc={MESSAGE_FIXTURE_IMAGE_SRC} />
      <MessageCodeBlockComposition />
    </div>
  );
}
