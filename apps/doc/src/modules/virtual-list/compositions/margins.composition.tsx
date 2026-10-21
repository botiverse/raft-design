import { VirtualList } from "@botiverse/raft-ui/wip";
import type { VirtualListItemRenderProps } from "@botiverse/raft-ui/wip";

import { createReleaseNotes } from "../virtual-list.fixtures.ts";
import type { ReleaseNote } from "../virtual-list.fixtures.ts";

const RELEASES = createReleaseNotes(500);
const getKey = (release: ReleaseNote) => release.id;

// The heading's top margin and the list's bottom margin collapse through the section, and with the
// next section's, exactly as they would outside a VirtualList.
function renderRelease({ item, domRef, style }: VirtualListItemRenderProps<ReleaseNote>) {
  return (
    <section key={item.id} ref={domRef} style={style} className="px-4">
      <h3 className="mt-6 mb-2 text-subhead font-bold text-foreground">Version {item.version}</h3>
      <ul className="my-4 list-disc pl-5 text-callout text-foreground-muted">
        {item.changes.map((change) => (
          <li key={change}>{change}</li>
        ))}
      </ul>
    </section>
  );
}

export function VirtualListMarginsContent() {
  return (
    <div className="h-90 w-full max-w-xl overflow-hidden rounded-container border border-line-hairline">
      <VirtualList
        items={RELEASES}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={96}
        itemMinSize={48}
      >
        {renderRelease}
      </VirtualList>
    </div>
  );
}
