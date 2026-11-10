import { useState } from "react";
import { Type } from "lucide-react";
import {
  ListRow,
  ListRowBody,
  ListRowGroup,
  ListRowTitle,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Switch,
} from "@botiverse/raft-ui";

const PREVIEW_SIZE = { small: "text-callout", medium: "text-body", large: "text-headline" };

export function ListRowGroupsComposition() {
  const [fontSize, setFontSize] = useState<keyof typeof PREVIEW_SIZE>("medium");
  const [activity, setActivity] = useState(true);
  const [model, setModel] = useState(false);
  const [hideEmpty, setHideEmpty] = useState(false);

  return (
    <section aria-labelledby="list-row-appearance" className="w-full max-w-lg">
      <h3
        id="list-row-appearance"
        className="mb-3 flex items-center gap-2 text-footnote font-bold text-foreground-hint"
      >
        <Type className="size-4" aria-hidden />
        Appearance
      </h3>
      <div className="stack-y-3">
        <ListRowGroup className="@container">
          <ListRow variant="plain" interactive={false} className="@max-lg:flex-wrap">
            <ListRowBody>
              <ListRowTitle id="list-row-font-size">Message font size</ListRowTitle>
            </ListRowBody>
            <div className="shrink-0 @max-lg:basis-full">
              <SegmentedControl
                aria-labelledby="list-row-font-size"
                value={fontSize}
                onValueChange={setFontSize}
              >
                <SegmentedControlItem value="small">
                  <SegmentedControlLabel>Small</SegmentedControlLabel>
                </SegmentedControlItem>
                <SegmentedControlItem value="medium">
                  <SegmentedControlLabel>Medium</SegmentedControlLabel>
                </SegmentedControlItem>
                <SegmentedControlItem value="large">
                  <SegmentedControlLabel>Large</SegmentedControlLabel>
                </SegmentedControlItem>
              </SegmentedControl>
            </div>
          </ListRow>
          <ListRow variant="plain" interactive={false} attached>
            <div
              role="group"
              aria-label="Message preview"
              className={`min-w-0 flex-1 rounded-control bg-layer-canvas px-3 py-2 text-foreground ${PREVIEW_SIZE[fontSize]}`}
            >
              <b>Wug</b> Release notes are drafted. I&apos;ll post them in #launch after review.
            </div>
          </ListRow>
        </ListRowGroup>

        <ListRowGroup>
          <ListRow variant="plain" interactive={false}>
            <ListRowBody>
              <ListRowTitle id="list-row-activity">Live agent activity</ListRowTitle>
            </ListRowBody>
            <Switch
              checked={activity}
              onCheckedChange={setActivity}
              aria-labelledby="list-row-activity"
            />
          </ListRow>
          <ListRow variant="plain" interactive={false}>
            <ListRowBody>
              <ListRowTitle id="list-row-model">Show agent model</ListRowTitle>
            </ListRowBody>
            <Switch checked={model} onCheckedChange={setModel} aria-labelledby="list-row-model" />
          </ListRow>
          <ListRow variant="plain" interactive={false}>
            <ListRowBody>
              <ListRowTitle id="list-row-hide-empty">Hide empty sidebar sections</ListRowTitle>
            </ListRowBody>
            <Switch
              checked={hideEmpty}
              onCheckedChange={setHideEmpty}
              aria-labelledby="list-row-hide-empty"
            />
          </ListRow>
        </ListRowGroup>
      </div>
    </section>
  );
}
