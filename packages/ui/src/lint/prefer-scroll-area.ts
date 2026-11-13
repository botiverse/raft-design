/**
 * raft-ui/prefer-scroll-area: every region that scrolls is a ScrollArea
 * (scroll-area.md#native-scrolling), so a native overflow that makes an
 * element scroll is reported where an app writes it.
 *
 * Reported:
 * - a native-scrolling Tailwind class (`overflow`, `overflow-x` or `overflow-y`
 *   set to auto or scroll, with any variant prefix, `!`, an arbitrary value
 *   `overflow-y-[scroll]` or an arbitrary property `[overflow:overlay]`) in a
 *   string or template literal that is a class:
 *   - anywhere in the value of a `className`, `class`, `*ClassName` or
 *     `*Class` JSX attribute, or in a JSX spread (`{...guard("…")}`), whatever
 *     call or function it is written in there;
 *   - an argument of `cn`, `clsx`, `cx`, `tv`, `cva`, `twMerge`, `twJoin` or
 *     `classNames`, or a property with a class name (a recipe slot's option,
 *     `content({ className: "…" })`), through conditionals, `&&`, arrays,
 *     objects (keys and values), members, `+` and a method called on it
 *     (`[…].join(" ")`);
 * - such a string in a `const` of the same file that is used as a class
 *   (`const log = "max-h-64 …"`, then `className={log}` or `cn(log)`),
 *   wherever in the file it is declared: a string, a list joined into one, an
 *   object or variant map read by member (`cls.body`, `VARIANTS[kind]`), or a
 *   const built from another (`const b = \`p-2 ${a}\``);
 * - a `style` whose `overflow`, `overflowX` or `overflowY` is `auto`, `scroll`
 *   or `overlay`: inline, or an object in a `const` of the same file that a
 *   `style` attribute uses (`style={s}`, `style={styles.pre}`).
 *
 * A hit on a `ScrollArea` or `PanelScrollViewport` element's own `className`
 * or `style` gets a message of its own: the area scrolls already.
 *
 * Allowed with a `raft-ui: native-scroll <reason>` comment, line or block, on
 * the line above the reported string (or at the end of its line): it covers
 * the string that starts on that line only, not the rest of the call or the
 * attribute it is in, so a class added to a multi-line `cn(...)` later is
 * still reported. For a style, the line of its property. A comment without a
 * reason doesn't count.
 *
 * It reads the file as written, with no scope or type information: a const is
 * matched by its name in the same file, and a class in a `let`, an import or
 * a function's return isn't seen outside a class attribute.
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

// Group 1 or 2 is the axis (`-x`, `-y`), absent for both.
const NATIVE_SCROLL =
  /(?<![\w-])overflow(-[xy])?-(?:auto|scroll|\[(?:auto|scroll|overlay)\])(?![\w-])|\[overflow(-[xy])?:[^\]]*\b(?:auto|scroll|overlay)\b[^\]]*\]/g;
const NATIVE_SCROLL_STYLE_KEYS = new Set(["overflow", "overflowX", "overflowY"]);
const NATIVE_SCROLL_STYLE_VALUES = new Set(["auto", "scroll", "overlay"]);
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
// This rule's own: also `classNames` and a `*Class` prop (`positionClass`).
const WIDE_CLASS_ATTRIBUTE = /^(?:class|\w+Class)(?:Names?)?$/;
// The elements that are a ScrollArea already.
const SCROLL_AREAS = new Set(["ScrollArea", "PanelScrollViewport"]);
// Nodes a class string passes through on its way to an attribute, a call or a property.
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
// What a const's initializer passes through to the strings in it (`const log = cn("…", open && "…")`).
const INIT_THROUGH = new Set([...PASS_THROUGH, "CallExpression"]);
// This rule's own: a member too (`[…].join(" ")`, `cls.body`, `VARIANTS[kind]`).
const WIDE_PASS_THROUGH = new Set([...PASS_THROUGH, "MemberExpression"]);
const WIDE_INIT_THROUGH = new Set([...INIT_THROUGH, "MemberExpression"]);
const ESCAPE = /\braft-ui:\s*native-scroll\s+\S/;

/**
 * The way a class string scrolls natively: `inline` when every native-scrolling
 * class in it is on the x axis, `block` for the y axis or both, undefined when
 * it has none.
 */
