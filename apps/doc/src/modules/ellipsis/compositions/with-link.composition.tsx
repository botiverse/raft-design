import { Ellipsis, EllipsisToggle } from "@botiverse/raft-ui/wip";
import type { EllipsisState } from "@botiverse/raft-ui/wip";

function showMore({ expanded }: EllipsisState) {
  return <EllipsisToggle>{expanded ? "Show Less" : "Show More"}</EllipsisToggle>;
}

export function EllipsisWithLinkContent() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 text-callout">
      <Ellipsis lines={2} expandOnClick tooltip={false}>
        Plain text can expand where it is clicked: this one has no link or button inside it, so the
        whole text becomes the control that shows the rest.
      </Ellipsis>
      <Ellipsis lines={2} expandOnClick tooltip={false} after={showMore}>
        Frontend for the web client. Read the{" "}
        <a className="text-foreground-link underline-offset-2 hover:underline" href="#guide">
          contributing guide
        </a>{" "}
        before you open a pull request, and post in the release channel when a change needs a note
        in the changelog.
      </Ellipsis>
    </div>
  );
}
