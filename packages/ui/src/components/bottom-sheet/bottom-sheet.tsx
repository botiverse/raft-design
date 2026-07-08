import { mergeProps } from "@base-ui/react/merge-props";
import { Drawer } from "vaul";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import {
  Children,
  Fragment,
  cloneElement,
  type ComponentProps,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  isValidElement,
} from "react";
import { cn } from "../../lib/cn";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";

const bottomSheet = tv({
  slots: {
    portal: [],
    overlay: ["fixed inset-0 z-50", "![animation-duration:0.2s]"],
    positioner: ["contents"],
    content: [
      "fixed z-50 flex h-auto flex-col outline-none",
      "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 md:data-[vaul-drawer-direction=bottom]:inset-x-3",
      "data-[vaul-drawer-direction=bottom]:mx-auto data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:min-h-64 data-[vaul-drawer-direction=bottom]:max-h-[82vh] data-[vaul-drawer-direction=bottom]:max-w-lg md:data-[vaul-drawer-direction=bottom]:max-w-md",
      "data-[vaul-drawer-direction=top]:inset-x-3 data-[vaul-drawer-direction=top]:top-3",
      "data-[vaul-drawer-direction=top]:mx-auto data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:max-w-md",
      "data-[vaul-drawer-direction=left]:inset-y-3 data-[vaul-drawer-direction=left]:left-3 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:max-w-sm",
      "data-[vaul-drawer-direction=right]:inset-y-3 data-[vaul-drawer-direction=right]:right-3 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:max-w-sm",
      "!duration-200 ![animation-duration:0.2s]",
    ],
    header: ["flex flex-col items-center px-6 pt-8 pb-2 text-center"],
    body: ["flex flex-1 flex-col items-center px-6 pt-4 pb-6 text-center"],
    footer: ["mt-auto px-6 py-5 md:pb-11"],
    actions: [
      "mx-auto w-full items-center justify-center gap-2.5",
      "[&_[data-slot=button]]:w-full",
    ],
    title: ["max-w-sm text-pretty text-center text-2xl leading-8 text-foreground-strong"],
    description: ["max-w-sm text-pretty text-center text-sm leading-5 text-foreground/60"],
  },
  variants: {
    theme: {
      brutal: {
        overlay: ["bg-layer-backdrop"],
        title: ["font-bold"],
        content: [
          "border-2 border-black bg-white text-foreground shadow-[var(--shadow-lg)]",
          "data-[vaul-drawer-direction=bottom]:border-x-0 md:data-[vaul-drawer-direction=bottom]:border-x-2",
          "data-[vaul-drawer-direction=bottom]:border-b-0 md:data-[vaul-drawer-direction=bottom]:border-b-2",
        ],
      },
      elegant: {
        overlay: ["bg-layer-backdrop backdrop-blur-[2px]"],
        content: [
          "overflow-clip rounded-lg bg-layer-popover text-foreground shadow-xl md:rounded-xl",
          "data-[vaul-drawer-direction=bottom]:rounded-b-none",
          "md:data-[vaul-drawer-direction=bottom]:max-w-md",
          "md:data-[vaul-drawer-direction=top]:max-w-md",
          "md:data-[vaul-drawer-direction=left]:max-w-md",
          "md:data-[vaul-drawer-direction=right]:max-w-md",
        ],
        header: ["bg-white px-8 pt-9 pb-2"],
        body: ["bg-white px-8 pt-4 pb-7"],
        footer: ["mt-0 px-8 py-5 md:pb-11"],
        actions: ["flex w-fit max-w-none flex-row justify-center", "[&_[data-slot=button]]:w-auto"],
        title: ["font-sans text-2xl leading-8 font-semibold text-[oklch(0.22_0_0)]"],
        description: ["font-sans text-sm leading-5 text-[oklch(0.48_0_0)]"],
      },
    },
  },
});

// Composition root: a thin pass-through over Vaul Drawer.Root that owns open,
// drag, escape, outside-press, and swipe-to-dismiss behavior.
// Renders no DOM element of its own.
export type BottomSheetProps = ComponentProps<typeof Drawer.Root>;

export function BottomSheet({ direction = "bottom", ...props }: BottomSheetProps) {
  return <Drawer.Root direction={direction} {...props} />;
}

export type BottomSheetTriggerProps = Omit<ComponentProps<typeof Drawer.Trigger>, "asChild"> & {
  render?: ReactElement<{ children?: ReactNode }>;
};

// Opens the sheet. Compose your own affordance via `render` (e.g. a Button).
export function BottomSheetTrigger({ children, render, ...props }: BottomSheetTriggerProps) {
  if (render) {
    return (
      <Drawer.Trigger data-slot="bottom-sheet-trigger" asChild {...props}>
        {cloneElement(render, undefined, children ?? render.props.children)}
      </Drawer.Trigger>
    );
  }

  return (
    <Drawer.Trigger data-slot="bottom-sheet-trigger" {...props}>
      {children}
    </Drawer.Trigger>
  );
}

export type BottomSheetPortalProps = ComponentProps<typeof Drawer.Portal> & {
  className?: string;
};

export function BottomSheetPortal({ className, children, ...props }: BottomSheetPortalProps) {
  const portalChildren = Children.map(children, (child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === BottomSheetPositioner) {
      return Children.map(child.props.children, (positionerChild) =>
        withPortalClassName(positionerChild, className),
      );
    }

    return withPortalClassName(child, className);
  });

  return <Drawer.Portal {...props}>{portalChildren}</Drawer.Portal>;
}

