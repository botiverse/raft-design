"use client";

import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { CodeBlockAction } from "raft-ui/wip";
import { IconSwap } from "#/components/icon-swap.tsx";

export type CodeCopyActionProps = {
  code: string;
};

/** Copy behavior for CodeBlock headers. raft-ui only owns the action shell. */
export function CodeCopyAction({ code }: CodeCopyActionProps) {
  const { copied, copy } = useClipboard({ timeout: 1400 });
  const label = copied ? "Copied code" : "Copy code";
  const Icon = copied ? Check : Copy;

  return (
    <CodeBlockAction
      data-state={copied ? "copied" : "idle"}
      title={label}
      aria-label={label}
      aria-live="polite"
      onClick={() => void copy(code)}
    >
      <Icon className="size-3.5" aria-hidden />
    </CodeBlockAction>
  );
}

/**
 * Same behavior with the docs icon-swap morph (opacity + blur + scale), shortened
 * from the docs default 170ms so the check lands right under the pointer.
 */
export function AnimatedCodeCopyAction({ code }: CodeCopyActionProps) {
  const { copied, copy } = useClipboard();
  const label = copied ? "Copied code" : "Copy code";

  return (
    <CodeBlockAction
      className="[--icon-swap-dur:110ms]"
      title={label}
      aria-label={label}
      aria-live="polite"
      onClick={() => void copy(code)}
    >
      <IconSwap
        state={copied ? "b" : "a"}
        iconA={<Copy className="size-3" strokeWidth={1.75} />}
        iconB={<Check className="size-3" strokeWidth={1.75} />}
        className="shrink-0"
        aria-hidden
      />
    </CodeBlockAction>
  );
}
