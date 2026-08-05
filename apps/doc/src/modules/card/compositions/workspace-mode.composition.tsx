import { useState } from "react";
import { Card, CardContent, CardDescription, CardTitle, Switch } from "raft-ui";

export function CardWorkspaceModeComposition() {
  const [enabled, setEnabled] = useState(true);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <CardTitle render={<span id="workspace-mode-label" />}>Workspace mode</CardTitle>
          <CardDescription>
            Use the Activity Bar, Sidebar, and draggable editor groups.
          </CardDescription>
        </div>
        <Switch
          id="workspace-mode"
          aria-labelledby="workspace-mode-label"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </CardContent>
    </Card>
  );
}
