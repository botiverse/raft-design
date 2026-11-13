/**
 * raft-ui/prefer-scroll-area: every region that scrolls is a ScrollArea
 * (scroll-area.md#native-scrolling), so a native overflow that makes an
 * element scroll is reported where an app writes it.
 *
 * Reported:
 * - a native-scrolling Tailwind class (`overflow`, `overflow-x` or `overflow-y`
 *   set to auto or scroll, with any variant prefix, `!`, an arbitrary value
 *   `overflow-y-[scroll]`, `overflow-[hidden_auto]` or an arbitrary property
 *   `[overflow:overlay]`) in a string or template literal that is a class:
 *   - the value of a JSX attribute with a class name (`className`, `class`,
 *     `classNames`, `*ClassName`, `*ClassNames`, `*Class`), a property with
 *     such a name (a recipe slot's option, `content({ className: "…" })`) or
 *     the default of a parameter with one (`{ className = "…" }`), through
 *     conditionals, `&&`, arrays, objects, members, `+`, a method called on
 *     it (`[…].join(" ")`), a function that returns it (Base UI's
 *     `className={(state) => …}`) and one call that isn't a class helper
 *     (`className={wrap("…")}`);
 *   - an argument of a class helper (`cn`, `clsx`, `cx`, `tv`, `cva`,
 *     `twMerge`, `twJoin`, `classNames`), through the same, except a call
 *     that isn't a class helper: what `t("…")` takes inside `cn(…)` is its
 *     own, in a class attribute or outside one;
 *   - an argument of the call a JSX spread spreads (`{...guard("…")}`), but
 *     not under a key that isn't a class name, nor in a function;
 * - such a string in a `const` of the same file that is used as a class
 *   (`const log = "max-h-64 …"`, then `className={log}` or `cn(log)`),
 *   wherever in the file it is declared: a string, a list joined into one, a
 *   const built from another (`const b = \`p-2 ${a}\``), or an object or
 *   variant map, of which only the members read as a class count
 *   (`cls.body`), all of them when it is read by a computed key
 *   (`VARIANTS[kind]`) or used whole;
 * - a `style` whose `overflow`, `overflowX` or `overflowY` has `auto`,
 *   `scroll` or `overlay` in it (`"hidden auto"` too): in a `style` attribute,
 *   under a `style` key (`{...{ style: { … } }}`), or an object in a `const`
 *   of the same file that a `style` uses (`style={s}`, `style={styles.pre}`).
 *
 * The message follows the direction (down, sideways, both ways) and the
 * element the hit is on: a `<textarea>` gets ScrollAreaTextarea; `<pre>`,
 * `<html>`, `<body>` and `<iframe>` get no replacement, only the comment; a
 * `classNames` object, whose classes go to another component's elements,
 * gets `useScrollAreaContainer`; a ScrollArea's own class is to be removed.
 *
 * Allowed with a `raft-ui: native-scroll <reason>` comment, line or block:
 * on a line of its own right above the reported string, or at the end of
 * the string's own line. It covers the string that starts on that line only,
 * not the rest of the call or the attribute it is in, so a class added to a
 * multi-line `cn(...)` later is still reported; a comment at the end of a
 * line doesn't reach the next line. For a style, the line of its property. A
 * comment without a reason doesn't count.
 *
 * A const is resolved by scope where the linter gives one (a parameter of
 * the same name is not the const), and by its name in the file otherwise.
 *
 * Known misses: a class added by script (`el.classList.add(…)`,
 * `el.className = …`), a style set by script (`el.style.overflowY = "auto"`),
 * a const or object imported from another file, a `let`, a string a function
 * returns to a const, and CSS files.
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
/** The part of a scope this rule reads, to find the declaration a name refers to. */
export interface Scope {
  set?: Map<string, { defs?: { type: string; node: Node; parent?: Node | null }[] }>;
  upper?: Scope | null;
}
export interface SourceCode {
  text?: string;
  getAllComments(): Comment[];
  getLocFromIndex(index: number): Position;
  getScope?(node: Node): Scope | null;
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

// A class (group 1 its axis, 2 a keyword, 3 an arbitrary value) or an arbitrary
// property (group 4 its axis, 5 its value).
const OVERFLOW_CLASS =
  /(?<![\w-])overflow(?:-([xy]))?-(?:(auto|scroll)|\[([^\]\s]+)\])(?![\w-])|\[overflow(?:-([xy]))?:([^\]\s]+)\]/g;
