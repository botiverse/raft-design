import { useCallback, useState } from "react";
import {
  Avatar,
  Button,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  TaskStatusBadge,
} from "@botiverse/raft-ui";

const assignees = ["Atlas", "Cali", "Unassigned"] as const;

export function InlineDescriptionListComposition() {
  const [assigneeIndex, setAssigneeIndex] = useState(0);
  const assignee = assignees[assigneeIndex] ?? assignees[0];

  const handleCycleAssignee = useCallback(() => {
    setAssigneeIndex((index) => (index + 1) % assignees.length);
  }, []);

  return (
    <DescriptionList direction="inline" className="w-full max-w-xl">
      <DescriptionItem>
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails>
          <TaskStatusBadge status="in-review">In Review</TaskStatusBadge>
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Assignee</DescriptionTerm>
        <DescriptionDetails>
          <Button
            type="button"
            variant="ghost"
            aria-label={`Change assignee from ${assignee}`}
            onClick={handleCycleAssignee}
          >
            {assignee}
          </Button>
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Source</DescriptionTerm>
        <DescriptionDetails>
          <Avatar size="xs" type="human" />
          <span className="font-semibold">Wang Lei</span>
          <span className="text-foreground-muted">Launch checklist: OG image</span>
          <time className="font-mono text-mono-meta text-foreground-hint">08:53 PM</time>
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Created by</DescriptionTerm>
        <DescriptionDetails>Richard Chien</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}
