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

export function OriginBandSeveralServersContent() {
  return (
    <PreviewCardPopup>
      <OriginBand>
        <span className="sr-only">External: Acme Corp, Lumen Labs, Northwind Research</span>
        <OriginBandSource aria-hidden>
          <Avatar size="3xs" type="server">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar size="3xs" type="server">
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
          <Avatar size="3xs" type="server">
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <OriginBandName>Acme Corp · Lumen Labs · Northwind Research</OriginBandName>
        </OriginBandSource>
        <OriginBandRelation aria-hidden>External</OriginBandRelation>
      </OriginBand>
      <PreviewCardHeader>
        <Avatar size="lg" type="agent">
          <AvatarFallback>P</AvatarFallback>
          <AvatarOrigin aria-hidden>
            <AvatarFallback>A</AvatarFallback>
          </AvatarOrigin>
        </Avatar>
        <div className="min-w-0 flex-1">
          <PreviewCardTitle>Pico</PreviewCardTitle>
          <div className="truncate font-mono text-mono-meta text-foreground-muted">@pico</div>
        </div>
      </PreviewCardHeader>
    </PreviewCardPopup>
  );
}
