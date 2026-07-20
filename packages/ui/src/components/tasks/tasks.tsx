import { Collapsible } from "@base-ui/react/collapsible";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";
import { dataPresence, isAriaTrue } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxHeader,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  type ComboboxClearProps,
  type ComboboxContentProps,
  type ComboboxEmptyProps,
  type ComboboxHeaderProps,
  type ComboboxInputProps,
  type ComboboxItemIndicatorProps,
  type ComboboxItemProps,
  type ComboboxLabelProps,
  type ComboboxListProps,
} from "../combobox/index";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  type DialogContentProps,
  type DialogProps,
  type DialogTitleProps,
} from "../dialog/index";
import {
  DropdownMenuContent,
  DropdownMenuRadioItem,
  type DropdownMenuContentProps,
  type DropdownMenuRadioItemProps,
} from "../dropdown-menu/index";
import { tasks } from "./tasks.recipe";

type TaskTag = "article" | "button" | "div" | "footer" | "form" | "p" | "section" | "span";
type SlotProps<Tag extends TaskTag> = useRender.ComponentProps<Tag>;
export type TaskStatusTone = "accent-muted" | "information" | "muted" | "success" | "warning";

function useTaskSlot<Tag extends TaskTag>(
  slotName: keyof ReturnType<typeof tasks>,
  dataSlot: string,
  defaultTagName: Tag,
  props: SlotProps<Tag>,
) {
  const theme = useThemeFamily();
  const slots = tasks({ theme });
  const slot = slots[slotName];
  const { className, render, ...otherProps } = props;
  const defaultProps = {
    "data-slot": dataSlot,
    className: slot({ className }),
  } as useRender.ElementProps<Tag>;

  return useRender({
    defaultTagName,
    render,
    props: { ...defaultProps, ...otherProps },
  });
}

export type TasksPanelRootProps = SlotProps<"section">;
export function TasksPanelRoot(props: TasksPanelRootProps) {
  return useTaskSlot("panelRoot", "tasks-panel-root", "section", props);
}

export type TasksPanelToolbarProps = SlotProps<"div">;
export function TasksPanelToolbar(props: TasksPanelToolbarProps) {
  return useTaskSlot("toolbar", "tasks-panel-toolbar", "div", props);
}

export type TasksPanelToolbarGroupProps = SlotProps<"div">;
export function TasksPanelToolbarGroup(props: TasksPanelToolbarGroupProps) {
  return useTaskSlot("toolbarGroup", "tasks-panel-toolbar-group", "div", props);
}

export type TasksPanelViewportProps = SlotProps<"div">;
export function TasksPanelViewport(props: TasksPanelViewportProps) {
  return useTaskSlot("viewport", "tasks-panel-viewport", "div", props);
}

export type TasksPanelEmptyProps = SlotProps<"div">;
export function TasksPanelEmpty(props: TasksPanelEmptyProps) {
  return useTaskSlot("panelEmpty", "tasks-panel-empty", "div", props);
}

export type TaskLoadingListProps = SlotProps<"div">;
export function TaskLoadingList(props: TaskLoadingListProps) {
  return useTaskSlot("loadingList", "task-loading-list", "div", {
    "aria-busy": true,
    ...props,
  });
}

export type TaskLoadingRowProps = SlotProps<"div">;
export function TaskLoadingRow(props: TaskLoadingRowProps) {
  return useTaskSlot("loadingRow", "task-loading-row", "div", {
    "aria-hidden": true,
    ...props,
  });
}

export type TaskLoadingRowContentProps = SlotProps<"div">;
export function TaskLoadingRowContent(props: TaskLoadingRowContentProps) {
  return useTaskSlot("loadingRowContent", "task-loading-row-content", "div", props);
}

export type TaskLoadingLinesProps = TaskLoadingRowContentProps;
export function TaskLoadingLines(props: TaskLoadingLinesProps) {
  return useTaskSlot("loadingRowContent", "task-loading-lines", "div", props);
}

