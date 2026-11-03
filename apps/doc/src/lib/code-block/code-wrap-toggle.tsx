"use client";

import { TextWrap } from "lucide-react";
import { CodeBlockWrapToggle } from "@botiverse/raft-ui/wip";

import { useMessages } from "#/lib/i18n/use-locale.ts";

/**
 * The wrap toggle of a message's code block, before its Copy: pressed, the
 * block scrolls its long lines sideways. raft-ui owns the toggle and the
 * block's wrap state; the words and the icon are the caller's.
 */
export function CodeWrapToggle() {
  const messages = useMessages();

  return (
    <CodeBlockWrapToggle title={messages.dontWrapLines} aria-label={messages.dontWrapLines}>
      <TextWrap className="size-3.5" aria-hidden />
    </CodeBlockWrapToggle>
  );
}
