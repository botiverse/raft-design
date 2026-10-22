import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentProps,
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
} from "react";
import type { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { measureContent, observeTruncation, readNow } from "../../lib/truncation";
import type { Truncation, TruncationTarget } from "../../lib/truncation";
import { tv } from "../../lib/tv";
import { TextLink } from "../text-link/text-link";
import type { TextLinkProps } from "../text-link/text-link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";

// Raft Design System › Ellipsis: text that is cut with CSS (`truncate`,
// `line-clamp`) and knows whether it was. The text is never rewritten, so
// find in page, copy and screen readers get all of it; measuring only decides
// whether the tooltip may open and whether the expand control shows.
//
// The text is always measured alone: while it is measured, `after` and its
// spacer are taken out of the layout (`data-measuring` on the root), so a text
// that fits by itself is never cut to make room for a control it doesn't need.
// `after` takes room only once the text is known to be cut.
const ellipsis = tv({
  slots: {
    root: ["group/ellipsis min-w-0 max-w-full"],
    text: ["min-w-0"],
    content: [],
    spacer: [
      "float-end h-[calc(100%-1lh)] w-0",
      "data-hidden:hidden group-data-measuring/ellipsis:hidden",
    ],
    after: ["data-hidden:hidden group-data-measuring/ellipsis:hidden"],
  },
  variants: {
    multiline: {
      true: {
        root: ["flex"],
        text: ["flex-1", "wrap-break-word"],
        after: ["float-end clear-end ps-1"],
      },
      false: {
        root: ["inline-flex items-baseline gap-x-1 align-bottom"],
        after: ["shrink-0"],
      },
    },
    expanded: {
      true: {},
      false: {},
    },
    clickable: {
      true: { text: ["cursor-pointer"] },
      false: {},
    },
  },
  compoundVariants: [
    {
      multiline: false,
      expanded: false,
      class: { text: ["truncate", "print:overflow-visible print:whitespace-normal"] },
    },
    {
      multiline: false,
      expanded: true,
      class: { text: ["wrap-anywhere whitespace-normal"] },
    },
    {
      multiline: true,
      expanded: false,
      class: { text: ["line-clamp-(--ellipsis-lines)", "print:line-clamp-none"] },
    },
    {
      multiline: true,
      expanded: true,
      class: { text: ["line-clamp-none"] },
    },
  ],
});

/** What a function passed as `after` receives. */
export interface EllipsisState {
  /** The text is cut off right now. `false` while it is expanded. */
  truncated: boolean;
  expanded: boolean;
  /** Expands the text, or collapses it again. */
  toggle: () => void;
}

export interface EllipsisProps extends Omit<ComponentProps<"span">, "children"> {
  /**
   * The text. Inline content only (text, links, code, mentions): a block
   * child such as `<p>` or `<div>` breaks the clamp.
   */
  children: ReactNode;
  /** How many lines the text may take before it is cut. */
  lines?: number;
  /**
   * The tooltip shown on hover, and on keyboard focus when the text is a
   * button, while the text is cut: `true` shows the children, a node shows
   * that node, `false` shows none. It never opens on a text that fits, or on
   * a touch screen.
   */
  tooltip?: ReactNode;
  /**
   * Shown after the text, at the end of the last visible line, only while the
   * text is cut or expanded; it takes no room while the text fits. A function
   * receives the state, for an expand control (`EllipsisToggle`).
   */
  after?: ReactNode | ((state: EllipsisState) => ReactNode);
  /** Whether the whole text shows (controlled). */
  expanded?: boolean;
  /** Whether the whole text shows at first (uncontrolled). */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Makes the cut text itself the button that expands it and collapses it
   * again, for a keyboard and a touch screen as well as a pointer. Only plain
   * text with no `after` takes it: a text with a link or another control
   * inside stays text, and so does one with an `after`, whose control is the
   * button instead (a button can't hold another).
   */
  expandOnClick?: boolean;
}

interface EllipsisContextValue {
  expanded: boolean;
  toggle: () => void;
  textId: string;
}

const EllipsisContext = createContext<EllipsisContextValue | null>(null);

const INTERACTIVE =
  "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]:not([contenteditable='false']), [role='button'], [role='link']";

const TOUCH_MEDIA_QUERY = "(hover: none), (pointer: coarse)";

function isTouchScreen() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(TOUCH_MEDIA_QUERY).matches
  );
}

function contains(ref: RefObject<HTMLElement | null>, target: unknown) {
  return target instanceof Node && ref.current?.contains(target) === true;
}

