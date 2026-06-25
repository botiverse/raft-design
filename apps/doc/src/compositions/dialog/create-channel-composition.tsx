import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import {
  Avatar,
  Banner,
  BannerDescription,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Textarea,
} from "raft-ui";
import { Check, Hash, Lock, Search, X } from "lucide-react";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-md !translate-x-0 !translate-y-0";
// @docs-source-strip-end

const members = [
  { id: "atlas", name: "Atlas", kind: "agent" },
  { id: "avery", name: "Avery", kind: "human" },
  { id: "mira", name: "Mira", kind: "agent" },
];

function CreateChannelDialogParts() {
  return (
    <>
      <DialogHeader className="mb-1 flex-row items-start justify-between gap-3">
        <DialogTitle>Create Channel</DialogTitle>
        <DialogClose render={<Button variant="outline" size="icon-sm" aria-label="Close" />}>
          <X />
        </DialogClose>
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Banner status="warning" size="sm">
          <BannerDescription>
            The name <span className="font-mono">#archive</span> is held by an archived channel.
          </BannerDescription>
        </Banner>
        <Field>
          <FieldLabel htmlFor="dialog-create-channel-name" required>
            Name
          </FieldLabel>
          <Input id="dialog-create-channel-name" placeholder="e.g. ai-research" />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-create-channel-description">Description</FieldLabel>
          <Textarea
            id="dialog-create-channel-description"
            placeholder="What is this channel about?"
            className="min-h-16"
          />
        </Field>
        <Field>
          <FieldLabel>Visibility</FieldLabel>
          <SegmentedControl defaultValue="public" ariaLabel="Channel visibility">
            <SegmentedControlItem value="public">
              <Hash />
              <SegmentedControlLabel>Public</SegmentedControlLabel>
            </SegmentedControlItem>
            <SegmentedControlItem value="private">
              <Lock />
              <SegmentedControlLabel>Private</SegmentedControlLabel>
            </SegmentedControlItem>
          </SegmentedControl>
        </Field>
        <Field>
          <FieldLabel>Members</FieldLabel>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
            <Input placeholder="Search members by name" className="pl-9" />
          </div>
          <div className="grid overflow-hidden border border-line-subtle bg-layer-panel">
            {members.map((member) => (
              <button
                key={member.id}
                type="button"
                className="flex items-center gap-2 border-b border-line-subtle px-3 py-2 text-left text-sm last:border-b-0 data-[selected=true]:bg-primary/15"
                data-selected={member.id !== "avery" ? "true" : undefined}
              >
                <Avatar type={member.kind === "agent" ? "agent" : "human"} size="xs" />
                <span className="min-w-0 flex-1 truncate">{member.name}</span>
                {member.id !== "avery" ? <Check className="size-4" /> : null}
              </button>
            ))}
          </div>
          <FieldDescription>
            Select the people and agents that should join immediately.
          </FieldDescription>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent">Create Channel</Button>
      </DialogFooter>
    </>
  );
}

export function CreateChannelDialogContent() {
  return (
    <DialogContent>
      <CreateChannelDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function CreateChannelDialogComposition({ className }: { className?: string }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <SourceComparisonPreview className={className}>
      <div ref={portalRef} className="relative min-w-0 w-full max-w-full max-w-md">
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            className={PREVIEW_CONTENT_CLASS}
          >
            <CreateChannelDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
