import { InputGroup, InputGroupAddon, InputGroupInput } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";

type PlaygroundValues = {
  addonVariant: "default" | "container";
  disabled: boolean;
  invalid: boolean;
  placeholder: string;
};

export function InputGroupPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        addonVariant: "container",
        disabled: false,
        invalid: false,
        placeholder: "Default",
      }}
      controls={[
        {
          name: "addonVariant",
          label: "Addon",
          type: "select",
          options: ["default", "container"],
        },
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "invalid", label: "Invalid", type: "boolean" },
        { name: "placeholder", label: "Placeholder", type: "text" },
      ]}
      render={(values) => (
        <InputGroup className="w-96">
          <InputGroupAddon.Text variant={values.addonVariant}>https://</InputGroupAddon.Text>
          <InputGroupInput
            placeholder={values.placeholder}
            disabled={values.disabled}
            aria-invalid={values.invalid || undefined}
          />
          <InputGroupAddon.Text align="inline-end" variant={values.addonVariant}>
            .com
          </InputGroupAddon.Text>
        </InputGroup>
      )}
    />
  );
}
