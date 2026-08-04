import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Avatar,
  Banner,
  BannerDescription,
  Button,
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Textarea,
  useThemeFamily,
} from "raft-ui";
import { Hash, Lock, Search } from "lucide-react";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { SourceComparisonModalPreview } from "#/components/source-comparison-preview.tsx";

// @docs-source-strip-end

const members = [
  { id: "atlas", name: "Atlas", kind: "agent" },
  { id: "avery", name: "Avery", kind: "human" },
  { id: "mira", name: "Mira", kind: "agent" },
] as const;

type DialogMember = (typeof members)[number];

function CreateChannelDialogParts() {
  const theme = useThemeFamily();
  const archiveActionSize = theme === "brutal" ? "sm" : "xs";

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Channel</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Banner status="warning" size="sm">
          <BannerDescription className="grid gap-2">
            <span className="font-medium">
              The name <span className="font-mono font-bold">#archive</span> is held by an archived
              channel.
            </span>
            <span>Unarchive it to keep its history, or choose a different name.</span>
            <span className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="accent" size={archiveActionSize}>
                Unarchive
              </Button>
              <Button type="button" variant="outline" size={archiveActionSize}>
                Change name
              </Button>
            </span>
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
          <Combobox<DialogMember, true>
            multiple
            autoHighlight
            items={members}
            defaultValue={[members[0], members[2]]}
            isItemEqualToValue={(item, value) => item.id === value.id}
            itemToStringLabel={(member) => member.name}
          >
            <ComboboxControl className="w-full">
              <Search className="text-foreground-muted [[data-theme=brutal]_&]:!stroke-2 [[data-theme=brutal]_&_*]:!stroke-2" />
              <ComboboxInput
                aria-label="Search members"
                placeholder="Search members by name"
                suppressPasswordManager
              />
            </ComboboxControl>
            <ComboboxContent className="w-[var(--anchor-width)]">
              <ComboboxList className="max-h-none">
                {(member: DialogMember) => (
                  <ComboboxItem key={member.id} value={member}>
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar type={member.kind === "agent" ? "agent" : "human"} size="xs" />
                      <span className="min-w-0 truncate">{member.name}</span>
                    </span>
                    <ComboboxItemIndicator />
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
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
  return (
    <SourceComparisonModalPreview className={className} contentClassName="max-w-md">
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <CreateChannelDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </SourceComparisonModalPreview>
  );
}
// @docs-source-strip-end
