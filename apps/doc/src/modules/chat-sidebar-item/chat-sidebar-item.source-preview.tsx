import { AtSign, Hash } from "lucide-react";

export function SourceChatSidebarItemPreview() {
  return (
    <div className="w-72 border-2 border-black bg-brutal-cream p-2 font-sans text-black">
      <SourceSidebarItem selected label="proj-uiux" detail="Cindy replied" />
      <SourceSidebarItem label="general" detail="Unread activity" unread="12" />
      <SourceSidebarItem label="Cindy" detail="Direct message" online unread="4" />
    </div>
  );
}

export function SourceChatSidebarItemSelectedPreview() {
  return (
    <SourceSidebarItemFrame>
      <SourceSidebarItem selected label="proj-uiux" detail="Cindy replied" />
    </SourceSidebarItemFrame>
  );
}

export function SourceChatSidebarItemNotificationPreview() {
  return (
    <SourceSidebarItemFrame>
      <SourceSidebarItem label="design" detail="Mentioned you" mention muted unread="12" />
    </SourceSidebarItemFrame>
  );
}

export function SourceChatSidebarItemDirectMessagePreview() {
  return (
    <SourceSidebarItemFrame>
      <SourceSidebarItem label="Atlas" detail="Working on release notes" online unread="2" />
    </SourceSidebarItemFrame>
  );
}

function SourceSidebarItemFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-72 border-2 border-black bg-brutal-cream p-2 font-sans text-black">
      {children}
    </div>
  );
}

function SourceSidebarItem({
  detail,
  label,
  mention = false,
  muted = false,
  online = false,
  selected = false,
  unread,
}: {
  detail: string;
  label: string;
  mention?: boolean;
  muted?: boolean;
  online?: boolean;
  selected?: boolean;
  unread?: string;
}) {
  return (
    <div
      className={`flex min-h-12 items-center gap-2 px-2 py-1.5 ${
        selected ? "border-2 border-black bg-white shadow-[var(--source-shadow-sm)]" : ""
      }`}
    >
      <Hash className="size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{label}</span>
        <span className="block truncate text-xs text-black/50">{detail}</span>
      </span>
      {online ? (
        <span className="size-2.5 shrink-0 rounded-full border border-black bg-brutal-lime" />
      ) : null}
      {unread ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold text-white">
          {mention ? <AtSign className="size-2.5" aria-hidden /> : null}
          {unread}
        </span>
      ) : null}
      {muted ? <span className="text-xs text-black/60">⌁</span> : null}
    </div>
  );
}
