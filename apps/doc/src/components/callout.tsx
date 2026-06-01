import type { ReactNode } from "react";

type CalloutProps = {
  children: ReactNode;
};

/** Subtle note block for flagging non-obvious behavior or usage conventions. */
export function Callout({ children }: CalloutProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600">
      {children}
    </div>
  );
}
