import { StatusActivityThinkingComposition } from "./status/activity-thinking-composition.tsx";
import { StatusAttentionCompactComposition } from "./status/attention-compact-composition.tsx";
import { StatusAttentionDefaultComposition } from "./status/attention-default-composition.tsx";
import { StatusDefaultComposition } from "./status/default-composition.tsx";
import { StatusPrimaryPulseComposition } from "./status/primary-pulse-composition.tsx";
import { StatusPulseSizesComposition } from "./status/pulse-sizes-composition.tsx";
import { StatusSuccessComposition } from "./status/success-composition.tsx";
import { StatusWarningComposition } from "./status/warning-composition.tsx";

export const STATUS_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  ActivityThinking: "apps/doc/src/compositions/status/activity-thinking-composition.tsx",
  AttentionCompact: "apps/doc/src/compositions/status/attention-compact-composition.tsx",
  AttentionDefault: "apps/doc/src/compositions/status/attention-default-composition.tsx",
  Default: "apps/doc/src/compositions/status/default-composition.tsx",
  PrimaryPulse: "apps/doc/src/compositions/status/primary-pulse-composition.tsx",
  PulseSizes: "apps/doc/src/compositions/status/pulse-sizes-composition.tsx",
  Success: "apps/doc/src/compositions/status/success-composition.tsx",
  Warning: "apps/doc/src/compositions/status/warning-composition.tsx",
} as const;

export const STATUS_SOURCE_COMPARISON_COMPOSITION = {
  ActivityThinking: StatusActivityThinkingComposition,
  AttentionCompact: StatusAttentionCompactComposition,
  AttentionDefault: StatusAttentionDefaultComposition,
  Default: StatusDefaultComposition,
  PrimaryPulse: StatusPrimaryPulseComposition,
  PulseSizes: StatusPulseSizesComposition,
  Success: StatusSuccessComposition,
  Warning: StatusWarningComposition,
} as const;
