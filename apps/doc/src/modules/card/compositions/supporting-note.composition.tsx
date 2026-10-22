import { Info } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardTrailing,
  Separator,
  Switch,
  Text,
  TextLink,
} from "@botiverse/raft-ui";

export function CardSupportingNoteComposition() {
  const [enabled, setEnabled] = useState(true);
  const [newSignIns, setNewSignIns] = useState(true);
  const [permissionChanges, setPermissionChanges] = useState(true);
  const [recoveryAttempts, setRecoveryAttempts] = useState(false);

  return (
    <Card variant="inset" className="w-full max-w-lg">
      <CardHeader>
        <CardTitle render={<h3 id="security-alerts-title" />}>Security alerts</CardTitle>
        <CardTrailing>
          <Switch
            aria-labelledby="security-alerts-title"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </CardTrailing>
        <CardDescription>Notify workspace owners about important account activity.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex min-w-0 items-start justify-between gap-4 leading-5">
          <div className="min-w-0">
            <Text.Sans
              render={<h4 id="new-sign-ins-label" />}
              size="small"
              variant="default"
              className="font-medium"
            >
              New sign-ins
            </Text.Sans>
            <Text.Sans size="caption" variant="muted">
              Alert owners when a new device accesses the workspace.
            </Text.Sans>
          </div>
          <Switch
            className="mt-[calc((1lh-1.875rem)/2)]"
            aria-labelledby="new-sign-ins-label"
            checked={newSignIns}
            disabled={!enabled}
            onCheckedChange={setNewSignIns}
          />
        </div>

        <Separator />

        <div className="flex min-w-0 items-start justify-between gap-4 leading-5">
          <div className="min-w-0">
            <Text.Sans
              render={<h4 id="permission-changes-label" />}
              size="small"
              variant="default"
              className="font-medium"
            >
              Permission changes
            </Text.Sans>
            <Text.Sans size="caption" variant="muted">
              Report changes to owner and administrator access.
            </Text.Sans>
          </div>
          <Switch
            className="mt-[calc((1lh-1.875rem)/2)]"
            aria-labelledby="permission-changes-label"
            checked={permissionChanges}
            disabled={!enabled}
            onCheckedChange={setPermissionChanges}
          />
        </div>

        <Separator />

        <div className="flex min-w-0 items-start justify-between gap-4 leading-5">
          <div className="min-w-0">
            <Text.Sans
              render={<h4 id="recovery-attempts-label" />}
              size="small"
              variant="default"
              className="font-medium"
            >
              Recovery attempts
            </Text.Sans>
            <Text.Sans size="caption" variant="muted">
              Notify owners when account recovery is requested.
            </Text.Sans>
          </div>
          <Switch
            className="mt-[calc((1lh-1.875rem)/2)]"
            aria-labelledby="recovery-attempts-label"
            checked={recoveryAttempts}
            disabled={!enabled}
            onCheckedChange={setRecoveryAttempts}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Info aria-hidden />
        <span className="flex-1" aria-live="polite">
          {enabled ? "Critical alerts are sent immediately." : "Security alerts are paused."}
        </span>
        <TextLink className="ml-auto" render={<a href="#api" />}>
          View Docs
        </TextLink>
      </CardFooter>
    </Card>
  );
}
