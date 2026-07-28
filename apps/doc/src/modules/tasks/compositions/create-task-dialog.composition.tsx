import { useRef, useState, type RefObject } from "react";
import {
  Banner,
  BannerDescription,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "raft-ui";
import { Plus, Trash2, X } from "lucide-react";

export function CreateTaskDialogComposition({
  open,
  onOpenChange,
  portalRef,
  onCreate,
  initialTitles = [""],
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
  const [rows, setRows] = useState(() =>
    initialTitles.map((title, index) => ({ id: `initial-${index}`, title })),
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = forceSubmitting || submitting;
  const isBatch = rows.length > 1;
  const resetForm = () => {
    nextRowId.current = initialTitles.length;
    setRows(initialTitles.map((title, index) => ({ id: `initial-${index}`, title })));
    setError("");
    setSubmitting(false);
  };
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} modal={!preview} disablePointerDismissal onOpenChange={handleOpenChange}>
      <DialogContent
        overlay={preview ? false : undefined}
        initialFocus={preview ? false : undefined}
        finalFocus={preview ? false : undefined}
        className={contentClassName ?? "max-w-md"}
        portalProps={portalProps ?? (portalRef ? { container: portalRef } : undefined)}
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
                <div key={row.id} className="mb-1 flex min-w-0 items-center gap-1">
                  <Input
                    aria-label={`Task ${index + 1} title`}
                    value={row.title}
                    placeholder={`Task ${index + 1}`}
                    autoFocus={index === 0}
                    onChange={(event) =>
                      setRows((current) =>
                        current.map((item) =>
                          item.id === row.id ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  {rows.length > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Remove task ${index + 1}`}
                      onClick={() =>
                        setRows((current) => current.filter((item) => item.id !== row.id))
                      }
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  setRows((current) => [
                    ...current,
                    { id: `row-${nextRowId.current++}`, title: "" },
                  ])
                }
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
