import { useState } from "react";
import { Copy, Quote, TextQuote } from "lucide-react";
import {
  MessageTextSelection,
  MessageTextSelectionMenu,
  MessageTextSelectionMenuItem,
  MessageTextSelectionMenuSeparator,
  useMessageTextSelection,
} from "raft-ui/wip";

function MessageTextSelectionActions({ onQuote }: { onQuote: (text: string) => void }) {
  const selection = useMessageTextSelection();

  return (
    <MessageTextSelectionMenu>
      <MessageTextSelectionMenuItem onClick={() => onQuote(selection?.text ?? "")}>
        <TextQuote size={13} />
        Quote
      </MessageTextSelectionMenuItem>
      <MessageTextSelectionMenuSeparator />
      <MessageTextSelectionMenuItem
        onClick={() => {
          if (selection?.text) void navigator.clipboard.writeText(selection.text);
        }}
      >
        <Copy size={13} />
        Copy
      </MessageTextSelectionMenuItem>
    </MessageTextSelectionMenu>
  );
}

export function MessageTextSelectionShowcaseComposition() {
  const [quoted, setQuoted] = useState("");

  return (
    <div className="grid w-full max-w-3xl gap-2">
      <MessageTextSelection>
        <p className="max-w-[65ch] text-sm text-foreground">
          Select this sentence to expose the Quote and Copy menu, without making text selection a
          message-row concern.
        </p>
        <MessageTextSelectionActions onQuote={setQuoted} />
      </MessageTextSelection>
      {quoted ? (
        <p className="inline-flex items-center gap-1 text-xs text-foreground-muted" role="status">
          <Quote size={12} /> Quoted selection: {quoted}
        </p>
      ) : (
        <p className="inline-flex items-center gap-1 text-xs text-foreground-muted">
          <Copy size={12} /> Select text to inspect the contextual actions.
        </p>
      )}
    </div>
  );
}