export type TaskFilterTriggerProps = SlotProps<"button"> & { busy?: boolean };
export function TaskFilterTrigger({
  busy = false,
  "aria-pressed": ariaPressed,
  ...props
}: TaskFilterTriggerProps) {
  const slotProps = {
    type: "button",
    "aria-busy": busy || undefined,
    "data-busy": busy ? "true" : undefined,
    ...props,
    "aria-pressed": ariaPressed,
    ...(isAriaTrue(ariaPressed) ? { "data-pressed": dataPresence(true) } : {}),
  } as TaskFilterTriggerProps;
  return useTaskSlot("filterTrigger", "task-filter-trigger", "button", slotProps);
}

export type TaskFilterCountProps = SlotProps<"span">;
export function TaskFilterCount(props: TaskFilterCountProps) {
  return useTaskSlot("filterCount", "task-filter-count", "span", props);
}

export type TaskFilterClearProps = SlotProps<"button">;
export function TaskFilterClear(props: TaskFilterClearProps) {
  return useTaskSlot("filterClear", "task-filter-clear", "button", {
    type: "button",
    ...props,
  });
}

export type TaskFilterContentProps = ComboboxContentProps;
export function TaskFilterContent({ className, ...props }: TaskFilterContentProps) {
  const theme = useThemeFamily();
  const { filterContent } = tasks({ theme });
  return <ComboboxContent className={filterContent({ className })} {...props} />;
}

export type TaskFilterHeaderProps = ComboboxHeaderProps;
export function TaskFilterHeader({ className, ...props }: TaskFilterHeaderProps) {
  const theme = useThemeFamily();
  const { filterHeader } = tasks({ theme });
  return <ComboboxHeader className={filterHeader({ className })} {...props} />;
}

export type TaskFilterLabelProps = ComboboxLabelProps;
export function TaskFilterLabel({ className, ...props }: TaskFilterLabelProps) {
  const theme = useThemeFamily();
  const { filterLabel } = tasks({ theme });
  return <ComboboxLabel className={filterLabel({ className })} {...props} />;
}

export type TaskFilterPopoverClearProps = ComboboxClearProps;
export function TaskFilterPopoverClear({ className, ...props }: TaskFilterPopoverClearProps) {
  const theme = useThemeFamily();
  const { filterPopoverClear } = tasks({ theme });
  return <ComboboxClear className={filterPopoverClear({ className })} {...props} />;
}

export type TaskFilterSearchProps = SlotProps<"div">;
export function TaskFilterSearch(props: TaskFilterSearchProps) {
  return useTaskSlot("filterSearch", "task-filter-search", "div", props);
}

export type TaskFilterInputProps = ComboboxInputProps;
export function TaskFilterInput({ className, ...props }: TaskFilterInputProps) {
  const theme = useThemeFamily();
  const { filterInput } = tasks({ theme });
  return <ComboboxInput className={filterInput({ className })} {...props} />;
}

export type TaskFilterListProps = ComboboxListProps;
export function TaskFilterList({ className, ...props }: TaskFilterListProps) {
  const theme = useThemeFamily();
  const { filterList } = tasks({ theme });
  return <ComboboxList className={filterList({ className })} {...props} />;
}

export type TaskFilterOptionProps = ComboboxItemProps;
export function TaskFilterOption({ className, ...props }: TaskFilterOptionProps) {
  const theme = useThemeFamily();
  const { filterOption } = tasks({ theme });
  return <ComboboxItem className={filterOption({ className })} {...props} />;
}

export type TaskFilterOptionContentProps = SlotProps<"span">;
export function TaskFilterOptionContent(props: TaskFilterOptionContentProps) {
  return useTaskSlot("filterOptionContent", "task-filter-option-content", "span", props);
}

export type TaskFilterOptionLeadingProps = SlotProps<"span">;
export function TaskFilterOptionLeading(props: TaskFilterOptionLeadingProps) {
  return useTaskSlot("filterOptionLeading", "task-filter-option-leading", "span", props);
}

export type TaskFilterOptionLabelProps = SlotProps<"span"> & { italic?: boolean };
export function TaskFilterOptionLabel({
  italic = false,
  className,
  render,
  ...props
}: TaskFilterOptionLabelProps) {
  const theme = useThemeFamily();
  const { filterOptionLabel } = tasks({
    theme,
    optionLabelStyle: italic ? "italic" : "default",
  });
  return useRender({
    defaultTagName: "span",
    render,
    props: {
      "data-slot": "task-filter-option-label",
      className: filterOptionLabel({ className }),
      ...props,
    },
  });
}

