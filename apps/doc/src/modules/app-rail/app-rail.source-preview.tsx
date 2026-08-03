import {
  Activity,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

export function SourceAppRailPreview() {
  return (
    <div className="relative flex h-full w-[64px] shrink-0 select-none flex-col items-center border-r-2 border-[var(--source-ink)] bg-primary text-[var(--source-ink)] [@media(max-height:600px)]:w-[50px]">
      <div className="relative flex h-[62px] w-full items-center justify-center border-b-2 border-[var(--source-ink)]">
        <button
          type="button"
          className="relative inline-flex size-10 items-center justify-center rounded-none border-2 border-[var(--source-ink)] bg-[var(--source-ink)] text-base font-bold text-primary shadow-[var(--source-shadow-sm)] transition-shadow duration-100 hover:shadow-[var(--source-shadow-md)] [@media(max-height:600px)]:h-9 [@media(max-height:600px)]:w-9"
          aria-label="Switch server"
        >
          R
          <span className="absolute -top-1 -right-1 size-2.5 rounded-full border border-[var(--source-ink)] bg-brutal-pink" />
        </button>
      </div>
      <div className="flex w-full flex-1 flex-col items-center gap-1.5 py-2">
        <SourceRailButton icon={<Search size={18} />} />
        <SourceRailButton active icon={<MessageSquare size={18} />} />
        <SourceRailButton icon={<Activity size={18} />} dot />
        <SourceRailButton icon={<CheckSquare size={18} />} />
        <SourceRailButton icon={<Users size={18} />} />
        <SourceRailButton icon={<Monitor size={18} />} dot />
      </div>
      <div className="flex w-full items-center justify-center pb-1">
        <SourceNotificationButton />
      </div>
      <div className="flex h-[62px] w-full shrink-0 items-center justify-center">
        <SourceRailButton icon={<Settings size={18} />} />
      </div>
    </div>
  );
}

function SourceNotificationButton() {
  return (
    <button
      type="button"
      className="relative inline-flex size-9 items-center justify-center rounded-none border-2 border-[var(--source-ink)] bg-brutal-orange shadow-[var(--source-shadow-sm)] transition-shadow duration-100 hover:shadow-[var(--source-shadow-md)]"
      aria-label="Notification center"
    >
      <AlertTriangle className="size-[18px] text-[var(--source-ink)]" />
      <span className="absolute -top-1 -right-1 size-2.5 rounded-full border border-[var(--source-ink)] bg-brutal-orange" />
    </button>
  );
}

function SourceRailButton({
  icon,
  active,
  dot,
  badge,
}: {
  icon: ReactNode;
  active?: boolean;
  dot?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      className={`relative inline-flex size-10 items-center justify-center rounded-none border-2 transition-colors ${
        active
          ? "border-[var(--source-ink)] bg-white shadow-[var(--source-shadow-sm)]"
          : "border-transparent hover:border-[var(--source-ink)] hover:bg-white"
      } [@media(max-height:600px)]:h-9 [@media(max-height:600px)]:w-9`}
      aria-label="Source rail action"
    >
      {icon}
      {badge ? (
        <span className="absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center border-2 border-[var(--source-ink)] bg-brutal-pink px-1 text-[10px] leading-4 font-bold text-[var(--source-ink)]">
          {badge}
        </span>
      ) : null}
      {dot ? (
        <span className="absolute -top-1 -right-1 size-2.5 rounded-full border border-[var(--source-ink)] bg-brutal-pink" />
      ) : null}
    </button>
  );
}
