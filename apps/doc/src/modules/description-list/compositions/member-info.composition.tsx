import { ChevronDown, CircleHelp } from "lucide-react";
import { useState } from "react";
import {
  Badge,
  Button,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  type DescriptionListDirection,
} from "raft-ui";

const roles = ["Owner", "Admin", "Member"] as const;
const roleVariant = {
  Owner: "warning",
  Admin: "accent",
  Member: "muted",
} as const;

type MemberInfoCompositionProps = {
  direction?: DescriptionListDirection;
};

export function MemberInfoComposition({ direction = "vertical" }: MemberInfoCompositionProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [showRoleHelp, setShowRoleHelp] = useState(false);
  const role = roles[roleIndex] ?? roles[0];

  return (
    <DescriptionList
      direction={direction}
      className={direction === "vertical" ? "grid w-full max-w-sm gap-3" : "w-full max-w-sm"}
    >
      <DescriptionItem>
        <DescriptionTerm>
          Role
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-foreground-icon [[data-theme=brutal]_&]:text-black/35"
            aria-label="Explain member roles"
            aria-pressed={showRoleHelp}
            onClick={() => setShowRoleHelp((visible) => !visible)}
          >
            <CircleHelp aria-hidden />
          </Button>
        </DescriptionTerm>
        <DescriptionDetails className="grid justify-items-start gap-1.5">
          <Badge
            render={
              <button
                type="button"
                aria-label={`Change role from ${role}`}
                onClick={() => setRoleIndex((index) => (index + 1) % roles.length)}
              />
            }
            variant={roleVariant[role]}
            className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-1"
          >
            {role}
            <ChevronDown aria-hidden className="size-3" />
          </Badge>
          {showRoleHelp ? (
            <span className="max-w-xs text-xs text-foreground-muted" role="status">
              Owners manage the workspace; admins manage members; members collaborate.
            </span>
          ) : null}
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Email</DescriptionTerm>
        <DescriptionDetails className="break-all font-mono [[data-theme=elegant]_&]:font-sans">
          cali@zolplay.com
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Joined</DescriptionTerm>
        <DescriptionDetails className="font-mono [[data-theme=elegant]_&]:font-sans">
          May 27, 2026
        </DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}