export type TaskFilterOptionIndicatorProps = ComboboxItemIndicatorProps;
export function TaskFilterOptionIndicator({ className, ...props }: TaskFilterOptionIndicatorProps) {
  const theme = useThemeFamily();
  const { filterOptionIndicator } = tasks({ theme });
  return <ComboboxItemIndicator className={filterOptionIndicator({ className })} {...props} />;
}

export type TaskFilterEmptyProps = ComboboxEmptyProps;
export function TaskFilterEmpty({ className, ...props }: TaskFilterEmptyProps) {
  const theme = useThemeFamily();
  const { filterEmpty } = tasks({ theme });
  return <ComboboxEmpty className={filterEmpty({ className })} {...props} />;
}

export type TaskToolbarActionProps = SlotProps<"button">;
export function TaskToolbarAction(props: TaskToolbarActionProps) {
  return useTaskSlot("toolbarAction", "task-toolbar-action", "button", {
    type: "button",
    ...props,
  });
}

export type TaskCardProps = SlotProps<"article"> & { busy?: boolean; disabled?: boolean };
export function TaskCard({ busy = false, disabled = false, ...props }: TaskCardProps) {
  const slotProps = {
    "aria-busy": busy || undefined,
    "aria-disabled": disabled || undefined,
    "data-busy": busy ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    ...props,
  } as TaskCardProps;
  return useTaskSlot("card", "task-card", "article", slotProps);
}

export type TaskCardOpenProps = SlotProps<"button">;
export function TaskCardOpen(props: TaskCardOpenProps) {
  return useTaskSlot("cardOpen", "task-card-open", "button", { type: "button", ...props });
}

export type TaskCardRowProps = SlotProps<"div">;
export function TaskCardRow(props: TaskCardRowProps) {
  return useTaskSlot("cardRow", "task-card-row", "div", props);
}

export type TaskCardBodyProps = SlotProps<"div">;
export function TaskCardBody(props: TaskCardBodyProps) {
  return useTaskSlot("cardBody", "task-card-body", "div", props);
}

export type TaskCardMetaProps = SlotProps<"div">;
export function TaskCardMeta(props: TaskCardMetaProps) {
  return useTaskSlot("cardMeta", "task-card-meta", "div", props);
}

export type TaskCardChannelProps = SlotProps<"span">;
export function TaskCardChannel(props: TaskCardChannelProps) {
  return useTaskSlot("cardChannel", "task-card-channel", "span", props);
}

export type TaskCardNumberProps = SlotProps<"span">;
export function TaskCardNumber(props: TaskCardNumberProps) {
  return useTaskSlot("cardNumber", "task-card-number", "span", props);
}

export type TaskCardLegacyProps = SlotProps<"span">;
export function TaskCardLegacy(props: TaskCardLegacyProps) {
  return useTaskSlot("cardLegacy", "task-card-legacy", "span", props);
}

export type TaskCardTitleProps = SlotProps<"p">;
export function TaskCardTitle(props: TaskCardTitleProps) {
  return useTaskSlot("cardTitle", "task-card-title", "p", props);
}

export type TaskCardDescriptionProps = SlotProps<"p">;
export function TaskCardDescription(props: TaskCardDescriptionProps) {
  return useTaskSlot("cardDescription", "task-card-description", "p", props);
}

export type TaskCardFooterProps = SlotProps<"footer">;
export function TaskCardFooter(props: TaskCardFooterProps) {
  return useTaskSlot("cardFooter", "task-card-footer", "footer", props);
}

export type TaskCardStatusProps = SlotProps<"div"> & { busy?: boolean };
export function TaskCardStatus({ busy = false, ...props }: TaskCardStatusProps) {
  const slotProps = {
    "aria-busy": busy || undefined,
    "data-busy": busy ? "true" : undefined,
    ...props,
  } as TaskCardStatusProps;
  return useTaskSlot("cardStatus", "task-card-status", "div", slotProps);
}

