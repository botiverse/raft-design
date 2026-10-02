import { useCallback, useState } from "react";

export function usePlaygroundMessageMultiSelect() {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  const enter = useCallback((id: string) => {
    setActive(true);
    setSelected(new Set([id]));
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const cancel = useCallback(() => {
    setActive(false);
    setSelected(new Set());
  }, []);

  return { active, cancel, enter, selected, toggle };
}
