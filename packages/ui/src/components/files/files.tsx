import { useRender } from "@base-ui/react/use-render";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";
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
  const slots = files();
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

export type FileActionProps = Omit<ButtonProps, "variant" | "size"> &
  Pick<Partial<ButtonProps>, "variant" | "size">;

export function FileAction({ variant, size = "icon-sm", ...props }: FileActionProps) {
  return <Button variant={variant ?? "ghost"} size={size} {...props} />;
}
