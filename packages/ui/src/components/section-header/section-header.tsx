import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants/lite";
import { SectionLabel, type SectionLabelProps } from "../section-label/section-label.tsx";

const sectionHeader = tv({
  slots: {
    root: ["flex items-center justify-between gap-2"],
    content: ["flex min-w-0 items-center gap-2"],
    icon: ["shrink-0 text-foreground/60", "[&_svg]:size-4 [&_svg]:shrink-0"],
    count: ["ml-2 font-mono text-foreground/40"],
    actions: ["flex shrink-0 items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {},
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type SectionHeaderProps = useRender.ComponentProps<"div">;

export function SectionHeader({ className, render, ...props }: SectionHeaderProps) {
  const { root } = sectionHeader();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "section-header",
    },
  });
}

export type SectionHeaderContentProps = useRender.ComponentProps<"div">;

export function SectionHeaderContent({ className, render, ...props }: SectionHeaderContentProps) {
  const { content } = sectionHeader();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "section-header-content",
    },
  });
}

export type SectionHeaderIconProps = useRender.ComponentProps<"span">;

export function SectionHeaderIcon({ className, render, ...props }: SectionHeaderIconProps) {
  const { icon } = sectionHeader();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: icon({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "section-header-icon",
    },
  });
}

export type SectionHeaderTitleProps = SectionLabelProps;

export function SectionHeaderTitle({ render, ...props }: SectionHeaderTitleProps) {
  return <SectionLabel render={render ?? <div />} {...props} data-slot="section-header-title" />;
}

export type SectionHeaderCountProps = useRender.ComponentProps<"span">;

export function SectionHeaderCount({ className, render, ...props }: SectionHeaderCountProps) {
  const { count } = sectionHeader();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: count({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "section-header-count",
    },
  });
}

export type SectionHeaderActionsProps = useRender.ComponentProps<"div">;

export function SectionHeaderActions({ className, render, ...props }: SectionHeaderActionsProps) {
  const { actions } = sectionHeader();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "section-header-actions",
    },
  });
}
