import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Badge } from "../badge";

const formSection = tv({
  slots: {
    root: ["flex flex-col"],
    head: ["flex min-w-0 flex-col"],
    titleRow: ["flex min-w-0 items-center gap-2"],
    title: ["m-0 min-w-0 flex-1"],
    description: ["m-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "gap-3 py-4 [[data-slot=form-section]+&]:border-t-2 [[data-slot=form-section]+&]:border-black",
        ],
        title: ["font-heading text-sm font-bold uppercase"],
        description: ["text-xs text-foreground-muted"],
      },
      elegant: {
        root: [
          "gap-3 py-4 [[data-slot=form-section]+&]:border-t [[data-slot=form-section]+&]:border-line-muted",
        ],
        title: ["font-sans text-sm font-semibold text-foreground"],
        description: ["text-sm text-foreground-hint"],
      },
      // Raft DS `rf-drawer__section`: a small heading (13/18 700 ink-2), its
      // status as a quiet tag, a line on what the part is for, then its
      // fields 12px apart; sections sit 16px apart with a hairline between.
      raft: {
        root: [
          "gap-3 py-4",
          "[[data-slot=form-section]+&]:border-t [[data-slot=form-section]+&]:border-line-muted",
        ],
        head: ["gap-0.5"],
        title: ["font-sans text-footnote font-bold text-foreground-muted"],
        description: ["font-sans text-footnote text-foreground-hint"],
      },
    },
  },
});

export type FormSectionProps = Omit<useRender.ComponentProps<"section">, "title"> & {
  title: ReactNode;
  /** Where this part stands (Complete, Optional, Off …): a quiet tag. */
  status?: ReactNode;
  description?: ReactNode;
};

/**
 * One part of a bigger form (a wide dialog or sheet): a small heading with
 * its status and a line on what it is for, then its fields. Consecutive
 * sections are separated by a hairline.
 */
export function FormSection({
  className,
  render,
  title,
  status,
  description,
  children,
  ...props
}: FormSectionProps) {
  const theme = useThemeFamily();
  const slots = formSection({ theme });
  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(
      {
        "data-slot": "form-section",
        className: slots.root({ className }),
        children: (
          <>
            <div data-slot="form-section-head" className={slots.head()}>
              <div className={slots.titleRow()}>
                <h3 data-slot="form-section-title" className={slots.title()}>
                  {title}
                </h3>
                {status ? (
                  <Badge
                    appearance="soft"
                    variant="muted"
                    className="shrink-0"
                    data-slot="form-section-status"
                  >
                    {status}
                  </Badge>
                ) : null}
              </div>
              {description ? (
                <p data-slot="form-section-description" className={slots.description()}>
                  {description}
                </p>
              ) : null}
            </div>
            {children}
          </>
        ),
      } as never,
      props,
    ),
  });
}
