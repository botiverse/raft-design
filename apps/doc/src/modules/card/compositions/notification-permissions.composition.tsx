import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTitleText,
  CardTrailing,
  Switch,
  Text,
} from "raft-ui";

export function CardNotificationPermissionsComposition() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>
          <CardTitleText render={<h3 />}>
            DMs, direct mentions, and followed thread replies
          </CardTitleText>
          <CardTrailing>
            <Switch
              aria-label="Push notifications"
              checked={enabled}
              onCheckedChange={(checked) => {
                setEnabled(checked);
                setMessage("");
              }}
            />
          </CardTrailing>
        </CardTitle>
        <CardDescription>
          Uses web push so notifications can still arrive when the tab is in the background.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button
          type="button"
          size="sm"
          className="justify-self-start"
          disabled={!enabled}
          onClick={() => setMessage("Test push sent.")}
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
