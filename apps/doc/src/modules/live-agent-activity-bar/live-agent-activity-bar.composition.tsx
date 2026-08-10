import {
  AvatarImage,
  LiveAgentActivityBar,
  LiveAgentActivityBarAvatar,
  LiveAgentActivityBarContent,
  LiveAgentActivityBarRow,
  LiveAgentActivityBarStatus,
  LiveAgentActivityBarText,
} from "raft-ui";

export type LiveAgentActivityBarItem = {
  agentAvatarSrc?: string | null;
  text: string;
};

export function LiveAgentActivityBarComposition({
  beam,
  latest,
}: {
  beam?: boolean;
  latest: LiveAgentActivityBarItem | null;
}) {
  return (
    <LiveAgentActivityBar beam={beam}>
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
