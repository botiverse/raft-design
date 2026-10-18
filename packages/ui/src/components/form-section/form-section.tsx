import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ReactNode } from "react";
import { tv } from "../../lib/tv";
import { Badge } from "../badge";

const formSection = tv({
  slots: {
    // Raft DS `rf-drawer__section`: a small heading (13/18 700 ink-2), its
    // status as a quiet tag, a line on what the part is for, then its fields
    // 12px apart; sections sit 16px apart with a hairline between, and the
    // first starts flush with the body.
    root: [
      "flex flex-col gap-3 py-4 first:pt-0",
      "[[data-slot=form-section]+&]:border-t [[data-slot=form-section]+&]:border-line-muted",
    ],
    head: ["flex min-w-0 flex-col", "gap-0.5"],
    titleRow: ["flex min-w-0 items-center gap-2"],
    title: ["m-0 min-w-0 flex-1", "font-sans text-footnote font-bold text-foreground-muted"],
    description: ["m-0", "font-sans text-footnote text-foreground-hint"],
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
  const slots = formSection();
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
