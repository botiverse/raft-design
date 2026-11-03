import { Kbd } from "@botiverse/raft-ui";
import { KbdShortcut } from "@botiverse/raft-ui/wip";
import type { KbdKeyName } from "@botiverse/raft-ui/wip";

const SEND_AS_TASK: KbdKeyName[] = ["mod", "shift", "enter"];
const SEARCH: KbdKeyName[] = ["mod", "k"];

export function KbdSizesContent() {
  return (
    <div className="grid grid-cols-[max-content_max-content] items-center gap-x-8 gap-y-4">
      <KbdShortcut keys={SEND_AS_TASK} platform="mac" />
      <KbdShortcut keys={SEND_AS_TASK} size="md" platform="mac" />
      <KbdShortcut keys={SEARCH} platform="mac" />
      <KbdShortcut keys={SEARCH} size="md" platform="mac" />
      <Kbd>Esc</Kbd>
      <Kbd size="md">Esc</Kbd>
    </div>
  );
}
