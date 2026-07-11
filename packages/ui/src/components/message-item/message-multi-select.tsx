import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { tv, type VariantProps } from "../../lib/tv";
import { Checkbox, type CheckboxProps } from "../checkbox/index";

export type MessageMultiSelectApi = {
  active: boolean;
  selected: ReadonlySet<string>;
  enter: (id: string) => void;
  toggle: (id: string) => void;
  cancel: () => void;
};

const MessageMultiSelectContext = createContext<MessageMultiSelectApi | null>(null);

export type MessageMultiSelectProps = {
  children: ReactNode;
  active?: boolean;
  defaultActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  selected?: ReadonlySet<string>;
  defaultSelected?: ReadonlySet<string>;
  onSelectedChange?: (selected: ReadonlySet<string>) => void;
};

export function MessageMultiSelect({
  active: controlledActive,
  children,
  defaultActive = false,
  defaultSelected = new Set(),
  onActiveChange,
  onSelectedChange,
  selected: controlledSelected,
}: MessageMultiSelectProps) {
  const [uncontrolledActive, setUncontrolledActive] = useState(defaultActive);
  const [uncontrolledSelected, setUncontrolledSelected] =
    useState<ReadonlySet<string>>(defaultSelected);
  const active = controlledActive ?? uncontrolledActive;
  const selected = controlledSelected ?? uncontrolledSelected;

  const setActive = useCallback(
    (next: boolean) => {
      if (controlledActive === undefined) setUncontrolledActive(next);
      onActiveChange?.(next);
    },
    [controlledActive, onActiveChange],
  );

  const setSelected = useCallback(
    (next: ReadonlySet<string>) => {
      if (controlledSelected === undefined) setUncontrolledSelected(next);
      onSelectedChange?.(next);
    },
    [controlledSelected, onSelectedChange],
  );

  const enter = useCallback(
    (id: string) => {
      setActive(true);
      setSelected(new Set([id]));
    },
    [setActive, setSelected],
  );

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setSelected(next);
    },
    [selected, setSelected],
  );

  const cancel = useCallback(() => {
    setActive(false);
    setSelected(new Set());
  }, [setActive, setSelected]);

  const contextValue = useMemo(
    () => ({ active, selected, enter, toggle, cancel }),
    [active, selected, enter, toggle, cancel],
  );

  return (
    <MessageMultiSelectContext.Provider value={contextValue}>
      {children}
    </MessageMultiSelectContext.Provider>
  );
}

export function useMessageMultiSelect() {
  return useContext(MessageMultiSelectContext);
}

export type MessageMultiSelectCheckboxProps = Omit<
  CheckboxProps,
  "checked" | "defaultChecked" | "onCheckedChange" | "value"
> & {
  value: string;
};

export function MessageMultiSelectCheckbox({
  className,
  value,
  ...props
}: MessageMultiSelectCheckboxProps) {
  const selection = useMessageMultiSelect();
  if (!selection) {
    throw new Error("MessageMultiSelectCheckbox must be rendered inside MessageMultiSelect");
  }

  return (
    <Checkbox
      checked={selection.selected.has(value)}
      className={cn("mt-1.5 self-start", className)}
      size="md"
      variant="primary"
      onCheckedChange={() => selection.toggle(value)}
      {...props}
    />
  );
}

const messageMultiSelect = tv({
  slots: {
    toolbar: [],
    toolbarContent: ["flex items-center gap-1.5 px-2 py-2"],
    count: ["whitespace-nowrap font-mono text-xs font-bold"],
    actions: ["flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5"],
    action: [
      "inline-flex shrink-0 items-center justify-center whitespace-nowrap outline-none",
      "font-bold leading-none",
      "focus-visible:ring-2 focus-visible:ring-line-focus",
    ],
  },
  variants: {
    theme: {
      brutal: {
        toolbar: "border-t-2 border-line-strong bg-soft-signal",
        count: "text-foreground/70",
        action: "btn-brutal-sm",
      },
      elegant: {
        toolbar: "border-t border-line-subtle bg-layer-panel",
        count: "text-foreground-muted",
        action: [
          "rounded-md border border-line-subtle bg-layer-panel text-foreground",
          "shadow-xs hover:bg-layer-muted active:bg-layer-strong",
        ],
      },
    },
    tone: { default: {}, accent: {} },
    size: {
      default: { action: "h-7 gap-1.5 px-2.5 text-xs" },
      icon: { action: "size-7 text-xs" },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      tone: "default",
      class: { action: "bg-layer-panel text-foreground" },
    },
    { theme: "brutal", tone: "accent", class: { action: "bg-brutal-pink text-black" } },
    {
      theme: "elegant",
      tone: "accent",
      class: { action: "border-accent-400/40 bg-accent-200/40 text-accent-700" },
    },
  ],
  defaultVariants: { tone: "default", size: "default" },
});

export type MessageMultiSelectToolbarProps = useRender.ComponentProps<"div">;

export function MessageMultiSelectToolbar({
  children,
  className,
  render,
  ...props
}: MessageMultiSelectToolbarProps) {
  const theme = useThemeFamily();
  const { toolbar, toolbarContent } = messageMultiSelect({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
    children: <div className={toolbarContent()}>{children}</div>,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-select-toolbar" },
  });
}

export type MessageMultiSelectCountProps = useRender.ComponentProps<"span">;

export function MessageMultiSelectCount({
  className,
  render,
  ...props
}: MessageMultiSelectCountProps) {
  const theme = useThemeFamily();
  const { count } = messageMultiSelect({ theme });
  const defaultProps: useRender.ElementProps<"span"> = { className: count({ className }) };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-select-count" },
  });
}

export type MessageMultiSelectActionsProps = useRender.ComponentProps<"div">;

export function MessageMultiSelectActions({
  className,
  render,
  ...props
}: MessageMultiSelectActionsProps) {
  const { actions } = messageMultiSelect();
  const defaultProps: useRender.ElementProps<"div"> = { className: actions({ className }) };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-select-actions" },
  });
}

type MessageMultiSelectVariants = VariantProps<typeof messageMultiSelect>;

export type MessageMultiSelectActionProps = useRender.ComponentProps<"button"> &
  Pick<MessageMultiSelectVariants, "size" | "tone">;

export function MessageMultiSelectAction({
  className,
  render,
  size,
  tone,
  ...props
}: MessageMultiSelectActionProps) {
  const theme = useThemeFamily();
  const { action } = messageMultiSelect({ theme, size, tone });
  const defaultProps: useRender.ElementProps<"button"> = {
    className: action({ className }),
    type: "button",
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-select-action" },
  });
}
