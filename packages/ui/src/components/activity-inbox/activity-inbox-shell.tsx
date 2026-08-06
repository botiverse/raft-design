import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentPropsWithRef, ReactNode } from "react";

import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Panel, PanelHeaderRoot } from "../panel/panel";
import { SidebarBody, SidebarContent, SidebarRoot } from "../sidebar/sidebar";
import { SidebarItemRoot } from "../sidebar/sidebar-item";
import { activityInboxShell } from "./activity-inbox-shell.recipe";

type StyledProps<Props> = Omit<Props, "className"> & { className?: string };

/** @internal Styling bridge for canonical compositions while the shell is on the WIP surface. */
export function useActivityInboxShellStyles() {
  const theme = useThemeFamily();
  return activityInboxShell({ theme });
}

export type ActivityInboxPanelProps = ComponentPropsWithRef<typeof Panel>;

export function ActivityInboxPanel({ className, ...props }: ActivityInboxPanelProps) {
  const theme = useThemeFamily();
  const { panel } = activityInboxShell({ theme });
  return (
    <Panel
      render={<div />}
      edge="inset"
      data-slot="activity-inbox-root"
      className={panel({ className })}
      {...props}
    />
  );
}

export type ActivityInboxHeaderProps = ComponentPropsWithRef<typeof PanelHeaderRoot>;

export function ActivityInboxHeader({ className, ...props }: ActivityInboxHeaderProps) {
  const theme = useThemeFamily();
  const { header } = activityInboxShell({ theme });
  return (
    <PanelHeaderRoot
      data-panel-frame-header=""
      data-slot="activity-inbox-header"
      className={header({ className })}
      {...props}
    />
  );
}

export type ActivityInboxHeaderBackProps = ComponentPropsWithRef<"button">;

export function ActivityInboxHeaderBack({ className, ...props }: ActivityInboxHeaderBackProps) {
  const theme = useThemeFamily();
  const { headerBack } = activityInboxShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-header-back"
      className={headerBack({ className })}
      {...props}
    />
  );
}

export type ActivityInboxHeaderIconProps = ComponentPropsWithRef<"div">;

export function ActivityInboxHeaderIcon({ className, ...props }: ActivityInboxHeaderIconProps) {
  const theme = useThemeFamily();
  const { headerIcon } = activityInboxShell({ theme });
  return (
    <div data-slot="activity-inbox-header-icon" className={headerIcon({ className })} {...props} />
  );
}

export type ActivityInboxHeaderContentProps = ComponentPropsWithRef<"div">;

export function ActivityInboxHeaderContent({
  className,
  ...props
}: ActivityInboxHeaderContentProps) {
  const theme = useThemeFamily();
  const { headerContent } = activityInboxShell({ theme });
  return (
    <div
      data-slot="activity-inbox-header-content"
      className={headerContent({ className })}
      {...props}
    />
  );
}

export type ActivityInboxHeaderTitleProps = ComponentPropsWithRef<"h2">;

export function ActivityInboxHeaderTitle({ className, ...props }: ActivityInboxHeaderTitleProps) {
  const theme = useThemeFamily();
  const { headerTitle } = activityInboxShell({ theme });
  return (
    <h2 data-slot="activity-inbox-header-title" className={headerTitle({ className })} {...props} />
  );
}

export type ActivityInboxHeaderSubtitleProps = ComponentPropsWithRef<"p">;

