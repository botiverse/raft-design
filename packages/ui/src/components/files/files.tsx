import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { files } from "./files.recipe";

type FileTag = "button" | "div" | "img" | "section" | "span";
type DataAttributes = Record<`data-${string}`, string | undefined>;
type FileSlotProps<Tag extends FileTag> = useRender.ComponentProps<Tag> & DataAttributes;

function useFileSlot<Tag extends FileTag>(
  slotName: keyof ReturnType<typeof files>,
  dataSlot: string,
  defaultTagName: Tag,
  props: FileSlotProps<Tag>,
) {
  const theme = useThemeFamily();
  const slots = files({ theme });
  const slot = slots[slotName];
  const { className, render, ...otherProps } = props;

  return useRender({
    defaultTagName,
    render,
    props: {
      "data-slot": dataSlot,
      className: slot({ className }),
      ...otherProps,
    },
  });
}

export type FilesPanelProps = FileSlotProps<"section">;
export function FilesPanel(props: FilesPanelProps) {
  return useFileSlot("panel", "files-panel", "section", props);
}

export type FilesViewportProps = FileSlotProps<"div">;
export function FilesViewport(props: FilesViewportProps) {
  return useFileSlot("viewport", "files-viewport", "div", props);
}

export type FilesListProps = FileSlotProps<"div">;
export function FilesList(props: FilesListProps) {
  return useFileSlot("list", "files-list", "div", props);
}

export type FileRowProps = FileSlotProps<"div">;
export function FileRow(props: FileRowProps) {
  return useFileSlot("row", "file-row", "div", props);
}

export type FileRowOpenProps = FileSlotProps<"button">;
export function FileRowOpen(props: FileRowOpenProps) {
  return useFileSlot("rowOpen", "file-row-open", "button", { type: "button", ...props });
}

export type FileThumbnailProps = FileSlotProps<"span">;
export function FileThumbnail(props: FileThumbnailProps) {
  return useFileSlot("thumbnail", "file-thumbnail", "span", props);
}

export type FileImageProps = FileSlotProps<"img"> & { fit?: "contain" | "cover" };
export function FileImage({ fit = "cover", ...props }: FileImageProps) {
  return useFileSlot("image", "file-image", "img", { "data-fit": fit, ...props });
}

export type FileContentProps = FileSlotProps<"span">;
export function FileContent(props: FileContentProps) {
  return useFileSlot("content", "file-content", "span", props);
}

export type FileNameProps = FileSlotProps<"span">;
export function FileName(props: FileNameProps) {
  return useFileSlot("name", "file-name", "span", props);
}

export type FileMetaProps = FileSlotProps<"span">;
export function FileMeta(props: FileMetaProps) {
  return useFileSlot("meta", "file-meta", "span", props);
}

export type FileMetaItemProps = FileSlotProps<"span">;
export function FileMetaItem(props: FileMetaItemProps) {
  return useFileSlot("metaItem", "file-meta-item", "span", props);
}

export type FileActionsProps = FileSlotProps<"span">;
export function FileActions(props: FileActionsProps) {
  return useFileSlot("actions", "file-actions", "span", props);
}

export type FileActionProps = FileSlotProps<"button">;
export function FileAction(props: FileActionProps) {
  return useFileSlot("action", "file-action", "button", { type: "button", ...props });
}

export type FilesLoadingProps = FileSlotProps<"div">;
export function FilesLoading(props: FilesLoadingProps) {
  return useFileSlot("loading", "files-loading", "div", props);
}

export type FilesErrorProps = FileSlotProps<"div">;
export function FilesError(props: FilesErrorProps) {
  return useFileSlot("error", "files-error", "div", { role: "alert", ...props });
}

export type FilesLoadMoreProps = FileSlotProps<"div">;
export function FilesLoadMore(props: FilesLoadMoreProps) {
  return useFileSlot("loadMore", "files-load-more", "div", props);
}

export type FilesLoadMoreStatusProps = FileSlotProps<"span">;
export function FilesLoadMoreStatus(props: FilesLoadMoreStatusProps) {
  return useFileSlot("loadMoreStatus", "files-load-more-status", "span", props);
}

export type FilesLoadMoreActionProps = FileSlotProps<"button">;
export function FilesLoadMoreAction(props: FilesLoadMoreActionProps) {
  return useFileSlot("loadMoreAction", "files-load-more-action", "button", {
    type: "button",
    ...props,
  });
}
