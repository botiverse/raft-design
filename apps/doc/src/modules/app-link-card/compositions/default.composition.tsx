import { ArrowUpRight, Ellipsis } from "lucide-react";
import { useId } from "react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemLabel,
  DropdownMenuTrigger,
} from "@botiverse/raft-ui";
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
  DropdownMenuLinkItem,
} from "@botiverse/raft-ui/wip";

// A card with no actions: the title opens the item, and Open in Stamp waits
// in ⋯.
export function AppLinkCardDefaultComposition() {
  const titleId = useId();
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
            <a href="#stamp-pull-10449" target="_blank" rel="noopener noreferrer">
              #10449 refactor(i18n): one display-locale source for web and desktop
            </a>
          </AppLinkCardTitle>
          <AppLinkCardMeta>
            <Badge appearance="soft">Merged</Badge>
            <span>Martin · +803 −498</span>
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
                href="#stamp-pull-10449"
                target="_blank"
                rel="noopener noreferrer"
              >
                <DropdownMenuItemLabel>Open in Stamp</DropdownMenuItemLabel>
                <ArrowUpRight role="img" aria-label="(opens in a new tab)" />
              </DropdownMenuLinkItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </AppLinkCardActions>
      </AppLinkCard>
    </div>
  );
}
