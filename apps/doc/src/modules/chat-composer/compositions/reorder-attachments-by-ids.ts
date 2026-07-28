import type { ReorderAttachment } from "./composer-attachments-reorder.types.ts";

export function reorderAttachmentsByIds(
  items: readonly ReorderAttachment[],
  nextIds: readonly string[],
): ReorderAttachment[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return nextIds.flatMap((id) => {
    const item = byId.get(id);
    return item ? [item] : [];
  });
}
