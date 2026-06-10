import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const listItem = tv({
  slots: {
    root: ["px-4 py-3 transition-colors"],
    body: [
      "min-w-0",
      "grid grid-cols-[minmax(0,1fr)]",
      "has-[>[data-slot=list-item-icon]]:grid-cols-[auto_minmax(0,1fr)]",
      "has-[>[data-slot=list-item-icon]]:items-start",
      "has-[>[data-slot=list-item-icon]]:gap-x-2",
      "has-[>[data-slot=list-item-icon]]:[&>[data-slot=list-item-icon]]:col-start-1",
      "has-[>[data-slot=list-item-icon]]:[&>[data-slot=list-item-icon]]:row-start-1",
      "has-[>[data-slot=list-item-icon]]:[&>[data-slot=list-item-row]]:col-start-2",
      "has-[>[data-slot=list-item-icon]]:[&>[data-slot=list-item-description]]:col-span-2",
      "has-[>[data-slot=list-item-icon]]:[&>[data-slot=list-item-description]]:col-start-1",
      "has-[>[data-slot=list-item-icon]]:[&>[data-slot=list-item-description]]:row-start-2",
      "has-[>[data-slot=list-item-icon]]:[&>[data-slot=list-item-meta]]:col-start-2",
      "has-[>[data-slot=list-item-icon]]:[&>[data-slot=list-item-action-group]]:col-start-2",
    ],
    icon: ["shrink-0 self-start", "[&_svg]:size-3.5 [&_svg]:shrink-0"],
    row: ["flex min-w-0 flex-wrap items-center gap-2", "[&_svg]:size-3.5 [&_svg]:shrink-0"],
    title: ["break-words text-sm font-bold"],
    description: ["mt-1 text-xs"],
    meta: [
      "mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    actionGroup: ["mt-2 flex flex-wrap items-center gap-2", "[&_svg]:size-3 [&_svg]:shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2"],
        icon: ["mt-0.5 text-black/50"],
        title: "text-black",
        description: "text-black/60",
        meta: "text-black/50",
      },
      elegant: {
        root: [
          "rounded-[var(--list-item-radius)] border",
          "border-[var(--list-item-border)] bg-[var(--list-item-background)]",
          "outline-none",
          "transition-[background-color,border-color] duration-150",
          "focus-visible:ring-2 focus-visible:ring-ring",
        ],
        icon: ["mt-0.5 text-[var(--list-item-meta)]"],
        row: ["items-center gap-2"],
        title: [
          "text-sm font-medium leading-snug tracking-[-0.005em]",
          "text-[var(--list-item-foreground)]",
        ],
        description: [
          "mt-1 text-[0.8125rem] font-normal leading-normal",
          "text-[var(--list-item-description)]",
        ],
        meta: ["text-[var(--list-item-meta)]"],
        actionGroup: ["mt-2 gap-2"],
      },
    },
    selected: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
    interactive: {
      true: {
        root: "",
      },
      false: {
        root: "",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      selected: true,
      class: {
        root: "border-surface-border bg-information-default/15 [box-shadow:var(--surface-shadow-sm)]",
      },
    },
    { theme: "brutal", selected: false, class: { root: "border-surface-border/30 bg-surface" } },
    {
      theme: "brutal",
      selected: false,
      interactive: true,
      class: { root: "hover:border-surface-border hover:[box-shadow:var(--surface-shadow-sm)]" },
    },
    {
      theme: "elegant",
      selected: true,
      class: {
        root: [
          "border-[var(--list-item-selected-border)]",
          "bg-[var(--list-item-selected-background)]",
        ],
      },
    },
    {
      theme: "elegant",
      selected: false,
      interactive: true,
      class: {
        root: "hover:bg-[var(--list-item-hover)]",
      },
    },
  ],
  defaultVariants: {
    selected: false,
    interactive: true,
  },
});

export type ListItemProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof listItem>, "theme">;

export function ListItem({ selected, interactive, className, render, ...props }: ListItemProps) {
  const theme = useTheme();
  const { root } = listItem({ theme, selected, interactive });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "list-item",
    },
  });
}

export type ListItemBodyProps = useRender.ComponentProps<"div">;

export function ListItemBody({ className, render, ...props }: ListItemBodyProps) {
  const { body } = listItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "list-item-body",
    },
  });
}

export type ListItemIconProps = useRender.ComponentProps<"div">;

export function ListItemIcon({ className, render, ...props }: ListItemIconProps) {
  const theme = useTheme();
  const { icon } = listItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "list-item-icon",
    },
  });
}

export type ListItemRowProps = useRender.ComponentProps<"div">;

export function ListItemRow({ className, render, ...props }: ListItemRowProps) {
  const theme = useTheme();
  const { row } = listItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: row({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "list-item-row",
    },
  });
}

export type ListItemTitleProps = useRender.ComponentProps<"div">;

export function ListItemTitle({ className, render, ...props }: ListItemTitleProps) {
  const theme = useTheme();
  const { title } = listItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "list-item-title",
    },
  });
}

export type ListItemDescriptionProps = useRender.ComponentProps<"p">;

export function ListItemDescription({ className, render, ...props }: ListItemDescriptionProps) {
  const theme = useTheme();
  const { description } = listItem({ theme });
  const defaultProps: useRender.ElementProps<"p"> = {
    className: description({ className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
    state: {
      slot: "list-item-description",
    },
  });
}

export type ListItemMetaProps = useRender.ComponentProps<"div">;

export function ListItemMeta({ className, render, ...props }: ListItemMetaProps) {
  const theme = useTheme();
  const { meta } = listItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "list-item-meta",
    },
  });
}

export type ListItemActionGroupProps = useRender.ComponentProps<"div">;

export function ListItemActionGroup({ className, render, ...props }: ListItemActionGroupProps) {
  const theme = useTheme();
  const { actionGroup } = listItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actionGroup({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "list-item-action-group",
    },
  });
}
