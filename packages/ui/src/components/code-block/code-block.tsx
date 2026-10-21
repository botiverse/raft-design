import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useEffect, useRef, useState } from "react";
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

/** Trailing action region. In the header it ends the header; in the body it takes a column of its own beside the code. */
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

/**
 * Inner code panel. Render the code in a `CodeBlockPre` (or a complete pre
 * and code) as children.
 */
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

export type CodeBlockPreProps = useRender.ComponentProps<"pre">;

/**
 * The code's `pre`. A long line scrolls inside it; while it does, it is a
 * named region the keyboard can reach (`tabindex="0"`, `role="region"`, its
 * `aria-label`, "Code" by default), since Safari doesn't focus a scroller on
 * its own. Code that fits adds no Tab stop.
 */
export function CodeBlockPre({
  render,
  ref,
  "aria-label": ariaLabel = "Code",
  ...props
}: CodeBlockPreProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    // The observer reports once as it starts, then on every change of the
    // pre's width or of its content's.
    const observer = new ResizeObserver(() => setOverflowing(pre.scrollWidth > pre.clientWidth));
    observer.observe(pre);
    for (const child of pre.children) observer.observe(child);
    return () => observer.disconnect();
  }, []);
  const defaultProps: useRender.ElementProps<"pre"> = overflowing
    ? { tabIndex: 0, role: "region", "aria-label": ariaLabel }
    : {};

  return useRender({
    defaultTagName: "pre",
    render,
    ref: ref ? [preRef, ref] : preRef,
    props: mergeProps<"pre">(defaultProps, props),
    state: {
      slot: "code-block-pre",
    },
  });
}
