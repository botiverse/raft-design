import { TextareaDefaultShellComposition } from "./textarea/default-shell-composition.tsx";
import { TextareaDisabledStylingComposition } from "./textarea/disabled-styling-composition.tsx";
import { TextareaInvalidStateComposition } from "./textarea/invalid-state-composition.tsx";
import { TextareaWrapperApiComposition } from "./textarea/wrapper-api-composition.tsx";

export const TEXTAREA_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  DefaultShell: "apps/doc/src/compositions/textarea/default-shell-composition.tsx",
  DisabledStyling: "apps/doc/src/compositions/textarea/disabled-styling-composition.tsx",
  InvalidState: "apps/doc/src/compositions/textarea/invalid-state-composition.tsx",
  WrapperApi: "apps/doc/src/compositions/textarea/wrapper-api-composition.tsx",
} as const;

export const TEXTAREA_SOURCE_COMPARISON_COMPOSITION = {
  DefaultShell: TextareaDefaultShellComposition,
  DisabledStyling: TextareaDisabledStylingComposition,
  InvalidState: TextareaInvalidStateComposition,
  WrapperApi: TextareaWrapperApiComposition,
} as const;
