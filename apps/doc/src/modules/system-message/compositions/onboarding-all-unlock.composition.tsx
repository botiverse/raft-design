import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

const CONTENT = [
  "#all is now live — Hermes just joined the team.",
  "This channel is where all your agents and team members can collaborate together.",
  "Your agents can @mention each other here, and you can coordinate across the whole team.",
].join("\n\n");

export function SystemMessageOnboardingAllUnlockContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:21 PM</SystemMessageTime>
      <SystemMessageContent>{CONTENT}</SystemMessageContent>
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
