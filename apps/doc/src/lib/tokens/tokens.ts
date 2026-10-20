import tokensJson from "../../../../../packages/ui/src/tokens.json";

// Reads packages/ui/src/tokens.json (Design Tokens Community Group format, the
// single source of foundation.css) for the docs' `tokens` blocks. Token names
// and CSS properties follow scripts/build-tokens.mjs: `{group.name}` is
// `--group-name`, and `$root` names the group itself.

const EXT = "build.botiverse.raft";

type OklchValue = { colorSpace: "oklch"; components: [number, number, number]; alpha?: number };
type DimensionValue = { value: number; unit: string };
type RawValue = string | number | OklchValue | DimensionValue;
type RawToken = {
  $value: RawValue;
  $type?: string;
  $description?: string;
  $extensions?: Record<
    string,
    { modes?: { dark?: RawValue }; desktop?: RawValue; css?: boolean; scope?: string }
  >;
};
type RawGroup = { [key: string]: RawGroup | RawToken | string | undefined; $type?: string };

export type TokenValue = {
  /** What a reader sees: `#ffd440`, `#141111 / 45%`, `16px`, or the CSS expression. */
  display: string;
  /** The token it points to, when the value is a reference: `palette-yellow-400`. */
  reference?: string;
};

export type TokenRow = {
  /** `layer-canvas`; the CSS custom property is `--layer-canvas`. */
  name: string;
  cssVar: string;
  type: string;
  light: TokenValue;
  dark: TokenValue;
  /** The value from 768px with a fine pointer (a desktop); `light` is then the phone's. */
  desktop?: TokenValue;
  description?: string;
};

const ROOT = tokensJson as unknown as RawGroup;

function isToken(node: unknown): node is RawToken {
  return typeof node === "object" && node !== null && "$value" in node;
}

function nameOf(path: readonly string[]) {
  const parts = path.filter((part) => part !== "$root");
  return (parts[0] === "deprecated" ? parts.slice(1) : parts).join("-");
}

function lookup(path: readonly string[]): RawToken | undefined {
  let node: unknown = ROOT;
  for (const part of path) node = (node as RawGroup | undefined)?.[part];
  if (isToken(node)) return node;
  const root = (node as RawGroup | undefined)?.$root;
  return isToken(root) ? root : undefined;
}

function toHexChannel(linear: number) {
  const encoded = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, encoded)) * 255)
    .toString(16)
    .padStart(2, "0");
}

/** OKLCH → sRGB hex (gamut-clipped), the notation designers read. */
export function oklchToHex([lightness, chroma, hue]: readonly [number, number, number]) {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const red = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`;
}

function formatValue(value: RawValue, mode: "light" | "dark", depth = 0): TokenValue {
  if (typeof value === "string") {
    const reference = value.match(/^\{([^{}]+)\}$/);
    if (reference && depth < 8) {
      const path = reference[1]!.split(".");
      const target = lookup(path);
      if (target) {
        const resolved = formatValue(valueIn(target, mode), mode, depth + 1);
        return { display: resolved.display, reference: nameOf(path) };
      }
    }
    return { display: value };
  }
  if (typeof value === "number") return { display: String(value) };
  if ("colorSpace" in value) {
    const hex = oklchToHex(value.components);
    return {
      display: value.alpha === undefined ? hex : `${hex} / ${Math.round(value.alpha * 100)}%`,
    };
  }
  return { display: `${value.value}${value.unit}` };
}

function valueIn(token: RawToken, mode: "light" | "dark"): RawValue {
  if (mode === "dark") return token.$extensions?.[EXT]?.modes?.dark ?? token.$value;
  return token.$value;
}

function* walk(node: RawGroup, path: string[], type?: string): Generator<TokenRow> {
  const groupType = node.$type ?? type;
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$") && key !== "$root") continue;
    const childPath = [...path, key];
    if (isToken(child)) {
      const name = nameOf(childPath);
      const desktop = child.$extensions?.[EXT]?.desktop;
      yield {
        name,
        cssVar: `--${name}`,
        type: child.$type ?? groupType ?? "",
        light: formatValue(child.$value, "light"),
        dark: formatValue(valueIn(child, "dark"), "dark"),
        ...(desktop === undefined ? {} : { desktop: formatValue(desktop, "light") }),
        description: child.$description,
      };
    } else if (child && typeof child === "object") {
      yield* walk(child as RawGroup, childPath, groupType);
    }
  }
}

/** The token groups a `tokens` block can name: the top-level keys of tokens.json. */
export const TOKEN_GROUPS = Object.keys(ROOT).filter((key) => !key.startsWith("$"));

/**
 * A group's tokens. A dotted name (`palette.yellow`) selects a subgroup.
 * Returns null for a name tokens.json does not have.
 */
export function tokenGroup(group: string): TokenRow[] | null {
  const path = group.split(".");
  let node: unknown = ROOT;
  let type: string | undefined;
  for (const part of path) {
    type = (node as RawGroup).$type ?? type;
    node = (node as RawGroup | undefined)?.[part];
  }
  if (!node || typeof node !== "object" || isToken(node)) return null;
  return [...walk(node as RawGroup, path, type)];
}
