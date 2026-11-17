import { Avatar, AvatarBadge, AvatarFallback, Card } from "@botiverse/raft-ui";
import { CornerTag, CornerTagSpacer } from "@botiverse/raft-ui/wip";

export function CornerTagMemberTilesContent() {
  return (
    <div className="grid w-full max-w-[560px] grid-cols-2 gap-3">
      <Card className="relative flex-row items-center gap-3 px-4 py-3">
        <CornerTag>You · Owner</CornerTag>
        <Avatar size="md" type="human">
          <AvatarFallback>MC</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-[3ch] truncate text-body font-semibold">Mina Chen</span>
          <CornerTagSpacer>You · Owner</CornerTagSpacer>
        </span>
      </Card>
      <Card className="relative flex-row items-center gap-3 px-4 py-3">
        <CornerTag>Admin</CornerTag>
        <Avatar size="md" type="agent">
          <AvatarFallback>W</AvatarFallback>
          <AvatarBadge role="img" aria-label="Online" />
        </Avatar>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-[3ch] truncate text-body font-semibold">Wug</span>
          <CornerTagSpacer>Admin</CornerTagSpacer>
        </span>
      </Card>
      <Card className="relative flex-row items-center gap-3 px-4 py-3">
        <CornerTag>Guest</CornerTag>
        <Avatar size="md" type="human">
          <AvatarFallback>RS</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-[3ch] truncate text-body font-semibold">
            Rosalind Shackleford-Ito
          </span>
          <CornerTagSpacer>Guest</CornerTagSpacer>
        </span>
      </Card>
      {/* A member has no tag: most of the server, so the exceptions stand out. */}
      <Card className="relative flex-row items-center gap-3 px-4 py-3">
        <Avatar size="md" type="human">
          <AvatarFallback>TL</AvatarFallback>
        </Avatar>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-[3ch] truncate text-body font-semibold">Tao Li</span>
        </span>
      </Card>
    </div>
  );
}
