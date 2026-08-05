import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardTitleText,
  Separator,
  Switch,
  Text,
} from "raft-ui";

export function CardDenseSettingsComposition() {
  const [externalLinks, setExternalLinks] = useState(true);
  const [downloads, setDownloads] = useState(true);
  const [sessionArchive, setSessionArchive] = useState(false);

  return (
    <Card variant="inset" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <CardTitleText render={<h3 />}>Workspace safeguards</CardTitleText>
        </CardTitle>
        <CardDescription>
          Apply shared defaults to links, downloads, and inactive sessions.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <div className="min-w-0">
            <Text.Sans render={<h4 id="external-links-label" />} size="small">
              External links
            </Text.Sans>
            <Text.Sans size="caption">Require approval before opening untrusted domains.</Text.Sans>
          </div>
          <Switch
            aria-labelledby="external-links-label"
            checked={externalLinks}
            onCheckedChange={setExternalLinks}
          />
        </div>

        <Separator />

        <div className="flex min-w-0 items-center justify-between gap-4">
          <div className="min-w-0">
            <Text.Sans render={<h4 id="downloads-label" />} size="small">
              File downloads
            </Text.Sans>
            <Text.Sans size="caption">Block files that have not completed verification.</Text.Sans>
          </div>
          <Switch
            aria-labelledby="downloads-label"
            checked={downloads}
            onCheckedChange={setDownloads}
          />
        </div>

        <Separator />

        <div className="flex min-w-0 items-center justify-between gap-4">
          <div className="min-w-0">
            <Text.Sans render={<h4 id="session-archive-label" />} size="small">
              Inactive sessions
            </Text.Sans>
            <Text.Sans size="caption">
              Archive sessions after thirty days without activity.
            </Text.Sans>
          </div>
          <Switch
            aria-labelledby="session-archive-label"
            checked={sessionArchive}
            onCheckedChange={setSessionArchive}
          />
        </div>
      </CardContent>
    </Card>
  );
}
