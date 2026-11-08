/**
 * raft-ui/prefer-scroll-area: every region that scrolls is a ScrollArea
 * (scroll-area.md#native-scrolling), so a native overflow that makes an
 * element scroll is reported where an app writes it.
 *
 * Reported:
 * - a native-scrolling Tailwind class (`overflow`, `overflow-x` or `overflow-y`
 *   set to auto or scroll, with any variant prefix, `!`, or as an arbitrary
 *   property) in a string or template literal that is a class: the value of a
 *   `className`, `class` or `*ClassName` JSX attribute, or an argument of
 *   `cn`, `clsx`, `cx`, `tv`, `cva`, `twMerge`, `twJoin` or `classNames`,
 *   through conditionals, `&&`, arrays, objects (keys and values) and `+`;
 * - an inline `style={{ overflow | overflowX | overflowY: "auto" | "scroll" }}`.
 *
 * Allowed with a `raft-ui: native-scroll <reason>` comment, line or block, on
 * the line above the reported string, or the line above the attribute or call
 * it is in (or at the end of either line). A comment without a reason doesn't
 * count.
 *
 * It looks only at literals, with no scope or type information: a class built
 * in a variable outside these calls isn't seen.
 */

// Structural types of the ESTree nodes this rule reads (ESLint and Oxlint JS
// plugins share them), so the package needs no linter types to build.
export interface Position {
  line: number;
  column: number;
}
export interface Node {
  type: string;
  parent?: Node | null;
  loc?: { start: Position; end: Position };
  range?: [number, number];
  [key: string]: unknown;
}
export interface Comment {
  type: string;
  value: string;
  loc?: { start: Position; end: Position };
  range?: [number, number];
}
export interface SourceCode {
  getAllComments(): Comment[];
  getLocFromIndex(index: number): Position;
}
export interface RuleContext {
  sourceCode?: SourceCode;
  getSourceCode?: () => SourceCode;
  report(descriptor: { node: Node; messageId: string }): void;
}
export type RuleVisitor = Record<string, (node: Node) => void>;
/** An ESLint rule, the format Oxlint's JS plugins take. */
export interface RuleModule {
  meta: {
    type: "problem" | "suggestion" | "layout";
    docs: { description: string; url: string };
    messages: Record<string, string>;
    schema: readonly unknown[];
  };
  create(context: RuleContext): RuleVisitor;
}

const NATIVE_SCROLL_CLASS = /(?<![\w-])overflow(?:-[xy])?-(?:auto|scroll)(?![\w-])/;
const NATIVE_SCROLL_ARBITRARY = /\[overflow(?:-[xy])?:[^\]]*\b(?:auto|scroll)\b[^\]]*\]/;
const NATIVE_SCROLL_STYLE_KEYS = new Set(["overflow", "overflowX", "overflowY"]);
const NATIVE_SCROLL_STYLE_VALUES = new Set(["auto", "scroll"]);
const CLASS_FUNCTIONS = new Set([
  "cn",
  "clsx",
  "cx",
  "tv",
  "cva",
  "twMerge",
  "twJoin",
  "classNames",
  "classnames",
]);
const CLASS_ATTRIBUTE = /^(?:class|className|\w+ClassName)$/;
// Nodes a class string passes through on its way to an attribute or a call.
const PASS_THROUGH = new Set([
  "ArrayExpression",
  "BinaryExpression",
  "ConditionalExpression",
  "JSXExpressionContainer",
  "LogicalExpression",
  "ObjectExpression",
  "ParenthesizedExpression",
  "Property",
  "SpreadElement",
  "TemplateLiteral",
  "TSAsExpression",
  "TSNonNullExpression",
  "TSSatisfiesExpression",
]);
const ESCAPE = /\braft-ui:\s*native-scroll\s+\S/;

/** Whether a class string has a native-scrolling class in it. */
export function hasNativeScrollClass(value: string): boolean {
  if (!value.includes("overflow")) return false;
  return NATIVE_SCROLL_CLASS.test(value) || NATIVE_SCROLL_ARBITRARY.test(value);
}

