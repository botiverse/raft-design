import { TextareaDefaultShellComposition } from "./compositions/default-shell.composition.tsx";
import { TextareaDisabledStylingComposition } from "./compositions/disabled-styling.composition.tsx";
import { TextareaInvalidStateComposition } from "./compositions/invalid-state.composition.tsx";
import { TextareaWrapperApiComposition } from "./compositions/wrapper-api.composition.tsx";

export const TEXTAREA_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  DefaultShell: "apps/doc/src/modules/textarea/compositions/default-shell.composition.tsx",
  DisabledStyling: "apps/doc/src/modules/textarea/compositions/disabled-styling.composition.tsx",
  InvalidState: "apps/doc/src/modules/textarea/compositions/invalid-state.composition.tsx",
  WrapperApi: "apps/doc/src/modules/textarea/compositions/wrapper-api.composition.tsx",
} as const;

export const TEXTAREA_SOURCE_COMPARISON_COMPOSITION = {
  DefaultShell: TextareaDefaultShellComposition,
  DisabledStyling: TextareaDisabledStylingComposition,
  InvalidState: TextareaInvalidStateComposition,
  WrapperApi: TextareaWrapperApiComposition,
} as const;
