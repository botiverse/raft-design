import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
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
import { tv } from "../../lib/tv";
import { TextLink } from "../text-link/text-link";
import type { TextLinkProps } from "../text-link/text-link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import { measureTruncation, observeTruncation } from "./ellipsis-measure";
import type { Truncation } from "./ellipsis-measure";

// Raft Design System › Ellipsis: text that is cut with CSS (`truncate`,
// `line-clamp`) and knows whether it was. The text is never rewritten, so
// find in page, copy and screen readers get all of it; measuring only decides
// whether the tooltip may open and whether the expand control shows.
const ellipsis = tv({
  slots: {
    root: ["min-w-0 max-w-full"],
    text: ["min-w-0"],
    content: [],
    spacer: ["float-end h-[calc(100%-1lh)] w-0"],
    after: ["data-hidden:invisible"],
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
   * The tooltip shown on hover while the text is cut: `true` shows the
   * children, a node shows that node, `false` shows none. It never opens on
   * a text that fits, or on a touch screen.
   */
  tooltip?: ReactNode;
  /**
   * Shown after the text, at the end of the last visible line. A function
   * receives the state, for an expand control (`EllipsisToggle`). Its room
   * is kept even while it is hidden, so it never changes where the text is
   * cut; it shows only while the text is cut or expanded.
   */
  after?: ReactNode | ((state: EllipsisState) => ReactNode);
  /** Whether the whole text shows (controlled). */
  expanded?: boolean;
  /** Whether the whole text shows at first (uncontrolled). */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Makes the cut text itself a button that expands it. Only plain text
   * takes it: a text with a link or another control inside stays text, and
   * needs an `EllipsisToggle` in `after` instead.
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
 * Registers the text with the shared measurer while it is mounted, and keeps
 * its answer: whether it is cut, and whether it has a control inside.
 * `layout` names what remounts or reclamps the text; a new one measures again.
 */
function useTruncation(lines: number, layout: string, onNotTruncated: () => void) {
  const textRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const afterRef = useRef<HTMLSpanElement>(null);
  const setTextRef = useCallback((node: HTMLElement | null) => {
    textRef.current = node;
  }, []);
  const [truncation, setTruncation] = useState<Truncation>(undefined);
  const [interactive, setInteractive] = useState(false);
  const linesRef = useRef(lines);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const commit = useCallback(
    (next: Truncation) => {
      setTruncation(next);
      setInteractive(contentRef.current?.querySelector(INTERACTIVE) != null);
      if (next !== true) onNotTruncated();
    },
    [onNotTruncated],
  );

  useEffect(() => {
    const text = textRef.current;
    const content = contentRef.current;
    if (!text || !content) return undefined;
    return observeTruncation({
      text,
      content,
      extra: () => [afterRef.current],
      lines: () => linesRef.current,
      commit,
    });
  }, [commit, lines, layout]);

  // Measured where the tooltip is about to open, not trusted from the last
  // frame: a change the observers missed still cannot open it on a text that
  // fits, or keep it shut on one that is cut.
  const measureNow = useCallback(() => {
    const text = textRef.current;
    const content = contentRef.current;
    if (!text || !content) return undefined;
    const next = measureTruncation(text, content, linesRef.current);
    commit(next);
    return next;
  }, [commit]);

  return { textRef, setTextRef, contentRef, afterRef, truncation, interactive, measureNow };
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

/** Makes the text a button that expands it, while `clickable`. */
function useExpandOnClick(
  clickable: boolean,
  toggle: () => void,
  textRef: RefObject<HTMLElement | null>,
  afterRef: RefObject<HTMLElement | null>,
): HTMLAttributes<HTMLElement> {
  const onClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!clickable || contains(afterRef, event.target)) return;
      if (textRef.current && hasSelection(textRef.current)) return;
      toggle();
    },
    [afterRef, clickable, textRef, toggle],
  );
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
  return { role: "button", tabIndex: 0, "aria-expanded": false, onClick, onKeyDown };
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
  const { textRef, setTextRef, contentRef, afterRef, truncation, interactive, measureNow } =
    useTruncation(lines, `${hasAfter} ${hasTooltip} ${expanded}`, closeTooltip);

  const handleOpenChange = useOpenWhenTruncated(setOpen, expanded, afterRef, measureNow);

  const truncated = truncation === true && !expanded;
  const clickable = expandOnClick && truncated && !interactive;
  const state: EllipsisState = { truncated, expanded, toggle };
  const afterNode = typeof after === "function" ? after(state) : after;
  const afterHidden = !truncated && !expanded;

  const slots = ellipsis({ multiline, expanded, clickable });
  const context = useMemo(() => ({ expanded, toggle, textId }), [expanded, toggle, textId]);
  const rootStyle = useRootStyle(style, lines);

  const clickProps = useExpandOnClick(clickable, toggle, textRef, afterRef);

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
      {floatingAfter && <span aria-hidden data-slot="ellipsis-spacer" className={slots.spacer()} />}
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
      <span data-slot="ellipsis" className={slots.root({ className })} style={rootStyle} {...props}>
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
 * at the text. The label is the caller's: "Show more" / "Show less".
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
