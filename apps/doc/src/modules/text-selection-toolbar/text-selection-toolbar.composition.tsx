import {
  AddCommentIcon,
  Text,
  TextSelectionToolbar,
  TextSelectionToolbarButton,
  TextSelectionToolbarSeparator,
} from "@botiverse/raft-ui";
import { Copy, Quote } from "lucide-react";
import { useCallback, useState } from "react";

export function TextSelectionToolbarContent() {
  const [last, setLast] = useState("");
  const quote = useCallback(() => setLast("Quoted"), []);
  const copy = useCallback(() => setLast("Copied"), []);
  const comment = useCallback(() => setLast("Comment started"), []);

  return (
    <div className="flex flex-col items-start gap-3">
      <TextSelectionToolbar aria-label="Selected text">
        <TextSelectionToolbarButton onClick={quote}>
          <Quote />
          Quote
        </TextSelectionToolbarButton>
        <TextSelectionToolbarButton onClick={copy}>
          <Copy />
          Copy
        </TextSelectionToolbarButton>
        <TextSelectionToolbarSeparator />
        <TextSelectionToolbarButton onClick={comment}>
          <AddCommentIcon />
          Comment
        </TextSelectionToolbarButton>
      </TextSelectionToolbar>
      <Text.Sans color="muted" size="small" role="status">
        {last}
      </Text.Sans>
    </div>
  );
}

export function TextSelectionToolbarComposition() {
  return (
    <div className="flex size-full items-center justify-center px-3 py-4">
      <TextSelectionToolbarContent />
    </div>
  );
}