export type TaskCardStatusTriggerProps = SlotProps<"button"> & {
  busy?: boolean;
  tone: TaskStatusTone;
};
export function TaskCardStatusTrigger({
  busy = false,
  tone,
  ...props
}: TaskCardStatusTriggerProps) {
  const theme = useThemeFamily();
  const { cardStatusTrigger } = tasks({ theme, tone });
  const { className, render, ...otherProps } = props;
  return useRender({
    defaultTagName: "button",
    render,
    props: {
      type: "button",
      "data-slot": "task-card-status-trigger",
      "data-busy": busy ? "true" : undefined,
      "aria-busy": busy || undefined,
      className: cardStatusTrigger({ className }),
      ...otherProps,
    },
  });
}

export type TaskStatusMenuContentProps = DropdownMenuContentProps;
export function TaskStatusMenuContent({ className, ...props }: TaskStatusMenuContentProps) {
  const theme = useThemeFamily();
  const { statusMenuContent } = tasks({ theme });
  return (
    <DropdownMenuContent
      data-slot="task-status-menu-content"
      className={statusMenuContent({ className })}
      {...props}
    />
  );
}

export type TaskStatusMenuItemProps = DropdownMenuRadioItemProps;
export function TaskStatusMenuItem({ className, ...props }: TaskStatusMenuItemProps) {
  const theme = useThemeFamily();
  const { statusMenuItem } = tasks({ theme });
  return (
    <DropdownMenuRadioItem
      data-slot="task-status-menu-item"
      className={statusMenuItem({ className })}
      {...props}
    />
  );
}

type CollapsibleRootProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};

export type TaskSectionProps = CollapsibleRootProps;
export function TaskSection({ className, render, ...props }: TaskSectionProps) {
  const theme = useThemeFamily();
  const { section } = tasks({ theme });
  return (
    <Collapsible.Root
      data-slot="task-section"
      className={section({ className })}
      render={render ?? <section />}
      {...props}
    />
  );
}

type CollapsibleTriggerProps = Omit<ComponentProps<typeof Collapsible.Trigger>, "className"> & {
  className?: string;
};

export type TaskSectionTriggerProps = CollapsibleTriggerProps;
export function TaskSectionTrigger({ className, ...props }: TaskSectionTriggerProps) {
  const theme = useThemeFamily();
  const { sectionTrigger } = tasks({ theme });
  return (
    <Collapsible.Trigger
      data-slot="task-section-trigger"
      className={sectionTrigger({ className })}
      {...props}
    />
  );
}

export type TaskSectionHeadingProps = SlotProps<"span">;
export function TaskSectionHeading(props: TaskSectionHeadingProps) {
  return useTaskSlot("sectionHeading", "task-section-heading", "span", props);
}
export type TaskSectionBadgeProps = SlotProps<"span"> & { tone: TaskStatusTone };
export function TaskSectionBadge({ tone, className, render, ...props }: TaskSectionBadgeProps) {
  const theme = useThemeFamily();
  const { sectionBadge } = tasks({ theme, tone });
  return useRender({
    defaultTagName: "span",
    render,
    props: {
      "data-slot": "task-section-badge",
      className: sectionBadge({ className }),
      ...props,
    },
  });
}
export type TaskSectionCountProps = SlotProps<"span">;
export function TaskSectionCount(props: TaskSectionCountProps) {
  return useTaskSlot("sectionCount", "task-section-count", "span", props);
}
export type TaskSectionChevronProps = SlotProps<"span">;
export function TaskSectionChevron(props: TaskSectionChevronProps) {
  return useTaskSlot("sectionChevron", "task-section-chevron", "span", props);
}

type CollapsiblePanelProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};

export type TaskSectionPanelProps = CollapsiblePanelProps;
export function TaskSectionPanel({ className, ...props }: TaskSectionPanelProps) {
  const theme = useThemeFamily();
  const { sectionPanel } = tasks({ theme });
  return (
    <Collapsible.Panel
      data-slot="task-section-panel"
      className={sectionPanel({ className })}
      {...props}
    />
  );
}

export type TaskSectionItemsProps = SlotProps<"div">;
export function TaskSectionItems(props: TaskSectionItemsProps) {
  return useTaskSlot("sectionItems", "task-section-items", "div", props);
}
export type TaskSectionEmptyProps = SlotProps<"div">;
export function TaskSectionEmpty(props: TaskSectionEmptyProps) {
  return useTaskSlot("sectionEmpty", "task-section-empty", "div", props);
}

export type TaskBoardRootProps = SlotProps<"div">;
export function TaskBoardRoot(props: TaskBoardRootProps) {
  return useTaskSlot("boardRoot", "task-board-root", "div", props);
}

