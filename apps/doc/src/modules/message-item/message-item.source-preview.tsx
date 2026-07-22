import { MessageSquare } from "lucide-react";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "./message-item.fixtures.ts";

export function SourceMessageItemPreview() {
  return (
    <div className="group/message relative mb-1 flex h-fit min-h-12 w-full max-w-3xl gap-3 border-2 border-transparent px-2 py-1 text-black hover:border-black hover:bg-white">
      <div className="relative mt-0.5 shrink-0 self-start">
        <img
          src={MESSAGE_FIXTURE_AVATAR_SRC}
          alt=""
          className="size-9 border-2 border-black object-cover"
        />
        <span
          title="Online"
          className="absolute -right-0.5 -bottom-0.5 size-[11px] rounded-full border border-black bg-brutal-lime"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
          <span className="min-w-0 shrink-0 truncate text-sm font-bold">Atlas</span>
          <span className="min-w-0 truncate font-mono text-xs text-black/40">owner</span>
          <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
            2:14 PM
          </span>
        </div>
        <div className="select-text break-words text-sm text-black">
          The message row keeps sender metadata, body content, and thread activity in one timeline
          context.
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled
            className="inline-flex h-5 items-center gap-1 border border-black bg-white px-1.5 text-[10px] font-bold leading-none disabled:cursor-default"
          >
            <MessageSquare className="size-3 shrink-0" aria-hidden />2 replies
          </button>
          <button
            type="button"
            disabled
            aria-pressed="true"
            className="inline-flex h-5 items-center gap-1 rounded bg-brutal-pink/20 px-1.5 text-xs font-bold leading-none disabled:cursor-default"
          >
            <span aria-hidden>👍</span>
            <span>3</span>
          </button>
        </div>
      </div>
    </div>
  );
}
