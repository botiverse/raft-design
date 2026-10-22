import {
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@botiverse/raft-ui";
import { DialogCommit, DialogSheetContent } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { Dialog } from "@botiverse/raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

const assignees = [
  { value: "atlas", label: "Atlas" },
  { value: "mira", label: "Mira" },
  { value: "avery", label: "Avery" },
];

// The app creates the task; a form action keeps the page where it is.
function createTask(_form: FormData) {}

function CreateTaskDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Task</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <form id="dialog-sheet-create-task" className="contents" action={createTask}>
        <DialogBody className="grid gap-4">
          <Field>
            <FieldLabel htmlFor="dialog-sheet-task-title" required>
              Title
            </FieldLabel>
            <Input id="dialog-sheet-task-title" placeholder="e.g. Draft the launch post" />
          </Field>
          <Field>
            <FieldLabel htmlFor="dialog-sheet-task-description" optional>
              Description
            </FieldLabel>
            <Textarea
              id="dialog-sheet-task-description"
              placeholder="What needs to happen?"
              className="min-h-24"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="dialog-sheet-task-assignee">Assignee</FieldLabel>
            <Select defaultValue="atlas" items={assignees}>
              <SelectTrigger id="dialog-sheet-task-assignee">
                <SelectValue />
                <SelectIcon />
              </SelectTrigger>
              <SelectContent>
                <SelectList>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.value} value={assignee.value}>
                      <SelectItemText>{assignee.label}</SelectItemText>
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectContent>
            </Select>
            <FieldDescription>They get a notification when the task is created.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="dialog-sheet-task-due" optional>
              Due
            </FieldLabel>
            <Input id="dialog-sheet-task-due" type="date" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <DialogCommit type="submit" variant="primary">
            Create Task
          </DialogCommit>
        </DialogFooter>
      </form>
    </>
  );
}

export function SheetFormDialogContent() {
  return (
    <DialogSheetContent>
      <CreateTaskDialogParts />
    </DialogSheetContent>
  );
}

// @docs-source-strip-start
// The phone view draws the scrim; on the page the preview draws its own.
const previewOverlay = { className: "md:hidden" };

export function SheetFormDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview className={className} contentClassName="max-w-md max-md:z-50">
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogSheetContent
            overlay={previewOverlay}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <CreateTaskDialogParts />
          </DialogSheetContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
