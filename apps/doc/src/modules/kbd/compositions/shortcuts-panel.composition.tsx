import { Text } from "@botiverse/raft-ui";
import { KbdShortcut } from "@botiverse/raft-ui/wip";
import type { KbdKeyName } from "@botiverse/raft-ui/wip";

const SEARCH: KbdKeyName[] = ["mod", "k"];
const NEW_LINE: KbdKeyName[] = ["shift", "enter"];
const SEND_AS_TASK: KbdKeyName[] = ["mod", "shift", "enter"];
const FIRST_MESSAGE: KbdKeyName[] = ["mod", "up"];
const LAST_MESSAGE: KbdKeyName[] = ["mod", "down"];

export function KbdShortcutsPanelContent() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Text.Sans>Search</Text.Sans>
          <Text.Sans size="small">Anywhere, even while typing</Text.Sans>
        </div>
        <KbdShortcut keys={SEARCH} size="md" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Text.Sans>New line</Text.Sans>
          <Text.Sans size="small">Enter alone sends</Text.Sans>
        </div>
        <KbdShortcut keys={NEW_LINE} size="md" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Text.Sans>Send as task</Text.Sans>
          <Text.Sans size="small">In #launch-week</Text.Sans>
        </div>
        <KbdShortcut keys={SEND_AS_TASK} size="md" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Text.Sans>Jump to the first or last message</Text.Sans>
          <Text.Sans size="small">With the message list focused</Text.Sans>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <KbdShortcut keys={FIRST_MESSAGE} size="md" />
          <Text.Sans render={<span aria-hidden="true" />} size="caption" variant="placeholder">
            /
          </Text.Sans>
          <span className="sr-only">or</span>
          <KbdShortcut keys={LAST_MESSAGE} size="md" />
        </span>
      </div>
    </div>
  );
}
