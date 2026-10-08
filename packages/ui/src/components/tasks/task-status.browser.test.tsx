import "./task-status.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
import { Timeline, TimelineItem, TimelineTitle } from "../timeline/timeline";
import { TaskCardStatus } from "../task-card/task-card";
import { TaskSectionBadge } from "../task-list/task-list";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskStatusIcon } from "./task-status-icon";
import { TASK_STATUS_IDS } from "./task-status.recipe";
import type { TaskStatusId } from "./task-status.recipe";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const THEMES: readonly { key: string; theme: Theme; mode?: ThemeMode }[] = [
  { key: "brutal", theme: "brutal" },
  { key: "elegant light", theme: "elegant", mode: "light" },
  { key: "elegant dark", theme: "elegant", mode: "dark" },
];

/**
 * The hue family each status must keep in EVERY theme: orange / blue / purple /
 * green, plus `closed` which is intentionally NEUTRAL (so it is checked by
 * chroma, not hue — comparing the hue of a grey would pass or fail at random).
 */
const HUE_ANCHORS: Record<TaskStatusId, { hue?: number; maxChroma?: number }> = {
  todo: { hue: 45 },
  "in-progress": { hue: 220 },
  "in-review": { hue: 294 },
  done: { hue: 153 },
  closed: { maxChroma: 0.05 },
};

/** Max hue separation still counted as one family — sized to admit the real
 *  brutal↔elegant pairs (the widest is green: lime 130 vs success 153) while
 *  rejecting the mismatches this change replaced (60°+). */
const HUE_TOLERANCE = 30;

// ── colour math ─────────────────────────────────────────────────────────────

type Rgb = [number, number, number];

/** Parse `rgb()`/`rgba()`/`oklch()` — including the multi-line form the CSS
 *  formatter emits — into sRGB 0–1 plus an alpha (default 1). */
function parseColor(value: string): { rgb: Rgb; alpha: number } {
  const v = value.trim();
  const rgbMatch = /^rgba?\(([^)]+)\)$/.exec(v);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    const [r, g, b] = parts;
    return { rgb: [r / 255, g / 255, b / 255], alpha: parts[3] ?? 1 };
  }
  const oklch = /oklch\(([^)]+)\)/.exec(v);
  expect(oklch, `unparsable color: ${value}`).not.toBeNull();
  const parts = oklch![1].split(/[\s,/]+/).filter(Boolean);
  const rawL = parts[0];
  const L = rawL.endsWith("%") ? Number(rawL.slice(0, -1)) / 100 : Number(rawL);
  const C = Number(parts[1]);
  const H = Number(parts[2]);
  const alpha = parts[3] === undefined ? 1 : Number(parts[3]);
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const toSrgb = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055;
  const rgb: Rgb = [
    toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ].map((x) => Math.min(1, Math.max(0, x))) as Rgb;
  return { rgb, alpha };
}

function composite(fg: { rgb: Rgb; alpha: number }, bg: Rgb): Rgb {
  return [
    fg.rgb[0] * fg.alpha + bg[0] * (1 - fg.alpha),
    fg.rgb[1] * fg.alpha + bg[1] * (1 - fg.alpha),
    fg.rgb[2] * fg.alpha + bg[2] * (1 - fg.alpha),
  ];
}

