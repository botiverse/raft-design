import { AppWindow, Info, OctagonAlert } from "lucide-react";
import { IconTile } from "raft-ui";

export function IconTileVariantsComposition() {
  return (
    <div className="flex items-center gap-4">
      <IconTile role="img" aria-label="App">
        <AppWindow />
      </IconTile>
      <IconTile variant="warning" role="img" aria-label="Error">
        <OctagonAlert />
      </IconTile>
      <IconTile variant="information" role="img" aria-label="Message">
        <Info />
      </IconTile>
    </div>
  );
}
