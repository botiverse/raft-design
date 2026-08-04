import { useMediaQuery } from "foxact/use-media-query";
import { ResizableGroup, ResizableHandle, ResizablePanel } from "raft-ui";

import { getPreviewPart } from "./get-preview-part.ts";
import { PreviewCanvas } from "./preview-canvas.tsx";
import { PreviewCode } from "./preview-code.tsx";
import { PreviewControls } from "./preview-controls.tsx";
import { PreviewThemeScope } from "./preview-theme.tsx";
import type { PreviewProps } from "./preview.types.ts";

/** Matches the previous fixed `20rem` controls column. */
const PREVIEW_CONTROLS_DEFAULT_SIZE = 320;
const PREVIEW_CONTROLS_MIN_SIZE = 240;
const PREVIEW_CONTROLS_MAX_SIZE = 480;
const PREVIEW_CANVAS_MIN_SIZE = 280;

const frameClass =
  "min-w-0 overflow-clip rounded-lg bg-white shadow-[0_1px_1px_-0.5px_oklch(0_0_0_/_0.03),0_2px_5px_-2px_oklch(0_0_0_/_0.04),0_8px_18px_-10px_oklch(0_0_0_/_0.06),0_0_0_0.5px_oklch(0_0_0_/_0.20)] dark:bg-layer-panel dark:shadow-[0_0_0_1px_oklch(1_0_0_/_0.08),0_12px_28px_-10px_oklch(0_0_0_/_0.5),0_2px_6px_-2px_oklch(0_0_0_/_0.3)]";

/** Compound docs preview: canvas, optional controls, and code via composition parts. */
export function PreviewRoot({
  children,
  previewClassName = "",
  previewInset = "default",
  previewTheme,
  previewMode,
}: PreviewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const canvas = getPreviewPart(children, PreviewCanvas);
  const controls = getPreviewPart(children, PreviewControls);
  const code = getPreviewPart(children, PreviewCode);
  const previewInsetClass =
    previewInset === "flush" ? "items-stretch gap-0 p-0" : "items-center gap-4 px-6 py-4";
  const hasControls = controls != null;
  const canvasNode = (
    <PreviewThemeScope
      family={previewTheme}
      mode={previewMode}
      className="h-full bg-layer-panel text-foreground-strong dark:bg-transparent"
    >
      <div
        className={`flex min-h-84 w-full flex-wrap justify-center ${previewInsetClass} ${previewClassName}`}
      >
        {canvas?.props.children ?? null}
      </div>
    </PreviewThemeScope>
  );

  const controlsNode = hasControls ? (
    <div
      className={
        isDesktop
          ? "h-full bg-[oklch(0.988_0.002_106.42)] px-8 pt-6 pb-8 dark:bg-layer-card"
          : "border-t border-[oklch(0_0_0_/_0.10)] bg-[oklch(0.988_0.002_106.42)] px-8 pt-6 pb-8 dark:border-ink-10 dark:bg-layer-card"
      }
    >
      {controls}
    </div>
  ) : null;

  return (
    <div data-component-demo-frame className="relative min-w-0">
      <div className={frameClass}>
        {hasControls ? (
          isDesktop ? (
            <ResizableGroup orientation="horizontal" className="h-auto min-w-0">
              <ResizablePanel
                id="preview-canvas"
                minSize={PREVIEW_CANVAS_MIN_SIZE}
                className="min-w-0"
              >
                {canvasNode}
              </ResizablePanel>
              <ResizableHandle className="ml-0 mr-0 w-0 border-l border-[oklch(0_0_0_/_0.10)] bg-transparent before:opacity-0 hover:bg-transparent focus-visible:before:opacity-100 focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-ink-10" />
              <ResizablePanel
                id="preview-controls"
                defaultSize={PREVIEW_CONTROLS_DEFAULT_SIZE}
                minSize={PREVIEW_CONTROLS_MIN_SIZE}
                maxSize={PREVIEW_CONTROLS_MAX_SIZE}
                groupResizeBehavior="preserve-pixel-size"
                className="min-w-0"
              >
                {controlsNode}
              </ResizablePanel>
            </ResizableGroup>
          ) : (
            <div>
              {canvasNode}
              {controlsNode}
            </div>
          )
        ) : (
          canvasNode
        )}
        {code ? (
          <div className="border-t border-[oklch(0_0_0_/_0.10)] bg-white dark:border-transparent dark:bg-transparent">
            {code}
          </div>
        ) : null}
      </div>
    </div>
  );
}
