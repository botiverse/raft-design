import { Button, Popover, PopoverContent, PopoverTrigger, type PopoverProps } from "raft-ui";
import { useClipboard } from "foxact/use-clipboard";
import { Check, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
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

  const handleOpenChange = useCallback<NonNullable<PopoverProps["onOpenChange"]>>(
    (nextOpen, eventDetails) => {
      if (eventDetails.reason === "trigger-press") {
        return;
      }
      setOpen(nextOpen);
    },
    [],
  );

  const showPreview = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const hidePreview = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = undefined;
    }, 80);
  }, [clearCloseTimer]);

  const hidePreviewOnBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (event.currentTarget.contains(event.relatedTarget)) {
        return;
      }
      hidePreview();
    },
    [hidePreview],
  );

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  const handleCopy = useCallback(() => {
    void copy(prompt);
  }, [copy, prompt]);

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      modal={false}
      triggerId="installation-copy-prompt-trigger"
    >
      <PopoverTrigger
        id="installation-copy-prompt-trigger"
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-[8.5rem]"
            aria-label="Copy installation prompt"
            onClick={handleCopy}
            onPointerEnter={showPreview}
            onPointerLeave={hidePreview}
            onFocus={showPreview}
            onBlur={hidePreviewOnBlur}
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
        onPointerEnter={showPreview}
        onPointerLeave={hidePreview}
      >
        <pre className="max-h-80 overflow-auto px-3 py-3 font-mono text-xs leading-relaxed text-foreground-strong whitespace-pre-wrap">
          {prompt}
        </pre>
      </PopoverContent>
    </Popover>
  );
}
