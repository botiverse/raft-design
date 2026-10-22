import { useCallback, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTrailing,
  Switch,
  Text,
} from "@botiverse/raft-ui";

export function CardNotificationPermissionsComposition() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");

  const handleEnabledChange = useCallback((checked: boolean) => {
    setEnabled(checked);
    setMessage("");
  }, []);

  const handleSendTestPush = useCallback(() => {
    setMessage("Test push sent.");
  }, []);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle render={<h3 />}>DMs, direct mentions, and followed thread replies</CardTitle>
        <CardTrailing>
          <Switch
            aria-label="Push notifications"
            checked={enabled}
            onCheckedChange={handleEnabledChange}
          />
        </CardTrailing>
        <CardDescription>
          Uses web push so notifications can still arrive when the tab is in the background.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button
          type="button"
          size="md"
          className="justify-self-start"
          disabled={!enabled}
          onClick={handleSendTestPush}
        >
          Send Test Push
        </Button>
        {message ? (
          <Text.Sans size="caption" aria-live="polite">
            {message}
          </Text.Sans>
        ) : null}
      </CardContent>
    </Card>
  );
}
