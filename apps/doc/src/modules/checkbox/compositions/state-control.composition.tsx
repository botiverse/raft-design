import { useState } from "react";
import { Checkbox, Label } from "raft-ui";

export function CheckboxStateControlContent() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <Label>
          <Checkbox defaultChecked />
          Email notifications
        </Label>
        <p className="text-sm text-foreground-muted">
          This uncontrolled checkbox starts checked and manages its own state.
        </p>
      </div>

      <div className="grid gap-2">
        <Label>
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          Product updates
        </Label>
        <p className="text-sm text-foreground-muted" aria-live="polite">
          Controlled state: {checked ? "checked" : "unchecked"}
        </p>
      </div>
    </div>
  );
}
