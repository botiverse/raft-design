import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ComponentProps, ComponentRef, Ref } from "react";
import {
  DropdownMenuContent,
  Panel,
  PanelHeaderRoot,
  type DropdownMenuContentProps,
} from "raft-ui";
import { cn } from "raft-ui/cn";

const sourceShadowSm = "shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]";
const sourceButtonMotion = [
  sourceShadowSm,
  "transition-all duration-100",
  "hover:-translate-y-px hover:shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]",
  "active:translate-x-px active:translate-y-px",
  "active:shadow-[1px_1px_0px_oklch(0.1812926_0.0049716_17.6198)]",
];

export function ActivityPanelRoot({
  className,
  ref,
  ...props
}: ComponentProps<typeof Panel> & { ref?: Ref<ComponentRef<"div">> }) {
  return (
    <Panel
      render={<div />}
      ref={ref}
      data-slot="activity-inbox-root"
      className={cn(
        "group/activity-inbox flex min-h-0 flex-1 flex-col bg-white text-black",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelHeader({
  className,
  ...props
}: ComponentProps<typeof PanelHeaderRoot>) {
  return (
    <PanelHeaderRoot
      data-slot="activity-inbox-header"
      className={cn(
        "flex h-panel-header shrink-0 items-center gap-3 px-5",
        "[@media(max-height:600px)]:!h-panel-header",
        "border-b-2 border-black bg-white",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelHeaderBack({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-header-back"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center md:hidden [&_svg]:size-3.5",
        "border-2 border-black bg-white",
        sourceButtonMotion,
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelHeaderIcon({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-header-icon"
      className={cn(
        "hidden size-icon-header shrink-0 items-center justify-center md:flex [&_svg]:size-4.5",
        "border-2 border-black bg-soft-signal text-black",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelHeaderContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-header-content"
      className={cn("min-w-0 flex-1", className)}
      {...props}
    />
  );
}

export function ActivityPanelHeaderHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-header-heading"
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...props}
    />
  );
}

export function ActivityPanelHeaderTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      data-slot="activity-inbox-header-title"
      className={cn("truncate text-base font-bold leading-tight text-black", className)}
      {...props}
    />
  );
}

export function ActivityPanelHeaderSubtitle({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="activity-inbox-header-subtitle"
      className={cn("truncate font-mono text-xs text-black/50", className)}
      {...props}
    />
  );
}

export function ActivityPanelLayout({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-layout"
      className={cn("flex min-h-0 flex-1", className)}
      {...props}
    />
  );
}

export function ActivityPanelSidebar({ className, ...props }: ComponentProps<"aside">) {
  return (
    <aside
      data-slot="activity-inbox-sidebar"
      className={cn(
        "scrollbar-quiet w-48 shrink-0 flex-col overflow-y-auto p-3",
        "group-data-[layout=compact]/activity-inbox:hidden",
        "group-data-[layout=wide]/activity-inbox:flex",
        "border-r-2 border-black bg-white",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSidebarSection({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-sidebar-section"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}

export function ActivityPanelSidebarHeading({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-sidebar-heading"
      className={cn("mb-1 mt-5 flex items-center gap-2 px-2", className)}
      {...props}
    />
  );
}

export function ActivityPanelSidebarHeadingLabel({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-sidebar-heading-label"
      className={cn(
        "flex-1 text-[10px] font-black uppercase tracking-widest text-black/40",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelNavigationItem({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-navigation-item"
      className={cn(
        "flex w-full items-center gap-2 border-2 px-2.5 py-2 text-left text-xs font-bold",
        "transition-colors disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:shrink-0",
        "border-transparent text-black",
        "hover:border-black/30 hover:bg-black/5",
        "aria-[current=page]:border-black aria-[current=page]:bg-soft-signal aria-[current=page]:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        "aria-pressed:border-black aria-pressed:bg-soft-signal aria-pressed:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelNavigationLabel({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-navigation-label"
      className={cn("min-w-0 flex-1 truncate", className)}
      {...props}
    />
  );
}

export function ActivityPanelNavigationCount({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-navigation-count"
      className={cn("shrink-0 font-mono text-black/45", className)}
      {...props}
    />
  );
}

export function ActivityPanelMain({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      data-slot="activity-inbox-main"
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

export function ActivityPanelControls({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-controls"
      className={cn(
        "flex shrink-0 flex-nowrap items-center gap-2 px-3 py-2.5",
        "border-b-2 border-black bg-white",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelMobileNavigation({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-mobile-navigation"
      className={cn(
        "shrink-0",
        "group-data-[layout=compact]/activity-inbox:block",
        "group-data-[layout=wide]/activity-inbox:hidden",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelMobileNavigationButton({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-mobile-navigation-button"
      className={cn(
        "flex h-9 min-w-28 max-w-40 items-center gap-2 px-2.5 text-sm font-black",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        "border-2 border-black bg-white",
        sourceShadowSm,
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelMobileNavigationLabel({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-mobile-navigation-label"
      className={cn("min-w-0 flex-1 truncate text-left", className)}
      {...props}
    />
  );
}

export function ActivityPanelSwitcher(props: BaseDialog.Root.Props) {
  return <BaseDialog.Root data-slot="activity-inbox-switcher" {...props} />;
}

export function ActivityPanelSwitcherTrigger(props: BaseDialog.Trigger.Props) {
  return <BaseDialog.Trigger data-slot="activity-inbox-switcher-trigger" {...props} />;
}

export function ActivityPanelSwitcherContent({
  className,
  portalProps,
  ...props
}: BaseDialog.Popup.Props & { portalProps?: BaseDialog.Portal.Props }) {
  return (
    <BaseDialog.Portal data-slot="activity-inbox-switcher-portal" {...portalProps}>
      <BaseDialog.Backdrop
        data-slot="activity-inbox-switcher-backdrop"
        className="fixed inset-0 z-50 bg-black/60"
      />
      <BaseDialog.Popup
        data-slot="activity-inbox-switcher-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md",
          "-translate-x-1/2 -translate-y-1/2 outline-none",
          "border-2 border-black bg-white",
          "shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]",
          className,
        )}
        {...props}
      />
    </BaseDialog.Portal>
  );
}

export function ActivityPanelSwitcherHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-switcher-header"
      className={cn("flex items-center px-4 py-3 border-b-2 border-black", className)}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherTitle({ className, ...props }: BaseDialog.Title.Props) {
  return (
    <BaseDialog.Title
      data-slot="activity-inbox-switcher-title"
      className={cn("flex-1 text-lg font-black text-black", className)}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherClose({ className, ...props }: BaseDialog.Close.Props) {
  return (
    <BaseDialog.Close
      data-slot="activity-inbox-switcher-close"
      className={cn(
        "inline-flex size-9 items-center justify-center [&_svg]:size-4.5",
        "border-2 border-black bg-white",
        sourceButtonMotion,
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-switcher-body"
      className={cn("p-3 bg-white", className)}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherItem({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-switcher-item"
      className={cn(
        "flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-bold",
        "transition-colors",
        "[&_svg]:size-4.5 [&_svg]:shrink-0",
        "text-black hover:bg-black/[0.04]",
        "aria-[current=page]:bg-black/[0.06]",
        "aria-pressed:bg-black/[0.06]",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherItemLabel({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-switcher-item-label"
      className={cn("min-w-0 flex-1 truncate", className)}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherItemCount({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-switcher-item-count"
      className={cn("shrink-0 font-mono text-black/50", className)}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherSeparator({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-switcher-separator"
      className={cn("mx-3 my-3 border-t-2 border-black/15", className)}
      {...props}
    />
  );
}

export function ActivityPanelSearch({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-search"
      className={cn("relative min-w-0 flex-1", className)}
      {...props}
    />
  );
}

export function ActivityPanelSearchIcon({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-search-icon"
      className={cn(
        "pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 [&_svg]:size-[15px]",
        "text-black/45",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSearchInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="activity-inbox-search-input"
      className={cn(
        "h-9 w-full pr-8 pl-8 text-sm font-semibold outline-none",
        "border-2 border-black bg-white text-black",
        "focus:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSearchClear({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-search-clear"
      className={cn(
        "absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center justify-center",
        "[&_svg]:size-3.5 text-black",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSelectionToolbar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-selection-toolbar"
      className={cn(
        "flex min-h-11 shrink-0 items-center gap-2 px-3",
        "group-data-[layout=compact]/activity-inbox:flex-wrap",
        "group-data-[layout=compact]/activity-inbox:py-2",
        "group-data-[layout=wide]/activity-inbox:h-11",
        "group-data-[layout=wide]/activity-inbox:flex-nowrap",
        "group-data-[layout=wide]/activity-inbox:py-0",
        "border-b-2 border-black bg-black/[0.03]",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSelectionCount({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-selection-count"
      className={cn("mr-1 text-xs font-black text-black", className)}
      {...props}
    />
  );
}

export function ActivityPanelToolbarButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-toolbar-button"
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-bold",
        "border-2 border-black bg-white",
        sourceButtonMotion,
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelToolbarPrimaryAction({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-toolbar-primary-action"
      className={cn(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-bold",
        "border-2 border-black bg-brutal-cyan",
        sourceButtonMotion,
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelToolbarLink({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-toolbar-link"
      className={cn("text-xs font-bold underline decoration-2 text-black", className)}
      {...props}
    />
  );
}

export function ActivityPanelSortTrigger({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="activity-inbox-sort-trigger"
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[11px] font-bold [&_svg]:size-3",
        "text-black/60 hover:text-black",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSortContent({ className, ...props }: DropdownMenuContentProps) {
  return (
    <DropdownMenuContent
      className={cn("p-1 shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]", className)}
      {...props}
    />
  );
}

export function ActivityPanelSortItem({ className, ...props }: BaseMenu.RadioItem.Props) {
  return (
    <BaseMenu.RadioItem
      data-slot="activity-inbox-sort-item"
      className={cn(
        "flex w-full items-center gap-2 px-2 py-2 text-left outline-none",
        "text-xs font-bold",
        "hover:bg-black/5 data-[highlighted]:bg-black/5 data-[checked]:bg-soft-signal",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelSortItemIndicator({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="activity-inbox-sort-item-indicator"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center [&_svg]:size-[13px]",
        className,
      )}
      {...props}
    />
  );
}

export function ActivityPanelViewport({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="activity-inbox-viewport"
      className={cn(
        "scrollbar-quiet safe-bottom relative flex-1 overflow-y-overlay p-3",
        "bg-white",
        className,
      )}
      {...props}
    />
  );
}
