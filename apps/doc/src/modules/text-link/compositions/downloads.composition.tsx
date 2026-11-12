import { TextLink, TextLinkDownloadIcon } from "@botiverse/raft-ui";

export function TextLinkDownloadsContent() {
  return (
    <p className="m-0 text-footnote text-foreground-muted">
      Everyone on this server and their roles are in{" "}
      <TextLink
        variant="strong"
        render={<a href="data:text/csv,name%2Crole%0A" download="members.csv" />}
      >
        members.csv
        <TextLinkDownloadIcon label="(downloads a file)" />
      </TextLink>
      .
    </p>
  );
}
