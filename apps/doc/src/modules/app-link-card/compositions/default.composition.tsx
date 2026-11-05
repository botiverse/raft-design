import { Badge, Button } from "@botiverse/raft-ui";
import {
  AppLinkCard,
  AppLinkCardActions,
  AppLinkCardBody,
  AppLinkCardEyebrow,
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardMeta,
  AppLinkCardName,
  AppLinkCardTitle,
} from "@botiverse/raft-ui/wip";

export function AppLinkCardDefaultComposition() {
  return (
    <div className="flex w-full justify-center p-6">
      <AppLinkCard>
        <AppLinkCardHeader>
          <AppLinkCardIcon>
            <img src="/app-icons/stamp.svg" alt="" />
          </AppLinkCardIcon>
          <AppLinkCardName>Stamp</AppLinkCardName>
          <AppLinkCardHost>stamp.build</AppLinkCardHost>
        </AppLinkCardHeader>
        <AppLinkCardBody>
          <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
          <AppLinkCardTitle>
            #10449 refactor(i18n): one display-locale source for web and desktop
          </AppLinkCardTitle>
          <AppLinkCardMeta>
            <Badge appearance="soft">Merged</Badge>
            <span>Martin · +803 −498</span>
          </AppLinkCardMeta>
        </AppLinkCardBody>
        <AppLinkCardActions>
          <Button
            variant="outline"
            render={<a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer" />}
          >
            Open in Stamp
          </Button>
        </AppLinkCardActions>
      </AppLinkCard>
    </div>
  );
}
