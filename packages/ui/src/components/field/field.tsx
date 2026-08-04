import { Field as BaseField } from "@base-ui/react/field";
import { tv, type VariantProps } from "../../lib/tv";
import { LabelAsterisk, LabelOptional } from "../label/label";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const field = tv({
  slots: {
    root: ["group/field flex flex-col gap-1.5"],
    item: ["group/field-item flex items-start gap-2", "[&>[data-slot=checkbox]]:mt-px"],
    label: ["block leading-none", "group-data-[disabled]/field:text-foreground-disabled"],
    description: ["text-xs leading-5", "group-data-[disabled]/field:text-foreground-disabled"],
    error: ["text-xs leading-5", "group-data-[disabled]/field:text-foreground-disabled"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["gap-1"],
        label: ["font-bold text-foreground"],
        description: ["text-foreground-strong/50"],
        error: ["text-danger"],
      },
      elegant: {
        label: ["font-medium text-foreground-strong dark:text-foreground-hint"],
        description: [
          "text-[13px] text-foreground-hint",
          "group-data-[disabled]/field:text-foreground-disabled",
        ],
        error: ["text-[13px] text-danger"],
      },
    },
    size: {
      sm: { label: "text-xs" },
      md: { label: "text-sm" },
    },
  },
  compoundVariants: [
    { theme: "brutal", size: "sm", class: { label: "text-foreground-strong/60" } },
  ],
  defaultVariants: {
    size: "md",
  },
});

export type FieldProps = StyledProps<BaseField.Root.Props>;

export function Field({ className, ...props }: FieldProps) {
  const theme = useThemeFamily();
  const { root } = field({ theme });
  return <BaseField.Root data-slot="field" className={root({ className })} {...props} />;
}

export type FieldItemProps = StyledProps<BaseField.Item.Props>;

export function FieldItem({ className, ...props }: FieldItemProps) {
  const theme = useThemeFamily();
  const { item } = field({ theme });
  return <BaseField.Item data-slot="field-item" className={item({ className })} {...props} />;
}

type LabelMarker =
  | { required?: boolean; optional?: never }
  | { optional?: boolean; required?: never };

export type FieldLabelProps = StyledProps<BaseField.Label.Props> &
  Omit<VariantProps<typeof field>, "theme"> &
  LabelMarker;

export function FieldLabel({
  size,
  required,
  optional,
  className,
  children,
  ...props
}: FieldLabelProps) {
  const theme = useThemeFamily();
  const { label } = field({ theme, size });
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
  const theme = useThemeFamily();
  const { description } = field({ theme });
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
  const theme = useThemeFamily();
  const { error } = field({ theme });
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
