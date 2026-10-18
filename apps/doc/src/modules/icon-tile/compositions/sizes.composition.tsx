import { Monitor } from "lucide-react";
import { IconTile } from "@botiverse/raft-ui";

export function IconTileSizesComposition() {
  return (
    <div className="flex items-center gap-4">
      <IconTile size="xs">
        <Monitor />
      </IconTile>
      <IconTile size="sm">
        <Monitor />
      </IconTile>
      <IconTile size="md">
        <Monitor />
      </IconTile>
      <IconTile size="lg">
        <Monitor />
      </IconTile>
    </div>
  );
}
