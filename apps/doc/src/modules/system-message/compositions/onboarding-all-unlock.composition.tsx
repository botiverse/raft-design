import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageOnboardingAllUnlockContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:21 PM</SystemMessageTime>
      <SystemMessageContent>
        {SYSTEM_MESSAGE_FIXTURES.onboardingAllUnlock.content}
      </SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageOnboardingAllUnlockComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageOnboardingAllUnlockContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
