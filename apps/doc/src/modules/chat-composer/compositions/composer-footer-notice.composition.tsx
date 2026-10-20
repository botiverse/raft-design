import { ArrowUpRight } from "lucide-react";
import type { FormEvent } from "react";
import { ComposerActions, ComposerRoot } from "@botiverse/raft-ui";
import { Composer, ComposerInput, ComposerToolbar } from "@botiverse/raft-ui";

function preventSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

export function ComposerFooterNoticeComposition() {
  return (
    <div className="flex justify-center">
      <ComposerRoot className="max-w-sm" onSubmit={preventSubmit}>
        <Composer>
          <ComposerInput aria-label="Message #design" placeholder="Message #design" disabled />
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
