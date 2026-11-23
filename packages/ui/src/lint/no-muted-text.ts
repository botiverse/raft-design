/**
 * raft-ui/no-muted-text: grey text is helper text, and helper text is a
 * `HelperText` rendered by one of raft-ui's explanation slots
 * (design/content/writing.md#helper-text). So a muted or hint text colour an
 * app writes by hand (`text-foreground-muted`, `text-foreground-hint`, their
 * frame and HUD tones, the same tokens as arbitrary values, or an inline
 * `color: "var(--foreground-muted)"`) is reported where it is written.
 *
 * It looks in every string and template literal, not only in class
 * positions: a class constant exported from another file is a string too, and
 * these tokens don't appear in strings that aren't classes. It allows:
 * - a state-only variant (`hover:`, `focus:`, `placeholder:`, `disabled:`,
 *   `aria-*:`, `data-*:`, `group-*:` …), which greys nothing at rest;
 * - a class on a self-closing JSX element: an icon, which holds no text;
 * - a `// raft-ui: muted <reason>` comment on the line above (or at the end
 *   of the line). A comment without a reason doesn't count.
 */

import { parseEscapeDirectives, propertyKey } from "@botiverse/lint/kit";
import type { Node, ParsedEscapeDirectives, RuleContext, RuleVisitor } from "@botiverse/lint/kit";
import type { RuleModule } from "./prefer-scroll-area";

const DOCS_URL = "https://raft-design.botiverse.build/content/writing/#helper-text";

const MUTED_TOKEN = "foreground-(?:muted|hint|on-frame-muted|on-hud-muted)";
const MUTED_VAR = `var\\(\\s*--(?:color-)?${MUTED_TOKEN}\\s*(?:,[^)]*)?\\)`;

const MUTED_UTILITY = new RegExp(
  [
    // text-foreground-muted, text-foreground-hint/80
    `^text-${MUTED_TOKEN}(?:/\\S+)?$`,
    // text-(--foreground-muted), text-(color:--foreground-hint)
    `^text-\\((?:color:)?--(?:color-)?${MUTED_TOKEN}\\)(?:/\\S+)?$`,
    // text-[var(--foreground-muted)], text-[color:var(--foreground-hint)]
    `^text-\\[(?:color:)?${MUTED_VAR}\\](?:/\\S+)?$`,
    // [color:var(--foreground-muted)]
    `^\\[color:${MUTED_VAR}\\]$`,
  ].join("|"),
);

const MUTED_STYLE_VALUE = new RegExp(MUTED_VAR);

// Variants that apply only in a state: the text is not grey at rest.
const STATE_VARIANT =
  /^(?:hover|focus|focus-visible|focus-within|active|visited|target|placeholder|disabled|enabled|checked|indeterminate|invalid|user-invalid|valid|required|read-only|open|inert|empty|selection|(?:group|peer)(?:-.+)?|(?:aria|data|has|not|in)-.+)$/;

