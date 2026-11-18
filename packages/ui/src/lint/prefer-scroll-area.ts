/**
 * raft-ui/prefer-scroll-area: every region that scrolls is a ScrollArea
 * (scroll-area.md#native-scrolling), so a native overflow that makes an
 * element scroll is reported where an app writes it.
 *
 * Delegates AST traversal and escape-directive handling to `@botiverse/lint/ui`
 * (`uiRules["prefer-scroll-area"]`), configured with Raft Design System's
 * component names, `raft-ui:` escape prefix, and remediation messages.
 */

import type {
  Comment,
  Node,
  Position,
  RuleContext,
  RuleModule as BaseRuleModule,
  RuleVisitor,
  Scope,
  SourceCode,
} from "@botiverse/lint/kit";
import {
  hasNativeScrollClass,
  nativeScrollAxis,
  nativeScrollStyleAxis,
  rules as uiRules,
} from "@botiverse/lint/ui";
import type { PreferScrollAreaOptions, ScrollAxis } from "@botiverse/lint/ui";

export interface RuleModule<
  TOptions extends readonly unknown[] = readonly unknown[],
> extends BaseRuleModule<TOptions> {
  meta: {
    type: "problem" | "suggestion" | "layout";
    docs: { description: string; url: string };
    messages: Record<string, string>;
    schema: readonly unknown[];
  };
}

export { hasNativeScrollClass, nativeScrollAxis, nativeScrollStyleAxis };
export type {
  Comment,
  Node,
  Position,
  PreferScrollAreaOptions,
  RuleContext,
  RuleVisitor,
  Scope,
  ScrollAxis,
  SourceCode,
};

const basePreferScrollArea = uiRules["prefer-scroll-area"]!;

const DOCS_URL = "https://raft-design.botiverse.build/components/scroll-area.md";
const DOCS = `Docs: ${DOCS_URL}`;
const OPT_OUT =
  'Only a region that must scroll natively (see the allowed cases in the docs) takes "// raft-ui: native-scroll <reason>" on the line above.';
const WHERE_CLASSES_GO =
  "Sizing classes (max-h-*, flex-1, min-h-0) stay on the area; grid/flex/gap/padding go on contentClassName.";
const AREA_CLASSES = 'className="…sizing…" contentClassName="…layout, gap, padding…"';

const DEFAULT_RAFT_UI_OPTIONS: PreferScrollAreaOptions = {
  scrollComponents: ["ScrollArea", "PanelScrollViewport", "ScrollAreaTextarea"],
  textareaComponents: ["textarea", "Textarea"],
  escapePrefixes: ["raft-ui"],
  packageName: "@botiverse/raft-ui",
  docsUrl: DOCS_URL,
};

export const preferScrollArea: RuleModule<readonly [PreferScrollAreaOptions?]> = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Scrolling regions use ScrollArea from @botiverse/raft-ui, not a native overflow.",
      url: "https://raft-design.botiverse.build/about/use-raft-ui/#lint-rules",
    },
    messages: {
      preferScrollArea: `Use ScrollArea from @botiverse/raft-ui for a scrolling region: <ScrollArea ${AREA_CLASSES}>…</ScrollArea> (inside a Panel: PanelScrollViewport). ${WHERE_CLASSES_GO} ${OPT_OUT} ${DOCS}`,
      preferScrollAreaHorizontal: `Use ScrollArea from @botiverse/raft-ui for a region that scrolls sideways: <ScrollArea orientation="horizontal" ${AREA_CLASSES}>…</ScrollArea> (around a wide table: TableScroll). ${WHERE_CLASSES_GO} ${OPT_OUT} ${DOCS}`,
      preferScrollAreaBoth: `Use ScrollArea from @botiverse/raft-ui for a region that scrolls both ways: <ScrollArea orientation="both" ${AREA_CLASSES}>…</ScrollArea>. Leave orientation out (vertical, the default) only when nothing inside is wider than the area: a vertical area cuts off what is. ${WHERE_CLASSES_GO} ${OPT_OUT} ${DOCS}`,
      preferScrollAreaTextarea: `Use ScrollAreaTextarea from @botiverse/raft-ui for a textarea that scrolls: <ScrollAreaTextarea wrapperClassName="…border, background, focus ring…" className="…padding…" />. A <textarea> can't hold ScrollArea's scrollbars, so ScrollAreaTextarea draws them over a frame around it. ${OPT_OUT} ${DOCS}`,
      preferScrollAreaContainer: `These classes go to an element another component renders, so a ScrollArea can't take its place. Bind that element: const { containerProps, guttersProps } = useScrollAreaContainer(); give it containerProps (ref, className, style) and render <ScrollAreaGutters {...guttersProps} /> as its first child, with no overflow class ("Your own container" in the docs). Where the component takes neither, it scrolls natively: say so in "// raft-ui: native-scroll <reason>" on the line above. ${DOCS}`,
      nativeScrollElement: `A ScrollArea can't take the place of this element (<pre>, <html>, <body>, <iframe>), so there is nothing to write instead. It may scroll natively only as one of the allowed cases in the docs (a <pre> of code is one, since it holds phrasing content only): say which in "// raft-ui: native-scroll <reason>" on the line above. ${DOCS}`,
      scrollAreaAlreadyScrolls: `ScrollArea already scrolls: remove the overflow class (or style) and set the direction with orientation="vertical" (the default), "horizontal" or "both". ${DOCS}`,
      reasonlessEscape:
        basePreferScrollArea.meta.messages?.reasonlessEscape ??
        'Escape directive "{{prefix}}: {{rawToken}}" must include a concrete rationale (e.g. "{{escapeHint}}").',
    },
    schema: Array.isArray(basePreferScrollArea.meta.schema) ? basePreferScrollArea.meta.schema : [],
  },
  create(context: RuleContext<readonly [PreferScrollAreaOptions?]>): RuleVisitor {
    const mergedOptions: PreferScrollAreaOptions = {
      ...DEFAULT_RAFT_UI_OPTIONS,
      ...context.options?.[0],
    };
    const delegatedContext = Object.create(context, {
      options: { value: [mergedOptions], enumerable: true },
    }) as RuleContext;
    return basePreferScrollArea.create(delegatedContext);
  },
};
