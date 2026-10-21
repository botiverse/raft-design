import { Children } from "react";
import type { ReactNode } from "react";

/**
 * Wraps each run of plain text among `children` in a span trimmed to its cap
 * band (`text-trim`), so in a centered row of a control (a chip, a button, a
 * fact in a DescriptionList) the letters center like the boxes beside them
 * (design/foundations/alignment.md, "One center line"). Elements pass through:
 * they trim their own text. Whitespace stays as it is.
 */
export function trimText(children: ReactNode): ReactNode {
  return Children.map(children, (child) =>
    (typeof child === "string" && child.trim() !== "") || typeof child === "number" ? (
      <span data-slot="text-trim" className="text-trim">
        {child}
      </span>
    ) : (
      child
    ),
  );
}
