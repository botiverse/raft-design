import { X } from "lucide-react";
import {
  ChatThreadPanelAction,
  ChatThreadPanelActions,
  ChatThreadPanelBody,
  ChatThreadPanelFooter,
  ChatThreadPanelHeader,
  ChatThreadPanelRoot,
  ChatThreadPanelTitle,
} from "raft-ui/wip";

export function ChatThreadPanelComposition() {
  return (
    <ChatThreadPanelRoot>
      <ChatThreadPanelHeader>
        <ChatThreadPanelTitle>Thread</ChatThreadPanelTitle>
        <ChatThreadPanelActions>
          <ChatThreadPanelAction aria-label="Close thread">
            <X />
          </ChatThreadPanelAction>
        </ChatThreadPanelActions>
      </ChatThreadPanelHeader>
      <ChatThreadPanelBody>
        <div className="space-y-3 p-3">
          <div className="border-2 border-line-strong bg-layer-panel p-3 text-sm shadow-xs [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle">
            <div className="mb-1 font-mono text-[11px] font-bold text-foreground-muted">Cindy</div>
            <div className="leading-relaxed text-foreground-strong">
              SideThreadColumn owns persisted width and desktop resize chrome.
            </div>
          </div>
          <div className="border-2 border-line-strong bg-primary-400/25 p-3 text-sm shadow-xs [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle">
            <div className="mb-1 font-mono text-[11px] font-bold text-foreground-muted">Atlas</div>
            <div className="leading-relaxed text-foreground-strong">
              ThreadPanel now owns the right-panel header, body, action, and footer chrome.
            </div>
          </div>
        </div>
      </ChatThreadPanelBody>
      <ChatThreadPanelFooter>Reply composer slot</ChatThreadPanelFooter>
    </ChatThreadPanelRoot>
  );
}
