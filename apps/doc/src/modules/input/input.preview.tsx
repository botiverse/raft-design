import { Input } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";

type PlaygroundValues = {
  disabled: boolean;
  invalid: boolean;
  placeholder: string;
  suppressPasswordManager: boolean;
};

export function InputPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        disabled: false,
        invalid: false,
        placeholder: "you@example.com",
        suppressPasswordManager: false,
      }}
      controls={[
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "invalid", label: "Invalid", type: "boolean" },
        { name: "placeholder", label: "Placeholder", type: "text" },
        {
          name: "suppressPasswordManager",
          label: "Suppress PM",
          type: "boolean",
        },
      ]}
      render={(values) => (
        <Input
          className="w-80"
          placeholder={values.placeholder}
          disabled={values.disabled}
          aria-invalid={values.invalid || undefined}
          suppressPasswordManager={values.suppressPasswordManager}
        />
      )}
    />
  );
}
