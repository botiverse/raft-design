import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  BottomSheetActions,
  Button,
  Text,
  type Theme,
  type ThemeMode,
  useThemeFamily,
} from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";

type BottomSheetPreviewScene = "leave-channel" | "pwa-install" | "pwa-install-other";
type BottomSheetPreviewVariant = "source" | "current";
type BottomSheetPreviewViewport = "mobile" | "desktop";

export const Route = createFileRoute("/previews/bottom-sheet")({
  staticData: { standalone: true },
  validateSearch: (search) => ({
    scene: getScene(search.scene),
    variant: getVariant(search.variant),
    viewport: getViewport(search.viewport),
    theme: getTheme(search.theme),
    mode: getMode(search.mode),
    instance: typeof search.instance === "string" ? search.instance : "",
  }),
  component: BottomSheetPreviewPage,
});

function BottomSheetPreviewPage() {
  const search = Route.useSearch();

  return (
    <PreviewThemeScope
      family={search.theme}
      mode={search.mode}
      className="min-h-screen bg-transparent text-foreground"
    >
      <div className="flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent p-0">
        <BottomSheetScenePreview
          key={search.instance}
          scene={search.scene}
          variant={search.variant}
          viewport={search.viewport}
        />
      </div>
    </PreviewThemeScope>
  );
}

function BottomSheetScenePreview({
  scene,
  variant,
  viewport,
}: {
  scene: BottomSheetPreviewScene;
  variant: BottomSheetPreviewVariant;
  viewport: BottomSheetPreviewViewport;
}) {
  const isSource = variant === "source";
  const isPwa = scene !== "leave-channel";
  const pwaVariant = scene === "pwa-install-other" ? "other" : "safari";

  return (
    <ViewportFrame viewport={viewport} source={isSource} padded={isSource && isPwa}>
      {scene === "leave-channel" ? (
        isSource ? (
          <LeaveChannelSourceContent onClose={noop} />
        ) : (
          <LeaveChannelContent viewport={viewport} onClose={noop} />
        )
      ) : isSource ? (
        <PwaInstallSourceContent variant={pwaVariant} onClose={noop} />
      ) : (
        <PwaInstallContent variant={pwaVariant} onClose={noop} />
      )}
    </ViewportFrame>
  );
}

function noop() {}

function ViewportFrame({
  viewport,
  source,
  padded,
  children,
}: {
  viewport: BottomSheetPreviewViewport;
  source: boolean;
  padded: boolean;
  children: ReactNode;
}) {
  const theme = useThemeFamily();
  const isDesktop = viewport === "desktop";
  const frameClassName = isDesktop ? "h-[24rem] w-[34rem]" : "h-[42rem] w-[375px]";
  const sheetClassName = source
    ? [
        "mx-auto max-w-md border-2 border-black bg-white shadow-[var(--shadow-lg)]",
        padded ? "p-4" : null,
      ]
        .filter(Boolean)
        .join(" ")
    : getCurrentSheetClassName(theme, isDesktop, padded);

  const frameBody = (
    <div className="relative min-h-0 overflow-hidden bg-gray-50">
      {source ? (
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className={sheetClassName}>{children}</div>
        </div>
      ) : null}
      {!source ? (
        <>
          <div
            className="absolute inset-0 z-[5] [[data-theme=elegant]_&]:backdrop-blur-[1.5px]"
            style={{ backgroundColor: "var(--layer-backdrop)" }}
          />
          <div className={sheetClassName}>{children}</div>
        </>
      ) : null}
    </div>
  );

  const frame = (
    <div
      className={`grid grid-rows-[auto_minmax(0,1fr)] border-2 border-black bg-white shadow-[var(--shadow)] ${frameClassName}`}
    >
      <div className="flex h-7 items-center justify-between border-b-2 border-black bg-white px-3 font-mono text-[9px] leading-none font-bold text-black/45 uppercase">
        <span>{isDesktop ? "desktop viewport" : "mobile viewport"}</span>
        <span>{isDesktop ? "1024px" : "375px"}</span>
      </div>
      {frameBody}
    </div>
  );

  if (source) {
    return frame;
  }

  return frame;
}

function getCurrentSheetClassName(theme: Theme, isDesktop: boolean, padded: boolean) {
  return [
    "absolute bottom-0 z-10 mx-auto mt-0 flex h-auto min-h-64 max-h-[calc(100%-1.75rem)] max-w-lg flex-col outline-none",
    isDesktop ? "inset-x-3 max-w-md" : "inset-x-0",
    padded ? "p-4" : null,
    theme === "brutal"
      ? [
          "border-2 border-black bg-white text-black shadow-[var(--shadow-lg)]",
          !isDesktop ? "border-x-0 border-b-0 border-t-2" : null,
        ]
      : [
          "overflow-clip rounded-lg rounded-b-none bg-layer-popover text-foreground shadow-xl",
          isDesktop ? "max-w-md rounded-xl rounded-b-none" : null,
        ],
  ]
    .flat()
    .filter(Boolean)
    .join(" ");
}

