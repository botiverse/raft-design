import { SegmentedControlLabel } from "@botiverse/raft-ui";
import { SegmentedControlLink, SegmentedControlNav } from "@botiverse/raft-ui/wip";

export function SegmentedControlLanguageLinksComposition() {
  return (
    <SegmentedControlNav aria-label="Language">
      <SegmentedControlLink current href="/components/segmented-control" hrefLang="en" lang="en">
        <SegmentedControlLabel>English</SegmentedControlLabel>
      </SegmentedControlLink>
      <SegmentedControlLink
        href="/zh/components/segmented-control"
        hrefLang="zh-Hans"
        lang="zh-Hans"
      >
        <SegmentedControlLabel>简体中文</SegmentedControlLabel>
      </SegmentedControlLink>
    </SegmentedControlNav>
  );
}
