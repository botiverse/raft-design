import { useState } from "react";

export function usePlaygroundMessageMultiSelect() {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());

  function enter(id: string) {
    setActive(true);
    setSelected(new Set([id]));
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function cancel() {
    setActive(false);
    setSelected(new Set());
  }

  return { active, cancel, enter, selected, toggle };
}
