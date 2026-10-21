import "./row-hover.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "./theme/theme-provider";
import { ListRow } from "../components/list-row/list-row";
import { MessageItem, MessageItemBody, MessageItemContent } from "../components/message-item";
import { SidebarItem, SidebarItemTitle } from "../components/sidebar/sidebar-item";

// Row hover (design/foundations/states.md#row-hover): a row hovers with the
// lightest step people can see, lighter than its press and than selection,
// so text read on it keeps its contrast. Rows used to hover with
// fill-pressed (7.8% ink), which took 11 APCA Lc off a message's body text in
// light mode. Measured in a real browser: :hover needs a real pointer.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

async function settled(read: () => string): Promise<string> {
  let prev = "";
  let next = read();
  for (let i = 0; i < 40 && next !== prev; i += 1) {
    prev = next;
    await new Promise((r) => setTimeout(r, 50));
    next = read();
  }
  return next;
}

type Rgba = [number, number, number, number];

// oklch() -> sRGB (0..1) with alpha; Chrome serializes these tokens as oklch.
function parseOklch(value: string): Rgba {
  const m = /oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(value);
  if (!m) throw new Error(`not an oklch color: ${value}`);
  const [L, C, h] = [Number(m[1]), Number(m[2]), (Number(m[3]) * Math.PI) / 180];
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  const enc = lin.map((x) => {
    const v = Math.min(1, Math.max(0, x));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  });
  return [enc[0]!, enc[1]!, enc[2]!, m[4] === undefined ? 1 : Number(m[4])];
}

function over(top: Rgba, base: Rgba): Rgba {
  const t = top[3];
  return [0, 1, 2].map((i) => top[i]! * t + base[i]! * (1 - t)).concat(1) as Rgba;
}

function wcagY(c: Rgba) {
  const [r, g, b] = c
    .slice(0, 3)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function wcag(a: Rgba, b: Rgba) {
  const [hi, lo] = [wcagY(a), wcagY(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

// APCA-W3 0.1.9, |Lc|.
function apca(text: Rgba, bg: Rgba) {
  const ys = (c: Rgba) =>
    0.2126729 * c[0] ** 2.4 + 0.7151522 * c[1] ** 2.4 + 0.072175 * c[2] ** 2.4;
  const clamp = (y: number) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
  const yt = clamp(ys(text));
  const yb = clamp(ys(bg));
  const s = yb > yt ? (yb ** 0.56 - yt ** 0.57) * 1.14 : (yb ** 0.65 - yt ** 0.62) * 1.14;
  if (Math.abs(s) < 0.1) return 0;
  return Math.abs(s > 0 ? s - 0.027 : s + 0.027) * 100;
}

// The value a token resolves to in this mode, as Chrome serializes it.
function token(scope: HTMLElement, name: string) {
  const probe = document.createElement("div");
  probe.style.backgroundColor = `var(--${name})`;
  scope.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

const firstOklch = (value: string) => /oklch\([^)]*\)/.exec(value)?.[0] ?? value;

const rows = [
  // A message: the lightest step, its body text loses at most 5 Lc.
  { id: "message", surface: "layer-canvas", fill: "fill-message-hover", maxDrop: 5, read: "color" },
  // Compact rows: one step, at most 6 Lc.
  { id: "sidebar", surface: "layer-sidebar", fill: "fill-row-hover", maxDrop: 6, read: "color" },
  { id: "list-row", surface: "layer-card", fill: "fill-row-hover", maxDrop: 6, read: "image" },
] as const;

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: rows hover with the row-hover tokens, and text keeps its contrast`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode} data-testid="scope">
          <div className="bg-layer-canvas p-2">
            <MessageItem data-testid="message">
              <MessageItemContent>
                <MessageItemBody>
                  A long message someone reads with the pointer resting on it.
                </MessageItemBody>
              </MessageItemContent>
            </MessageItem>
          </div>
          <div className="bg-layer-sidebar p-2">
            <SidebarItem data-testid="sidebar">
              <SidebarItemTitle>launch-week</SidebarItemTitle>
            </SidebarItem>
          </div>
          <div className="bg-layer-card p-2">
            <ListRow data-testid="list-row">Wug</ListRow>
          </div>
        </div>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    await userEvent.unhover(document.body);
    const scope = getByTestId("scope");
    const ink = parseOklch(token(scope, "foreground"));
    const hint = token(scope, "foreground-hint");

    for (const row of rows) {
      const el = getByTestId(row.id);
      await page.getByTestId(row.id).hover();
      const read = () =>
        row.read === "color"
          ? getComputedStyle(el).backgroundColor
          : firstOklch(getComputedStyle(el).backgroundImage);
      const fill = await settled(read);
      expect(fill, `${mode} ${row.id} hovers with ${row.fill}`).toBe(token(scope, row.fill));

      const surface = parseOklch(token(scope, row.surface));
      const hovered = over(parseOklch(fill), surface);
      const drop = apca(ink, surface) - apca(ink, hovered);
      expect(drop, `${mode} ${row.id}: body text loses ${drop.toFixed(1)} Lc`).toBeLessThanOrEqual(
        row.maxDrop,
      );
      const hintOnHover = over(parseOklch(hint), hovered);
      expect(wcag(hintOnHover, hovered), `${mode} ${row.id}: hint text`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
  });
}
