import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  FilesPanel,
  FilesViewport,
} from "@botiverse/raft-ui";
import { Paperclip } from "lucide-react";

// @docs-source-strip-start
import type { ReactNode } from "react";
// @docs-source-strip-end

export function FilesPanelLoadingContent() {
  return (
    <FilesPanel aria-label="Files panel">
      <FilesViewport>
        <EmptyState className="h-full">
          <EmptyStateContent>
            <EmptyStateTitle>Loading files…</EmptyStateTitle>
          </EmptyStateContent>
        </EmptyState>
      </FilesViewport>
    </FilesPanel>
  );
}

export function FilesPanelErrorContent() {
  return (
    <FilesPanel aria-label="Files panel">
      <FilesViewport>
        <EmptyState className="h-full" role="alert">
          <EmptyStateContent>
            <EmptyStateTitle>Could not load files.</EmptyStateTitle>
          </EmptyStateContent>
        </EmptyState>
      </FilesViewport>
    </FilesPanel>
  );
}

export function FilesPanelEmptyContent() {
  return (
    <FilesPanel aria-label="Files panel">
      <FilesViewport>
        <EmptyState className="h-full">
          <EmptyStateIcon>
            <Paperclip aria-hidden />
          </EmptyStateIcon>
          <EmptyStateContent>
            <EmptyStateTitle>No files yet</EmptyStateTitle>
            <EmptyStateDescription>
              Attach files in Chat, or drag files into the message composer. They will appear here
              after the message is sent.
            </EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </FilesViewport>
    </FilesPanel>
  );
}

// @docs-source-strip-start
export function FilesPanelStatesComposition() {
  return (
    <div className="grid w-full gap-4 lg:grid-cols-3">
      <FilesPanelState label="Loading">
        <FilesPanelLoadingContent />
      </FilesPanelState>
      <FilesPanelState label="Error">
        <FilesPanelErrorContent />
      </FilesPanelState>
      <FilesPanelState label="Empty">
        <FilesPanelEmptyContent />
      </FilesPanelState>
    </div>
  );
}

function FilesPanelState({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section className="flex min-h-80 flex-col overflow-hidden border border-line-hairline">
      <h3 className="border-b border-line-hairline bg-fill-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </h3>
      {children}
    </section>
  );
}
// @docs-source-strip-end
