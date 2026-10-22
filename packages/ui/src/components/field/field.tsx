import { Field as BaseField } from "@base-ui/react/field";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { LabelAsterisk, LabelOptional } from "../label/label";
import type { StyledProps } from "../../lib/styled-props";

const field = tv({
  slots: {
    root: ["group/field flex flex-col gap-1.5"],
    // A control centers on the FIRST line of its label, with or without a
    // description and however many lines the label takes. The offset is half
    // the difference between that line and the control, derived from the
    // item's own line height rather than hand-tuned: (1lh - control) / 2,
    // which is why a 30px switch and a 20px box each get their own term
    // (Alignment: a control and its label). Centering on the line box is
    // optical centering in Space Grotesk - cap centre and line-box centre sit
    // 0.004em apart, under 0.1px at any size we set - so there is nothing left
    // to nudge, and a hand-tuned margin means the control was aligned to the
    // wrong thing. The offset goes on both sides, so the control's box is
    // one line tall, as in a <label> row. A control taller than the line (a
    // 30px switch, or a 20px box beside an 18px line) is never squeezed: the
    // row pads by its overhang, so a one-line row is the control's height
    // with the label centred on it.
    item: [
      "group/field-item flex items-start gap-2",
      "*:min-w-0",
      "*:data-[slot=checkbox]:my-[calc((1lh-1.25rem)/2)]",
      "*:data-[slot=radio-group-item]:my-[calc((1lh-1.25rem)/2)]",
      "*:data-[slot=switch]:my-[calc((1lh-1.875rem)/2)]",
      "has-[>[data-slot=switch]]:[--field-control:1.875rem]",
      "has-[>[data-slot=checkbox],>[data-slot=radio-group-item]]:[--field-control:1.25rem]",
      "py-[max(0px,calc((var(--field-control,0px)-1lh)/2))]",
    ],
    label: [
      "block wrap-anywhere",
      "group-data-disabled/field:text-foreground-disabled",
      "font-sans font-semibold text-foreground-muted",
    ],
    description: [
      "wrap-anywhere",
      "group-data-disabled/field:text-foreground-disabled",
      "text-caption text-foreground-hint",
    ],
    error: [
      "wrap-anywhere",
      "group-data-disabled/field:text-foreground-disabled",
      "text-caption font-semibold text-danger-strong",
    ],
  },
  variants: {
    // The item takes the label's type so `1lh` above is the label's line, not
    // whatever line height the item happened to inherit.
    size: {
      sm: { item: ["text-caption"], label: ["text-caption font-semibold"] },
      md: { item: ["text-footnote"], label: ["text-footnote font-semibold"] },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type FieldProps = StyledProps<BaseField.Root.Props>;

export function Field({ className, ...props }: FieldProps) {
  const { root } = field();
  return <BaseField.Root data-slot="field" className={root({ className })} {...props} />;
}

export type FieldItemProps = StyledProps<BaseField.Item.Props> & VariantProps<typeof field>;

export function FieldItem({ size, className, ...props }: FieldItemProps) {
  const { item } = field({ size });
  return <BaseField.Item data-slot="field-item" className={item({ className })} {...props} />;
}

type LabelMarker =
  | { required?: boolean; optional?: never }
  | { optional?: boolean; required?: never };

export type FieldLabelProps = StyledProps<BaseField.Label.Props> &
  VariantProps<typeof field> &
  LabelMarker;

export function FieldLabel({
  size,
  required,
  optional,
  className,
  children,
  ...props
}: FieldLabelProps) {
  const { label } = field({ size });
  return (
    <BaseField.Label data-slot="field-label" className={label({ className })} {...props}>
      {children}
      {required ? <LabelAsterisk className="ml-1" /> : null}
      {optional ? <LabelOptional className="ml-1" /> : null}
    </BaseField.Label>
  );
}

export type FieldDescriptionProps = StyledProps<BaseField.Description.Props>;

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  const { description } = field();
  return (
    <BaseField.Description
      data-slot="field-description"
      className={description({ className })}
      {...props}
    />
  );
}

export type FieldErrorProps = StyledProps<BaseField.Error.Props>;

export function FieldError({ className, role = "alert", ...props }: FieldErrorProps) {
  const { error } = field();
  return (
    <BaseField.Error
      data-slot="field-error"
      role={role}
      className={error({ className })}
      {...props}
    />
  );
}

export type FieldControlProps = BaseField.Control.Props;

export function FieldControl(props: FieldControlProps) {
  return <BaseField.Control data-slot="field-control" {...props} />;
}

export type FieldValidityProps = BaseField.Validity.Props;

export function FieldValidity(props: FieldValidityProps) {
  return <BaseField.Validity {...props} />;
}
