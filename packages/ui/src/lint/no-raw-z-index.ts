/**
 * raft-ui/no-raw-z-index: every z-index is a named layer of the scale
 * (design/foundations/elevation.md#layer-order), so a number of the app's own,
 * which ranks its layer above or below layers it doesn't know about, is
 * reported where an app writes it.
 *
 * Reported:
 * - a Tailwind z-index class with a number or an arbitrary value (`z-10`,
 *   `-z-1`, `z-[60]`, `z-(--my-z)`, `[z-index:5]`, with any variant prefix or
 *   `!`) in a string or template literal that is a class: a `className`,
 *   `class` or `*ClassName` attribute or property, an argument of `cn`, `tv`
 *   and the like, or a `const` of the same file used as a class (not the
 *   wider set `raft-ui/prefer-scroll-area` reads). `z-auto` and the
 *   named layers (`z-raised`, `max-md:z-chrome`) are not reported;
 * - a `zIndex` property whose value is a number or a numeric string
 *   (`style={{ zIndex: 10 }}`, `const s = { zIndex: open ? 20 : "5" }`), a
 *   `zIndex={n}` JSX attribute, and an assignment `el.style.zIndex = "n"`.
 *   A `var(--z-index-…)` string is a name, and is not reported.
 *
 * Allowed with a `raft-ui: z-index <reason>` comment, line or block, on the
 * line above the reported string or property (or at the end of its line), as
 * for `raft-ui/prefer-scroll-area`. A comment without a reason doesn't count.
 */

import { classContext, constDeclarator, propertyKey, stringValue } from "./prefer-scroll-area";
import type { Node, RuleContext, RuleModule, RuleVisitor } from "./prefer-scroll-area";

// A z class with a number, an arbitrary value or a variable shorthand, after
// any variant prefix (`md:`, `before:`) and an optional `!` / `-`; and the
// arbitrary property form.
const RAW_Z_CLASS = /(?<![\w-])!?-?z-(?:\d+|\[[^\]\s]*\]|\([^)\s]*\))!?(?![\w-])/;
const RAW_Z_ARBITRARY = /\[z-index:[^\]]*\]/;
const NUMERIC = /^\s*[-+]?\d+(?:\.\d+)?\s*$/;
const ESCAPE = /\braft-ui:\s*z-index\s+\S/;

/** Whether a class string has a z-index class with a number or an arbitrary value. */
export function hasRawZIndexClass(value: string): boolean {
  if (!value.includes("z-")) return false;
  return RAW_Z_CLASS.test(value) || RAW_Z_ARBITRARY.test(value);
}

/** Every z-index class with a number or an arbitrary value in a text, in order (z-index-named.test.ts). */
export function rawZIndexClasses(text: string): string[] {
  const found = [
    ...text.matchAll(new RegExp(RAW_Z_CLASS.source, "g")),
    ...text.matchAll(new RegExp(RAW_Z_ARBITRARY.source, "g")),
  ];
  return found.sort((a, b) => a.index - b.index).map((match) => match[0]);
}

/** The numeric literals a `zIndex` value can be: `10`, `-1`, `"10"`, `a ? 20 : undefined`. */
function numericLiterals(node: Node, out: Node[]): Node[] {
  if (node.type === "ConditionalExpression") {
    numericLiterals(node.consequent as Node, out);
    numericLiterals(node.alternate as Node, out);
  } else if (node.type === "LogicalExpression") {
    numericLiterals(node.left as Node, out);
    numericLiterals(node.right as Node, out);
  } else if (
    node.type === "TSAsExpression" ||
    node.type === "TSSatisfiesExpression" ||
    node.type === "ParenthesizedExpression" ||
    node.type === "JSXExpressionContainer"
  ) {
    numericLiterals(node.expression as Node, out);
  } else if (node.type === "UnaryExpression" && (node.operator === "-" || node.operator === "+")) {
    if (numericLiterals(node.argument as Node, []).length > 0) out.push(node);
  } else if (node.type === "Literal" && typeof node.value === "number") {
    out.push(node);
  } else {
    const text = stringValue(node);
    if (text !== undefined && NUMERIC.test(text)) out.push(node);
  }
  return out;
}

export const noRawZIndex: RuleModule = {
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
    },
    schema: [],
  },
  create(context: RuleContext): RuleVisitor {
    const sourceCode = context.sourceCode ?? context.getSourceCode?.();
    let escapeLines: Set<number> | undefined;

    function line(index: number): number {
      return sourceCode!.getLocFromIndex(index).line;
    }

    /** The lines an escape comment covers: the one it ends on and the next. */
    function escaped(): Set<number> {
      if (escapeLines) return escapeLines;
      escapeLines = new Set();
      for (const comment of sourceCode?.getAllComments() ?? []) {
        if (!ESCAPE.test(comment.value)) continue;
        const end = comment.loc?.end.line ?? line(comment.range![1]);
        escapeLines.add(end);
        escapeLines.add(end + 1);
      }
      return escapeLines;
    }

    function startLine(node: Node): number {
      return node.loc?.start.line ?? line(node.range![0]);
    }

    /** Reports `node` unless an escape comment covers the line `anchor` starts on. */
    function report(node: Node, anchor: Node): void {
      const lines = escaped();
      if (lines.size > 0 && lines.has(startLine(anchor))) return;
      context.report({ node, messageId: "noRawZIndex" });
    }

    // As in prefer-scroll-area: a const's strings by its name, and the names
    // used as a class, matched at the end of the file.
    const constStrings = new Map<string, Node[]>();
    const classNames = new Set<string>();

    function checkClassString(node: Node, value: string): void {
      if (!hasRawZIndexClass(value)) return;
      if (classContext(node)) return report(node, node);
      const declarator = constDeclarator(node);
      if (!declarator) return;
      const name = (declarator.id as Node).name as string;
      constStrings.set(name, [...(constStrings.get(name) ?? []), node]);
    }

    function checkZIndexValue(value: Node, anchor: Node): void {
      for (const literal of numericLiterals(value, [])) report(literal, anchor);
    }

    return {
      Literal(node: Node): void {
        if (typeof node.value === "string") checkClassString(node, node.value);
      },
      TemplateLiteral(node: Node): void {
        const text = (node.quasis as Node[])
          .map((quasi) => (quasi.value as { raw: string }).raw)
          .join(" ");
        checkClassString(node, text);
      },
      Identifier(node: Node): void {
        const parent = node.parent;
        const isKey = parent?.type === "Property" && parent.key === node && !parent.computed;
        if (isKey && !parent.shorthand) return;
        if (classContext(node)) classNames.add(node.name as string);
      },
      Property(node: Node): void {
        if (propertyKey(node) !== "zIndex") return;
        checkZIndexValue(node.value as Node, node);
      },
      JSXAttribute(node: Node): void {
        const name = node.name as Node | undefined;
        if (name?.type !== "JSXIdentifier" || name.name !== "zIndex") return;
        const value = node.value as Node | null;
        if (value) checkZIndexValue(value, node);
      },
      AssignmentExpression(node: Node): void {
        const target = node.left as Node;
        if (target.type !== "MemberExpression") return;
        const property = target.property as Node;
        const key = target.computed
          ? stringValue(property)
          : property.type === "Identifier"
            ? (property.name as string)
            : undefined;
        if (key !== "zIndex") return;
        checkZIndexValue(node.right as Node, node);
      },
      "Program:exit"(): void {
        for (const name of classNames) {
          for (const node of constStrings.get(name) ?? []) report(node, node);
        }
      },
    };
  },
};
