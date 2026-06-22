import type { KeyboardEvent, ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Check } from "lucide-react";
import { tv } from "tailwind-variants/lite";
import { useTheme } from "../lib/theme/use-theme.ts";

// Single-select popover content: a header, an optional search box, and a list of
// checkable rows (the trailing ✓ is the selected indicator; hover is the shared
// selection-family yellow/30). Presentational — the original had no portal/effect,
// so place it inside a base-ui Popover.Positioner at the callsite. `shadow-brutal`
// maps to --shadow-hover; the search box reuses the brutal field skin (--shadow).
const selectionPopover = tv({
  slots: {
    root: ["min-w-[220px]"],
    header: ["flex items-center justify-between border-b border-black px-3 py-2"],
    title: ["text-[10px] font-bold uppercase tracking-wide text-black/60"],
    clear: ["text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black"],
    searchWrap: ["border-b border-black px-2 py-2"],
    searchInput: [
      "w-full border-2 border-black bg-white px-2 py-1",
      "font-mono text-xs shadow-[var(--shadow)]",
      "focus:shadow-[var(--shadow-hover)] focus:outline-none",
    ],
    list: ["max-h-64 overflow-y-auto"],
    empty: ["px-3 py-3 text-center font-mono text-[11px] text-black/40"],
    row: [
      "flex h-9 w-full items-center justify-between gap-2 overflow-hidden px-3",
      "border-b text-left text-xs font-bold last:border-b-0",
    ],
    rowMain: ["flex min-w-0 items-center gap-2"],
    leading: ["flex size-5 shrink-0 items-center justify-center"],
    label: ["truncate leading-6"],
    check: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 border-black bg-white shadow-[var(--shadow-hover)]"],
        row: ["border-black/10"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    disabled: {
      true: {
        row: "cursor-not-allowed bg-white text-black/30",
      },
      false: {
        row: "bg-white text-black hover:bg-brutal-yellow/30",
      },
    },
    italic: {
      true: {
        label: "-mx-1 whitespace-nowrap px-1 italic text-black/70",
      },
      false: {
        label: "",
      },
    },
  },
  defaultVariants: {
    disabled: false,
    italic: false,
  },
});

export type SelectionPopoverOption = {
  key: string;
  checked: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  italic?: boolean;
  avatar?: ReactNode;
  reserveLeadingSlot?: boolean;
  leading?: ReactNode;
};

type SelectionPopoverBaseProps = {
  title: string;
  options: SelectionPopoverOption[];
  showClear?: boolean;
  onClear?: () => void;
  showHeader?: boolean;
  emptyLabel?: string;
  className?: string;
};

type SearchableProps = SelectionPopoverBaseProps & {
  searchable: true;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onInputKeyDown?: (
    event: KeyboardEvent<HTMLInputElement>,
    options: SelectionPopoverOption[],
  ) => void;
};

type PlainProps = SelectionPopoverBaseProps & {
  searchable?: false;
  search?: never;
  onSearchChange?: never;
  searchPlaceholder?: never;
  onInputKeyDown?: never;
};

export type SelectionPopoverProps = SearchableProps | PlainProps;

function SelectionPopoverOptionRow({
  checked,
  onClick,
  label,
  disabled = false,
  italic = false,
  avatar = null,
  reserveLeadingSlot = false,
  leading = null,
}: Omit<SelectionPopoverOption, "key">) {
  const theme = useTheme();
  const leadingContent = leading ?? avatar;
  const {
    row,
    rowMain,
    leading: leadingSlot,
    label: labelSlot,
    check,
  } = selectionPopover({
    theme,
    disabled,
    italic,
  });
  return (
    <BaseButton
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-slot="selection-popover-row"
      className={row()}
    >
      <span className={rowMain()}>
        {(reserveLeadingSlot || leadingContent) && (
          <span className={leadingSlot()}>{leadingContent}</span>
        )}
        <span className={labelSlot()}>{label}</span>
      </span>
      {checked && <Check size={12} className={check()} />}
    </BaseButton>
  );
}

export function SelectionPopover(props: SelectionPopoverProps) {
  const theme = useTheme();
  const {
    title,
    options,
    showClear = false,
    onClear,
    showHeader = true,
    emptyLabel = "No matches",
    className,
  } = props;
  const {
    root,
    header,
    title: titleSlot,
    clear,
    searchWrap,
    searchInput,
    list,
    empty,
  } = selectionPopover({ theme });

  return (
    <div data-slot="selection-popover" className={root({ className })}>
      {showHeader && (
        <div className={header()}>
          <span className={titleSlot()}>{title}</span>
          {showClear && onClear && (
            <BaseButton type="button" onClick={onClear} className={clear()}>
              Clear
            </BaseButton>
          )}
        </div>
      )}
      {props.searchable && (
        <div className={searchWrap()}>
          {/* Reuses the brutal field skin (input-brutal → --shadow / --shadow-hover). */}
          <input
            type="text"
            aria-label={props.searchPlaceholder ?? title}
            value={props.search}
            onChange={(event) => props.onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              event.stopPropagation();
              props.onInputKeyDown?.(event, options);
            }}
            placeholder={props.searchPlaceholder ?? "Search…"}
            className={searchInput()}
          />
        </div>
      )}
      <div className={list()}>
        {options.length === 0 ? (
          <div className={empty()}>{emptyLabel}</div>
        ) : (
          options.map(({ key, ...option }) => <SelectionPopoverOptionRow key={key} {...option} />)
        )}
      </div>
    </div>
  );
}
