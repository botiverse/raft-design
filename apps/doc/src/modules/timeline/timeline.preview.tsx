import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Timeline, TimelineContent, TimelineItem, TimelineTime, TimelineTitle } from "raft-ui";
import type { TimelineProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { PLACEMENTS, SIZES } from "./timeline.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type TimelinePlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function TimelinePlaygroundPreview({ code, collapsedCode }: TimelinePlaygroundPreviewProps) {
  const [size, setSize] = useState<NonNullable<TimelineProps["size"]>>("md");
  const [itemPlacement, setItemPlacement] =
    useState<NonNullable<TimelineProps["itemPlacement"]>>("left");
  const [dashed, setDashed] = useState(false);

  const handleSizeChange = useCallback(
    (value: string) => setSize(value as NonNullable<TimelineProps["size"]>),
    [],
  );
  const handlePlacementChange = useCallback(
    (value: string) => setItemPlacement(value as NonNullable<TimelineProps["itemPlacement"]>),
    [],
  );
  const lineType = dashed ? "dashed" : "solid";

  return (
    <Preview>
      <Preview.Canvas>
        <Timeline size={size} itemPlacement={itemPlacement} className="w-72">
          <TimelineItem lineType={lineType}>
            <TimelineTitle>Draft</TimelineTitle>
            <TimelineContent>Draft opened for review</TimelineContent>
            <TimelineTime>2026-10-01 09:12</TimelineTime>
          </TimelineItem>
          <TimelineItem variant="success" lineType={lineType}>
            <TimelineTitle>Checks</TimelineTitle>
            <TimelineContent>All checks passed</TimelineContent>
            <TimelineTime>2026-10-01 10:40</TimelineTime>
          </TimelineItem>
          <TimelineItem variant="warning" lineType={lineType}>
            <TimelineTitle>Review</TimelineTitle>
            <TimelineContent>One reviewer asked for changes</TimelineContent>
            <TimelineTime>2026-10-01 14:05</TimelineTime>
          </TimelineItem>
          <TimelineItem variant="danger" lineType={lineType}>
            <TimelineTitle>Deploy</TimelineTitle>
            <TimelineContent>Deploy to staging failed</TimelineContent>
            <TimelineTime>2026-10-01 16:30</TimelineTime>
          </TimelineItem>
          <TimelineItem variant="information">
            <TimelineTitle>Release</TimelineTitle>
            <TimelineContent>Waiting on the release window</TimelineContent>
            <TimelineTime>2026-10-02 08:00</TimelineTime>
          </TimelineItem>
        </Timeline>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Size" htmlFor="timeline-preview-size">
          <Preview.Select
            id="timeline-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="Item placement" htmlFor="timeline-preview-placement">
          <Preview.Select
            id="timeline-preview-placement"
            label="Item placement"
            options={PLACEMENTS}
            value={itemPlacement}
            onValueChange={handlePlacementChange}
          />
        </Preview.Control>
        <Preview.Control label="Dashed lines" htmlFor="timeline-preview-dashed">
          <Preview.Checkbox
            id="timeline-preview-dashed"
            label="Dashed lines"
            checked={dashed}
            onCheckedChange={setDashed}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