function attributeName(node: Node): string | undefined {
  const name = node.name as Node | undefined;
  return name?.type === "JSXIdentifier" ? (name.name as string) : undefined;
}

/** The attribute or call that makes a string a class, or undefined when it isn't one. */
function classContext(node: Node): Node | undefined {
  let child = node;
  let parent = node.parent;
  while (parent) {
    if (parent.type === "JSXAttribute") {
      const name = attributeName(parent);
      return name !== undefined && CLASS_ATTRIBUTE.test(name) ? parent : undefined;
    }
    if (parent.type === "CallExpression") {
      const callee = parent.callee as Node;
      const isClassCall =
        callee.type === "Identifier" &&
        CLASS_FUNCTIONS.has(callee.name as string) &&
        (parent.arguments as Node[]).includes(child);
      return isClassCall ? parent : undefined;
    }
    if (!PASS_THROUGH.has(parent.type)) return undefined;
    child = parent;
    parent = parent.parent;
  }
  return undefined;
}

function stringValue(node: Node): string | undefined {
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateLiteral" && (node.expressions as Node[]).length === 0) {
    const [quasi] = node.quasis as Node[];
    const value = quasi?.value as { cooked?: string | null; raw: string } | undefined;
    return value?.cooked ?? value?.raw;
  }
  return undefined;
}

/** The string literals an inline style value can be: `"auto"`, `a ? "auto" : "hidden"`, `a && "auto"`. */
function styleValueStrings(node: Node, out: Node[]): Node[] {
  if (node.type === "ConditionalExpression") {
    styleValueStrings(node.consequent as Node, out);
    styleValueStrings(node.alternate as Node, out);
  } else if (node.type === "LogicalExpression") {
    styleValueStrings(node.left as Node, out);
    styleValueStrings(node.right as Node, out);
  } else if (node.type === "TSAsExpression" || node.type === "TSSatisfiesExpression") {
    styleValueStrings(node.expression as Node, out);
  } else if (stringValue(node) !== undefined) {
    out.push(node);
  }
  return out;
}

function propertyKey(property: Node): string | undefined {
  const key = property.key as Node;
  if (property.computed) return stringValue(key);
  return key.type === "Identifier" ? (key.name as string) : stringValue(key);
}

export const preferScrollArea: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Scrolling regions use ScrollArea from @botiverse/raft-ui, not a native overflow.",
      url: "https://raft-design.botiverse.build/about/use-raft-ui/#lint-rules",
    },
    messages: {
      preferScrollArea:
        "Scrolling regions use ScrollArea from @botiverse/raft-ui (or PanelScrollViewport inside a Panel). If this one must scroll natively, say why in an `// raft-ui: native-scroll <reason>` comment on the line above. https://raft-design.botiverse.build/components/scroll-area/",
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

    function report(node: Node, anchor: Node): void {
      const lines = escaped();
      if (lines.size > 0 && (lines.has(startLine(node)) || lines.has(startLine(anchor)))) return;
      context.report({ node, messageId: "preferScrollArea" });
    }

    function checkClassString(node: Node, value: string): void {
      if (!hasNativeScrollClass(value)) return;
      const anchor = classContext(node);
      if (anchor) report(node, anchor);
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
      JSXAttribute(node: Node): void {
        if (attributeName(node) !== "style") return;
        const value = node.value as Node | null;
        const expression =
          value?.type === "JSXExpressionContainer" ? (value.expression as Node) : undefined;
        if (expression?.type !== "ObjectExpression") return;
        for (const property of expression.properties as Node[]) {
          if (property.type !== "Property") continue;
          const key = propertyKey(property);
          if (key === undefined || !NATIVE_SCROLL_STYLE_KEYS.has(key)) continue;
          for (const literal of styleValueStrings(property.value as Node, [])) {
            if (NATIVE_SCROLL_STYLE_VALUES.has(stringValue(literal)!.trim())) {
              report(literal, property);
            }
          }
        }
      },
    };
  },
};
