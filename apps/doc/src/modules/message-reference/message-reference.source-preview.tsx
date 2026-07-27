import { AtSign, Hash, MessageSquareText } from "lucide-react";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReferenceSourcePreview() {
  return (
    <article className="flex w-full max-w-xl gap-3 bg-white p-4 font-sans text-black">
      <img
        src={MESSAGE_FIXTURE_AVATAR_SRC}
        alt=""
        className="size-9 shrink-0 border-2 border-black object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-bold">Atlas</span>
          <span className="font-mono text-xs text-black/50">owner</span>
          <span className="font-mono text-xs text-black/50">2:20 PM</span>
        </div>
        <p className="mt-1 text-sm leading-6">
          Ask{" "}
          <button
            type="button"
            disabled
            className="font-bold text-brutal-pink underline disabled:cursor-default"
          >
            <AtSign className="size-3" aria-hidden /> Atlas
          </button>{" "}
          to check the{" "}
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 border border-black bg-brutal-lime px-1 py-0.5 font-mono text-xs font-bold disabled:cursor-default"
          >
            <MessageSquareText className="size-3" aria-hidden /> all
          </button>{" "}
          rollout in{" "}
          <button
            type="button"
            disabled
            className="border border-black bg-brutal-cyan px-1 py-0.5 font-mono text-xs font-bold disabled:cursor-default"
          >
            <Hash className="size-3" aria-hidden /> release-notes
          </button>
          .
        </p>
      </div>
    </article>
  );
}
