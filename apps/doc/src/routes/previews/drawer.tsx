import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  Banner,
  BannerDescription,
  Button,
  DrawerActions,
  Text,
  type Theme,
  type ThemeMode,
  useThemeFamily,
} from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";

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
  const isSource = variant === "source";
  const isPwa = scene !== "leave-channel";
  const pwaVariant = scene === "pwa-install-other" ? "other" : "safari";

  return (
    <ViewportFrame viewport={viewport} source={isSource} padded={isSource && isPwa}>
      {scene === "leave-channel" ? (
        isSource ? (
          <LeaveChannelSourceContent />
        ) : (
          <LeaveChannelContent viewport={viewport} />
        )
      ) : isSource ? (
        <PwaInstallSourceContent variant={pwaVariant} />
      ) : (
        <PwaInstallContent variant={pwaVariant} />
      )}
    </ViewportFrame>
  );
}

function ViewportFrame({
  viewport,
  source,
  padded,
  children,
}: {
  viewport: DrawerPreviewViewport;
  source: boolean;
  padded: boolean;
  children: ReactNode;
}) {
  const theme = useThemeFamily();
  const isDesktop = viewport === "desktop";
  const frameClassName = isDesktop ? "h-[24rem] w-[34rem]" : "h-[42rem] w-[375px]";
  const sheetClassName = source
    ? [
        "mx-auto max-w-md border-2 border-black bg-white shadow-[var(--source-shadow-lg)]",
        padded ? "p-4" : null,
      ]
        .filter(Boolean)
        .join(" ")
    : getCurrentSheetClassName(theme, isDesktop, padded);

  return (
    <div
      className={`grid grid-rows-[auto_minmax(0,1fr)] border-2 border-black bg-white shadow-[var(--source-shadow)] ${frameClassName}`}
    >
      <div className="flex h-7 items-center justify-between border-b-2 border-black bg-white px-3 font-mono text-[9px] leading-none font-bold text-black/45 uppercase">
        <span>{isDesktop ? "desktop viewport" : "mobile viewport"}</span>
        <span>{isDesktop ? "1024px" : "375px"}</span>
      </div>
      <div className="relative min-h-0 overflow-hidden bg-gray-50">
        {source ? (
          <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(12px,env(safe-area-inset-bottom,0px))]">
            <div className={sheetClassName}>{children}</div>
          </div>
        ) : (
          <>
            <div
              className="absolute inset-0 z-[5] [[data-theme=elegant]_&]:backdrop-blur-[1.5px]"
              style={{ backgroundColor: "var(--layer-backdrop)" }}
            />
            <div className={sheetClassName}>{children}</div>
          </>
        )}
      </div>
    </div>
  );
}

function getCurrentSheetClassName(theme: Theme, isDesktop: boolean, padded: boolean) {
  return [
    "absolute z-10 mx-auto flex h-auto min-h-64 max-h-[calc(100%-1.75rem)] max-w-lg flex-col outline-none",
    isDesktop
      ? "inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] max-w-md"
      : "inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))]",
    padded ? "p-4" : null,
    theme === "brutal"
      ? [
          "border-2 border-line-strong bg-layer-panel text-foreground shadow-brutal-lg",
          isDesktop ? "bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))]" : null,
        ]
      : [
          "overflow-clip rounded-lg bg-layer-popover text-foreground shadow-xl",
          isDesktop ? "max-w-md rounded-xl" : null,
        ],
  ]
    .flat()
    .filter(Boolean)
    .join(" ");
}

function LeaveChannelContent({ viewport }: { viewport: DrawerPreviewViewport }) {
  const isDesktop = viewport === "desktop";
  const theme = useThemeFamily();
  const titleClassName =
    theme === "brutal"
      ? "max-w-sm text-pretty text-2xl leading-8 font-bold text-foreground-strong"
      : "max-w-sm text-pretty text-2xl leading-8 font-semibold text-[oklch(0.22_0_0)]";

  return (
    <>
      <div className="flex flex-col items-center px-6 pt-8 pb-2 text-center">
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
      <div className={`mt-auto flex flex-col gap-2.5 px-6 ${isDesktop ? "py-5 md:pb-5" : "py-5"}`}>
        <DrawerActions>
          <Button variant="danger">Leave</Button>
          <Button variant="outline">Cancel</Button>
        </DrawerActions>
      </div>
    </>
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

function PwaInstallContent({ variant }: { variant: "other" | "safari" }) {
  const isSafari = variant === "safari";
  const theme = useThemeFamily();
  const titleClassName =
    theme === "brutal"
      ? "max-w-sm text-pretty text-2xl leading-8 font-bold text-foreground-strong"
      : "max-w-sm text-pretty text-2xl leading-8 font-semibold text-[oklch(0.22_0_0)]";

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
            ? "Open Raft as a fullscreen app — faster, more focused."
            : "Open this page in Safari first, then add it to your Home Screen."}
        </Text.Sans>

        {isSafari ? (
          <div className="mt-6 w-full rounded-md bg-layer-panel p-2 [[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-cream">
            <img
              src="/pwa/ios-add-to-home-screen-3step.svg"
              alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
              className="block w-full"
            />
          </div>
        ) : (
          <Banner status="info" className="mt-6 w-full text-left">
            <BannerDescription>
              iOS only allows Home Screen installation from Safari. Copy this page link, open
              Safari, then use Share → Add to Home Screen.
            </BannerDescription>
          </Banner>
        )}
      </div>
      <div className="mt-auto flex flex-col gap-2.5 px-6 py-5">
        <DrawerActions
          className={
            isSafari
              ? "w-full max-w-64 grid-cols-1 [&_[data-slot=button]]:w-full"
              : "w-full max-w-[24rem]"
          }
        >
          {isSafari ? (
            <Button variant="primary" size="lg">
              Got it
            </Button>
          ) : (
            <>
              <Button variant="primary" size="lg">
                Copy Link
              </Button>
              <Button variant="outline" size="lg">
                Close
              </Button>
            </>
          )}
        </DrawerActions>
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
