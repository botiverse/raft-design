import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Checkbox, type CheckboxProps } from "../checkbox/index";

const messageMultiSelectToolbar = tv({
  base: "flex items-center gap-1.5",
  variants: {
    theme: {
      brutal:
        "border-t-2 border-line-strong bg-soft-signal px-2 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom,0px))]",
      elegant:
        "rounded-lg border-[0.5px] border-line-subtle bg-layer-panel px-2.5 py-2.5 shadow-xs",
    },
  },
});

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

export type MessageMultiSelectToolbarProps = useRender.ComponentProps<"div">;

/** Shared select-mode toolbar shell. Consumers compose the count and actions as children. */
export function MessageMultiSelectToolbar({
  className,
  render,
  ...props
}: MessageMultiSelectToolbarProps) {
  const theme = useThemeFamily();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: messageMultiSelectToolbar({ theme, className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-multi-select-toolbar",
    },
  });
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
      className={[
        "mt-1.5 self-start rounded-full",
        "data-[checked]:shadow-none data-[indeterminate]:shadow-none",
        "hover:data-[checked]:shadow-none hover:data-[indeterminate]:shadow-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      shape="circle"
      size="lg"
      variant="primary"
      onCheckedChange={() => selection.toggle(value)}
      {...props}
    />
  );
}
