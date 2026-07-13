import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button, type Theme, type ThemeMode } from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { LeaveChannelDrawerComposition } from "#/compositions/drawer/leave-channel-composition.tsx";
import { PwaInstallSafariDrawerComposition } from "#/compositions/drawer/pwa-install-drawer-composition.tsx";
import { PwaInstallOtherDrawerComposition } from "#/compositions/drawer/pwa-install-other-drawer-composition.tsx";

type DrawerPreviewScene = "leave-channel" | "pwa-install" | "pwa-install-other";
type DrawerPreviewVariant = "current" | "source";
type DrawerPreviewViewport = "desktop" | "mobile";

export const Route = createFileRoute("/previews/drawer")({
  staticData: { standalone: true },
  validateSearch: (search) => ({
    scene: getScene(search.scene),
    variant: getVariant(search.variant),
    viewport: getViewport(search.viewport),
    theme: getTheme(search.theme),
    mode: getMode(search.mode),
    instance: typeof search.instance === "string" ? search.instance : "",
  }),
  component: DrawerSourcePreviewPage,
});

function DrawerSourcePreviewPage() {
  const search = Route.useSearch();

  return (
    <PreviewThemeScope
      family={search.theme}
      mode={search.mode}
      className="min-h-screen bg-transparent text-foreground"
    >
      <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent p-0">
        <DrawerScenePreview
          key={search.instance}
          scene={search.scene}
          variant={search.variant}
          viewport={search.viewport}
        />
      </div>
    </PreviewThemeScope>
  );
}

function DrawerScenePreview({
  scene,
  variant,
  viewport,
}: {
  scene: DrawerPreviewScene;
  variant: DrawerPreviewVariant;
  viewport: DrawerPreviewViewport;
}) {
  return variant === "source" ? (
    <SourceViewportFrame scene={scene} viewport={viewport} />
  ) : (
    <CurrentDrawerComposition scene={scene} viewport={viewport} />
  );
}

function CurrentDrawerComposition({
  scene,
  viewport,
}: {
  scene: DrawerPreviewScene;
  viewport: DrawerPreviewViewport;
}) {
  if (scene === "pwa-install") {
    return <PwaInstallSafariDrawerComposition open mobileOnly={false} showTrigger={false} />;
  }

  if (scene === "pwa-install-other") {
    return <PwaInstallOtherDrawerComposition open mobileOnly={false} showTrigger={false} />;
  }

  return <LeaveChannelDrawerComposition open showTrigger={false} viewport={viewport} />;
}

function SourceViewportFrame({
  scene,
  viewport,
}: {
  scene: DrawerPreviewScene;
  viewport: DrawerPreviewViewport;
}) {
  const isDesktop = viewport === "desktop";
  const isPwa = scene !== "leave-channel";
  const frameClassName = isDesktop ? "h-[24rem] w-[34rem]" : "h-[42rem] w-[375px]";
  const panelClassName = [
    "mx-auto max-w-md border-2 border-black bg-white shadow-[var(--source-shadow-lg)]",
    isPwa ? "p-4" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`grid grid-rows-[auto_minmax(0,1fr)] border-2 border-black bg-white shadow-[var(--source-shadow)] ${frameClassName}`}
    >
      <div className="flex h-7 items-center justify-between border-b-2 border-black bg-white px-3 font-mono text-[9px] leading-none font-bold text-black/45 uppercase">
        <span>{isDesktop ? "desktop viewport" : "mobile viewport"}</span>
        <span>{isDesktop ? "1024px" : "375px"}</span>
      </div>
      <div className="relative min-h-0 overflow-hidden bg-gray-50">
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className={panelClassName}>
            {scene === "leave-channel" ? (
              <LeaveChannelSourceContent />
            ) : (
              <PwaInstallSourceContent variant={scene === "pwa-install" ? "safari" : "other"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveChannelSourceContent() {
  return (
    <>
      <div className="flex flex-col gap-1 p-4">
        <div className="text-base font-bold text-black">Leave channel?</div>
        <div className="text-sm text-black/60">You can rejoin anytime from the directory.</div>
      </div>
      <div className="mt-auto flex flex-col gap-2 p-4">
        <Button variant="danger">Leave</Button>
        <Button variant="default">Cancel</Button>
      </div>
    </>
  );
}

function PwaInstallSourceContent({ variant }: { variant: "other" | "safari" }) {
  const isSafari = variant === "safari";

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg leading-tight font-black text-black">
            Add Raft to your Home Screen
          </div>
          <div className="mt-1 text-sm text-black/60">
            {isSafari
              ? "Open Raft as a fullscreen app - faster, more focused."
              : "Open this page in Safari first, then add it to your Home Screen."}
          </div>
        </div>
        <button
          type="button"
          className="btn-brutal-sm bg-white p-1"
          aria-label="Close install instructions"
        >
          <X size={16} />
        </button>
      </div>

      {isSafari ? (
        <div className="border-2 border-black bg-brutal-cream p-2">
          <img
            src="/pwa/ios-add-to-home-screen-3step.svg"
            alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
            className="block w-full"
          />
        </div>
      ) : (
        <div className="border-2 border-black bg-brutal-cream p-3 text-sm text-black">
          iOS only allows Home Screen installation from Safari. Copy this page link, open Safari,
          then use Share - Add to Home Screen.
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {isSafari ? null : (
          <button type="button" className="btn-brutal bg-brutal-yellow px-3 py-2 text-xs">
            Copy Link
          </button>
        )}
        <button type="button" className="btn-brutal bg-white px-3 py-2 text-xs">
          {isSafari ? "Got it" : "Close"}
        </button>
      </div>
    </>
  );
}

function getScene(value: unknown): DrawerPreviewScene {
  return value === "pwa-install" || value === "pwa-install-other" || value === "leave-channel"
    ? value
    : "leave-channel";
}

function getViewport(value: unknown): DrawerPreviewViewport {
  return value === "desktop" || value === "mobile" ? value : "mobile";
}

function getVariant(value: unknown): DrawerPreviewVariant {
  return value === "source" ? "source" : "current";
}

function getTheme(value: unknown): Theme {
  return value === "brutal" || value === "elegant" ? value : "brutal";
}

function getMode(value: unknown): ThemeMode {
  return value === "dark" || value === "light" ? value : "light";
}
