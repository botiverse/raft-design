import { useCallback, useRef, useState } from "react";
import { ComboboxSelect } from "@botiverse/raft-ui/wip";
import type { ComboboxSelectOption, ComboboxSelectValue } from "@botiverse/raft-ui/wip";
import { mockMutationOptions, runMockMutation } from "#/lib/mock-query.ts";

const branches = [
  { value: "main", label: "main" },
  { value: "ui", label: "ui" },
  { value: "docs-combobox", label: "docs/combobox" },
] as const satisfies readonly ComboboxSelectOption[];

const branchChangeMutation = mockMutationOptions({
  mutationKey: ["combobox-select", "branch-change"],
  delayMs: 750,
  shouldFail: false,
  mutationFn: () => undefined,
});

function requestBranchChange() {
  return runMockMutation(branchChangeMutation);
}

export function AsyncSelectComposition() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<ComboboxSelectValue | null>(null);
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef(false);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!pendingRef.current) {
      setOpen(nextOpen);
    }
  }, []);

  const handleValueChange = useCallback(async (nextValue: ComboboxSelectValue | null) => {
    if (nextValue === null || pendingRef.current) {
      return;
    }

    pendingRef.current = true;
    setOpen(true);
    setLoading(true);

    try {
      await requestBranchChange();
      setValue(nextValue);
    } finally {
      pendingRef.current = false;
      setLoading(false);
      setOpen(false);
    }
  }, []);

  return (
    <ComboboxSelect
      options={branches}
      value={value}
      open={open}
      loading={loading}
      onOpenChange={handleOpenChange}
      onValueChange={handleValueChange}
      placeholder="Choose branch"
      aria-label="Choose branch"
    />
  );
}
