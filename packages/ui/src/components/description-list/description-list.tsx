import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const descriptionList = tv({
  slots: {
    root: ["m-0"],
    item: [""],
    term: ["mb-1 flex items-center gap-2 text-xs"],
    details: ["m-0 text-sm"],
    action: ["inline-flex shrink-0 items-center", "[&_svg]:size-3 [&_svg]:shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        term: "text-foreground/50",
        details: "text-foreground-strong",
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type DescriptionListProps = useRender.ComponentProps<"dl">;

export function DescriptionList({ className, render, ...props }: DescriptionListProps) {
  const { root } = descriptionList();
  const defaultProps: useRender.ElementProps<"dl"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "dl",
    render,
    props: mergeProps<"dl">(defaultProps, props),
    state: {
      slot: "description-list",
    },
  });
}

export type DescriptionItemProps = useRender.ComponentProps<"div">;

export function DescriptionItem({ className, render, ...props }: DescriptionItemProps) {
  const { item } = descriptionList();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: item({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "description-item",
    },
  });
}

export type DescriptionTermProps = useRender.ComponentProps<"dt">;

export function DescriptionTerm({ className, render, ...props }: DescriptionTermProps) {
  const theme = useTheme();
  const { term } = descriptionList({ theme });
  const defaultProps: useRender.ElementProps<"dt"> = {
    className: term({ className }),
  };

  return useRender({
    defaultTagName: "dt",
    render,
    props: mergeProps<"dt">(defaultProps, props),
    state: {
      slot: "description-term",
    },
  });
}

export type DescriptionDetailsProps = useRender.ComponentProps<"dd">;

export function DescriptionDetails({ className, render, ...props }: DescriptionDetailsProps) {
  const theme = useTheme();
  const { details } = descriptionList({ theme });
  const defaultProps: useRender.ElementProps<"dd"> = {
    className: details({ className }),
  };

  return useRender({
    defaultTagName: "dd",
    render,
    props: mergeProps<"dd">(defaultProps, props),
    state: {
      slot: "description-details",
    },
  });
}

export type DescriptionActionProps = useRender.ComponentProps<"span">;

export function DescriptionAction({ className, render, ...props }: DescriptionActionProps) {
  const { action } = descriptionList();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "description-action",
    },
  });
}
