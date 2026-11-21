import { Button } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.button.preview" });
// @docs-source-strip-end

export function ButtonPreviewContent() {
  return <Button size="md">Button</Button>;
}
