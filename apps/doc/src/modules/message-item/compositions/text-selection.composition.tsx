import { useState } from "react";
import { Copy, Quote } from "lucide-react";
import { MessageTextSelectionComposition } from "./selection.compositions.tsx";

export function MessageTextSelectionShowcaseComposition() {
  const [quoted, setQuoted] = useState("");

  return (
    <div className="grid w-full max-w-3xl gap-2">
      <MessageTextSelectionComposition onQuote={setQuoted}>
        <p className="max-w-[65ch] text-sm text-foreground">
          Select this sentence to expose the Quote and Copy menu, without making text selection a
          message-row concern.
        </p>
      </MessageTextSelectionComposition>
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
