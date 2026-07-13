import { Checkbox, type CheckboxProps } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { SIZES, VARIANTS } from "./checkbox.constants.ts";

type PlaygroundValues = {
  size: NonNullable<CheckboxProps["size"]>;
  variant: NonNullable<CheckboxProps["variant"]>;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
};

export function CheckboxPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        size: "sm",
        variant: "default",
        checked: true,
        indeterminate: false,
        disabled: false,
      }}
      controls={[
        { name: "size", label: "Size", type: "select", options: SIZES },
        { name: "variant", label: "Variant", type: "select", options: VARIANTS },
        { name: "checked", label: "Checked", type: "boolean" },
        { name: "indeterminate", label: "Indeterminate", type: "boolean" },
        { name: "disabled", label: "Disabled", type: "boolean" },
      ]}
      render={(values) => (
        <Checkbox
          size={values.size}
          variant={values.variant}
          checked={values.checked}
          indeterminate={values.indeterminate}
          disabled={values.disabled}
        />
      )}
    />
  );
}
