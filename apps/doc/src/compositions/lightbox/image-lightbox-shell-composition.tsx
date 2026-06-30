import { Download, X } from "lucide-react";
import { Button } from "raft-ui";
import {
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
} from "raft-ui/wip";

export function ImageLightboxShellComposition() {
  return (
    <Lightbox open onOpenChange={() => {}}>
      <LightboxContent className="flex flex-col" data-testid="image-lightbox">
        <LightboxHeader className="pointer-events-none absolute inset-x-0 top-0 z-20">
          <div className="flex justify-end px-4 pt-4">
            <LightboxTitle className="sr-only">product-shot.png</LightboxTitle>
            <LightboxClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-md"
                  aria-label="Close"
                  className="pointer-events-auto"
                />
              }
            >
              <X className="size-4" />
            </LightboxClose>
          </div>
        </LightboxHeader>
        <LightboxStage>
          <LightboxMedia
            className="border-0 bg-transparent shadow-none"
            render={<img src="/placeholder.png" alt="Product attachment" />}
          />
          <div className="pointer-events-none absolute right-6 bottom-20 left-6 z-10 flex justify-center">
            <div className="pointer-events-auto flex w-[clamp(10.5rem,25vw,18rem)] max-w-[calc(100vw-3rem)] min-w-[10.5rem] items-center gap-3 rounded-md bg-white px-3 py-2 text-black shadow-[0_12px_32px_-18px_oklch(0_0_0_/_0.55)] [[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:shadow-[var(--shadow)]">
              <div className="min-w-0 flex-1">
                <div className="truncate font-heading text-sm font-bold [[data-theme=elegant]_&]:font-sans [[data-theme=elegant]_&]:font-medium">
                  release-card-final-approved-for-directory-cover.png
                </div>
              </div>
              <LightboxActions className="shrink-0">
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Download">
                  <Download />
                </Button>
              </LightboxActions>
            </div>
          </div>
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}
