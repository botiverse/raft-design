import { FileText } from "lucide-react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import {
  ThreadPanelActions,
  ThreadPanelBody,
  ThreadPanelContent,
  ThreadPanelHeader,
  ThreadPanelRoot,
  ThreadPanelTitle,
  ThreadPanelTitleMeta,
} from "../thread-panel/thread-panel";
import { legacyTaskPanel } from "./legacy-task-panel.recipe";

export type LegacyTaskPanelRootProps = useRender.ComponentProps<"div"> & {
  /** Docs preview chrome. A host shell that draws its own frame leaves this off. */
  framed?: boolean;
};

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelRoot({
  className,
  framed = false,
  render,
  children,
  ...props
}: LegacyTaskPanelRootProps) {
  if (!framed) {
    return (
      <ThreadPanelRoot
        data-slot="legacy-task-panel-root"
        className={className}
        render={render}
        {...props}
      >
        {children}
      </ThreadPanelRoot>
    );
  }

  return (
    <LegacyTaskPanelFrame className={className} render={render} {...props}>
      {children}
    </LegacyTaskPanelFrame>
  );
}

function LegacyTaskPanelFrame({
  className,
  render,
  children,
  ...props
}: useRender.ComponentProps<"div">) {
  const { frame } = legacyTaskPanel({ framed: true });

  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "legacy-task-panel-frame",
    className: frame({ className }),
    children: <ThreadPanelRoot data-slot="legacy-task-panel-root">{children}</ThreadPanelRoot>,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type LegacyTaskPanelHeaderProps = useRender.ComponentProps<"div">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelHeader({ className, ...props }: LegacyTaskPanelHeaderProps) {
  return (
    <ThreadPanelHeader data-slot="legacy-task-panel-header" className={className} {...props} />
  );
}

export type LegacyTaskPanelIconProps = useRender.ComponentProps<"div">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelIcon({
  className,
  render,
  children,
  ...props
}: LegacyTaskPanelIconProps) {
  const { icon } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "legacy-task-panel-icon",
    className: icon({ className }),
    children: children ?? <FileText aria-hidden size={18} />,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type LegacyTaskPanelTitleProps = useRender.ComponentProps<"h2">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelTitle({ className, ...props }: LegacyTaskPanelTitleProps) {
  const { title } = legacyTaskPanel();
  return (
    <ThreadPanelTitle
      data-slot="legacy-task-panel-title"
      className={title({ className })}
      {...props}
    />
  );
}

export type LegacyTaskPanelTitleMetaProps = useRender.ComponentProps<"span">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelTitleMeta({ className, ...props }: LegacyTaskPanelTitleMetaProps) {
  return (
    <ThreadPanelTitleMeta
      data-slot="legacy-task-panel-title-meta"
      className={className}
      {...props}
    />
  );
}

export type LegacyTaskPanelActionsProps = useRender.ComponentProps<"div">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelActions({ className, ...props }: LegacyTaskPanelActionsProps) {
  return (
    <ThreadPanelActions data-slot="legacy-task-panel-actions" className={className} {...props} />
  );
}

export type LegacyTaskPanelBodyProps = useRender.ComponentProps<"div">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelBody({ className, children, ...props }: LegacyTaskPanelBodyProps) {
  const { body } = legacyTaskPanel();

  return (
    <ThreadPanelContent data-slot="legacy-task-panel-content" {...props}>
      <ThreadPanelBody data-slot="legacy-task-panel-body" className={body({ className })}>
        {children}
      </ThreadPanelBody>
    </ThreadPanelContent>
  );
}

export type LegacyTaskPanelStatusProps = useRender.ComponentProps<"div">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelStatus({ className, render, ...props }: LegacyTaskPanelStatusProps) {
  const { status } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "legacy-task-panel-status",
    className: status({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type LegacyTaskPanelSectionProps = useRender.ComponentProps<"section">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelSection({
  className,
  render,
  ...props
}: LegacyTaskPanelSectionProps) {
  const { section } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"section"> = {
    "data-slot": "legacy-task-panel-section",
    className: section({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type LegacyTaskPanelFieldProps = useRender.ComponentProps<"div">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelField({ className, render, ...props }: LegacyTaskPanelFieldProps) {
  const { field } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "legacy-task-panel-field",
    className: field({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type LegacyTaskPanelFieldLabelProps = useRender.ComponentProps<"p">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelFieldLabel({
  className,
  render,
  ...props
}: LegacyTaskPanelFieldLabelProps) {
  const { fieldLabel } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"p"> = {
    "data-slot": "legacy-task-panel-field-label",
    className: fieldLabel({ className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type LegacyTaskPanelFieldTitleProps = useRender.ComponentProps<"h3">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelFieldTitle({
  className,
  render,
  ...props
}: LegacyTaskPanelFieldTitleProps) {
  const { fieldTitle } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"h3"> = {
    "data-slot": "legacy-task-panel-field-title",
    className: fieldTitle({ className }),
  };

  return useRender({
    defaultTagName: "h3",
    render,
    props: mergeProps<"h3">(defaultProps, props),
  });
}

export type LegacyTaskPanelFieldTextProps = useRender.ComponentProps<"p">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelFieldText({
  className,
  render,
  ...props
}: LegacyTaskPanelFieldTextProps) {
  const { fieldText } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"p"> = {
    "data-slot": "legacy-task-panel-field-text",
    className: fieldText({ className }),
  };

  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(defaultProps, props),
  });
}

export type LegacyTaskPanelMetaProps = useRender.ComponentProps<"section">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelMeta({ className, render, ...props }: LegacyTaskPanelMetaProps) {
  const { meta } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"section"> = {
    "data-slot": "legacy-task-panel-meta",
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(defaultProps, props),
  });
}

export type LegacyTaskPanelMetaRowProps = useRender.ComponentProps<"div">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelMetaRow({
  className,
  render,
  ...props
}: LegacyTaskPanelMetaRowProps) {
  const { metaRow } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "legacy-task-panel-meta-row",
    className: metaRow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type LegacyTaskPanelMetaLabelProps = useRender.ComponentProps<"span">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelMetaLabel({
  className,
  render,
  ...props
}: LegacyTaskPanelMetaLabelProps) {
  const { metaLabel } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "legacy-task-panel-meta-label",
    className: metaLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type LegacyTaskPanelMetaValueProps = useRender.ComponentProps<"span">;

/** @deprecated No consumer uses it; compose read-only task details from Dialog and DescriptionList. Removed in raft-ui 1.0. */
export function LegacyTaskPanelMetaValue({
  className,
  render,
  ...props
}: LegacyTaskPanelMetaValueProps) {
  const { metaValue } = legacyTaskPanel();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "legacy-task-panel-meta-value",
    className: metaValue({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