export type TaskBoardColumnProps = CollapsibleRootProps;
export function TaskBoardColumn({ className, render, ...props }: TaskBoardColumnProps) {
  const theme = useThemeFamily();
  const { boardColumn } = tasks({ theme });
  return (
    <Collapsible.Root
      data-slot="task-board-column"
      className={boardColumn({ className })}
      render={render ?? <section />}
      {...props}
    />
  );
}

export type TaskBoardColumnTriggerProps = CollapsibleTriggerProps;
export function TaskBoardColumnTrigger({ className, ...props }: TaskBoardColumnTriggerProps) {
  const theme = useThemeFamily();
  const { boardColumnTrigger } = tasks({ theme });
  return (
    <Collapsible.Trigger
      data-slot="task-board-column-trigger"
      className={boardColumnTrigger({ className })}
      {...props}
    />
  );
}

export type TaskBoardColumnHeadingProps = SlotProps<"span">;
export function TaskBoardColumnHeading(props: TaskBoardColumnHeadingProps) {
  return useTaskSlot("boardColumnHeading", "task-board-column-heading", "span", props);
}
export type TaskBoardColumnBadgeProps = SlotProps<"span"> & { tone: TaskStatusTone };
export function TaskBoardColumnBadge({
  tone,
  className,
  render,
  ...props
}: TaskBoardColumnBadgeProps) {
  const theme = useThemeFamily();
  const { boardColumnBadge } = tasks({ theme, tone });
  return useRender({
    defaultTagName: "span",
    render,
    props: {
      "data-slot": "task-board-column-badge",
      className: boardColumnBadge({ className }),
      ...props,
    },
  });
}
export type TaskBoardColumnCountProps = SlotProps<"span">;
export function TaskBoardColumnCount(props: TaskBoardColumnCountProps) {
  return useTaskSlot("boardColumnCount", "task-board-column-count", "span", props);
}
export type TaskBoardColumnChevronProps = SlotProps<"span">;
export function TaskBoardColumnChevron(props: TaskBoardColumnChevronProps) {
  return useTaskSlot("boardColumnChevron", "task-board-column-chevron", "span", props);
}
export type TaskBoardColumnPanelProps = CollapsiblePanelProps;
export function TaskBoardColumnPanel({ className, ...props }: TaskBoardColumnPanelProps) {
  const theme = useThemeFamily();
  const { boardColumnPanel } = tasks({ theme });
  return (
    <Collapsible.Panel
      data-slot="task-board-column-panel"
      className={boardColumnPanel({ className })}
      {...props}
    />
  );
}
export type TaskBoardColumnItemsProps = SlotProps<"div">;
export function TaskBoardColumnItems(props: TaskBoardColumnItemsProps) {
  return useTaskSlot("boardColumnItems", "task-board-column-items", "div", props);
}
export type TaskBoardColumnEmptyProps = SlotProps<"div">;
export function TaskBoardColumnEmpty(props: TaskBoardColumnEmptyProps) {
  return useTaskSlot("boardColumnEmpty", "task-board-column-empty", "div", props);
}
export type TaskBoardColumnEmptyIdleProps = SlotProps<"span">;
export function TaskBoardColumnEmptyIdle(props: TaskBoardColumnEmptyIdleProps) {
  return useTaskSlot("boardColumnEmptyIdle", "task-board-column-empty-idle", "span", props);
}
export type TaskBoardColumnEmptyAllowedProps = SlotProps<"span">;
export function TaskBoardColumnEmptyAllowed(props: TaskBoardColumnEmptyAllowedProps) {
  return useTaskSlot("boardColumnEmptyAllowed", "task-board-column-empty-allowed", "span", props);
}
export type TaskBoardColumnEmptyBlockedProps = SlotProps<"span">;
export function TaskBoardColumnEmptyBlocked(props: TaskBoardColumnEmptyBlockedProps) {
  return useTaskSlot("boardColumnEmptyBlocked", "task-board-column-empty-blocked", "span", props);
}

export type TaskListRootProps = SlotProps<"div">;
export function TaskListRoot(props: TaskListRootProps) {
  return useTaskSlot("listRoot", "task-list-root", "div", props);
}

