import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { codeBlock } from "./code-block.recipe";

const CORNERS = [
  { x: "left", y: "top" },
  { x: "right", y: "top" },
  { x: "left", y: "bottom" },
  { x: "right", y: "bottom" },
] as const;

export type CodeBlockProps = useRender.ComponentProps<"div">;

/** Framed code surface. Compose a header and a body inside it. */
export function CodeBlock({ className, render, ...props }: CodeBlockProps) {
  const { root } = codeBlock();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "code-block",
    },
  });
}

export type CodeBlockHeaderProps = useRender.ComponentProps<"div">;

export function CodeBlockHeader({ className, render, ...props }: CodeBlockHeaderProps) {
  const { header } = codeBlock();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "code-block-header",
    },
  });
}

export type CodeBlockTitleProps = useRender.ComponentProps<"span">;

export function CodeBlockTitle({ className, render, ...props }: CodeBlockTitleProps) {
  const { title } = codeBlock();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "code-block-title",
    },
  });
}

export type CodeBlockActionsProps = useRender.ComponentProps<"div">;

/** Trailing action region. Placed inside the body it floats over the code panel. */
export function CodeBlockActions({ className, render, ...props }: CodeBlockActionsProps) {
  const { actions } = codeBlock();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "code-block-actions",
    },
  });
}

export type CodeBlockActionProps = useRender.ComponentProps<"button">;

/** Styled action shell. The consumer owns the icon and the behavior. */
export function CodeBlockAction({ className, render, ...props }: CodeBlockActionProps) {
  const { action } = codeBlock();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "code-block-action",
    },
  });
}

export type CodeBlockBodyProps = useRender.ComponentProps<"div">;

/** Inner code panel. Render the complete pre and code as children. */
export function CodeBlockBody({ children, className, render, ...props }: CodeBlockBodyProps) {
  const { body, corner } = codeBlock();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: body({ className }),
    children: (
      <>
        {CORNERS.map(({ x, y }) => (
          <span
            key={`${y}-${x}`}
            data-slot="code-block-corner"
            data-x={x}
            data-y={y}
            className={corner()}
            aria-hidden
          />
        ))}
        {children}
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "code-block-body",
    },
  });
}
