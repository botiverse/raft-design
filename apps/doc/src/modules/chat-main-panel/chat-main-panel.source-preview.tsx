import {
  Bell,
  Hash,
  ImagePlus,
  ListTodo,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Settings,
  Square,
  User,
  Users,
} from "lucide-react";

export function SourceMainPanelPreview() {
  return (
    <div className="flex h-full min-h-0 w-[560px] min-w-0 shrink-0 flex-1 flex-col overflow-hidden bg-white font-sans text-black">
      <div className="flex h-[62px] shrink-0 items-center gap-3 border-b-2 border-black bg-white px-5 [@media(max-height:600px)]:h-12">
        <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-soft-signal">
          <Hash className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold leading-tight">proj-uiux</div>
          <div className="truncate font-mono text-xs text-black/50">Design system migration</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Search conversation"
          >
            <Search className="size-3.5" />
          </button>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Mute channel activity"
          >
            <Bell className="size-3.5" />
          </button>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Stop all agents in this channel"
          >
            <Square className="size-3.5" />
          </button>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Conversation actions"
          >
            <Settings className="size-3.5" />
          </button>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Channel members"
          >
            <Users className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="shrink-0 border-b-2 border-black bg-white">
        <div className="flex w-max max-w-full items-stretch overflow-x-auto border-r-2 border-black bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            className="relative z-10 inline-flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap bg-soft-signal px-4 py-1.5 text-xs font-semibold outline-none"
          >
            <MessageSquare className="size-3.5" />
            Chat
          </button>
          <button
            type="button"
            className="relative z-10 inline-flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap bg-white px-4 py-1.5 text-xs font-semibold outline-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-black"
          >
            <ListTodo className="size-3.5" />
            Tasks
          </button>
          <button
            type="button"
            className="relative z-10 inline-flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap bg-white px-4 py-1.5 text-xs font-semibold outline-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-black"
          >
            <Paperclip className="size-3.5" />
            Files
          </button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <div className="relative h-full overflow-y-auto bg-white">
          <div className="flex min-h-full flex-col">
            <div className="px-3 pt-3">
              <div className="pb-2 text-center font-mono text-xs text-black/40">
                Beginning of messages
              </div>
            </div>
            <div className="h-px" aria-hidden />
            <div className="flex-1" aria-hidden />
            {[
              [
                "source-cindy",
                "Cindy",
                "10:42",
                "bg-brutal-lavender",
                "Rail and sidebar own navigation. The main panel owns the active conversation chrome.",
              ],
              [
                "source-atlas",
                "Atlas",
                "10:44",
                "bg-brutal-cyan",
                "Message rows, composer behavior, route sync, and realtime data stay app-owned.",
              ],
            ].map(([id, sender, time, avatarClass, message]) => (
              <div key={id} data-message-id={id}>
                <div className="px-3" style={{ contain: "layout style", overflow: "clip visible" }}>
                  <div className="group/message relative mt-1.5 mb-1 flex h-fit min-h-12 gap-3 border-2 border-transparent px-2 py-1 hover:border-black hover:bg-white active:border-black active:bg-white">
                    <div className="relative mt-0.5 shrink-0 self-start">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center overflow-hidden border-2 border-black ${avatarClass} text-black`}
                      >
                        <User className="size-4" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
                        <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">
                          {sender}
                        </span>
                        <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
                          {time}
                        </span>
                      </div>
                      <div className="break-words text-sm text-black">{message}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="h-px" aria-hidden />
            <div className="px-3 pb-3">
              <div className="h-3" />
            </div>
          </div>
        </div>
      </div>
      <form
        className="relative flex shrink-0 items-center border-t-2 border-black bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex w-full flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm">
          <textarea
            aria-label="Message #proj-uiux"
            readOnly
            rows={1}
            placeholder="Message #proj-uiux"
            className="min-h-5 max-h-32 w-full resize-none bg-transparent font-sans text-base leading-5 text-black outline-none placeholder:text-black/35 md:min-h-10 md:text-sm"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-brutal-sm bg-white p-1"
                aria-label="Attach image"
              >
                <ImagePlus className="size-3.5" />
              </button>
              <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Attach file">
                <Paperclip className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex select-none items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-flex size-3.5 shrink-0 items-center justify-center border-2 border-black bg-white"
                />
                <span className="text-xs font-bold text-black/60">As Task</span>
              </label>
              <button
                type="submit"
                className="btn-brutal-sm flex size-7 items-center justify-center bg-brutal-pink p-0"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
