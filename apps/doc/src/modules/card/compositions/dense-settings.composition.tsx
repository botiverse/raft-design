import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Switch,
  Text,
} from "@botiverse/raft-ui";

export function CardDenseSettingsComposition() {
  const [externalLinks, setExternalLinks] = useState(true);
  const [downloads, setDownloads] = useState(true);
  const [sessionArchive, setSessionArchive] = useState(false);

  return (
    <Card variant="inset" className="w-full max-w-md">
      <CardHeader>
        <CardTitle render={<h3 />}>Workspace safeguards</CardTitle>
        <CardDescription>
          Apply shared defaults to links, downloads, and inactive sessions.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex min-w-0 items-start justify-between gap-4 leading-5">
          <div className="min-w-0">
            <Text.Sans render={<h4 id="external-links-label" />} size="small">
              External links
            </Text.Sans>
            <Text.Sans size="caption">Require approval before opening untrusted domains.</Text.Sans>
          </div>
          <Switch
            className="mt-[calc((1lh-1.875rem)/2)]"
            aria-labelledby="external-links-label"
            checked={externalLinks}
            onCheckedChange={setExternalLinks}
          />
        </div>

        <Separator />

        <div className="flex min-w-0 items-start justify-between gap-4 leading-5">
          <div className="min-w-0">
            <Text.Sans render={<h4 id="downloads-label" />} size="small">
              File downloads
            </Text.Sans>
            <Text.Sans size="caption">Block files that have not completed verification.</Text.Sans>
          </div>
          <Switch
            className="mt-[calc((1lh-1.875rem)/2)]"
            aria-labelledby="downloads-label"
            checked={downloads}
            onCheckedChange={setDownloads}
          />
        </div>

        <Separator />

        <div className="flex min-w-0 items-start justify-between gap-4 leading-5">
          <div className="min-w-0">
            <Text.Sans render={<h4 id="session-archive-label" />} size="small">
              Inactive sessions
            </Text.Sans>
            <Text.Sans size="caption">
              Archive sessions after thirty days without activity.
            </Text.Sans>
          </div>
          <Switch
            className="mt-[calc((1lh-1.875rem)/2)]"
            aria-labelledby="session-archive-label"
            checked={sessionArchive}
            onCheckedChange={setSessionArchive}
          />
        </div>
      </CardContent>
    </Card>
  );
}
