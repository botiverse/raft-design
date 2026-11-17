import {
  Avatar,
  AvatarFallback,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardPopup,
  PreviewCardSeparator,
  PreviewCardTitle,
} from "@botiverse/raft-ui";
import { CornerTag, CornerTagSpacer } from "@botiverse/raft-ui/wip";

export function CornerTagProfileCardContent() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      {/* The card is the tag's positioned box; its own radius clips the corner. */}
      <PreviewCardPopup className="relative">
        <CornerTag>Admin</CornerTag>
        <PreviewCardHeader>
          <Avatar size="lg" type="human">
            <AvatarFallback>MC</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <PreviewCardTitle>Mina Chen</PreviewCardTitle>
              <CornerTagSpacer>Admin</CornerTagSpacer>
            </div>
            <div className="truncate font-mono text-mono-meta text-foreground-muted">@mina</div>
          </div>
        </PreviewCardHeader>
        <PreviewCardSeparator />
        <PreviewCardDescription>
          Design lead. Ask me about the token migration.
        </PreviewCardDescription>
      </PreviewCardPopup>
      <PreviewCardPopup className="relative">
        <CornerTag>Owner</CornerTag>
        <PreviewCardHeader>
          <Avatar size="lg" type="human">
            <AvatarFallback>AW</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <PreviewCardTitle>Alexandra Wilhelmina Featherstonehaugh</PreviewCardTitle>
              <CornerTagSpacer>Owner</CornerTagSpacer>
            </div>
            <div className="truncate font-mono text-mono-meta text-foreground-muted">
              @alexandra
            </div>
          </div>
        </PreviewCardHeader>
      </PreviewCardPopup>
    </div>
  );
}