function luminance([r, g, b]: Rgb) {
  const f = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(a: Rgb, b: Rgb) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Luminance channels → OKLab hue (deg) and chroma, for family assertions. */
function oklabOf(rgb: Rgb): { hue: number; chroma: number } {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = rgb.map(lin) as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { hue: (Math.atan2(bb, a) * 180) / Math.PI, chroma: Math.hypot(a, bb) };
}

function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** The effective background a translucent fill sits on. The themed scope
 *  carries a real page colour; `document.body` can be transparent. */
function scopeBackground(scope: HTMLElement): Rgb {
  for (const el of [scope, document.body, document.documentElement]) {
    const c = parseColor(getComputedStyle(el).backgroundColor);
    if (c.alpha > 0) return c.rgb;
  }
  return [1, 1, 1];
}

/** The marker paints a filled dot in Brutal and a hollow ring in Elegant, so
 *  the status colour lands on the background OR the border — take whichever is
 *  actually opaque, composited over the scope. */
function markerFill(dot: HTMLElement, scopeBg: Rgb): Rgb {
  const style = getComputedStyle(dot);
  const bg = parseColor(style.backgroundColor);
  if (bg.alpha > 0.05) return composite(bg, scopeBg);
  const border = parseColor(style.borderTopColor || style.borderColor);
  return composite(border, scopeBg);
}

/** One status's four parts, rendered together. */
function Harness() {
  return (
    // A real themed surface: soft/translucent fills composite over it exactly
    // as they do in the app (a bare test node has a transparent background,
    // which would composite washes over nothing).
    <div data-testid="status-scope" className="bg-layer-panel">
      {TASK_STATUS_IDS.map((status) => (
        <div key={status}>
          <TaskStatusIcon status={status} data-testid={`icon-${status}`} />
          <TaskStatusBadge status={status} data-testid={`badge-${status}`}>
            {status}
          </TaskStatusBadge>
        </div>
      ))}
      <Timeline>
        {TASK_STATUS_IDS.map((status) => (
          <TimelineItem key={status} taskStatus={status} data-testid={`timeline-${status}`}>
            <TimelineTitle>{status}</TimelineTitle>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}

it("each status renders its own lucide glyph — a swap cannot pass", () => {
  render(
    <ThemeProvider theme="brutal">
      <Harness />
    </ThemeProvider>,
  );
  // The task-status icons are the app's lucide set; lucide stamps a
  // `lucide-<name>` class on each svg, so pin the specific glyph per status so
  // an accidental swap (e.g. in-review pointed at the todo icon) fails here.
  const EXPECTED: Record<TaskStatusId, string> = {
    todo: "lucide-circle",
    "in-progress": "lucide-play",
    "in-review": "lucide-eye",
    done: "lucide-circle-check-big",
    closed: "lucide-ban",
  };
  for (const status of TASK_STATUS_IDS) {
    const icon = screen.getByTestId(`icon-${status}`);
    expect(icon.getAttribute("class"), `${status} is not ${EXPECTED[status]}`).toContain(
      EXPECTED[status],
    );
  }
});

for (const { key, theme, mode } of THEMES) {
  it(`TaskStatusBadge shape follows the theme — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <div data-testid="badge-scope">
          <TaskStatusBadge status="in-progress" data-testid="shape-badge">
            In Progress
          </TaskStatusBadge>
        </div>
      </ThemeProvider>,
    );
    // Brutal is a hard-edged square tag (same treatment as the brutal TaskChip:
    // square, black keyline); Elegant is a pill. An earlier revision applied
    // `rounded-full` in both themes, turning the brutal tag into a pill.
    const style = getComputedStyle(screen.getByTestId("shape-badge"));
    const radius = parseFloat(style.borderTopLeftRadius);
    if (theme === "brutal") {
      expect(radius, "brutal status badge must be square").toBe(0);
      // Match slock's existing brutal status badge exactly: bold text and a
      // 16px line-height, so the badge measures 20px tall (it was medium and
      // 20.8px before).
      expect(style.fontWeight, "brutal status badge is bold").toBe("700");
      expect(
        screen.getByTestId("shape-badge").getBoundingClientRect().height,
        "brutal status badge is 20px tall",
      ).toBe(20);
    } else {
      expect(radius, "elegant status badge stays a pill").toBeGreaterThan(0);
    }
  });

  it(`board/list status shows the icon without a solid fill in Elegant — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <div className="bg-layer-panel" data-testid="board-scope">
          <TaskCardStatus status="in-progress" data-testid="card-status">
            In Progress
          </TaskCardStatus>
          <TaskSectionBadge status="in-review" data-testid="section-badge">
            In Review
          </TaskSectionBadge>
        </div>
      </ThemeProvider>,
    );
    // Regression guard (Josh, rui#372): the board card / task list status was a
    // coloured ICON in Elegant. An earlier revision spread the Brutal solid fill
    // across both themes, turning it into a solid block that hid the icon.
    // Elegant must keep a transparent surface; only Brutal fills it.
    for (const id of ["card-status", "section-badge"]) {
      const el = screen.getByTestId(id);
      const bg = parseColor(getComputedStyle(el).backgroundColor);
      if (theme === "brutal") {
        expect(bg.alpha, `${key}/${id}: Brutal should fill`).toBeGreaterThan(0.5);
      } else {
        expect(bg.alpha, `${key}/${id}: Elegant must NOT paint a solid fill`).toBeLessThanOrEqual(
          0.05,
        );
      }
    }
  });

  it(`every status keeps its hue family — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId("status-scope");
    const scopeBg = scopeBackground(scope);
    for (const status of TASK_STATUS_IDS) {
      const anchor = HUE_ANCHORS[status];
      // Read the ACTUAL rendered badge fill (composited over the scope), not the
      // raw token string — soft fills are translucent in Elegant dark.
      const badge = screen.getByTestId(`badge-${status}`);
      const fill = composite(parseColor(getComputedStyle(badge).backgroundColor), scopeBg);
      const { hue, chroma } = oklabOf(fill);
      if (anchor.hue !== undefined) {
        expect(
          hueDistance(hue, anchor.hue),
          `${key}/${status}: rendered hue ${hue.toFixed(0)} is not the ${anchor.hue} family`,
        ).toBeLessThanOrEqual(HUE_TOLERANCE);
      }
      if (anchor.maxChroma !== undefined) {
        expect(
          chroma,
          `${key}/${status}: expected a near-neutral chroma, got ${chroma.toFixed(3)}`,
        ).toBeLessThanOrEqual(anchor.maxChroma);
      }
    }
  });

  it(`icon, badge and Timeline dot all resolve the SAME status token — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId("status-scope");
    const scopeBg = scopeBackground(scope);
    for (const status of TASK_STATUS_IDS) {
      // The one token, resolved once, is the reference value.
      const token = parseColor(
        getComputedStyle(scope).getPropertyValue(`--task-status-${status}`).trim(),
      );
      const tokenFilled = composite(token, scopeBg);
      const tokenHue = oklabOf(tokenFilled).hue;

      // Badge fill must equal the token (composited the same way). This is the
      // equality the acceptance criterion asks for — not token-vs-itself.
      const badge = screen.getByTestId(`badge-${status}`);
      const badgeFill = composite(parseColor(getComputedStyle(badge).backgroundColor), scopeBg);
      expect(
        hueDistance(oklabOf(badgeFill).hue, tokenHue),
        `${key}/${status}: badge fill hue != token hue`,
      ).toBeLessThanOrEqual(HUE_TOLERANCE);

      // Timeline dot must carry the token color (as fill in Brutal, as ring in
      // Elegant) — whichever channel is actually painted.
      const dot = screen
        .getByTestId(`timeline-${status}`)
        .querySelector<HTMLElement>(".r-timeline-item__marker");
      expect(dot).not.toBeNull();
      expect(
        hueDistance(oklabOf(markerFill(dot!, scopeBg)).hue, tokenHue),
        `${key}/${status}: Timeline dot hue drifted from the token`,
      ).toBeLessThanOrEqual(HUE_TOLERANCE);

      // The ICON must also be in the same family. Only Elegant colours the icon
      // by status (its own ink per state, the `-strong` slot); Brutal inherits
      // the badge's currentColor (ink), so a hue assertion there is meaningless.
      // Scoping to Elegant is what makes a wrong-status icon assignment fail.
      if (theme === "elegant") {
        const strongToken = parseColor(
          getComputedStyle(scope).getPropertyValue(`--task-status-${status}-strong`).trim(),
        );
        const strongHue = oklabOf(composite(strongToken, scopeBg)).hue;
        const icon = screen.getByTestId(`icon-${status}`);
        const iconColor = parseColor(getComputedStyle(icon).color).rgb;
        expect(
          hueDistance(oklabOf(iconColor).hue, strongHue),
          `${key}/${status}: icon hue drifted from the status strong token`,
        ).toBeLessThanOrEqual(HUE_TOLERANCE);
      }
    }
  });

  it(`badge text meets 4.5:1 on its REAL background — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scopeBg = scopeBackground(screen.getByTestId("status-scope"));
    for (const status of TASK_STATUS_IDS) {
      // Closed is DISABLED-styled on purpose (Artea/Josh): disabled text is not
      // expected to clear body contrast, so it is asserted separately below.
      if (status === "closed") continue;
      const badge = screen.getByTestId(`badge-${status}`);
      const style = getComputedStyle(badge);
      const fg = parseColor(style.color);
      const bg = composite(parseColor(style.backgroundColor), scopeBg);
      const ratio = contrastRatio(composite(fg, bg), bg);
      expect(
        ratio,
        `${key}/${status}: rendered text contrast ${ratio.toFixed(2)}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it(`Closed reads as the disabled token — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    // Closed is deliberately styled like a disabled control and is EXEMPT from
    // the 4.5:1 body rule (disabled styles do not promise body contrast).
    // Assert identity with the disabled token, not a ratio.
    const scope = screen.getByTestId("status-scope");
    const scopeBg = scopeBackground(scope);
    const closed = screen.getByTestId("badge-closed");
    const closedInk = parseColor(getComputedStyle(closed).color).rgb;

    if (theme !== "brutal") {
      const disabled = parseColor(
        getComputedStyle(scope).getPropertyValue("--foreground-disabled").trim(),
      );
      const expected = composite(disabled, scopeBg);
      for (let i = 0; i < 3; i += 1) {
        expect(
          Math.abs(closedInk[i] - expected[i]),
          `${key}: closed ink should be the disabled token`,
        ).toBeLessThanOrEqual(0.02);
      }
    }

    // And, in Elegant, it must be the LEAST prominent of the five (lowest text
    // contrast). Brutal is intentionally left as-is (stone), so it is exempt.
    if (theme !== "brutal") {
      const closedRatio = contrastRatio(
        composite(parseColor(getComputedStyle(closed).color), scopeBg),
        composite(parseColor(getComputedStyle(closed).backgroundColor), scopeBg),
      );
      for (const status of TASK_STATUS_IDS) {
        if (status === "closed") continue;
        const badge = screen.getByTestId(`badge-${status}`);
        const ratio = contrastRatio(
          composite(parseColor(getComputedStyle(badge).color), scopeBg),
          composite(parseColor(getComputedStyle(badge).backgroundColor), scopeBg),
        );
        expect(
          closedRatio,
          `${key}: closed (${closedRatio.toFixed(2)}) must be fainter than ${status} (${ratio.toFixed(2)})`,
        ).toBeLessThanOrEqual(ratio);
      }
    }
  });
}

it("Brutal's five fills are the same values as before this change", () => {
  render(
    <ThemeProvider theme="brutal">
      <Harness />
    </ThemeProvider>,
  );
  // The pre-change Brutal values (brutal-parity pastels), pinned so a refactor
  // cannot silently drift the one theme that was already correct.
  const EXPECTED: Record<TaskStatusId, Rgb> = {
    todo: [248, 161, 111], // brutal-orange
    "in-progress": [39, 204, 243], // brutal-cyan
    "in-review": [187, 175, 230], // brutal-lavender
    done: [169, 216, 119], // brutal-lime
    closed: [192, 185, 177], // brutal-stone
  };
  for (const status of TASK_STATUS_IDS) {
    const fill = parseColor(
      getComputedStyle(screen.getByTestId(`badge-${status}`)).backgroundColor,
    );
    const actual = fill.rgb.map((c) => Math.round(c * 255));
    const expected = EXPECTED[status];
    // ±1 per channel absorbs the oklch→sRGB rounding boundary.
    for (let i = 0; i < 3; i += 1) {
      expect(
        Math.abs(actual[i] - expected[i]),
        `brutal/${status} drifted from its pre-change value (${actual.join(",")} vs ${expected.join(",")})`,
      ).toBeLessThanOrEqual(1);
    }
  }
});
