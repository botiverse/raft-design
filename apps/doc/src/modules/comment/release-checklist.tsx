import {
  MarkdownBlockquote,
  MarkdownHeading,
  MarkdownList,
  MarkdownListItem,
  MarkdownOrderedList,
  MarkdownParagraph,
} from "@botiverse/raft-ui";

/** The document the comment examples are about: a Markdown file open in the viewer. */
export function ReleaseChecklist() {
  return (
    <div className="text-body text-foreground">
      <MarkdownHeading level={1}>Release checklist</MarkdownHeading>
      <MarkdownParagraph>
        What has to happen before the 0.11 release ships, and who signs off on each step.
      </MarkdownParagraph>
      <MarkdownHeading level={2}>Scope</MarkdownHeading>
      <MarkdownParagraph>
        0.11 brings comments to the file viewer and moves uploads to the new storage path.
      </MarkdownParagraph>
      <MarkdownList>
        <MarkdownListItem>Web and mobile web</MarkdownListItem>
        <MarkdownListItem>The public API, read-only for now</MarkdownListItem>
      </MarkdownList>
      <MarkdownHeading level={2}>Before the freeze</MarkdownHeading>
      <MarkdownList>
        <MarkdownListItem>Merge the viewer toolbar fixes</MarkdownListItem>
        <MarkdownListItem>Re-run the guard suites on staging</MarkdownListItem>
        <MarkdownListItem>Update the changelog</MarkdownListItem>
      </MarkdownList>
      <MarkdownHeading level={2}>Rollout</MarkdownHeading>
      <MarkdownParagraph>
        Bugen runs the rollout and Martin signs off on each step. A step starts only once the one
        before it is done.
      </MarkdownParagraph>
      <MarkdownOrderedList>
        <MarkdownListItem>Ship to staging and watch the error rate for an hour.</MarkdownListItem>
        <MarkdownListItem>Turn the flag on in #launch-week.</MarkdownListItem>
        <MarkdownListItem>Roll out to everyone.</MarkdownListItem>
      </MarkdownOrderedList>
      <MarkdownBlockquote>
        Keep the old path behind the flag until the release has been stable for a week.
      </MarkdownBlockquote>
    </div>
  );
}