export function nativeScrollAxis(value: string): "block" | "inline" | undefined {
  if (!value.includes("overflow")) return undefined;
  let axis: "block" | "inline" | undefined;
  for (const match of value.matchAll(NATIVE_SCROLL)) {
    if ((match[1] ?? match[2]) !== "-x") return "block";
    axis = "inline";
  }
  return axis;
}

/** Whether a class string has a native-scrolling class in it. */
export function hasNativeScrollClass(value: string): boolean {
  return nativeScrollAxis(value) !== undefined;
}

export function attributeName(node: Node): string | undefined {
  const name = node.name as Node | undefined;
  return name?.type === "JSXIdentifier" ? (name.name as string) : undefined;
}

/**
 * The attribute, call or property that makes a node a class, or undefined when it isn't one.
 * `wide` (prefer-scroll-area's own) also passes through a member and a method called on the
 * node (`[…].join(" ")`), and takes `classNames` and `*Class` as class names.
 */
export function classContext(node: Node, wide = false): Node | undefined {
  const attribute = wide ? WIDE_CLASS_ATTRIBUTE : CLASS_ATTRIBUTE;
  const through = wide ? WIDE_PASS_THROUGH : PASS_THROUGH;
  let child = node;
  let parent = node.parent;
  while (parent) {
    if (parent.type === "JSXAttribute") {
      const name = attributeName(parent);
      return name !== undefined && attribute.test(name) ? parent : undefined;
    }
    if (parent.type === "CallExpression") {
      const callee = parent.callee as Node;
      const isClassCall =
        callee.type === "Identifier" &&
        CLASS_FUNCTIONS.has(callee.name as string) &&
        (parent.arguments as Node[]).includes(child);
      if (isClassCall) return parent;
      if (!wide || callee !== child) return undefined;
    }
    // A recipe slot's option: `content({ className: open && "…" })`.
    else if (parent.type === "Property" && parent.value === child) {
      const key = propertyKey(parent);
      if (key !== undefined && attribute.test(key)) return parent;
    }
    if (parent.type !== "CallExpression" && !through.has(parent.type)) return undefined;
    child = parent;
    parent = parent.parent;
  }
  return undefined;
}

/**
 * The `const` declarator whose initializer holds `node` (through conditionals, arrays, calls), if
 * any. `wide` (prefer-scroll-area's own) also passes through a member (`[…].join(" ")`).
 */
export function constDeclarator(node: Node, wide = false): Node | undefined {
  const through = wide ? WIDE_INIT_THROUGH : INIT_THROUGH;
  let parent = node.parent;
  while (parent) {
    if (parent.type === "VariableDeclarator") {
      const id = parent.id as Node | undefined;
      const declaration = parent.parent;
      return id?.type === "Identifier" && declaration?.kind === "const" ? parent : undefined;
    }
    if (!through.has(parent.type)) return undefined;
    parent = parent.parent;
  }
  return undefined;
}

