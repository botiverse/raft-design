import { useCallback, useMemo, useState } from "react";

export function useChatSidebarSectionOrder<T extends { id: string; name: string }>(
  rows: readonly T[],
) {
  const [order, setOrder] = useState(() => rows.map((row) => row.id));
  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const ordered = useMemo(
    () => order.map((id) => byId.get(id)).filter((row): row is T => row != null),
    [byId, order],
  );
  const visibleOrder = useMemo(() => ordered.map((row) => row.id), [ordered]);
  const onReorder = useCallback((next: string[]) => setOrder(next), []);
  return { ordered, visibleOrder, onReorder };
}
