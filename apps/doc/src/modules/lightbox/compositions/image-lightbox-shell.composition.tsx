import { Download, X } from "lucide-react";
import { Button } from "raft-ui";
import {
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxInfoActions,
  LightboxInfoBar,
  LightboxInfoDock,
  LightboxInfoTitle,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "raft-ui";

const DEMO_IMAGE_SRC =
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1440&q=80";

export function ImageLightboxShellComposition() {
  return (
    <Lightbox>
      <LightboxTrigger render={<Button type="button" variant="default" />}>
        Open image lightbox
      </LightboxTrigger>
      <LightboxContent data-testid="image-lightbox">
        <LightboxTitle className="sr-only">product-shot.png</LightboxTitle>
        <LightboxClose aria-label="Close">
          <X />
        </LightboxClose>
        <LightboxStage>
          <LightboxMedia render={<img src={DEMO_IMAGE_SRC} alt="Product attachment" />} />
          <LightboxInfoDock>
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
          </LightboxInfoDock>
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}
