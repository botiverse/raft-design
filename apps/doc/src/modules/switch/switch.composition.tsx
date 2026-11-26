import { useState } from "react";
import { ListRow, ListRowBody, ListRowGroup, ListRowTitle, Switch } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.switch.states" });
// @docs-source-strip-end

export function SwitchStatesComposition() {
  const [off, setOff] = useState(false);
  const [on, setOn] = useState(true);

  return (
    <ListRowGroup className="w-full max-w-sm">
      <ListRow variant="plain" interactive={false}>
        <ListRowBody>
          <ListRowTitle id="switch-states-off">Off</ListRowTitle>
        </ListRowBody>
        <Switch checked={off} onCheckedChange={setOff} aria-labelledby="switch-states-off" />
      </ListRow>
      <ListRow variant="plain" interactive={false}>
        <ListRowBody>
          <ListRowTitle id="switch-states-on">On</ListRowTitle>
        </ListRowBody>
        <Switch checked={on} onCheckedChange={setOn} aria-labelledby="switch-states-on" />
      </ListRow>
      <ListRow variant="plain" interactive={false}>
        <ListRowBody>
          <ListRowTitle id="switch-states-disabled-off">Disabled, off</ListRowTitle>
        </ListRowBody>
        <Switch checked={false} disabled aria-labelledby="switch-states-disabled-off" />
      </ListRow>
      <ListRow variant="plain" interactive={false}>
        <ListRowBody>
          <ListRowTitle id="switch-states-disabled-on">Disabled, on</ListRowTitle>
        </ListRowBody>
        <Switch checked disabled aria-labelledby="switch-states-disabled-on" />
      </ListRow>
    </ListRowGroup>
  );
}
