"use client";

import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { CodeBlockAction } from "raft-ui";

const SWAP_DURATION = 0.14;
const SWAP_EASE = [0.2, 0.8, 0.2, 1] as const;
const SWAP_VISIBLE = { opacity: 1, scale: 1, filter: "blur(0px)" };
const SWAP_HIDDEN = { opacity: 0, scale: 0.25, filter: "blur(2px)" };

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
 * Same behavior with a motion-driven icon swap: the transitions.dev recipe
 * (blur + small start scale) run faster than its 250ms ease-in-out.
 */
export function AnimatedCodeCopyAction({ code }: CodeCopyActionProps) {
  const { copied, copy } = useClipboard();
  const reduceMotion = useReducedMotion();
  const label = copied ? "Copied code" : "Copy code";
  const transition = reduceMotion ? { duration: 0 } : { duration: SWAP_DURATION, ease: SWAP_EASE };

  return (
    <CodeBlockAction
      data-state={copied ? "copied" : "idle"}
      title={label}
      aria-label={label}
      aria-live="polite"
      onClick={() => void copy(code)}
    >
      <span className="relative inline-grid shrink-0" aria-hidden>
        <motion.span
          className="col-start-1 row-start-1 inline-flex"
          animate={copied ? SWAP_HIDDEN : SWAP_VISIBLE}
          transition={transition}
        >
          <Copy className="size-3" strokeWidth={1.75} />
        </motion.span>
        <motion.span
          className="col-start-1 row-start-1 inline-flex"
          initial={SWAP_HIDDEN}
          animate={copied ? SWAP_VISIBLE : SWAP_HIDDEN}
          transition={transition}
        >
          <Check className="size-3" strokeWidth={1.75} />
        </motion.span>
      </span>
    </CodeBlockAction>
  );
}