function hasSelection(within: HTMLElement) {
  const selection = within.ownerDocument.defaultView?.getSelection();
  return (
    !!selection &&
    !selection.isCollapsed &&
    selection.anchorNode != null &&
    within.contains(selection.anchorNode)
  );
}

function useExpanded(
  expandedProp: boolean | undefined,
  defaultExpanded: boolean,
  onExpandedChange: ((expanded: boolean) => void) | undefined,
) {
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const expanded = expandedProp ?? expandedState;
  const toggle = useCallback(() => {
    const next = !expanded;
    if (expandedProp === undefined) setExpandedState(next);
    onExpandedChange?.(next);
  }, [expanded, expandedProp, onExpandedChange]);
  return [expanded, toggle] as const;
}

/**
 * Registers the text with the shared measurer (lib/truncation.ts) and keeps
 * its answer: whether the text, alone, is cut, and whether it has a control
 * inside. While it is expanded the last collapsed answer is kept, so the
 * text and its control stay what they were until it collapses and is
 * measured again. `layout` names what remounts or reclamps the text.
 */
function useTruncation(expanded: boolean, layout: string, onNotTruncated: () => void) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const afterRef = useRef<HTMLSpanElement>(null);
  const setTextRef = useCallback((node: HTMLElement | null) => {
    textRef.current = node;
  }, []);
  const [truncation, setTruncation] = useState<Truncation>(undefined);
  const [interactive, setInteractive] = useState(false);
  const expandedRef = useRef(expanded);
  const targetRef = useRef<TruncationTarget | null>(null);

  const commit = useCallback(
    (next: Truncation) => {
      setInteractive(contentRef.current?.querySelector(INTERACTIVE) != null);
      if (expandedRef.current) return;
      setTruncation(next);
      if (next !== true) onNotTruncated();
    },
    [onNotTruncated],
  );

  useLayoutEffect(() => {
    expandedRef.current = expanded;
    const root = rootRef.current;
    const text = textRef.current;
    const content = contentRef.current;
    if (!root || !text || !content) return undefined;
    const target: TruncationTarget = {
      observe: () => [text, afterRef.current],
      watch: () => content,
      isolate: () => {
        root.setAttribute("data-measuring", "");
        return () => root.removeAttribute("data-measuring");
      },
      read: () => measureContent(text, content),
      commit,
    };
    targetRef.current = target;
    return observeTruncation(target);
  }, [commit, expanded, layout]);

  // Measured as the tooltip is about to open, not trusted from the last
  // frame: a change the observers missed still cannot open it on a text that
  // fits, or keep it shut on one that is cut.
  const measureNow = useCallback(() => {
    const target = targetRef.current;
    if (!target) return undefined;
    const next = readNow(target);
    commit(next);
    return next;
  }, [commit]);

  return {
    rootRef,
    textRef,
    setTextRef,
    contentRef,
    afterRef,
    truncation,
    interactive,
    measureNow,
  };
}

/** The tooltip's `onOpenChange`: it opens only on a text measured as cut, now. */
function useOpenWhenTruncated(
  setOpen: (open: boolean) => void,
  expanded: boolean,
  afterRef: RefObject<HTMLElement | null>,
  measureNow: () => Truncation,
) {
  return useCallback(
    (next: boolean, details: BaseTooltip.Root.ChangeEventDetails) => {
      if (!next) {
        setOpen(false);
        return;
      }
      if (isTouchScreen() || expanded) return;
      if (contains(afterRef, details.event?.target)) return;
      if (measureNow() === true) setOpen(true);
    },
    [afterRef, expanded, measureNow, setOpen],
  );
}

/**
 * Makes the text the button that expands and collapses it, while
 * `clickable`. It stays one while expanded, `aria-expanded="true"`, so focus
 * stays on it and it collapses again the same way.
 */
function useExpandOnClick(
  clickable: boolean,
  expanded: boolean,
  toggle: () => void,
  textRef: RefObject<HTMLElement | null>,
): HTMLAttributes<HTMLElement> {
  const onClick = useCallback(() => {
    if (!clickable) return;
    if (textRef.current && hasSelection(textRef.current)) return;
    toggle();
  }, [clickable, textRef, toggle]);
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!clickable || event.target !== event.currentTarget) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    },
    [clickable, toggle],
  );
  if (!clickable) return {};
  return { role: "button", tabIndex: 0, "aria-expanded": expanded, onClick, onKeyDown };
}

