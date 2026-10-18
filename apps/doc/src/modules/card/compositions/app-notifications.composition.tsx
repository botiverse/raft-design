import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardLeading,
  CardTitle,
  Field,
  FieldLabel,
  Input,
  Switch,
} from "@botiverse/raft-ui";

export function CardAppNotificationsComposition() {
  const [enabled, setEnabled] = useState(true);
  const [endpoint, setEndpoint] = useState("");
  const [saved, setSaved] = useState(false);

  const handleEndpointChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEndpoint(event.target.value);
    setSaved(false);
  }, []);

  return (
    <Card variant="inset" className="w-full max-w-xl">
      <CardHeader>
        <CardLeading>
          <Switch
            aria-labelledby="app-notifications-title"
            aria-describedby="app-notifications-description"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </CardLeading>
        <CardTitle render={<h3 id="app-notifications-title" />}>Enable app notifications</CardTitle>
        <CardDescription id="app-notifications-description">
          Receive selected Raft events at a signed HTTPS webhook.
        </CardDescription>
      </CardHeader>

      {enabled ? (
        <CardContent>
          <form action={() => setSaved(true)}>
            <Field>
              <FieldLabel htmlFor="app-notifications-endpoint">HTTPS endpoint</FieldLabel>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  id="app-notifications-endpoint"
                  name="webhookEndpoint"
                  type="url"
                  className="min-w-0 flex-1"
                  value={endpoint}
                  placeholder="https://example.com/raft/events"
                  onChange={handleEndpointChange}
                />
                <Button type="submit" size="sm" disabled={!endpoint.trim() || saved}>
                  {saved ? "Saved" : "Save endpoint"}
                </Button>
              </div>
            </Field>
          </form>
        </CardContent>
      ) : null}
    </Card>
  );
}
