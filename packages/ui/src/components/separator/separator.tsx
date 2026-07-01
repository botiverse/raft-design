import { Separator as BaseSeparator } from "@base-ui/react/separator";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const separator = tv({
  slots: {
    root: [
      "shrink-0",
      "data-[orientation=horizontal]:w-full",
      "data-[orientation=vertical]:self-stretch",
    ],
    labeledRoot: ["grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3"],
    labeledLine: ["w-full shrink-0"],
    labeledContent: ["min-w-0 font-mono text-xs font-medium"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:border-t-2 data-[orientation=horizontal]:border-black",
          "data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-l-2 data-[orientation=vertical]:border-black",
        ],
        labeledLine: ["h-0 border-t-2 border-black"],
        labeledContent: ["font-medium text-black/70"],
      },
      elegant: {
        root: [
          "bg-line-muted",
          "data-[orientation=horizontal]:h-px",
          "data-[orientation=vertical]:w-px",
        ],
        labeledLine: ["h-px bg-line-muted"],
        labeledContent: ["text-foreground-placeholder"],
      },
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
  const theme = useThemeFamily();
  const { labeledContent, labeledLine, labeledRoot, root } = separator({ theme });

  if (children != null && orientation === "horizontal") {
    const { render: _render, ...labeledProps } = props as Omit<
      ComponentPropsWithoutRef<"div">,
      "children" | "className"
    > & { render?: unknown };

    return (
      <div
        data-slot="separator"
        data-orientation={orientation}
        className={labeledRoot({ className })}
        {...labeledProps}
      >
        <span aria-hidden="true" className={labeledLine()} />
        <span data-slot="separator-content" className={labeledContent()}>
          {children}
        </span>
        <span aria-hidden="true" className={labeledLine()} />
      </div>
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