type TextProps = HTMLAttributes<HTMLElement> & { "data-slot": string; "data-truncated"?: "" };

function useRootStyle(style: CSSProperties | undefined, lines: number) {
  return useMemo<CSSProperties | undefined>(
    () => (lines > 1 ? { ...style, ["--ellipsis-lines" as string]: String(lines) } : style),
    [style, lines],
  );
}

export function Ellipsis({
  children,
  lines = 1,
  tooltip = true,
  after,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  expandOnClick = false,
  className,
  style,
  ...props
}: EllipsisProps) {
  const textId = useId();
  const [open, setOpen] = useState(false);
  const closeTooltip = useCallback(() => setOpen(false), []);
  const [expanded, toggle] = useExpanded(expandedProp, defaultExpanded, onExpandedChange);
  const multiline = lines > 1;
  const hasTooltip = tooltip !== false && tooltip != null;
  const hasAfter = after != null;
  const measured = useTruncation(expanded, `${lines} ${hasAfter} ${hasTooltip}`, closeTooltip);
  const { rootRef, textRef, setTextRef, contentRef, afterRef, truncation } = measured;

  const handleOpenChange = useOpenWhenTruncated(setOpen, expanded, afterRef, measured.measureNow);

  const truncated = truncation === true && !expanded;
  const clickable =
    expandOnClick && !hasAfter && !measured.interactive && (truncation === true || expanded);
  const afterNode = typeof after === "function" ? after({ truncated, expanded, toggle }) : after;
  const afterHidden = !truncated && !expanded;

  const slots = ellipsis({ multiline, expanded, clickable });
  const context = useMemo(() => ({ expanded, toggle, textId }), [expanded, toggle, textId]);
  const rootStyle = useRootStyle(style, lines);
  const clickProps = useExpandOnClick(clickable, expanded, toggle, textRef);

  const afterElement = hasAfter ? (
    <span
      ref={afterRef}
      data-slot="ellipsis-after"
      data-hidden={afterHidden ? "" : undefined}
      inert={afterHidden}
      className={slots.after()}
      onPointerEnter={closeTooltip}
    >
      {afterNode}
    </span>
  ) : null;

  const floatingAfter = multiline && hasAfter;
  const textChildren = (
    <>
      {floatingAfter && (
        <span
          aria-hidden
          data-slot="ellipsis-spacer"
          data-hidden={afterHidden ? "" : undefined}
          className={slots.spacer()}
        />
      )}
      {floatingAfter && afterElement}
      <span ref={contentRef} data-slot="ellipsis-content" className={slots.content()}>
        {children}
      </span>
    </>
  );

  const textProps: TextProps = {
    id: textId,
    "data-slot": "ellipsis-text",
    "data-truncated": truncated ? "" : undefined,
    className: slots.text(),
    ...clickProps,
  };
  const text = hasTooltip ? (
    <Tooltip open={open && truncated} onOpenChange={handleOpenChange}>
      <TooltipTrigger
        ref={setTextRef}
        render={<span />}
        {...textProps}
        className={slots.text({ class: "select-auto" })}
      >
        {textChildren}
      </TooltipTrigger>
      <TooltipContent>{tooltip === true ? children : tooltip}</TooltipContent>
    </Tooltip>
  ) : (
    <span ref={setTextRef} {...textProps}>
      {textChildren}
    </span>
  );

  return (
    <EllipsisContext.Provider value={context}>
      <span
        ref={rootRef}
        data-slot="ellipsis"
        className={slots.root({ className })}
        style={rootStyle}
        {...props}
      >
        {text}
        {!multiline ? afterElement : null}
      </span>
    </EllipsisContext.Provider>
  );
}

export type EllipsisToggleProps = Omit<TextLinkProps, "aria-expanded" | "aria-controls">;

/**
 * The control that expands an Ellipsis and collapses it again, for its
 * `after`. A real button, with `aria-expanded` and `aria-controls` pointing
 * at the text. The label is the caller's: "Show More" / "Show Less".
 */
export function EllipsisToggle({ onClick, ...props }: EllipsisToggleProps) {
  const context = useContext(EllipsisContext);
  if (!context) throw new Error("EllipsisToggle must be inside an Ellipsis `after`.");
  const { expanded, toggle, textId } = context;
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) toggle();
    },
    [onClick, toggle],
  );
  return (
    <TextLink aria-expanded={expanded} aria-controls={textId} onClick={handleClick} {...props} />
  );
}
