import { ArrowUpRight } from "lucide-react";
import type { FormEvent } from "react";
import { ComposerActions, ComposerRoot } from "raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "../composer-responsive.tsx";

function preventSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

export function ComposerFooterNoticeComposition() {
  return (
    <div className="flex justify-center">
      <ComposerRoot className="max-w-sm" onSubmit={preventSubmit}>
        <Composer>
          <ComposerInput
            aria-label="Message #proj-uiux"
            placeholder="Message #proj-uiux"
            disabled
          />
          <ComposerToolbar>
            <ComposerActions>
              <p className="inline-flex items-center gap-1 text-xs text-foreground-muted">
                Subscribe to send more messages in this channel.
                <ArrowUpRight aria-hidden className="size-3.5 shrink-0" />
              </p>
            </ComposerActions>
          </ComposerToolbar>
        </Composer>
      </ComposerRoot>
    </div>
  );
}
