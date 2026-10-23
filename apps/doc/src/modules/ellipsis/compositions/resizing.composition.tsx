import { Ellipsis } from "@botiverse/raft-ui/wip";

export function EllipsisResizingContent() {
  return (
    <div className="w-72 max-w-full min-w-24 resize-x overflow-hidden rounded-container border border-line-hairline p-3">
      <div className="flex min-w-0 flex-col gap-2 text-callout">
        <Ellipsis>Design review: sidebar, rail and the new inbox</Ellipsis>
        <Ellipsis lines={2}>
          Drag the corner to make this box narrower or wider. Each text is measured again as its box
          changes size, so the tooltip opens only while a text is cut.
        </Ellipsis>
      </div>
    </div>
  );
}
