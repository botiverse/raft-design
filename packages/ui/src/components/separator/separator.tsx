import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type { ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const separator = tv({
  slots: {
    root: ["shrink-0", "bg-line-hairline"],
    labeledRoot: ["grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3"],
    labeledLine: ["w-full shrink-0", "h-px bg-line-hairline"],
    labeledContent: ["min-w-0", "font-sans text-footnote font-semibold text-foreground-hint"],
  },
  // Plain classes chosen by the prop, not `data-[orientation=…]:` variants: a variant outranks a plain
  // class, so a caller's `self-center` on a shorter vertical separator lost to `self-stretch` and the
  // line sat at the top of its row. As plain classes the caller's `self-*`, `h-*` and `w-*` replace ours.
  variants: {
    orientation: {
      horizontal: { root: "h-px w-full" },
      vertical: { root: "w-px self-stretch" },
    },
  },
});

export type SeparatorProps = StyledProps<BaseSeparator.Props> & {
  children?: ReactNode;
};

export function Separator({
  children,
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  const { labeledContent, labeledLine, labeledRoot, root } = separator({ orientation });

  if (children != null && orientation === "horizontal") {
    return (
      <BaseSeparator
        data-slot="separator"
        orientation={orientation}
        className={labeledRoot({ className })}
        {...props}
      >
        <span aria-hidden="true" className={labeledLine()} />
        <span data-slot="separator-content" className={labeledContent()}>
          {children}
        </span>
        <span aria-hidden="true" className={labeledLine()} />
      </BaseSeparator>
    );
  }

  return (
    <BaseSeparator
      data-slot="separator"
      orientation={orientation}
      className={root({ className })}
      {...props}
    />
  );
}
