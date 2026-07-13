import { StatusActivityThinkingComposition } from "./compositions/activity-thinking.composition.tsx";
import { StatusAttentionCompactComposition } from "./compositions/attention-compact.composition.tsx";
import { StatusAttentionDefaultComposition } from "./compositions/attention-default.composition.tsx";
import { StatusDefaultComposition } from "./compositions/default.composition.tsx";
import { StatusPrimaryPulseComposition } from "./compositions/primary-pulse.composition.tsx";
import { StatusPulseSizesComposition } from "./compositions/pulse-sizes.composition.tsx";
import { StatusSuccessComposition } from "./compositions/success.composition.tsx";
import { StatusWarningComposition } from "./compositions/warning.composition.tsx";

export const STATUS_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  ActivityThinking: "apps/doc/src/modules/status/compositions/activity-thinking.composition.tsx",
  AttentionCompact: "apps/doc/src/modules/status/compositions/attention-compact.composition.tsx",
  AttentionDefault: "apps/doc/src/modules/status/compositions/attention-default.composition.tsx",
  Default: "apps/doc/src/modules/status/compositions/default.composition.tsx",
  PrimaryPulse: "apps/doc/src/modules/status/compositions/primary-pulse.composition.tsx",
  PulseSizes: "apps/doc/src/modules/status/compositions/pulse-sizes.composition.tsx",
  Success: "apps/doc/src/modules/status/compositions/success.composition.tsx",
  Warning: "apps/doc/src/modules/status/compositions/warning.composition.tsx",
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