function LeaveChannelContent({
  viewport,
  onClose,
}: {
  viewport: BottomSheetPreviewViewport;
  onClose: () => void;
}) {
  const isDesktop = viewport === "desktop";
  const theme = useThemeFamily();
  const titleClassName =
    theme === "brutal"
      ? "max-w-sm text-pretty text-2xl leading-8 font-bold text-black"
      : "max-w-sm text-pretty text-2xl leading-8 font-semibold text-foreground-strong";

  return (
    <>
      <div className="flex flex-col items-center px-6 pt-8 pb-3 text-center">
        <Text.Sans render={<div />} size="large" className={titleClassName}>
          Leave channel?
        </Text.Sans>
      </div>
      <div className="flex flex-1 flex-col items-center px-6 pt-4 pb-6 text-center">
        <Text.Sans
          size="small"
          className="max-w-sm text-pretty text-center text-foreground/60 [[data-theme=brutal]_&]:text-black/60"
        >
          You can rejoin anytime from the directory.
        </Text.Sans>
        <div className="mt-6 flex items-center gap-3 text-left">
          <Avatar size="md" type="agent">
            <AvatarFallback>DS</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Text.Sans
              size="small"
              className="font-medium text-foreground-strong [[data-theme=brutal]_&]:text-black"
            >
              #design-system
            </Text.Sans>
            <Text.Sans
              size="caption"
              className="mt-0.5 text-foreground-muted [[data-theme=brutal]_&]:text-black/60"
            >
              Joined June 12, 2026
            </Text.Sans>
          </div>
        </div>
      </div>
      <div className={`mt-auto flex flex-col gap-2.5 px-6 pt-5 ${isDesktop ? "pb-11" : "pb-5"}`}>
        <BottomSheetActions>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onClose}>
            Leave
          </Button>
        </BottomSheetActions>
      </div>
    </>
  );
}

function LeaveChannelSourceContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-1 p-4">
        <div className="text-base font-bold text-black">Leave channel?</div>
        <div className="text-sm text-black/60">You can rejoin anytime from the directory.</div>
      </div>
      <div className="mt-auto flex flex-col gap-2 p-4">
        <Button variant="danger" onClick={onClose}>
          Leave
        </Button>
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </>
  );
}

function PwaInstallContent({
  variant,
  onClose,
}: {
  variant: "safari" | "other";
  onClose: () => void;
}) {
  const isSafari = variant === "safari";
  const theme = useThemeFamily();
  const titleClassName =
    theme === "brutal"
      ? "max-w-sm text-pretty text-2xl leading-8 font-bold text-black"
      : "max-w-sm text-pretty text-2xl leading-8 font-semibold text-foreground-strong";
  const actionSize = !isSafari && theme === "elegant" ? "md" : "lg";
  const actionsClassName = isSafari
    ? "w-full max-w-64 grid-cols-1 [&_[data-slot=button]]:w-full"
    : theme === "elegant"
      ? "w-full max-w-[24rem] [&_[data-slot=button]]:min-w-0 [&_[data-slot=button]]:flex-1"
      : "w-full max-w-[24rem] [&_[data-slot=button]]:w-full";

  return (
    <>
      <div className="flex flex-col items-center px-6 pt-8 pb-2 text-center">
        <Text.Sans render={<div />} size="large" className={titleClassName}>
          Add Raft to your Home Screen
        </Text.Sans>
      </div>
      <div className="flex flex-1 flex-col items-center px-6 pt-4 pb-6 text-center">
        <Text.Sans
          size="small"
          className="max-w-sm text-pretty text-center text-foreground/60 [[data-theme=brutal]_&]:text-black/60"
        >
          {isSafari
            ? "Open Raft as a fullscreen app - faster, more focused."
            : "Open this page in Safari first, then add it to your Home Screen."}
        </Text.Sans>

        {isSafari ? (
          <div className="mt-6 rounded-md bg-layer-panel p-2 [[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-cream">
            <img
              src="/pwa/ios-add-to-home-screen-3step.svg"
              alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
              className="block w-full"
            />
          </div>
        ) : (
          <Text.Sans
            render={<div />}
            size="small"
            className="mt-6 rounded-md border border-line-subtle bg-layer-panel p-4 text-foreground [[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-cream [[data-theme=brutal]_&]:text-black"
          >
            iOS only allows Home Screen installation from Safari. Copy this page link, open Safari,
            then use Share - Add to Home Screen.
          </Text.Sans>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2.5 px-6 py-5">
        <BottomSheetActions className={actionsClassName}>
          {isSafari ? (
            <Button variant="primary" size="lg" onClick={onClose}>
              Got it
            </Button>
          ) : (
            <>
              <Button variant="outline" size={actionSize} onClick={onClose}>
                Close
              </Button>
              <Button variant="primary" size={actionSize}>
                Copy Link
              </Button>
            </>
          )}
        </BottomSheetActions>
      </div>
    </>
  );
}

function PwaInstallSourceContent({
  variant,
  onClose,
}: {
  variant: "safari" | "other";
  onClose: () => void;
}) {
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
          onClick={onClose}
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
        <button type="button" className="btn-brutal bg-white px-3 py-2 text-xs" onClick={onClose}>
          {isSafari ? "Got it" : "Close"}
        </button>
      </div>
    </>
  );
}

function getScene(value: unknown): BottomSheetPreviewScene {
  return value === "pwa-install" || value === "pwa-install-other" || value === "leave-channel"
    ? value
    : "leave-channel";
}

function getVariant(value: unknown): BottomSheetPreviewVariant {
  return value === "source" || value === "current" ? value : "current";
}

function getViewport(value: unknown): BottomSheetPreviewViewport {
  return value === "desktop" || value === "mobile" ? value : "mobile";
}

function getTheme(value: unknown): Theme {
  return value === "brutal" || value === "elegant" ? value : "brutal";
}

function getMode(value: unknown): ThemeMode {
  return value === "dark" || value === "light" ? value : "light";
}
