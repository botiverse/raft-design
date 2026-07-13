import {
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
  Text,
  type DrawerContentProps,
  type DrawerProps,
} from "raft-ui";
import { useState, useSyncExternalStore } from "react";

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

export type PwaInstallDrawerCompositionProps = Pick<
  DrawerProps,
  "defaultOpen" | "modal" | "onOpenChange" | "open"
> & {
  contentProps?: DrawerContentProps;
  mobileOnly?: boolean;
  showTrigger?: boolean;
  variant: "other" | "safari";
};

export function PwaInstallDrawerComposition({
  contentProps,
  mobileOnly = true,
  showTrigger = true,
  variant,
  ...drawerProps
}: PwaInstallDrawerCompositionProps) {
  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );
  const [copied, setCopied] = useState(false);

  if (mobileOnly && !isMobile) {
    return null;
  }

  const isSafari = variant === "safari";

  return (
    <Drawer {...drawerProps}>
      {showTrigger ? (
        <DrawerTrigger render={<Button variant="primary" size="sm" />}>Install</DrawerTrigger>
      ) : null}
      <DrawerContent {...contentProps}>
        <DrawerHeader>
          <DrawerTitle>Add Raft to your Home Screen</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <DrawerDescription>
            {isSafari
              ? "Open Raft as a fullscreen app — faster, more focused."
              : "Open this page in Safari first, then add it to your Home Screen."}
          </DrawerDescription>
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
              iOS only allows Home Screen installation from Safari. Copy this page link, open
              Safari, then use Share → Add to Home Screen.
            </Text.Sans>
          )}
        </DrawerBody>
        <DrawerFooter>
          <DrawerActions
            className={
              isSafari
                ? "w-full max-w-64 grid-cols-1 [&_[data-slot=button]]:w-full"
                : "w-full max-w-[24rem]"
            }
          >
            {isSafari ? (
              <DrawerClose render={<Button variant="primary" size="lg" />}>Got it</DrawerClose>
            ) : (
              <>
                <DrawerClose render={<Button variant="outline" size="lg" />}>Close</DrawerClose>
                <Button variant="primary" size="lg" onClick={() => setCopied(true)}>
                  {copied ? "Copied" : "Copy Link"}
                </Button>
              </>
            )}
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
