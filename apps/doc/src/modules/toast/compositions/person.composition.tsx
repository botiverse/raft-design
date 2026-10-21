import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  toast,
  ToastProvider,
} from "@botiverse/raft-ui";

// @docs-source-strip-start
import { ToastPreviewScene } from "./toast.composition";
// @docs-source-strip-end

/**
 * A toast about someone: their avatar takes the intent icon's place in
 * `ToastIcon`. The command API renders `leading` hidden from assistive
 * technology, so the name stays in the title.
 */
export function PersonContent({ portalContainer }: { portalContainer: HTMLElement | null }) {
  const showReviewDone = useCallback(() => {
    toast.info("Atlas finished reviewing #25.", {
      id: "atlas-review",
      leading: (
        <Avatar size="xs" type="agent">
          <AvatarImage src="/avatars/quoted-preview-atlas.svg" alt="" />
          <AvatarFallback />
        </Avatar>
      ),
      action: { label: "View", onClick: () => toast.dismiss("atlas-review") },
    });
  }, []);

  useEffect(() => {
    showReviewDone();
    return () => toast.dismiss();
  }, [showReviewDone]);

  return (
    <ToastProvider
      timeout={0}
      portalContainer={portalContainer}
      viewportStrategy="absolute"
      viewportClassName="[--toast-viewport-top:4.25rem]"
    >
      <Button type="button" size="md" variant="outline" onClick={showReviewDone}>
        Request review
      </Button>
    </ToastProvider>
  );
}

// @docs-source-strip-start
export function PersonComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="relative h-52 w-full overflow-hidden">
      <ToastPreviewScene />
      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
        {portalContainer ? <PersonContent portalContainer={portalContainer} /> : null}
      </div>
    </div>
  );
}
// @docs-source-strip-end
