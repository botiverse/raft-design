import { useCallback, useMemo, useRef, useState } from "react";
import type { ChangeEvent, RefObject } from "react";
import {
  Banner,
  BannerDescription,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "raft-ui";
import type { DialogContentProps } from "raft-ui";
import { Plus, Trash2, X } from "lucide-react";

const DEFAULT_INITIAL_TITLES = [""];

type TaskTitleRowValue = {
  id: string;
  title: string;
};

function TaskTitleRow({
  index,
  removable,
  row,
  onRemove,
  onTitleChange,
}: {
  index: number;
  removable: boolean;
  row: TaskTitleRowValue;
  onRemove: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
}) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onTitleChange(row.id, event.target.value),
    [onTitleChange, row.id],
  );
  const handleRemove = useCallback(() => onRemove(row.id), [onRemove, row.id]);

  return (
    <div className="mb-1 flex min-w-0 items-center gap-1">
      <Input
        aria-label={`Task ${index + 1} title`}
        value={row.title}
        placeholder={`Task ${index + 1}`}
        autoFocus={index === 0}
        onChange={handleChange}
      />
      {removable ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Remove task ${index + 1}`}
          onClick={handleRemove}
        >
          <Trash2 aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}

export function CreateTaskDialogComposition({
  open,
  onOpenChange,
  portalRef,
  onCreate,
  initialTitles = DEFAULT_INITIAL_TITLES,
  forceError,
  forceSubmitting = false,
  preview = false,
  portalProps,
  contentClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portalRef?: RefObject<HTMLElement | null>;
  onCreate?: (titles: readonly string[]) => void | Promise<void>;
  initialTitles?: readonly string[];
  forceError?: string;
  forceSubmitting?: boolean;
  preview?: boolean;
  portalProps?: DialogContentProps["portalProps"];
  contentClassName?: string;
}) {
  const nextRowId = useRef(initialTitles.length);
  const [rows, setRows] = useState<TaskTitleRowValue[]>(() =>
    initialTitles.map((title, index) => ({ id: `initial-${index}`, title })),
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = forceSubmitting || submitting;
  const isBatch = rows.length > 1;
  const resetForm = useCallback(() => {
    nextRowId.current = initialTitles.length;
    setRows(initialTitles.map((title, index) => ({ id: `initial-${index}`, title })));
    setError("");
    setSubmitting(false);
  }, [initialTitles]);
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetForm();
      onOpenChange(nextOpen);
    },
    [onOpenChange, resetForm],
  );
  const handleTitleChange = useCallback((id: string, title: string) => {
    setRows((current) => current.map((item) => (item.id === id ? { ...item, title } : item)));
  }, []);
  const handleRemoveRow = useCallback((id: string) => {
    setRows((current) => current.filter((item) => item.id !== id));
  }, []);
  const handleAddRow = useCallback(() => {
    const id = `row-${nextRowId.current}`;
    nextRowId.current += 1;
    setRows((current) => [...current, { id, title: "" }]);
  }, []);
  const resolvedPortalProps = useMemo(
    () => portalProps ?? (portalRef ? { container: portalRef } : undefined),
    [portalProps, portalRef],
  );

  return (
    <Dialog open={open} modal={!preview} disablePointerDismissal onOpenChange={handleOpenChange}>
      <DialogContent
        overlay={preview ? false : undefined}
        initialFocus={preview ? false : undefined}
        finalFocus={preview ? false : undefined}
        className={contentClassName ?? "max-w-md"}
        portalProps={resolvedPortalProps}
      >
        <DialogHeader>
          <DialogTitle>{isBatch ? "Create Tasks" : "Create Task"}</DialogTitle>
          <DialogClose aria-label="Close Create Task dialog">
            <X aria-hidden />
          </DialogClose>
        </DialogHeader>
        <form
          className="contents"
          onSubmit={async (event) => {
            event.preventDefault();
            const nonEmpty = rows.flatMap((row) => {
              const title = row.title.trim();
              return title ? [title] : [];
            });
            if (nonEmpty.length === 0) {
              setError("At least one task title is required");
              return;
            }
            setError("");
            setSubmitting(true);
            try {
              await onCreate?.(nonEmpty);
              handleOpenChange(false);
            } catch {
              setError("Failed to create task");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <DialogBody className="grid gap-4">
            {forceError || error ? (
              <Banner status="warning" size="sm" role="alert">
                <BannerDescription className="font-bold">{forceError || error}</BannerDescription>
              </Banner>
            ) : null}
            <div>
              {rows.map((row, index) => (
                <TaskTitleRow
                  key={row.id}
                  index={index}
                  removable={rows.length > 1}
                  row={row}
                  onRemove={handleRemoveRow}
                  onTitleChange={handleTitleChange}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleAddRow}
              >
                <Plus aria-hidden />
                Add Another
              </Button>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="accent" disabled={isSubmitting}>
              {isSubmitting
                ? "Creating…"
                : isBatch
                  ? `Create ${rows.filter((row) => row.title.trim()).length} Tasks`
                  : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
