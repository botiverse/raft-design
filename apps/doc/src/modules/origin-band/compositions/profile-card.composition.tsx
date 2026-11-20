import {
  Avatar,
  AvatarFallback,
  PreviewCardHeader,
  PreviewCardPopup,
  PreviewCardTitle,
} from "@botiverse/raft-ui";
import {
  AvatarOrigin,
  OriginBand,
  OriginBandName,
  OriginBandRelation,
  OriginBandSource,
} from "@botiverse/raft-ui/wip";

export function OriginBandProfileCardContent() {
  return (
    <PreviewCardPopup>
      <OriginBand>
        <span className="sr-only">External: Acme Corp</span>
        <OriginBandSource aria-hidden>
          <Avatar size="3xs" type="server">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <OriginBandName>Acme Corp</OriginBandName>
        </OriginBandSource>
        <OriginBandRelation aria-hidden>External</OriginBandRelation>
      </OriginBand>
      <PreviewCardHeader>
        <Avatar size="lg" type="human">
          <AvatarFallback>JO</AvatarFallback>
          <AvatarOrigin aria-hidden>
            <AvatarFallback>A</AvatarFallback>
          </AvatarOrigin>
        </Avatar>
        <div className="min-w-0 flex-1">
          <PreviewCardTitle>Jonas Okafor</PreviewCardTitle>
          <div className="truncate font-mono text-mono-meta text-foreground-muted">@jonas</div>
        </div>
      </PreviewCardHeader>
    </PreviewCardPopup>
  );
}
