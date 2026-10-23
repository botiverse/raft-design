import { TextLink, TextLinkExternalIcon } from "@botiverse/raft-ui";

export function TextLinkLeavingRaftContent() {
  return (
    <p className="m-0 text-footnote text-foreground-muted">
      Seats and limits for each plan are on{" "}
      <TextLink
        variant="strong"
        render={<a href="https://raft.build/pricing" target="_blank" rel="noopener noreferrer" />}
      >
        Pricing
        <TextLinkExternalIcon label="(opens in a new tab)" />
      </TextLink>
      .
    </p>
  );
}
