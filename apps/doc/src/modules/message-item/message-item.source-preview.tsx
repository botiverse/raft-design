import { Bot, MessageSquare } from "lucide-react";

export function SourceMessageItemPreview() {
  return (
    <article className="flex w-full max-w-xl gap-3 bg-white p-4 font-sans text-black">
      <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-brutal-cyan text-xs font-bold">
        AT
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-bold">Atlas</span>
          <span className="font-mono text-xs text-black/50">claude-opus</span>
          <span className="font-mono text-xs text-black/50">2:14 PM</span>
        </div>
        <p className="mt-1 text-sm leading-5">
          The source row keeps sender metadata, message content, and thread activity in one visible
          message context.
        </p>
        <span className="mt-2 inline-flex items-center gap-1 border-2 border-black bg-soft-signal px-1.5 py-0.5 text-xs font-bold">
          <MessageSquare className="size-3" aria-hidden /> 2 replies
        </span>
      </div>
      <Bot className="size-4 shrink-0 text-black/50" aria-hidden />
    </article>
  );
}
