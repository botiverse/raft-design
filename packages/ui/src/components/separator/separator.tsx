import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type { ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";

const separator = tv({
  slots: {
    root: [
      "shrink-0",
      "data-[orientation=horizontal]:w-full",
      "data-[orientation=vertical]:self-stretch",
      "bg-line-hairline",
      "data-[orientation=horizontal]:h-px",
      "data-[orientation=vertical]:w-px",
    ],
    labeledRoot: ["grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3"],
    labeledLine: ["w-full shrink-0", "h-px bg-line-hairline"],
    labeledContent: ["min-w-0", "font-sans text-footnote font-semibold text-foreground-hint"],
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
  const { labeledContent, labeledLine, labeledRoot, root } = separator();

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
