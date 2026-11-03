import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from "react";
import type { DataAttributes } from "../../lib/data-attributes";
import { defaultNativeButton } from "../../lib/default-native-button";
import type { StyledProps } from "../../lib/styled-props";
import { codeBlock } from "./code-block.recipe";

const CORNERS = [
  { x: "left", y: "top" },
  { x: "right", y: "top" },
  { x: "left", y: "bottom" },
  { x: "right", y: "bottom" },
] as const;

type CodeBlockContextValue = {
  wrap: boolean;
  setWrap: (wrap: boolean) => void;
};

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null);

export type CodeBlockProps = useRender.ComponentProps<"div"> & {
  /**
   * Soft-wrap the block's long lines when it mounts, instead of scrolling
   * them sideways. Pass it for code in a message; leave it off where people
   * read code as code (a diff, a full code view). A `CodeBlockWrapToggle`
   * switches this one block afterwards; nothing is remembered.
   */
  defaultWrap?: boolean;
};

/** Framed code surface. Compose a header and a body inside it. */
export function CodeBlock({ className, render, defaultWrap = false, ...props }: CodeBlockProps) {
  const { root } = codeBlock();
  const [wrap, setWrap] = useState(defaultWrap);
  const context = useMemo(() => ({ wrap, setWrap }), [wrap]);
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "code-block",
      wrap,
    },
  });

  return <CodeBlockContext.Provider value={context}>{element}</CodeBlockContext.Provider>;
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
 * The code's `pre`. In a block that wraps (`defaultWrap`, until its
 * `CodeBlockWrapToggle` is pressed) long lines wrap inside it. Otherwise a long
 * line scrolls inside it; while it does, it is a named region the keyboard can
 * reach (`tabindex="0"`, `role="region"`, its `aria-label`, "Code" by
 * default), since Safari doesn't focus a scroller on its own. Code that fits
 * adds no Tab stop.
 */
export function CodeBlockPre({
  className,
  render,
  ref,
  "aria-label": ariaLabel = "Code",
  ...props
}: CodeBlockPreProps) {
  const wrap = useContext(CodeBlockContext)?.wrap ?? false;
  const { preWrap } = codeBlock();
  // The pre mounted now (a callback ref), measured again whenever it resizes
  // or its content changes: highlighting that swaps the `code`, or code that
  // streams in, changes the content without changing the pre's own box, and
  // a ResizeObserver doesn't report an inline `code` growing
  // (design/patterns/responsive.md#switch-on-the-regions-width).
  const [pre, setPre] = useState<HTMLPreElement | null>(null);
  const preRef = useCallback((element: HTMLPreElement | null) => setPre(element), []);
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    if (!pre) return;
    const measure = () => setOverflowing(pre.scrollWidth > pre.clientWidth);
    const resize = new ResizeObserver(measure);
    const observe = () => {
      resize.disconnect();
      resize.observe(pre);
      for (const child of pre.children) resize.observe(child);
    };
    observe();
    const mutation = new MutationObserver(() => {
      observe();
      measure();
    });
    mutation.observe(pre, { childList: true, subtree: true, characterData: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
    // `wrap` observes again, which measures again: switching between wrapping
    // and scrolling adds or removes the Tab stop at once.
  }, [pre, wrap]);
  const defaultProps: useRender.ElementProps<"pre"> = overflowing
    ? { tabIndex: 0, role: "region", "aria-label": ariaLabel }
    : {};

  return useRender({
    defaultTagName: "pre",
    render,
    ref: ref ? [preRef, ref] : preRef,
    props: mergeProps<"pre">(defaultProps, {
      ...props,
      className: wrap ? preWrap({ className }) : className,
    }),
    state: {
      slot: "code-block-pre",
    },
  });
}

export type CodeBlockWrapToggleProps = Omit<
  StyledProps<BaseToggle.Props>,
  "type" | "pressed" | "defaultPressed" | "value"
> &
  DataAttributes;

/**
 * Switches its block between wrapping long lines and scrolling them
 * sideways: a Base UI Toggle, pressed (`aria-pressed`, the yellow sticker)
 * while the block scrolls. Place it in `CodeBlockActions`, before Copy. It
 * changes only its own block. The consumer gives the icon and the
 * `aria-label`.
 */
export function CodeBlockWrapToggle({
  className,
  render,
  nativeButton,
  onPressedChange,
  ...props
}: CodeBlockWrapToggleProps) {
  const context = useContext(CodeBlockContext);
  const setWrap = context?.setWrap;
  const handlePressedChange = useCallback<NonNullable<BaseToggle.Props["onPressedChange"]>>(
    (pressed, details) => {
      onPressedChange?.(pressed, details);
      if (!details.isCanceled) setWrap?.(!pressed);
    },
    [onPressedChange, setWrap],
  );
  if (!context) throw new Error("CodeBlockWrapToggle must be used within CodeBlock.");
  const { wrapToggle } = codeBlock();

  return (
    <BaseToggle
      {...props}
      render={render}
      nativeButton={nativeButton ?? defaultNativeButton(render)}
      type="button"
      data-slot="code-block-wrap-toggle"
      pressed={!context.wrap}
      onPressedChange={handlePressedChange}
      className={wrapToggle({ className })}
    />
  );
}
