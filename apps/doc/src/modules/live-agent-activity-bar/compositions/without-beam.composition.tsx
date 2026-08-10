import {
  LiveAgentActivityBar,
  LiveAgentActivityBarAvatar,
  LiveAgentActivityBarContent,
  LiveAgentActivityBarRow,
  LiveAgentActivityBarStatus,
  LiveAgentActivityBarText,
} from "raft-ui";

export function LiveAgentActivityBarWithoutBeamComposition() {
  return (
    <LiveAgentActivityBar beam={false}>
      <LiveAgentActivityBarRow>
        <LiveAgentActivityBarAvatar />
        <LiveAgentActivityBarContent>
          <LiveAgentActivityBarStatus />
          <LiveAgentActivityBarText title="Reviewing release notes…">
            Reviewing release notes…
          </LiveAgentActivityBarText>
        </LiveAgentActivityBarContent>
      </LiveAgentActivityBarRow>
    </LiveAgentActivityBar>
  );
}
