import { useState } from "react";
import {
  Input,
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowTitle,
  Switch,
} from "@botiverse/raft-ui";

export function ListRowAttachedComposition() {
  const [quietHours, setQuietHours] = useState(true);
  const [previews, setPreviews] = useState(true);

  return (
    <ListRowGroup className="w-full max-w-md">
      <ListRow variant="plain" interactive={false}>
        <ListRowBody>
          <ListRowTitle id="list-row-quiet-hours">Quiet hours</ListRowTitle>
          <ListRowDescription wrap>
            Every day between these times, nothing alerts on any of your devices.
          </ListRowDescription>
        </ListRowBody>
        <Switch
          checked={quietHours}
          onCheckedChange={setQuietHours}
          aria-labelledby="list-row-quiet-hours"
        />
      </ListRow>
      {quietHours ? (
        <ListRow variant="plain" interactive={false} attached>
          <ListRowBody>
            <span className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-footnote text-foreground-muted">
                Start time
                <Input type="time" defaultValue="22:00" className="w-36" />
              </label>
              <label className="flex items-center gap-2 text-footnote text-foreground-muted">
                End time
                <Input type="time" defaultValue="08:00" className="w-36" />
              </label>
            </span>
          </ListRowBody>
        </ListRow>
      ) : null}
      <ListRow variant="plain" interactive={false}>
        <ListRowBody>
          <ListRowTitle id="list-row-previews">Show message previews</ListRowTitle>
          <ListRowDescription wrap>
            Notifications show who wrote and the first line.
          </ListRowDescription>
        </ListRowBody>
        <Switch
          checked={previews}
          onCheckedChange={setPreviews}
          aria-labelledby="list-row-previews"
        />
      </ListRow>
    </ListRowGroup>
  );
}
