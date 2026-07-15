import { AvatarImage } from "raft-ui";
import {
  LiveAgentActivityBar,
  LiveAgentActivityBarAvatar,
  LiveAgentActivityBarContent,
  LiveAgentActivityBarRow,
  LiveAgentActivityBarStatus,
  LiveAgentActivityBarText,
} from "raft-ui/wip";

export type LiveAgentActivityBarItem = {
  agentAvatarSrc?: string | null;
  text: string;
};

export function LiveAgentActivityBarComposition({
  latest,
}: {
  latest: LiveAgentActivityBarItem | null;
}) {
  return (
    <LiveAgentActivityBar>
      {latest ? (
        <LiveAgentActivityBarRow>
          <LiveAgentActivityBarAvatar>
            {latest.agentAvatarSrc ? <AvatarImage src={latest.agentAvatarSrc} alt="" /> : null}
          </LiveAgentActivityBarAvatar>
          <LiveAgentActivityBarContent>
            <LiveAgentActivityBarStatus />
            <LiveAgentActivityBarText title={latest.text}>{latest.text}</LiveAgentActivityBarText>
          </LiveAgentActivityBarContent>
        </LiveAgentActivityBarRow>
      ) : null}
    </LiveAgentActivityBar>
  );
}
