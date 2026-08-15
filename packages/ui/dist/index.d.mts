import { cn } from "./cn.mjs";
import { Dialog as Dialog$1 } from "@base-ui/react/dialog";
import { VariantProps } from "tailwind-variants/lite";
import { ComponentProps, ComponentPropsWithRef, ComponentPropsWithoutRef, CompositionEventHandler, FocusEventHandler, FormEventHandler, HTMLAttributes, KeyboardEventHandler, PointerEvent, ReactNode, RefObject } from "react";
import { Button as Button$1 } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import { Drawer as Drawer$1 } from "@base-ui/react/drawer";
import { Checkbox as Checkbox$1 } from "@base-ui/react/checkbox";
import { ScrollArea as ScrollArea$1 } from "@base-ui/react/scroll-area";
import { Collapsible } from "@base-ui/react/collapsible";
import { Avatar as Avatar$1, ContextMenu as ContextMenu$1 } from "@base-ui/react";
import { Menu } from "@base-ui/react/menu";
import { Tooltip as Tooltip$1 } from "@base-ui/react/tooltip";
import { Popover as Popover$1 } from "@base-ui/react/popover";
import { PreviewCard as PreviewCard$1 } from "@base-ui/react/preview-card";
import { Input as Input$1 } from "@base-ui/react/input";
import { Field as Field$1 } from "@base-ui/react/field";
import { Combobox as Combobox$1 } from "@base-ui/react/combobox";
import { Select as Select$1 } from "@base-ui/react/select";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as RadioGroup$1 } from "@base-ui/react/radio-group";
import { Switch as Switch$1 } from "@base-ui/react/switch";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroup$1 } from "@base-ui/react/toggle-group";
import { Toolbar } from "@base-ui/react/toolbar";
import { Progress as Progress$1 } from "@base-ui/react/progress";
import { DragCancelEvent, DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import { Toast } from "@base-ui/react/toast";
import { Tabs as Tabs$1 } from "@base-ui/react/tabs";
import { Separator as Separator$1 } from "@base-ui/react/separator";
import { GroupProps, PanelProps as PanelProps$1, SeparatorProps as SeparatorProps$1 } from "react-resizable-panels";
//#region src/lib/styled-props.d.ts
/**
 * Base UI components type `className` as `string | ((state) => string)`, but our
 * tv() recipes only accept a plain string. `StyledProps` narrows a Base UI
 * component's props to a string `className` so they can flow into a recipe.
 *
 * The state-callback form is intentionally dropped: our components express every
 * state through `data-*` variants in the recipe, so a caller never needs it.
 */
type StyledProps<P> = Omit<P, "className"> & {
  className?: string;
};
//#endregion
//#region src/lib/data-attributes.d.ts
type DataAttributes$1 = Record<`data-${string}`, string | undefined>;
//#endregion
//#region src/components/button/button.d.ts
declare const buttonVariants: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  variant: {
    primary: {
      root: string[];
    };
    default: {
      root: string[];
    };
    information: {
      root: string[];
    };
    muted: {
      root: string[];
    };
    accent: {
      root: string[];
    };
    warning: {
      root: string[];
    };
    outline: {
      root: string[];
    };
    ghost: {
      root: string[];
    };
    link: {
      root: string[];
    };
    "danger-secondary": {
      root: string[];
    };
    danger: {
      root: string[];
    };
    "danger-outline": {
      root: string[];
    };
  };
  size: {
    xs: {
      root: string[];
    };
    sm: {
      root: string[];
    };
    md: {
      root: string[];
    };
    lg: {
      root: string[];
    };
    "icon-xs": {
      root: string[];
    };
    "icon-sm": {
      root: string[];
    };
    "icon-md": {
      root: string;
    };
    "icon-lg": {
      root: string;
    };
  };
}, {
  root: string[];
  content: string;
  loadingIndicator: string;
}, undefined, {
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  variant: {
    primary: {
      root: string[];
    };
    default: {
      root: string[];
    };
    information: {
      root: string[];
    };
    muted: {
      root: string[];
    };
    accent: {
      root: string[];
    };
    warning: {
      root: string[];
    };
    outline: {
      root: string[];
    };
    ghost: {
      root: string[];
    };
    link: {
      root: string[];
    };
    "danger-secondary": {
      root: string[];
    };
    danger: {
      root: string[];
    };
    "danger-outline": {
      root: string[];
    };
  };
  size: {
    xs: {
      root: string[];
    };
    sm: {
      root: string[];
    };
    md: {
      root: string[];
    };
    lg: {
      root: string[];
    };
    "icon-xs": {
      root: string[];
    };
    "icon-sm": {
      root: string[];
    };
    "icon-md": {
      root: string;
    };
    "icon-lg": {
      root: string;
    };
  };
}, {
  root: string[];
  content: string;
  loadingIndicator: string;
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  variant: {
    primary: {
      root: string[];
    };
    default: {
      root: string[];
    };
    information: {
      root: string[];
    };
    muted: {
      root: string[];
    };
    accent: {
      root: string[];
    };
    warning: {
      root: string[];
    };
    outline: {
      root: string[];
    };
    ghost: {
      root: string[];
    };
    link: {
      root: string[];
    };
    "danger-secondary": {
      root: string[];
    };
    danger: {
      root: string[];
    };
    "danger-outline": {
      root: string[];
    };
  };
  size: {
    xs: {
      root: string[];
    };
    sm: {
      root: string[];
    };
    md: {
      root: string[];
    };
    lg: {
      root: string[];
    };
    "icon-xs": {
      root: string[];
    };
    "icon-sm": {
      root: string[];
    };
    "icon-md": {
      root: string;
    };
    "icon-lg": {
      root: string;
    };
  };
}, {
  root: string[];
  content: string;
  loadingIndicator: string;
}>>;
type ButtonProps = StyledProps<Button$1.Props> & Omit<VariantProps<typeof buttonVariants>, "theme"> & DataAttributes$1 & {
  loading?: boolean;
  loadingLabel?: string;
};
declare function Button({ variant, size, loading, loadingLabel, disabled, className, children, render, nativeButton, ...props }: ButtonProps): import("react").JSX.Element;
//#endregion
//#region src/components/alert-dialog/alert-dialog.d.ts
type AlertDialogProps = Dialog$1.Root.Props;
declare function AlertDialog(props: AlertDialogProps): import("react").JSX.Element;
type AlertDialogTriggerProps = Dialog$1.Trigger.Props;
declare function AlertDialogTrigger(props: AlertDialogTriggerProps): import("react").JSX.Element;
type AlertDialogPortalProps = Dialog$1.Portal.Props;
declare function AlertDialogPortal(props: AlertDialogPortalProps): import("react").JSX.Element;
type AlertDialogCloseProps = Omit<Dialog$1.Close.Props, "render"> & Pick<ButtonProps, "variant" | "size"> & {
  className?: string;
  children?: ReactNode;
};
declare function AlertDialogClose({ className, variant, size, children, ...props }: AlertDialogCloseProps): import("react").JSX.Element;
type AlertDialogOverlayProps = StyledProps<Dialog$1.Backdrop.Props>;
declare function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps): import("react").JSX.Element;
type AlertDialogContentProps = StyledProps<Dialog$1.Popup.Props> & {
  portalProps?: AlertDialogPortalProps;
  overlay?: false | AlertDialogOverlayProps;
};
declare function AlertDialogContent({ className, children, portalProps, overlay, ...props }: AlertDialogContentProps): import("react").JSX.Element;
type AlertDialogHeaderProps = ComponentPropsWithRef<"div">;
declare function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps): import("react").JSX.Element;
type AlertDialogBodyProps = ComponentPropsWithRef<"div">;
declare function AlertDialogBody({ className, ...props }: AlertDialogBodyProps): import("react").JSX.Element;
type AlertDialogFooterProps = ComponentPropsWithRef<"div">;
declare function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps): import("react").JSX.Element;
type AlertDialogTitleProps = StyledProps<Dialog$1.Title.Props>;
declare function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps): import("react").JSX.Element;
type AlertDialogDescriptionProps = StyledProps<Dialog$1.Description.Props>;
declare function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps): import("react").JSX.Element;
type AlertDialogActionProps = ButtonProps;
declare function AlertDialogAction(props: AlertDialogActionProps): import("react").JSX.Element;
type AlertDialogCancelProps = Omit<Dialog$1.Close.Props, "render"> & Pick<ButtonProps, "variant" | "size"> & {
  className?: string;
};
declare function AlertDialogCancel({ className, variant, size, ...props }: AlertDialogCancelProps): import("react").JSX.Element;
//#endregion
//#region src/components/dialog/dialog.d.ts
type DialogProps = Dialog$1.Root.Props;
declare function Dialog(props: DialogProps): import("react").JSX.Element;
type DialogTriggerProps = Dialog$1.Trigger.Props;
declare function DialogTrigger(props: DialogTriggerProps): import("react").JSX.Element;
type DialogPortalProps = Dialog$1.Portal.Props;
declare function DialogPortal(props: DialogPortalProps): import("react").JSX.Element;
type DialogOverlayProps = StyledProps<Dialog$1.Backdrop.Props>;
declare function DialogOverlay({ className, ...props }: DialogOverlayProps): import("react").JSX.Element;
type DialogContentProps = StyledProps<Dialog$1.Popup.Props> & {
  portalProps?: DialogPortalProps;
  overlay?: false | DialogOverlayProps;
};
declare function DialogContent({ className, children, portalProps, overlay, ...props }: DialogContentProps): import("react").JSX.Element;
type DialogCloseProps = Dialog$1.Close.Props & Pick<ButtonProps, "variant" | "size"> & {
  className?: string;
  children?: ReactNode;
};
declare function DialogClose({ className, variant, size, children, render, ...props }: DialogCloseProps): import("react").JSX.Element;
type DialogHeaderProps = ComponentPropsWithRef<"div">;
declare function DialogHeader({ className, ...props }: DialogHeaderProps): import("react").JSX.Element;
type DialogBodyProps = ComponentPropsWithRef<"div">;
declare function DialogBody({ className, ...props }: DialogBodyProps): import("react").JSX.Element;
type DialogFooterProps = ComponentPropsWithRef<"div">;
declare function DialogFooter({ className, ...props }: DialogFooterProps): import("react").JSX.Element;
type DialogTitleProps = StyledProps<Dialog$1.Title.Props>;
declare function DialogTitle({ className, ...props }: DialogTitleProps): import("react").JSX.Element;
type DialogDescriptionProps = StyledProps<Dialog$1.Description.Props>;
declare function DialogDescription({ className, ...props }: DialogDescriptionProps): import("react").JSX.Element;
//#endregion
//#region src/components/drawer/drawer.d.ts
type DrawerProps = Drawer$1.Root.Props;
declare function Drawer({ modal, snapPoints, swipeDirection, ...props }: DrawerProps): import("react").JSX.Element;
type DrawerTriggerProps = Drawer$1.Trigger.Props;
declare function DrawerTrigger(props: DrawerTriggerProps): import("react").JSX.Element;
type DrawerPortalProps = Drawer$1.Portal.Props;
declare function DrawerPortal(props: DrawerPortalProps): import("react").JSX.Element;
type DrawerOverlayProps = StyledProps<Drawer$1.Backdrop.Props>;
declare function DrawerOverlay({ className, ...props }: DrawerOverlayProps): import("react").JSX.Element;
type DrawerContentProps = StyledProps<Drawer$1.Popup.Props> & {
  portalProps?: DrawerPortalProps;
};
declare function DrawerContent({ className, children, portalProps, ...props }: DrawerContentProps): import("react").JSX.Element;
type DrawerCloseProps = StyledProps<Drawer$1.Close.Props> & Pick<ButtonProps, "variant" | "size">;
declare function DrawerClose({ className, variant, size, children, render, ...props }: DrawerCloseProps): import("react").JSX.Element;
type DrawerHeaderProps = useRender.ComponentProps<"div">;
declare function DrawerHeader({ className, render, ...props }: DrawerHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type DrawerFooterProps = useRender.ComponentProps<"div">;
declare function DrawerFooter({ className, render, ...props }: DrawerFooterProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type DrawerBodyProps = useRender.ComponentProps<"div">;
declare function DrawerBody({ className, render, ...props }: DrawerBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type DrawerActionsProps = useRender.ComponentProps<"div">;
declare function DrawerActions({ className, render, children, ...props }: DrawerActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type DrawerTitleProps = StyledProps<Drawer$1.Title.Props>;
declare function DrawerTitle({ className, ...props }: DrawerTitleProps): import("react").JSX.Element;
type DrawerDescriptionProps = StyledProps<Drawer$1.Description.Props>;
declare function DrawerDescription({ className, ...props }: DrawerDescriptionProps): import("react").JSX.Element;
//#endregion
//#region src/components/card/card.recipe.d.ts
declare const card: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      leading: string[];
      title: string[];
      description: string[];
      footer: string[];
    };
    elegant: {
      leading: string[];
      title: string[];
      description: string[];
      footer: string[];
    };
  };
  variant: {
    default: {};
    inset: {};
  };
}, {
  root: string[];
  header: string[];
  title: string[];
  leading: string[];
  description: string[];
  trailing: string[];
  content: string[];
  footer: string[];
}, undefined, {
  theme: {
    brutal: {
      leading: string[];
      title: string[];
      description: string[];
      footer: string[];
    };
    elegant: {
      leading: string[];
      title: string[];
      description: string[];
      footer: string[];
    };
  };
  variant: {
    default: {};
    inset: {};
  };
}, {
  root: string[];
  header: string[];
  title: string[];
  leading: string[];
  description: string[];
  trailing: string[];
  content: string[];
  footer: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      leading: string[];
      title: string[];
      description: string[];
      footer: string[];
    };
    elegant: {
      leading: string[];
      title: string[];
      description: string[];
      footer: string[];
    };
  };
  variant: {
    default: {};
    inset: {};
  };
}, {
  root: string[];
  header: string[];
  title: string[];
  leading: string[];
  description: string[];
  trailing: string[];
  content: string[];
  footer: string[];
}>>;
//#endregion
//#region src/components/card/card.d.ts
type CardProps = useRender.ComponentProps<"div"> & Omit<VariantProps<typeof card>, "theme">;
declare function Card({ className, render, variant, ...props }: CardProps): import("react").JSX.Element;
type CardHeaderProps = useRender.ComponentProps<"div">;
declare function CardHeader({ className, render, ...props }: CardHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CardTitleProps = useRender.ComponentProps<"div">;
declare function CardTitle({ className, render, ...props }: CardTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CardLeadingProps = useRender.ComponentProps<"div">;
declare function CardLeading({ className, render, ...props }: CardLeadingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CardDescriptionProps = useRender.ComponentProps<"div">;
declare function CardDescription({ className, render, ...props }: CardDescriptionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CardTrailingProps = useRender.ComponentProps<"div">;
declare function CardTrailing({ className, render, ...props }: CardTrailingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CardContentProps = useRender.ComponentProps<"div">;
declare function CardContent({ className, render, ...props }: CardContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CardFooterProps = useRender.ComponentProps<"div">;
declare function CardFooter({ className, render, ...props }: CardFooterProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/status/status.d.ts
declare const status$1: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {};
    elegant: {};
  };
  size: {
    xs: {
      root: string;
    };
    sm: {
      root: string;
    };
    md: {
      root: string;
    };
    lg: {
      root: string;
    };
  };
  pulse: {
    true: {
      root: string;
    };
    false: {
      root: string;
    };
  };
  attention: {
    true: {
      root: string;
    };
    false: {
      root: string;
    };
  };
}, undefined, undefined, {
  theme: {
    brutal: {
      root: string;
    };
    elegant: {};
  };
  variant: {
    default: {
      root: string;
    };
    primary: {
      root: string;
    };
    information: {
      root: string;
    };
    muted: {
      root: string;
    };
    accent: {
      root: string;
    };
    success: {
      root: string;
    };
    warning: {
      root: string;
    };
    danger: {
      root: string;
    };
  };
}, {
  root: string[];
}, import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string;
    };
    elegant: {};
  };
  variant: {
    default: {
      root: string;
    };
    primary: {
      root: string;
    };
    information: {
      root: string;
    };
    muted: {
      root: string;
    };
    accent: {
      root: string;
    };
    success: {
      root: string;
    };
    warning: {
      root: string;
    };
    danger: {
      root: string;
    };
  };
}, {
  root: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string;
    };
    elegant: {};
  };
  variant: {
    default: {
      root: string;
    };
    primary: {
      root: string;
    };
    information: {
      root: string;
    };
    muted: {
      root: string;
    };
    accent: {
      root: string;
    };
    success: {
      root: string;
    };
    warning: {
      root: string;
    };
    danger: {
      root: string;
    };
  };
}, {
  root: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string;
    };
    elegant: {};
  };
  variant: {
    default: {
      root: string;
    };
    primary: {
      root: string;
    };
    information: {
      root: string;
    };
    muted: {
      root: string;
    };
    accent: {
      root: string;
    };
    success: {
      root: string;
    };
    warning: {
      root: string;
    };
    danger: {
      root: string;
    };
  };
}, {
  root: string[];
}>>>;
type StatusProps = Omit<useRender.ComponentProps<"span">, "children"> & Omit<VariantProps<typeof status$1>, "theme">;
declare function StatusRoot({ size, variant, pulse, attention, className, render, ...props }: StatusProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare const Status: typeof StatusRoot;
//#endregion
//#region src/components/app-rail/app-rail.d.ts
type AppRailRootProps = useRender.ComponentProps<"div">;
declare function AppRailRoot({ className, render, ...props }: AppRailRootProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppRailHeaderProps = useRender.ComponentProps<"div">;
declare function AppRailHeader({ className, render, ...props }: AppRailHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppRailNavProps = useRender.ComponentProps<"nav">;
declare function AppRailNav({ className, render, ...props }: AppRailNavProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppRailItemProps = useRender.ComponentProps<"button"> & {
  nativeButton?: boolean;
  selected?: boolean;
};
declare function AppRailItem({ nativeButton, selected, disabled, className, render, ...props }: AppRailItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppRailItemIconProps = useRender.ComponentProps<"span">;
declare function AppRailItemIcon({ className, render, ...props }: AppRailItemIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppRailItemAttentionProps = {
  title?: string;
  children: ReactNode;
};
declare function AppRailItemAttention({ title, children }: AppRailItemAttentionProps): import("react").JSX.Element;
type AppRailItemAttentionMaskProps = useRender.ComponentProps<"span">;
declare function AppRailItemAttentionMask({ className, render, ...props }: AppRailItemAttentionMaskProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppRailItemLabelProps = useRender.ComponentProps<"span">;
declare function AppRailItemLabel({ className, render, ...props }: AppRailItemLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppRailItemBadgeProps = useRender.ComponentProps<"span">;
declare function AppRailItemBadge({ className, render, ...props }: AppRailItemBadgeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppRailItemIndicatorProps = StatusProps;
declare function AppRailItemIndicator({ className, size, variant, attention, ...props }: AppRailItemIndicatorProps): import("react").JSX.Element;
type AppRailFooterProps = useRender.ComponentProps<"div">;
declare function AppRailFooter({ className, render, ...props }: AppRailFooterProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/copyable-code/copyable-code.d.ts
declare const copyableCode: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      code: string[];
      codeInner: string;
    };
    elegant: {
      code: string[];
      codeInner: string[];
      action: string[];
    };
  };
  size: {
    sm: {
      code: string;
    };
    md: {
      code: string;
    };
  };
}, {
  root: string[];
  code: string[];
  codeInner: string[];
  action: string[];
  iconSwap: string[];
}, undefined, {
  theme: {
    brutal: {
      code: string[];
      codeInner: string;
    };
    elegant: {
      code: string[];
      codeInner: string[];
      action: string[];
    };
  };
  size: {
    sm: {
      code: string;
    };
    md: {
      code: string;
    };
  };
}, {
  root: string[];
  code: string[];
  codeInner: string[];
  action: string[];
  iconSwap: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      code: string[];
      codeInner: string;
    };
    elegant: {
      code: string[];
      codeInner: string[];
      action: string[];
    };
  };
  size: {
    sm: {
      code: string;
    };
    md: {
      code: string;
    };
  };
}, {
  root: string[];
  code: string[];
  codeInner: string[];
  action: string[];
  iconSwap: string[];
}>>;
type CopyableCodeRootProps = Omit<ComponentPropsWithRef<"div">, "onCopy"> & Pick<VariantProps<typeof copyableCode>, "size"> & {
  copied?: boolean;
  onCopy?: (value: string) => void | Promise<void>;
};
declare function CopyableCodeRoot({ copied, onCopy, size, className, ...props }: CopyableCodeRootProps): import("react").JSX.Element;
type CopyableCodeProps = ComponentPropsWithRef<"code"> & {
  truncate?: boolean;
};
declare function CopyableCode({ children, className, truncate, ...props }: CopyableCodeProps): import("react").JSX.Element;
type CopyableCodeActionProps = Omit<ButtonProps, "children" | "className"> & {
  buttonClassName?: string;
  className?: string;
  children?: ReactNode | ((state: {
    copied: boolean;
  }) => ReactNode);
};
declare function CopyableCodeAction({ children, buttonClassName, className, onClick, size, variant, ...props }: CopyableCodeActionProps): import("react").JSX.Element;
//#endregion
//#region src/components/checkbox/checkbox.d.ts
declare const checkbox: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {};
    elegant: {
      root: string[];
      graphic: string[];
    };
  };
  variant: {
    default: {};
    primary: {};
  };
  color: {
    default: {};
    primary: {};
  };
  size: {
    sm: {
      root: string;
    };
    md: {
      root: string;
    };
    lg: {
      root: string;
    };
  };
}, {
  root: string[];
  indicator: string[];
  graphic: string[];
  outerRect: string[];
  overlayRect: string[];
  mark: string[];
  checkMark: string[];
  indeterminateMark: string[];
}, undefined, {
  theme: {
    brutal: {};
    elegant: {
      root: string[];
      graphic: string[];
    };
  };
  variant: {
    default: {};
    primary: {};
  };
  color: {
    default: {};
    primary: {};
  };
  size: {
    sm: {
      root: string;
    };
    md: {
      root: string;
    };
    lg: {
      root: string;
    };
  };
}, {
  root: string[];
  indicator: string[];
  graphic: string[];
  outerRect: string[];
  overlayRect: string[];
  mark: string[];
  checkMark: string[];
  indeterminateMark: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {};
    elegant: {
      root: string[];
      graphic: string[];
    };
  };
  variant: {
    default: {};
    primary: {};
  };
  color: {
    default: {};
    primary: {};
  };
  size: {
    sm: {
      root: string;
    };
    md: {
      root: string;
    };
    lg: {
      root: string;
    };
  };
}, {
  root: string[];
  indicator: string[];
  graphic: string[];
  outerRect: string[];
  overlayRect: string[];
  mark: string[];
  checkMark: string[];
  indeterminateMark: string[];
}>>;
type CheckboxProps = StyledProps<Checkbox$1.Root.Props> & Omit<VariantProps<typeof checkbox>, "theme"> & {
  shape?: "square" | "circle";
};
declare function Checkbox({ size, color, variant, shape, className, ...props }: CheckboxProps): import("react").JSX.Element;
//#endregion
//#region src/components/sidebar/sidebar.d.ts
type SidebarRootProps = useRender.ComponentProps<"div">;
declare function SidebarRoot({ className, render, ...props }: SidebarRootProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarHeaderProps = useRender.ComponentProps<"div">;
declare function SidebarHeader({ children, className, render, ...props }: SidebarHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarHeaderTitleProps = useRender.ComponentProps<"div">;
declare function SidebarHeaderTitle({ className, render, ...props }: SidebarHeaderTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarGroupLabelProps = useRender.ComponentProps<"div">;
declare function SidebarGroupLabel({ className, render, ...props }: SidebarGroupLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarBodyProps = useRender.ComponentProps<"div">;
declare function SidebarBody({ className, render, ...props }: SidebarBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarContentProps = useRender.ComponentProps<"div">;
declare function SidebarContent({ children, className, render, ...props }: SidebarContentProps): import("react").JSX.Element;
type SidebarLiveActivityProps = useRender.ComponentProps<"div">;
declare function SidebarLiveActivity({ children, className, render, ...props }: SidebarLiveActivityProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/sidebar/sidebar-menu.d.ts
type SidebarMenuProps = useRender.ComponentProps<"button">;
declare function SidebarMenu({ className, render, ...props }: SidebarMenuProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarMenuIconProps = useRender.ComponentProps<"span">;
declare function SidebarMenuIcon({ className, render, ...props }: SidebarMenuIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarMenuTitleProps = useRender.ComponentProps<"span">;
declare function SidebarMenuTitle({ className, render, ...props }: SidebarMenuTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarMenuAsideProps = useRender.ComponentProps<"span">;
declare function SidebarMenuAside({ className, render, ...props }: SidebarMenuAsideProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarMenuCountProps = useRender.ComponentProps<"span">;
declare function SidebarMenuCount({ className, render, ...props }: SidebarMenuCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/badge/badge.d.ts
declare const badge: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  appearance: {
    solid: {
      root: string;
    };
    soft: {
      root: string;
    };
    outline: {
      root: string;
    };
  };
  variant: {
    default: {
      root: string;
    };
    primary: {
      root: string;
    };
    information: {
      root: string;
    };
    muted: {
      root: string;
    };
    accent: {
      root: string;
    };
    success: {
      root: string;
    };
    warning: {
      root: string;
    };
    danger: {
      root: string;
    };
  };
  uppercase: {
    true: {
      root: string;
    };
    false: {
      root: string;
    };
  };
}, {
  root: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  appearance: {
    solid: {
      root: string;
    };
    soft: {
      root: string;
    };
    outline: {
      root: string;
    };
  };
  variant: {
    default: {
      root: string;
    };
    primary: {
      root: string;
    };
    information: {
      root: string;
    };
    muted: {
      root: string;
    };
    accent: {
      root: string;
    };
    success: {
      root: string;
    };
    warning: {
      root: string;
    };
    danger: {
      root: string;
    };
  };
  uppercase: {
    true: {
      root: string;
    };
    false: {
      root: string;
    };
  };
}, {
  root: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  appearance: {
    solid: {
      root: string;
    };
    soft: {
      root: string;
    };
    outline: {
      root: string;
    };
  };
  variant: {
    default: {
      root: string;
    };
    primary: {
      root: string;
    };
    information: {
      root: string;
    };
    muted: {
      root: string;
    };
    accent: {
      root: string;
    };
    success: {
      root: string;
    };
    warning: {
      root: string;
    };
    danger: {
      root: string;
    };
  };
  uppercase: {
    true: {
      root: string;
    };
    false: {
      root: string;
    };
  };
}, {
  root: string[];
}>>;
type BadgeProps = useRender.ComponentProps<"span"> & Omit<VariantProps<typeof badge>, "theme">;
declare function BadgeRoot({ appearance, variant, uppercase, className, render, ...props }: BadgeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function Experimental(props: Omit<BadgeProps, "appearance" | "variant" | "uppercase">): import("react").JSX.Element;
declare const Badge: typeof BadgeRoot & {
  Experimental: typeof Experimental;
};
//#endregion
//#region src/components/sidebar/sidebar-item.recipe.d.ts
declare const sidebarItemRecipe: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      sidebarItem: string[];
      sidebarItemTitle: string;
      sidebarItemChannelIcon: string;
      sidebarItemSubtitle: string;
      sidebarItemMeta: string[];
      sidebarItemStatus: string[];
      sidebarItemIndicator: string[];
      sidebarItemMetaIcon: string;
      sidebarItemCount: string[];
    };
    elegant: {
      sidebarItem: string[];
      sidebarItemTitle: string;
      sidebarItemIcon: string;
      sidebarItemChannelIcon: string;
      sidebarItemSubtitle: string;
      sidebarItemMeta: string[];
      sidebarItemStatus: string[];
      sidebarItemIndicator: string[];
      sidebarItemMetaIcon: string;
      sidebarItemCount: string[];
    };
  };
  variant: {
    default: {};
    primary: {};
    accent: {};
  };
  stacked: {
    false: {
      sidebarItemContent: string[];
    };
    true: {
      sidebarItemContent: string[];
    };
  };
}, {
  sidebarItem: string[];
  sidebarItemIcon: string[];
  sidebarItemChannelIcon: string[];
  sidebarItemContent: string[];
  sidebarItemTitle: string[];
  sidebarItemSubtitle: string[];
  sidebarItemMeta: string[];
  sidebarItemStatus: string[];
  sidebarItemIndicator: string[];
  sidebarItemMetaIcon: string[];
  sidebarItemAside: string[];
  sidebarItemCount: string[];
}, undefined, {
  theme: {
    brutal: {
      sidebarItem: string[];
      sidebarItemTitle: string;
      sidebarItemChannelIcon: string;
      sidebarItemSubtitle: string;
      sidebarItemMeta: string[];
      sidebarItemStatus: string[];
      sidebarItemIndicator: string[];
      sidebarItemMetaIcon: string;
      sidebarItemCount: string[];
    };
    elegant: {
      sidebarItem: string[];
      sidebarItemTitle: string;
      sidebarItemIcon: string;
      sidebarItemChannelIcon: string;
      sidebarItemSubtitle: string;
      sidebarItemMeta: string[];
      sidebarItemStatus: string[];
      sidebarItemIndicator: string[];
      sidebarItemMetaIcon: string;
      sidebarItemCount: string[];
    };
  };
  variant: {
    default: {};
    primary: {};
    accent: {};
  };
  stacked: {
    false: {
      sidebarItemContent: string[];
    };
    true: {
      sidebarItemContent: string[];
    };
  };
}, {
  sidebarItem: string[];
  sidebarItemIcon: string[];
  sidebarItemChannelIcon: string[];
  sidebarItemContent: string[];
  sidebarItemTitle: string[];
  sidebarItemSubtitle: string[];
  sidebarItemMeta: string[];
  sidebarItemStatus: string[];
  sidebarItemIndicator: string[];
  sidebarItemMetaIcon: string[];
  sidebarItemAside: string[];
  sidebarItemCount: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      sidebarItem: string[];
      sidebarItemTitle: string;
      sidebarItemChannelIcon: string;
      sidebarItemSubtitle: string;
      sidebarItemMeta: string[];
      sidebarItemStatus: string[];
      sidebarItemIndicator: string[];
      sidebarItemMetaIcon: string;
      sidebarItemCount: string[];
    };
    elegant: {
      sidebarItem: string[];
      sidebarItemTitle: string;
      sidebarItemIcon: string;
      sidebarItemChannelIcon: string;
      sidebarItemSubtitle: string;
      sidebarItemMeta: string[];
      sidebarItemStatus: string[];
      sidebarItemIndicator: string[];
      sidebarItemMetaIcon: string;
      sidebarItemCount: string[];
    };
  };
  variant: {
    default: {};
    primary: {};
    accent: {};
  };
  stacked: {
    false: {
      sidebarItemContent: string[];
    };
    true: {
      sidebarItemContent: string[];
    };
  };
}, {
  sidebarItem: string[];
  sidebarItemIcon: string[];
  sidebarItemChannelIcon: string[];
  sidebarItemContent: string[];
  sidebarItemTitle: string[];
  sidebarItemSubtitle: string[];
  sidebarItemMeta: string[];
  sidebarItemStatus: string[];
  sidebarItemIndicator: string[];
  sidebarItemMetaIcon: string[];
  sidebarItemAside: string[];
  sidebarItemCount: string[];
}>>;
//#endregion
//#region src/components/sidebar/sidebar-item.d.ts
type SidebarItemRootProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};
type SidebarItemVariant = NonNullable<VariantProps<typeof sidebarItemRecipe>["variant"]>;
type SidebarItemProps = SidebarItemRootProps & Pick<VariantProps<typeof sidebarItemRecipe>, "variant">;
declare function SidebarItem({ className, variant, ...props }: SidebarItemProps): import("react").JSX.Element;
type SidebarItemIconProps = useRender.ComponentProps<"span">;
declare function SidebarItemIcon({ className, render, ...props }: SidebarItemIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemChannelIconProps = useRender.ComponentProps<"span">;
declare function SidebarItemChannelIcon({ className, render, ...props }: SidebarItemChannelIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemContentProps = useRender.ComponentProps<"span"> & {
  stacked?: boolean;
};
declare function SidebarItemContent({ className, render, stacked, ...props }: SidebarItemContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemTitleProps = useRender.ComponentProps<"span">;
declare function SidebarItemTitle({ className, render, ...props }: SidebarItemTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemSubtitleProps = useRender.ComponentProps<"span">;
declare function SidebarItemSubtitle({ className, render, ...props }: SidebarItemSubtitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemMetaProps = useRender.ComponentProps<"span">;
declare function SidebarItemMeta({ className, render, ...props }: SidebarItemMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemStatusProps = useRender.ComponentProps<"span">;
declare function SidebarItemStatus({ className, render, ...props }: SidebarItemStatusProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemIndicatorProps = BadgeProps;
declare function SidebarItemIndicator({ appearance, className, uppercase, variant, ...props }: SidebarItemIndicatorProps): import("react").JSX.Element;
type SidebarItemMetaIconProps = useRender.ComponentProps<"span">;
declare function SidebarItemMetaIcon({ className, render, ...props }: SidebarItemMetaIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemAsideProps = useRender.ComponentProps<"span">;
declare function SidebarItemAside({ className, render, ...props }: SidebarItemAsideProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarItemCountProps = BadgeProps;
declare function SidebarItemCount({ appearance, className, uppercase, variant, ...props }: SidebarItemCountProps): import("react").JSX.Element;
//#endregion
//#region src/components/sidebar/sidebar-section.d.ts
type SidebarSectionProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};
declare function SidebarSection({ className, defaultOpen, render, ...props }: SidebarSectionProps): import("react").JSX.Element;
type SidebarListProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};
declare function SidebarList({ className, render, ...props }: SidebarListProps): import("react").JSX.Element;
type SidebarSectionEmptyProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};
declare function SidebarSectionEmpty({ className, render, ...props }: SidebarSectionEmptyProps): import("react").JSX.Element;
type SidebarSectionHeaderProps = useRender.ComponentProps<"div">;
declare function SidebarSectionHeader({ className, render, ...props }: SidebarSectionHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarSectionDisclosureProps = useRender.ComponentProps<"button">;
declare function SidebarSectionDisclosure({ className, render, ...props }: SidebarSectionDisclosureProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarSectionChevronProps = useRender.ComponentProps<"svg">;
declare function SidebarSectionChevron({ className, render, ...props }: SidebarSectionChevronProps): import("react").JSX.Element;
type SidebarSectionTitleProps = useRender.ComponentProps<"span">;
declare function SidebarSectionTitle({ className, render, ...props }: SidebarSectionTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarSectionCountProps = useRender.ComponentProps<"span">;
declare function SidebarSectionCount({ className, render, ...props }: SidebarSectionCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarSectionAttentionProps = StatusProps;
declare function SidebarSectionAttention({ className, size, variant, ...props }: SidebarSectionAttentionProps): import("react").JSX.Element;
type SidebarSectionTrailingProps = useRender.ComponentProps<"div">;
type SidebarSectionControlsProps = useRender.ComponentProps<"div">;
declare function SidebarSectionTrailing({ className, render, ...props }: SidebarSectionTrailingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function SidebarSectionControls({ className, render, ...props }: SidebarSectionControlsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SidebarSectionControlProps = useRender.ComponentProps<"button"> & Pick<ButtonProps, "size" | "variant" | "loading" | "loadingLabel">;
declare function SidebarSectionControl({ className, render, size, variant, loading, loadingLabel, children, disabled, ...props }: SidebarSectionControlProps): import("react").JSX.Element;
type SidebarControlProps = SidebarSectionControlProps;
declare const SidebarControl: typeof SidebarSectionControl;
//#endregion
//#region src/components/panel/panel.d.ts
type PanelEdge = "attached" | "inset";
type PanelProps = useRender.ComponentProps<"section"> & {
  edge?: PanelEdge;
};
declare function Panel({ className, edge, render, ...props }: PanelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelHeaderRootProps = useRender.ComponentProps<"div">;
/**
 * Bare header bar: fixed height and centered flex row, no border, fill, or padding.
 * Shared base for `PanelHeader`, `PanelSectionHeader`, and panel-specific headers
 * such as `ThreadPanelHeader` — it is not exclusive to `PanelHeader`.
 */
declare function PanelHeaderRoot({ className, render, ...props }: PanelHeaderRootProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelBodyProps = useRender.ComponentProps<"div">;
declare function PanelBody({ className, render, ...props }: PanelBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelScrollViewportProps = useRender.ComponentProps<"div">;
declare function PanelScrollViewport({ className, render, ...props }: PanelScrollViewportProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelScrollContentProps = useRender.ComponentProps<"div">;
declare function PanelScrollContent({ className, render, ...props }: PanelScrollContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelSectionProps = useRender.ComponentProps<"section">;
declare function PanelSection({ className, render, ...props }: PanelSectionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelFooterProps = useRender.ComponentProps<"div">;
declare function PanelFooter({ className, render, ...props }: PanelFooterProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/conversation-panel/conversation-panel.d.ts
type ConversationPanelRootProps = useRender.ComponentProps<"section"> & {
  edge?: PanelEdge;
};
declare function ConversationPanelRoot({ className, edge, render, ...props }: ConversationPanelRootProps): import("react").JSX.Element;
type ConversationPanelContentProps = useRender.ComponentProps<"div">;
/**
 * Content region below the conversation header. A single container hosting tabs,
 * body, and footer; elegant mobile sits flush to the bottom with top radius
 * and top gap only; desktop keeps the left inset / rounded-tl treatment.
 */
declare function ConversationPanelContent({ className, render, ...props }: ConversationPanelContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ConversationPanelBodyProps = useRender.ComponentProps<"div">;
declare function ConversationPanelBody({ className, render, ...props }: ConversationPanelBodyProps): import("react").JSX.Element;
type ConversationPanelTabsProps = useRender.ComponentProps<"div">;
declare function ConversationPanelTabs({ className, render, ...props }: ConversationPanelTabsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ConversationPanelFooterProps = useRender.ComponentProps<"div">;
declare function ConversationPanelFooter({ className, render, ...props }: ConversationPanelFooterProps): import("react").JSX.Element;
//#endregion
//#region src/components/conversation-panel/conversation-panel-empty-state.d.ts
type ConversationPanelEmptyStateProps = useRender.ComponentProps<"div">;
declare function ConversationPanelEmptyState({ className, render, ...props }: ConversationPanelEmptyStateProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ConversationPanelEmptyStateBrandProps = useRender.ComponentProps<"div">;
declare function ConversationPanelEmptyStateBrand({ className, render, ...props }: ConversationPanelEmptyStateBrandProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ConversationPanelEmptyStateBrandMarkProps = useRender.ComponentProps<"div">;
declare function ConversationPanelEmptyStateBrandMark({ className, render, ...props }: ConversationPanelEmptyStateBrandMarkProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/kbd/kbd.d.ts
type KbdProps = ComponentPropsWithRef<"kbd">;
declare function Kbd({ className, ...props }: KbdProps): import("react").JSX.Element;
type KbdGroupProps = ComponentPropsWithRef<"span">;
declare function KbdGroup({ className, ...props }: KbdGroupProps): import("react").JSX.Element;
//#endregion
//#region src/components/context-menu/context-menu.d.ts
type ContextMenuProps = ContextMenu$1.Root.Props;
declare function ContextMenu(props: ContextMenuProps): import("react").JSX.Element;
type ContextMenuSubmenuProps = ContextMenu$1.SubmenuRoot.Props;
declare function ContextMenuSubmenu(props: ContextMenuSubmenuProps): import("react").JSX.Element;
type ContextMenuTriggerProps = StyledProps<ContextMenu$1.Trigger.Props>;
declare function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps): import("react").JSX.Element;
type ContextMenuPortalProps = ContextMenu$1.Portal.Props;
declare function ContextMenuPortal(props: ContextMenuPortalProps): import("react").JSX.Element;
type ContextMenuContentProps = StyledProps<ContextMenu$1.Popup.Props> & Partial<Pick<ContextMenu$1.Positioner.Props, "align" | "alignOffset" | "anchor" | "arrowPadding" | "collisionAvoidance" | "collisionBoundary" | "collisionPadding" | "disableAnchorTracking" | "positionMethod" | "side" | "sideOffset" | "sticky">> & {
  portalProps?: ContextMenuPortalProps;
};
declare function ContextMenuContent({ align, alignOffset, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking, positionMethod, side, sideOffset, sticky, portalProps, className, ...props }: ContextMenuContentProps): import("react").JSX.Element;
type ContextMenuPopupProps = ComponentPropsWithRef<"div">;
declare function ContextMenuPopup({ className, ...props }: ContextMenuPopupProps): import("react").JSX.Element;
type ContextMenuItemProps = StyledProps<ContextMenu$1.Item.Props>;
declare function ContextMenuItem({ className, ...props }: ContextMenuItemProps): import("react").JSX.Element;
type ContextMenuItemLabelProps = StyledProps<ComponentPropsWithRef<"span">>;
declare function ContextMenuItemLabel({ className, ...props }: ContextMenuItemLabelProps): import("react").JSX.Element;
type ContextMenuFooterProps = StyledProps<ComponentPropsWithRef<"div">>;
declare function ContextMenuFooter({ className, ...props }: ContextMenuFooterProps): import("react").JSX.Element;
type ContextMenuSubmenuTriggerProps = StyledProps<ContextMenu$1.SubmenuTrigger.Props>;
declare function ContextMenuSubmenuTrigger({ className, ...props }: ContextMenuSubmenuTriggerProps): import("react").JSX.Element;
type ContextMenuLabelProps = StyledProps<ComponentPropsWithRef<"div">>;
declare function ContextMenuLabel({ className, ...props }: ContextMenuLabelProps): import("react").JSX.Element;
type ContextMenuShortcutProps = KbdProps;
declare function ContextMenuShortcut({ className, ...props }: ContextMenuShortcutProps): import("react").JSX.Element;
type ContextMenuSeparatorProps = StyledProps<ContextMenu$1.Separator.Props>;
declare function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps): import("react").JSX.Element;
type ContextMenuRadioGroupProps = StyledProps<ContextMenu$1.RadioGroup.Props>;
declare function ContextMenuRadioGroup({ ...props }: ContextMenuRadioGroupProps): import("react").JSX.Element;
type ContextMenuRadioItemProps = StyledProps<ContextMenu$1.RadioItem.Props>;
declare function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps): import("react").JSX.Element;
type ContextMenuRadioItemIndicatorProps = StyledProps<ContextMenu$1.RadioItemIndicator.Props>;
declare function ContextMenuRadioItemIndicator({ className, ...props }: ContextMenuRadioItemIndicatorProps): import("react").JSX.Element;
type ContextMenuCheckboxItemProps = StyledProps<ContextMenu$1.CheckboxItem.Props>;
declare function ContextMenuCheckboxItem({ className, children, ...props }: ContextMenuCheckboxItemProps): import("react").JSX.Element;
type ContextMenuCheckboxItemIndicatorProps = StyledProps<ContextMenu$1.CheckboxItemIndicator.Props>;
declare function ContextMenuCheckboxItemIndicator({ className, ...props }: ContextMenuCheckboxItemIndicatorProps): import("react").JSX.Element;
//#endregion
//#region src/components/dropdown-menu/dropdown-menu.d.ts
type DropdownMenuProps = Menu.Root.Props;
declare function DropdownMenu(props: DropdownMenuProps): import("react").JSX.Element;
type DropdownMenuSubmenuProps = Menu.SubmenuRoot.Props;
declare function DropdownMenuSubmenu(props: DropdownMenuSubmenuProps): import("react").JSX.Element;
type DropdownMenuTriggerProps = StyledProps<Menu.Trigger.Props>;
declare function DropdownMenuTrigger({ className, render, ...props }: DropdownMenuTriggerProps): import("react").JSX.Element;
type DropdownMenuPortalProps = Menu.Portal.Props;
declare function DropdownMenuPortal(props: DropdownMenuPortalProps): import("react").JSX.Element;
type DropdownMenuPopupProps = ComponentPropsWithRef<"div">;
declare function DropdownMenuPopup({ className, ...props }: DropdownMenuPopupProps): import("react").JSX.Element;
type DropdownMenuContentProps = StyledProps<Menu.Popup.Props> & Pick<Menu.Positioner.Props, "align" | "alignOffset" | "anchor" | "arrowPadding" | "collisionAvoidance" | "collisionBoundary" | "collisionPadding" | "disableAnchorTracking" | "positionMethod" | "side" | "sideOffset" | "sticky"> & {
  portalProps?: DropdownMenuPortalProps;
};
declare function DropdownMenuContent({ align, alignOffset, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking, positionMethod, side, sideOffset, sticky, portalProps, className, ...props }: DropdownMenuContentProps): import("react").JSX.Element;
type DropdownMenuItemProps = StyledProps<Menu.Item.Props>;
declare function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps): import("react").JSX.Element;
type DropdownMenuItemLabelProps = StyledProps<ComponentPropsWithRef<"span">>;
declare function DropdownMenuItemLabel({ className, ...props }: DropdownMenuItemLabelProps): import("react").JSX.Element;
type DropdownMenuFooterProps = StyledProps<ComponentPropsWithRef<"div">>;
declare function DropdownMenuFooter({ className, ...props }: DropdownMenuFooterProps): import("react").JSX.Element;
type DropdownMenuSubmenuTriggerProps = StyledProps<Menu.SubmenuTrigger.Props>;
declare function DropdownMenuSubmenuTrigger({ className, ...props }: DropdownMenuSubmenuTriggerProps): import("react").JSX.Element;
type DropdownMenuLabelProps = StyledProps<ComponentPropsWithRef<"div">>;
declare function DropdownMenuLabel({ className, ...props }: DropdownMenuLabelProps): import("react").JSX.Element;
type DropdownMenuShortcutProps = KbdProps;
declare function DropdownMenuShortcut({ className, ...props }: DropdownMenuShortcutProps): import("react").JSX.Element;
type DropdownMenuItemCountProps = BadgeProps;
declare function DropdownMenuItemCount({ className, ...props }: DropdownMenuItemCountProps): import("react").JSX.Element;
type DropdownMenuSeparatorProps = StyledProps<Menu.Separator.Props>;
declare function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps): import("react").JSX.Element;
type DropdownMenuRadioGroupProps = StyledProps<Menu.RadioGroup.Props>;
declare function DropdownMenuRadioGroup({ ...props }: DropdownMenuRadioGroupProps): import("react").JSX.Element;
type DropdownMenuRadioItemProps = StyledProps<Menu.RadioItem.Props>;
declare function DropdownMenuRadioItem({ className, children, ...props }: DropdownMenuRadioItemProps): import("react").JSX.Element;
type DropdownMenuRadioItemIndicatorProps = StyledProps<Menu.RadioItemIndicator.Props>;
declare function DropdownMenuRadioItemIndicator({ className, ...props }: DropdownMenuRadioItemIndicatorProps): import("react").JSX.Element;
type DropdownMenuCheckboxItemProps = StyledProps<Menu.CheckboxItem.Props>;
declare function DropdownMenuCheckboxItem({ className, children, ...props }: DropdownMenuCheckboxItemProps): import("react").JSX.Element;
type DropdownMenuCheckboxItemIndicatorProps = StyledProps<Menu.CheckboxItemIndicator.Props>;
declare function DropdownMenuCheckboxItemIndicator({ className, ...props }: DropdownMenuCheckboxItemIndicatorProps): import("react").JSX.Element;
//#endregion
//#region src/components/lightbox/lightbox.d.ts
type LightboxProps<Payload = unknown> = Omit<Dialog$1.Root.Props<Payload>, "actionsRef" | "children" | "handle"> & {
  children?: ReactNode;
  closeOnModW?: boolean;
};
declare function Lightbox<Payload = unknown>({ closeOnModW, defaultOpen, modal, onOpenChange, open, children, ...props }: LightboxProps<Payload>): import("react").JSX.Element;
type LightboxTriggerProps = Dialog$1.Trigger.Props;
declare function LightboxTrigger(props: LightboxTriggerProps): import("react").JSX.Element;
type LightboxPortalProps = Dialog$1.Portal.Props;
declare function LightboxPortal(props: LightboxPortalProps): import("react").JSX.Element;
type LightboxContentProps = StyledProps<Dialog$1.Popup.Props>;
declare function LightboxContent({ className, initialFocus, finalFocus, ...props }: LightboxContentProps): import("react").JSX.Element;
type LightboxHeaderProps = useRender.ComponentProps<"div">;
declare function LightboxHeader({ render, className, ...props }: LightboxHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxToolbarProps = useRender.ComponentProps<"div">;
declare function LightboxToolbar({ render, className, ...props }: LightboxToolbarProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxHeaderMetaProps = useRender.ComponentProps<"div">;
declare function LightboxHeaderMeta({ render, className, ...props }: LightboxHeaderMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxHeaderLabelProps = useRender.ComponentProps<"span">;
declare function LightboxHeaderLabel({ render, className, ...props }: LightboxHeaderLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxTitleProps = useRender.ComponentProps<"div">;
declare function LightboxTitle({ render, className, ...props }: LightboxTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxActionsProps = useRender.ComponentProps<"div">;
declare function LightboxActions({ render, className, ...props }: LightboxActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxStageProps = useRender.ComponentProps<"div">;
declare function LightboxStage({ render, className, ...props }: LightboxStageProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxMediaProps = useRender.ComponentProps<"div">;
declare function LightboxMedia({ render, className, ...props }: LightboxMediaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxNavigationButtonProps = Omit<ButtonProps, "disabled" | "loading" | "size" | "variant"> & {
  direction: "next" | "previous";
  disabled?: boolean;
};
declare function LightboxNavigationButton({ className, direction, disabled, onClick, type, ...props }: LightboxNavigationButtonProps): import("react").JSX.Element;
type LightboxInfoDockProps = useRender.ComponentProps<"div">;
declare function LightboxInfoDock({ render, className, ...props }: LightboxInfoDockProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxInfoBarProps = useRender.ComponentProps<"div">;
declare function LightboxInfoBar({ render, className, ...props }: LightboxInfoBarProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxInfoTitleProps = useRender.ComponentProps<"div">;
declare function LightboxInfoTitle({ render, className, ...props }: LightboxInfoTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxInfoActionsProps = useRender.ComponentProps<"div">;
declare function LightboxInfoActions({ render, className, ...props }: LightboxInfoActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxThumbnailStripProps = useRender.ComponentProps<"div">;
declare function LightboxThumbnailStrip({ render, className, ...props }: LightboxThumbnailStripProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxThumbnailProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};
declare function LightboxThumbnail({ active, className, render, type, children, ...props }: LightboxThumbnailProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LightboxCloseProps = StyledProps<Dialog$1.Close.Props>;
declare function LightboxClose({ className, render, ...props }: LightboxCloseProps): import("react").JSX.Element;
//#endregion
//#region src/components/logo/raft-logo.d.ts
type RaftLogoProps = ComponentPropsWithoutRef<"svg">;
declare function RaftLogo(props: RaftLogoProps): import("react").JSX.Element;
type RaftWordmarkProps = ComponentPropsWithoutRef<"svg">;
declare function RaftWordmark(props: RaftWordmarkProps): import("react").JSX.Element;
type RaftLogoLockupProps = ComponentPropsWithoutRef<"svg">;
declare function RaftLogoLockup(props: RaftLogoLockupProps): import("react").JSX.Element;
//#endregion
//#region src/components/mobile-nav/mobile-nav.d.ts
type MobileNavRootProps = useRender.ComponentProps<"nav">;
declare function MobileNavRoot({ className, render, ...props }: MobileNavRootProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MobileNavItemProps = useRender.ComponentProps<"button"> & {
  nativeButton?: boolean;
  selected?: boolean;
};
declare function MobileNavItem({ nativeButton, selected, className, render, ...props }: MobileNavItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MobileNavLabelProps = useRender.ComponentProps<"span">;
declare function MobileNavLabel({ className, render, ...props }: MobileNavLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/tooltip/tooltip.d.ts
type TooltipProviderProps = Tooltip$1.Provider.Props;
declare function TooltipProvider({ delay, ...props }: TooltipProviderProps): import("react").JSX.Element;
type TooltipProps = Tooltip$1.Root.Props;
declare function Tooltip(props: TooltipProps): import("react").JSX.Element;
type TooltipTriggerProps = StyledProps<Tooltip$1.Trigger.Props>;
declare function TooltipTrigger({ className, ...props }: TooltipTriggerProps): import("react").JSX.Element;
type TooltipPortalProps = Tooltip$1.Portal.Props;
declare function TooltipPortal(props: TooltipPortalProps): import("react").JSX.Element;
type TooltipContentProps = StyledProps<Tooltip$1.Popup.Props> & Pick<Tooltip$1.Positioner.Props, "align" | "alignOffset" | "anchor" | "arrowPadding" | "collisionAvoidance" | "collisionBoundary" | "collisionPadding" | "disableAnchorTracking" | "positionMethod" | "side" | "sideOffset" | "sticky"> & {
  container?: TooltipPortalProps["container"];
  portalProps?: TooltipPortalProps;
};
declare function TooltipContent({ align, alignOffset, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking, positionMethod, side, sideOffset, sticky, container, portalProps, className, children, ...props }: TooltipContentProps): import("react").JSX.Element;
//#endregion
//#region src/components/popover/popover.d.ts
type PopoverProps = Popover$1.Root.Props;
declare function Popover(props: PopoverProps): import("react").JSX.Element;
type PopoverTriggerProps = StyledProps<Popover$1.Trigger.Props>;
declare function PopoverTrigger({ className, ...props }: PopoverTriggerProps): import("react").JSX.Element;
type PopoverPortalProps = Popover$1.Portal.Props;
declare function PopoverPortal(props: PopoverPortalProps): import("react").JSX.Element;
type PopoverPopupProps = ComponentPropsWithRef<"div">;
declare function PopoverPopup({ className, ...props }: PopoverPopupProps): import("react").JSX.Element;
type PopoverContentProps = StyledProps<Popover$1.Popup.Props> & Pick<Popover$1.Positioner.Props, "align" | "alignOffset" | "anchor" | "arrowPadding" | "collisionAvoidance" | "collisionBoundary" | "collisionPadding" | "disableAnchorTracking" | "positionMethod" | "side" | "sideOffset" | "sticky"> & {
  container?: PopoverPortalProps["container"];
  portalProps?: PopoverPortalProps;
};
declare function PopoverContent({ align, alignOffset, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking, positionMethod, side, sideOffset, sticky, container, portalProps, className, ...props }: PopoverContentProps): import("react").JSX.Element;
type PopoverViewportProps = StyledProps<Popover$1.Viewport.Props>;
declare function PopoverViewport({ className, ...props }: PopoverViewportProps): import("react").JSX.Element;
type PopoverHeaderProps = ComponentPropsWithRef<"div">;
declare function PopoverHeader({ className, ...props }: PopoverHeaderProps): import("react").JSX.Element;
type PopoverSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;
declare function PopoverSeparator({ className, ...props }: PopoverSeparatorProps): import("react").JSX.Element;
type PopoverTitleProps = StyledProps<Popover$1.Title.Props>;
declare function PopoverTitle({ className, ...props }: PopoverTitleProps): import("react").JSX.Element;
type PopoverDescriptionProps = StyledProps<Popover$1.Description.Props>;
declare function PopoverDescription({ className, ...props }: PopoverDescriptionProps): import("react").JSX.Element;
type PopoverCloseProps = StyledProps<Popover$1.Close.Props>;
declare function PopoverClose({ className, ...props }: PopoverCloseProps): import("react").JSX.Element;
type PopoverArrowProps = StyledProps<Popover$1.Arrow.Props>;
declare function PopoverArrow({ className, ...props }: PopoverArrowProps): import("react").JSX.Element;
type PopoverBackdropProps = StyledProps<Popover$1.Backdrop.Props>;
declare function PopoverBackdrop({ className, ...props }: PopoverBackdropProps): import("react").JSX.Element;
//#endregion
//#region src/components/preview-card/preview-card.d.ts
type PreviewCardProps = PreviewCard$1.Root.Props;
declare function PreviewCard(props: PreviewCardProps): import("react").JSX.Element;
type PreviewCardTriggerProps = StyledProps<PreviewCard$1.Trigger.Props>;
declare function PreviewCardTrigger({ delay, closeDelay, className, ...props }: PreviewCardTriggerProps): import("react").JSX.Element;
type PreviewCardPortalProps = PreviewCard$1.Portal.Props;
declare function PreviewCardPortal(props: PreviewCardPortalProps): import("react").JSX.Element;
type PreviewCardPopupProps = ComponentPropsWithRef<"div">;
declare function PreviewCardPopup({ className, ...props }: PreviewCardPopupProps): import("react").JSX.Element;
type PreviewCardContentProps = StyledProps<PreviewCard$1.Popup.Props> & Pick<PreviewCard$1.Positioner.Props, "align" | "alignOffset" | "anchor" | "arrowPadding" | "collisionAvoidance" | "collisionBoundary" | "collisionPadding" | "disableAnchorTracking" | "positionMethod" | "side" | "sideOffset" | "sticky"> & {
  portalProps?: PreviewCardPortalProps;
};
declare function PreviewCardContent({ align, alignOffset, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking, positionMethod, side, sideOffset, sticky, portalProps, className, ...props }: PreviewCardContentProps): import("react").JSX.Element;
type PreviewCardHeaderProps = ComponentPropsWithRef<"div">;
declare function PreviewCardHeader({ className, ...props }: PreviewCardHeaderProps): import("react").JSX.Element;
type PreviewCardSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;
declare function PreviewCardSeparator({ className, ...props }: PreviewCardSeparatorProps): import("react").JSX.Element;
type PreviewCardTitleProps = ComponentPropsWithRef<"p">;
declare function PreviewCardTitle({ className, ...props }: PreviewCardTitleProps): import("react").JSX.Element;
type PreviewCardDescriptionProps = ComponentPropsWithRef<"p">;
declare function PreviewCardDescription({ className, ...props }: PreviewCardDescriptionProps): import("react").JSX.Element;
type PreviewCardArrowProps = StyledProps<PreviewCard$1.Arrow.Props>;
declare function PreviewCardArrow({ className, ...props }: PreviewCardArrowProps): import("react").JSX.Element;
//#endregion
//#region src/components/label/label.d.ts
declare const label$1: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string;
      sub: string;
    };
    elegant: {
      root: string;
      sub: string;
    };
  };
  size: {
    sm: {
      root: string;
    };
    md: {
      root: string;
    };
  };
}, {
  root: string[];
  asterisk: string[];
  sub: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string;
      sub: string;
    };
    elegant: {
      root: string;
      sub: string;
    };
  };
  size: {
    sm: {
      root: string;
    };
    md: {
      root: string;
    };
  };
}, {
  root: string[];
  asterisk: string[];
  sub: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string;
      sub: string;
    };
    elegant: {
      root: string;
      sub: string;
    };
  };
  size: {
    sm: {
      root: string;
    };
    md: {
      root: string;
    };
  };
}, {
  root: string[];
  asterisk: string[];
  sub: string[];
}>>;
type LabelProps = useRender.ComponentProps<"label"> & Omit<VariantProps<typeof label$1>, "theme"> & {
  disabled?: boolean;
};
declare function LabelRoot({ size, disabled, className, render, ...props }: LabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LabelAsteriskProps = ComponentPropsWithRef<"span">;
declare function LabelAsterisk({ className, children, ...props }: LabelAsteriskProps): import("react").JSX.Element;
type LabelSubProps = ComponentPropsWithRef<"span">;
declare function LabelSub({ className, ...props }: LabelSubProps): import("react").JSX.Element;
type LabelOptionalProps = LabelSubProps;
declare function LabelOptional({ children, ...props }: LabelOptionalProps): import("react").JSX.Element;
declare const Label: typeof LabelRoot & {
  Asterisk: typeof LabelAsterisk;
  Optional: typeof LabelOptional;
  Sub: typeof LabelSub;
};
//#endregion
//#region src/lib/without-children.d.ts
/**
 * Element props without `children` — for leaf components (dots, markers) that
 * render no caller content. React ships `ComponentPropsWithoutRef` but no
 * equivalent that subtracts children, so this names the one-off `Omit`.
 */
type WithoutChildren<P> = Omit<P, "children">;
//#endregion
//#region src/components/input/input.d.ts
type InputBehaviorProps = {
  /**
   * Add common password-manager ignore hints for non-credential fields where
   * extension overlays would obscure custom UI.
   */
  suppressPasswordManager?: boolean;
};
type InputProps = WithoutChildren<StyledProps<Input$1.Props>> & InputBehaviorProps & DataAttributes$1;
declare function Input({ suppressPasswordManager, className, "data-invalid": dataInvalid, ...props }: InputProps): import("react").JSX.Element;
//#endregion
//#region src/components/field/field.d.ts
declare const field: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
      label: string[];
      description: string[];
      error: string[];
    };
    elegant: {
      label: string[];
      description: string[];
      error: string[];
    };
  };
  size: {
    sm: {
      label: string;
    };
    md: {
      label: string;
    };
  };
}, {
  root: string[];
  item: string[];
  label: string[];
  description: string[];
  error: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
      label: string[];
      description: string[];
      error: string[];
    };
    elegant: {
      label: string[];
      description: string[];
      error: string[];
    };
  };
  size: {
    sm: {
      label: string;
    };
    md: {
      label: string;
    };
  };
}, {
  root: string[];
  item: string[];
  label: string[];
  description: string[];
  error: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
      label: string[];
      description: string[];
      error: string[];
    };
    elegant: {
      label: string[];
      description: string[];
      error: string[];
    };
  };
  size: {
    sm: {
      label: string;
    };
    md: {
      label: string;
    };
  };
}, {
  root: string[];
  item: string[];
  label: string[];
  description: string[];
  error: string[];
}>>;
type FieldProps = StyledProps<Field$1.Root.Props>;
declare function Field({ className, ...props }: FieldProps): import("react").JSX.Element;
type FieldItemProps = StyledProps<Field$1.Item.Props>;
declare function FieldItem({ className, ...props }: FieldItemProps): import("react").JSX.Element;
type LabelMarker = {
  required?: boolean;
  optional?: never;
} | {
  optional?: boolean;
  required?: never;
};
type FieldLabelProps = StyledProps<Field$1.Label.Props> & Omit<VariantProps<typeof field>, "theme"> & LabelMarker;
declare function FieldLabel({ size, required, optional, className, children, ...props }: FieldLabelProps): import("react").JSX.Element;
type FieldDescriptionProps = StyledProps<Field$1.Description.Props>;
declare function FieldDescription({ className, ...props }: FieldDescriptionProps): import("react").JSX.Element;
type FieldErrorProps = StyledProps<Field$1.Error.Props>;
declare function FieldError({ className, role, ...props }: FieldErrorProps): import("react").JSX.Element;
type FieldControlProps = Field$1.Control.Props;
declare function FieldControl(props: FieldControlProps): import("react").JSX.Element;
type FieldValidityProps = Field$1.Validity.Props;
declare function FieldValidity(props: FieldValidityProps): import("react").JSX.Element;
//#endregion
//#region src/components/input-group/input-group.d.ts
declare const inputGroup: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
      addon: string[];
      text: string[];
      control: string[];
    };
    elegant: {
      root: string[];
      addon: string[];
      text: string[];
      control: string[];
    };
  };
  align: {
    "inline-start": {
      addon: string;
      text: string;
    };
    "inline-end": {
      addon: string;
      text: string;
    };
  };
  variant: {
    default: {};
    container: {
      addon: string[];
      text: string[];
    };
  };
}, {
  root: string[];
  addon: string[];
  text: string[];
  control: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
      addon: string[];
      text: string[];
      control: string[];
    };
    elegant: {
      root: string[];
      addon: string[];
      text: string[];
      control: string[];
    };
  };
  align: {
    "inline-start": {
      addon: string;
      text: string;
    };
    "inline-end": {
      addon: string;
      text: string;
    };
  };
  variant: {
    default: {};
    container: {
      addon: string[];
      text: string[];
    };
  };
}, {
  root: string[];
  addon: string[];
  text: string[];
  control: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
      addon: string[];
      text: string[];
      control: string[];
    };
    elegant: {
      root: string[];
      addon: string[];
      text: string[];
      control: string[];
    };
  };
  align: {
    "inline-start": {
      addon: string;
      text: string;
    };
    "inline-end": {
      addon: string;
      text: string;
    };
  };
  variant: {
    default: {};
    container: {
      addon: string[];
      text: string[];
    };
  };
}, {
  root: string[];
  addon: string[];
  text: string[];
  control: string[];
}>>;
type InputGroupProps = ComponentPropsWithRef<"div">;
declare function InputGroup({ className, ...props }: InputGroupProps): import("react").JSX.Element;
type InputGroupAddonProps = ComponentPropsWithRef<"div"> & Pick<VariantProps<typeof inputGroup>, "align" | "variant">;
declare function InputGroupAddonRoot({ align, variant, className, ...props }: InputGroupAddonProps): import("react").JSX.Element;
type InputGroupAddonTextProps = ComponentPropsWithRef<"span"> & Pick<VariantProps<typeof inputGroup>, "align" | "variant">;
declare function TextAddon({ align, variant, className, ...props }: InputGroupAddonTextProps): import("react").JSX.Element;
declare const InputGroupAddon: typeof InputGroupAddonRoot & {
  Text: typeof TextAddon;
};
type InputGroupInputProps = WithoutChildren<StyledProps<Input$1.Props>> & InputBehaviorProps & DataAttributes$1;
declare function InputGroupInput({ className, suppressPasswordManager, "data-invalid": dataInvalid, ...props }: InputGroupInputProps): import("react").JSX.Element;
//#endregion
//#region src/components/combobox/combobox.d.ts
type ComboboxProps<Value, Multiple extends boolean | undefined = false> = Combobox$1.Root.Props<Value, Multiple>;
declare function Combobox<Value, Multiple extends boolean | undefined = false>({ defaultInputValue, defaultValue, inputValue, onInputValueChange, onValueChange, value, ...props }: ComboboxProps<Value, Multiple>): import("react").JSX.Element;
type ComboboxLabelProps = StyledProps<Combobox$1.Label.Props>;
declare function ComboboxLabel({ className, ...props }: ComboboxLabelProps): import("react").JSX.Element;
type ComboboxValueProps = Combobox$1.Value.Props;
declare function ComboboxValue(props: ComboboxValueProps): import("react").JSX.Element;
type ComboboxTriggerProps = StyledProps<Combobox$1.Trigger.Props>;
declare function ComboboxTrigger({ className, children, render, ...props }: ComboboxTriggerProps): import("react").JSX.Element;
type ComboboxTriggerCountProps = StyledProps<ComponentPropsWithRef<"span">>;
declare function ComboboxTriggerCount({ className, ...props }: ComboboxTriggerCountProps): import("react").JSX.Element;
type ComboboxTriggerIndicatorProps = StyledProps<ComponentPropsWithRef<"span">>;
declare function ComboboxTriggerIndicator({ className, ...props }: ComboboxTriggerIndicatorProps): import("react").JSX.Element;
type ComboboxInputGroupProps = StyledProps<Combobox$1.InputGroup.Props>;
declare function ComboboxInputGroup({ className, ...props }: ComboboxInputGroupProps): import("react").JSX.Element;
type ComboboxControlProps = StyledProps<Combobox$1.InputGroup.Props>;
declare function ComboboxControl({ className, ...props }: ComboboxControlProps): import("react").JSX.Element;
type ComboboxInputProps = StyledProps<Combobox$1.Input.Props> & {
  suppressPasswordManager?: boolean;
};
declare function ComboboxInput({ suppressPasswordManager, className, ...props }: ComboboxInputProps): import("react").JSX.Element;
type ComboboxPortalProps = Combobox$1.Portal.Props;
declare function ComboboxPortal(props: ComboboxPortalProps): import("react").JSX.Element;
type ComboboxPopupProps = ComponentPropsWithRef<"div">;
declare function ComboboxPopup({ className, ...props }: ComboboxPopupProps): import("react").JSX.Element;
type ComboboxHeaderProps = ComponentPropsWithRef<"div">;
declare function ComboboxHeader({ className, ...props }: ComboboxHeaderProps): import("react").JSX.Element;
type ComboboxSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;
declare function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps): import("react").JSX.Element;
type ComboboxContentProps = StyledProps<Combobox$1.Popup.Props> & Pick<Combobox$1.Positioner.Props, "align" | "alignOffset" | "anchor" | "arrowPadding" | "collisionAvoidance" | "collisionBoundary" | "collisionPadding" | "disableAnchorTracking" | "positionMethod" | "side" | "sideOffset" | "sticky"> & {
  portalProps?: ComboboxPortalProps;
};
declare function ComboboxContent({ align, alignOffset, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking, positionMethod, side, sideOffset, sticky, portalProps, className, initialFocus, finalFocus, ...props }: ComboboxContentProps): import("react").JSX.Element;
type ComboboxListProps = StyledProps<Combobox$1.List.Props>;
declare function ComboboxList({ className, ...props }: ComboboxListProps): import("react").JSX.Element;
type ComboboxItemProps = StyledProps<Combobox$1.Item.Props>;
declare function ComboboxItem({ className, ...props }: ComboboxItemProps): import("react").JSX.Element;
type ComboboxItemIndicatorProps = StyledProps<Combobox$1.ItemIndicator.Props>;
declare function ComboboxItemIndicator({ className, children, ...props }: ComboboxItemIndicatorProps): import("react").JSX.Element;
type ComboboxClearProps = StyledProps<Combobox$1.Clear.Props>;
declare function ComboboxClear({ className, children, keepMounted, ...props }: ComboboxClearProps): import("react").JSX.Element;
type ComboboxEmptyProps = StyledProps<Combobox$1.Empty.Props>;
declare function ComboboxEmpty({ className, children, ...props }: ComboboxEmptyProps): import("react").JSX.Element;
type ComboboxGroupProps = StyledProps<Combobox$1.Group.Props>;
declare function ComboboxGroup({ className, ...props }: ComboboxGroupProps): import("react").JSX.Element;
type ComboboxGroupLabelProps = StyledProps<Combobox$1.GroupLabel.Props>;
declare function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps): import("react").JSX.Element;
type ComboboxRowProps = StyledProps<Combobox$1.Row.Props>;
declare function ComboboxRow({ className, ...props }: ComboboxRowProps): import("react").JSX.Element;
type ComboboxCollectionProps = Combobox$1.Collection.Props;
declare function ComboboxCollection(props: ComboboxCollectionProps): import("react").JSX.Element;
type ComboboxChipsProps = StyledProps<Combobox$1.Chips.Props>;
declare function ComboboxChips({ className, ...props }: ComboboxChipsProps): import("react").JSX.Element;
type ComboboxChipProps = StyledProps<Combobox$1.Chip.Props>;
declare function ComboboxChip({ className, ...props }: ComboboxChipProps): import("react").JSX.Element;
type ComboboxChipRemoveProps = StyledProps<Combobox$1.ChipRemove.Props>;
declare function ComboboxChipRemove({ className, children, ...props }: ComboboxChipRemoveProps): import("react").JSX.Element;
//#endregion
//#region src/components/picker-trigger-button/picker-trigger-button.d.ts
type PickerTriggerButtonProps = StyledProps<Button$1.Props> & DataAttributes$1;
declare function PickerTriggerButton({ className, render, nativeButton, ...props }: PickerTriggerButtonProps): import("react").JSX.Element;
//#endregion
//#region src/components/select/select.d.ts
type SelectProps<Value, Multiple extends boolean | undefined = false> = Select$1.Root.Props<Value, Multiple>;
declare function Select<Value, Multiple extends boolean | undefined = false>(props: SelectProps<Value, Multiple>): import("react").JSX.Element;
type SelectTriggerProps = StyledProps<Select$1.Trigger.Props> & DataAttributes$1;
declare function SelectTrigger({ className, children, render, "data-invalid": dataInvalid, ...props }: SelectTriggerProps): import("react").JSX.Element;
type SelectValueProps = StyledProps<Select$1.Value.Props>;
declare function SelectValue({ className, ...props }: SelectValueProps): import("react").JSX.Element;
type SelectIconProps = StyledProps<Select$1.Icon.Props>;
declare function SelectIcon({ className, children, ...props }: SelectIconProps): import("react").JSX.Element;
type SelectPortalProps = Select$1.Portal.Props;
declare function SelectPortal(props: SelectPortalProps): import("react").JSX.Element;
type SelectPopupProps = ComponentPropsWithRef<"div">;
declare function SelectPopup({ className, ...props }: SelectPopupProps): import("react").JSX.Element;
type SelectContentProps = StyledProps<Select$1.Popup.Props> & Pick<Select$1.Positioner.Props, "align" | "alignItemWithTrigger" | "alignOffset" | "anchor" | "arrowPadding" | "collisionAvoidance" | "collisionBoundary" | "collisionPadding" | "disableAnchorTracking" | "positionMethod" | "side" | "sideOffset" | "sticky"> & {
  portalProps?: SelectPortalProps;
};
declare function SelectContent({ align, alignItemWithTrigger, alignOffset, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking, positionMethod, side, sideOffset, sticky, portalProps, className, ...props }: SelectContentProps): import("react").JSX.Element;
type SelectListProps = StyledProps<Select$1.List.Props>;
declare function SelectList({ className, ...props }: SelectListProps): import("react").JSX.Element;
type SelectItemProps = StyledProps<Select$1.Item.Props>;
declare function SelectItem({ className, ...props }: SelectItemProps): import("react").JSX.Element;
type SelectItemLeadingProps = StyledProps<ComponentPropsWithRef<"span">>;
declare function SelectItemLeading({ className, ...props }: SelectItemLeadingProps): import("react").JSX.Element;
type SelectItemIndicatorProps = StyledProps<Select$1.ItemIndicator.Props>;
declare function SelectItemIndicator({ className, children, ...props }: SelectItemIndicatorProps): import("react").JSX.Element;
type SelectItemTextProps = StyledProps<Select$1.ItemText.Props>;
declare function SelectItemText({ className, ...props }: SelectItemTextProps): import("react").JSX.Element;
type SelectLabelProps = StyledProps<Select$1.Label.Props>;
declare function SelectLabel({ className, ...props }: SelectLabelProps): import("react").JSX.Element;
type SelectGroupProps = StyledProps<Select$1.Group.Props>;
declare function SelectGroup({ className, ...props }: SelectGroupProps): import("react").JSX.Element;
type SelectGroupLabelProps = StyledProps<Select$1.GroupLabel.Props>;
declare function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps): import("react").JSX.Element;
type SelectSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;
declare function SelectSeparator({ className, ...props }: SelectSeparatorProps): import("react").JSX.Element;
type SelectScrollUpArrowProps = StyledProps<Select$1.ScrollUpArrow.Props>;
declare function SelectScrollUpArrow({ className, children, ...props }: SelectScrollUpArrowProps): import("react").JSX.Element;
type SelectScrollDownArrowProps = StyledProps<Select$1.ScrollDownArrow.Props>;
declare function SelectScrollDownArrow({ className, children, ...props }: SelectScrollDownArrowProps): import("react").JSX.Element;
type SelectArrowProps = StyledProps<Select$1.Arrow.Props>;
declare function SelectArrow({ className, ...props }: SelectArrowProps): import("react").JSX.Element;
//#endregion
//#region src/components/radio-group/radio-group.d.ts
type RadioGroupProps<T extends string = string> = StyledProps<RadioGroup$1.Props<T>>;
declare function RadioGroup<T extends string = string>({ className, ...props }: RadioGroupProps<T>): import("react").JSX.Element;
type RadioGroupIndicatorProps = StyledProps<Radio.Indicator.Props>;
declare function RadioGroupIndicator({ className, children, ...props }: RadioGroupIndicatorProps): import("react").JSX.Element;
type RadioGroupItemProps<T extends string = string> = StyledProps<Radio.Root.Props<T>> & {
  appearance?: "default" | "none";
};
declare function RadioGroupItem<T extends string = string>({ appearance, className, children, ...props }: RadioGroupItemProps<T>): import("react").JSX.Element;
//#endregion
//#region src/components/switch/switch.d.ts
declare const switchRecipe: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
      thumb: string[];
    };
    elegant: {
      root: string[];
      thumb: string[];
    };
  };
  size: {
    sm: {
      root: string;
      thumb: string;
    };
    md: {
      root: string;
      thumb: string;
    };
  };
}, {
  root: string[];
  thumb: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
      thumb: string[];
    };
    elegant: {
      root: string[];
      thumb: string[];
    };
  };
  size: {
    sm: {
      root: string;
      thumb: string;
    };
    md: {
      root: string;
      thumb: string;
    };
  };
}, {
  root: string[];
  thumb: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
      thumb: string[];
    };
    elegant: {
      root: string[];
      thumb: string[];
    };
  };
  size: {
    sm: {
      root: string;
      thumb: string;
    };
    md: {
      root: string;
      thumb: string;
    };
  };
}, {
  root: string[];
  thumb: string[];
}>>;
type SwitchProps = StyledProps<Switch$1.Root.Props> & Omit<VariantProps<typeof switchRecipe>, "theme">;
declare function Switch({ size, className, children, ...props }: SwitchProps): import("react").JSX.Element;
type SwitchThumbProps = StyledProps<Switch$1.Thumb.Props> & Omit<VariantProps<typeof switchRecipe>, "theme">;
declare function SwitchThumb({ size, className, ...props }: SwitchThumbProps): import("react").JSX.Element;
//#endregion
//#region src/components/segmented-control/segmented-control.d.ts
declare const segmentedControl: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      item: string[];
      count: string[];
    };
    elegant: {
      root: string[];
      item: string[];
      count: string[];
    };
  };
  disabled: {
    true: {
      root: string;
    };
    false: {
      root: string;
    };
  };
}, {
  root: string[];
  item: string[];
  label: string[];
  count: string[];
}, undefined, {
  theme: {
    brutal: {
      item: string[];
      count: string[];
    };
    elegant: {
      root: string[];
      item: string[];
      count: string[];
    };
  };
  disabled: {
    true: {
      root: string;
    };
    false: {
      root: string;
    };
  };
}, {
  root: string[];
  item: string[];
  label: string[];
  count: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      item: string[];
      count: string[];
    };
    elegant: {
      root: string[];
      item: string[];
      count: string[];
    };
  };
  disabled: {
    true: {
      root: string;
    };
    false: {
      root: string;
    };
  };
}, {
  root: string[];
  item: string[];
  label: string[];
  count: string[];
}>>;
type SegmentedControlProps<T extends string = string> = StyledProps<RadioGroup$1.Props<T>> & Omit<VariantProps<typeof segmentedControl>, "theme">;
declare function SegmentedControl<T extends string = string>({ disabled, className, ...props }: SegmentedControlProps<T>): import("react").JSX.Element;
type SegmentedControlItemProps<T extends string = string> = StyledProps<Radio.Root.Props<T>>;
declare function SegmentedControlItem<T extends string = string>({ className, ...props }: SegmentedControlItemProps<T>): import("react").JSX.Element;
type SegmentedControlLabelProps = ComponentPropsWithRef<"span">;
declare function SegmentedControlLabel({ className, ...props }: SegmentedControlLabelProps): import("react").JSX.Element;
type SegmentedControlCountProps = ComponentPropsWithRef<"span">;
declare function SegmentedControlCount({ className, ...props }: SegmentedControlCountProps): import("react").JSX.Element;
//#endregion
//#region src/components/toggle-group/toggle-group.d.ts
type ToggleGroupProps<T extends string = string> = StyledProps<ToggleGroup$1.Props<T>>;
declare function ToggleGroup<T extends string = string>({ className, ...props }: ToggleGroupProps<T>): import("react").JSX.Element;
type ToggleGroupItemProps<T extends string = string> = StyledProps<Omit<Toggle.Props<T>, "defaultPressed" | "pressed">> & {
  value: T;
};
declare function ToggleGroupItem<T extends string = string>({ className, nativeButton, render, ...props }: ToggleGroupItemProps<T>): import("react").JSX.Element;
type ToggleGroupLabelProps = ComponentPropsWithRef<"span">;
declare function ToggleGroupLabel({ className, ...props }: ToggleGroupLabelProps): import("react").JSX.Element;
//#endregion
//#region src/components/textarea/textarea.d.ts
type TextareaProps = WithoutChildren<ComponentPropsWithRef<"textarea">> & DataAttributes$1;
type TextareaGroupProps = ComponentPropsWithRef<"div">;
declare function TextareaGroup({ className, ...props }: TextareaGroupProps): import("react").JSX.Element;
declare function Textarea({ className, "data-invalid": dataInvalid, ...props }: TextareaProps): import("react").JSX.Element;
interface TextareaCounterProps extends WithoutChildren<ComponentPropsWithRef<"span">> {
  value?: string;
  count?: number;
  limit: number;
  getLength?: (value: string) => number;
}
declare function TextareaCounter({ value, count, limit, getLength, className, ...props }: TextareaCounterProps): import("react").JSX.Element;
//#endregion
//#region src/components/description-list/description-list.d.ts
declare const descriptionList: import("tailwind-variants/lite").TVReturnType<{
  direction: {
    vertical: {};
    horizontal: {
      root: string[];
    };
  };
  theme: {
    brutal: {
      term: string;
      details: string;
    };
    elegant: {
      term: string[];
      details: string;
    };
  };
}, {
  root: string[];
  item: string[];
  term: string[];
  details: string[];
}, undefined, {
  direction: {
    vertical: {};
    horizontal: {
      root: string[];
    };
  };
  theme: {
    brutal: {
      term: string;
      details: string;
    };
    elegant: {
      term: string[];
      details: string;
    };
  };
}, {
  root: string[];
  item: string[];
  term: string[];
  details: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  direction: {
    vertical: {};
    horizontal: {
      root: string[];
    };
  };
  theme: {
    brutal: {
      term: string;
      details: string;
    };
    elegant: {
      term: string[];
      details: string;
    };
  };
}, {
  root: string[];
  item: string[];
  term: string[];
  details: string[];
}>>;
type DescriptionListDirection = NonNullable<VariantProps<typeof descriptionList>["direction"]>;
type DescriptionListProps = useRender.ComponentProps<"dl"> & Pick<VariantProps<typeof descriptionList>, "direction">;
declare function DescriptionList({ direction, className, render, ...props }: DescriptionListProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type DescriptionItemProps = useRender.ComponentProps<"div">;
declare function DescriptionItem({ className, render, ...props }: DescriptionItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type DescriptionTermProps = useRender.ComponentProps<"dt">;
declare function DescriptionTerm({ className, render, ...props }: DescriptionTermProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type DescriptionDetailsProps = useRender.ComponentProps<"dd">;
declare function DescriptionDetails({ className, render, ...props }: DescriptionDetailsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/avatar/avatar.d.ts
declare const avatar: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string;
      fallback: string;
      badge: string[];
      dot: string[];
      group: string[];
    };
    elegant: {
      root: string[];
      image: string[];
      fallback: string[];
      badge: string[];
      dot: string[];
      group: string[];
    };
  };
  type: {
    agent: {};
    human: {};
  };
  size: {
    xl: {
      root: string;
    };
    lg: {
      root: string;
    };
    md: {
      root: string;
    };
    sm: {
      root: string;
    };
    xs: {
      root: string;
    };
    "2xs": {
      root: string;
    };
    "3xs": {
      root: string;
    };
  };
}, {
  root: string[];
  image: string[];
  fallback: string[];
  badge: string[];
  dot: string[];
  group: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string;
      fallback: string;
      badge: string[];
      dot: string[];
      group: string[];
    };
    elegant: {
      root: string[];
      image: string[];
      fallback: string[];
      badge: string[];
      dot: string[];
      group: string[];
    };
  };
  type: {
    agent: {};
    human: {};
  };
  size: {
    xl: {
      root: string;
    };
    lg: {
      root: string;
    };
    md: {
      root: string;
    };
    sm: {
      root: string;
    };
    xs: {
      root: string;
    };
    "2xs": {
      root: string;
    };
    "3xs": {
      root: string;
    };
  };
}, {
  root: string[];
  image: string[];
  fallback: string[];
  badge: string[];
  dot: string[];
  group: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string;
      fallback: string;
      badge: string[];
      dot: string[];
      group: string[];
    };
    elegant: {
      root: string[];
      image: string[];
      fallback: string[];
      badge: string[];
      dot: string[];
      group: string[];
    };
  };
  type: {
    agent: {};
    human: {};
  };
  size: {
    xl: {
      root: string;
    };
    lg: {
      root: string;
    };
    md: {
      root: string;
    };
    sm: {
      root: string;
    };
    xs: {
      root: string;
    };
    "2xs": {
      root: string;
    };
    "3xs": {
      root: string;
    };
  };
}, {
  root: string[];
  image: string[];
  fallback: string[];
  badge: string[];
  dot: string[];
  group: string[];
}>>;
type AvatarSize = NonNullable<VariantProps<typeof avatar>["size"]>;
type AvatarProps = StyledProps<Avatar$1.Root.Props> & Required<Pick<VariantProps<typeof avatar>, "size" | "type">>;
declare function Avatar({ size, type, className, children, ...props }: AvatarProps): import("react").JSX.Element;
type AvatarImageProps = StyledProps<Avatar$1.Image.Props>;
declare function AvatarImage({ className, ...props }: AvatarImageProps): import("react").JSX.Element;
type AvatarFallbackProps = StyledProps<Avatar$1.Fallback.Props>;
declare function AvatarFallback({ className, children, ...props }: AvatarFallbackProps): import("react").JSX.Element;
type AvatarBadgeProps = useRender.ComponentProps<"span">;
declare function AvatarBadge({ className, render, ...props }: AvatarBadgeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AvatarGroupProps = ComponentPropsWithRef<"div">;
declare function AvatarGroup({ className, ...props }: AvatarGroupProps): import("react").JSX.Element;
type AvatarGroupCountProps = ComponentPropsWithRef<"span"> & {
  /** Matches the frame scale of the sibling avatars. */
  size: AvatarSize;
};
declare function AvatarGroupCount({ size, className, ...props }: AvatarGroupCountProps): import("react").JSX.Element;
//#endregion
//#region src/components/code-block/code-block.d.ts
type CodeBlockProps = useRender.ComponentProps<"div">;
/** Framed code surface. Compose a header and a body inside it. */
declare function CodeBlock({ className, render, ...props }: CodeBlockProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CodeBlockHeaderProps = useRender.ComponentProps<"div">;
declare function CodeBlockHeader({ className, render, ...props }: CodeBlockHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CodeBlockTitleProps = useRender.ComponentProps<"span">;
declare function CodeBlockTitle({ className, render, ...props }: CodeBlockTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CodeBlockActionsProps = useRender.ComponentProps<"div">;
/** Trailing action region. Placed inside the body it floats over the code panel. */
declare function CodeBlockActions({ className, render, ...props }: CodeBlockActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CodeBlockActionProps = useRender.ComponentProps<"button">;
/** Styled action shell. The consumer owns the icon and the behavior. */
declare function CodeBlockAction({ className, render, ...props }: CodeBlockActionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type CodeBlockBodyProps = useRender.ComponentProps<"div">;
/** Inner code panel. Render the complete pre and code as children. */
declare function CodeBlockBody({ children, className, render, ...props }: CodeBlockBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/inline-code/inline-code.d.ts
type InlineCodeProps = ComponentPropsWithRef<"code">;
declare function InlineCode({ className, ...props }: InlineCodeProps): import("react").JSX.Element;
//#endregion
//#region src/components/markdown/markdown-parts.d.ts
declare const HEADING_TAGS: {
  readonly 1: "h1";
  readonly 2: "h2";
  readonly 3: "h3";
  readonly 4: "h4";
  readonly 5: "h5";
  readonly 6: "h6";
};
type MarkdownHeadingLevel = keyof typeof HEADING_TAGS;
type MarkdownHeadingProps = ComponentPropsWithRef<"h1"> & {
  level: MarkdownHeadingLevel;
};
declare function MarkdownHeading({ className, level, ...props }: MarkdownHeadingProps): import("react").JSX.Element;
type MarkdownParagraphProps = ComponentPropsWithRef<"p">;
declare function MarkdownParagraph({ className, ...props }: MarkdownParagraphProps): import("react").JSX.Element;
type MarkdownLinkProps = ComponentPropsWithRef<"a">;
declare function MarkdownLink({ className, ...props }: MarkdownLinkProps): import("react").JSX.Element;
type MarkdownMarkProps = ComponentPropsWithRef<"mark">;
declare function MarkdownMark({ className, ...props }: MarkdownMarkProps): import("react").JSX.Element;
type MarkdownListProps = ComponentPropsWithRef<"ul">;
declare function MarkdownList({ className, ...props }: MarkdownListProps): import("react").JSX.Element;
type MarkdownOrderedListProps = ComponentPropsWithRef<"ol">;
declare function MarkdownOrderedList({ className, ...props }: MarkdownOrderedListProps): import("react").JSX.Element;
type MarkdownListItemProps = ComponentPropsWithRef<"li">;
declare function MarkdownListItem({ className, ...props }: MarkdownListItemProps): import("react").JSX.Element;
type MarkdownBlockquoteProps = ComponentPropsWithRef<"blockquote">;
declare function MarkdownBlockquote({ className, ...props }: MarkdownBlockquoteProps): import("react").JSX.Element;
type MarkdownRuleProps = ComponentPropsWithRef<"hr">;
declare function MarkdownRule({ className, ...props }: MarkdownRuleProps): import("react").JSX.Element;
type MarkdownTableScrollProps = ComponentPropsWithRef<"div">;
/** Horizontal scroll container for wide tables. */
declare function MarkdownTableScroll({ className, ...props }: MarkdownTableScrollProps): import("react").JSX.Element;
type MarkdownTableProps = ComponentPropsWithRef<"table">;
declare function MarkdownTable({ className, ...props }: MarkdownTableProps): import("react").JSX.Element;
type MarkdownTableRowProps = ComponentPropsWithRef<"tr">;
declare function MarkdownTableRow({ className, ...props }: MarkdownTableRowProps): import("react").JSX.Element;
type MarkdownHeaderCellProps = ComponentPropsWithRef<"th">;
declare function MarkdownHeaderCell({ className, ...props }: MarkdownHeaderCellProps): import("react").JSX.Element;
type MarkdownCellProps = ComponentPropsWithRef<"td">;
declare function MarkdownCell({ className, ...props }: MarkdownCellProps): import("react").JSX.Element;
type MarkdownImageProps = ComponentPropsWithRef<"img">;
declare function MarkdownImage({ className, ...props }: MarkdownImageProps): import("react").JSX.Element;
type MarkdownInlineCodeProps = InlineCodeProps;
declare function MarkdownInlineCode({ className, ...props }: MarkdownInlineCodeProps): import("react").JSX.Element;
type MarkdownCheckboxProps = CheckboxProps;
/** Task-list checkbox. Markdown task items are display-only, so it defaults to read-only. */
declare function MarkdownCheckbox({ className, ...props }: MarkdownCheckboxProps): import("react").JSX.Element;
//#endregion
//#region src/components/message-item/message-item.recipe.d.ts
declare const messageItem: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
      continuationTime: string;
      content: string;
      header: string;
      sender: string[];
      meta: string;
      time: string;
      inlineStatus: string;
      body: string;
      toolbar: string[];
      toolbarButton: string[];
    };
    elegant: {
      root: string[];
      gutter: string;
      avatarSlot: string[];
      continuationTime: string[];
      content: string;
      header: string;
      sender: string[];
      meta: string;
      time: string;
      inlineStatus: string;
      body: string[];
      toolbar: string[];
      toolbarButton: string[];
      footer: string;
    };
  };
  compact: {
    true: {};
  };
}, {
  root: string[];
  gutter: string[];
  avatarSlot: string[];
  continuationTime: string[];
  content: string[];
  header: string[];
  sender: string[];
  senderBadges: string[];
  meta: string[];
  time: string[];
  inlineStatus: string[];
  body: string[];
  searchMatch: string[];
  embedded: string[];
  attachments: string[];
  footer: string[];
  toolbar: string[];
  toolbarButton: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
      continuationTime: string;
      content: string;
      header: string;
      sender: string[];
      meta: string;
      time: string;
      inlineStatus: string;
      body: string;
      toolbar: string[];
      toolbarButton: string[];
    };
    elegant: {
      root: string[];
      gutter: string;
      avatarSlot: string[];
      continuationTime: string[];
      content: string;
      header: string;
      sender: string[];
      meta: string;
      time: string;
      inlineStatus: string;
      body: string[];
      toolbar: string[];
      toolbarButton: string[];
      footer: string;
    };
  };
  compact: {
    true: {};
  };
}, {
  root: string[];
  gutter: string[];
  avatarSlot: string[];
  continuationTime: string[];
  content: string[];
  header: string[];
  sender: string[];
  senderBadges: string[];
  meta: string[];
  time: string[];
  inlineStatus: string[];
  body: string[];
  searchMatch: string[];
  embedded: string[];
  attachments: string[];
  footer: string[];
  toolbar: string[];
  toolbarButton: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
      continuationTime: string;
      content: string;
      header: string;
      sender: string[];
      meta: string;
      time: string;
      inlineStatus: string;
      body: string;
      toolbar: string[];
      toolbarButton: string[];
    };
    elegant: {
      root: string[];
      gutter: string;
      avatarSlot: string[];
      continuationTime: string[];
      content: string;
      header: string;
      sender: string[];
      meta: string;
      time: string;
      inlineStatus: string;
      body: string[];
      toolbar: string[];
      toolbarButton: string[];
      footer: string;
    };
  };
  compact: {
    true: {};
  };
}, {
  root: string[];
  gutter: string[];
  avatarSlot: string[];
  continuationTime: string[];
  content: string[];
  header: string[];
  sender: string[];
  senderBadges: string[];
  meta: string[];
  time: string[];
  inlineStatus: string[];
  body: string[];
  searchMatch: string[];
  embedded: string[];
  attachments: string[];
  footer: string[];
  toolbar: string[];
  toolbarButton: string[];
}>>;
type MessageItemVariantProps = VariantProps<typeof messageItem>;
//#endregion
//#region src/components/message-item/message-item-root.d.ts
type MessageItemProps = useRender.ComponentProps<"div"> & Pick<MessageItemVariantProps, "compact">;
declare function MessageItem({ className, compact, render, ...props }: MessageItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-item/message-item-gutter.d.ts
type MessageItemGutterProps = useRender.ComponentProps<"div">;
declare function MessageItemGutter({ className, render, ...props }: MessageItemGutterProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemAvatarSlotProps = useRender.ComponentProps<"div">;
declare function MessageItemAvatarSlot({ className, render, ...props }: MessageItemAvatarSlotProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemContinuationTimeProps = useRender.ComponentProps<"span">;
/** Left-gutter hover clock for continuation rows. Pass 24h `HH:MM` (no AM/PM). */
declare function MessageItemContinuationTime({ className, render, ...props }: MessageItemContinuationTimeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-item/message-item-content.d.ts
type MessageItemContentProps = useRender.ComponentProps<"div">;
declare function MessageItemContent({ className, render, ...props }: MessageItemContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemBodyProps = useRender.ComponentProps<"div">;
declare function MessageItemBody({ className, render, ...props }: MessageItemBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemSearchMatchProps = useRender.ComponentProps<"mark">;
declare function MessageItemSearchMatch({ className, render, ...props }: MessageItemSearchMatchProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemEmbeddedProps = useRender.ComponentProps<"div">;
declare function MessageItemEmbedded({ className, render, ...props }: MessageItemEmbeddedProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemAttachmentsProps = useRender.ComponentProps<"div">;
declare function MessageItemAttachments({ className, render, ...props }: MessageItemAttachmentsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemFooterProps = useRender.ComponentProps<"div">;
declare function MessageItemFooter({ className, render, ...props }: MessageItemFooterProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-item/message-item-header.d.ts
type MessageItemHeaderProps = useRender.ComponentProps<"div">;
declare function MessageItemHeader({ className, render, ...props }: MessageItemHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemSenderProps = useRender.ComponentProps<"span">;
declare function MessageItemSender({ className, render, ...props }: MessageItemSenderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemSenderButtonProps = useRender.ComponentProps<"button">;
declare function MessageItemSenderButton({ className, render, ...props }: MessageItemSenderButtonProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemSenderBadgesProps = useRender.ComponentProps<"span">;
declare function MessageItemSenderBadges({ className, render, ...props }: MessageItemSenderBadgesProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemMetaProps = useRender.ComponentProps<"span">;
declare function MessageItemMeta({ className, render, ...props }: MessageItemMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemTimeProps = useRender.ComponentProps<"span">;
declare function MessageItemTime({ className, render, ...props }: MessageItemTimeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemInlineStatusProps = useRender.ComponentProps<"span">;
declare function MessageItemInlineStatus({ className, render, ...props }: MessageItemInlineStatusProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-item/message-item-toolbar.d.ts
type MessageItemToolbarProps = useRender.ComponentProps<"div">;
declare function MessageItemToolbar({ className, render, ...props }: MessageItemToolbarProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemToolbarButtonProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};
declare function MessageItemToolbarButton({ active, className, render, ...props }: MessageItemToolbarButtonProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-item/message-footer.d.ts
type MessageItemBadgeStatus = "read" | "unread";
type MessageItemBadgeProps = useRender.ComponentProps<"span"> & {
  status?: MessageItemBadgeStatus;
};
declare function MessageItemBadge({ className, status, ...props }: MessageItemBadgeProps): import("react").JSX.Element;
type MessageItemBadgeSeparatorProps = useRender.ComponentProps<"span">;
declare function MessageItemBadgeSeparator({ className, render, ...props }: MessageItemBadgeSeparatorProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemSavedIndicatorProps = useRender.ComponentProps<"span">;
declare function MessageItemSavedIndicator({ className, render, ...props }: MessageItemSavedIndicatorProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageItemReadReceiptProps = useRender.ComponentProps<"span">;
declare function MessageItemReadReceipt({ className, render, ...props }: MessageItemReadReceiptProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-item/message-reaction.d.ts
type MessageReactionChipProps = Omit<StyledProps<Toggle.Props>, "type">;
declare function MessageReactionChip({ className, ...props }: MessageReactionChipProps): import("react").JSX.Element;
type MessageReactionErrorIndicatorProps = useRender.ComponentProps<"span">;
declare function MessageReactionErrorIndicator({ className, render, ...props }: MessageReactionErrorIndicatorProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionGlyphProps = useRender.ComponentProps<"span">;
declare function MessageReactionGlyph({ className, render, ...props }: MessageReactionGlyphProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionCountProps = useRender.ComponentProps<"span">;
declare function MessageReactionCount({ className, render, ...props }: MessageReactionCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionAddButtonProps = useRender.ComponentProps<"button">;
declare function MessageReactionAddButton({ className, render, ...props }: MessageReactionAddButtonProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionQuickRowProps = useRender.ComponentProps<"div">;
declare function MessageReactionQuickRow({ className, render, ...props }: MessageReactionQuickRowProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionQuickButtonProps = useRender.ComponentProps<"button">;
declare function MessageReactionQuickButton({ className, render, ...props }: MessageReactionQuickButtonProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionPickerStaticProps = useRender.ComponentProps<"div">;
declare function MessageReactionPickerStatic({ className, render, ...props }: MessageReactionPickerStaticProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionPickerContentProps = DropdownMenuContentProps;
declare function MessageReactionPickerContent({ className, ...props }: MessageReactionPickerContentProps): import("react").JSX.Element;
type MessageReactionTooltipContentProps = TooltipContentProps;
declare function MessageReactionTooltipContent({ className, ...props }: MessageReactionTooltipContentProps): import("react").JSX.Element;
type MessageReactionTooltipNamesProps = useRender.ComponentProps<"span">;
declare function MessageReactionTooltipNames({ className, render, ...props }: MessageReactionTooltipNamesProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionTooltipNameProps = useRender.ComponentProps<"span">;
declare function MessageReactionTooltipName({ className, render, ...props }: MessageReactionTooltipNameProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionTooltipNameTextProps = useRender.ComponentProps<"span">;
declare function MessageReactionTooltipNameText({ className, render, ...props }: MessageReactionTooltipNameTextProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionTooltipSeparatorProps = useRender.ComponentProps<"span">;
declare function MessageReactionTooltipSeparator({ className, render, ...props }: MessageReactionTooltipSeparatorProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReactionTooltipMetaProps = useRender.ComponentProps<"span">;
declare function MessageReactionTooltipMeta({ className, render, ...props }: MessageReactionTooltipMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-item/message-reference.recipe.d.ts
/** Chip variants the public `MessageReferenceChip` prop accepts. */
type MessageReferenceChipVariant = "accent" | "muted" | "info" | "link";
/** Visual variants the public `MessageReferenceText` prop accepts. */
type MessageReferenceTextVariant = "primary" | "secondary";
//#endregion
//#region src/components/message-item/message-reference.d.ts
type SpanProps$2 = useRender.ComponentProps<"span">;
type MessageReferenceTextProps = SpanProps$2 & {
  variant?: MessageReferenceTextVariant;
};
declare function MessageReferenceText({ className, render, variant, ...props }: MessageReferenceTextProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReferenceIndicatorProps = useRender.ComponentProps<"span">;
declare function MessageReferenceIndicator({ className, render, ...props }: MessageReferenceIndicatorProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReferenceChipProps = SpanProps$2 & {
  variant?: MessageReferenceChipVariant;
};
declare function MessageReferenceChip({ className, render, variant, ...props }: MessageReferenceChipProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReferenceLabelProps = useRender.ComponentProps<"span">;
declare function MessageReferenceLabel({ className, render, ...props }: MessageReferenceLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReferenceBadgeProps = useRender.ComponentProps<"span">;
declare function MessageReferenceBadge({ className, render, ...props }: MessageReferenceBadgeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReferencePendingProps = SpanProps$2;
declare function MessageReferencePending({ className, render, ...props }: MessageReferencePendingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageReferenceUnavailableProps = SpanProps$2;
declare function MessageReferenceUnavailable({ className, render, ...props }: MessageReferenceUnavailableProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-item/message-multi-select.d.ts
type MessageMultiSelectProps = useRender.ComponentProps<"div">;
declare function MessageMultiSelect({ className, render, ...props }: MessageMultiSelectProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageMultiSelectToolbarProps = useRender.ComponentProps<"div">;
/** Shared select-mode toolbar shell. Consumers compose the count and actions as children. */
declare function MessageMultiSelectToolbar({ className, render, ...props }: MessageMultiSelectToolbarProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageMultiSelectCheckboxProps = CheckboxProps;
declare function MessageMultiSelectCheckbox({ className, ...props }: MessageMultiSelectCheckboxProps): import("react").JSX.Element;
//#endregion
//#region src/components/message-item/message-text-selection-toolbar.d.ts
type MessageTextSelectionToolbarProps = StyledProps<Toolbar.Root.Props>;
declare function MessageTextSelectionToolbar({ className, ...props }: MessageTextSelectionToolbarProps): import("react").JSX.Element;
type MessageTextSelectionToolbarButtonProps = StyledProps<Toolbar.Button.Props>;
declare function MessageTextSelectionToolbarButton({ className, ...props }: MessageTextSelectionToolbarButtonProps): import("react").JSX.Element;
type MessageTextSelectionToolbarSeparatorProps = StyledProps<Toolbar.Separator.Props>;
declare function MessageTextSelectionToolbarSeparator({ className, ...props }: MessageTextSelectionToolbarSeparatorProps): import("react").JSX.Element;
//#endregion
//#region src/components/system-message/system-message.d.ts
type SystemMessageProps = useRender.ComponentProps<"div">;
declare function SystemMessage({ className, render, ...props }: SystemMessageProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SystemMessageTimeProps = useRender.ComponentProps<"span">;
declare function SystemMessageTime({ className, render, ...props }: SystemMessageTimeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SystemMessageContentProps = useRender.ComponentProps<"span">;
declare function SystemMessageContent({ children, className, render, title, ...props }: SystemMessageContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SystemMessageGroupProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};
declare function SystemMessageGroup({ className, render, ...props }: SystemMessageGroupProps): import("react").JSX.Element;
type SystemMessageGroupHeaderProps = useRender.ComponentProps<"div">;
declare function SystemMessageGroupHeader({ className, render, ...props }: SystemMessageGroupHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SystemMessageGroupDisclosureProps = useRender.ComponentProps<"button">;
declare function SystemMessageGroupDisclosure({ className, render, ...props }: SystemMessageGroupDisclosureProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SystemMessageGroupSummaryProps = useRender.ComponentProps<"span">;
declare function SystemMessageGroupSummary({ className, render, ...props }: SystemMessageGroupSummaryProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SystemMessageGroupChevronProps = useRender.ComponentProps<"svg">;
declare function SystemMessageGroupChevron({ className, render, ...props }: SystemMessageGroupChevronProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SystemMessageGroupPanelProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};
declare function SystemMessageGroupPanel({ className, render, ...props }: SystemMessageGroupPanelProps): import("react").JSX.Element;
//#endregion
//#region src/components/message-quoted-preview/message-quoted-preview.d.ts
type DivProps$2 = useRender.ComponentProps<"div">;
type SpanProps$1 = useRender.ComponentProps<"span">;
type MessageQuotedPreviewProps = DivProps$2;
declare function MessageQuotedPreview({ className, render, ...props }: MessageQuotedPreviewProps): import("react").JSX.Element;
type MessageQuotedPreviewContentProps = DivProps$2;
declare function MessageQuotedPreviewContent({ className, render, ...props }: MessageQuotedPreviewContentProps): import("react").JSX.Element;
type MessageQuotedPreviewHeaderProps = DivProps$2;
declare function MessageQuotedPreviewHeader({ className, render, ...props }: MessageQuotedPreviewHeaderProps): import("react").JSX.Element;
type MessageQuotedPreviewChannelProps = SpanProps$1;
declare function MessageQuotedPreviewChannel({ className, render, ...props }: MessageQuotedPreviewChannelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewThreadProps = SpanProps$1;
declare function MessageQuotedPreviewThread({ className, render, ...props }: MessageQuotedPreviewThreadProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewAuthorProps = SpanProps$1;
declare function MessageQuotedPreviewAuthor({ className, render, ...props }: MessageQuotedPreviewAuthorProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewAuthorNameProps = SpanProps$1;
declare function MessageQuotedPreviewAuthorName({ className, render, ...props }: MessageQuotedPreviewAuthorNameProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewAuthorMetaProps = SpanProps$1;
declare function MessageQuotedPreviewAuthorMeta({ className, render, ...props }: MessageQuotedPreviewAuthorMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewTimestampProps = SpanProps$1;
declare function MessageQuotedPreviewTimestamp({ className, render, ...props }: MessageQuotedPreviewTimestampProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewTextProps = DivProps$2;
declare function MessageQuotedPreviewText({ className, render, ...props }: MessageQuotedPreviewTextProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewAttachmentsProps = DivProps$2;
declare function MessageQuotedPreviewAttachments({ className, render, ...props }: MessageQuotedPreviewAttachmentsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewAttachmentProps = SpanProps$1;
declare function MessageQuotedPreviewAttachment({ className, render, ...props }: MessageQuotedPreviewAttachmentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageQuotedPreviewLoadingProps = DivProps$2;
declare function MessageQuotedPreviewLoading({ className, render, ...props }: MessageQuotedPreviewLoadingProps): import("react").JSX.Element;
type MessageQuotedPreviewUnavailableProps = DivProps$2;
declare function MessageQuotedPreviewUnavailable({ className, render, ...props }: MessageQuotedPreviewUnavailableProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-replies/message-replies.d.ts
type MessageRepliesProps = useRender.ComponentProps<"button">;
declare function MessageReplies({ className, render, ...props }: MessageRepliesProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageRepliesSummaryProps = useRender.ComponentProps<"span">;
declare function MessageRepliesSummary({ className, render, ...props }: MessageRepliesSummaryProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageRepliesSummaryItemProps = useRender.ComponentProps<"span">;
declare function MessageRepliesSummaryItem({ className, render, ...props }: MessageRepliesSummaryItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageRepliesItemProps = useRender.ComponentProps<"span">;
declare function MessageRepliesItem({ className, render, ...props }: MessageRepliesItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageRepliesItemSenderProps = useRender.ComponentProps<"span">;
declare function MessageRepliesItemSender({ className, render, ...props }: MessageRepliesItemSenderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageRepliesItemContentProps = useRender.ComponentProps<"span">;
declare function MessageRepliesItemContent({ className, render, ...props }: MessageRepliesItemContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageRepliesItemTimeProps = useRender.ComponentProps<"time">;
declare function MessageRepliesItemTime({ className, render, ...props }: MessageRepliesItemTimeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-action-card/message-action-card.d.ts
declare function MessageActionCard({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").JSX.Element;
declare function MessageActionCardContent({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").JSX.Element;
declare function MessageActionCardHeader({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").JSX.Element;
declare function MessageActionCardHeaderStatus({ className, render, ...props }: useRender.ComponentProps<"span">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardProperties({ className, render, ...props }: useRender.ComponentProps<"dl">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardProperty({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardPropertyLabel({ className, render, ...props }: useRender.ComponentProps<"dt">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardPropertyValue({ className, render, ...props }: useRender.ComponentProps<"dd">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardScopeList({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardScopeListLabel({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardScope({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardScopeName({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardScopeDescription({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardHint({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardCompletion({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageActionCardActions({ className, render, ...props }: useRender.ComponentProps<"div">): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageActionCardProps = useRender.ComponentProps<"div">;
type MessageActionCardContentProps = useRender.ComponentProps<"div">;
type MessageActionCardHeaderProps = useRender.ComponentProps<"div">;
type MessageActionCardHeaderStatusProps = useRender.ComponentProps<"span">;
type MessageActionCardPropertiesProps = useRender.ComponentProps<"dl">;
type MessageActionCardPropertyProps = useRender.ComponentProps<"div">;
type MessageActionCardPropertyLabelProps = useRender.ComponentProps<"dt">;
type MessageActionCardPropertyValueProps = useRender.ComponentProps<"dd">;
type MessageActionCardScopeListProps = useRender.ComponentProps<"div">;
type MessageActionCardScopeListLabelProps = useRender.ComponentProps<"div">;
type MessageActionCardScopeProps = useRender.ComponentProps<"div">;
type MessageActionCardScopeNameProps = useRender.ComponentProps<"div">;
type MessageActionCardScopeDescriptionProps = useRender.ComponentProps<"div">;
type MessageActionCardHintProps = useRender.ComponentProps<"div">;
type MessageActionCardCompletionProps = useRender.ComponentProps<"div">;
type MessageActionCardActionsProps = useRender.ComponentProps<"div">;
//#endregion
//#region src/components/message-attachment/message-attachment.d.ts
type MessageAttachmentGroupProps = useRender.ComponentProps<"div">;
declare function MessageAttachmentGroup({ className, render, ...props }: MessageAttachmentGroupProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentCardProps = useRender.ComponentProps<"div">;
declare function MessageAttachmentCard({ className, render, ...props }: MessageAttachmentCardProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentTitleProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentTitle({ className, render, ...props }: MessageAttachmentTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentMetaProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentMeta({ className, render, ...props }: MessageAttachmentMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentMetaStartProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentMetaStart({ className, render, ...props }: MessageAttachmentMetaStartProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentMetaEndProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentMetaEnd({ className, render, ...props }: MessageAttachmentMetaEndProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentSummaryProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentSummary({ className, render, ...props }: MessageAttachmentSummaryProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentCommentSummaryProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentCommentSummary({ className, render, ...props }: MessageAttachmentCommentSummaryProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentDiffSummaryProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentDiffSummary({ className, render, ...props }: MessageAttachmentDiffSummaryProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentDiffAdditionProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentDiffAddition({ className, render, ...props }: MessageAttachmentDiffAdditionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentDiffDeletionProps = useRender.ComponentProps<"span">;
declare function MessageAttachmentDiffDeletion({ className, render, ...props }: MessageAttachmentDiffDeletionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageAttachmentActionProps = useRender.ComponentProps<"button">;
declare function MessageAttachmentAction({ className, render, ...props }: MessageAttachmentActionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-attachment/message-image-gallery.d.ts
type MessageImageGalleryProps = useRender.ComponentProps<"div">;
declare function MessageImageGallery({ className, render, ...props }: MessageImageGalleryProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageImageGalleryItemProps = useRender.ComponentProps<"div">;
declare function MessageImageGalleryItem({ className, render, ...props }: MessageImageGalleryItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageImageGalleryMediaProps = useRender.ComponentProps<"div">;
declare function MessageImageGalleryMedia({ className, render, ...props }: MessageImageGalleryMediaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageImageGalleryOverlayProps = useRender.ComponentProps<"div">;
declare function MessageImageGalleryOverlay({ className, render, ...props }: MessageImageGalleryOverlayProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageImageGalleryActionProps = useRender.ComponentProps<"button">;
type MessageImageGalleryPreviewProps = useRender.ComponentProps<"button">;
declare function MessageImageGalleryPreview({ className, render, ...props }: MessageImageGalleryPreviewProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageImageGalleryAction({ className, render, ...props }: MessageImageGalleryActionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-attachment/message-video-preview.d.ts
type MessageVideoPreviewProps = useRender.ComponentProps<"div">;
declare function MessageVideoPreview({ className, render, ...props }: MessageVideoPreviewProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageVideoPreviewMediaProps = useRender.ComponentProps<"video">;
declare function MessageVideoPreviewMedia({ className, render, ...props }: MessageVideoPreviewMediaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageVideoPreviewFallbackProps = useRender.ComponentProps<"div">;
declare function MessageVideoPreviewFallback({ className, render, ...props }: MessageVideoPreviewFallbackProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageVideoPreviewFailureContentProps = useRender.ComponentProps<"div">;
declare function MessageVideoPreviewFailureContent({ className, render, ...props }: MessageVideoPreviewFailureContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageVideoPreviewFailureIconProps = useRender.ComponentProps<"span">;
declare function MessageVideoPreviewFailureIcon({ className, render, ...props }: MessageVideoPreviewFailureIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageVideoPreviewFailureTitleProps = useRender.ComponentProps<"span">;
declare function MessageVideoPreviewFailureTitle({ className, render, ...props }: MessageVideoPreviewFailureTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageVideoPreviewFailureActionProps = useRender.ComponentProps<"button">;
declare function MessageVideoPreviewFailureAction({ className, render, ...props }: MessageVideoPreviewFailureActionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageVideoPreviewActionProps = useRender.ComponentProps<"button">;
declare function MessageVideoPreviewAction({ className, render, ...props }: MessageVideoPreviewActionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/message-embed/message-embed.d.ts
type DivProps$1 = useRender.ComponentProps<"div">;
declare function MessageEmbed({ className, render, ...props }: DivProps$1): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageEmbedHeader({ className, render, ...props }: DivProps$1): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageEmbedContent({ className, render, ...props }: DivProps$1): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare function MessageEmbedFooter({ className, render, ...props }: DivProps$1): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageEmbedProps = DivProps$1;
type MessageEmbedHeaderProps = DivProps$1;
type MessageEmbedContentProps = DivProps$1;
type MessageEmbedFooterProps = DivProps$1;
//#endregion
//#region src/components/message-forwarded-bundle/message-forwarded-bundle.d.ts
type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
type ButtonProps$1 = useRender.ComponentProps<"button">;
type ArticleProps = useRender.ComponentProps<"article">;
type MessageForwardedBundleProps = DivProps;
declare function MessageForwardedBundle({ className, render, ...props }: MessageForwardedBundleProps): import("react").JSX.Element;
type MessageForwardedBundleHeaderProps = DivProps;
declare function MessageForwardedBundleHeader({ className, render, ...props }: MessageForwardedBundleHeaderProps): import("react").JSX.Element;
type MessageForwardedBundleHeaderContentProps = DivProps;
declare function MessageForwardedBundleHeaderContent({ className, render, ...props }: MessageForwardedBundleHeaderContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleHeaderLabelProps = SpanProps;
declare function MessageForwardedBundleHeaderLabel({ className, render, ...props }: MessageForwardedBundleHeaderLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleHeaderCountProps = SpanProps;
declare function MessageForwardedBundleHeaderCount({ className, render, ...props }: MessageForwardedBundleHeaderCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleItemsProps = DivProps & {
  collapsed?: boolean;
};
declare function MessageForwardedBundleItems({ className, collapsed, render, ...props }: MessageForwardedBundleItemsProps): import("react").JSX.Element;
type MessageForwardedBundleItemProps = ArticleProps;
declare function MessageForwardedBundleItem({ className, render, ...props }: MessageForwardedBundleItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleItemMetaProps = DivProps;
declare function MessageForwardedBundleItemMeta({ className, render, ...props }: MessageForwardedBundleItemMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleItemAuthorProps = SpanProps;
declare function MessageForwardedBundleItemAuthor({ className, render, ...props }: MessageForwardedBundleItemAuthorProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleAttachmentsProps = DivProps;
declare function MessageForwardedBundleAttachments({ className, render, ...props }: MessageForwardedBundleAttachmentsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleAttachmentProps = SpanProps;
declare function MessageForwardedBundleAttachment({ className, render, ...props }: MessageForwardedBundleAttachmentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleAttachmentNameProps = SpanProps;
declare function MessageForwardedBundleAttachmentName({ className, render, ...props }: MessageForwardedBundleAttachmentNameProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleAttachmentMetaProps = SpanProps;
declare function MessageForwardedBundleAttachmentMeta({ className, render, ...props }: MessageForwardedBundleAttachmentMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleFooterProps = DivProps;
declare function MessageForwardedBundleFooter({ className, render, ...props }: MessageForwardedBundleFooterProps): import("react").JSX.Element;
type MessageForwardedBundleSourceProps = ButtonProps$1;
declare function MessageForwardedBundleSource({ className, render, ...props }: MessageForwardedBundleSourceProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleSourceLabelProps = SpanProps;
declare function MessageForwardedBundleSourceLabel({ className, render, ...props }: MessageForwardedBundleSourceLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageForwardedBundleFooterActionProps = ButtonProps$1;
declare function MessageForwardedBundleFooterAction({ className, render, ...props }: MessageForwardedBundleFooterActionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/progress/progress.d.ts
declare const progress: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
      label: string[];
      value: string[];
      track: string[];
    };
    elegant: {
      root: string[];
      label: string[];
      value: string[];
      track: string[];
      indicator: string[];
    };
  };
  variant: {
    primary: {
      root: string[];
    };
    information: {
      root: string[];
    };
    accent: {
      root: string[];
    };
    success: {
      root: string[];
    };
    warning: {
      root: string[];
    };
    danger: {
      root: string[];
    };
  };
  size: {
    sm: {};
    md: {};
    lg: {};
  };
}, {
  root: string[];
  header: string[];
  label: string[];
  value: string[];
  track: string[];
  indicator: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
      label: string[];
      value: string[];
      track: string[];
    };
    elegant: {
      root: string[];
      label: string[];
      value: string[];
      track: string[];
      indicator: string[];
    };
  };
  variant: {
    primary: {
      root: string[];
    };
    information: {
      root: string[];
    };
    accent: {
      root: string[];
    };
    success: {
      root: string[];
    };
    warning: {
      root: string[];
    };
    danger: {
      root: string[];
    };
  };
  size: {
    sm: {};
    md: {};
    lg: {};
  };
}, {
  root: string[];
  header: string[];
  label: string[];
  value: string[];
  track: string[];
  indicator: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
      label: string[];
      value: string[];
      track: string[];
    };
    elegant: {
      root: string[];
      label: string[];
      value: string[];
      track: string[];
      indicator: string[];
    };
  };
  variant: {
    primary: {
      root: string[];
    };
    information: {
      root: string[];
    };
    accent: {
      root: string[];
    };
    success: {
      root: string[];
    };
    warning: {
      root: string[];
    };
    danger: {
      root: string[];
    };
  };
  size: {
    sm: {};
    md: {};
    lg: {};
  };
}, {
  root: string[];
  header: string[];
  label: string[];
  value: string[];
  track: string[];
  indicator: string[];
}>>;
type ProgressProps = StyledProps<Progress$1.Root.Props> & Omit<VariantProps<typeof progress>, "theme">;
declare function Progress({ size, variant, className, ...props }: ProgressProps): import("react").JSX.Element;
type ProgressHeaderProps = ComponentPropsWithRef<"div">;
declare function ProgressHeader({ className, ...props }: ProgressHeaderProps): import("react").JSX.Element;
type ProgressLabelProps = StyledProps<Progress$1.Label.Props>;
declare function ProgressLabel({ className, ...props }: ProgressLabelProps): import("react").JSX.Element;
type ProgressValueProps = StyledProps<Progress$1.Value.Props>;
declare function ProgressValue({ className, ...props }: ProgressValueProps): import("react").JSX.Element;
type ProgressTrackProps = StyledProps<Progress$1.Track.Props>;
declare function ProgressTrack({ className, ...props }: ProgressTrackProps): import("react").JSX.Element;
type ProgressIndicatorProps = StyledProps<Progress$1.Indicator.Props>;
declare function ProgressIndicator({ className, ...props }: ProgressIndicatorProps): import("react").JSX.Element;
//#endregion
//#region src/components/message-translation/message-translation.d.ts
type MessageItemTranslationOriginalProps = MarkdownBlockquoteProps;
declare function MessageItemTranslationOriginal({ className, ...props }: MessageItemTranslationOriginalProps): import("react").JSX.Element;
type MessageItemTranslationOriginalLabelProps = ComponentProps<"div">;
declare function MessageItemTranslationOriginalLabel({ className, ...props }: MessageItemTranslationOriginalLabelProps): import("react").JSX.Element;
type MessageItemTranslationStatusProps = ComponentProps<"div">;
declare function MessageItemTranslationStatus({ className, ...props }: MessageItemTranslationStatusProps): import("react").JSX.Element;
type MessageItemTranslationProgressTrackProps = ProgressTrackProps;
declare function MessageItemTranslationProgressTrack({ className, ...props }: MessageItemTranslationProgressTrackProps): import("react").JSX.Element;
type MessageItemTranslationFailedStatusProps = ComponentProps<"div">;
declare function MessageItemTranslationFailedStatus({ className, ...props }: MessageItemTranslationFailedStatusProps): import("react").JSX.Element;
type MessageItemTranslationActionProps = ComponentProps<"button">;
declare function MessageItemTranslationAction({ className, ...props }: MessageItemTranslationActionProps): import("react").JSX.Element;
type MessageItemTranslationRetryActionProps = ComponentProps<"button">;
declare function MessageItemTranslationRetryAction({ className, ...props }: MessageItemTranslationRetryActionProps): import("react").JSX.Element;
//#endregion
//#region src/components/message-list/message-list.d.ts
type MessageListProps = useRender.ComponentProps<"div"> & {
  rootClassName?: string;
};
declare function MessageList({ children, className, render, rootClassName, ...props }: MessageListProps): import("react").JSX.Element;
//#endregion
//#region src/components/message-list/message-list-markers.d.ts
type MessageListDateDividerProps = useRender.ComponentProps<"div">;
declare function MessageListDateDivider({ children, className, render, ...props }: MessageListDateDividerProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageListNoticeProps = useRender.ComponentProps<"div"> & {
  tone?: "faint" | "muted";
};
declare function MessageListNotice({ className, render, tone, ...props }: MessageListNoticeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type MessageListHistoryLimitedProps = useRender.ComponentProps<"span">;
declare function MessageListHistoryLimited({ className, render, ...props }: MessageListHistoryLimitedProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/text/text.d.ts
declare const heading: import("tailwind-variants/lite").TVReturnType<{
  level: {
    1: string[];
    2: string[];
    3: string[];
    4: string[];
    5: string[];
    6: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined, string[], {
  level: {
    1: string[];
    2: string[];
    3: string[];
    4: string[];
    5: string[];
    6: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined, import("tailwind-variants/lite").TVReturnTypeLike<{
  level: {
    1: string[];
    2: string[];
    3: string[];
    4: string[];
    5: string[];
    6: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined>>;
declare const sans: import("tailwind-variants/lite").TVReturnType<{
  size: {
    large: string[];
    body: string[];
    small: string[];
    caption: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined, string[], {
  size: {
    large: string[];
    body: string[];
    small: string[];
    caption: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined, import("tailwind-variants/lite").TVReturnTypeLike<{
  size: {
    large: string[];
    body: string[];
    small: string[];
    caption: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined>>;
declare const mono: import("tailwind-variants/lite").TVReturnType<{
  size: {
    code: string[];
    meta: string[];
    eyebrow: string[];
    tabular: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined, string[], {
  size: {
    code: string[];
    meta: string[];
    eyebrow: string[];
    tabular: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined, import("tailwind-variants/lite").TVReturnTypeLike<{
  size: {
    code: string[];
    meta: string[];
    eyebrow: string[];
    tabular: string[];
  };
  variant: {
    default: string[];
    primary: string[];
    information: string[];
    muted: string[];
    placeholder: string[];
    accent: string[];
    success: string[];
    warning: string[];
    danger: string[];
  };
}, undefined>>;
type TextHeadingProps = useRender.ComponentProps<"h1"> & VariantProps<typeof heading>;
declare function TextHeading({ level, variant, className, render, ...props }: TextHeadingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TextSansProps = useRender.ComponentProps<"p"> & VariantProps<typeof sans>;
declare function TextSans({ size, variant, className, render, ...props }: TextSansProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TextMonoProps = useRender.ComponentProps<"p"> & VariantProps<typeof mono>;
declare function TextMono({ size, variant, className, render, ...props }: TextMonoProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
declare const Text: {
  Heading: typeof TextHeading;
  Sans: typeof TextSans;
  Mono: typeof TextMono;
};
//#endregion
//#region src/components/scroll-area/scroll-area.d.ts
type ScrollAreaProps = StyledProps<ScrollArea$1.Root.Props>;
declare function ScrollArea({ className, ...props }: ScrollAreaProps): import("react").JSX.Element;
type ScrollAreaViewportProps = StyledProps<ScrollArea$1.Viewport.Props>;
declare function ScrollAreaViewport({ className, ...props }: ScrollAreaViewportProps): import("react").JSX.Element;
type ScrollAreaContentProps = StyledProps<ScrollArea$1.Content.Props>;
declare function ScrollAreaContent({ className, ...props }: ScrollAreaContentProps): import("react").JSX.Element;
type ScrollAreaScrollbarProps = StyledProps<ScrollArea$1.Scrollbar.Props>;
declare function ScrollAreaScrollbar({ className, orientation, ...props }: ScrollAreaScrollbarProps): import("react").JSX.Element;
type ScrollAreaThumbProps = StyledProps<ScrollArea$1.Thumb.Props>;
declare function ScrollAreaThumb({ className, ...props }: ScrollAreaThumbProps): import("react").JSX.Element;
type ScrollAreaCornerProps = StyledProps<ScrollArea$1.Corner.Props>;
declare function ScrollAreaCorner({ className, ...props }: ScrollAreaCornerProps): import("react").JSX.Element;
//#endregion
//#region src/components/spinner/spinner.d.ts
declare const spinner: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {};
    elegant: {};
  };
  size: {
    xs: {};
    sm: {};
    md: {};
    lg: {};
  };
  variant: {
    default: {};
    inverse: {};
  };
}, {
  root: string[];
  ring: string;
}, undefined, {
  theme: {
    brutal: {};
    elegant: {};
  };
  size: {
    xs: {};
    sm: {};
    md: {};
    lg: {};
  };
  variant: {
    default: {};
    inverse: {};
  };
}, {
  root: string[];
  ring: string;
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {};
    elegant: {};
  };
  size: {
    xs: {};
    sm: {};
    md: {};
    lg: {};
  };
  variant: {
    default: {};
    inverse: {};
  };
}, {
  root: string[];
  ring: string;
}>>;
type SpinnerProps = WithoutChildren<useRender.ComponentProps<"span">> & Omit<VariantProps<typeof spinner>, "theme">;
declare function Spinner({ size, variant, className, render, ...props }: SpinnerProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/file-preview/file-preview.d.ts
type FilePreviewProps = useRender.ComponentProps<"span">;
declare function FilePreview({ className, render, ...props }: FilePreviewProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FilePreviewDocumentProps = useRender.ComponentProps<"span">;
declare function FilePreviewDocument({ children, className, render, ...props }: FilePreviewDocumentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FilePreviewFileProps = useRender.ComponentProps<"span">;
declare function FilePreviewFile({ children, className, render, ...props }: FilePreviewFileProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FilePreviewCodeProps = useRender.ComponentProps<"span">;
declare function FilePreviewCode({ children, className, render, ...props }: FilePreviewCodeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FilePreviewBadgeColor = "rose" | "blue" | "amber" | "emerald" | "violet" | "neutral";
/** Semantic file kinds mapped onto `FilePreviewBadgeColor` (not a `tv` variant). */
type FilePreviewBadgeType = "pdf" | "doc" | "docx" | "txt" | "md" | "csv" | "json" | "zip" | "html" | "code" | "img" | "png" | "jpg" | "jpeg" | "gif" | "webp" | "svg" | "mp4" | "mov";
type FilePreviewBadgeProps = useRender.ComponentProps<"span"> & ({
  type: FilePreviewBadgeType;
  color?: never;
} | {
  type?: never;
  color?: FilePreviewBadgeColor;
});
declare function FilePreviewBadge({ className, render, color, type, ...props }: FilePreviewBadgeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FilePreviewMediaProps = useRender.ComponentProps<"span">;
declare function FilePreviewMedia({ children, className, render, ...props }: FilePreviewMediaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/files/files.d.ts
type FileTag = "button" | "div" | "img" | "section" | "span";
type DataAttributes = Record<`data-${string}`, string | undefined>;
type FileSlotProps<Tag extends FileTag> = useRender.ComponentProps<Tag> & DataAttributes;
type FilesPanelProps = FileSlotProps<"section">;
declare function FilesPanel(props: FilesPanelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FilesViewportProps = FileSlotProps<"div">;
declare function FilesViewport(props: FilesViewportProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FilesListProps = FileSlotProps<"div">;
declare function FilesList(props: FilesListProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileRowProps = FileSlotProps<"div">;
declare function FileRow(props: FileRowProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileRowOpenProps = FileSlotProps<"button">;
declare function FileRowOpen(props: FileRowOpenProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileThumbnailProps = FileSlotProps<"span">;
declare function FileThumbnail(props: FileThumbnailProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileImageProps = FileSlotProps<"img"> & {
  fit?: "contain" | "cover";
};
declare function FileImage({ fit, ...props }: FileImageProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileContentProps = FileSlotProps<"span">;
declare function FileContent(props: FileContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileNameProps = FileSlotProps<"span">;
declare function FileName(props: FileNameProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileMetaProps = FileSlotProps<"span">;
declare function FileMeta(props: FileMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileMetaItemProps = FileSlotProps<"span">;
declare function FileMetaItem(props: FileMetaItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileActionsProps = FileSlotProps<"span">;
declare function FileActions(props: FileActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type FileActionProps = Omit<ButtonProps, "variant" | "size"> & Pick<Partial<ButtonProps>, "variant" | "size">;
declare function FileAction({ variant, size, ...props }: FileActionProps): import("react").JSX.Element;
//#endregion
//#region src/components/composer/composer.d.ts
type ComposerProps = useRender.ComponentProps<"div">;
declare function Composer({ className, render, ...props }: ComposerProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerInputProps = useRender.ComponentProps<"textarea">;
declare function ComposerInput({ className, render, ...props }: ComposerInputProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerToolbarProps = useRender.ComponentProps<"div">;
declare function ComposerToolbar({ className, render, ...props }: ComposerToolbarProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerActionsProps = useRender.ComponentProps<"div">;
declare function ComposerActions({ className, render, ...props }: ComposerActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerMetaProps = useRender.ComponentProps<"div">;
declare function ComposerMeta({ className, render, ...props }: ComposerMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerIconButtonProps = Omit<ButtonProps, "className" | "size" | "variant"> & {
  className?: string;
};
declare function ComposerIconButton({ className, ...props }: ComposerIconButtonProps): import("react").JSX.Element;
type ComposerSubmitProps = Omit<ButtonProps, "variant">;
declare function ComposerSubmit({ type, ...props }: ComposerSubmitProps): import("react").JSX.Element;
//#endregion
//#region src/components/composer/composer-attachments.d.ts
type ComposerAttachmentsProps = useRender.ComponentProps<"div">;
declare function ComposerAttachments({ className, render, ...props }: ComposerAttachmentsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentProps = useRender.ComponentProps<"div">;
declare function ComposerAttachment({ className, render, ...props }: ComposerAttachmentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentFileProps = useRender.ComponentProps<"span">;
declare function ComposerAttachmentFile({ className, render, ...props }: ComposerAttachmentFileProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentImageProps = useRender.ComponentProps<"span">;
declare function ComposerAttachmentImage({ className, render, ...props }: ComposerAttachmentImageProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentBodyProps = useRender.ComponentProps<"span">;
declare function ComposerAttachmentBody({ className, render, ...props }: ComposerAttachmentBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentTitleProps = useRender.ComponentProps<"span">;
declare function ComposerAttachmentTitle({ className, render, ...props }: ComposerAttachmentTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentMetaProps = useRender.ComponentProps<"span">;
declare function ComposerAttachmentMeta({ className, render, ...props }: ComposerAttachmentMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentUploadingOverlayProps = useRender.ComponentProps<"span">;
declare function ComposerAttachmentUploadingOverlay({ className, render, ...props }: ComposerAttachmentUploadingOverlayProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentUploadProgressBarProps = Omit<useRender.ComponentProps<"span">, "children"> & {
  value: number;
};
declare function ComposerAttachmentUploadProgressBar({ className, render, value, ...props }: ComposerAttachmentUploadProgressBarProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentFailedOverlayProps = useRender.ComponentProps<"span">;
declare function ComposerAttachmentFailedOverlay({ className, render, ...props }: ComposerAttachmentFailedOverlayProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerAttachmentRemoveProps = useRender.ComponentProps<"button">;
declare function ComposerAttachmentRemove({ className, render, ...props }: ComposerAttachmentRemoveProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/composer/composer-attachments-scroll-area.d.ts
type ComposerAttachmentsScrollAreaProps = ComponentPropsWithoutRef<"div">;
declare function ComposerAttachmentsScrollArea({ children, className, onMouseEnter, onMouseLeave, ...props }: ComposerAttachmentsScrollAreaProps): import("react").JSX.Element;
//#endregion
//#region src/components/composer/sortable-composer-attachments.d.ts
type SortableComposerAttachmentsProps = {
  items: readonly string[];
  onReorder: (items: string[]) => void;
  children: ReactNode;
};
/** Wrap / flex-pack attachment reorder (mixed widths). */
declare function SortableComposerAttachments(props: SortableComposerAttachmentsProps): import("react").JSX.Element;
/** Horizontal scroll strip reorder — wraps `ComposerAttachmentsScrollArea`. */
declare function SortableComposerAttachmentsScroll(props: SortableComposerAttachmentsProps): import("react").JSX.Element;
type SortableComposerAttachmentProps = {
  id: string;
  label: string;
  children: ReactNode;
};
/**
 * Sized placeholder stays in the flex flow (opacity 0). DragOverlay is the
 * pointer ghost — the root reads these `children` for it. Live draft reorder
 * moves this slot to the drop index; wrap skips strategy transforms so siblings
 * FLIP via layout instead of wrong gaps.
 */
declare function SortableComposerAttachment({ id, label, children }: SortableComposerAttachmentProps): import("react").JSX.Element;
//#endregion
//#region src/components/composer/composer-drop-overlay.d.ts
type ComposerDropOverlayProps = useRender.ComponentProps<"div">;
declare function ComposerDropOverlay({ className, render, ...props }: ComposerDropOverlayProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerDropOverlayLabelProps = useRender.ComponentProps<"span">;
declare function ComposerDropOverlayLabel({ className, render, ...props }: ComposerDropOverlayLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerDropOverlayPromptProps = ComposerDropOverlayLabelProps;
declare function ComposerDropOverlayPrompt({ children, ...props }: ComposerDropOverlayPromptProps): import("react").JSX.Element;
//#endregion
//#region src/components/composer/composer-suggestion-list.d.ts
declare const composerSuggestionList: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string;
      groupLabel: string;
      item: string[];
      meta: string;
    };
    elegant: {
      root: string[];
      group: string;
      groupLabel: string[];
      item: string[];
      meta: string;
    };
  };
  separated: {
    true: {
      group: string;
    };
    false: {};
  };
  iconVariant: {
    avatar: {};
    framed: {};
    auxiliary: {
      icon: string;
    };
  };
  metaVariant: {
    text: {
      meta: string;
    };
    code: {
      meta: string;
    };
  };
}, {
  root: string;
  group: never[];
  groupLabel: string[];
  item: string[];
  content: string[];
  icon: string[];
  title: string[];
  aside: string[];
  meta: never[];
}, undefined, {
  theme: {
    brutal: {
      root: string;
      groupLabel: string;
      item: string[];
      meta: string;
    };
    elegant: {
      root: string[];
      group: string;
      groupLabel: string[];
      item: string[];
      meta: string;
    };
  };
  separated: {
    true: {
      group: string;
    };
    false: {};
  };
  iconVariant: {
    avatar: {};
    framed: {};
    auxiliary: {
      icon: string;
    };
  };
  metaVariant: {
    text: {
      meta: string;
    };
    code: {
      meta: string;
    };
  };
}, {
  root: string;
  group: never[];
  groupLabel: string[];
  item: string[];
  content: string[];
  icon: string[];
  title: string[];
  aside: string[];
  meta: never[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string;
      groupLabel: string;
      item: string[];
      meta: string;
    };
    elegant: {
      root: string[];
      group: string;
      groupLabel: string[];
      item: string[];
      meta: string;
    };
  };
  separated: {
    true: {
      group: string;
    };
    false: {};
  };
  iconVariant: {
    avatar: {};
    framed: {};
    auxiliary: {
      icon: string;
    };
  };
  metaVariant: {
    text: {
      meta: string;
    };
    code: {
      meta: string;
    };
  };
}, {
  root: string;
  group: never[];
  groupLabel: string[];
  item: string[];
  content: string[];
  icon: string[];
  title: string[];
  aside: string[];
  meta: never[];
}>>;
type ComposerSuggestionListProps = useRender.ComponentProps<"div">;
declare function ComposerSuggestionList({ className, render, ...props }: ComposerSuggestionListProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerSuggestionListVariantProps = Omit<VariantProps<typeof composerSuggestionList>, "theme">;
type ComposerSuggestionGroupProps = useRender.ComponentProps<"div"> & Pick<ComposerSuggestionListVariantProps, "separated">;
declare function ComposerSuggestionGroup({ separated, className, render, ...props }: ComposerSuggestionGroupProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerSuggestionGroupLabelProps = useRender.ComponentProps<"div">;
declare function ComposerSuggestionGroupLabel({ className, render, ...props }: ComposerSuggestionGroupLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerSuggestionOptionProps = useRender.ComponentProps<"div">;
declare function ComposerSuggestionOption({ className, render, ...props }: ComposerSuggestionOptionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerSuggestionContentProps = useRender.ComponentProps<"div">;
declare function ComposerSuggestionContent({ className, render, ...props }: ComposerSuggestionContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerSuggestionIconProps = useRender.ComponentProps<"span"> & {
  variant?: ComposerSuggestionListVariantProps["iconVariant"];
};
declare function ComposerSuggestionIcon({ variant, className, render, ...props }: ComposerSuggestionIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerSuggestionTitleProps = useRender.ComponentProps<"span">;
declare function ComposerSuggestionTitle({ className, render, ...props }: ComposerSuggestionTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerSuggestionAsideProps = useRender.ComponentProps<"span">;
declare function ComposerSuggestionAside({ className, render, ...props }: ComposerSuggestionAsideProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ComposerSuggestionMetaProps = useRender.ComponentProps<"span"> & {
  variant?: ComposerSuggestionListVariantProps["metaVariant"];
};
declare function ComposerSuggestionMeta({ variant, className, render, ...props }: ComposerSuggestionMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/composer/composer-root.d.ts
type ComposerRootProps = useRender.ComponentProps<"form">;
declare function ComposerRoot({ className, render, ...props }: ComposerRootProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/composer/composer-toolbar-label.d.ts
type ComposerToolbarLabelProps = useRender.ComponentProps<"label">;
declare function ComposerToolbarLabel({ className, render, ...props }: ComposerToolbarLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/composer/use-composer-suggestions.d.ts
interface ComposerSuggestionTriggerMatch {
  /** The trigger marker that opened the list, e.g. "@" or "#". */
  marker: string;
  /** The query typed after the marker, excluding the marker. */
  query: string;
  /** Caret index in the value where the marker begins. */
  start: number;
}
interface UseComposerSuggestionsParams<TItem extends object> {
  /** Controlled value of the composer input. */
  value: string;
  /** Called when typing or an inserted suggestion changes the value. */
  onValueChange: (value: string) => void;
  /** Detect an active trigger in the text before the caret; return null when inactive. */
  detectTrigger: (textBeforeCaret: string) => ComposerSuggestionTriggerMatch | null;
  /** Items offered for the active trigger. An empty list closes the popup. */
  getItems: (match: ComposerSuggestionTriggerMatch) => readonly TItem[];
  /** Text inserted in place of the trigger token when an item is chosen, e.g. "@handle ". */
  getItemText: (item: TItem) => string;
  /** Optional predicate marking an item as non-selectable. */
  isItemDisabled?: (item: TItem) => boolean;
}
type ComposerSuggestionsInputProps = Omit<ComponentPropsWithoutRef<"textarea">, "aria-activedescendant" | "aria-autocomplete" | "aria-controls" | "role" | "value">;
type ComposerSuggestionsListProps = Omit<ComponentPropsWithoutRef<"div">, "aria-label" | "aria-labelledby" | "id" | "role"> & ({
  "aria-label": string;
  "aria-labelledby"?: never;
} | {
  "aria-label"?: never;
  "aria-labelledby": string;
});
type ComposerSuggestionsOptionProps = Omit<ComponentPropsWithoutRef<"div">, "aria-disabled" | "aria-selected" | "data-disabled" | "data-composer-suggestion-index" | "data-highlighted" | "id" | "role">;
interface ComposerSuggestionsInputInternalProps {
  "aria-activedescendant": string | undefined;
  "aria-autocomplete": "list";
  "aria-controls": string | undefined;
  ref: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onBlur: FocusEventHandler<HTMLTextAreaElement>;
  onChange: FormEventHandler<HTMLTextAreaElement>;
  onCompositionEnd: CompositionEventHandler<HTMLTextAreaElement>;
  onCompositionStart: () => void;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  onSelect: FormEventHandler<HTMLTextAreaElement>;
}
interface ComposerSuggestionsListInternalProps {
  id: string;
  ref: RefObject<HTMLDivElement | null>;
  role: "listbox";
}
interface ComposerSuggestionsOptionInternalProps {
  "aria-disabled": boolean;
  "aria-selected": boolean;
  "data-disabled": boolean;
  "data-composer-suggestion-index": number;
  "data-highlighted": boolean;
  id: string;
  onClick: () => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  role: "option";
}
/**
 * Headless behavior for an inline trigger-driven suggestion popup (@mention, #channel)
 * layered over a composer textarea. Owns open state, highlighted option, keyboard
 * navigation, IME guarding, and caret-preserving insertion. The consumer supplies
 * trigger detection, item data, insertion text, and textarea/listbox option semantics.
 */
declare function useComposerSuggestions<TItem extends object>({ value, onValueChange, detectTrigger, getItems, getItemText, isItemDisabled }: UseComposerSuggestionsParams<TItem>): {
  open: boolean;
  items: readonly TItem[];
  highlightedIndex: number;
  activeItem: TItem | undefined;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
  getInputProps: (props?: ComposerSuggestionsInputProps) => ComposerSuggestionsInputInternalProps & ComposerSuggestionsInputProps;
  getListProps: (props: ComposerSuggestionsListProps) => ComposerSuggestionsListInternalProps & ComposerSuggestionsListProps;
  getOptionProps: (item: TItem, index: number, props?: ComposerSuggestionsOptionProps) => ComposerSuggestionsOptionInternalProps & ComposerSuggestionsOptionProps;
  select: (item: TItem) => void;
  insert: (text: string) => void;
  clear: () => void;
};
//#endregion
//#region src/components/skeleton/skeleton.d.ts
declare const skeleton: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  variant: {
    line: {
      root: string;
    };
    block: {
      root: string;
    };
    circle: {
      root: string;
    };
  };
}, {
  root: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  variant: {
    line: {
      root: string;
    };
    block: {
      root: string;
    };
    circle: {
      root: string;
    };
  };
}, {
  root: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
    };
    elegant: {
      root: string[];
    };
  };
  variant: {
    line: {
      root: string;
    };
    block: {
      root: string;
    };
    circle: {
      root: string;
    };
  };
}, {
  root: string[];
}>>;
type SkeletonVariant = NonNullable<VariantProps<typeof skeleton>["variant"]>;
type SkeletonProps = HTMLAttributes<HTMLDivElement> & Omit<VariantProps<typeof skeleton>, "theme">;
declare function Skeleton({ variant, className, ...props }: SkeletonProps): import("react").JSX.Element;
//#endregion
//#region src/components/banner/banner.d.ts
declare const banner: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
      title: string[];
      description: string[];
      action: string[];
    };
    elegant: {
      root: string[];
      title: string[];
      description: string[];
      action: string[];
    };
  };
  status: {
    default: {};
    destructive: {};
    warning: {};
    info: {};
    success: {};
  };
  size: {
    sm: {};
    md: {};
    lg: {};
  };
}, {
  root: string[];
  title: string[];
  description: string[];
  action: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
      title: string[];
      description: string[];
      action: string[];
    };
    elegant: {
      root: string[];
      title: string[];
      description: string[];
      action: string[];
    };
  };
  status: {
    default: {};
    destructive: {};
    warning: {};
    info: {};
    success: {};
  };
  size: {
    sm: {};
    md: {};
    lg: {};
  };
}, {
  root: string[];
  title: string[];
  description: string[];
  action: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
      title: string[];
      description: string[];
      action: string[];
    };
    elegant: {
      root: string[];
      title: string[];
      description: string[];
      action: string[];
    };
  };
  status: {
    default: {};
    destructive: {};
    warning: {};
    info: {};
    success: {};
  };
  size: {
    sm: {};
    md: {};
    lg: {};
  };
}, {
  root: string[];
  title: string[];
  description: string[];
  action: string[];
}>>;
type BannerStatus = NonNullable<VariantProps<typeof banner>["status"]>;
type BannerProps = useRender.ComponentProps<"div"> & Omit<VariantProps<typeof banner>, "theme" | "align"> & {
  status: BannerStatus;
};
declare function Banner({ status, size, className, render, ...props }: BannerProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type BannerTitleProps = useRender.ComponentProps<"div">;
declare function BannerTitle({ render, className, ...props }: BannerTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type BannerDescriptionProps = useRender.ComponentProps<"div">;
declare function BannerDescription({ render, className, ...props }: BannerDescriptionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type BannerActionProps = Omit<useRender.ComponentProps<"div">, "align">;
declare function BannerAction({ render, className, ...props }: BannerActionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/empty-state/empty-state.d.ts
type EmptyStateProps = useRender.ComponentProps<"div">;
declare function EmptyState({ render, className, ...props }: EmptyStateProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type EmptyStateContentProps = useRender.ComponentProps<"div">;
declare function EmptyStateContent({ render, className, ...props }: EmptyStateContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type EmptyStateIconProps = useRender.ComponentProps<"div">;
declare function EmptyStateIcon({ render, className, ...props }: EmptyStateIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type EmptyStateTitleProps = useRender.ComponentProps<"div">;
declare function EmptyStateTitle({ render, className, ...props }: EmptyStateTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type EmptyStateDescriptionProps = useRender.ComponentProps<"div">;
declare function EmptyStateDescription({ render, className, ...props }: EmptyStateDescriptionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type EmptyStateActionsProps = useRender.ComponentProps<"div">;
declare function EmptyStateActions({ render, className, ...props }: EmptyStateActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/notification-center/notification-center.d.ts
declare const notificationCenter: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      trigger: string[];
      popup: string[];
      header: string[];
      title: string[];
      count: string[];
      list: string[];
      itemRow: string[];
      itemIcon: string[];
      itemTitle: string[];
      actionButton: never[];
    };
    elegant: {
      trigger: string[];
      triggerIcon: string[];
      triggerBell: string[];
      triggerBellGlow: string[];
      triggerDot: string[];
      popup: string[];
      header: string[];
      scroller: string[];
      title: string[];
      count: string[];
      list: string[];
      itemRow: string[];
      itemIcon: string[];
      itemTitle: string[];
      itemBody: string[];
      actionButton: string[];
    };
  };
  viewport: {
    desktop: {
      popup: string;
    };
    mobile: {
      popup: string;
    };
  };
  size: {
    sm: {
      popup: string;
    };
    md: {
      popup: string;
    };
    lg: {
      popup: string;
    };
  };
  read: {
    true: {
      item: string;
    };
    false: {
      item: string;
    };
  };
  status: {
    error: {};
    warning: {};
    info: {};
    success: {};
  };
  actionVariant: {
    primary: {};
    secondary: {};
  };
}, {
  trigger: never[];
  triggerIcon: never[];
  triggerBell: never[];
  triggerBellGlow: never[];
  triggerDot: never[];
  popup: string[];
  header: string[];
  title: string[];
  count: string[];
  scroller: string[];
  list: string[];
  item: string[];
  itemRow: string[];
  itemIcon: string[];
  itemContent: string[];
  itemTitle: string[];
  itemBody: string[];
  itemActions: string[];
  actionButton: never[];
}, undefined, {
  theme: {
    brutal: {
      trigger: string[];
      popup: string[];
      header: string[];
      title: string[];
      count: string[];
      list: string[];
      itemRow: string[];
      itemIcon: string[];
      itemTitle: string[];
      actionButton: never[];
    };
    elegant: {
      trigger: string[];
      triggerIcon: string[];
      triggerBell: string[];
      triggerBellGlow: string[];
      triggerDot: string[];
      popup: string[];
      header: string[];
      scroller: string[];
      title: string[];
      count: string[];
      list: string[];
      itemRow: string[];
      itemIcon: string[];
      itemTitle: string[];
      itemBody: string[];
      actionButton: string[];
    };
  };
  viewport: {
    desktop: {
      popup: string;
    };
    mobile: {
      popup: string;
    };
  };
  size: {
    sm: {
      popup: string;
    };
    md: {
      popup: string;
    };
    lg: {
      popup: string;
    };
  };
  read: {
    true: {
      item: string;
    };
    false: {
      item: string;
    };
  };
  status: {
    error: {};
    warning: {};
    info: {};
    success: {};
  };
  actionVariant: {
    primary: {};
    secondary: {};
  };
}, {
  trigger: never[];
  triggerIcon: never[];
  triggerBell: never[];
  triggerBellGlow: never[];
  triggerDot: never[];
  popup: string[];
  header: string[];
  title: string[];
  count: string[];
  scroller: string[];
  list: string[];
  item: string[];
  itemRow: string[];
  itemIcon: string[];
  itemContent: string[];
  itemTitle: string[];
  itemBody: string[];
  itemActions: string[];
  actionButton: never[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      trigger: string[];
      popup: string[];
      header: string[];
      title: string[];
      count: string[];
      list: string[];
      itemRow: string[];
      itemIcon: string[];
      itemTitle: string[];
      actionButton: never[];
    };
    elegant: {
      trigger: string[];
      triggerIcon: string[];
      triggerBell: string[];
      triggerBellGlow: string[];
      triggerDot: string[];
      popup: string[];
      header: string[];
      scroller: string[];
      title: string[];
      count: string[];
      list: string[];
      itemRow: string[];
      itemIcon: string[];
      itemTitle: string[];
      itemBody: string[];
      actionButton: string[];
    };
  };
  viewport: {
    desktop: {
      popup: string;
    };
    mobile: {
      popup: string;
    };
  };
  size: {
    sm: {
      popup: string;
    };
    md: {
      popup: string;
    };
    lg: {
      popup: string;
    };
  };
  read: {
    true: {
      item: string;
    };
    false: {
      item: string;
    };
  };
  status: {
    error: {};
    warning: {};
    info: {};
    success: {};
  };
  actionVariant: {
    primary: {};
    secondary: {};
  };
}, {
  trigger: never[];
  triggerIcon: never[];
  triggerBell: never[];
  triggerBellGlow: never[];
  triggerDot: never[];
  popup: string[];
  header: string[];
  title: string[];
  count: string[];
  scroller: string[];
  list: string[];
  item: string[];
  itemRow: string[];
  itemIcon: string[];
  itemContent: string[];
  itemTitle: string[];
  itemBody: string[];
  itemActions: string[];
  actionButton: never[];
}>>;
type NotificationCenterProps = Popover$1.Root.Props;
declare function NotificationCenter({ modal, ...props }: NotificationCenterProps): import("react").JSX.Element;
type NotificationCenterTriggerProps = StyledProps<Popover$1.Trigger.Props>;
declare function NotificationCenterTrigger({ className, children, ...props }: NotificationCenterTriggerProps): import("react").JSX.Element;
type NotificationCenterPortalProps = Popover$1.Portal.Props;
type NotificationCenterPopupProps = StyledProps<Popover$1.Popup.Props> & Pick<VariantProps<typeof notificationCenter>, "size" | "viewport"> & Pick<Popover$1.Positioner.Props, "align" | "alignOffset" | "anchor" | "arrowPadding" | "collisionAvoidance" | "collisionBoundary" | "collisionPadding" | "disableAnchorTracking" | "positionMethod" | "side" | "sideOffset" | "sticky"> & {
  portalProps?: NotificationCenterPortalProps;
};
declare function NotificationCenterPopup({ viewport, size, className, initialFocus, align, alignOffset, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking, positionMethod, side, sideOffset, sticky, portalProps, ...props }: NotificationCenterPopupProps): import("react").JSX.Element;
type NotificationCenterHeaderProps = useRender.ComponentProps<"div">;
declare function NotificationCenterHeader({ render, className, ...props }: NotificationCenterHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterTitleProps = useRender.ComponentProps<"span">;
declare function NotificationCenterTitle({ render, className, ...props }: NotificationCenterTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterCountProps = useRender.ComponentProps<"span">;
declare function NotificationCenterCount({ render, className, ...props }: NotificationCenterCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterScrollerProps = useRender.ComponentProps<"div">;
declare function NotificationCenterScroller({ render, className, ...props }: NotificationCenterScrollerProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterListProps = useRender.ComponentProps<"ul">;
declare function NotificationCenterList({ render, className, ...props }: NotificationCenterListProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterItemProps = useRender.ComponentProps<"li"> & Pick<VariantProps<typeof notificationCenter>, "read">;
declare function NotificationCenterItem({ read, render, className, ...props }: NotificationCenterItemProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterItemRowProps = useRender.ComponentProps<"div">;
declare function NotificationCenterItemRow({ render, className, ...props }: NotificationCenterItemRowProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterItemIconProps = useRender.ComponentProps<"div"> & Pick<VariantProps<typeof notificationCenter>, "status">;
declare function NotificationCenterItemIcon({ status, render, className, children, ...props }: NotificationCenterItemIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterItemContentProps = useRender.ComponentProps<"div">;
declare function NotificationCenterItemContent({ render, className, ...props }: NotificationCenterItemContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterItemTitleProps = useRender.ComponentProps<"div">;
declare function NotificationCenterItemTitle({ render, className, ...props }: NotificationCenterItemTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterItemBodyProps = useRender.ComponentProps<"div">;
declare function NotificationCenterItemBody({ render, className, ...props }: NotificationCenterItemBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterItemActionsProps = useRender.ComponentProps<"div">;
declare function NotificationCenterItemActions({ render, className, ...props }: NotificationCenterItemActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type NotificationCenterActionButtonProps = Omit<ButtonProps, "className" | "size" | "variant"> & {
  className?: string;
  variant?: VariantProps<typeof notificationCenter>["actionVariant"];
};
declare function NotificationCenterActionButton({ variant, className, ...props }: NotificationCenterActionButtonProps): import("react").JSX.Element;
type NotificationCenterEmptyStateProps = EmptyStateProps;
declare function NotificationCenterEmptyState(props: NotificationCenterEmptyStateProps): import("react").JSX.Element;
//#endregion
//#region src/components/toast/toast.d.ts
declare const toastStyles: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      root: string[];
      content: string[];
      icon: string[];
      title: string[];
      description: string[];
      actions: string[];
      close: string[];
      arrow: string[];
    };
    elegant: {
      root: string[];
      content: string[];
      icon: string[];
      title: string[];
      description: string[];
      actions: string[];
      close: string[];
      arrow: never[];
    };
  };
  placement: {
    "bottom-center": {
      viewport: string;
    };
    "bottom-right": {
      viewport: string;
    };
    "top-center": {
      viewport: string;
    };
    "top-right": {
      viewport: string;
    };
    none: {
      viewport: string;
    };
  };
  strategy: {
    fixed: {
      viewport: string;
    };
    absolute: {
      viewport: string;
    };
  };
  layout: {
    stacked: {
      root: string[];
    };
    inline: {
      root: string[];
    };
  };
  tone: {
    info: {};
    success: {};
    warning: {};
    error: {};
  };
}, {
  viewport: string[];
  positioner: string[];
  root: string[];
  content: string[];
  icon: string[];
  body: string[];
  title: string[];
  description: string[];
  actions: string[];
  close: string[];
  arrow: string[];
}, undefined, {
  theme: {
    brutal: {
      root: string[];
      content: string[];
      icon: string[];
      title: string[];
      description: string[];
      actions: string[];
      close: string[];
      arrow: string[];
    };
    elegant: {
      root: string[];
      content: string[];
      icon: string[];
      title: string[];
      description: string[];
      actions: string[];
      close: string[];
      arrow: never[];
    };
  };
  placement: {
    "bottom-center": {
      viewport: string;
    };
    "bottom-right": {
      viewport: string;
    };
    "top-center": {
      viewport: string;
    };
    "top-right": {
      viewport: string;
    };
    none: {
      viewport: string;
    };
  };
  strategy: {
    fixed: {
      viewport: string;
    };
    absolute: {
      viewport: string;
    };
  };
  layout: {
    stacked: {
      root: string[];
    };
    inline: {
      root: string[];
    };
  };
  tone: {
    info: {};
    success: {};
    warning: {};
    error: {};
  };
}, {
  viewport: string[];
  positioner: string[];
  root: string[];
  content: string[];
  icon: string[];
  body: string[];
  title: string[];
  description: string[];
  actions: string[];
  close: string[];
  arrow: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      root: string[];
      content: string[];
      icon: string[];
      title: string[];
      description: string[];
      actions: string[];
      close: string[];
      arrow: string[];
    };
    elegant: {
      root: string[];
      content: string[];
      icon: string[];
      title: string[];
      description: string[];
      actions: string[];
      close: string[];
      arrow: never[];
    };
  };
  placement: {
    "bottom-center": {
      viewport: string;
    };
    "bottom-right": {
      viewport: string;
    };
    "top-center": {
      viewport: string;
    };
    "top-right": {
      viewport: string;
    };
    none: {
      viewport: string;
    };
  };
  strategy: {
    fixed: {
      viewport: string;
    };
    absolute: {
      viewport: string;
    };
  };
  layout: {
    stacked: {
      root: string[];
    };
    inline: {
      root: string[];
    };
  };
  tone: {
    info: {};
    success: {};
    warning: {};
    error: {};
  };
}, {
  viewport: string[];
  positioner: string[];
  root: string[];
  content: string[];
  icon: string[];
  body: string[];
  title: string[];
  description: string[];
  actions: string[];
  close: string[];
  arrow: string[];
}>>;
declare const createToastManager: typeof Toast.createToastManager;
declare const useToastManager: typeof Toast.useToastManager;
type ToastIntent = "info" | "success" | "warning" | "error";
type ToastData = {
  intent?: ToastIntent;
  hasClose?: boolean;
  hasIcon?: boolean;
  contentClassName?: string;
};
type ToastObject<Data extends object = object> = Toast.Root.ToastObject<Data>;
type ToastCommandOptions<Data extends object = ToastData> = Omit<Partial<ToastObject<Data>>, "actionProps" | "data" | "title" | "type"> & {
  action?: {
    label: ReactNode;
    onClick?: ComponentPropsWithRef<"button">["onClick"];
  };
  dismissible?: boolean;
  icon?: boolean;
};
declare const toast: {
  add(options: ToastCommandOptions<ToastData> & {
    title: string;
    type?: ToastIntent;
  }): string;
  info(title: string, options?: ToastCommandOptions<ToastData>): string;
  success(title: string, options?: ToastCommandOptions<ToastData>): string;
  warning(title: string, options?: ToastCommandOptions<ToastData>): string;
  error(title: string, options?: ToastCommandOptions<ToastData>): string;
  dismiss(id?: string): void;
};
type ToastProviderProps = Toast.Provider.Props & {
  portalContainer?: Toast.Portal.Props["container"];
  renderViewport?: boolean;
  viewportClassName?: string;
  viewportPlacement?: ToastViewportProps["placement"];
  viewportStrategy?: ToastViewportProps["strategy"];
};
declare function ToastProvider({ children, portalContainer, renderViewport, toastManager, viewportClassName, viewportPlacement, viewportStrategy, ...props }: ToastProviderProps): import("react").JSX.Element;
type ToastPortalProps = Toast.Portal.Props;
declare function ToastPortal(props: ToastPortalProps): import("react").JSX.Element;
type ToastViewportProps = StyledProps<Toast.Viewport.Props> & Pick<VariantProps<typeof toastStyles>, "placement" | "strategy">;
declare function ToastViewport({ placement, strategy, className, ...props }: ToastViewportProps): import("react").JSX.Element;
type ToastPositionerProps = StyledProps<Toast.Positioner.Props>;
declare function ToastPositioner({ className, ...props }: ToastPositionerProps): import("react").JSX.Element;
type ToastRootProps = StyledProps<Toast.Root.Props> & Pick<VariantProps<typeof toastStyles>, "layout">;
declare function ToastRoot({ layout, className, toast: toastObject, ...props }: ToastRootProps): import("react").JSX.Element;
type ToastContentProps = StyledProps<Toast.Content.Props>;
declare function ToastContent({ children, className, ...props }: ToastContentProps): import("react").JSX.Element;
type ToastIconProps = ComponentPropsWithRef<"div">;
declare function ToastIcon({ className, ...props }: ToastIconProps): import("react").JSX.Element;
type ToastBodyProps = ComponentPropsWithRef<"div">;
declare function ToastBody({ className, ...props }: ToastBodyProps): import("react").JSX.Element;
type ToastActionsProps = ComponentPropsWithRef<"div">;
declare function ToastActions({ className, ...props }: ToastActionsProps): import("react").JSX.Element;
type ToastTitleProps = StyledProps<Toast.Title.Props>;
declare function ToastTitle({ className, ...props }: ToastTitleProps): import("react").JSX.Element;
type ToastDescriptionProps = StyledProps<Toast.Description.Props>;
declare function ToastDescription({ className, ...props }: ToastDescriptionProps): import("react").JSX.Element;
type ToastActionProps = StyledProps<Toast.Action.Props> & {
  loading?: boolean;
  loadingLabel?: string;
};
declare function ToastAction({ className, children, disabled, loading, loadingLabel, render, ...props }: ToastActionProps): import("react").JSX.Element;
type ToastCloseProps = StyledProps<Toast.Close.Props>;
declare function ToastClose({ className, children, ...props }: ToastCloseProps): import("react").JSX.Element;
type ToastArrowProps = StyledProps<Toast.Arrow.Props>;
declare function ToastArrow({ className, ...props }: ToastArrowProps): import("react").JSX.Element | null;
//#endregion
//#region src/components/tabs/tabs.d.ts
declare const tabs: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: {
      list: string[];
      background: string;
      tab: string[];
    };
    elegant: {};
  };
  variant: {
    default: {};
    underline: {};
  };
}, {
  root: string[];
  list: string[];
  background: string[];
  tab: string[];
  content: string[];
  label: string[];
  panel: string[];
  indicator: string[];
}, undefined, {
  theme: {
    brutal: {
      list: string[];
      background: string;
      tab: string[];
    };
    elegant: {};
  };
  variant: {
    default: {};
    underline: {};
  };
}, {
  root: string[];
  list: string[];
  background: string[];
  tab: string[];
  content: string[];
  label: string[];
  panel: string[];
  indicator: string[];
}, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: {
      list: string[];
      background: string;
      tab: string[];
    };
    elegant: {};
  };
  variant: {
    default: {};
    underline: {};
  };
}, {
  root: string[];
  list: string[];
  background: string[];
  tab: string[];
  content: string[];
  label: string[];
  panel: string[];
  indicator: string[];
}>>;
type TabsListVariant = "default" | "underline";
type TabsProps<T extends string = string> = StyledProps<Omit<Tabs$1.Root.Props, "defaultValue" | "onValueChange" | "value">> & Omit<VariantProps<typeof tabs>, "theme"> & {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T, eventDetails: Tabs$1.Root.ChangeEventDetails) => void;
};
declare function Tabs<T extends string = string>({ value, defaultValue, onValueChange, className, ...props }: TabsProps<T>): import("react").JSX.Element;
type TabsListProps = StyledProps<Tabs$1.List.Props> & {
  variant?: TabsListVariant;
};
declare function TabsList({ className, children, variant, ...props }: TabsListProps): import("react").JSX.Element;
type SortableTabsListProps<T extends string = string> = TabsListProps & {
  value: readonly T[];
  onReorder: (value: T[]) => void;
};
declare function SortableTabsList<T extends string = string>({ value, onReorder, children, variant, ...props }: SortableTabsListProps<T>): import("react").JSX.Element;
type TabsTabProps<T extends string = string> = StyledProps<Tabs$1.Tab.Props> & {
  value: T;
};
declare function TabsTab<T extends string = string>({ value, ...props }: TabsTabProps<T>): import("react").JSX.Element;
type SortableTabsTabProps<T extends string = string> = TabsTabProps<T>;
declare function SortableTabsTab<T extends string = string>({ value, ...props }: SortableTabsTabProps<T>): import("react").JSX.Element;
type TabsLabelProps = ComponentPropsWithRef<"span">;
declare function TabsLabel({ className, ...props }: TabsLabelProps): import("react").JSX.Element;
type TabsPanelProps = StyledProps<Tabs$1.Panel.Props>;
declare function TabsPanel({ className, ...props }: TabsPanelProps): import("react").JSX.Element;
type TabsBackgroundProps = ComponentPropsWithRef<"span">;
declare function TabsBackground({ className, ...props }: TabsBackgroundProps): import("react").JSX.Element;
type TabsIndicatorProps = StyledProps<Tabs$1.Indicator.Props>;
declare function TabsIndicator({ className, ...props }: TabsIndicatorProps): import("react").JSX.Element;
type OrderedTabItem<T extends string = string> = {
  id: T;
};
declare function useOrderedTabs<T extends OrderedTabItem<string>>(items: readonly T[], storedOrder: readonly string[]): T[];
//#endregion
//#region src/components/separator/separator.d.ts
type SeparatorProps = StyledProps<Separator$1.Props> & {
  children?: ReactNode;
};
declare function Separator({ children, className, orientation, ...props }: SeparatorProps): import("react").JSX.Element;
//#endregion
//#region src/components/app-shell/app-shell.d.ts
type AppShellRootProps = useRender.ComponentProps<"div"> & {
  defaultSidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
  sidebarCollapsible?: boolean;
  sidebarOpen?: boolean;
};
declare function AppShellRoot({ className, defaultSidebarOpen, onSidebarOpenChange, render, sidebarCollapsible, sidebarOpen: sidebarOpenProp, style, ...props }: AppShellRootProps): import("react").JSX.Element;
type AppShellRailSlotProps = useRender.ComponentProps<"aside">;
declare function AppShellRailSlot({ className, render, ...props }: AppShellRailSlotProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppShellSidebarSlotProps = useRender.ComponentProps<"aside">;
declare function AppShellSidebarSlot({ className, render, ...props }: AppShellSidebarSlotProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppShellPanelSlotProps = useRender.ComponentProps<"aside">;
declare function AppShellPanelSlot({ className, render, ...props }: AppShellPanelSlotProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppShellOverlaySlotProps = useRender.ComponentProps<"div">;
declare function AppShellOverlaySlot({ className, render, ...props }: AppShellOverlaySlotProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppShellMainSlotProps = useRender.ComponentProps<"main"> & {
  overlay?: boolean;
};
declare function AppShellMainSlot({ className, overlay, render, ...props }: AppShellMainSlotProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type AppShellSidebarTriggerProps = useRender.ComponentProps<"button"> & {
  children: ReactNode;
};
declare function AppShellSidebarTrigger(props: AppShellSidebarTriggerProps): import("react").JSX.Element | null;
//#endregion
//#region src/components/resizable/resizable.d.ts
type ResizableGroupProps = Omit<GroupProps, "className"> & {
  className?: string;
};
declare function ResizableGroup({ className, orientation, ...props }: ResizableGroupProps): import("react").JSX.Element;
type ResizablePanelProps = Omit<PanelProps$1, "className"> & {
  className?: string;
};
declare function ResizablePanel({ className, ...props }: ResizablePanelProps): import("react").JSX.Element;
type ResizableHandleProps = Omit<SeparatorProps$1, "className"> & {
  className?: string;
};
declare function ResizableHandle({ className, ...props }: ResizableHandleProps): import("react").JSX.Element;
//#endregion
//#region src/components/panel/panel-header.d.ts
type PanelHeaderProps = useRender.ComponentProps<"div">;
declare function PanelHeader({ children, className, render, ...props }: PanelHeaderProps): import("react").JSX.Element;
type PanelSectionHeaderProps = useRender.ComponentProps<"div">;
declare function PanelSectionHeader({ children, className, render, ...props }: PanelSectionHeaderProps): import("react").JSX.Element;
type PanelHeaderIconProps = useRender.ComponentProps<"div">;
declare function PanelHeaderIcon({ className, render, ...props }: PanelHeaderIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelHeaderContentProps = useRender.ComponentProps<"div">;
declare function PanelHeaderContent({ className, render, ...props }: PanelHeaderContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelHeadingProps = useRender.ComponentProps<"div">;
declare function PanelHeading({ className, render, ...props }: PanelHeadingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelTitleProps = useRender.ComponentProps<"div">;
declare function PanelTitle({ className, render, ...props }: PanelTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelMetaProps = useRender.ComponentProps<"div"> & {
  size?: "sm" | "md";
};
declare function PanelMeta({ className, render, size, ...props }: PanelMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelStatusProps = useRender.ComponentProps<"span">;
/**
 * Attribute badge in a panel header, such as a muted or archived marker.
 * Use `PanelActivity` for a live status readout wrapping a `Status`.
 */
declare function PanelStatus({ className, render, ...props }: PanelStatusProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelActivityProps = useRender.ComponentProps<"span">;
/**
 * Live status readout in a panel header, such as agent activity or presence.
 * Wraps a `Status` and supplies header-appropriate spacing and typography;
 * use `PanelStatus` for a standalone attribute badge.
 */
declare function PanelActivity({ className, render, ...props }: PanelActivityProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type PanelActionsProps = useRender.ComponentProps<"div">;
declare function PanelActions({ className, render, ...props }: PanelActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/panel/panel-action.d.ts
type PanelActionProps = Omit<StyledProps<Button$1.Props>, "type"> & DataAttributes$1;
declare function PanelAction({ className, render, nativeButton, ...props }: PanelActionProps): import("react").JSX.Element;
//#endregion
//#region src/components/panel/panel-toggle-action.d.ts
type PanelToggleActionProps = Omit<StyledProps<Toggle.Props>, "type">;
declare function PanelToggleAction({ className, ...props }: PanelToggleActionProps): import("react").JSX.Element;
//#endregion
//#region src/components/profile-panel/profile-panel.d.ts
type ProfilePanelProps = PanelProps;
declare function ProfilePanel({ className, edge, ...props }: ProfilePanelProps): import("react").JSX.Element;
type ProfilePanelHeaderProps = PanelHeaderProps;
declare function ProfilePanelHeader({ className, ...props }: ProfilePanelHeaderProps): import("react").JSX.Element;
type ProfilePanelHeaderContentProps = PanelHeaderContentProps;
declare function ProfilePanelHeaderContent({ className, ...props }: ProfilePanelHeaderContentProps): import("react").JSX.Element;
type ProfilePanelBodyProps = PanelBodyProps;
declare function ProfilePanelBody({ className, ...props }: ProfilePanelBodyProps): import("react").JSX.Element;
type ProfilePanelSectionProps = PanelSectionProps;
declare function ProfilePanelSection({ className, ...props }: ProfilePanelSectionProps): import("react").JSX.Element;
//#endregion
//#region src/components/thread-panel/thread-panel.d.ts
type ThreadPanelRootProps = useRender.ComponentProps<"section">;
declare function ThreadPanelRoot({ className, render, ...props }: ThreadPanelRootProps): import("react").JSX.Element;
type ThreadPanelHeaderProps = useRender.ComponentProps<"div">;
declare function ThreadPanelHeader({ className, render, ...props }: ThreadPanelHeaderProps): import("react").JSX.Element;
type ThreadPanelContentProps = useRender.ComponentProps<"div">;
declare function ThreadPanelContent({ className, render, ...props }: ThreadPanelContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ThreadPanelTitleProps = useRender.ComponentProps<"h2">;
declare function ThreadPanelTitle({ className, render, ...props }: ThreadPanelTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ThreadPanelTitleMetaProps = useRender.ComponentProps<"span">;
declare function ThreadPanelTitleMeta({ className, render, ...props }: ThreadPanelTitleMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ThreadPanelActionsProps = useRender.ComponentProps<"div">;
declare function ThreadPanelActions({ className, render, ...props }: ThreadPanelActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ThreadPanelBodyProps = useRender.ComponentProps<"div">;
declare function ThreadPanelBody({ className, render, ...props }: ThreadPanelBodyProps): import("react").JSX.Element;
type ThreadPanelOriginalMessageProps = Omit<useRender.ComponentProps<"div">, "render">;
declare function ThreadPanelOriginalMessage({ className, ...props }: ThreadPanelOriginalMessageProps): import("react").JSX.Element;
type ThreadPanelReplySummaryProps = useRender.ComponentProps<"div">;
declare function ThreadPanelReplySummary({ className, render, ...props }: ThreadPanelReplySummaryProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ThreadPanelReplyCountProps = useRender.ComponentProps<"div">;
declare function ThreadPanelReplyCount({ className, render, ...props }: ThreadPanelReplyCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ThreadPanelFooterProps = useRender.ComponentProps<"div">;
declare function ThreadPanelFooter({ className, render, ...props }: ThreadPanelFooterProps): import("react").JSX.Element;
type ThreadPanelSearchProps = useRender.ComponentProps<"div">;
declare function ThreadPanelSearch({ className, render, ...props }: ThreadPanelSearchProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ThreadPanelSearchTrailingProps = useRender.ComponentProps<"div">;
declare function ThreadPanelSearchTrailing({ className, render, ...props }: ThreadPanelSearchTrailingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type ThreadPanelSearchCountProps = useRender.ComponentProps<"div">;
declare function ThreadPanelSearchCount({ className, render, ...props }: ThreadPanelSearchCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/live-agent-activity-bar/live-agent-activity-bar.d.ts
type LiveAgentActivityBarProps = useRender.ComponentProps<"div"> & {
  beam?: boolean;
};
declare function LiveAgentActivityBar({ beam, children, className, render, ...props }: LiveAgentActivityBarProps): import("react").JSX.Element | null;
type LiveAgentActivityBarRowProps = useRender.ComponentProps<"div">;
declare function LiveAgentActivityBarRow({ className, render, ...props }: LiveAgentActivityBarRowProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LiveAgentActivityBarAvatarProps = Omit<AvatarProps, "size" | "type">;
declare function LiveAgentActivityBarAvatar({ children, className, render, ...props }: LiveAgentActivityBarAvatarProps): import("react").JSX.Element;
type LiveAgentActivityBarContentProps = useRender.ComponentProps<"div">;
declare function LiveAgentActivityBarContent({ className, render, ...props }: LiveAgentActivityBarContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LiveAgentActivityBarStatusProps = Omit<StatusProps, "attention" | "pulse" | "size" | "variant">;
declare function LiveAgentActivityBarStatus({ className, ...props }: LiveAgentActivityBarStatusProps): import("react").JSX.Element;
type LiveAgentActivityBarTextProps = useRender.ComponentProps<"span">;
declare function LiveAgentActivityBarText({ className, render, ...props }: LiveAgentActivityBarTextProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/tasks/task-status.recipe.d.ts
type TaskStatusId = "todo" | "in-progress" | "in-review" | "done" | "closed";
declare const taskStatus: import("tailwind-variants/lite").TVReturnType<{
  theme: {
    brutal: "";
    elegant: "";
  };
  status: {
    todo: "";
    "in-progress": "";
    "in-review": "";
    done: "";
    closed: "";
  };
}, undefined, undefined, {
  theme: {
    brutal: "";
    elegant: "";
  };
  status: {
    todo: "";
    "in-progress": "";
    "in-review": "";
    done: "";
    closed: "";
  };
}, undefined, import("tailwind-variants/lite").TVReturnTypeLike<{
  theme: {
    brutal: "";
    elegant: "";
  };
  status: {
    todo: "";
    "in-progress": "";
    "in-review": "";
    done: "";
    closed: "";
  };
}, undefined>>;
//#endregion
//#region src/components/task-board/task-board.d.ts
type TaskBoardRootProps = useRender.ComponentProps<"div">;
declare function TaskBoardRoot({ className, render, ...props }: TaskBoardRootProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};
declare function TaskBoardColumn({ className, render, ...props }: TaskBoardColumnProps): import("react").JSX.Element;
type TaskBoardColumnTriggerProps = Omit<ComponentProps<typeof Collapsible.Trigger>, "className"> & {
  className?: string;
};
declare function TaskBoardColumnTrigger({ className, ...props }: TaskBoardColumnTriggerProps): import("react").JSX.Element;
type TaskBoardColumnHeadingProps = useRender.ComponentProps<"span">;
declare function TaskBoardColumnHeading({ className, render, ...props }: TaskBoardColumnHeadingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnBadgeProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
};
declare function TaskBoardColumnBadge({ status, children, className, render, ...props }: TaskBoardColumnBadgeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnCountProps = useRender.ComponentProps<"span">;
declare function TaskBoardColumnCount({ className, render, ...props }: TaskBoardColumnCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnChevronProps = useRender.ComponentProps<"span">;
declare function TaskBoardColumnChevron({ className, render, ...props }: TaskBoardColumnChevronProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnPanelProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};
declare function TaskBoardColumnPanel({ className, ...props }: TaskBoardColumnPanelProps): import("react").JSX.Element;
type TaskBoardColumnItemsProps = useRender.ComponentProps<"div">;
declare function TaskBoardColumnItems({ className, render, ...props }: TaskBoardColumnItemsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnEmptyProps = useRender.ComponentProps<"div">;
declare function TaskBoardColumnEmpty({ className, render, ...props }: TaskBoardColumnEmptyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnEmptyIdleProps = useRender.ComponentProps<"span">;
declare function TaskBoardColumnEmptyIdle({ className, render, ...props }: TaskBoardColumnEmptyIdleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnEmptyAllowedProps = useRender.ComponentProps<"span">;
declare function TaskBoardColumnEmptyAllowed({ className, render, ...props }: TaskBoardColumnEmptyAllowedProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskBoardColumnEmptyBlockedProps = useRender.ComponentProps<"span">;
declare function TaskBoardColumnEmptyBlocked({ className, render, ...props }: TaskBoardColumnEmptyBlockedProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/task-card/task-card.d.ts
type TaskCardProps = useRender.ComponentProps<"article"> & {
  busy?: boolean;
  disabled?: boolean;
};
declare function TaskCard({ busy, disabled, className, render, ...props }: TaskCardProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardRowProps = useRender.ComponentProps<"div">;
declare function TaskCardRow({ className, render, ...props }: TaskCardRowProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardBodyProps = useRender.ComponentProps<"div">;
declare function TaskCardBody({ className, render, ...props }: TaskCardBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardMetaProps = useRender.ComponentProps<"div">;
declare function TaskCardMeta({ className, render, ...props }: TaskCardMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardChannelProps = useRender.ComponentProps<"span">;
declare function TaskCardChannel({ className, render, ...props }: TaskCardChannelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardNumberProps = useRender.ComponentProps<"span">;
declare function TaskCardNumber({ className, render, ...props }: TaskCardNumberProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardLegacyProps = useRender.ComponentProps<"span">;
declare function TaskCardLegacy({ className, render, ...props }: TaskCardLegacyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardTitleProps = useRender.ComponentProps<"p">;
declare function TaskCardTitle({ className, render, ...props }: TaskCardTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardDescriptionProps = useRender.ComponentProps<"p">;
declare function TaskCardDescription({ className, render, ...props }: TaskCardDescriptionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskCardStatusProps = useRender.ComponentProps<"button"> & {
  busy?: boolean;
  status: TaskStatusId;
};
declare function TaskCardStatus({ busy, status, className, render, children, ...props }: TaskCardStatusProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/task-dnd/task-dnd.d.ts
type TaskDropState = "idle" | "allowed" | "blocked";
type TaskDropPlacement = "before" | "after";
type TaskDropData = Record<string, unknown>;
type TaskMoveDetails = {
  activeId: UniqueIdentifier;
  overId: UniqueIdentifier;
  overData: TaskDropData | undefined;
  placement: TaskDropPlacement | null;
};
type TaskDndProviderProps = {
  children: ReactNode;
  disabled?: boolean;
  isDropAllowed?: (activeId: UniqueIdentifier, overId: UniqueIdentifier, overData: TaskDropData | undefined) => boolean;
  onMove?: (details: TaskMoveDetails) => void | Promise<void>;
  onMoveError?: (error: unknown, details: TaskMoveDetails) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragMove?: (event: DragMoveEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragCancel?: (event: DragCancelEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
};
declare function TaskDndProvider({ children, disabled, isDropAllowed, onMove, onMoveError, onDragStart, onDragMove, onDragOver, onDragCancel, onDragEnd }: TaskDndProviderProps): import("react").JSX.Element;
type TaskDraggableProps = ComponentPropsWithRef<"div"> & {
  id: UniqueIdentifier;
  disabled?: boolean;
  dropId?: UniqueIdentifier;
  dropData?: TaskDropData;
  dropDisabled?: boolean;
};
declare function TaskDraggable({ id, disabled, dropId, dropData, dropDisabled, className, ref: consumerRef, style, ...props }: TaskDraggableProps): import("react").JSX.Element;
type TaskDropZoneState = {
  dropState: TaskDropState;
};
type TaskDropZoneProps = useRender.ComponentProps<"div", TaskDropZoneState> & {
  id: UniqueIdentifier;
  disabled?: boolean;
  data?: TaskDropData;
};
declare function TaskDropZone({ id, data, disabled, render, ...props }: TaskDropZoneProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskDropPlaceholderProps = useRender.ComponentProps<"div", TaskDropZoneState> & {
  id: UniqueIdentifier;
  placement?: TaskDropPlacement;
};
declare function TaskDropPlaceholder({ id, placement, className, render, style, ...props }: TaskDropPlaceholderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskDragOverlayProps = {
  children?: ReactNode;
  className?: string;
};
declare function TaskDragOverlay({ children, className }: TaskDragOverlayProps): import("react").JSX.Element;
//#endregion
//#region src/components/task-list/task-list.d.ts
type TaskListRootProps = useRender.ComponentProps<"div">;
declare function TaskListRoot({ className, render, ...props }: TaskListRootProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskSectionProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};
declare function TaskSection({ className, render, ...props }: TaskSectionProps): import("react").JSX.Element;
type TaskSectionTriggerProps = Omit<ComponentProps<typeof Collapsible.Trigger>, "className"> & {
  className?: string;
};
declare function TaskSectionTrigger({ className, ...props }: TaskSectionTriggerProps): import("react").JSX.Element;
type TaskSectionHeadingProps = useRender.ComponentProps<"span">;
declare function TaskSectionHeading({ className, render, ...props }: TaskSectionHeadingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskSectionBadgeProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
};
declare function TaskSectionBadge({ status, children, className, render, ...props }: TaskSectionBadgeProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskSectionCountProps = useRender.ComponentProps<"span">;
declare function TaskSectionCount({ className, render, ...props }: TaskSectionCountProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskSectionChevronProps = useRender.ComponentProps<"span">;
declare function TaskSectionChevron({ className, render, ...props }: TaskSectionChevronProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskSectionPanelProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};
declare function TaskSectionPanel({ className, ...props }: TaskSectionPanelProps): import("react").JSX.Element;
type TaskSectionItemsProps = useRender.ComponentProps<"div">;
declare function TaskSectionItems({ className, render, ...props }: TaskSectionItemsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskSectionEmptyProps = useRender.ComponentProps<"div">;
declare function TaskSectionEmpty({ className, render, ...props }: TaskSectionEmptyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/tasks/tasks-panel.d.ts
type TasksPanelRootProps = useRender.ComponentProps<"section">;
declare function TasksPanelRoot({ className, render, ...props }: TasksPanelRootProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TasksPanelToolbarProps = useRender.ComponentProps<"div">;
declare function TasksPanelToolbar({ className, render, ...props }: TasksPanelToolbarProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
/** Generic toolbar cluster. Prefer NewTask / Filters / View for responsive layout. */
type TasksPanelToolbarGroupProps = useRender.ComponentProps<"div">;
declare function TasksPanelToolbarGroup({ className, render, ...props }: TasksPanelToolbarGroupProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TasksPanelToolbarNewTaskProps = useRender.ComponentProps<"div">;
declare function TasksPanelToolbarNewTask({ className, render, ...props }: TasksPanelToolbarNewTaskProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TasksPanelToolbarFiltersProps = useRender.ComponentProps<"div">;
declare function TasksPanelToolbarFilters({ className, render, ...props }: TasksPanelToolbarFiltersProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TasksPanelToolbarViewProps = useRender.ComponentProps<"div">;
declare function TasksPanelToolbarView({ className, render, ...props }: TasksPanelToolbarViewProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TasksPanelToolbarLabelProps = useRender.ComponentProps<"span">;
declare function TasksPanelToolbarLabel({ className, render, ...props }: TasksPanelToolbarLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TasksPanelViewportProps = useRender.ComponentProps<"div">;
declare function TasksPanelViewport({ className, render, ...props }: TasksPanelViewportProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TasksPanelEmptyProps = useRender.ComponentProps<"div">;
declare function TasksPanelEmpty({ className, render, ...props }: TasksPanelEmptyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/tasks/task-loading.d.ts
type TaskLoadingListProps = useRender.ComponentProps<"div">;
declare function TaskLoadingList({ className, render, ...props }: TaskLoadingListProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type TaskLoadingRowProps = useRender.ComponentProps<"div">;
declare function TaskLoadingRow({ className, render, ...props }: TaskLoadingRowProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/tasks/task-chip.d.ts
type TaskChipVariant = "default" | "inline";
type TaskChipProps = useRender.ComponentProps<"span"> & {
  status: TaskStatusId;
  loading?: boolean;
  variant?: TaskChipVariant;
};
declare function TaskChip({ status, loading, variant, className, render, children, ...props }: TaskChipProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/tasks/task-status-icon.d.ts
declare function TaskTodoIcon(props: {
  className?: string;
}): import("react").JSX.Element;
declare function TaskInProgressIcon(props: {
  className?: string;
}): import("react").JSX.Element;
declare function TaskInReviewIcon(props: {
  className?: string;
}): import("react").JSX.Element;
declare function TaskDoneIcon(props: {
  className?: string;
}): import("react").JSX.Element;
declare function TaskClosedIcon(props: {
  className?: string;
}): import("react").JSX.Element;
declare function TaskStatusIcon({ status, className }: {
  status: TaskStatusId;
  className?: string;
}): import("react").JSX.Element;
//#endregion
//#region src/components/legacy-task-panel/legacy-task-panel.d.ts
type LegacyTaskPanelRootProps = useRender.ComponentProps<"div"> & {
  /** Docs preview chrome. Shell hosts (Playground) leave this off. */
  framed?: boolean;
};
declare function LegacyTaskPanelRoot({ className, framed, render, children, ...props }: LegacyTaskPanelRootProps): import("react").JSX.Element;
type LegacyTaskPanelHeaderProps = useRender.ComponentProps<"div">;
declare function LegacyTaskPanelHeader({ className, ...props }: LegacyTaskPanelHeaderProps): import("react").JSX.Element;
type LegacyTaskPanelIconProps = useRender.ComponentProps<"div">;
declare function LegacyTaskPanelIcon({ className, render, children, ...props }: LegacyTaskPanelIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelTitleProps = useRender.ComponentProps<"h2">;
declare function LegacyTaskPanelTitle({ className, ...props }: LegacyTaskPanelTitleProps): import("react").JSX.Element;
type LegacyTaskPanelTitleMetaProps = useRender.ComponentProps<"span">;
declare function LegacyTaskPanelTitleMeta({ className, ...props }: LegacyTaskPanelTitleMetaProps): import("react").JSX.Element;
type LegacyTaskPanelActionsProps = useRender.ComponentProps<"div">;
declare function LegacyTaskPanelActions({ className, ...props }: LegacyTaskPanelActionsProps): import("react").JSX.Element;
type LegacyTaskPanelBodyProps = useRender.ComponentProps<"div">;
declare function LegacyTaskPanelBody({ className, children, ...props }: LegacyTaskPanelBodyProps): import("react").JSX.Element;
type LegacyTaskPanelStatusProps = useRender.ComponentProps<"div">;
declare function LegacyTaskPanelStatus({ className, render, ...props }: LegacyTaskPanelStatusProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelSectionProps = useRender.ComponentProps<"section">;
declare function LegacyTaskPanelSection({ className, render, ...props }: LegacyTaskPanelSectionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelFieldProps = useRender.ComponentProps<"div">;
declare function LegacyTaskPanelField({ className, render, ...props }: LegacyTaskPanelFieldProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelFieldLabelProps = useRender.ComponentProps<"p">;
declare function LegacyTaskPanelFieldLabel({ className, render, ...props }: LegacyTaskPanelFieldLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelFieldTitleProps = useRender.ComponentProps<"h3">;
declare function LegacyTaskPanelFieldTitle({ className, render, ...props }: LegacyTaskPanelFieldTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelFieldTextProps = useRender.ComponentProps<"p">;
declare function LegacyTaskPanelFieldText({ className, render, ...props }: LegacyTaskPanelFieldTextProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelMetaProps = useRender.ComponentProps<"section">;
declare function LegacyTaskPanelMeta({ className, render, ...props }: LegacyTaskPanelMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelMetaRowProps = useRender.ComponentProps<"div">;
declare function LegacyTaskPanelMetaRow({ className, render, ...props }: LegacyTaskPanelMetaRowProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelMetaLabelProps = useRender.ComponentProps<"span">;
declare function LegacyTaskPanelMetaLabel({ className, render, ...props }: LegacyTaskPanelMetaLabelProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type LegacyTaskPanelMetaValueProps = useRender.ComponentProps<"span">;
declare function LegacyTaskPanelMetaValue({ className, render, ...props }: LegacyTaskPanelMetaValueProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/activity-inbox/activity-inbox-shell.d.ts
type ActivityInboxPanelProps = ComponentPropsWithRef<typeof Panel>;
declare function ActivityInboxPanel({ className, ...props }: ActivityInboxPanelProps): import("react").JSX.Element;
type ActivityInboxViewportProps = ComponentPropsWithRef<"div">;
declare function ActivityInboxViewport({ className, ...props }: ActivityInboxViewportProps): import("react").JSX.Element;
type ActivityInboxLoadingMoreProps = ComponentPropsWithRef<"div">;
declare function ActivityInboxLoadingMore({ className, ...props }: ActivityInboxLoadingMoreProps): import("react").JSX.Element;
//#endregion
//#region src/components/activity-inbox/activity-inbox-sidebar.d.ts
type ActivityInboxSidebarProps = ComponentPropsWithRef<typeof SidebarRoot>;
declare function ActivityInboxSidebar({ className, children, ...props }: ActivityInboxSidebarProps): import("react").JSX.Element;
//#endregion
//#region src/components/activity-inbox/activity-inbox-toolbar.d.ts
type ActivityInboxControlsProps = ComponentPropsWithRef<"div">;
declare function ActivityInboxControls({ className, ...props }: ActivityInboxControlsProps): import("react").JSX.Element;
type ActivityInboxSelectionToolbarProps = ComponentPropsWithRef<"div">;
declare function ActivityInboxSelectionToolbar({ className, ...props }: ActivityInboxSelectionToolbarProps): import("react").JSX.Element;
type ActivityInboxSelectionCountProps = ComponentPropsWithRef<"span">;
declare function ActivityInboxSelectionCount({ className, ...props }: ActivityInboxSelectionCountProps): import("react").JSX.Element;
//#endregion
//#region src/components/inbox-item/inbox-item.d.ts
type InboxItemProps = useRender.ComponentProps<"div"> & {
  active?: boolean;
  disabled?: boolean;
};
declare function InboxItem({ active, className, disabled, render, ...props }: InboxItemProps): import("react").JSX.Element;
type InboxItemTriggerProps = Omit<useRender.ComponentProps<"button">, "type">;
declare function InboxItemTrigger({ className, onClick, render, ...props }: InboxItemTriggerProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemSelectionProps = useRender.ComponentProps<"div">;
declare function InboxItemSelection({ className, render, ...props }: InboxItemSelectionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemContentProps = useRender.ComponentProps<"div">;
declare function InboxItemContent({ className, render, ...props }: InboxItemContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemContextProps = useRender.ComponentProps<"div">;
declare function InboxItemContext({ className, render, ...props }: InboxItemContextProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemSubtitleProps = useRender.ComponentProps<"div">;
declare function InboxItemSubtitle({ className, render, ...props }: InboxItemSubtitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemHeadingProps = useRender.ComponentProps<"div">;
declare function InboxItemHeading({ className, render, ...props }: InboxItemHeadingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemTitleProps = useRender.ComponentProps<"div">;
declare function InboxItemTitle({ className, render, ...props }: InboxItemTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemTrailingProps = useRender.ComponentProps<"div">;
declare function InboxItemTrailing({ className, render, ...props }: InboxItemTrailingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemTimestampProps = useRender.ComponentProps<"span">;
declare function InboxItemTimestamp({ className, render, ...props }: InboxItemTimestampProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemBodyProps = useRender.ComponentProps<"p">;
declare function InboxItemBody({ className, render, ...props }: InboxItemBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemMessageProps = useRender.ComponentProps<"p">;
declare function InboxItemMessage({ className, render, ...props }: InboxItemMessageProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemSenderProps = useRender.ComponentProps<"span">;
declare function InboxItemSender({ className, render, ...props }: InboxItemSenderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemMetadataProps = useRender.ComponentProps<"div">;
declare function InboxItemMetadata({ className, render, ...props }: InboxItemMetadataProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type InboxItemActionsProps = useRender.ComponentProps<"div">;
declare function InboxItemActions({ className, render, ...props }: InboxItemActionsProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/search/search.d.ts
type SearchShellRootProps = useRender.ComponentProps<"div"> & {
  edge?: ComponentPropsWithRef<typeof Panel>["edge"];
};
declare function SearchShellRoot({ className, edge, render, ...props }: SearchShellRootProps): import("react").JSX.Element;
type SearchShellFiltersProps = ComponentPropsWithRef<"div">;
declare function SearchShellFilters({ className, ...props }: SearchShellFiltersProps): import("react").JSX.Element;
type SearchShellViewportProps = ComponentPropsWithRef<"div">;
declare function SearchShellViewport({ className, ...props }: SearchShellViewportProps): import("react").JSX.Element;
type SearchResultsSummaryProps = useRender.ComponentProps<"span">;
declare function SearchResultsSummary({ className, render, ...props }: SearchResultsSummaryProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchResultsSectionProps = useRender.ComponentProps<"div">;
declare function SearchResultsSection({ className, render, ...props }: SearchResultsSectionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchResultsSectionHeadingProps = useRender.ComponentProps<"div">;
declare function SearchResultsSectionHeading({ className, render, ...props }: SearchResultsSectionHeadingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchResultsListProps = useRender.ComponentProps<"div">;
declare function SearchResultsList({ className, render, ...props }: SearchResultsListProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/search/search-entity.d.ts
type SearchEntityResultProps = useRender.ComponentProps<"button"> & {
  selected?: boolean;
};
declare function SearchEntityResult({ selected, className, render, ...props }: SearchEntityResultProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchEntityResultContentProps = useRender.ComponentProps<"div">;
declare function SearchEntityResultContent({ className, render, ...props }: SearchEntityResultContentProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchEntityResultHeaderProps = useRender.ComponentProps<"div">;
declare function SearchEntityResultHeader({ className, render, ...props }: SearchEntityResultHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchEntityResultLeadingProps = useRender.ComponentProps<"div">;
declare function SearchEntityResultLeading({ className, render, ...props }: SearchEntityResultLeadingProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchEntityResultIconProps = useRender.ComponentProps<"div">;
declare function SearchEntityResultIcon({ className, render, ...props }: SearchEntityResultIconProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchEntityResultActivityProps = useRender.ComponentProps<"span">;
declare function SearchEntityResultActivity({ className, render, ...props }: SearchEntityResultActivityProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchEntityResultTextProps = useRender.ComponentProps<"span"> & {
  muted?: boolean;
};
type SearchEntityResultTitleProps = SearchEntityResultTextProps;
declare function SearchEntityResultTitle({ muted, className, render, ...props }: SearchEntityResultTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchEntityResultDescriptionProps = SearchEntityResultTextProps;
declare function SearchEntityResultDescription({ muted, className, render, ...props }: SearchEntityResultDescriptionProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/search/search-message.d.ts
type SearchMessageResultBaseProps = useRender.ComponentProps<"button"> & {
  selected?: boolean;
  nested?: boolean;
};
type SearchMessageResultProps = Omit<SearchMessageResultBaseProps, "nested">;
declare function SearchMessageResult(props: SearchMessageResultProps): import("react").JSX.Element;
type SearchThreadMessageResultProps = Omit<SearchMessageResultBaseProps, "nested">;
declare function SearchThreadMessageResult(props: SearchThreadMessageResultProps): import("react").JSX.Element;
type SearchMessageResultHeaderProps = useRender.ComponentProps<"div">;
declare function SearchMessageResultHeader({ className, render, ...props }: SearchMessageResultHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchMessageResultBodyProps = useRender.ComponentProps<"div">;
declare function SearchMessageResultBody({ className, render, ...props }: SearchMessageResultBodyProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchMessageResultMetaProps = useRender.ComponentProps<"span">;
declare function SearchMessageResultMeta({ className, render, ...props }: SearchMessageResultMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchMessageResultThreadMetaProps = useRender.ComponentProps<"span">;
declare function SearchMessageResultThreadMeta({ className, render, ...props }: SearchMessageResultThreadMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchMessageResultSenderProps = useRender.ComponentProps<"span">;
declare function SearchMessageResultSender({ className, render, ...props }: SearchMessageResultSenderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchMessageResultTimestampProps = useRender.ComponentProps<"span">;
declare function SearchMessageResultTimestamp({ className, render, ...props }: SearchMessageResultTimestampProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchMessageResultMatchProps = useRender.ComponentProps<"mark">;
declare function SearchMessageResultMatch({ className, render, ...props }: SearchMessageResultMatchProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/search/search-thread.d.ts
type SearchThreadResultProps = useRender.ComponentProps<"div"> & {
  selected?: boolean;
};
declare function SearchThreadResult({ selected, className, render, ...props }: SearchThreadResultProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchThreadResultHeaderProps = useRender.ComponentProps<"div">;
declare function SearchThreadResultHeader({ className, render, ...props }: SearchThreadResultHeaderProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchThreadResultMetaProps = useRender.ComponentProps<"div">;
declare function SearchThreadResultMeta({ className, render, ...props }: SearchThreadResultMetaProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchThreadResultTimestampProps = useRender.ComponentProps<"span">;
declare function SearchThreadResultTimestamp({ className, render, ...props }: SearchThreadResultTimestampProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchThreadResultTitleProps = useRender.ComponentProps<"div">;
declare function SearchThreadResultTitle({ className, render, ...props }: SearchThreadResultTitleProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
type SearchThreadResultMessagesProps = useRender.ComponentProps<"div">;
declare function SearchThreadResultMessages({ className, render, ...props }: SearchThreadResultMessagesProps): import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>>;
//#endregion
//#region src/components/theme-only/theme-only.d.ts
type ThemeOnlyProps = {
  children?: ReactNode;
};
/** Render children only while the elegant theme family is active. */
declare function ElegantOnly({ children }: ThemeOnlyProps): ReactNode;
/** Render children only while the brutal theme family is active. */
declare function BrutalOnly({ children }: ThemeOnlyProps): ReactNode;
//#endregion
//#region src/lib/theme/theme-context.d.ts
/** Visual style family. Mode (light/dark/system) is a separate axis. */
type Theme = "brutal" | "elegant";
type ThemeMode = "light" | "dark" | "system";
type ResolvedThemeMode = Exclude<ThemeMode, "system">;
type SetThemeOptions = {
  mode?: ThemeMode;
};
type SetTheme = {
  (theme: "brutal"): void;
  (theme: "elegant", options?: SetThemeOptions): void;
};
type ThemeState = {
  theme: Theme;
  setTheme: SetTheme;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
};
//#endregion
//#region src/lib/theme/theme-provider.d.ts
interface ThemeProviderProps {
  /**
   * Controlled visual style family. Keep using this for isolated previews and
   * component matrix surfaces that should not own global DOM state.
   */
  theme?: Theme;
  defaultTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  /** Controlled light/dark behavior for the elegant family. */
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  /**
   * Persist uncontrolled family and mode selections. The mode key appends
   * "-mode" unless `modeStorageKey` is provided.
   */
  storageKey?: string;
  modeStorageKey?: string;
  /**
   * Sync the active family/mode onto `document.documentElement`.
   * Defaults to true for app-level providers. Set to false for nested previews
   * or component islands that should not mutate the app root.
   */
  syncDom?: boolean;
  children: ReactNode;
}
declare function ThemeProvider({ theme, defaultTheme, onThemeChange, mode, defaultMode, onModeChange, storageKey, modeStorageKey, syncDom, children }: ThemeProviderProps): import("react").JSX.Element;
//#endregion
//#region src/lib/theme/use-theme.d.ts
/** Read the active style family for theme-aware component recipes. */
declare function useThemeFamily(): Theme;
/** Read and update the application-level RUI theme selection. */
declare function useTheme(): ThemeState;
//#endregion
//#region src/lib/theme/theme-preset.d.ts
declare const THEME_PRESETS: readonly ["brutal", "elegant-light", "elegant-dark", "elegant-system"];
/** A product-facing selection that owns both the visual family and color mode. */
type ThemePreset = (typeof THEME_PRESETS)[number];
type ResolvedThemePreset = {
  theme: Theme;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
};
type ThemeRoot = Pick<HTMLElement, "classList" | "dataset" | "style">;
type FixedThemeBootstrapStorage = {
  /** Synchronous storage entry containing one of the four `ThemePreset` values. */
  storageKey: string;
  account?: never;
  storageKeyPrefix?: never;
};
type AccountScopedThemeBootstrapStorage = {
  storageKey?: never;
  /** Prefix joined with the active access JWT `sub` to form the preset storage key. */
  storageKeyPrefix: string;
  account: {
    kind: "jwt-sub";
    /** Storage entry containing the active account's `type: "access"` JWT. */
    tokenStorageKey: string;
  };
};
type ThemeBootstrapScriptOptions = (FixedThemeBootstrapStorage | AccountScopedThemeBootstrapStorage) & {
  /** Used when storage is missing, invalid, or inaccessible. Defaults to Brutal. */
  defaultPreset?: ThemePreset;
};
declare function isThemePreset(value: unknown): value is ThemePreset;
/** Map the single product-facing preset onto RUI's existing family and mode axes. */
declare function resolveThemePreset(preset: ThemePreset, systemMode?: ResolvedThemeMode): ResolvedThemePreset;
/** Apply the same root attributes/classes used by `ThemeProvider`. */
declare function applyThemeToRoot(root: ThemeRoot, { theme, resolvedMode }: Pick<ResolvedThemePreset, "theme" | "resolvedMode">): void;
declare function applyThemePresetToRoot(root: ThemeRoot, preset: ThemePreset, systemMode?: ResolvedThemeMode): ResolvedThemePreset;
/**
 * Create a dependency-free classic script for `<head>`, before app JavaScript
 * and styles paint. The consumer owns the storage key and writes the effective
 * account/gate-aware preset into it; invalid or inaccessible storage falls back
 * deterministically.
 */
declare function createThemeBootstrapScript(options: ThemeBootstrapScriptOptions): string;
//#endregion
export { ActivityInboxControls, ActivityInboxControlsProps, ActivityInboxLoadingMore, ActivityInboxLoadingMoreProps, ActivityInboxPanel, ActivityInboxPanelProps, ActivityInboxSelectionCount, ActivityInboxSelectionCountProps, ActivityInboxSelectionToolbar, ActivityInboxSelectionToolbarProps, ActivityInboxSidebar, ActivityInboxSidebarProps, ActivityInboxViewport, ActivityInboxViewportProps, AlertDialog, AlertDialogAction, type AlertDialogActionProps, AlertDialogBody, type AlertDialogBodyProps, AlertDialogCancel, type AlertDialogCancelProps, AlertDialogClose, type AlertDialogCloseProps, AlertDialogContent, type AlertDialogContentProps, AlertDialogDescription, type AlertDialogDescriptionProps, AlertDialogFooter, type AlertDialogFooterProps, AlertDialogHeader, type AlertDialogHeaderProps, AlertDialogOverlay, type AlertDialogOverlayProps, AlertDialogPortal, type AlertDialogPortalProps, type AlertDialogProps, AlertDialogTitle, type AlertDialogTitleProps, AlertDialogTrigger, type AlertDialogTriggerProps, AppRailFooter, type AppRailFooterProps, AppRailHeader, type AppRailHeaderProps, AppRailItem, AppRailItemAttention, AppRailItemAttentionMask, type AppRailItemAttentionMaskProps, type AppRailItemAttentionProps, AppRailItemBadge, type AppRailItemBadgeProps, AppRailItemIcon, type AppRailItemIconProps, AppRailItemIndicator, type AppRailItemIndicatorProps, AppRailItemLabel, type AppRailItemLabelProps, type AppRailItemProps, AppRailNav, type AppRailNavProps, AppRailRoot, type AppRailRootProps, AppShellMainSlot, type AppShellMainSlotProps, AppShellOverlaySlot, type AppShellOverlaySlotProps, AppShellPanelSlot, type AppShellPanelSlotProps, AppShellRailSlot, type AppShellRailSlotProps, AppShellRoot, type AppShellRootProps, AppShellSidebarSlot, type AppShellSidebarSlotProps, AppShellSidebarTrigger, type AppShellSidebarTriggerProps, Avatar, AvatarBadge, type AvatarBadgeProps, AvatarFallback, type AvatarFallbackProps, AvatarGroup, AvatarGroupCount, type AvatarGroupCountProps, type AvatarGroupProps, AvatarImage, type AvatarImageProps, type AvatarProps, type AvatarSize, Badge, type BadgeProps, Banner, BannerAction, type BannerActionProps, BannerDescription, type BannerDescriptionProps, type BannerProps, type BannerStatus, BannerTitle, type BannerTitleProps, BrutalOnly, Button, type ButtonProps, Card, CardContent, type CardContentProps, CardDescription, type CardDescriptionProps, CardFooter, type CardFooterProps, CardHeader, type CardHeaderProps, CardLeading, type CardLeadingProps, type CardProps, CardTitle, type CardTitleProps, CardTrailing, type CardTrailingProps, Checkbox, type CheckboxProps, CodeBlock, CodeBlockAction, type CodeBlockActionProps, CodeBlockActions, type CodeBlockActionsProps, CodeBlockBody, type CodeBlockBodyProps, CodeBlockHeader, type CodeBlockHeaderProps, type CodeBlockProps, CodeBlockTitle, type CodeBlockTitleProps, Combobox, ComboboxChip, type ComboboxChipProps, ComboboxChipRemove, type ComboboxChipRemoveProps, ComboboxChips, type ComboboxChipsProps, ComboboxClear, type ComboboxClearProps, ComboboxCollection, type ComboboxCollectionProps, ComboboxContent, type ComboboxContentProps, ComboboxControl, type ComboboxControlProps, ComboboxEmpty, type ComboboxEmptyProps, ComboboxGroup, ComboboxGroupLabel, type ComboboxGroupLabelProps, type ComboboxGroupProps, ComboboxHeader, type ComboboxHeaderProps, ComboboxInput, ComboboxInputGroup, type ComboboxInputGroupProps, type ComboboxInputProps, ComboboxItem, ComboboxItemIndicator, type ComboboxItemIndicatorProps, type ComboboxItemProps, ComboboxLabel, type ComboboxLabelProps, ComboboxList, type ComboboxListProps, ComboboxPopup, type ComboboxPopupProps, ComboboxPortal, type ComboboxPortalProps, type ComboboxProps, ComboboxRow, type ComboboxRowProps, ComboboxSeparator, type ComboboxSeparatorProps, ComboboxTrigger, ComboboxTriggerCount, type ComboboxTriggerCountProps, ComboboxTriggerIndicator, type ComboboxTriggerIndicatorProps, type ComboboxTriggerProps, ComboboxValue, type ComboboxValueProps, Composer, ComposerActions, type ComposerActionsProps, ComposerAttachment, ComposerAttachmentBody, type ComposerAttachmentBodyProps, ComposerAttachmentFailedOverlay, type ComposerAttachmentFailedOverlayProps, ComposerAttachmentFile, type ComposerAttachmentFileProps, ComposerAttachmentImage, type ComposerAttachmentImageProps, ComposerAttachmentMeta, type ComposerAttachmentMetaProps, type ComposerAttachmentProps, ComposerAttachmentRemove, type ComposerAttachmentRemoveProps, ComposerAttachmentTitle, type ComposerAttachmentTitleProps, ComposerAttachmentUploadProgressBar, type ComposerAttachmentUploadProgressBarProps, ComposerAttachmentUploadingOverlay, type ComposerAttachmentUploadingOverlayProps, ComposerAttachments, type ComposerAttachmentsProps, ComposerAttachmentsScrollArea, type ComposerAttachmentsScrollAreaProps, ComposerDropOverlay, ComposerDropOverlayLabel, type ComposerDropOverlayLabelProps, ComposerDropOverlayPrompt, type ComposerDropOverlayPromptProps, type ComposerDropOverlayProps, ComposerIconButton, type ComposerIconButtonProps, ComposerInput, type ComposerInputProps, ComposerMeta, type ComposerMetaProps, type ComposerProps, ComposerRoot, type ComposerRootProps, ComposerSubmit, type ComposerSubmitProps, ComposerSuggestionAside, type ComposerSuggestionAsideProps, ComposerSuggestionContent, type ComposerSuggestionContentProps, ComposerSuggestionGroup, ComposerSuggestionGroupLabel, type ComposerSuggestionGroupLabelProps, type ComposerSuggestionGroupProps, ComposerSuggestionIcon, type ComposerSuggestionIconProps, ComposerSuggestionList, type ComposerSuggestionListProps, ComposerSuggestionMeta, type ComposerSuggestionMetaProps, ComposerSuggestionOption, type ComposerSuggestionOptionProps, ComposerSuggestionTitle, type ComposerSuggestionTitleProps, type ComposerSuggestionTriggerMatch, type ComposerSuggestionsInputProps, type ComposerSuggestionsListProps, type ComposerSuggestionsOptionProps, ComposerToolbar, ComposerToolbarLabel, type ComposerToolbarLabelProps, type ComposerToolbarProps, ContextMenu, ContextMenuCheckboxItem, ContextMenuCheckboxItemIndicator, type ContextMenuCheckboxItemIndicatorProps, type ContextMenuCheckboxItemProps, ContextMenuContent, type ContextMenuContentProps, ContextMenuFooter, type ContextMenuFooterProps, ContextMenuItem, ContextMenuItemLabel, type ContextMenuItemLabelProps, type ContextMenuItemProps, ContextMenuLabel, type ContextMenuLabelProps, ContextMenuPopup, type ContextMenuPopupProps, ContextMenuPortal, type ContextMenuPortalProps, type ContextMenuProps, ContextMenuRadioGroup, type ContextMenuRadioGroupProps, ContextMenuRadioItem, ContextMenuRadioItemIndicator, type ContextMenuRadioItemIndicatorProps, type ContextMenuRadioItemProps, ContextMenuSeparator, type ContextMenuSeparatorProps, ContextMenuShortcut, type ContextMenuShortcutProps, ContextMenuSubmenu, type ContextMenuSubmenuProps, ContextMenuSubmenuTrigger, type ContextMenuSubmenuTriggerProps, ContextMenuTrigger, type ContextMenuTriggerProps, ConversationPanelBody, type ConversationPanelBodyProps, ConversationPanelContent, type ConversationPanelContentProps, ConversationPanelEmptyState, ConversationPanelEmptyStateBrand, ConversationPanelEmptyStateBrandMark, type ConversationPanelEmptyStateBrandMarkProps, type ConversationPanelEmptyStateBrandProps, type ConversationPanelEmptyStateProps, ConversationPanelFooter, type ConversationPanelFooterProps, ConversationPanelRoot, type ConversationPanelRootProps, ConversationPanelTabs, type ConversationPanelTabsProps, CopyableCode, CopyableCodeAction, type CopyableCodeActionProps, type CopyableCodeProps, CopyableCodeRoot, type CopyableCodeRootProps, DescriptionDetails, type DescriptionDetailsProps, DescriptionItem, type DescriptionItemProps, DescriptionList, type DescriptionListDirection, type DescriptionListProps, DescriptionTerm, type DescriptionTermProps, Dialog, DialogBody, type DialogBodyProps, DialogClose, type DialogCloseProps, DialogContent, type DialogContentProps, DialogDescription, type DialogDescriptionProps, DialogFooter, type DialogFooterProps, DialogHeader, type DialogHeaderProps, DialogOverlay, type DialogOverlayProps, DialogPortal, type DialogPortalProps, type DialogProps, DialogTitle, type DialogTitleProps, DialogTrigger, type DialogTriggerProps, Drawer, DrawerActions, type DrawerActionsProps, DrawerBody, type DrawerBodyProps, DrawerClose, type DrawerCloseProps, DrawerContent, type DrawerContentProps, DrawerDescription, type DrawerDescriptionProps, DrawerFooter, type DrawerFooterProps, DrawerHeader, type DrawerHeaderProps, DrawerOverlay, type DrawerOverlayProps, DrawerPortal, type DrawerPortalProps, type DrawerProps, DrawerTitle, type DrawerTitleProps, DrawerTrigger, type DrawerTriggerProps, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuCheckboxItemIndicator, type DropdownMenuCheckboxItemIndicatorProps, type DropdownMenuCheckboxItemProps, DropdownMenuContent, type DropdownMenuContentProps, DropdownMenuFooter, type DropdownMenuFooterProps, DropdownMenuItem, DropdownMenuItemCount, type DropdownMenuItemCountProps, DropdownMenuItemLabel, type DropdownMenuItemLabelProps, type DropdownMenuItemProps, DropdownMenuLabel, type DropdownMenuLabelProps, DropdownMenuPopup, type DropdownMenuPopupProps, DropdownMenuPortal, type DropdownMenuPortalProps, type DropdownMenuProps, DropdownMenuRadioGroup, type DropdownMenuRadioGroupProps, DropdownMenuRadioItem, DropdownMenuRadioItemIndicator, type DropdownMenuRadioItemIndicatorProps, type DropdownMenuRadioItemProps, DropdownMenuSeparator, type DropdownMenuSeparatorProps, DropdownMenuShortcut, type DropdownMenuShortcutProps, DropdownMenuSubmenu, type DropdownMenuSubmenuProps, DropdownMenuSubmenuTrigger, type DropdownMenuSubmenuTriggerProps, DropdownMenuTrigger, type DropdownMenuTriggerProps, ElegantOnly, EmptyState, EmptyStateActions, type EmptyStateActionsProps, EmptyStateContent, type EmptyStateContentProps, EmptyStateDescription, type EmptyStateDescriptionProps, EmptyStateIcon, type EmptyStateIconProps, type EmptyStateProps, EmptyStateTitle, type EmptyStateTitleProps, Field, FieldControl, type FieldControlProps, FieldDescription, type FieldDescriptionProps, FieldError, type FieldErrorProps, FieldItem, type FieldItemProps, FieldLabel, type FieldLabelProps, type FieldProps, FieldValidity, type FieldValidityProps, FileAction, FileActionProps, FileActions, FileActionsProps, FileContent, FileContentProps, FileImage, FileImageProps, FileMeta, FileMetaItem, FileMetaItemProps, FileMetaProps, FileName, FileNameProps, FilePreview, FilePreviewBadge, type FilePreviewBadgeColor, type FilePreviewBadgeProps, type FilePreviewBadgeType, FilePreviewCode, type FilePreviewCodeProps, FilePreviewDocument, type FilePreviewDocumentProps, FilePreviewFile, type FilePreviewFileProps, FilePreviewMedia, type FilePreviewMediaProps, type FilePreviewProps, FileRow, FileRowOpen, FileRowOpenProps, FileRowProps, FileThumbnail, FileThumbnailProps, FilesList, FilesListProps, FilesPanel, FilesPanelProps, FilesViewport, FilesViewportProps, InboxItem, InboxItemActions, type InboxItemActionsProps, InboxItemBody, type InboxItemBodyProps, InboxItemContent, type InboxItemContentProps, InboxItemContext, type InboxItemContextProps, InboxItemHeading, type InboxItemHeadingProps, InboxItemMessage, type InboxItemMessageProps, InboxItemMetadata, type InboxItemMetadataProps, type InboxItemProps, InboxItemSelection, type InboxItemSelectionProps, InboxItemSender, type InboxItemSenderProps, InboxItemSubtitle, type InboxItemSubtitleProps, InboxItemTimestamp, type InboxItemTimestampProps, InboxItemTitle, type InboxItemTitleProps, InboxItemTrailing, type InboxItemTrailingProps, InboxItemTrigger, type InboxItemTriggerProps, InlineCode, type InlineCodeProps, Input, InputGroup, InputGroupAddon, type InputGroupAddonProps, type InputGroupAddonTextProps, InputGroupInput, type InputGroupInputProps, type InputGroupProps, type InputProps, Kbd, KbdGroup, type KbdGroupProps, type KbdProps, Label, LabelAsterisk, type LabelAsteriskProps, LabelOptional, type LabelOptionalProps, type LabelProps, LabelSub, type LabelSubProps, LegacyTaskPanelActions, type LegacyTaskPanelActionsProps, LegacyTaskPanelBody, type LegacyTaskPanelBodyProps, LegacyTaskPanelField, LegacyTaskPanelFieldLabel, type LegacyTaskPanelFieldLabelProps, type LegacyTaskPanelFieldProps, LegacyTaskPanelFieldText, type LegacyTaskPanelFieldTextProps, LegacyTaskPanelFieldTitle, type LegacyTaskPanelFieldTitleProps, LegacyTaskPanelHeader, type LegacyTaskPanelHeaderProps, LegacyTaskPanelIcon, type LegacyTaskPanelIconProps, LegacyTaskPanelMeta, LegacyTaskPanelMetaLabel, type LegacyTaskPanelMetaLabelProps, type LegacyTaskPanelMetaProps, LegacyTaskPanelMetaRow, type LegacyTaskPanelMetaRowProps, LegacyTaskPanelMetaValue, type LegacyTaskPanelMetaValueProps, LegacyTaskPanelRoot, type LegacyTaskPanelRootProps, LegacyTaskPanelSection, type LegacyTaskPanelSectionProps, LegacyTaskPanelStatus, type LegacyTaskPanelStatusProps, LegacyTaskPanelTitle, LegacyTaskPanelTitleMeta, type LegacyTaskPanelTitleMetaProps, type LegacyTaskPanelTitleProps, Lightbox, LightboxActions, type LightboxActionsProps, LightboxClose, type LightboxCloseProps, LightboxContent, type LightboxContentProps, LightboxHeader, LightboxHeaderLabel, type LightboxHeaderLabelProps, LightboxHeaderMeta, type LightboxHeaderMetaProps, type LightboxHeaderProps, LightboxInfoActions, type LightboxInfoActionsProps, LightboxInfoBar, type LightboxInfoBarProps, LightboxInfoDock, type LightboxInfoDockProps, LightboxInfoTitle, type LightboxInfoTitleProps, LightboxMedia, type LightboxMediaProps, LightboxNavigationButton, type LightboxNavigationButtonProps, LightboxPortal, type LightboxPortalProps, type LightboxProps, LightboxStage, type LightboxStageProps, LightboxThumbnail, type LightboxThumbnailProps, LightboxThumbnailStrip, type LightboxThumbnailStripProps, LightboxTitle, type LightboxTitleProps, LightboxToolbar, type LightboxToolbarProps, LightboxTrigger, type LightboxTriggerProps, LiveAgentActivityBar, LiveAgentActivityBarAvatar, type LiveAgentActivityBarAvatarProps, LiveAgentActivityBarContent, type LiveAgentActivityBarContentProps, type LiveAgentActivityBarProps, LiveAgentActivityBarRow, type LiveAgentActivityBarRowProps, LiveAgentActivityBarStatus, type LiveAgentActivityBarStatusProps, LiveAgentActivityBarText, type LiveAgentActivityBarTextProps, MarkdownBlockquote, type MarkdownBlockquoteProps, MarkdownCell, type MarkdownCellProps, MarkdownCheckbox, type MarkdownCheckboxProps, MarkdownHeaderCell, type MarkdownHeaderCellProps, MarkdownHeading, type MarkdownHeadingLevel, type MarkdownHeadingProps, MarkdownImage, type MarkdownImageProps, MarkdownInlineCode, type MarkdownInlineCodeProps, MarkdownLink, type MarkdownLinkProps, MarkdownList, MarkdownListItem, type MarkdownListItemProps, type MarkdownListProps, MarkdownMark, type MarkdownMarkProps, MarkdownOrderedList, type MarkdownOrderedListProps, MarkdownParagraph, type MarkdownParagraphProps, MarkdownRule, type MarkdownRuleProps, MarkdownTable, type MarkdownTableProps, MarkdownTableRow, type MarkdownTableRowProps, MarkdownTableScroll, type MarkdownTableScrollProps, MessageActionCard, MessageActionCardActions, type MessageActionCardActionsProps, MessageActionCardCompletion, type MessageActionCardCompletionProps, MessageActionCardContent, type MessageActionCardContentProps, MessageActionCardHeader, type MessageActionCardHeaderProps, MessageActionCardHeaderStatus, type MessageActionCardHeaderStatusProps, MessageActionCardHint, type MessageActionCardHintProps, MessageActionCardProperties, type MessageActionCardPropertiesProps, MessageActionCardProperty, MessageActionCardPropertyLabel, type MessageActionCardPropertyLabelProps, type MessageActionCardPropertyProps, MessageActionCardPropertyValue, type MessageActionCardPropertyValueProps, type MessageActionCardProps, MessageActionCardScope, MessageActionCardScopeDescription, type MessageActionCardScopeDescriptionProps, MessageActionCardScopeList, MessageActionCardScopeListLabel, type MessageActionCardScopeListLabelProps, type MessageActionCardScopeListProps, MessageActionCardScopeName, type MessageActionCardScopeNameProps, type MessageActionCardScopeProps, MessageAttachmentAction, type MessageAttachmentActionProps, MessageAttachmentCard, type MessageAttachmentCardProps, MessageAttachmentCommentSummary, type MessageAttachmentCommentSummaryProps, MessageAttachmentDiffAddition, type MessageAttachmentDiffAdditionProps, MessageAttachmentDiffDeletion, type MessageAttachmentDiffDeletionProps, MessageAttachmentDiffSummary, type MessageAttachmentDiffSummaryProps, MessageAttachmentGroup, type MessageAttachmentGroupProps, MessageAttachmentMeta, MessageAttachmentMetaEnd, type MessageAttachmentMetaEndProps, type MessageAttachmentMetaProps, MessageAttachmentMetaStart, type MessageAttachmentMetaStartProps, MessageAttachmentSummary, type MessageAttachmentSummaryProps, MessageAttachmentTitle, type MessageAttachmentTitleProps, MessageEmbed, MessageEmbedContent, type MessageEmbedContentProps, MessageEmbedFooter, type MessageEmbedFooterProps, MessageEmbedHeader, type MessageEmbedHeaderProps, type MessageEmbedProps, MessageForwardedBundle, MessageForwardedBundleAttachment, MessageForwardedBundleAttachmentMeta, type MessageForwardedBundleAttachmentMetaProps, MessageForwardedBundleAttachmentName, type MessageForwardedBundleAttachmentNameProps, type MessageForwardedBundleAttachmentProps, MessageForwardedBundleAttachments, type MessageForwardedBundleAttachmentsProps, MessageForwardedBundleFooter, MessageForwardedBundleFooterAction, type MessageForwardedBundleFooterActionProps, type MessageForwardedBundleFooterProps, MessageForwardedBundleHeader, MessageForwardedBundleHeaderContent, type MessageForwardedBundleHeaderContentProps, MessageForwardedBundleHeaderCount, type MessageForwardedBundleHeaderCountProps, MessageForwardedBundleHeaderLabel, type MessageForwardedBundleHeaderLabelProps, type MessageForwardedBundleHeaderProps, MessageForwardedBundleItem, MessageForwardedBundleItemAuthor, type MessageForwardedBundleItemAuthorProps, MessageForwardedBundleItemMeta, type MessageForwardedBundleItemMetaProps, type MessageForwardedBundleItemProps, MessageForwardedBundleItems, type MessageForwardedBundleItemsProps, type MessageForwardedBundleProps, MessageForwardedBundleSource, MessageForwardedBundleSourceLabel, type MessageForwardedBundleSourceLabelProps, type MessageForwardedBundleSourceProps, MessageImageGallery, MessageImageGalleryAction, type MessageImageGalleryActionProps, MessageImageGalleryItem, type MessageImageGalleryItemProps, MessageImageGalleryMedia, type MessageImageGalleryMediaProps, MessageImageGalleryOverlay, type MessageImageGalleryOverlayProps, MessageImageGalleryPreview, type MessageImageGalleryPreviewProps, type MessageImageGalleryProps, MessageItem, MessageItemAttachments, type MessageItemAttachmentsProps, MessageItemAvatarSlot, type MessageItemAvatarSlotProps, MessageItemBadge, type MessageItemBadgeProps, MessageItemBadgeSeparator, type MessageItemBadgeSeparatorProps, type MessageItemBadgeStatus, MessageItemBody, type MessageItemBodyProps, MessageItemContent, type MessageItemContentProps, MessageItemContinuationTime, type MessageItemContinuationTimeProps, MessageItemEmbedded, type MessageItemEmbeddedProps, MessageItemFooter, type MessageItemFooterProps, MessageItemGutter, type MessageItemGutterProps, MessageItemHeader, type MessageItemHeaderProps, MessageItemInlineStatus, type MessageItemInlineStatusProps, MessageItemMeta, type MessageItemMetaProps, type MessageItemProps, MessageItemReadReceipt, type MessageItemReadReceiptProps, MessageItemSavedIndicator, type MessageItemSavedIndicatorProps, MessageItemSearchMatch, type MessageItemSearchMatchProps, MessageItemSender, MessageItemSenderBadges, type MessageItemSenderBadgesProps, MessageItemSenderButton, type MessageItemSenderButtonProps, type MessageItemSenderProps, MessageItemTime, type MessageItemTimeProps, MessageItemToolbar, MessageItemToolbarButton, type MessageItemToolbarButtonProps, type MessageItemToolbarProps, MessageItemTranslationAction, type MessageItemTranslationActionProps, MessageItemTranslationFailedStatus, type MessageItemTranslationFailedStatusProps, MessageItemTranslationOriginal, MessageItemTranslationOriginalLabel, type MessageItemTranslationOriginalLabelProps, type MessageItemTranslationOriginalProps, MessageItemTranslationProgressTrack, type MessageItemTranslationProgressTrackProps, MessageItemTranslationRetryAction, type MessageItemTranslationRetryActionProps, MessageItemTranslationStatus, type MessageItemTranslationStatusProps, MessageList, MessageListDateDivider, type MessageListDateDividerProps, MessageListHistoryLimited, type MessageListHistoryLimitedProps, MessageListNotice, type MessageListNoticeProps, type MessageListProps, MessageMultiSelect, MessageMultiSelectCheckbox, type MessageMultiSelectCheckboxProps, type MessageMultiSelectProps, MessageMultiSelectToolbar, type MessageMultiSelectToolbarProps, MessageQuotedPreview, MessageQuotedPreviewAttachment, type MessageQuotedPreviewAttachmentProps, MessageQuotedPreviewAttachments, type MessageQuotedPreviewAttachmentsProps, MessageQuotedPreviewAuthor, MessageQuotedPreviewAuthorMeta, type MessageQuotedPreviewAuthorMetaProps, MessageQuotedPreviewAuthorName, type MessageQuotedPreviewAuthorNameProps, type MessageQuotedPreviewAuthorProps, MessageQuotedPreviewChannel, type MessageQuotedPreviewChannelProps, MessageQuotedPreviewContent, type MessageQuotedPreviewContentProps, MessageQuotedPreviewHeader, type MessageQuotedPreviewHeaderProps, MessageQuotedPreviewLoading, type MessageQuotedPreviewLoadingProps, type MessageQuotedPreviewProps, MessageQuotedPreviewText, type MessageQuotedPreviewTextProps, MessageQuotedPreviewThread, type MessageQuotedPreviewThreadProps, MessageQuotedPreviewTimestamp, type MessageQuotedPreviewTimestampProps, MessageQuotedPreviewUnavailable, type MessageQuotedPreviewUnavailableProps, MessageReactionAddButton, type MessageReactionAddButtonProps, MessageReactionChip, type MessageReactionChipProps, MessageReactionCount, type MessageReactionCountProps, MessageReactionErrorIndicator, type MessageReactionErrorIndicatorProps, MessageReactionGlyph, type MessageReactionGlyphProps, MessageReactionPickerContent, type MessageReactionPickerContentProps, MessageReactionPickerStatic, type MessageReactionPickerStaticProps, MessageReactionQuickButton, type MessageReactionQuickButtonProps, MessageReactionQuickRow, type MessageReactionQuickRowProps, MessageReactionTooltipContent, type MessageReactionTooltipContentProps, MessageReactionTooltipMeta, type MessageReactionTooltipMetaProps, MessageReactionTooltipName, type MessageReactionTooltipNameProps, MessageReactionTooltipNameText, type MessageReactionTooltipNameTextProps, MessageReactionTooltipNames, type MessageReactionTooltipNamesProps, MessageReactionTooltipSeparator, type MessageReactionTooltipSeparatorProps, MessageReferenceBadge, type MessageReferenceBadgeProps, MessageReferenceChip, type MessageReferenceChipProps, type MessageReferenceChipVariant, MessageReferenceIndicator, type MessageReferenceIndicatorProps, MessageReferenceLabel, type MessageReferenceLabelProps, MessageReferencePending, type MessageReferencePendingProps, MessageReferenceText, type MessageReferenceTextProps, type MessageReferenceTextVariant, MessageReferenceUnavailable, type MessageReferenceUnavailableProps, MessageReplies, MessageRepliesItem, MessageRepliesItemContent, type MessageRepliesItemContentProps, type MessageRepliesItemProps, MessageRepliesItemSender, type MessageRepliesItemSenderProps, MessageRepliesItemTime, type MessageRepliesItemTimeProps, type MessageRepliesProps, MessageRepliesSummary, MessageRepliesSummaryItem, type MessageRepliesSummaryItemProps, type MessageRepliesSummaryProps, MessageTextSelectionToolbar, MessageTextSelectionToolbarButton, type MessageTextSelectionToolbarButtonProps, type MessageTextSelectionToolbarProps, MessageTextSelectionToolbarSeparator, type MessageTextSelectionToolbarSeparatorProps, MessageVideoPreview, MessageVideoPreviewAction, type MessageVideoPreviewActionProps, MessageVideoPreviewFailureAction, type MessageVideoPreviewFailureActionProps, MessageVideoPreviewFailureContent, type MessageVideoPreviewFailureContentProps, MessageVideoPreviewFailureIcon, type MessageVideoPreviewFailureIconProps, MessageVideoPreviewFailureTitle, type MessageVideoPreviewFailureTitleProps, MessageVideoPreviewFallback, type MessageVideoPreviewFallbackProps, MessageVideoPreviewMedia, type MessageVideoPreviewMediaProps, type MessageVideoPreviewProps, MobileNavItem, type MobileNavItemProps, MobileNavLabel, type MobileNavLabelProps, MobileNavRoot, type MobileNavRootProps, NotificationCenter, NotificationCenterActionButton, type NotificationCenterActionButtonProps, NotificationCenterCount, type NotificationCenterCountProps, NotificationCenterEmptyState, type NotificationCenterEmptyStateProps, NotificationCenterHeader, type NotificationCenterHeaderProps, NotificationCenterItem, NotificationCenterItemActions, type NotificationCenterItemActionsProps, NotificationCenterItemBody, type NotificationCenterItemBodyProps, NotificationCenterItemContent, type NotificationCenterItemContentProps, NotificationCenterItemIcon, type NotificationCenterItemIconProps, type NotificationCenterItemProps, NotificationCenterItemRow, type NotificationCenterItemRowProps, NotificationCenterItemTitle, type NotificationCenterItemTitleProps, NotificationCenterList, type NotificationCenterListProps, NotificationCenterPopup, type NotificationCenterPopupProps, type NotificationCenterPortalProps, type NotificationCenterProps, NotificationCenterScroller, type NotificationCenterScrollerProps, NotificationCenterTitle, type NotificationCenterTitleProps, NotificationCenterTrigger, type NotificationCenterTriggerProps, type OrderedTabItem, Panel, PanelAction, type PanelActionProps, PanelActions, type PanelActionsProps, PanelActivity, type PanelActivityProps, PanelBody, type PanelBodyProps, type PanelEdge, PanelFooter, type PanelFooterProps, PanelHeader, PanelHeaderContent, type PanelHeaderContentProps, PanelHeaderIcon, type PanelHeaderIconProps, type PanelHeaderProps, PanelHeaderRoot, type PanelHeaderRootProps, PanelHeading, type PanelHeadingProps, PanelMeta, type PanelMetaProps, type PanelProps, PanelScrollContent, type PanelScrollContentProps, PanelScrollViewport, type PanelScrollViewportProps, PanelSection, PanelSectionHeader, type PanelSectionHeaderProps, type PanelSectionProps, PanelStatus, type PanelStatusProps, PanelTitle, type PanelTitleProps, PanelToggleAction, type PanelToggleActionProps, PickerTriggerButton, type PickerTriggerButtonProps, Popover, PopoverArrow, type PopoverArrowProps, PopoverBackdrop, type PopoverBackdropProps, PopoverClose, type PopoverCloseProps, PopoverContent, type PopoverContentProps, PopoverDescription, type PopoverDescriptionProps, PopoverHeader, type PopoverHeaderProps, PopoverPopup, type PopoverPopupProps, PopoverPortal, type PopoverPortalProps, type PopoverProps, PopoverSeparator, type PopoverSeparatorProps, PopoverTitle, type PopoverTitleProps, PopoverTrigger, type PopoverTriggerProps, PopoverViewport, type PopoverViewportProps, PreviewCard, PreviewCardArrow, type PreviewCardArrowProps, PreviewCardContent, type PreviewCardContentProps, PreviewCardDescription, type PreviewCardDescriptionProps, PreviewCardHeader, type PreviewCardHeaderProps, PreviewCardPopup, type PreviewCardPopupProps, PreviewCardPortal, type PreviewCardPortalProps, type PreviewCardProps, PreviewCardSeparator, type PreviewCardSeparatorProps, PreviewCardTitle, type PreviewCardTitleProps, PreviewCardTrigger, type PreviewCardTriggerProps, ProfilePanel, ProfilePanelBody, type ProfilePanelBodyProps, ProfilePanelHeader, ProfilePanelHeaderContent, type ProfilePanelHeaderContentProps, type ProfilePanelHeaderProps, type ProfilePanelProps, ProfilePanelSection, type ProfilePanelSectionProps, Progress, ProgressHeader, type ProgressHeaderProps, ProgressIndicator, type ProgressIndicatorProps, ProgressLabel, type ProgressLabelProps, type ProgressProps, ProgressTrack, type ProgressTrackProps, ProgressValue, type ProgressValueProps, RadioGroup, RadioGroupIndicator, type RadioGroupIndicatorProps, RadioGroupItem, type RadioGroupItemProps, type RadioGroupProps, RaftLogo, RaftLogoLockup, type RaftLogoLockupProps, type RaftLogoProps, RaftWordmark, type RaftWordmarkProps, ResizableGroup, type ResizableGroupProps, ResizableHandle, type ResizableHandleProps, ResizablePanel, type ResizablePanelProps, type ResolvedThemeMode, type ResolvedThemePreset, ScrollArea, ScrollAreaContent, type ScrollAreaContentProps, ScrollAreaCorner, type ScrollAreaCornerProps, type ScrollAreaProps, ScrollAreaScrollbar, type ScrollAreaScrollbarProps, ScrollAreaThumb, type ScrollAreaThumbProps, ScrollAreaViewport, type ScrollAreaViewportProps, SearchEntityResult, SearchEntityResultActivity, SearchEntityResultActivityProps, SearchEntityResultContent, SearchEntityResultContentProps, SearchEntityResultDescription, SearchEntityResultDescriptionProps, SearchEntityResultHeader, SearchEntityResultHeaderProps, SearchEntityResultIcon, SearchEntityResultIconProps, SearchEntityResultLeading, SearchEntityResultLeadingProps, SearchEntityResultProps, SearchEntityResultTitle, SearchEntityResultTitleProps, SearchMessageResult, SearchMessageResultBody, SearchMessageResultBodyProps, SearchMessageResultHeader, SearchMessageResultHeaderProps, SearchMessageResultMatch, SearchMessageResultMatchProps, SearchMessageResultMeta, SearchMessageResultMetaProps, SearchMessageResultProps, SearchMessageResultSender, SearchMessageResultSenderProps, SearchMessageResultThreadMeta, SearchMessageResultThreadMetaProps, SearchMessageResultTimestamp, SearchMessageResultTimestampProps, SearchResultsList, SearchResultsListProps, SearchResultsSection, SearchResultsSectionHeading, SearchResultsSectionHeadingProps, SearchResultsSectionProps, SearchResultsSummary, SearchResultsSummaryProps, SearchShellFilters, SearchShellFiltersProps, SearchShellRoot, SearchShellRootProps, SearchShellViewport, SearchShellViewportProps, SearchThreadMessageResult, SearchThreadMessageResultProps, SearchThreadResult, SearchThreadResultHeader, SearchThreadResultHeaderProps, SearchThreadResultMessages, SearchThreadResultMessagesProps, SearchThreadResultMeta, SearchThreadResultMetaProps, SearchThreadResultProps, SearchThreadResultTimestamp, SearchThreadResultTimestampProps, SearchThreadResultTitle, SearchThreadResultTitleProps, SegmentedControl, SegmentedControlCount, type SegmentedControlCountProps, SegmentedControlItem, type SegmentedControlItemProps, SegmentedControlLabel, type SegmentedControlLabelProps, type SegmentedControlProps, Select, SelectArrow, type SelectArrowProps, SelectContent, type SelectContentProps, SelectGroup, SelectGroupLabel, type SelectGroupLabelProps, type SelectGroupProps, SelectIcon, type SelectIconProps, SelectItem, SelectItemIndicator, type SelectItemIndicatorProps, SelectItemLeading, type SelectItemLeadingProps, type SelectItemProps, SelectItemText, type SelectItemTextProps, SelectLabel, type SelectLabelProps, SelectList, type SelectListProps, SelectPopup, type SelectPopupProps, SelectPortal, type SelectPortalProps, type SelectProps, SelectScrollDownArrow, type SelectScrollDownArrowProps, SelectScrollUpArrow, type SelectScrollUpArrowProps, SelectSeparator, type SelectSeparatorProps, SelectTrigger, type SelectTriggerProps, SelectValue, type SelectValueProps, Separator, type SeparatorProps, type SetTheme, type SetThemeOptions, SidebarBody, type SidebarBodyProps, SidebarContent, type SidebarContentProps, SidebarControl, type SidebarControlProps, SidebarGroupLabel, type SidebarGroupLabelProps, SidebarHeader, type SidebarHeaderProps, SidebarHeaderTitle, type SidebarHeaderTitleProps, SidebarItem, SidebarItemAside, type SidebarItemAsideProps, SidebarItemChannelIcon, type SidebarItemChannelIconProps, SidebarItemContent, type SidebarItemContentProps, SidebarItemCount, type SidebarItemCountProps, SidebarItemIcon, type SidebarItemIconProps, SidebarItemIndicator, type SidebarItemIndicatorProps, SidebarItemMeta, SidebarItemMetaIcon, type SidebarItemMetaIconProps, type SidebarItemMetaProps, type SidebarItemProps, SidebarItemStatus, type SidebarItemStatusProps, SidebarItemSubtitle, type SidebarItemSubtitleProps, SidebarItemTitle, type SidebarItemTitleProps, type SidebarItemVariant, SidebarList, type SidebarListProps, SidebarLiveActivity, type SidebarLiveActivityProps, SidebarMenu, SidebarMenuAside, type SidebarMenuAsideProps, SidebarMenuCount, type SidebarMenuCountProps, SidebarMenuIcon, type SidebarMenuIconProps, type SidebarMenuProps, SidebarMenuTitle, type SidebarMenuTitleProps, SidebarRoot, type SidebarRootProps, SidebarSection, SidebarSectionAttention, type SidebarSectionAttentionProps, SidebarSectionChevron, type SidebarSectionChevronProps, SidebarSectionControl, type SidebarSectionControlProps, SidebarSectionControls, type SidebarSectionControlsProps, SidebarSectionCount, type SidebarSectionCountProps, SidebarSectionDisclosure, type SidebarSectionDisclosureProps, SidebarSectionEmpty, type SidebarSectionEmptyProps, SidebarSectionHeader, type SidebarSectionHeaderProps, type SidebarSectionProps, SidebarSectionTitle, type SidebarSectionTitleProps, SidebarSectionTrailing, type SidebarSectionTrailingProps, Skeleton, type SkeletonProps, type SkeletonVariant, SortableComposerAttachment, type SortableComposerAttachmentProps, SortableComposerAttachments, type SortableComposerAttachmentsProps, SortableComposerAttachmentsScroll, SortableTabsList, type SortableTabsListProps, SortableTabsTab, type SortableTabsTabProps, Spinner, type SpinnerProps, Status, type StatusProps, Switch, type SwitchProps, SwitchThumb, type SwitchThumbProps, SystemMessage, SystemMessageContent, type SystemMessageContentProps, SystemMessageGroup, SystemMessageGroupChevron, type SystemMessageGroupChevronProps, SystemMessageGroupDisclosure, type SystemMessageGroupDisclosureProps, SystemMessageGroupHeader, type SystemMessageGroupHeaderProps, SystemMessageGroupPanel, type SystemMessageGroupPanelProps, type SystemMessageGroupProps, SystemMessageGroupSummary, type SystemMessageGroupSummaryProps, type SystemMessageProps, SystemMessageTime, type SystemMessageTimeProps, THEME_PRESETS, Tabs, TabsBackground, type TabsBackgroundProps, TabsIndicator, type TabsIndicatorProps, TabsLabel, type TabsLabelProps, TabsList, type TabsListProps, TabsPanel, type TabsPanelProps, type TabsProps, TabsTab, type TabsTabProps, TaskBoardColumn, TaskBoardColumnBadge, type TaskBoardColumnBadgeProps, TaskBoardColumnChevron, type TaskBoardColumnChevronProps, TaskBoardColumnCount, type TaskBoardColumnCountProps, TaskBoardColumnEmpty, TaskBoardColumnEmptyAllowed, type TaskBoardColumnEmptyAllowedProps, TaskBoardColumnEmptyBlocked, type TaskBoardColumnEmptyBlockedProps, TaskBoardColumnEmptyIdle, type TaskBoardColumnEmptyIdleProps, type TaskBoardColumnEmptyProps, TaskBoardColumnHeading, type TaskBoardColumnHeadingProps, TaskBoardColumnItems, type TaskBoardColumnItemsProps, TaskBoardColumnPanel, type TaskBoardColumnPanelProps, type TaskBoardColumnProps, TaskBoardColumnTrigger, type TaskBoardColumnTriggerProps, TaskBoardRoot, type TaskBoardRootProps, TaskCard, TaskCardBody, type TaskCardBodyProps, TaskCardChannel, type TaskCardChannelProps, TaskCardDescription, type TaskCardDescriptionProps, TaskCardLegacy, type TaskCardLegacyProps, TaskCardMeta, type TaskCardMetaProps, TaskCardNumber, type TaskCardNumberProps, type TaskCardProps, TaskCardRow, type TaskCardRowProps, TaskCardStatus, type TaskCardStatusProps, TaskCardTitle, type TaskCardTitleProps, TaskChip, type TaskChipProps, type TaskChipVariant, TaskClosedIcon, TaskDndProvider, type TaskDndProviderProps, TaskDoneIcon, TaskDragOverlay, type TaskDragOverlayProps, TaskDraggable, type TaskDraggableProps, type TaskDropData, TaskDropPlaceholder, type TaskDropPlaceholderProps, type TaskDropPlacement, type TaskDropState, TaskDropZone, type TaskDropZoneProps, type TaskDropZoneState, TaskInProgressIcon, TaskInReviewIcon, TaskListRoot, type TaskListRootProps, TaskLoadingList, type TaskLoadingListProps, TaskLoadingRow, type TaskLoadingRowProps, type TaskMoveDetails, TaskSection, TaskSectionBadge, type TaskSectionBadgeProps, TaskSectionChevron, type TaskSectionChevronProps, TaskSectionCount, type TaskSectionCountProps, TaskSectionEmpty, type TaskSectionEmptyProps, TaskSectionHeading, type TaskSectionHeadingProps, TaskSectionItems, type TaskSectionItemsProps, TaskSectionPanel, type TaskSectionPanelProps, type TaskSectionProps, TaskSectionTrigger, type TaskSectionTriggerProps, TaskStatusIcon, type TaskStatusId, TaskTodoIcon, TasksPanelEmpty, type TasksPanelEmptyProps, TasksPanelRoot, type TasksPanelRootProps, TasksPanelToolbar, TasksPanelToolbarFilters, type TasksPanelToolbarFiltersProps, TasksPanelToolbarGroup, type TasksPanelToolbarGroupProps, TasksPanelToolbarLabel, type TasksPanelToolbarLabelProps, TasksPanelToolbarNewTask, type TasksPanelToolbarNewTaskProps, type TasksPanelToolbarProps, TasksPanelToolbarView, type TasksPanelToolbarViewProps, TasksPanelViewport, type TasksPanelViewportProps, Text, TextHeading, type TextHeadingProps, TextMono, type TextMonoProps, TextSans, type TextSansProps, Textarea, TextareaCounter, type TextareaCounterProps, TextareaGroup, type TextareaGroupProps, type TextareaProps, type Theme, type ThemeBootstrapScriptOptions, type ThemeMode, type ThemeOnlyProps, type ThemePreset, ThemeProvider, type ThemeProviderProps, type ThemeRoot, type ThemeState, ThreadPanelActions, type ThreadPanelActionsProps, ThreadPanelBody, type ThreadPanelBodyProps, ThreadPanelContent, type ThreadPanelContentProps, ThreadPanelFooter, type ThreadPanelFooterProps, ThreadPanelHeader, type ThreadPanelHeaderProps, ThreadPanelOriginalMessage, type ThreadPanelOriginalMessageProps, ThreadPanelReplyCount, type ThreadPanelReplyCountProps, ThreadPanelReplySummary, type ThreadPanelReplySummaryProps, ThreadPanelRoot, type ThreadPanelRootProps, ThreadPanelSearch, ThreadPanelSearchCount, type ThreadPanelSearchCountProps, type ThreadPanelSearchProps, ThreadPanelSearchTrailing, type ThreadPanelSearchTrailingProps, ThreadPanelTitle, ThreadPanelTitleMeta, type ThreadPanelTitleMetaProps, type ThreadPanelTitleProps, ToastAction, type ToastActionProps, ToastActions, type ToastActionsProps, ToastArrow, type ToastArrowProps, ToastBody, type ToastBodyProps, ToastClose, type ToastCloseProps, ToastContent, type ToastContentProps, type ToastData, ToastDescription, type ToastDescriptionProps, ToastIcon, type ToastIconProps, type ToastIntent, type ToastObject, ToastPortal, type ToastPortalProps, ToastPositioner, type ToastPositionerProps, ToastProvider, type ToastProviderProps, ToastRoot, type ToastRootProps, ToastTitle, type ToastTitleProps, ToastViewport, type ToastViewportProps, ToggleGroup, ToggleGroupItem, type ToggleGroupItemProps, ToggleGroupLabel, type ToggleGroupLabelProps, type ToggleGroupProps, Tooltip, TooltipContent, type TooltipContentProps, TooltipPortal, type TooltipPortalProps, type TooltipProps, TooltipProvider, type TooltipProviderProps, TooltipTrigger, type TooltipTriggerProps, type UseComposerSuggestionsParams, applyThemePresetToRoot, applyThemeToRoot, buttonVariants, cn, createThemeBootstrapScript, createToastManager, isThemePreset, resolveThemePreset, taskStatus, toast, useComposerSuggestions, useOrderedTabs, useTheme, useThemeFamily, useToastManager };