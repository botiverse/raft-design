import { Button, Popover, PopoverContent, PopoverTrigger } from "raft-ui";
import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextMorph } from "torph/react";

type InstallationCopyPromptProps = {
  prompt: string;
};

export function InstallationCopyPrompt({ prompt }: InstallationCopyPromptProps) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | undefined>(undefined);
  const { copied, copy } = useClipboard();

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== undefined) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = undefined;
    }
  }, []);

  const showPreview = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const hidePreview = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = undefined;
    }, 120);
  }, [clearCloseTimer]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  const handleCopy = useCallback(() => {
    void copy(prompt);
    setOpen(true);
  }, [copy, prompt]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Copy installation prompt"
            onClick={handleCopy}
            onMouseEnter={showPreview}
            onMouseLeave={hidePreview}
            onFocus={showPreview}
            onBlur={hidePreview}
          />
        }
      >
        {copied ? (
          <Check className="size-3.5" data-icon="inline-start" aria-hidden />
        ) : (
          <Copy className="size-3.5" data-icon="inline-start" aria-hidden />
        )}
        <TextMorph duration={200} ease="cubic-bezier(0.19, 1, 0.22, 1)">
          {copied ? "Copied" : "Copy prompt"}
        </TextMorph>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(28rem,calc(100vw-2rem))] p-0"
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
      >
        <div className="border-b border-line-muted px-3 py-2 text-xs font-medium text-foreground-muted">
          Prompt preview
        </div>
        <pre className="max-h-80 overflow-auto px-3 py-3 font-mono text-xs leading-relaxed text-foreground-strong whitespace-pre-wrap">
          {prompt}
        </pre>
      </PopoverContent>
    </Popover>
  );
}
