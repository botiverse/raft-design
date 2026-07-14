import { X } from "lucide-react";
import {
  AppPanelStackContent,
  AppPanelStackItem,
  AppPanelStackRoot,
  AppShellPanelStack,
} from "raft-ui/wip";
import type { ReactNode } from "react";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ChatThreadPanelComposition } from "#/modules/chat-thread-panel/chat-thread-panel.composition.tsx";

export function AppPanelStackPreview() {
  return (
    <PreviewGrid>
      <PreviewPane label="Source">
        <SourceThemeScope className="h-full">
          <SourcePanelStackPreview />
        </SourceThemeScope>
      </PreviewPane>
      <PreviewPane label="Brutal">
        <PreviewThemeScope family="brutal" className="h-full">
          <PanelStackPreview />
        </PreviewThemeScope>
      </PreviewPane>
      <PreviewPane label="Elegant">
        <PreviewThemeScope family="elegant" mode="light" className="h-full">
          <PanelStackPreview />
        </PreviewThemeScope>
      </PreviewPane>
      <PreviewPane label="Elegant dark">
        <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
          <PanelStackPreview />
        </PreviewThemeScope>
      </PreviewPane>
    </PreviewGrid>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}

function PanelStackPreview() {
  return (
    <div className="flex h-full min-w-[920px] overflow-hidden border border-line-strong bg-layer-panel shadow-sm [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-cream [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle">
      <CurrentMainContext />
      <AppShellPanelStack className="flex h-full w-[400px] lg:flex">
        <AppPanelStackRoot>
          <AppPanelStackItem>
            <AppPanelStackContent>
              <ChatThreadPanelComposition />
            </AppPanelStackContent>
          </AppPanelStackItem>
        </AppPanelStackRoot>
      </AppShellPanelStack>
    </div>
  );
}

function SourcePanelStackPreview() {
  return (
    <div className="flex h-full min-w-[920px] overflow-hidden border-2 border-black bg-brutal-cream font-sans text-black">
      <SourceMainContext />
      <div className="relative flex h-full w-[400px] shrink-0 flex-col border-l-2 border-black bg-white text-black">
        <div className="absolute bottom-0 left-0 top-0 z-10 hidden w-2 -translate-x-1 cursor-col-resize select-none md:block" />
        <SourceThreadPanelSurface />
      </div>
    </div>
  );
}

function SourceThreadPanelSurface() {
  return (
    <>
      <div className="flex h-[62px] shrink-0 items-center gap-2 border-b-2 border-black bg-white px-3">
        <div className="min-w-0 flex-1 truncate text-sm font-bold">Thread</div>
        <button
          type="button"
          className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
          aria-label="Close thread"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-3 p-3">
          <div className="border-2 border-black bg-white p-3 text-sm shadow-brutal-sm">
            <div className="mb-1 font-mono text-[11px] font-bold text-black/50">Cindy</div>
            <div>SideThreadColumn owns persisted width and desktop resize chrome.</div>
          </div>
          <div className="border-2 border-black bg-brutal-yellow/30 p-3 text-sm shadow-brutal-sm">
            <div className="mb-1 font-mono text-[11px] font-bold text-black/50">Atlas</div>
            <div>ThreadPanel renders as a separate child surface inside the host wrapper.</div>
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t-2 border-black p-3 text-xs text-black/50">
        Reply composer slot
      </div>
    </>
  );
}

function CurrentMainContext() {
  return (
    <div className="min-w-0 flex-1 bg-layer-panel p-4 [[data-theme=brutal]_&]:bg-white">
      <div className="mb-4 h-8 w-48 border-b-2 border-line-strong text-lg font-bold text-foreground-strong [[data-theme=elegant]_&]:border-line-subtle">
        #proj-uiux
      </div>
      <div className="space-y-3">
        <div className="h-14 border-2 border-line-strong bg-layer-panel shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=brutal]_&]:bg-white" />
        <div className="h-20 border-2 border-line-strong bg-layer-panel shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=brutal]_&]:bg-white" />
        <div className="h-10 border-2 border-line-strong bg-layer-muted [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle" />
      </div>
    </div>
  );
}

function SourceMainContext() {
  return (
    <div className="min-w-0 flex-1 bg-white p-4">
      <div className="mb-4 h-8 w-48 border-b-2 border-black text-lg font-bold">#proj-uiux</div>
      <div className="space-y-3">
        <div className="h-14 border-2 border-black bg-white shadow-brutal-sm" />
        <div className="h-20 border-2 border-black bg-white shadow-brutal-sm" />
        <div className="h-10 border-2 border-black bg-brutal-cream" />
      </div>
    </div>
  );
}
