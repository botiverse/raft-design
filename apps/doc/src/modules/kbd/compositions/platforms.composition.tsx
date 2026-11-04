import { Text } from "@botiverse/raft-ui";
import { KbdShortcut } from "@botiverse/raft-ui/wip";
import type { KbdKeyName } from "@botiverse/raft-ui/wip";

const SEND_AS_TASK: KbdKeyName[] = ["mod", "shift", "enter"];
const COMMENT: KbdKeyName[] = ["mod", "alt", "m"];
const DELETE_WORD: KbdKeyName[] = ["alt", "backspace"];
const FIRST_MESSAGE: KbdKeyName[] = ["mod", "up"];
const CLOSE: KbdKeyName[] = ["escape"];

export function KbdPlatformsContent() {
  return (
    <div className="grid grid-cols-[max-content_max-content] items-center gap-x-8 gap-y-4">
      {/* @docs-source-strip-start */}
      <Text.Sans size="caption">macOS</Text.Sans>
      <Text.Sans size="caption">Windows and Linux</Text.Sans>
      {/* @docs-source-strip-end */}
      <KbdShortcut keys={SEND_AS_TASK} size="md" platform="mac" />
      <KbdShortcut keys={SEND_AS_TASK} size="md" platform="other" />
      <KbdShortcut keys={COMMENT} size="md" platform="mac" />
      <KbdShortcut keys={COMMENT} size="md" platform="other" />
      <KbdShortcut keys={DELETE_WORD} size="md" platform="mac" />
      <KbdShortcut keys={DELETE_WORD} size="md" platform="other" />
      <KbdShortcut keys={FIRST_MESSAGE} size="md" platform="mac" />
      <KbdShortcut keys={FIRST_MESSAGE} size="md" platform="other" />
      <KbdShortcut keys={CLOSE} size="md" platform="mac" />
      <KbdShortcut keys={CLOSE} size="md" platform="other" />
    </div>
  );
}
