import { FileText } from "lucide-react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
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
  /** Docs preview chrome. Shell hosts (Playground) leave this off. */
  framed?: boolean;
};

export function LegacyTaskPanelRoot({
  className,
  framed = false,
  render,
  children,
  ...props
}: LegacyTaskPanelRootProps) {
  const theme = useThemeFamily();
  const { frame } = legacyTaskPanel({ theme, framed });

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

export function LegacyTaskPanelHeader({ className, ...props }: LegacyTaskPanelHeaderProps) {
  return (
    <ThreadPanelHeader data-slot="legacy-task-panel-header" className={className} {...props} />
  );
}

export type LegacyTaskPanelIconProps = useRender.ComponentProps<"div">;

export function LegacyTaskPanelIcon({
  className,
  render,
  children,
  ...props
}: LegacyTaskPanelIconProps) {
  const theme = useThemeFamily();
  const { icon } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelTitle({ className, ...props }: LegacyTaskPanelTitleProps) {
  const theme = useThemeFamily();
  const { title } = legacyTaskPanel({ theme });
  return (
    <ThreadPanelTitle
      data-slot="legacy-task-panel-title"
      className={title({ className })}
      {...props}
    />
  );
}

export type LegacyTaskPanelTitleMetaProps = useRender.ComponentProps<"span">;

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

export function LegacyTaskPanelActions({ className, ...props }: LegacyTaskPanelActionsProps) {
  return (
    <ThreadPanelActions data-slot="legacy-task-panel-actions" className={className} {...props} />
  );
}

export type LegacyTaskPanelBodyProps = useRender.ComponentProps<"div">;

export function LegacyTaskPanelBody({ className, children, ...props }: LegacyTaskPanelBodyProps) {
  const theme = useThemeFamily();
  const { body } = legacyTaskPanel({ theme });

  return (
    <ThreadPanelContent data-slot="legacy-task-panel-content" {...props}>
      <ThreadPanelBody data-slot="legacy-task-panel-body" className={body({ className })}>
        {children}
      </ThreadPanelBody>
    </ThreadPanelContent>
  );
}

export type LegacyTaskPanelStatusProps = useRender.ComponentProps<"div">;

export function LegacyTaskPanelStatus({ className, render, ...props }: LegacyTaskPanelStatusProps) {
  const theme = useThemeFamily();
  const { status } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelSection({
  className,
  render,
  ...props
}: LegacyTaskPanelSectionProps) {
  const theme = useThemeFamily();
  const { section } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelField({ className, render, ...props }: LegacyTaskPanelFieldProps) {
  const theme = useThemeFamily();
  const { field } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelFieldLabel({
  className,
  render,
  ...props
}: LegacyTaskPanelFieldLabelProps) {
  const theme = useThemeFamily();
  const { fieldLabel } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelFieldTitle({
  className,
  render,
  ...props
}: LegacyTaskPanelFieldTitleProps) {
  const theme = useThemeFamily();
  const { fieldTitle } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelFieldText({
  className,
  render,
  ...props
}: LegacyTaskPanelFieldTextProps) {
  const theme = useThemeFamily();
  const { fieldText } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelMeta({ className, render, ...props }: LegacyTaskPanelMetaProps) {
  const theme = useThemeFamily();
  const { meta } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelMetaRow({
  className,
  render,
  ...props
}: LegacyTaskPanelMetaRowProps) {
  const theme = useThemeFamily();
  const { metaRow } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelMetaLabel({
  className,
  render,
  ...props
}: LegacyTaskPanelMetaLabelProps) {
  const theme = useThemeFamily();
  const { metaLabel } = legacyTaskPanel({ theme });
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

export function LegacyTaskPanelMetaValue({
  className,
  render,
  ...props
}: LegacyTaskPanelMetaValueProps) {
  const theme = useThemeFamily();
  const { metaValue } = legacyTaskPanel({ theme });
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
