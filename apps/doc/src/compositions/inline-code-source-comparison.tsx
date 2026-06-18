import { InlineCodeInlineProseTokenComposition } from "./inline-code/inline-prose-token-composition.tsx";

export const INLINE_CODE_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  InlineProseToken: "apps/doc/src/compositions/inline-code/inline-prose-token-composition.tsx",
} as const;

export const INLINE_CODE_SOURCE_COMPARISON_COMPOSITION = {
  InlineProseToken: InlineCodeInlineProseTokenComposition,
} as const;
