import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Pencil, Check } from "lucide-react";

interface InlineBadgeEditorProps {
  /** Display label shown in the badge */
  displayValue: string;
  /** Currently selected option ID (for highlight) */
  selectedId: string;
  options: { id: string; label: string }[];
  onSelect: (id: string) => Promise<void> | void;
  open: boolean;
  onToggle: () => void;
  onRequestClose?: () => void;
  badgeClassName: string;
  capitalize?: boolean;
  /**
   * Apply the brutal uppercase + tracking-wide transform on the
   * trigger badge. Defaults to true (matches Badge primitive). Status
   * pills mixed with case-sensitive identifiers (`@assignee`) pass
   * `false`. stdrc msg=ce25da45 + msg=65681d15 (option B).
   */
  uppercase?: boolean;
  dropdownMinWidth?: string;
  dropdownAlign?: "left" | "right";
  disabled?: boolean;
  buttonTestId?: string;
  buttonDataTaskStatus?: string;
  buttonTitle?: string;
  buttonAriaLabel?: string;
  dropdownTestId?: string;
  optionTestIdPrefix?: string;
  buttonClassName?: string;
  buttonChildren?: ReactNode;
}

export default function InlineBadgeEditor({
  displayValue,
  selectedId,
  options,
  onSelect,
  open,
  onToggle,
  onRequestClose,
  badgeClassName,
  capitalize,
  uppercase = true,
  dropdownMinWidth = "min-w-[120px]",
  dropdownAlign,
  disabled,
  buttonTestId,
  buttonDataTaskStatus,
  buttonTitle,
  buttonAriaLabel,
  dropdownTestId,
  optionTestIdPrefix,
  buttonClassName,
  buttonChildren,
}: InlineBadgeEditorProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({
    position: "fixed",
    visibility: "hidden",
  });

  useLayoutEffect(() => {
    if (!open) {
      setDropdownStyle({ position: "fixed", visibility: "hidden" });
      return;
    }

    const measure = () => {
      const trigger = triggerRef.current;
      const dropdown = dropdownRef.current;
      if (!trigger || !dropdown) return;

      const triggerRect = trigger.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const gutter = 8;
      const align = dropdownAlign ?? (window.matchMedia("(min-width: 640px)").matches ? "left" : "right");

      const idealLeft = align === "left"
        ? triggerRect.left
        : triggerRect.right - dropdownRect.width;
      const left = Math.min(
        Math.max(gutter, idealLeft),
        viewportWidth - gutter - dropdownRect.width,
      );

      const idealTop = triggerRect.bottom + 4;
      const wouldOverflowBottom = idealTop + dropdownRect.height > viewportHeight - gutter;
      const top = wouldOverflowBottom
        ? Math.max(gutter, triggerRect.top - 4 - dropdownRect.height)
        : idealTop;

      setDropdownStyle({
        position: "fixed",
        left: Math.max(gutter, left),
        top,
        zIndex: 1000,
        visibility: "visible",
        maxHeight: viewportHeight - gutter * 2,
        maxWidth: viewportWidth - gutter * 2,
      });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { capture: true, passive: true });
    window.visualViewport?.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("scroll", measure, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, { capture: true });
      window.visualViewport?.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("scroll", measure);
    };
  }, [dropdownAlign, open]);

  useEffect(() => {
    if (!open || !onRequestClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      const trigger = triggerRef.current;
      const dropdown = dropdownRef.current;
      if (trigger?.contains(target) || dropdown?.contains(target)) return;
      onRequestClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onRequestClose]);

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className={`card-brutal overflow-y-auto ${dropdownMinWidth}`}
      data-testid={dropdownTestId}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {/* Dropdown chrome aligned to the Select / SelectionPopover family per
          stdrc #proj-theme:ac79cf20 msg=832c2c02 + msg=b0b92c1c
          (2026-05-25): no yellow hover, no yellow selected; hover =
          `bg-brutal-yellow/30` (shared with SegmentedControl unselected
          and MenuItem); ✓ on the right (trailing slot is the canonical
          selected indicator). */}
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={async () => {
              await onSelect(opt.id);
            }}
            data-testid={optionTestIdPrefix ? `${optionTestIdPrefix}-${opt.id}` : undefined}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors bg-white hover:bg-brutal-yellow/30"
          >
            <span className="truncate">{opt.label}</span>
            <Check size={14} className={`shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`} />
          </button>
        );
      })}
    </div>
  ) : null;

  // Trigger badge matches the brutal Badge visual contract (stdrc
  // #proj-theme:ac79cf20 msg=832c2c02): uppercase + tracking-wide. Source
  // content stays Title Case ("In Progress") so future non-brutal themes
  // can render it natural-cased.
  // Interactive hover for solid-bg brutal badges: filter brightness shift
  // (cross-tone — works on any `bg-brutal-{tone}` without per-tone classes).
  // Transition target lists `filter` AND `opacity` because the disabled
  // state below uses `disabled:opacity-60`. stdrc msg=3d60f9dd #proj-theme
  // — the older `hover:opacity-70 transition-colors` was a mismatch
  // (transition target didn't cover opacity, so the state snapped).
  const defaultButtonClassName = `mt-0.5 inline-flex items-center gap-1 border-2 border-black ${badgeClassName} px-2 py-0.5 text-xs font-bold ${uppercase ? "uppercase tracking-wide " : ""}text-black transition-[filter,opacity] duration-100 hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60${capitalize ? " capitalize" : ""}`;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        disabled={disabled}
        data-testid={buttonTestId}
        data-task-status={buttonDataTaskStatus}
        title={buttonTitle}
        aria-label={buttonAriaLabel}
        className={buttonClassName ?? defaultButtonClassName}
      >
        {buttonChildren ?? (
          <>
            {displayValue}
            <Pencil size={10} className="opacity-40" />
          </>
        )}
      </button>
      {dropdown && createPortal(dropdown, document.body)}
    </>
  );
}
