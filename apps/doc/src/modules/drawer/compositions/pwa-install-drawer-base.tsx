import {
  Banner,
  BannerDescription,
  Button,
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@botiverse/raft-ui";
import type { DrawerContentProps, DrawerProps } from "@botiverse/raft-ui";
import { useCallback, useState, useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToMobileQuery(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getMobileServerSnapshot() {
  return false;
}

export type PwaInstallDrawerVariant = "other" | "safari";

export type PwaInstallDrawerPanelProps = {
  variant: PwaInstallDrawerVariant;
};

export function PwaInstallDrawerPanel({ variant }: PwaInstallDrawerPanelProps) {
  const [copied, setCopied] = useState(false);
  const isSafari = variant === "safari";

  const handleCopyLink = useCallback(() => {
    setCopied(true);
  }, []);

  return (
    <>
      <DrawerHeader className="items-start text-left">
        <DrawerTitle className="text-left">Add Raft to your Home Screen</DrawerTitle>
      </DrawerHeader>
      <DrawerBody className="items-start text-left">
        <DrawerDescription className="text-left">
          {isSafari
            ? "Open Raft as a fullscreen app — faster, more focused."
            : "Open this page in Safari first, then add it to your Home Screen."}
        </DrawerDescription>
        {isSafari ? (
          <div className="mt-6 rounded-md bg-layer-canvas p-2">
            <img
              src="/pwa/ios-add-to-home-screen-3step.svg"
              alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
              className="block w-full"
            />
          </div>
        ) : (
          <Banner status="info" className="mt-6 w-full">
            <BannerDescription>
              iOS only allows Home Screen installation from Safari. Copy this page link, open
              Safari, then use Share → Add to Home Screen.
            </BannerDescription>
          </Banner>
        )}
      </DrawerBody>
      <DrawerFooter>
        <DrawerActions
          className={
            isSafari
              ? "w-full max-w-64 grid-cols-1 **:data-[slot=button]:w-full"
              : "w-full max-w-[24rem]"
          }
        >
          {isSafari ? (
            <DrawerClose render={<Button variant="primary" size="lg" />}>Got It</DrawerClose>
          ) : (
            <>
              <Button variant="primary" size="lg" onClick={handleCopyLink}>
                {copied ? "Copied" : "Copy Link"}
              </Button>
              <DrawerClose render={<Button variant="outline" size="lg" />}>Close</DrawerClose>
            </>
          )}
        </DrawerActions>
      </DrawerFooter>
    </>
  );
}

export type PwaInstallDrawerCompositionProps = Pick<
  DrawerProps,
  "defaultOpen" | "modal" | "onOpenChange" | "open"
> & {
  mobileOnly?: boolean;
  portalProps?: DrawerContentProps["portalProps"];
  showTrigger?: boolean;
  variant: PwaInstallDrawerVariant;
};

export function PwaInstallDrawerComposition({
  mobileOnly = true,
  portalProps,
  showTrigger = true,
  variant,
  ...drawerProps
}: PwaInstallDrawerCompositionProps) {
  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );

  if (mobileOnly && !isMobile) {
    return null;
  }

  return (
    <Drawer {...drawerProps}>
      {showTrigger ? (
        <DrawerTrigger render={<Button variant="primary" size="md" />}>Install</DrawerTrigger>
      ) : null}
      <DrawerContent portalProps={portalProps}>
        <PwaInstallDrawerPanel variant={variant} />
      </DrawerContent>
    </Drawer>
  );
}