/** Split a class into its variants and its utility, keeping `[...]` and `(...)` whole. */
function splitVariants(className: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < className.length; index++) {
    const char = className[index];
    if (char === "[" || char === "(") depth++;
    else if (char === "]" || char === ")") depth = Math.max(0, depth - 1);
    else if (char === ":" && depth === 0) {
      parts.push(className.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(className.slice(start));
  return parts;
}

/**
 * The muted or hint text colour classes in a class string, in order, except
 * those behind a state-only variant (`hover:`, `aria-*:` …).
 */
export function mutedTextClasses(value: string): string[] {
  if (!value.includes("foreground-")) return [];
  const found: string[] = [];
  for (const raw of value.split(/\s+/)) {
    if (!raw.includes("foreground-")) continue;
    const parts = splitVariants(raw);
    const utility = (parts.pop() ?? "").replace(/^!|!$/g, "");
    if (!MUTED_UTILITY.test(utility)) continue;
    if (parts.some((variant) => STATE_VARIANT.test(variant))) continue;
    found.push(raw);
  }
  return found;
}

/** Whether a class string greys text with a muted or hint colour (see `mutedTextClasses`). */
export function hasMutedTextClass(value: string): boolean {
  return mutedTextClasses(value).length > 0;
}

function stringValueOf(node: Node): string | undefined {
  if (node.type === "Literal") return typeof node.value === "string" ? node.value : undefined;
  if (node.type === "TemplateElement") {
    const value = node.value as { cooked?: string | null; raw?: string } | undefined;
    return value?.cooked ?? value?.raw;
  }
  return undefined;
}

/** The style property a string is the value of (`color` in `{ color: "…" }`), if any. */
function stylePropertyOf(node: Node): string | undefined {
  let current: Node | null | undefined = node.parent;
  while (
    current &&
    (current.type === "ConditionalExpression" || current.type === "LogicalExpression")
  )
    current = current.parent;
  if (current?.type !== "Property") return undefined;
  return propertyKey(current);
}

/** Whether the string sits in an attribute of a self-closing JSX element (an icon). */
function onSelfClosingElement(node: Node): boolean {
  let current: Node | null | undefined = node.parent;
  while (current) {
    if (current.type === "JSXAttribute") {
      const opening = current.parent;
      return opening?.type === "JSXOpeningElement" && opening.selfClosing === true;
    }
    if (current.type === "JSXElement" || current.type === "JSXFragment") return false;
    current = current.parent;
  }
  return false;
}

export interface NoMutedTextOptions {
  /** Comment prefixes that escape a line (`// raft-ui: muted <reason>`). */
  escapePrefixes?: string[];
}

export const noMutedText: RuleModule<readonly [NoMutedTextOptions?]> = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Grey text is helper text: a HelperText in a raft-ui explanation slot, not a muted or hint colour written by hand.",
      url: "https://raft-design.botiverse.build/about/use-raft-ui/#lint-rules",
    },
    messages: {
      noMutedText:
        '{{token}} greys text by hand. Grey text is helper text: put the sentence in a raft-ui explanation slot (FieldDescription, DialogDescription, BannerDescription, Text variant="muted" …) as helperText(content, { why, about }), where why is what the reader would otherwise miss: "consequence", "audience" or "recovery". A sentence that names none of the three is cut. Data (a time, a count, a subtitle) goes in its part (ListRowSubtitle, a *Meta part, Text variant="note"). If this colour must stay, say why in a `// raft-ui: muted <reason>` comment on the line above. ' +
        DOCS_URL,
    },
    schema: [
      {
        type: "object",
        properties: { escapePrefixes: { type: "array", items: { type: "string" } } },
        additionalProperties: false,
      },
    ],
  },
  create(context: RuleContext<readonly [NoMutedTextOptions?]>): RuleVisitor {
    const prefixes = context.options?.[0]?.escapePrefixes ?? ["raft-ui"];
    const sourceCode = context.sourceCode ?? context.getSourceCode?.();
    let escapes: ParsedEscapeDirectives | undefined;
    function escaped(node: Node) {
      escapes ??= parseEscapeDirectives(sourceCode?.text ?? "", prefixes, {
        comments: sourceCode?.getAllComments(),
      });
      const line = node.loc?.start.line ?? sourceCode?.getLocFromIndex(node.range?.[0] ?? 0).line;
      return line !== undefined && escapes.isLineEscaped(line, ["muted"]);
    }

    function check(node: Node) {
      const value = stringValueOf(node);
      if (value === undefined || !value.includes("foreground-")) return;
      const classes = mutedTextClasses(value);
      let token: string | undefined = classes[0];
      if (token === undefined && stylePropertyOf(node) === "color") {
        token = MUTED_STYLE_VALUE.exec(value)?.[0];
      }
      if (token === undefined) return;
      if (onSelfClosingElement(node) || escaped(node)) return;
      context.report({ node, messageId: "noMutedText", data: { token } });
    }

    return { Literal: check, TemplateElement: check };
  },
};
