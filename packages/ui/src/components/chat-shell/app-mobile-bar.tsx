import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { tv, type VariantProps } from "../../lib/tv";
import type { DataAttributes } from "./app-shell";

const appMobileBar = tv({
  slots: {
    list: ["flex"],
    item: [
      "flex flex-1 flex-col items-center justify-center gap-0.5 py-2",
      "text-[10px] font-bold tracking-wider transition-colors",
      "[@media(max-height:600px)]:min-h-9",
      "[&:not(:last-child)]:border-r-2 [&:not(:last-child)]:border-black",
    ],
    icon: ["[@media(max-height:600px)]:hidden"],
  },
  variants: {
    selected: {
      true: {
        item: "bg-soft-signal",
      },
      false: {
        item: "bg-white active:bg-black/5",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

type AppMobileBarVariantProps = VariantProps<typeof appMobileBar>;

export type AppMobileBarListProps = useRender.ComponentProps<"div">;

export function AppMobileBarList({ className, render, ...props }: AppMobileBarListProps) {
  const { list } = appMobileBar();
  const defaultProps: useRender.ElementProps<"div"> & DataAttributes = {
    "data-slot": "app-mobile-bar-list",
    className: list({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type AppMobileBarItemProps = useRender.ComponentProps<"button"> &
  Pick<AppMobileBarVariantProps, "selected">;

export function AppMobileBarItem({
  className,
  render,
  selected = false,
  ...props
}: AppMobileBarItemProps) {
  const { item } = appMobileBar({ selected });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "aria-pressed": selected,
    "data-selected": selected ? "true" : undefined,
    "data-slot": "app-mobile-bar-item",
    className: item({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type AppMobileBarIconProps = useRender.ComponentProps<"span">;

export function AppMobileBarIcon({ className, render, ...props }: AppMobileBarIconProps) {
  const { icon } = appMobileBar();
  const defaultProps: useRender.ElementProps<"span"> & DataAttributes = {
    "data-slot": "app-mobile-bar-icon",
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type AppMobileBarLabelProps = {
  children?: ReactNode;
};

export function AppMobileBarLabel({ children }: AppMobileBarLabelProps) {
  return children;
}
