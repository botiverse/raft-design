import { Check, Copy } from "lucide-react";

import { IconSwap } from "./icon-swap.tsx";

export function CopyIconMorph({ copied }: { copied: boolean }) {
  return (
    <IconSwap
      state={copied ? "b" : "a"}
      iconA={<Copy className="size-3" strokeWidth={1.75} />}
      iconB={<Check className="size-3" strokeWidth={1.75} />}
      className="shrink-0"
      aria-hidden
    />
  );
}
