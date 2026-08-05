import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps, ComponentRef, Ref } from "react";
import {
  ConversationPanelContent,
  DropdownMenuContent,
  Panel,
  PanelHeaderRoot,
  SidebarBody,
  SidebarContent,
  SidebarRoot,
  useThemeFamily,
  type DropdownMenuContentProps,
} from "raft-ui";
import { tv } from "tailwind-variants/lite";

type StyledProps<P> = Omit<P, "className"> & { className?: string };

const sourceShadowSm = "shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]";
const sourceButtonMotion = [
  sourceShadowSm,
  "transition-all duration-100",
  "hover:-translate-y-px hover:shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]",
  "active:translate-x-px active:translate-y-px",
  "active:shadow-[1px_1px_0px_oklch(0.1812926_0.0049716_17.6198)]",
];

const activityShell = tv({
  slots: {
    root: ["group/activity-inbox flex h-full min-h-0 flex-1 flex-col"],
    header: ["flex shrink-0 items-center gap-3"],
    headerBack: [
      "inline-flex size-8 shrink-0 items-center justify-center md:hidden [&_svg]:size-3.5",
    ],
    headerIcon: ["hidden size-9 shrink-0 items-center justify-center md:flex [&_svg]:size-4.5"],
    headerContent: ["min-w-0 flex-1"],
    headerHeading: ["flex min-w-0 items-center gap-2"],
    headerTitle: ["truncate"],
    headerSubtitle: ["truncate text-xs"],
    layout: ["flex min-h-0 flex-1"],
    sidebar: [
      "w-48 shrink-0",
      "group-data-[layout=compact]/activity-inbox:hidden",
      "group-data-[layout=wide]/activity-inbox:flex",
    ],
    sidebarBody: [],
    sidebarInner: ["p-3"],
    sidebarSection: ["flex flex-col gap-1"],
    sidebarHeading: ["mb-1 mt-5 flex items-center gap-2 px-2"],
    sidebarHeadingLabel: ["flex-1 text-[10px] uppercase"],
    sidebarShowAllLink: ["text-[10px] underline-offset-2"],
    navigationItem: [
      "flex w-full items-center gap-2 border-2 px-2.5 py-2 text-left",
      "transition-colors disabled:pointer-events-none disabled:opacity-50",
      "[&_svg]:shrink-0",
    ],
    navigationLabel: ["min-w-0 flex-1 truncate"],
    navigationCount: ["shrink-0"],
    main: [],
    controls: ["flex shrink-0 flex-nowrap items-center gap-2 px-3 py-2.5"],
    mobileNavigation: [
      "shrink-0",
      "group-data-[layout=compact]/activity-inbox:block",
      "group-data-[layout=wide]/activity-inbox:hidden",
    ],
    mobileNavigationButton: [
      "flex h-9 min-w-28 max-w-40 items-center gap-2 px-2.5 text-sm",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    mobileNavigationLabel: ["min-w-0 flex-1 truncate text-left"],
    switcherBackdrop: ["fixed inset-0 z-50"],
    switcherContent: [
      "fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md",
      "-translate-x-1/2 -translate-y-1/2 outline-none",
    ],
    switcherHeader: ["flex items-center px-4 py-3"],
    switcherTitle: ["flex-1"],
    switcherClose: ["inline-flex size-9 items-center justify-center [&_svg]:size-4.5"],
    switcherBody: ["p-3"],
    switcherItem: [
      "flex w-full items-center gap-3 px-3 py-3 text-left text-sm",
      "transition-colors",
      "[&_svg]:size-4.5 [&_svg]:shrink-0",
    ],
    switcherItemLabel: ["min-w-0 flex-1 truncate"],
    switcherItemCount: ["shrink-0"],
    switcherSeparator: ["mx-3 my-3"],
    search: ["relative min-w-0 flex-1"],
    searchIcon: [
      "pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 [&_svg]:size-[15px]",
    ],
    searchInput: ["h-9 w-full pr-8 pl-8 text-sm outline-none"],
    searchClear: [
      "absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center justify-center",
      "[&_svg]:size-3.5",
    ],
    selectionToolbar: [
      "flex min-h-11 shrink-0 items-center gap-2 px-3",
      "group-data-[layout=compact]/activity-inbox:flex-wrap",
      "group-data-[layout=compact]/activity-inbox:py-2",
      "group-data-[layout=wide]/activity-inbox:h-11",
      "group-data-[layout=wide]/activity-inbox:flex-nowrap",
      "group-data-[layout=wide]/activity-inbox:py-0",
    ],
    selectionCount: ["mr-1 text-xs"],
    toolbarButton: ["inline-flex items-center justify-center px-2 py-1 text-xs"],
    toolbarPrimaryAction: ["inline-flex items-center justify-center px-2 py-1 text-xs"],
    toolbarLink: ["text-xs underline"],
    sortTrigger: ["ml-auto inline-flex items-center gap-1 text-[11px] [&_svg]:size-3"],
    sortContent: ["w-48"],
    viewport: ["safe-bottom relative flex-1 overflow-y-auto p-3"],
    loadingMore: ["py-3 text-center text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["bg-white text-black"],
        header: [
          "h-[62px] px-5",
          "[@media(max-height:600px)]:!h-[62px]",
          "border-b-2 border-black bg-white",
        ],
        headerBack: ["border-2 border-black bg-white", sourceButtonMotion],
        headerIcon: ["border-2 border-black bg-soft-signal text-black"],
        headerTitle: ["text-base font-bold leading-tight text-black"],
        headerSubtitle: ["font-mono text-black/50"],
        sidebar: ["border-r-2 border-black"],
        sidebarBody: ["bg-white"],
        sidebarHeadingLabel: ["font-black tracking-widest text-black/40"],
        sidebarShowAllLink: ["font-black text-black/50 hover:text-black"],
        navigationItem: [
          "border-transparent text-xs font-bold text-black",
          "hover:border-black/30 hover:bg-black/5",
          "aria-[current=page]:border-black aria-[current=page]:bg-soft-signal aria-[current=page]:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
          "aria-pressed:border-black aria-pressed:bg-soft-signal aria-pressed:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        navigationCount: ["font-mono text-black/45"],
        controls: ["border-b-2 border-black bg-white"],
        mobileNavigationButton: ["border-2 border-black bg-white font-black", sourceShadowSm],
        switcherBackdrop: ["bg-black/60"],
        switcherContent: [
          "border-2 border-black bg-white",
          "shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        switcherHeader: ["border-b-2 border-black"],
        switcherTitle: ["text-lg font-black text-black"],
        switcherClose: ["border-2 border-black bg-white", sourceButtonMotion],
        switcherItem: [
          "font-bold text-black hover:bg-black/[0.04]",
          "aria-[current=page]:bg-black/[0.06]",
          "aria-pressed:bg-black/[0.06]",
        ],
        switcherItemCount: ["font-mono text-black/50"],
        switcherSeparator: ["border-t-2 border-black/15"],
        searchIcon: ["text-black/45"],
        searchInput: [
          "border-2 border-black bg-white font-semibold text-black",
          "focus:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        searchClear: ["text-black"],
        selectionToolbar: ["border-b-2 border-black bg-black/[0.03]"],
        selectionCount: ["font-black text-black"],
        toolbarButton: [
          "border-2 border-black bg-white font-bold",
          sourceButtonMotion,
          "disabled:pointer-events-none disabled:opacity-50",
        ],
        toolbarPrimaryAction: [
          "border-2 border-black bg-brutal-cyan font-bold",
          sourceButtonMotion,
        ],
        toolbarLink: ["font-bold decoration-2 text-black"],
        sortTrigger: ["font-mono font-bold text-black/60 hover:text-black"],
        sortContent: ["p-1 shadow-[4px_4px_0px_oklch(0.1812926_0.0049716_17.6198)]"],
        viewport: ["bg-white"],
        loadingMore: ["font-bold text-black/40"],
      },
      elegant: {
        root: ["bg-layer-panel text-foreground", "dark:bg-transparent"],
        header: [
          "min-h-[var(--shell-header-height,56px)]",
          "max-md:h-[var(--shell-header-height,56px)] max-md:bg-layer-page",
          "max-md:pl-5 max-md:pr-3.5 md:pl-9 md:pr-5",
        ],
        headerBack: [
          "rounded-md border border-line-field bg-layer-panel text-foreground-muted",
          "transition-colors hover:bg-fill-muted hover:text-foreground-strong",
          "dark:border-transparent dark:bg-layer-card",
          "dark:shadow-raft-xs",
          "dark:hover:bg-fill-muted",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
        headerIcon: ["rounded-md bg-fill-muted text-foreground-icon", "dark:bg-layer-card"],
        headerTitle: [
          "font-heading text-[17px] font-medium leading-tight tracking-tight",
          "text-foreground-muted",
        ],
        headerSubtitle: ["text-foreground-placeholder"],
        sidebar: ["w-56", "dark:bg-layer-page"],
        sidebarHeadingLabel: ["font-medium tracking-wider text-foreground-placeholder"],
        sidebarShowAllLink: ["font-medium text-foreground-muted hover:text-foreground-strong"],
        navigationItem: [
          "rounded-md border-transparent text-[13px] font-medium text-foreground-muted",
          "hover:border-transparent hover:bg-fill-strong/80 hover:text-foreground-strong",
          "dark:hover:bg-ink-6",
          "aria-[current=page]:border-transparent aria-[current=page]:bg-layer-panel aria-[current=page]:text-foreground",
          "aria-[current=page]:shadow-sm aria-[current=page]:ring-1 aria-[current=page]:ring-line-muted/45",
          "dark:aria-[current=page]:bg-layer-card dark:aria-[current=page]:ring-transparent",
          "aria-pressed:border-transparent aria-pressed:bg-layer-panel aria-pressed:text-foreground",
          "aria-pressed:shadow-sm aria-pressed:ring-1 aria-pressed:ring-line-muted/45",
          "dark:aria-pressed:bg-layer-card dark:aria-pressed:ring-transparent",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        navigationCount: ["text-xs tabular-nums text-foreground-icon"],
        controls: [
          "border-b border-line-hairline bg-layer-panel",
          "dark:border-line-hairline dark:bg-transparent",
          "px-7 max-md:pl-5 max-md:pr-3.5",
        ],
        mobileNavigationButton: [
          "rounded-md border border-line-field bg-layer-panel font-medium text-foreground-strong",
          "shadow-none transition-colors hover:bg-fill-muted",
          "dark:border-transparent dark:bg-layer-card",
          "dark:shadow-raft-xs",
          "dark:hover:bg-fill-muted",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
        switcherBackdrop: ["bg-layer-backdrop backdrop-blur-[2px]"],
        switcherContent: [
          "rounded-xl border-[0.5px] border-line-hairline bg-layer-popover shadow-xl",
          "dark:border-transparent dark:shadow-raft-xl",
        ],
        switcherHeader: ["border-b border-line-hairline"],
        switcherTitle: ["font-heading text-base font-medium text-foreground-strong"],
        switcherClose: [
          "rounded-md text-foreground-muted",
          "transition-colors hover:bg-fill-muted hover:text-foreground-strong",
          "dark:hover:bg-ink-6",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        switcherBody: [],
        switcherItem: [
          "rounded-lg font-medium text-foreground",
          "hover:bg-fill-muted",
          "dark:hover:bg-ink-6",
          "aria-[current=page]:bg-fill-muted",
          "aria-pressed:bg-fill-muted",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        switcherItemCount: ["tabular-nums text-foreground-placeholder"],
        switcherSeparator: ["border-t border-line-hairline"],
        searchIcon: ["text-foreground-placeholder"],
        searchInput: [
          "rounded-md border border-line-field bg-layer-panel text-foreground-strong",
          "placeholder:text-foreground-placeholder/70",
          "shadow-none transition duration-200 ease-out",
          "hover:border-line-field-hover",
          "dark:border-transparent dark:bg-layer-inset",
          "dark:shadow-[inset_0_1px_2px_oklch(0_0_0_/_0.3),inset_0_0_0_1px_oklch(0_0_0_/_0.35),0_1px_0_oklch(0.985_0.004_106.42_/_0.04)]",
          "dark:hover:border-ink-8 dark:hover:shadow-none dark:focus:bg-layer-card",
          "focus:ring-1 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-layer-page dark:focus:ring-2 dark:focus:ring-primary-400/60 dark:focus:ring-offset-0",
        ],
        searchClear: [
          "text-foreground-muted transition-colors hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        selectionToolbar: [
          "border-b border-line-hairline px-7 max-md:pl-5 max-md:pr-3.5",
          "dark:border-line-hairline",
        ],
        selectionCount: ["font-medium text-foreground-strong"],
        toolbarButton: [
          "rounded-md border border-line-field bg-layer-panel font-medium text-foreground-strong",
          "shadow-none transition-colors hover:bg-fill-muted",
          "disabled:pointer-events-none disabled:opacity-50",
          "dark:border-transparent dark:bg-layer-card",
          "dark:shadow-raft-xs",
          "dark:hover:bg-fill-muted",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
        toolbarPrimaryAction: [
          "rounded-md border border-transparent bg-foreground font-medium text-foreground-inverse",
          "transition-colors hover:bg-foreground/90",
          "dark:shadow-raft-sm",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0",
        ],
        toolbarLink: [
          "rounded-sm font-medium text-foreground-muted underline decoration-1 underline-offset-2",
          "transition-colors hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        sortTrigger: [
          "rounded-sm font-medium text-foreground-muted",
          "transition-colors hover:text-foreground-strong",
          "outline-none focus-visible:ring-1 focus-visible:ring-primary-400 dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
        ],
        sortContent: ["p-1"],
        viewport: ["bg-layer-panel dark:bg-transparent", "px-7 max-md:pl-5 max-md:pr-3.5"],
        loadingMore: ["font-medium text-foreground-placeholder"],
      },
    },
  },
});

export function ActivityPanelRoot({
  className,
  ref,
  ...props
}: ComponentProps<typeof Panel> & { ref?: Ref<ComponentRef<"div">> }) {
  const theme = useThemeFamily();
  const { root } = activityShell({ theme });
  return (
    <Panel
      render={<div />}
      ref={ref}
      data-slot="activity-inbox-root"
      className={root({ className })}
      {...props}
    />
  );
}

export function ActivityPanelHeader({
  className,
  ...props
}: ComponentProps<typeof PanelHeaderRoot>) {
  const theme = useThemeFamily();
  const { header } = activityShell({ theme });
  return (
    <PanelHeaderRoot
      data-slot="activity-inbox-header"
      className={header({ className })}
      {...props}
    />
  );
}

export function ActivityPanelHeaderBack({ className, ...props }: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { headerBack } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-header-back"
      className={headerBack({ className })}
      {...props}
    />
  );
}

export function ActivityPanelHeaderIcon({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { headerIcon } = activityShell({ theme });
  return (
    <div data-slot="activity-inbox-header-icon" className={headerIcon({ className })} {...props} />
  );
}

export function ActivityPanelHeaderContent({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { headerContent } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-header-content"
      className={headerContent({ className })}
      {...props}
    />
  );
}

export function ActivityPanelHeaderHeading({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { headerHeading } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-header-heading"
      className={headerHeading({ className })}
      {...props}
    />
  );
}

export function ActivityPanelHeaderTitle({ className, ...props }: ComponentProps<"h2">) {
  const theme = useThemeFamily();
  const { headerTitle } = activityShell({ theme });
  return (
    <h2 data-slot="activity-inbox-header-title" className={headerTitle({ className })} {...props} />
  );
}

export function ActivityPanelHeaderSubtitle({ className, ...props }: ComponentProps<"p">) {
  const theme = useThemeFamily();
  const { headerSubtitle } = activityShell({ theme });
  return (
    <p
      data-slot="activity-inbox-header-subtitle"
      className={headerSubtitle({ className })}
      {...props}
    />
  );
}

export function ActivityPanelLayout({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { layout } = activityShell({ theme });
  return <div data-slot="activity-inbox-layout" className={layout({ className })} {...props} />;
}

export function ActivityPanelSidebar({
  className,
  children,
  ...props
}: ComponentProps<typeof SidebarRoot>) {
  const theme = useThemeFamily();
  const { sidebar, sidebarBody, sidebarInner } = activityShell({ theme });
  return (
    <SidebarRoot
      render={<aside />}
      data-slot="activity-inbox-sidebar"
      className={sidebar({ className })}
      {...props}
    >
      <SidebarBody className={sidebarBody()}>
        <SidebarContent className={sidebarInner()}>{children}</SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}

export function ActivityPanelSidebarSection({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { sidebarSection } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-sidebar-section"
      className={sidebarSection({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSidebarHeading({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { sidebarHeading } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-sidebar-heading"
      className={sidebarHeading({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSidebarHeadingLabel({ className, ...props }: ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { sidebarHeadingLabel } = activityShell({ theme });
  return (
    <span
      data-slot="activity-inbox-sidebar-heading-label"
      className={sidebarHeadingLabel({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSidebarShowAllLink({ className, ...props }: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { sidebarShowAllLink, toolbarLink } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-sidebar-show-all-link"
      className={toolbarLink({ className: sidebarShowAllLink({ className }) })}
      {...props}
    />
  );
}

export function ActivityPanelNavigationItem({ className, ...props }: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { navigationItem } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-navigation-item"
      className={navigationItem({ className })}
      {...props}
    />
  );
}

export function ActivityPanelNavigationLabel({ className, ...props }: ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { navigationLabel } = activityShell({ theme });
  return (
    <span
      data-slot="activity-inbox-navigation-label"
      className={navigationLabel({ className })}
      {...props}
    />
  );
}

export function ActivityPanelNavigationCount({ className, ...props }: ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { navigationCount } = activityShell({ theme });
  return (
    <span
      data-slot="activity-inbox-navigation-count"
      className={navigationCount({ className })}
      {...props}
    />
  );
}

export function ActivityPanelMain({
  className,
  ...props
}: ComponentProps<typeof ConversationPanelContent>) {
  const theme = useThemeFamily();
  const { main } = activityShell({ theme });
  return (
    <ConversationPanelContent
      render={<section />}
      data-slot="activity-inbox-main"
      className={main({ className })}
      {...props}
    />
  );
}

export function ActivityPanelControls({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { controls } = activityShell({ theme });
  return <div data-slot="activity-inbox-controls" className={controls({ className })} {...props} />;
}

export function ActivityPanelMobileNavigation({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { mobileNavigation } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-mobile-navigation"
      className={mobileNavigation({ className })}
      {...props}
    />
  );
}

export function ActivityPanelMobileNavigationButton({
  className,
  ...props
}: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { mobileNavigationButton } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-mobile-navigation-button"
      className={mobileNavigationButton({ className })}
      {...props}
    />
  );
}

export function ActivityPanelMobileNavigationLabel({
  className,
  ...props
}: ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { mobileNavigationLabel } = activityShell({ theme });
  return (
    <span
      data-slot="activity-inbox-mobile-navigation-label"
      className={mobileNavigationLabel({ className })}
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
}: StyledProps<BaseDialog.Popup.Props> & { portalProps?: BaseDialog.Portal.Props }) {
  const theme = useThemeFamily();
  const { switcherBackdrop, switcherContent } = activityShell({ theme });
  return (
    <BaseDialog.Portal data-slot="activity-inbox-switcher-portal" {...portalProps}>
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

export function ActivityPanelSwitcherHeader({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { switcherHeader } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-switcher-header"
      className={switcherHeader({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherTitle({
  className,
  ...props
}: StyledProps<BaseDialog.Title.Props>) {
  const theme = useThemeFamily();
  const { switcherTitle } = activityShell({ theme });
  return (
    <BaseDialog.Title
      data-slot="activity-inbox-switcher-title"
      className={switcherTitle({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherClose({
  className,
  ...props
}: StyledProps<BaseDialog.Close.Props>) {
  const theme = useThemeFamily();
  const { switcherClose } = activityShell({ theme });
  return (
    <BaseDialog.Close
      data-slot="activity-inbox-switcher-close"
      className={switcherClose({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherBody({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { switcherBody } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-switcher-body"
      className={switcherBody({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherItem({ className, ...props }: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { switcherItem } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-switcher-item"
      className={switcherItem({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherItemLabel({ className, ...props }: ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { switcherItemLabel } = activityShell({ theme });
  return (
    <span
      data-slot="activity-inbox-switcher-item-label"
      className={switcherItemLabel({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherItemCount({ className, ...props }: ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { switcherItemCount } = activityShell({ theme });
  return (
    <span
      data-slot="activity-inbox-switcher-item-count"
      className={switcherItemCount({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSwitcherSeparator({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { switcherSeparator } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-switcher-separator"
      className={switcherSeparator({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSearch({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { search } = activityShell({ theme });
  return <div data-slot="activity-inbox-search" className={search({ className })} {...props} />;
}

export function ActivityPanelSearchIcon({ className, ...props }: ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { searchIcon } = activityShell({ theme });
  return (
    <span data-slot="activity-inbox-search-icon" className={searchIcon({ className })} {...props} />
  );
}

export function ActivityPanelSearchInput({ className, ...props }: ComponentProps<"input">) {
  const theme = useThemeFamily();
  const { searchInput } = activityShell({ theme });
  return (
    <input
      data-slot="activity-inbox-search-input"
      className={searchInput({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSearchClear({ className, ...props }: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { searchClear } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-search-clear"
      className={searchClear({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSelectionToolbar({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { selectionToolbar } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-selection-toolbar"
      className={selectionToolbar({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSelectionCount({ className, ...props }: ComponentProps<"span">) {
  const theme = useThemeFamily();
  const { selectionCount } = activityShell({ theme });
  return (
    <span
      data-slot="activity-inbox-selection-count"
      className={selectionCount({ className })}
      {...props}
    />
  );
}

export function ActivityPanelToolbarButton({ className, ...props }: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { toolbarButton } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-toolbar-button"
      className={toolbarButton({ className })}
      {...props}
    />
  );
}

export function ActivityPanelToolbarPrimaryAction({
  className,
  ...props
}: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { toolbarPrimaryAction } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-toolbar-primary-action"
      className={toolbarPrimaryAction({ className })}
      {...props}
    />
  );
}

export function ActivityPanelToolbarLink({ className, ...props }: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { toolbarLink } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-toolbar-link"
      className={toolbarLink({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSortTrigger({ className, ...props }: ComponentProps<"button">) {
  const theme = useThemeFamily();
  const { sortTrigger } = activityShell({ theme });
  return (
    <button
      type="button"
      data-slot="activity-inbox-sort-trigger"
      className={sortTrigger({ className })}
      {...props}
    />
  );
}

export function ActivityPanelSortContent({ className, ...props }: DropdownMenuContentProps) {
  const theme = useThemeFamily();
  const { sortContent } = activityShell({ theme });
  return <DropdownMenuContent className={sortContent({ className })} {...props} />;
}

export function ActivityPanelViewport({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { viewport } = activityShell({ theme });
  return <div data-slot="activity-inbox-viewport" className={viewport({ className })} {...props} />;
}

export function ActivityPanelLoadingMore({ className, ...props }: ComponentProps<"div">) {
  const theme = useThemeFamily();
  const { loadingMore } = activityShell({ theme });
  return (
    <div
      data-slot="activity-inbox-loading-more"
      className={loadingMore({ className })}
      {...props}
    />
  );
}
