"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { type ReactNode } from "react";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageCodeBlock } from "./message-code-block.recipe";

export type MessageCodeBlockProps = Omit<useRender.ComponentProps<"div">, "children"> & {
  children: ReactNode;
  code: string;
};

export function MessageCodeBlock({
  children,
  className,
  code,
  render,
  ...props
}: MessageCodeBlockProps) {
  const theme = useThemeFamily();
  const { copyButton, iconSwap, root } = messageCodeBlock({ theme });
  const { copied, copy } = useClipboard({ timeout: 1400 });
  const copyState = copied ? "copied" : "idle";
  const copyLabel = copied ? "Copied code" : "Copy code";

  const defaultProps: SlotElementProps<"div"> = {
    "data-state": copyState,
    className: root({ className }),
    children: (
      <>
        <button
          type="button"
          data-slot="message-code-block-copy"
          data-state={copyState}
          className={copyButton()}
          title={copyLabel}
          aria-label={copyLabel}
          aria-live="polite"
          onClick={() => void copy(code)}
        >
          <span
            data-slot="message-code-block-icon-swap"
            data-state={copyState}
            className={iconSwap()}
            aria-hidden
          >
            <Copy data-slot="message-code-block-icon" data-icon="copy" className="size-3.5" />
            <Check data-slot="message-code-block-icon" data-icon="check" className="size-3.5" />
          </span>
        </button>
        {children}
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-code-block",
    },
  });
}