export type TaskCreateFieldsProps = SlotProps<"div">;

export type TaskCreateDialogProps = DialogProps;
export function TaskCreateDialog({
  disablePointerDismissal = true,
  ...props
}: TaskCreateDialogProps) {
  return <Dialog disablePointerDismissal={disablePointerDismissal} {...props} />;
}

export type TaskCreateDialogContentProps = DialogContentProps;
export function TaskCreateDialogContent({
  className,
  overlay,
  ...props
}: TaskCreateDialogContentProps) {
  const theme = useThemeFamily();
  const { createDialogContent, createDialogOverlay } = tasks({ theme });
  const resolvedOverlay =
    overlay === false
      ? false
      : {
          ...overlay,
          className: createDialogOverlay({ className: overlay?.className }),
        };
  return (
    <DialogContent
      data-slot="task-create-dialog-content"
      className={createDialogContent({ className })}
      overlay={resolvedOverlay}
      {...props}
    />
  );
}

export type TaskCreateDialogHeaderProps = SlotProps<"div">;
export function TaskCreateDialogHeader(props: TaskCreateDialogHeaderProps) {
  return useTaskSlot("createDialogHeader", "task-create-dialog-header", "div", props);
}

export type TaskCreateDialogTitleProps = DialogTitleProps;
export function TaskCreateDialogTitle({ className, ...props }: TaskCreateDialogTitleProps) {
  const theme = useThemeFamily();
  const { createDialogTitle } = tasks({ theme });
  return (
    <DialogTitle
      data-slot="task-create-dialog-title"
      className={createDialogTitle({ className })}
      {...props}
    />
  );
}

export type TaskCreateDialogFormProps = SlotProps<"form">;
export function TaskCreateDialogForm(props: TaskCreateDialogFormProps) {
  return useTaskSlot("createDialogForm", "task-create-dialog-form", "form", props);
}

export type TaskCreateDialogErrorProps = SlotProps<"div">;
export function TaskCreateDialogError(props: TaskCreateDialogErrorProps) {
  return useTaskSlot("createDialogError", "task-create-dialog-error", "div", {
    role: "alert",
    ...props,
  });
}

export type TaskCreateBodyProps = SlotProps<"div">;
export function TaskCreateBody(props: TaskCreateBodyProps) {
  return useTaskSlot("createBody", "task-create-body", "div", props);
}

export function TaskCreateFields(props: TaskCreateFieldsProps) {
  return useTaskSlot("createFields", "task-create-fields", "div", props);
}
export type TaskCreateFieldRowProps = SlotProps<"div">;
export function TaskCreateFieldRow(props: TaskCreateFieldRowProps) {
  return useTaskSlot("createFieldRow", "task-create-field-row", "div", props);
}
export type TaskCreateCloseActionProps = SlotProps<"button">;
export function TaskCreateCloseAction(props: TaskCreateCloseActionProps) {
  return useTaskSlot("createCloseAction", "task-create-close-action", "button", {
    type: "button",
    ...props,
  });
}
export type TaskCreateRemoveActionProps = SlotProps<"button">;
export function TaskCreateRemoveAction(props: TaskCreateRemoveActionProps) {
  return useTaskSlot("createRemoveAction", "task-create-remove-action", "button", {
    type: "button",
    ...props,
  });
}
export type TaskCreateAddActionProps = SlotProps<"button">;
export function TaskCreateAddAction(props: TaskCreateAddActionProps) {
  return useTaskSlot("createAddAction", "task-create-add-action", "button", {
    type: "button",
    ...props,
  });
}
export type TaskCreateActionProps = SlotProps<"button"> & {
  tone?: "accent" | "default";
};
export function TaskCreateAction({
  tone = "default",
  className,
  render,
  ...props
}: TaskCreateActionProps) {
  const theme = useThemeFamily();
  const { createAction } = tasks({ theme, actionTone: tone });
  return useRender({
    defaultTagName: "button",
    render,
    props: {
      type: "button",
      "data-slot": "task-create-action",
      className: createAction({ className }),
      ...props,
    },
  });
}
export type TaskCreateFooterProps = SlotProps<"div">;
export function TaskCreateFooter(props: TaskCreateFooterProps) {
  return useTaskSlot("createFooter", "task-create-footer", "div", props);
}