function withPortalClassName(child: ReactNode, className: string | undefined) {
  if (!className || !isValidElement<{ className?: string }>(child)) {
    return child;
  }

  return cloneElement(child, {
    className: cn(child.props.className, className),
  });
}

export type BottomSheetPositionerProps = ComponentPropsWithRef<"div">;

export function BottomSheetPositioner({ className, ...props }: BottomSheetPositionerProps) {
  const theme = useThemeFamily();
  const { positioner } = bottomSheet({ theme });
  return (
    <div data-slot="bottom-sheet-positioner" className={positioner({ className })} {...props} />
  );
}

export type BottomSheetOverlayProps = StyledProps<ComponentProps<typeof Drawer.Overlay>>;

export function BottomSheetOverlay({ className, ...props }: BottomSheetOverlayProps) {
  const theme = useThemeFamily();
  const { overlay } = bottomSheet({ theme });
  return (
    <Drawer.Overlay
      data-slot="bottom-sheet-overlay"
      data-theme={theme}
      className={overlay({ className })}
      {...props}
    />
  );
}

export type BottomSheetContentProps = StyledProps<ComponentProps<typeof Drawer.Content>>;

export function BottomSheetContent({ className, ...props }: BottomSheetContentProps) {
  const theme = useThemeFamily();
  const { content } = bottomSheet({ theme });
  return (
    <Drawer.Content
      data-slot="bottom-sheet-content"
      className={content({ className })}
      {...props}
    />
  );
}

export type BottomSheetCloseProps = Omit<ComponentProps<typeof Drawer.Close>, "asChild"> &
  Pick<ButtonProps, "variant" | "size"> & {
    className?: string;
    children?: ReactNode;
    render?: ReactElement<{ children?: ReactNode }>;
  };

// Closes the sheet. Compose your own affordance via `render` (e.g. a Button).
export function BottomSheetClose({
  className,
  variant,
  size,
  children,
  render,
  ...props
}: BottomSheetCloseProps) {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  if (render) {
    return (
      <Drawer.Close data-slot="bottom-sheet-close" asChild {...props}>
        {cloneElement(render, undefined, children ?? render.props.children)}
      </Drawer.Close>
    );
  }

  return (
    <Drawer.Close data-slot="bottom-sheet-close" asChild {...props}>
      <Button
        variant={variant ?? (isBrutal ? "outline" : "ghost")}
        size={size ?? (isBrutal ? "icon-sm" : "icon-sm")}
        aria-label="Close"
        className={cn(
          isBrutal ? "absolute top-3 right-3" : "absolute top-4 right-6",
          isBrutal
            ? "bg-white"
            : "p-0 text-foreground-placeholder hover:bg-transparent hover:text-foreground",
          className,
        )}
      >
        {children ?? <X className="size-4" />}
      </Button>
    </Drawer.Close>
  );
}

export type BottomSheetHeaderProps = useRender.ComponentProps<"div">;

// Stacks the title + description at the top of the sheet.
export function BottomSheetHeader({ className, render, ...props }: BottomSheetHeaderProps) {
  const theme = useThemeFamily();
  const { header } = bottomSheet({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "bottom-sheet-header",
    },
  });
}

export type BottomSheetFooterProps = useRender.ComponentProps<"div">;

// Trailing action area, pushed to the bottom of the sheet.
export function BottomSheetFooter({ className, render, ...props }: BottomSheetFooterProps) {
  const theme = useThemeFamily();
  const { footer } = bottomSheet({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "bottom-sheet-footer",
    },
  });
}

export type BottomSheetBodyProps = useRender.ComponentProps<"div">;

// Main content area between the title header and trailing actions.
export function BottomSheetBody({ className, render, ...props }: BottomSheetBodyProps) {
  const theme = useThemeFamily();
  const { body } = bottomSheet({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: body({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "bottom-sheet-body",
    },
  });
}

export type BottomSheetActionsProps = useRender.ComponentProps<"div">;

// Width-aware action cluster for single or paired bottom-sheet actions.
export function BottomSheetActions({
  className,
  render,
  children,
  ...props
}: BottomSheetActionsProps) {
  const theme = useThemeFamily();
  const { actions } = bottomSheet({ theme });
  const count = Math.min(3, countActionChildren(children));
  const countClassName =
    theme === "elegant"
      ? "flex-row"
      : count <= 1
        ? "flex max-w-64 flex-col"
        : count === 2
          ? "flex max-w-64 flex-col-reverse"
          : "grid max-w-[32rem] grid-cols-3";
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className: cn(countClassName, className) }),
    children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "bottom-sheet-actions",
    },
  });
}

function countActionChildren(children: ReactNode): number {
  return Children.toArray(children).reduce<number>((count, child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      return count + countActionChildren(child.props.children);
    }

    return count + 1;
  }, 0);
}

export type BottomSheetTitleProps = StyledProps<ComponentProps<typeof Drawer.Title>>;

// Accessible heading for the sheet (labels the dialog for screen readers).
export function BottomSheetTitle({ className, ...props }: BottomSheetTitleProps) {
  const theme = useThemeFamily();
  const { title } = bottomSheet({ theme });
  return (
    <Drawer.Title data-slot="bottom-sheet-title" className={title({ className })} {...props} />
  );
}

export type BottomSheetDescriptionProps = StyledProps<ComponentProps<typeof Drawer.Description>>;

// Secondary supporting copy under the title; also the dialog's a11y description.
export function BottomSheetDescription({ className, ...props }: BottomSheetDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = bottomSheet({ theme });
  return (
    <Drawer.Description
      data-slot="bottom-sheet-description"
      className={description({ className })}
      {...props}
    />
  );
}