const SCROLLING_VALUES = new Set(["auto", "scroll", "overlay"]);
const STYLE_AXES: Record<string, "" | "x" | "y"> = { overflow: "", overflowX: "x", overflowY: "y" };
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
const ESCAPE = /\braft-ui:\s*native-scroll\s+\S/;

/** The way a native scroller scrolls: down, sideways, or both ways. */
export type ScrollAxis = "vertical" | "horizontal" | "both";

/**
 * Adds the axes an overflow value scrolls to `axes`. `axis` is the property's (`x`, `y`), or
 * empty for `overflow` itself, whose one value is both axes and whose two are x then y.
 */
function addOverflowValue(
  axes: { x: boolean; y: boolean },
  axis: "" | "x" | "y",
  tokens: string[],
): void {
  const scrolls = tokens.map((token) =>
    SCROLLING_VALUES.has(token.replace(/^!|!(?:important)?$/g, "")),
  );
  if (axis === "x") axes.x ||= scrolls.includes(true);
  else if (axis === "y") axes.y ||= scrolls.includes(true);
  else {
    axes.x ||= scrolls[0] === true;
    axes.y ||= scrolls[scrolls.length > 1 ? 1 : 0] === true;
  }
}

function axisOf({ x, y }: { x: boolean; y: boolean }): ScrollAxis | undefined {
  if (x && y) return "both";
  return x ? "horizontal" : y ? "vertical" : undefined;
}

/**
 * The way a class string scrolls natively: `vertical` for `overflow-y-*`, `horizontal` for
 * `overflow-x-*`, `both` for `overflow-*` or the two together, undefined when it has no
 * native-scrolling class.
 */
export function nativeScrollAxis(value: string): ScrollAxis | undefined {
  if (!value.includes("overflow")) return undefined;
  const axes = { x: false, y: false };
  for (const match of value.matchAll(OVERFLOW_CLASS)) {
    const axis = (match[1] ?? match[4] ?? "") as "" | "x" | "y";
    // An arbitrary value separates its tokens with `_`: `overflow-[hidden_auto]`.
    addOverflowValue(axes, axis, (match[2] ?? match[3] ?? match[5] ?? "").split("_"));
  }
  return axisOf(axes);
}

/** The way a `style` property scrolls natively: `overflow: "hidden auto"` is `vertical`. */
export function nativeScrollStyleAxis(key: string, value: string): ScrollAxis | undefined {
  const axis = STYLE_AXES[key];
  if (axis === undefined) return undefined;
  const axes = { x: false, y: false };
  addOverflowValue(axes, axis, value.trim().split(/\s+/));
  return axisOf(axes);
}

/** Whether a class string has a native-scrolling class in it. */
export function hasNativeScrollClass(value: string): boolean {
  return nativeScrollAxis(value) !== undefined;
}

export function attributeName(node: Node): string | undefined {
  const name = node.name as Node | undefined;
  return name?.type === "JSXIdentifier" ? (name.name as string) : undefined;
}

/** The attribute, call or property that makes a node a class, or undefined when it isn't one. */
export function classContext(node: Node): Node | undefined {
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
    // A recipe slot's option: `content({ className: open && "…" })`.
    if (parent.type === "Property" && parent.value === child) {
      const key = propertyKey(parent);
      if (key !== undefined && CLASS_ATTRIBUTE.test(key)) return parent;
    }
    if (!PASS_THROUGH.has(parent.type)) return undefined;
    child = parent;
    parent = parent.parent;
  }
  return undefined;
}

