import type { ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants";
import { SectionEyebrow } from "../section-eyebrow/section-eyebrow.tsx";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Eyebrow label + optional count badge + optional trailing action. Pure layout
// that composes SectionEyebrow so the eyebrow token stays canonical.
const sectionHeader = tv({
  slots: {
    root: ["flex items-center justify-between gap-2"],
    labelWrap: ["flex min-w-0 items-center gap-2"],
    icon: ["shrink-0 text-black/60"],
    count: ["ml-2 font-mono text-black/40"],
    action: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {},
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type SectionHeaderProps = Omit<useRender.ComponentProps<"div">, "children"> & {
  label: ReactNode;
  icon?: ReactNode;
  count?: number | null;
  action?: ReactNode;
  /** When set, the eyebrow becomes a `<label htmlFor>` for the region's control. */
  htmlFor?: string;
};

export function SectionHeader({
  label,
  icon,
  count,
  action,
  htmlFor,
  className,
  render,
  ref,
  ...props
}: SectionHeaderProps) {
  const theme = useTheme();
  const {
    root,
    labelWrap,
    icon: iconSlot,
    count: countSlot,
    action: actionSlot,
  } = sectionHeader({
    theme,
  });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
    children: (
      <>
        <div className={labelWrap()}>
          {icon ? <span className={iconSlot()}>{icon}</span> : null}
          <SectionEyebrow as={htmlFor ? "label" : "div"} htmlFor={htmlFor}>
            {label}
            {typeof count === "number" && count >= 0 ? (
              <span className={countSlot()}>{count}</span>
            ) : null}
          </SectionEyebrow>
        </div>
        {action ? <div className={actionSlot()}>{action}</div> : null}
      </>
    ),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "section-header",
    },
  });
}
