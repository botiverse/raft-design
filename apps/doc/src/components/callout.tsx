import type { ReactNode } from "react";

type CalloutProps = {
  children: ReactNode;
};

/** Subtle note block for flagging non-obvious behavior or usage conventions. */
export function Callout({ children }: CalloutProps) {
  return (
    <div className="rounded-md border border-line-subtle bg-layer-muted px-4 py-3 text-sm leading-relaxed text-foreground-muted">
      {children}
    </div>
  );
}
