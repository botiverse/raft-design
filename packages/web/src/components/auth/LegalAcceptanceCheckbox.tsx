import { CURRENT_LEGAL_ACCEPTANCE } from "@slock-ai/shared";

import Checkbox from "../ui/Checkbox";

export default function LegalAcceptanceCheckbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-2.5 text-sm">
      <Checkbox
        size="md"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5"
      />
      <span className="leading-5 text-black/70">
        I agree to the{" "}
        <a
          href={CURRENT_LEGAL_ACCEPTANCE.termsUrl}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-black underline hover:text-brutal-pink"
        >
          Terms of Service
        </a>{" "}
        and acknowledge the{" "}
        <a
          href={CURRENT_LEGAL_ACCEPTANCE.privacyUrl}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-black underline hover:text-brutal-pink"
        >
          Privacy Policy
        </a>
        .
      </span>
    </label>
  );
}
