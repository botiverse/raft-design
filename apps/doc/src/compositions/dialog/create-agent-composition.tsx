import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "raft-ui/wip";
import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "raft-ui";

// @docs-source-strip-start
import type { RefObject } from "react";
import { useRef } from "react";
import { Dialog } from "raft-ui/wip";
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";

const PREVIEW_CONTENT_CLASS =
  "!relative !top-auto !left-auto !z-0 !w-full !max-w-md !translate-x-0 !translate-y-0";
// @docs-source-strip-end

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
          <Select defaultValue="studio" items={[{ value: "studio", label: "Studio Mac" }]}>
            <SelectTrigger id="dialog-agent-machine">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectList>
                <SelectItem value="studio">
                  <SelectItemText>Studio Mac</SelectItemText>
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
        <div className="grid gap-2 border border-line-subtle bg-layer-panel p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground-strong">Runtime</span>
            <span className="font-mono text-xs text-foreground-muted">codex</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line-subtle pt-2">
            <span className="text-sm font-medium text-foreground-strong">Model</span>
            <span className="font-mono text-xs text-foreground-muted">auto</span>
          </div>
          <button type="button" className="mt-1 text-left text-xs font-medium underline">
            Advanced environment
          </button>
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
            <CreateAgentDialogParts />
          </DialogContent>
        </Dialog>
      </div>
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
