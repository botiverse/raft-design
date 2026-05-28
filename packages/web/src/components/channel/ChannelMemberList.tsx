import type { ReactNode } from "react";
import type { AgentActivity } from "@slock-ai/shared";
import { X } from "lucide-react";
import AvatarSlot from "../ui/AvatarSlot";
import SectionEyebrow from "../ui/SectionEyebrow";
import AgentActivityDot from "../agent/AgentActivityDot";

export function ChannelMemberListShell({
  children,
  className = "",
  "data-testid": dataTestId,
}: {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div
      className={`max-h-72 overflow-y-auto border-2 border-black bg-white shadow-brutal-sm ${className}`}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

export function ChannelMemberSectionHeader({ children }: { children: ReactNode }) {
  return (
    <SectionEyebrow as="div" className="bg-white/50 px-3 py-1.5">
      {children}
    </SectionEyebrow>
  );
}

export function ChannelMemberRow({
  type,
  name,
  secondary,
  agentId,
  agentAvatarUrl,
  agentFallbackActivity,
  humanAvatarUrl,
  gravatarHash,
  onAvatarClick,
  trailing,
}: {
  type: "agent" | "human";
  name: ReactNode;
  secondary?: ReactNode;
  agentId?: string;
  agentAvatarUrl?: string | null;
  agentFallbackActivity?: AgentActivity;
  humanAvatarUrl?: string | null;
  gravatarHash?: string | null;
  onAvatarClick?: () => void;
  trailing?: ReactNode;
}) {
  const avatar = (
    <>
      <AvatarSlot
        context="members-row"
        type={type}
        agentAvatarUrl={agentAvatarUrl}
        humanAvatarUrl={humanAvatarUrl}
        gravatarHash={gravatarHash}
        className={onAvatarClick ? "transition-colors hover:brightness-90" : undefined}
      />
      {type === "agent" && agentId ? (
        <AgentActivityDot
          agentId={agentId}
          fallbackActivity={agentFallbackActivity}
          className="absolute -bottom-0.5 -right-0.5 size-2.5"
        />
      ) : null}
    </>
  );

  return (
    <div className="group flex items-start gap-2 px-3 py-2 transition-colors [@media(max-height:600px)]:py-1 hover:bg-brutal-yellow/30">
      {onAvatarClick ? (
        <button
          type="button"
          onClick={onAvatarClick}
          className="relative mt-1 shrink-0"
        >
          {avatar}
        </button>
      ) : (
        <span className="relative mt-1 shrink-0">{avatar}</span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-black">
          {name}
        </div>
        {secondary ? (
          <div className="truncate text-xs text-black/50">
            {secondary}
          </div>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}

export function ChannelMemberRemoveButton({
  label,
  onClick,
  revealOnRowHover = true,
}: {
  label: string;
  onClick: () => void;
  revealOnRowHover?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${revealOnRowHover ? "flex md:hidden md:group-hover:flex" : "flex"} mt-1 size-6 shrink-0 items-center justify-center border border-black bg-brutal-red/20 text-black transition-colors hover:bg-brutal-red/60`}
      title={label}
      aria-label={label}
    >
      <X size={12} />
    </button>
  );
}
