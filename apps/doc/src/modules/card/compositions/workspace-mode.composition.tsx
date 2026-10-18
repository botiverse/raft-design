import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTrailing,
  Switch,
} from "@botiverse/raft-ui";

export function CardWorkspaceModeComposition() {
  const [enabled, setEnabled] = useState(true);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle render={<span id="workspace-mode-label" />}>Workspace mode</CardTitle>
        <CardTrailing>
          <Switch
            id="workspace-mode"
            aria-labelledby="workspace-mode-label"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </CardTrailing>
        <CardDescription>
          Use the Activity Bar, Sidebar, and draggable editor groups.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
