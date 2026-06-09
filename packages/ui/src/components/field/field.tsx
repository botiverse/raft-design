import { Field as BaseField } from "@base-ui/react/field";
import { tv, type VariantProps } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const field = tv({
  slots: {
    root: ["group/field flex flex-col gap-1"],
    item: ["group/field-item flex items-start gap-2"],
    label: ["block font-bold"],
    description: ["text-xs"],
    error: ["text-xs font-bold"],
  },
  variants: {
    theme: {
      brutal: {
        label: ["text-black"],
        description: ["text-black/50"],
        error: ["text-brutal-red"],
      },
      elegant: {
        root: ["gap-2"],
        label: ["font-medium text-[var(--input-foreground)]"],
        description: ["tracking-[0.01em] text-[var(--input-placeholder)]"],
        error: ["font-medium text-destructive"],
      },
    },
    size: {
      sm: { label: "text-xs" },
      md: { label: "text-sm" },
    },
  },
  // The small/dense label is also dimmed; only meaningful under brutal.
  compoundVariants: [{ theme: "brutal", size: "sm", class: { label: "text-black/60" } }],
  defaultVariants: {
    size: "md",
  },
});

export type FieldProps = StyledProps<BaseField.Root.Props>;

export function Field({ className, ...props }: FieldProps) {
  const theme = useTheme();
  const { root } = field({ theme });
  return <BaseField.Root data-slot="field" className={root({ className })} {...props} />;
}

export type FieldItemProps = StyledProps<BaseField.Item.Props>;

export function FieldItem({ className, ...props }: FieldItemProps) {
  const theme = useTheme();
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
  const theme = useTheme();
  const { label } = field({ theme, size });
  return (
    <BaseField.Label data-slot="field-label" className={label({ className })} {...props}>
      {children}
      {required ? <span className="ml-1 text-accent">*</span> : null}
      {optional ? <span className="ml-1 normal-case text-muted-foreground">(optional)</span> : null}
    </BaseField.Label>
  );
}

export type FieldDescriptionProps = StyledProps<BaseField.Description.Props>;

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  const theme = useTheme();
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
  const theme = useTheme();
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
