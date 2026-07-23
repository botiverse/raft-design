import { User } from "lucide-react";

export type AvatarContext =
  | "profile-tile"
  | "account-tile"
  | "mention-card"
  | "panel-header"
  | "surface-list"
  | "members-row"
  | "creator-link"
  | "sidebar-list"
  | "compact-list"
  | "preview-mini";

type ContextSpec = {
  size: string;
  border: string;
  agentPixel: number;
  gravatarSize: number;
  gravatarIcon: number;
  placeholderIcon: number;
};

const SPEC: Record<AvatarContext, ContextSpec> = {
  "profile-tile": {
    size: "size-16",
    border: "border-2",
    agentPixel: 60,
    gravatarSize: 60,
    gravatarIcon: 32,
    placeholderIcon: 32,
  },
  "account-tile": {
    size: "size-14",
    border: "border-2",
    agentPixel: 52,
    gravatarSize: 52,
    gravatarIcon: 24,
    placeholderIcon: 24,
  },
  "mention-card": {
    size: "size-12",
    border: "border-2",
    agentPixel: 44,
    gravatarSize: 44,
    gravatarIcon: 24,
    placeholderIcon: 24,
  },
  "panel-header": {
    size: "size-9",
    border: "border-2",
    agentPixel: 32,
    gravatarSize: 32,
    gravatarIcon: 16,
    placeholderIcon: 18,
  },
  "surface-list": {
    size: "size-8",
    border: "border-2",
    agentPixel: 28,
    gravatarSize: 28,
    gravatarIcon: 16,
    placeholderIcon: 16,
  },
  "members-row": {
    size: "size-7",
    border: "border",
    agentPixel: 26,
    gravatarSize: 24,
    gravatarIcon: 14,
    placeholderIcon: 14,
  },
  "creator-link": {
    size: "size-[22px]",
    border: "border",
    agentPixel: 20,
    gravatarSize: 20,
    gravatarIcon: 12,
    placeholderIcon: 12,
  },
  "sidebar-list": {
    size: "size-4.5",
    border: "border",
    agentPixel: 16,
    gravatarSize: 16,
    gravatarIcon: 10,
    placeholderIcon: 10,
  },
  "compact-list": {
    size: "size-5",
    border: "border",
    agentPixel: 18,
    gravatarSize: 18,
    gravatarIcon: 12,
    placeholderIcon: 12,
  },
  "preview-mini": {
    size: "size-3.5",
    border: "border",
    agentPixel: 14,
    gravatarSize: 14,
    gravatarIcon: 10,
    placeholderIcon: 10,
  },
};

export type AvatarSlotProps = {
  context: AvatarContext;
  type: "agent" | "human";
  agentAvatarUrl?: string | null;
  gravatarHash?: string | null;
  humanAvatarUrl?: string | null;
  email?: string | null;
  humanPlaceholder?: boolean;
  className?: string;
};

export default function AvatarSlot({
  context,
  type,
  agentAvatarUrl,
  humanAvatarUrl,
  humanPlaceholder,
  className = "",
}: AvatarSlotProps) {
  const spec = SPEC[context];
  const fallbackBg = type === "agent" ? "bg-brutal-cyan" : "bg-brutal-lavender";
  const baseClass = `flex shrink-0 items-center justify-center overflow-hidden ${spec.size} ${spec.border} border-black ${fallbackBg}`;

  if (type === "agent") {
    return (
      <div className={`${baseClass} ${className}`.trim()}>
        {agentAvatarUrl ? (
          <img src={agentAvatarUrl} alt="Agent avatar" className="h-full w-full object-cover" />
        ) : (
          <User size={spec.placeholderIcon} />
        )}
      </div>
    );
  }

  const humanBase = `${baseClass} text-black`;

  if (humanAvatarUrl && !humanPlaceholder) {
    return (
      <div className={`${humanBase} ${className}`.trim()}>
        <img src={humanAvatarUrl} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${humanBase} ${className}`.trim()}>
      <User size={humanPlaceholder ? spec.placeholderIcon : spec.gravatarIcon} />
    </div>
  );
}
