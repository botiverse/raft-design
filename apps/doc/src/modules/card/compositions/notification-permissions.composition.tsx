import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Text,
} from "raft-ui";

export function CardNotificationPermissionsComposition() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle render={<h3 />}>DMs, direct mentions, and followed thread replies</CardTitle>
        <CardDescription>
          Uses web push so notifications can still arrive when the tab is in the background.
        </CardDescription>
        <CardAction>
          <Badge variant={enabled ? "success" : "muted"}>{enabled ? "Enabled" : "Disabled"}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEnabled((current) => !current);
              setMessage("");
            }}
          >
            {enabled ? "Disable Push Notifications" : "Enable Push Notifications"}
          </Button>
          {enabled ? (
            <Button type="button" size="sm" onClick={() => setMessage("Test push sent.")}>
              Send Test Push
            </Button>
          ) : null}
        </div>
        {message ? (
          <Text.Sans size="caption" aria-live="polite">
            {message}
          </Text.Sans>
        ) : null}
      </CardContent>
    </Card>
  );
}
