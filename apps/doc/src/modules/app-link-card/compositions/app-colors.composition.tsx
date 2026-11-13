import { useId } from "react";
import {
  AppLinkCard,
  AppLinkCardBadge,
  AppLinkCardBody,
  AppLinkCardEyebrow,
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardMeta,
  AppLinkCardName,
  AppLinkCardTitle,
} from "@botiverse/raft-ui/wip";

// An app's colour on its badge, the only colour of its own on the card: the
// fill is the app's, the type black or white, whichever reads better, the
// same in both modes, and a fill too close to the card's surface gets a
// hairline ring: the near-black in dark mode, the yellow in light mode.
export function AppLinkCardAppColorsComposition() {
  const mergedId = useId();
  const closedId = useId();
  const draftId = useId();
  return (
    <div className="flex w-full flex-col items-center gap-4 p-6">
      <AppLinkCard aria-labelledby={mergedId}>
        <AppLinkCardHeader>
          <AppLinkCardIcon>
            <img src="/app-icons/stamp.svg" alt="" />
          </AppLinkCardIcon>
          <AppLinkCardName>Stamp</AppLinkCardName>
          <AppLinkCardHost>stamp.build</AppLinkCardHost>
        </AppLinkCardHeader>
        <AppLinkCardBody>
          <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
          <AppLinkCardTitle id={mergedId}>
            <a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer">
              #10449 refactor(i18n): one display-locale source for web and desktop
            </a>
          </AppLinkCardTitle>
          <AppLinkCardMeta>
            {/* Stamp's green for a merged pull request: white type. */}
            <AppLinkCardBadge fill="#218358">Merged</AppLinkCardBadge>
            <span>Martin · +803 −498</span>
          </AppLinkCardMeta>
        </AppLinkCardBody>
      </AppLinkCard>
      <AppLinkCard aria-labelledby={closedId}>
        <AppLinkCardHeader>
          <AppLinkCardIcon>
            <img src="/app-icons/stamp.svg" alt="" />
          </AppLinkCardIcon>
          <AppLinkCardName>Stamp</AppLinkCardName>
          <AppLinkCardHost>stamp.build</AppLinkCardHost>
        </AppLinkCardHeader>
        <AppLinkCardBody>
          <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
          <AppLinkCardTitle id={closedId}>
            <a href="#stamp-pull-10437" target="_blank" rel="noopener noreferrer">
              #10437 chore: drop the legacy locale cookie
            </a>
          </AppLinkCardTitle>
          <AppLinkCardMeta>
            {/* A near-black: white type, and a hairline ring on the dark card. */}
            <AppLinkCardBadge fill="#111111">Closed</AppLinkCardBadge>
            <span>Jasper · +12 −40</span>
          </AppLinkCardMeta>
        </AppLinkCardBody>
      </AppLinkCard>
      <AppLinkCard aria-labelledby={draftId}>
        <AppLinkCardHeader>
          <AppLinkCardIcon>
            <img src="/app-icons/stamp.svg" alt="" />
          </AppLinkCardIcon>
          <AppLinkCardName>Stamp</AppLinkCardName>
          <AppLinkCardHost>stamp.build</AppLinkCardHost>
        </AppLinkCardHeader>
        <AppLinkCardBody>
          <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
          <AppLinkCardTitle id={draftId}>
            <a href="#stamp-pull-10452" target="_blank" rel="noopener noreferrer">
              #10452 feat(i18n): pick the locale from the browser on first visit
            </a>
          </AppLinkCardTitle>
          <AppLinkCardMeta>
            {/* A pale yellow: black type, and a hairline ring on the white card. */}
            <AppLinkCardBadge fill="#F5D90A">Draft</AppLinkCardBadge>
            <span>Kirby · +96 −3</span>
          </AppLinkCardMeta>
        </AppLinkCardBody>
      </AppLinkCard>
    </div>
  );
}
