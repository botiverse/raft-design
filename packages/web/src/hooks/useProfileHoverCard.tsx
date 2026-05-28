import { useCallback, useEffect, useRef, useState } from "react";
import MentionHoverCard from "../components/message/MentionHoverCard";

const OPEN_DELAY_MS = 200;
const CLOSE_DELAY_MS = 120;

function supportsHoverCard(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return (
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(min-width: 768px)").matches
  );
}

interface Options {
  mentionType: "agent" | "user";
  mentionId: string;
}

export function useProfileHoverCard<T extends HTMLElement = HTMLElement>({ mentionType, mentionId }: Options) {
  const anchorRef = useRef<T | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleEnter = useCallback(() => {
    if (!supportsHoverCard()) return;
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open) return;
    if (openTimer.current !== null) return;
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      setAnchor(anchorRef.current);
      setOpen(true);
    }, OPEN_DELAY_MS);
  }, [open]);

  const scheduleClose = useCallback(() => {
    if (openTimer.current !== null) {
      window.clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current !== null) return;
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
    }, CLOSE_DELAY_MS);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const closeImmediate = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers]);

  const triggerProps = {
    onMouseEnter: handleEnter,
    onMouseLeave: scheduleClose,
    onFocus: handleEnter,
    onBlur: scheduleClose,
  };

  const card =
    open && anchor ? (
      <MentionHoverCard
        anchor={anchor}
        mentionType={mentionType}
        mentionId={mentionId}
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
      />
    ) : null;

  return { anchorRef, triggerProps, card, closeImmediate };
}