export function stringValue(node: Node): string | undefined {
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

export function propertyKey(property: Node): string | undefined {
  const key = property.key as Node;
  if (property.computed) return stringValue(key);
  return key.type === "Identifier" ? (key.name as string) : stringValue(key);
}

const DOCS = "https://raft-design.botiverse.build/components/scroll-area.md";
const OPT_OUT =
  'Only a region that must scroll natively (see the allowed cases in the docs) takes "// raft-ui: native-scroll <reason>" on the line above.';
const WHERE_CLASSES_GO =
  "Sizing classes (max-h-*, flex-1, min-h-0) stay on the area; grid/flex/gap/padding go on contentClassName.";

type MessageId = "preferScrollArea" | "preferScrollAreaHorizontal" | "scrollAreaAlreadyScrolls";
/** A native scroller found in a const: reported once the const is seen used as a class or a style. */
interface Hit {
  node: Node;
  /** The node whose line an escape comment covers. */
  anchor: Node;
  messageId: MessageId;
}
/** The JSX attribute or spread being walked: what its value is, and whether it is a ScrollArea's own. */
interface Attribute {
  kind: "class" | "style" | undefined;
  onScrollArea: boolean;
}

function elementName(attribute: Node): string | undefined {
  const name = attribute.parent?.name as Node | undefined;
  if (name?.type === "JSXIdentifier") return name.name as string;
  // `<Raft.ScrollArea>`
  const property = name?.type === "JSXMemberExpression" ? (name.property as Node) : undefined;
  return property?.name as string | undefined;
}

function enteredAttribute(node: Node): Attribute {
  // A spread's argument ends up in the element's props, its class among them.
  if (node.type === "JSXSpreadAttribute") return { kind: "class", onScrollArea: false };
  const name = attributeName(node);
  const kind =
    name === undefined
      ? undefined
      : name === "style"
        ? "style"
        : WIDE_CLASS_ATTRIBUTE.test(name)
          ? "class"
          : undefined;
  const own = name === "className" || name === "class" || name === "style";
  return { kind, onScrollArea: own && SCROLL_AREAS.has(elementName(node) ?? "") };
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
      preferScrollArea: `Use ScrollArea from @botiverse/raft-ui for a scrolling region: <ScrollArea className="…sizing…" contentClassName="…layout, gap, padding…">…</ScrollArea> (inside a Panel: PanelScrollViewport). ${WHERE_CLASSES_GO} ${OPT_OUT} Docs: ${DOCS}`,
      preferScrollAreaHorizontal: `Use ScrollArea from @botiverse/raft-ui for a region that scrolls sideways: <ScrollArea orientation="horizontal" className="…sizing…" contentClassName="…layout, gap, padding…">…</ScrollArea>. ${WHERE_CLASSES_GO} ${OPT_OUT} Docs: ${DOCS}`,
      scrollAreaAlreadyScrolls: `ScrollArea already scrolls: remove the overflow class (or style) and set the direction with orientation="vertical" (the default), "horizontal" or "both". ${OPT_OUT} Docs: ${DOCS}`,
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

    const reported = new Set<Node>();

    /** Reports `node`, once, unless an escape comment covers the line `anchor` starts on. */
    function report({ node, anchor, messageId }: Hit): void {
      if (reported.has(node)) return;
      reported.add(node);
      const lines = escaped();
      if (lines.size > 0 && lines.has(startLine(anchor))) return;
      context.report({ node, messageId });
    }

    // The JSX attributes and spreads around the node being visited, innermost last: a string
    // anywhere in a class attribute's value is a class, whatever call it is an argument of.
    const attributes: Attribute[] = [];
    function enterAttribute(node: Node): void {
      attributes.push(enteredAttribute(node));
    }
    function exitAttribute(): void {
      attributes.pop();
    }

    // What a const holds by its name (its scrolling class strings, its scrolling style
    // properties, the names its initializer reads) and the names used as a class or a style,
    // with whether every such use is a ScrollArea's own attribute. Matched at the end of the
    // file, so a const declared after its use counts.
    const classHits = new Map<string, Hit[]>();
    const styleHits = new Map<string, Hit[]>();
    const references = new Map<string, Set<string>>();
    const classUses = new Map<string, boolean>();
    const styleUses = new Map<string, boolean>();

    function add(hits: Map<string, Hit[]>, declarator: Node, hit: Hit): void {
      const name = (declarator.id as Node).name as string;
      const list = hits.get(name);
      if (list) list.push(hit);
      else hits.set(name, [hit]);
    }

    function use(uses: Map<string, boolean>, name: string, onScrollArea: boolean): void {
      uses.set(name, (uses.get(name) ?? true) && onScrollArea);
    }

    function checkClassString(node: Node, value: string): void {
      const axis = nativeScrollAxis(value);
      if (axis === undefined) return;
      const attribute = attributes.at(-1);
      const messageId = axis === "inline" ? "preferScrollAreaHorizontal" : "preferScrollArea";
      // The string itself is what a comment escapes, never the call or attribute it is in.
      if (attribute?.kind === "class" || classContext(node, true)) {
        const onScrollArea = attribute?.kind === "class" && attribute.onScrollArea;
        report({
          node,
          anchor: node,
          messageId: onScrollArea ? "scrollAreaAlreadyScrolls" : messageId,
        });
        return;
      }
      const declarator = constDeclarator(node, true);
      if (declarator) add(classHits, declarator, { node, anchor: node, messageId });
    }

    /** Reports what the used consts hold, and what the consts they are built from hold. */
    function reportUsed(uses: Map<string, boolean>, hits: Map<string, Hit[]>): void {
      const seen = new Set<string>();
      function visit(name: string, onScrollArea: boolean): void {
        if (seen.has(name)) return;
        seen.add(name);
        for (const hit of hits.get(name) ?? []) {
          report(onScrollArea ? { ...hit, messageId: "scrollAreaAlreadyScrolls" } : hit);
        }
        for (const reference of references.get(name) ?? []) visit(reference, onScrollArea);
      }
      // A const also used on another element keeps the message that says what to write there.
      for (const onScrollArea of [false, true]) {
        for (const [name, only] of uses) if (only === onScrollArea) visit(name, onScrollArea);
      }
    }

    return {
      JSXAttribute: enterAttribute,
      "JSXAttribute:exit": exitAttribute,
      JSXSpreadAttribute: enterAttribute,
      "JSXSpreadAttribute:exit": exitAttribute,
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
        // A property's own name (`{ className: … }`) is not a use of a const; a
        // shorthand one (`{ className }`) is both, and is. Nor is a member's
        // name (`styles.log`) or the name a const is declared with.
        const isKey = parent?.type === "Property" && parent.key === node && !parent.computed;
        if (isKey && !parent.shorthand) return;
        if (parent?.type === "MemberExpression" && parent.property === node && !parent.computed) {
          return;
        }
        if (parent?.type === "VariableDeclarator" && parent.id === node) return;
        const name = node.name as string;
        const attribute = attributes.at(-1);
        if (attribute?.kind === "style") use(styleUses, name, attribute.onScrollArea);
        else if (attribute?.kind === "class") use(classUses, name, attribute.onScrollArea);
        else if (classContext(node, true)) use(classUses, name, false);
        // `const b = \`p-2 ${a}\``: what `a` holds is in `b` too.
        const declarator = constDeclarator(node, true);
        if (!declarator) return;
        const owner = (declarator.id as Node).name as string;
        const list = references.get(owner);
        if (list) list.add(name);
        else references.set(owner, new Set([name]));
      },
      Property(node: Node): void {
        const key = propertyKey(node);
        if (key === undefined || !NATIVE_SCROLL_STYLE_KEYS.has(key)) return;
        const attribute = attributes.at(-1);
        const declarator = attribute?.kind === "style" ? undefined : constDeclarator(node, true);
        if (attribute?.kind !== "style" && !declarator) return;
        const messageId = key === "overflowX" ? "preferScrollAreaHorizontal" : "preferScrollArea";
        for (const literal of styleValueStrings(node.value as Node, [])) {
          if (!NATIVE_SCROLL_STYLE_VALUES.has(stringValue(literal)!.trim())) continue;
          const hit: Hit = { node: literal, anchor: node, messageId };
          if (declarator) add(styleHits, declarator, hit);
          else
            report(
              attribute?.onScrollArea ? { ...hit, messageId: "scrollAreaAlreadyScrolls" } : hit,
            );
        }
      },
      "Program:exit"(): void {
        reportUsed(classUses, classHits);
        reportUsed(styleUses, styleHits);
      },
    };
  },
};