export function ActivityInboxHeaderSubtitle({
  className,
  ...props
}: ActivityInboxHeaderSubtitleProps) {
  const theme = useThemeFamily();
  const { headerSubtitle } = activityInboxShell({ theme });
  return (
    <p
      data-slot="activity-inbox-header-subtitle"
      className={headerSubtitle({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSidebarProps = ComponentPropsWithRef<typeof SidebarRoot> & {
  children?: ReactNode;
};

export function ActivityInboxSidebar({ className, children, ...props }: ActivityInboxSidebarProps) {
  const theme = useThemeFamily();
  const { sidebar, sidebarBody, sidebarContent } = activityInboxShell({ theme });
  return (
    <SidebarRoot
      render={<aside />}
      data-slot="activity-inbox-sidebar"
      className={sidebar({ className })}
      {...props}
    >
      <SidebarBody className={sidebarBody()}>
        <SidebarContent className={sidebarContent()}>{children}</SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}

export type ActivityInboxSidebarHeadingProps = ComponentPropsWithRef<"div">;

export function ActivityInboxSidebarHeading({
  className,
  ...props
}: ActivityInboxSidebarHeadingProps) {
  const theme = useThemeFamily();
  const { sidebarHeading } = activityInboxShell({ theme });
  return (
    <div
      data-slot="activity-inbox-sidebar-heading"
      className={sidebarHeading({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSidebarHeadingLabelProps = ComponentPropsWithRef<"span">;

export function ActivityInboxSidebarHeadingLabel({
  className,
  ...props
}: ActivityInboxSidebarHeadingLabelProps) {
  const theme = useThemeFamily();
  const { sidebarHeadingLabel } = activityInboxShell({ theme });
  return (
    <span
      data-slot="activity-inbox-sidebar-heading-label"
      className={sidebarHeadingLabel({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSidebarHeadingActionProps = ComponentPropsWithRef<"button">;

export function ActivityInboxSidebarHeadingAction({
  className,
  ...props
}: ActivityInboxSidebarHeadingActionProps) {
  const theme = useThemeFamily();
  const { sidebarHeadingAction, toolbarLink } = activityInboxShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-sidebar-show-all-link"
      className={toolbarLink({ className: sidebarHeadingAction({ className }) })}
      {...props}
    />
  );
}

export type ActivityInboxNavigationItemProps = ComponentPropsWithRef<typeof SidebarItemRoot>;

export function ActivityInboxNavigationItem({
  active,
  className,
  ...props
}: ActivityInboxNavigationItemProps) {
  const theme = useThemeFamily();
  const { navigationItem } = activityInboxShell({ theme });
  return (
    <SidebarItemRoot
      active={active}
      data-slot="activity-inbox-navigation-item"
      className={navigationItem({ className })}
      {...props}
    />
  );
}

export type ActivityInboxNavigationLabelProps = ComponentPropsWithRef<"span">;

export function ActivityInboxNavigationLabel({
  className,
  ...props
}: ActivityInboxNavigationLabelProps) {
  const theme = useThemeFamily();
  const { navigationLabel } = activityInboxShell({ theme });
  return (
    <span
      data-slot="activity-inbox-navigation-label"
      className={navigationLabel({ className })}
      {...props}
    />
  );
}

export type ActivityInboxNavigationCountProps = ComponentPropsWithRef<"span">;

export function ActivityInboxNavigationCount({
  className,
  ...props
}: ActivityInboxNavigationCountProps) {
  const theme = useThemeFamily();
  const { navigationCount } = activityInboxShell({ theme });
  return (
    <span
      data-slot="activity-inbox-navigation-count"
      className={navigationCount({ className })}
      {...props}
    />
  );
}

export type ActivityInboxControlsProps = ComponentPropsWithRef<"div">;

export function ActivityInboxControls({ className, ...props }: ActivityInboxControlsProps) {
  const theme = useThemeFamily();
  const { controls } = activityInboxShell({ theme });
  return <div data-slot="activity-inbox-controls" className={controls({ className })} {...props} />;
}

export type ActivityInboxMobileNavigationButtonProps = ComponentPropsWithRef<"button">;

export function ActivityInboxMobileNavigationButton({
  className,
  ...props
}: ActivityInboxMobileNavigationButtonProps) {
  const theme = useThemeFamily();
  const { mobileNavigationButton } = activityInboxShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-mobile-navigation-button"
      className={mobileNavigationButton({ className })}
      {...props}
    />
  );
}

export type ActivityInboxMobileNavigationLabelProps = ComponentPropsWithRef<"span">;

export function ActivityInboxMobileNavigationLabel({
  className,
  ...props
}: ActivityInboxMobileNavigationLabelProps) {
  const theme = useThemeFamily();
  const { mobileNavigationLabel } = activityInboxShell({ theme });
  return (
    <span
      data-slot="activity-inbox-mobile-navigation-label"
      className={mobileNavigationLabel({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherContentProps = StyledProps<BaseDialog.Popup.Props> & {
  portalProps?: BaseDialog.Portal.Props;
};

export function ActivityInboxSwitcherContent({
  className,
  portalProps,
  ...props
}: ActivityInboxSwitcherContentProps) {
  const theme = useThemeFamily();
  const { switcherBackdrop, switcherContent } = activityInboxShell({ theme });
  const scopedPortalProps = useThemeScopeProps(portalProps ?? {});
  return (
    <BaseDialog.Portal data-slot="activity-inbox-switcher-portal" {...scopedPortalProps}>
      <BaseDialog.Backdrop
        data-slot="activity-inbox-switcher-backdrop"
        className={switcherBackdrop()}
      />
      <BaseDialog.Popup
        data-slot="activity-inbox-switcher-content"
        className={switcherContent({ className })}
        {...props}
      />
    </BaseDialog.Portal>
  );
}

export type ActivityInboxSwitcherHeaderProps = ComponentPropsWithRef<"div">;

export function ActivityInboxSwitcherHeader({
  className,
  ...props
}: ActivityInboxSwitcherHeaderProps) {
  const theme = useThemeFamily();
  const { switcherHeader } = activityInboxShell({ theme });
  return (
    <div
      data-slot="activity-inbox-switcher-header"
      className={switcherHeader({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherTitleProps = StyledProps<BaseDialog.Title.Props>;

export function ActivityInboxSwitcherTitle({
  className,
  ...props
}: ActivityInboxSwitcherTitleProps) {
  const theme = useThemeFamily();
  const { switcherTitle } = activityInboxShell({ theme });
  return (
    <BaseDialog.Title
      data-slot="activity-inbox-switcher-title"
      className={switcherTitle({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherCloseProps = StyledProps<BaseDialog.Close.Props>;

export function ActivityInboxSwitcherClose({
  className,
  ...props
}: ActivityInboxSwitcherCloseProps) {
  const theme = useThemeFamily();
  const { switcherClose } = activityInboxShell({ theme });
  return (
    <BaseDialog.Close
      data-slot="activity-inbox-switcher-close"
      className={switcherClose({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherBodyProps = ComponentPropsWithRef<"div">;

export function ActivityInboxSwitcherBody({ className, ...props }: ActivityInboxSwitcherBodyProps) {
  const theme = useThemeFamily();
  const { switcherBody } = activityInboxShell({ theme });
  return (
    <div
      data-slot="activity-inbox-switcher-body"
      className={switcherBody({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherItemProps = ComponentPropsWithRef<"button"> & {
  active?: boolean;
};

export function ActivityInboxSwitcherItem({
  active = false,
  className,
  ...props
}: ActivityInboxSwitcherItemProps) {
  const theme = useThemeFamily();
  const { switcherItem } = activityInboxShell({ theme });
  return (
    <button
      type="button"
      data-active={active ? "true" : undefined}
      data-slot="activity-inbox-switcher-item"
      className={switcherItem({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherItemLabelProps = ComponentPropsWithRef<"span">;

export function ActivityInboxSwitcherItemLabel({
  className,
  ...props
}: ActivityInboxSwitcherItemLabelProps) {
  const theme = useThemeFamily();
  const { switcherItemLabel } = activityInboxShell({ theme });
  return (
    <span
      data-slot="activity-inbox-switcher-item-label"
      className={switcherItemLabel({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherItemCountProps = ComponentPropsWithRef<"span">;

export function ActivityInboxSwitcherItemCount({
  className,
  ...props
}: ActivityInboxSwitcherItemCountProps) {
  const theme = useThemeFamily();
  const { switcherItemCount } = activityInboxShell({ theme });
  return (
    <span
      data-slot="activity-inbox-switcher-item-count"
      className={switcherItemCount({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSelectionToolbarProps = ComponentPropsWithRef<"div">;

export function ActivityInboxSelectionToolbar({
  className,
  ...props
}: ActivityInboxSelectionToolbarProps) {
  const theme = useThemeFamily();
  const { selectionToolbar } = activityInboxShell({ theme });
  return (
    <div
      data-slot="activity-inbox-selection-toolbar"
      className={selectionToolbar({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSelectionCountProps = ComponentPropsWithRef<"span">;

export function ActivityInboxSelectionCount({
  className,
  ...props
}: ActivityInboxSelectionCountProps) {
  const theme = useThemeFamily();
  const { selectionCount } = activityInboxShell({ theme });
  return (
    <span
      data-slot="activity-inbox-selection-count"
      className={selectionCount({ className })}
      {...props}
    />
  );
}

export type ActivityInboxViewportProps = ComponentPropsWithRef<"div">;

export function ActivityInboxViewport({ className, ...props }: ActivityInboxViewportProps) {
  const theme = useThemeFamily();
  const { viewport } = activityInboxShell({ theme });
  return <div data-slot="activity-inbox-viewport" className={viewport({ className })} {...props} />;
}

export type ActivityInboxLoadingMoreProps = ComponentPropsWithRef<"div">;

export function ActivityInboxLoadingMore({ className, ...props }: ActivityInboxLoadingMoreProps) {
  const theme = useThemeFamily();
  const { loadingMore } = activityInboxShell({ theme });
  return (
    <div
      data-slot="activity-inbox-loading-more"
      className={loadingMore({ className })}
      {...props}
    />
  );
}
