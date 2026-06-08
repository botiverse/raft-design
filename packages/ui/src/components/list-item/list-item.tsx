import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const listItem = tv({
  slots: {
    root: ["border-2 px-4 py-3 transition-colors"],
    body: ["min-w-0"],
    row: ["flex min-w-0 flex-wrap items-center gap-2", "[&_svg]:size-3 [&_svg]:shrink-0"],
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
        title: "text-black",
        description: "text-black/60",
        meta: "text-black/50",
      },
      elegant: {},
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

export type ListItemRowProps = useRender.ComponentProps<"div">;

export function ListItemRow({ className, render, ...props }: ListItemRowProps) {
  const { row } = listItem();
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
  const { actionGroup } = listItem();
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
