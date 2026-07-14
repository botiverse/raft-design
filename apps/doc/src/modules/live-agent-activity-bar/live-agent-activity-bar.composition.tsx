import { LiveAgentActivityBar, type LiveAgentActivity } from "raft-ui/wip";

export type LiveAgentActivityBarItem = {
  activity: LiveAgentActivity;
  agentAvatarSrc?: string | null;
  text: string;
};

export function LiveAgentActivityBarComposition({
  latest,
}: {
  latest: LiveAgentActivityBarItem | null;
}) {
  if (!latest) return null;

  return (
    <LiveAgentActivityBar activity={latest.activity} agentAvatarSrc={latest.agentAvatarSrc}>
      {latest.text}
    </LiveAgentActivityBar>
  );
}
