import type { ReactNode } from "react";

/**
 * Component-overview header: "Differences from the original X" followed by a
 * bullet list of deltas. Children are the `<li>` items.
 */
export function Differences({ from, children }: { from: string; children: ReactNode }) {
  return (
    <>
      Differences from the original <code>{from}</code>:
      <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>
    </>
  );
}
