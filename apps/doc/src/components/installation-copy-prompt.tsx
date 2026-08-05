"use client";

import { Button } from "raft-ui";
import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { useCallback, useId } from "react";
import { TextMorph } from "torph/react";

type InstallationCopyPromptProps = {
  prompt: string;
};

export function InstallationCopyPrompt({ prompt }: InstallationCopyPromptProps) {
  const { copied, copy } = useClipboard();
  const promptLabelId = useId();

  const handleCopy = useCallback(() => {
    void copy(prompt);
  }, [copy, prompt]);

  return (
    <div className="overflow-clip border border-line bg-layer-card">
      <div className="flex items-center justify-between gap-4 border-b border-line-muted px-3 py-1.5">
        <span id={promptLabelId} className="font-mono text-xs text-foreground-muted">
          Prompt
        </span>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          aria-live="polite"
          className="pr-0 text-foreground-muted hover:bg-transparent hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5" data-icon="inline-start" aria-hidden />
          ) : (
            <Copy className="size-3.5" data-icon="inline-start" aria-hidden />
          )}
          <TextMorph duration={200} ease="cubic-bezier(0.19, 1, 0.22, 1)">
            {copied ? "Copied" : "Copy prompt"}
          </TextMorph>
        </Button>
      </div>
      <div
        role="region"
        aria-labelledby={promptLabelId}
        tabIndex={0}
        className="max-h-[32rem] overflow-auto px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
      >
        <pre className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {prompt}
        </pre>
      </div>
    </div>
  );
}
