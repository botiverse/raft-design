import { Languages } from "lucide-react";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageTranslationSourcePreview() {
  return (
    <div className="group/message relative flex h-fit min-h-12 w-full max-w-3xl gap-3 border-2 border-transparent bg-white px-2 py-1 text-black">
      <div className="relative mt-0.5 shrink-0 self-start">
        <img
          src={MESSAGE_FIXTURE_AVATAR_SRC}
          alt=""
          className="size-9 border-2 border-black object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden">
          <span className="min-w-0 shrink-0 truncate text-sm font-bold">Atlas</span>
          <span className="min-w-0 truncate font-mono text-xs text-black/40">owner</span>
          <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
            2:14 PM
          </span>
        </div>
        <div className="break-words text-sm text-black">让团队保留这条原始消息。</div>
        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-black/45">
          <Languages size={12} />
          <button
            type="button"
            disabled
            className="font-bold underline decoration-black/40 underline-offset-2 disabled:cursor-default"
          >
            Show original
          </button>
        </div>
      </div>
    </div>
  );
}
