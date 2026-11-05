import { useCallback, useId, useState } from "react";
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

export function AppLinkCardWithActionsComposition() {
  const titleId = useId();
  const [approved, setApproved] = useState(false);
  const handleApprove = useCallback(() => setApproved(true), []);

  return (
    <div className="flex w-full justify-center p-6">
      <AppLinkCard aria-labelledby={titleId}>
        <AppLinkCardHeader>
          <AppLinkCardIcon>
            <img src="/app-icons/stamp.svg" alt="" />
          </AppLinkCardIcon>
          <AppLinkCardName>Stamp</AppLinkCardName>
          <AppLinkCardHost>stamp.build</AppLinkCardHost>
        </AppLinkCardHeader>
        <AppLinkCardBody>
          <AppLinkCardEyebrow>botiverse/slock</AppLinkCardEyebrow>
          <AppLinkCardTitle id={titleId}>
            #10451 test(i18n): cover the zh-CN fallback when the locale cookie is missing
          </AppLinkCardTitle>
          <AppLinkCardMeta>
            <Badge appearance="soft">{approved ? "Approved" : "Review requested"}</Badge>
            <span>Jasper · +112 −8</span>
          </AppLinkCardMeta>
        </AppLinkCardBody>
        <AppLinkCardActions>
          <Button
            variant="ghost"
            render={<a href="#stamp-pull-10451-files" target="_blank" rel="noopener noreferrer" />}
          >
            View changes
          </Button>
          <Button variant="outline" disabled={approved} onClick={handleApprove}>
            Approve
          </Button>
        </AppLinkCardActions>
      </AppLinkCard>
    </div>
  );
}
