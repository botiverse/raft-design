/**
 * raft-ui/no-raw-z-index: every z-index is a named layer of the scale
 * (design/foundations/elevation.md#layer-order), so a number of the app's own,
 * which ranks its layer above or below layers it doesn't know about, is
 * reported where an app writes it.
 *
 * Delegates AST traversal and escape-directive handling to `@botiverse/lint/ui`
 * (`uiRules["no-raw-z-index"]`), configured with Raft Design System's
 * `raft-ui:` escape prefix and elevation guidance.
 */

import type { RuleContext, RuleVisitor } from "@botiverse/lint/kit";
import { hasRawZIndexClass, rawZIndexClasses, rules as uiRules } from "@botiverse/lint/ui";
import type { NoRawZIndexOptions } from "@botiverse/lint/ui";
import type { RuleModule } from "./prefer-scroll-area";

export { hasRawZIndexClass, rawZIndexClasses };
export type { NoRawZIndexOptions };

const baseNoRawZIndex = uiRules["no-raw-z-index"]!;

const DEFAULT_RAFT_UI_OPTIONS: NoRawZIndexOptions = {
  escapePrefixes: ["raft-ui"],
  docsUrl: "https://raft-design.botiverse.build/foundations/elevation/#layer-order",
};

export const noRawZIndex: RuleModule<readonly [NoRawZIndexOptions?]> = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "A z-index is a named layer of the Raft Design System's scale (z-raised, z-sticky, ...), not a number.",
      url: "https://raft-design.botiverse.build/foundations/elevation/#layer-order",
    },
    messages: {
      noRawZIndex:
        "Use a named layer instead of a z-index number: z-below, z-base, z-raised (inside an `isolate` root), z-control, z-sticky, z-float, z-chrome, z-cover, z-app; a popup, dialog, lightbox, toast or drag lift takes raft-ui's own component and no z-index. If this number must stay, say why in a `// raft-ui: z-index <reason>` comment on the line above. https://raft-design.botiverse.build/foundations/elevation/#layer-order",
      reasonlessEscape:
        baseNoRawZIndex.meta.messages?.reasonlessEscape ??
        'Escape directive "{{prefix}}: {{rawToken}}" must include a concrete rationale (e.g. "{{escapeHint}}").',
    },
    schema: Array.isArray(baseNoRawZIndex.meta.schema) ? baseNoRawZIndex.meta.schema : [],
  },
  create(context: RuleContext<readonly [NoRawZIndexOptions?]>): RuleVisitor {
    const mergedOptions: NoRawZIndexOptions = {
      ...DEFAULT_RAFT_UI_OPTIONS,
      ...context.options?.[0],
    };
    const delegatedContext = Object.create(context, {
      options: { value: [mergedOptions], enumerable: true },
    }) as RuleContext;
    return baseNoRawZIndex.create(delegatedContext);
  },
};
