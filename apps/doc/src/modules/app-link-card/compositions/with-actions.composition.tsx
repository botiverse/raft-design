import { ArrowUpRight, Ellipsis } from "lucide-react";
import { useCallback, useId, useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemLabel,
  DropdownMenuTrigger,
} from "@botiverse/raft-ui";
import {
  AppLinkCard,
  AppLinkCardActions,
  AppLinkCardBadge,
  AppLinkCardBody,
  AppLinkCardEyebrow,
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardMeta,
  AppLinkCardName,
  AppLinkCardTitle,
  DropdownMenuLinkItem,
} from "@botiverse/raft-ui/wip";

// Two buttons, the app's actions, and ⋯ for the rest: the title opens the
// item, so Open in Stamp goes in the menu.
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
            <a href="#stamp-pull-10451" target="_blank" rel="noopener noreferrer">
              #10451 test(i18n): cover the zh-CN fallback when the locale cookie is missing
            </a>
          </AppLinkCardTitle>
          <AppLinkCardMeta>
            <AppLinkCardBadge>{approved ? "Approved" : "Review requested"}</AppLinkCardBadge>
            <span>Jasper · +112 −8</span>
          </AppLinkCardMeta>
        </AppLinkCardBody>
        <AppLinkCardActions>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-md" aria-label="More" />}
            >
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLinkItem
                href="#stamp-pull-10451"
                target="_blank"
                rel="noopener noreferrer"
              >
                <DropdownMenuItemLabel>Open in Stamp</DropdownMenuItemLabel>
                <ArrowUpRight role="img" aria-label="(opens in a new tab)" />
              </DropdownMenuLinkItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
