import { AvatarImage } from "raft-ui";
import {
  LiveAgentActivityBar,
  LiveAgentActivityBarAvatar,
  LiveAgentActivityBarContent,
  LiveAgentActivityBarRow,
  LiveAgentActivityBarStatus,
  LiveAgentActivityBarText,
  type LiveAgentActivity,
} from "raft-ui/wip";

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
    <LiveAgentActivityBar activity={latest.activity}>
      <LiveAgentActivityBarRow>
        <LiveAgentActivityBarAvatar>
          {latest.agentAvatarSrc ? <AvatarImage src={latest.agentAvatarSrc} alt="" /> : null}
        </LiveAgentActivityBarAvatar>
        <LiveAgentActivityBarContent>
          <LiveAgentActivityBarStatus />
          <LiveAgentActivityBarText title={latest.text}>{latest.text}</LiveAgentActivityBarText>
        </LiveAgentActivityBarContent>
      </LiveAgentActivityBarRow>
    </LiveAgentActivityBar>
  );
}
