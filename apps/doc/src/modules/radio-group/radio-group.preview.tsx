import { ComponentPlayground } from "#/components/component-playground.tsx";
import { RadioGroupReferralSourceComposition } from "./compositions/referral-source.composition.tsx";

type RadioGroupPreviewProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function RadioGroupPreview({ value, onValueChange }: RadioGroupPreviewProps) {
  return (
    <ComponentPlayground
      defaultValues={{ disabled: false }}
      controls={[{ name: "disabled", label: "Disabled", type: "boolean" }]}
      render={(values) => (
        <RadioGroupReferralSourceComposition
          value={value}
          onValueChange={onValueChange}
          disabled={values.disabled}
        />
      )}
    />
  );
}
