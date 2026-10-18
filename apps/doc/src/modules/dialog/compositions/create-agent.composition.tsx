import {
  DialogBody,
  DialogClose,
  DialogContent,
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
} from "raft-ui";

// @docs-source-strip-start
import { Dialog } from "raft-ui";
import { CompositionModalPreview } from "#/components/composition-preview.tsx";

// @docs-source-strip-end

const machineItems = [{ value: "studio", label: "Studio Mac (atlas.local)" }];

function CreateAgentDialogParts() {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Create Agent</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="dialog-agent-machine" required>
            Computer
          </FieldLabel>
          <Select defaultValue="studio" items={machineItems}>
            <SelectTrigger id="dialog-agent-machine">
              <SelectValue />
              <SelectIcon />
            </SelectTrigger>
            <SelectContent>
              <SelectList>
                <SelectItem value="studio">
                  <SelectItemText>Studio Mac (atlas.local)</SelectItemText>
                </SelectItem>
              </SelectList>
            </SelectContent>
          </Select>
          <FieldDescription>Suggested by the action card.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-agent-name" required>
            Name
          </FieldLabel>
          <Input id="dialog-agent-name" placeholder="e.g. Alice" suppressPasswordManager />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-agent-role" optional>
            Description
          </FieldLabel>
          <Textarea
            id="dialog-agent-role"
            placeholder="Leave blank for a general-purpose agent, or describe a role..."
            className="min-h-20"
          />
          <div className="text-right font-mono text-xs text-foreground-muted">0/240</div>
        </Field>
        <div className="grid gap-2 rounded-md border border-line-muted bg-layer-panel p-3 shadow-none">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">Runtime</span>
            <span className="font-mono text-xs text-foreground-muted">codex</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line-muted pt-2">
            <span className="text-sm font-medium text-foreground">Model</span>
            <span className="font-mono text-xs text-foreground-muted">auto</span>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="mt-1 justify-self-start px-0 text-xs underline underline-offset-2"
          >
            Advanced environment
          </Button>
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent">Create Agent</Button>
      </DialogFooter>
    </>
  );
}

export function CreateAgentDialogContent() {
  return (
    <DialogContent>
      <CreateAgentDialogParts />
    </DialogContent>
  );
}

// @docs-source-strip-start
export function CreateAgentDialogComposition({ className }: { className?: string }) {
  return (
    <CompositionModalPreview
      className={className}
      contentClassName="max-w-md"
      portalClassName="px-0"
    >
      {({ portalProps, contentClassName }) => (
        <Dialog open modal={false}>
          <DialogContent
            overlay={false}
            initialFocus={false}
            finalFocus={false}
            portalProps={portalProps}
            className={contentClassName}
          >
            <CreateAgentDialogParts />
          </DialogContent>
        </Dialog>
      )}
    </CompositionModalPreview>
  );
}
// @docs-source-strip-end
