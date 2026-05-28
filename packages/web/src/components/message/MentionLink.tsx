import { useProfileHoverCard } from "../../hooks/useProfileHoverCard";
import { useAuthStore } from "../../store/authStore";
import { MSG_REF_CHIP } from "./messageRefChip";

interface MentionLinkProps {
  mentionType: "agent" | "user";
  mentionId: string;
  onNavigate: () => void;
  children: React.ReactNode;
}

export default function MentionLink({ mentionType, mentionId, onNavigate, children }: MentionLinkProps) {
  const viewerUserId = useAuthStore((s) => s.user?.id ?? null);
  const isSelfMention = mentionType === "user" && viewerUserId === mentionId;
  const { anchorRef, triggerProps, card, closeImmediate } = useProfileHoverCard<HTMLAnchorElement>({
    mentionType,
    mentionId,
  });

  return (
    <>
      <a
        ref={anchorRef}
        href="#"
        onClick={(e) => {
          e.preventDefault();
          closeImmediate();
          onNavigate();
        }}
        {...triggerProps}
        className={`cursor-default select-text font-bold text-black ${
          isSelfMention
            ? `${MSG_REF_CHIP} bg-brutal-yellow hover:bg-brutal-yellow/80`
            : "underline decoration-black/30 decoration-2 underline-offset-2 hover:text-brutal-pink hover:decoration-brutal-pink"
        }`}
      >
        {children}
      </a>
      {card}
    </>
  );
}
