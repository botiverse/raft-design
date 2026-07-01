import { Download, X } from "lucide-react";
import { Button, cn, useThemeFamily } from "raft-ui";
import {
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxInfoActions,
  LightboxInfoBar,
  LightboxInfoTitle,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
} from "raft-ui/wip";

export function ImageLightboxShellComposition() {
  const theme = useThemeFamily();

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
                  size={theme === "elegant" ? "icon-sm" : "icon-md"}
                  aria-label="Close"
                  className={cn("pointer-events-auto", theme === "elegant" && "rounded-full p-1.5")}
                />
              }
            >
              <X className={theme === "elegant" ? "size-3.5" : "size-4"} />
            </LightboxClose>
          </div>
        </LightboxHeader>
        <LightboxStage>
          <LightboxMedia
            className="border-0 bg-transparent shadow-none"
            render={<img src="/placeholder.png" alt="Product attachment" />}
          />
          <div className="pointer-events-none absolute right-6 bottom-20 left-6 z-10 flex justify-center">
            <LightboxInfoBar>
              <LightboxInfoTitle>
                release-card-final-approved-for-directory-cover.png
              </LightboxInfoTitle>
              <LightboxInfoActions>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Download">
                  <Download />
                </Button>
              </LightboxInfoActions>
            </LightboxInfoBar>
          </div>
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}
