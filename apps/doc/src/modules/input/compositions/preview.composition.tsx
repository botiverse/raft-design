import { Input } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.input.preview" });
// @docs-source-strip-end

export function InputPreviewContent() {
  return <Input className="w-80" placeholder="you@example.com" />;
}
