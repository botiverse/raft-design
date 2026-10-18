import { Field as BaseField } from "@base-ui/react/field";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { LabelAsterisk, LabelOptional } from "../label/label";
import type { StyledProps } from "../../lib/styled-props";

const field = tv({
  slots: {
    root: ["group/field flex flex-col gap-1.5"],
    item: ["group/field-item flex items-start gap-2", "*:data-[slot=checkbox]:mt-px"],
    label: [
      "block leading-none",
      "group-data-disabled/field:text-foreground-disabled",
      "font-sans font-semibold text-foreground-muted",
    ],
    description: [
      "group-data-disabled/field:text-foreground-disabled",
      "text-caption text-foreground-hint",
    ],
    error: [
      "group-data-disabled/field:text-foreground-disabled",
      "text-caption font-semibold text-danger-strong",
    ],
  },
  variants: {
    size: {
      sm: { label: ["text-caption font-semibold"] },
      md: { label: ["text-footnote font-semibold"] },
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

export type FieldItemProps = StyledProps<BaseField.Item.Props>;

export function FieldItem({ className, ...props }: FieldItemProps) {
  const { item } = field();
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
