import type { ComponentPropsWithRef } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn, tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import { ListItem, type ListItemProps } from "../list-item/list-item.tsx";

const mediaItem = tv({
  slots: {
    row: ["group/media-item flex w-full min-w-0 gap-3"],
    body: [
      "flex min-w-0 flex-1 gap-3",
      "items-center group-data-[align=start]/media-item:items-start",
    ],
    text: ["min-w-0 flex-1"],
    textInner: [
      "flex min-w-0 flex-wrap items-baseline gap-x-2",
      "group-data-[align=start]/media-item:flex-col group-data-[align=start]/media-item:flex-nowrap group-data-[align=start]/media-item:items-stretch group-data-[align=start]/media-item:gap-x-1 group-data-[align=start]/media-item:gap-y-1",
    ],
    visual: ["shrink-0"],
    title: ["truncate text-sm font-bold"],
    subtitle: [
      "font-mono text-xs",
      "[&_svg]:size-3 [&_svg]:shrink-0",
      "group-data-[align=start]/media-item:flex group-data-[align=start]/media-item:min-w-0 group-data-[align=start]/media-item:flex-wrap group-data-[align=start]/media-item:items-center group-data-[align=start]/media-item:gap-x-2 group-data-[align=start]/media-item:gap-y-1",
    ],
    aside: ["flex shrink-0 items-center gap-1.5 self-center", "[&_svg]:size-3.5 [&_svg]:shrink-0"],
    actionGroup: [
      "flex shrink-0 items-center gap-1.5 self-center",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
  },
  variants: {
    theme: {
      brutal: {
        title: "text-black",
        subtitle: "text-black/50",
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    align: {
      start: { row: "items-start" },
      center: { row: "items-center" },
    },
    // The button case only: counteract the `<button>` UA `text-align: center`.
    interactive: {
      true: { body: "text-left" },
      false: { body: "" },
    },
  },
  defaultVariants: {
    align: "center",
  },
});

export type MediaListItemProps = Pick<VariantProps<typeof mediaItem>, "align"> &
  Pick<ListItemProps, "selected" | "interactive"> &
  ComponentPropsWithRef<"div">;

export function MediaListItem({
  align = "center",
  selected,
  interactive,
  className,
  children,
  ...props
}: MediaListItemProps) {
  const { row } = mediaItem({ align });
  return (
    <ListItem
      data-slot="media-list-item"
      selected={selected}
      interactive={interactive ?? false}
      className={cn(
        "group px-3 py-2 has-[[data-interactive=true]]:hover:border-surface-border has-[[data-interactive=true]]:hover:[box-shadow:var(--surface-shadow-sm)]",
        className,
      )}
    >
      <div data-align={align} className={row()} {...props}>
        {children}
      </div>
    </ListItem>
  );
}

export type MediaListItemBodyProps = useRender.ComponentProps<"button">;

export function MediaListItemBody({
  render,
  onClick,
  className,
  ...props
}: MediaListItemBodyProps) {
  const interactive = onClick !== undefined;
  const { body } = mediaItem({ interactive });
  const defaultProps: useRender.ElementProps<"button"> & {
    "data-slot": string;
    "data-interactive"?: string;
  } = {
    "data-slot": "media-list-item-body",
    "data-interactive": interactive ? "true" : undefined,
    onClick,
    className: body({ className }),
  };

  return useRender({
    render: render ?? (interactive ? <BaseButton type="button" /> : <div />),
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type MediaListItemTextProps = ComponentPropsWithRef<"div">;

export function MediaListItemText({ className, children, ...props }: MediaListItemTextProps) {
  const { text, textInner } = mediaItem();
  return (
    <div data-slot="media-list-item-text" className={text({ className })} {...props}>
      <div className={textInner()}>{children}</div>
    </div>
  );
}

export type MediaListItemVisualProps = ComponentPropsWithRef<"div">;

export function MediaListItemVisual({ className, ...props }: MediaListItemVisualProps) {
  const { visual } = mediaItem();
  return <div data-slot="media-list-item-visual" className={visual({ className })} {...props} />;
}

export type MediaListItemTitleProps = ComponentPropsWithRef<"span">;

export function MediaListItemTitle({ className, ...props }: MediaListItemTitleProps) {
  const theme = useTheme();
  const { title } = mediaItem({ theme });
  return <span data-slot="media-list-item-title" className={title({ className })} {...props} />;
}

export type MediaListItemSubtitleProps = ComponentPropsWithRef<"span">;

export function MediaListItemSubtitle({ className, ...props }: MediaListItemSubtitleProps) {
  const theme = useTheme();
  const { subtitle } = mediaItem({ theme });
  return (
    <span data-slot="media-list-item-subtitle" className={subtitle({ className })} {...props} />
  );
}

export type MediaListItemAsideProps = ComponentPropsWithRef<"div">;

export function MediaListItemAside({ className, ...props }: MediaListItemAsideProps) {
  const { aside } = mediaItem();
  return <div data-slot="media-list-item-aside" className={aside({ className })} {...props} />;
}

export type MediaListItemActionGroupProps = ComponentPropsWithRef<"div">;

export function MediaListItemActionGroup({ className, ...props }: MediaListItemActionGroupProps) {
  const { actionGroup } = mediaItem();
  return (
    <div
      data-slot="media-list-item-action-group"
      className={actionGroup({ className })}
      {...props}
    />
  );
}