/** The `const` declarator whose initializer holds `node` (through conditionals, arrays, calls), if any. */
export function constDeclarator(node: Node): Node | undefined {
  let parent = node.parent;
  while (parent) {
    if (parent.type === "VariableDeclarator") {
      const id = parent.id as Node | undefined;
      const declaration = parent.parent;
      return id?.type === "Identifier" && declaration?.kind === "const" ? parent : undefined;
    }
    if (!INIT_THROUGH.has(parent.type)) return undefined;
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

// This rule's own class names: also `classNames`, `*ClassNames` and a `*Class` prop
// (`positionClass`), but not one that reads as a yes or no (`isClass`, `hasErrorClass`).
const CLASS_NAME =
  /^(?:class|className|classNames|\w+ClassNames?|(?!(?:is|has|should)[A-Z])[a-z]\w*[a-z0-9]Class)$/;
// An object of classes for the parts another component renders.
const CONTAINER_CLASS_NAME = /^(?:classNames|\w+ClassNames)$/;
const SCROLL_AREAS = new Set(["ScrollArea", "PanelScrollViewport", "ScrollAreaTextarea"]);
const TEXTAREAS = new Set(["textarea", "Textarea"]);
// Elements a ScrollArea can't replace: a <pre> holds phrasing content only, the others are a document's own.
const NATIVE_ELEMENTS = new Set(["pre", "html", "body", "iframe"]);
// What a value passes through on its way to where it is used.
const VALUE_THROUGH = new Set([...PASS_THROUGH, "MemberExpression"]);
const WIDE_INIT_THROUGH = new Set([...INIT_THROUGH, "MemberExpression"]);
const FUNCTIONS = new Set(["ArrowFunctionExpression", "FunctionExpression"]);
const TYPE_WRAPPERS = new Set([
  "ParenthesizedExpression",
  "TSAsExpression",
  "TSNonNullExpression",
  "TSSatisfiesExpression",
]);

/**
 * What makes a node a class for this rule: a class attribute, a JSX spread, a class helper's
 * call, a property or a parameter default with a class name. Undefined when it isn't one.
 *
 * One call that isn't a class helper may stand between the node and a class attribute, a class
 * property or a spread (`className={wrap("…")}`, `{...guard("…")}`): its result is the class.
 * Inside a class helper such a call is not read, in an attribute or outside one
 * (`cn("p-2", t("…"))`): what it takes is its own. A spread takes only a call's arguments, and
 * none under a key that isn't a class name or inside a function.
 */
function classUse(node: Node): Node | undefined {
  let child = node;
  let parent = node.parent;
  let calls = 0;
  let underKey = false;
  let inFunction = false;
  while (parent) {
    if (parent.type === "JSXAttribute") {
      const name = attributeName(parent);
      return name !== undefined && CLASS_NAME.test(name) ? parent : undefined;
    }
    if (parent.type === "JSXSpreadAttribute") {
      return calls > 0 && !underKey && !inFunction ? parent : undefined;
    }
    if (parent.type === "CallExpression") {
      const callee = parent.callee as Node;
      if (callee === child) {
        // A method called on the value: `[…].join(" ")`, `"…".trim()`.
        if (child.type !== "MemberExpression") return undefined;
      } else if (!(parent.arguments as Node[]).includes(child)) {
        return undefined;
      } else if (callee.type === "Identifier" && CLASS_FUNCTIONS.has(callee.name as string)) {
        return calls === 0 && !inFunction ? parent : undefined;
      } else {
        if (calls > 0 || underKey || inFunction) return undefined;
        calls = 1;
      }
    } else if (parent.type === "Property") {
      if (parent.value === child) {
        const key = propertyKey(parent);
        if (key !== undefined && CLASS_NAME.test(key)) return parent;
        underKey = true;
      }
    } else if (parent.type === "AssignmentPattern") {
      // A default: `function Log({ className = "…" })`, `(className = "…") => …`.
      if (parent.right !== child) return undefined;
      const owner = parent.parent;
      const left = parent.left as Node;
      const name =
        owner?.type === "Property" && owner.value === parent
          ? propertyKey(owner)
          : left.type === "Identifier"
            ? (left.name as string)
            : undefined;
      return name !== undefined && CLASS_NAME.test(name) ? parent : undefined;
    } else if (parent.type === "ArrowFunctionExpression" && parent.body === child) {
      if (inFunction) return undefined;
      inFunction = true;
    } else if (parent.type === "ReturnStatement") {
      // What a function written in place returns: `className={(state) => { return "…"; }}`.
      let owner = parent.parent;
      while (owner && (owner.type === "BlockStatement" || owner.type === "IfStatement")) {
        owner = owner.parent;
      }
      if (!owner || !FUNCTIONS.has(owner.type) || inFunction) return undefined;
      inFunction = true;
      parent = owner;
    } else if (!VALUE_THROUGH.has(parent.type)) {
      return undefined;
    }
    child = parent;
    parent = parent.parent;
  }
  return undefined;
}

/**
 * What makes a node a style: a `style` attribute or a `style` property, through objects,
 * spreads, conditionals, members and one call. Undefined when it isn't one.
 */
function styleUse(node: Node): Node | undefined {
  let child = node;
  let parent = node.parent;
  let calls = 0;
  while (parent) {
    if (parent.type === "JSXAttribute") {
      return attributeName(parent) === "style" ? parent : undefined;
    }
    if (parent.type === "Property") {
      if (parent.value !== child) return undefined;
      if (propertyKey(parent) === "style") return parent;
    } else if (parent.type === "CallExpression") {
      if (!(parent.arguments as Node[]).includes(child) || calls > 0) return undefined;
      calls = 1;
    } else if (!VALUE_THROUGH.has(parent.type) || parent.type === "TemplateLiteral") {
      return undefined;
    }
    child = parent;
    parent = parent.parent;
  }
  return undefined;
}

/**
 * The `const` whose initializer holds `node`, and the member it is under when the initializer is
 * an object (`body` for a string in `const cls = { body: "…" }`): undefined for a string that
 * isn't under one member, which then counts whichever member is read.
 */
function constHolder(node: Node): { declarator: Node; member: string | undefined } | undefined {
  let child = node;
  let parent = node.parent;
  let member: string | undefined;
  let direct = true;
  while (parent) {
    if (parent.type === "VariableDeclarator") {
      const id = parent.id as Node | undefined;
      const isConst = id?.type === "Identifier" && parent.parent?.kind === "const";
      if (!isConst || parent.init !== child) return undefined;
      return { declarator: parent, member: direct ? member : undefined };
    }
    if (!WIDE_INIT_THROUGH.has(parent.type)) return undefined;
    if (parent.type === "Property") {
      member = parent.value === child ? propertyKey(parent) : undefined;
      direct = true;
    } else if (parent.type !== "ObjectExpression" && !TYPE_WRAPPERS.has(parent.type)) {
      direct = false;
    }
    child = parent;
    parent = parent.parent;
  }
  return undefined;
}

/** The member an identifier is read by (`body` in `cls.body`), or undefined for all of it. */
function memberRead(node: Node): string | undefined {
  const parent = node.parent;
  if (parent?.type !== "MemberExpression" || parent.object !== node) return undefined;
  const property = parent.property as Node;
  if (!parent.computed)
    return property.type === "Identifier" ? (property.name as string) : undefined;
  return stringValue(property);
}

type Target = "plain" | "area" | "textarea" | "native" | "container";
type MessageId =
  | "preferScrollArea"
  | "preferScrollAreaHorizontal"
  | "preferScrollAreaBoth"
  | "preferScrollAreaTextarea"
  | "preferScrollAreaContainer"
  | "nativeScrollElement"
  | "scrollAreaAlreadyScrolls";

function elementName(attribute: Node): string | undefined {
  const name = attribute.parent?.name as Node | undefined;
  if (name?.type === "JSXIdentifier") return name.name as string;
  // `<Raft.ScrollArea>`
  const property = name?.type === "JSXMemberExpression" ? (name.property as Node) : undefined;
  return property?.name as string | undefined;
}

/** What a hit is written on, from what makes it a class or a style: it decides the message. */
function targetOf(use: Node): Target {
  let node: Node | null | undefined = use;
  if (node.type === "Property") {
    const key = propertyKey(node);
    if (key !== undefined && CONTAINER_CLASS_NAME.test(key)) return "container";
  }
  // A class helper's call or a property is often inside an attribute: `<pre className={cn("…")}>`.
  while (node && node.type !== "JSXAttribute") {
    if (node.type === "JSXSpreadAttribute" || node.type === "JSXElement") return "plain";
    if (node.type === "JSXFragment" || node.type === "VariableDeclarator") return "plain";
    node = node.parent;
  }
  if (!node) return "plain";
  const name = attributeName(node);
  if (name !== undefined && CONTAINER_CLASS_NAME.test(name)) return "container";
  // Only the element's own class or style: `contentClassName` goes to another element.
  if (name !== "className" && name !== "class" && name !== "style") return "plain";
  const element = elementName(node) ?? "";
  if (SCROLL_AREAS.has(element)) return "area";
  if (TEXTAREAS.has(element)) return "textarea";
  return NATIVE_ELEMENTS.has(element) ? "native" : "plain";
}

function messageFor(target: Target, axis: ScrollAxis): MessageId {
  if (target === "area") return "scrollAreaAlreadyScrolls";
  if (target === "textarea") return "preferScrollAreaTextarea";
  if (target === "native") return "nativeScrollElement";
  if (target === "container") return "preferScrollAreaContainer";
  if (axis === "both") return "preferScrollAreaBoth";
  return axis === "horizontal" ? "preferScrollAreaHorizontal" : "preferScrollArea";
}

const DOCS = "Docs: https://raft-design.botiverse.build/components/scroll-area.md";
const OPT_OUT =
  'Only a region that must scroll natively (see the allowed cases in the docs) takes "// raft-ui: native-scroll <reason>" on the line above.';
const WHERE_CLASSES_GO =
  "Sizing classes (max-h-*, flex-1, min-h-0) stay on the area; grid/flex/gap/padding go on contentClassName.";
const AREA_CLASSES = 'className="…sizing…" contentClassName="…layout, gap, padding…"';

/** A native scroller found in a const: reported once the const is seen used as a class or a style. */
interface ConstHit {
  node: Node;
  /** The node whose line an escape comment covers. */
  anchor: Node;
  axis: ScrollAxis;
  /** The member of the const's object it is under, if it is under one. */
  member: string | undefined;
}
/** A name read where a class or a style goes, or in another const's initializer. */
interface Read {
  identifier: Node;
  /** The member it is read by, or undefined for all of it. */
  member: string | undefined;
}
interface Use extends Read {
  target: Target;
}
interface Reference extends Read {
  /** The const whose initializer reads it, and the member of that const it is under. */
  owner: Node;
  ownerMember: string | undefined;
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
      preferScrollArea: `Use ScrollArea from @botiverse/raft-ui for a scrolling region: <ScrollArea ${AREA_CLASSES}>…</ScrollArea> (inside a Panel: PanelScrollViewport). ${WHERE_CLASSES_GO} ${OPT_OUT} ${DOCS}`,
      preferScrollAreaHorizontal: `Use ScrollArea from @botiverse/raft-ui for a region that scrolls sideways: <ScrollArea orientation="horizontal" ${AREA_CLASSES}>…</ScrollArea> (around a wide table: TableScroll). ${WHERE_CLASSES_GO} ${OPT_OUT} ${DOCS}`,
      preferScrollAreaBoth: `Use ScrollArea from @botiverse/raft-ui for a region that scrolls both ways: <ScrollArea orientation="both" ${AREA_CLASSES}>…</ScrollArea>. Leave orientation out (vertical, the default) only when nothing inside is wider than the area: a vertical area cuts off what is. ${WHERE_CLASSES_GO} ${OPT_OUT} ${DOCS}`,
      preferScrollAreaTextarea: `Use ScrollAreaTextarea from @botiverse/raft-ui for a textarea that scrolls: <ScrollAreaTextarea wrapperClassName="…border, background, focus ring…" className="…padding…" />. A <textarea> can't hold ScrollArea's scrollbars, so ScrollAreaTextarea draws them over a frame around it. ${OPT_OUT} ${DOCS}`,
      preferScrollAreaContainer: `These classes go to an element another component renders, so a ScrollArea can't take its place. Bind that element: const { containerProps, guttersProps } = useScrollAreaContainer(); give it containerProps (ref, className, style) and render <ScrollAreaGutters {...guttersProps} /> as its first child, with no overflow class ("Your own container" in the docs). Where the component takes neither, it scrolls natively: say so in "// raft-ui: native-scroll <reason>" on the line above. ${DOCS}`,
      nativeScrollElement: `A ScrollArea can't take the place of this element (<pre>, <html>, <body>, <iframe>), so there is nothing to write instead. It may scroll natively only as one of the allowed cases in the docs (a <pre> of code is one, since it holds phrasing content only): say which in "// raft-ui: native-scroll <reason>" on the line above. ${DOCS}`,
      scrollAreaAlreadyScrolls: `ScrollArea already scrolls: remove the overflow class (or style) and set the direction with orientation="vertical" (the default), "horizontal" or "both". ${DOCS}`,
    },
    schema: [],
  },
  create(context: RuleContext): RuleVisitor {
    const sourceCode = context.sourceCode ?? context.getSourceCode?.();
    let escapeLines: Set<number> | undefined;

    function line(index: number): number {
      return sourceCode!.getLocFromIndex(index).line;
    }

    /**
     * The lines an escape comment covers: the one it ends on, and the next when the comment has
     * its line to itself (after `{` too: `{/* … *\/}` between JSX children). A comment at the
     * end of a line of code covers that line only.
     */
    function escaped(): Set<number> {
      if (escapeLines) return escapeLines;
      escapeLines = new Set();
      const text = sourceCode?.text;
      for (const comment of sourceCode?.getAllComments() ?? []) {
        if (!ESCAPE.test(comment.value)) continue;
        const end = comment.loc?.end.line ?? line(comment.range![1]);
        escapeLines.add(end);
        let ownLine = true;
        if (text !== undefined && comment.range) {
          const start = comment.range[0];
          const before = text.slice(text.lastIndexOf("\n", start - 1) + 1, start).trim();
          ownLine = before === "" || before === "{";
        }
        if (ownLine) escapeLines.add(end + 1);
      }
      return escapeLines;
    }

    function startLine(node: Node): number {
      return node.loc?.start.line ?? line(node.range![0]);
    }

    const reported = new Set<Node>();

    /** Reports `node`, once, unless an escape comment covers the line `anchor` starts on. */
    function report(node: Node, anchor: Node, messageId: MessageId): void {
      if (reported.has(node)) return;
      reported.add(node);
      const lines = escaped();
      if (lines.size > 0 && lines.has(startLine(anchor))) return;
      context.report({ node, messageId });
    }

    // What each const holds (its scrolling class strings, its scrolling style properties), the
    // names read where a class or a style goes, and the names read in a const's initializer.
    // Matched at the end of the file, so a const declared after its use counts, and only in a
    // file that has such a const: most have none, and resolve nothing.
    const classHits = new Map<Node, ConstHit[]>();
    const styleHits = new Map<Node, ConstHit[]>();
    const classUses: Use[] = [];
    const styleUses: Use[] = [];
    const references: Reference[] = [];

    function hold(hits: Map<Node, ConstHit[]>, declarator: Node, hit: ConstHit): void {
      const list = hits.get(declarator);
      if (list) list.push(hit);
      else hits.set(declarator, [hit]);
    }

    function checkClassString(node: Node, value: string): void {
      const axis = nativeScrollAxis(value);
      if (axis === undefined) return;
      // The string itself is what a comment escapes, never the call or attribute it is in.
      const use = classUse(node);
      if (use) return report(node, node, messageFor(targetOf(use), axis));
      const holder = constHolder(node);
      if (holder)
        hold(classHits, holder.declarator, { node, anchor: node, axis, member: holder.member });
    }

    /** The consts a name refers to: the one its scope resolves it to, or every one of that name. */
    function resolver(): (identifier: Node) => Node[] {
      const byName = new Map<string, Node[]>();
      const owners = [...classHits.keys(), ...styleHits.keys(), ...references.map((r) => r.owner)];
      for (const declarator of new Set(owners)) {
        const name = (declarator.id as Node).name as string;
        byName.set(name, [...(byName.get(name) ?? []), declarator]);
      }
      return (identifier) => {
        const name = identifier.name as string;
        const named = byName.get(name);
        if (!named) return [];
        let scope: Scope | null | undefined;
        try {
          scope = sourceCode?.getScope?.(identifier);
        } catch {
          scope = undefined;
        }
        if (!scope?.set) return named;
        for (let current: Scope | null | undefined = scope; current; current = current.upper) {
          const variable = current.set?.get(name);
          if (!variable) continue;
          // A parameter, an import or a `let` of that name is not the const.
          const definition = variable.defs?.[0];
          return definition?.type === "Variable" && named.includes(definition.node)
            ? [definition.node]
            : [];
        }
        return [];
      };
    }

    /** Reports what the used consts hold, and what the consts they are built from hold. */
    function reportUsed(
      uses: Use[],
      hits: Map<Node, ConstHit[]>,
      resolve: (identifier: Node) => Node[],
    ): void {
      if (hits.size === 0 || uses.length === 0) return;
      const referencesOf = new Map<Node, Reference[]>();
      for (const reference of references) {
        referencesOf.set(reference.owner, [
          ...(referencesOf.get(reference.owner) ?? []),
          reference,
        ]);
      }
      // Each used const, with the members read (undefined: all) and what it is used on.
      const used = new Map<Node, { members: Set<string> | undefined; target: Target }>();
      for (const use of uses) {
        for (const declarator of resolve(use.identifier)) {
          const entry = used.get(declarator);
          if (!entry) {
            const members = use.member === undefined ? undefined : new Set([use.member]);
            used.set(declarator, { members, target: use.target });
            continue;
          }
          if (use.member === undefined) entry.members = undefined;
          else entry.members?.add(use.member);
          // Used on different kinds of element: the message that says what to write on a plain one.
          if (entry.target !== use.target) entry.target = "plain";
        }
      }
      const visiting = new Set<Node>();
      function visit(declarator: Node, members: Set<string> | undefined, target: Target): void {
        if (visiting.has(declarator)) return;
        visiting.add(declarator);
        const read = (member: string | undefined) =>
          member === undefined || members === undefined || members.has(member);
        for (const hit of hits.get(declarator) ?? []) {
          if (read(hit.member)) report(hit.node, hit.anchor, messageFor(target, hit.axis));
        }
        for (const reference of referencesOf.get(declarator) ?? []) {
          if (!read(reference.ownerMember)) continue;
          const inner = reference.member === undefined ? undefined : new Set([reference.member]);
          for (const next of resolve(reference.identifier)) visit(next, inner, target);
        }
        visiting.delete(declarator);
      }
      // A const also reached from a plain element keeps the message that says what to write there.
      const order = [...used].sort(
        ([, a], [, b]) => Number(a.target !== "plain") - Number(b.target !== "plain"),
      );
      for (const [declarator, { members, target }] of order) visit(declarator, members, target);
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
        // A property's own name (`{ className: … }`) is not a use of a const; a
        // shorthand one (`{ className }`) is both, and is. Nor is a member's
        // name (`styles.log`) or the name a const is declared with.
        const isKey = parent?.type === "Property" && parent.key === node && !parent.computed;
        if (isKey && !parent.shorthand) return;
        if (parent?.type === "MemberExpression" && parent.property === node && !parent.computed) {
          return;
        }
        if (parent?.type === "VariableDeclarator" && parent.id === node) return;
        const member = memberRead(node);
        const style = styleUse(node);
        if (style) {
          styleUses.push({ identifier: node, member, target: targetOf(style) });
        } else {
          const use = classUse(node);
          if (use) classUses.push({ identifier: node, member, target: targetOf(use) });
        }
        // `const b = \`p-2 ${a}\``: what `a` holds is in `b` too.
        const holder = constHolder(node);
        if (holder) {
          references.push({
            identifier: node,
            member,
            owner: holder.declarator,
            ownerMember: holder.member,
          });
        }
      },
      Property(node: Node): void {
        const key = propertyKey(node);
        if (key === undefined || !(key in STYLE_AXES)) return;
        let style: Node | undefined;
        let holder: ReturnType<typeof constHolder>;
        let looked = false;
        for (const literal of styleValueStrings(node.value as Node, [])) {
          const axis = nativeScrollStyleAxis(key, stringValue(literal)!);
          if (axis === undefined) continue;
          if (!looked) {
            looked = true;
            style = styleUse(node);
            holder = style ? undefined : constHolder(node);
          }
          if (style) report(literal, node, messageFor(targetOf(style), axis));
          else if (holder) {
            hold(styleHits, holder.declarator, {
              node: literal,
              anchor: node,
              axis,
              member: holder.member,
            });
          }
        }
      },
      "Program:exit"(): void {
        if (classHits.size === 0 && styleHits.size === 0) return;
        const resolve = resolver();
        reportUsed(classUses, classHits, resolve);
        reportUsed(styleUses, styleHits, resolve);
      },
    };
  },
};
