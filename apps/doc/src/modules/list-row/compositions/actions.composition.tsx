import { useCallback, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Archive, DoorOpen, Link, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ListRow,
  ListRowBody,
  ListRowGroup,
  ListRowIcon,
  ListRowTitle,
  helperText,
} from "@botiverse/raft-ui";

// @docs-source-strip-start
import { vcase } from "#/lib/vcase.ts";

export const meta = vcase({ id: "ui.list-row.actions" });
// @docs-source-strip-end

type Action = "archive" | "leave" | "delete";

const CONFIRM = {
  archive: {
    title: "Archive #launch-week?",
    body: helperText("No one can post in it until it is unarchived.", {
      why: "audience",
      about: "channel",
    }),
    verb: "Archive",
    variant: "warning",
  },
  leave: {
    title: "Leave #launch-week?",
    body: helperText("You can join it again from Browse.", { why: "recovery", about: "channel" }),
    verb: "Leave",
    variant: "warning",
  },
  delete: {
    title: "Delete #launch-week?",
    body: helperText("Its messages and files are deleted for everyone. This can't be undone.", {
      why: "consequence",
      about: "channel",
    }),
    verb: "Delete channel",
    variant: "danger",
  },
} as const;

export function ListRowActionsComposition() {
  const [action, setAction] = useState<Action>("delete");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => setCopied(true), []);
  const handleConfirm = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAction(event.currentTarget.value as Action);
    setOpen(true);
  }, []);
  const confirm = CONFIRM[action];
  // The confirmation opens inside the example, in its theme.
  const rootRef = useRef<HTMLDivElement>(null);
  const portalProps = useMemo(() => ({ container: rootRef }), []);

  return (
    <div ref={rootRef} className="w-full max-w-sm">
      <ListRowGroup>
        <ListRow variant="plain" action onClick={handleCopy}>
          <ListRowIcon>
            <Link />
          </ListRowIcon>
          <ListRowBody>
            <ListRowTitle>{copied ? "Link copied" : "Copy link"}</ListRowTitle>
          </ListRowBody>
        </ListRow>
        <ListRow variant="plain" action value="archive" onClick={handleConfirm}>
          <ListRowIcon>
            <Archive />
          </ListRowIcon>
          <ListRowBody>
            <ListRowTitle>Archive channel</ListRowTitle>
          </ListRowBody>
        </ListRow>
        <ListRow variant="plain" action value="leave" onClick={handleConfirm}>
          <ListRowIcon>
            <DoorOpen />
          </ListRowIcon>
          <ListRowBody>
            <ListRowTitle>Leave channel</ListRowTitle>
          </ListRowBody>
        </ListRow>
        <ListRow variant="plain" action tone="danger" value="delete" onClick={handleConfirm}>
          <ListRowIcon>
            <Trash2 />
          </ListRowIcon>
          <ListRowBody>
            <ListRowTitle>Delete channel</ListRowTitle>
          </ListRowBody>
        </ListRow>
      </ListRowGroup>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm" portalProps={portalProps}>
          <DialogHeader>
            <DialogTitle>{confirm.title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription>{confirm.body}</DialogDescription>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" size="lg" />}>Cancel</DialogClose>
            <DialogClose render={<Button variant={confirm.variant} size="lg" />}>
              {confirm.verb}
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
