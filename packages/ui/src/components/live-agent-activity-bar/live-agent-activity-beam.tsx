import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

// Adapted from border-beam v1.3.0 (MIT): https://github.com/Jakubantalik/border-beam
// The pulse-outside geometry and driver are retained; only its color palette uses local tokens.

type PulseRegion = 1 | 2 | 3;
type PulseQuad = "tl" | "tr" | "bl" | "br";

type PulseGradient = {
  color: string;
  region: PulseRegion;
  quad: PulseQuad;
  width: number;
  height: number;
  x: string;
  y: string;
};

const OUTER_CORE: PulseGradient[] = [
  { color: "var(--accent-500)", region: 1, quad: "tl", width: 80, height: 19, x: "27%", y: "0%" },
  { color: "var(--primary-400)", region: 2, quad: "tr", width: 74, height: 11, x: "73%", y: "-1%" },
  { color: "var(--accent-500)", region: 3, quad: "tr", width: 15, height: 44, x: "100%", y: "33%" },
  { color: "var(--accent-500)", region: 1, quad: "br", width: 19, height: 38, x: "101%", y: "72%" },
  {
    color: "var(--primary-400)",
    region: 2,
    quad: "br",
    width: 84,
    height: 13,
    x: "67%",
    y: "100%",
  },
  {
    color: "var(--primary-400)",
    region: 3,
    quad: "bl",
    width: 60,
    height: 21,
    x: "24%",
    y: "101%",
  },
  { color: "var(--accent-500)", region: 1, quad: "bl", width: 17, height: 40, x: "0%", y: "60%" },
  { color: "var(--primary-400)", region: 2, quad: "tl", width: 13, height: 32, x: "-1%", y: "28%" },
];

const OUTER_BLOOM = [
  { ...OUTER_CORE[0], width: 110, height: 30, y: "3%" },
  { ...OUTER_CORE[1], width: 100, height: 20, y: "1%" },
  { ...OUTER_CORE[2], width: 26, height: 62 },
  { ...OUTER_CORE[3], width: 30, height: 56 },
  { ...OUTER_CORE[4], width: 120, height: 22, y: "99%" },
  { ...OUTER_CORE[5], width: 88, height: 32, y: "99%" },
  { ...OUTER_CORE[6], width: 28, height: 58 },
];

type Oscillator = {
  prop: string;
  a: number;
  b: number;
  period: number;
  delay: number;
  unit: "" | "px";
};

type DriverConfig = {
  oscillators: Oscillator[];
};

const pulseInstances = new Set<{ element: HTMLElement; config: DriverConfig }>();
let pulseFrame: number | null = null;
let lastPulseFrame = 0;

function drivePulse(timestamp: number) {
  pulseFrame = requestAnimationFrame(drivePulse);
  if (timestamp - lastPulseFrame < 1000 / 30 - 2) return;
  lastPulseFrame = timestamp;

  const seconds = timestamp / 1000;
  for (const { element, config } of pulseInstances) {
    for (const oscillator of config.oscillators) {
      const phase = (seconds - oscillator.delay) / oscillator.period;
      const value =
        oscillator.a + (oscillator.b - oscillator.a) * ((1 - Math.cos(Math.PI * 2 * phase)) / 2);
      element.style.setProperty(
        oscillator.prop,
        oscillator.unit === "px" ? `${value.toFixed(2)}px` : value.toFixed(4),
      );
    }
  }
}

function registerPulseInstance(element: HTMLElement, config: DriverConfig) {
  const instance = { element, config };
  pulseInstances.add(instance);

  if (pulseFrame === null) {
    lastPulseFrame = 0;
    pulseFrame = requestAnimationFrame(drivePulse);
  }

  return () => {
    pulseInstances.delete(instance);
    if (pulseInstances.size === 0 && pulseFrame !== null) {
      cancelAnimationFrame(pulseFrame);
      pulseFrame = null;
    }
  };
}

function pulseGradient(gradient: PulseGradient, id: string) {
  return `radial-gradient(ellipse calc(${gradient.width}px * var(--bw${gradient.region}-${id}) * var(--pulse-glow-sx, 1)) calc(${gradient.height}px * var(--bh${gradient.region}-${id}) * var(--bgh-${id}) * var(--pulse-glow-sy, 1)) at calc(${gradient.x} + var(--bx${gradient.region}-${id})) calc(${gradient.y} + var(--by${gradient.region}-${id})), color-mix(in srgb, ${gradient.color} calc(var(--bop-${gradient.quad}-${id}) * 100%), transparent), transparent)`;
}

function staticPulseGradient(gradient: PulseGradient) {
  return `radial-gradient(ellipse calc(${gradient.width}px * var(--pulse-glow-sx, 1)) calc(${gradient.height}px * var(--pulse-glow-sy, 1)) at ${gradient.x} ${gradient.y}, color-mix(in srgb, ${gradient.color} 82%, transparent), transparent)`;
}

function pulseProperties(id: string) {
  const numbers = [
    "bw1",
    "bh1",
    "bw2",
    "bh2",
    "bw3",
    "bh3",
    "bgh",
    "bop-tl",
    "bop-tr",
    "bop-bl",
    "bop-br",
  ];
  const lengths = ["bx1", "by1", "bx2", "by2", "bx3", "by3"];
  const properties = (names: string[], syntax: "<number>" | "<length>", initial: string) =>
    names
      .map(
        (name) =>
          `@property --${name}-${id} { syntax: "${syntax}"; initial-value: ${initial}; inherits: true; }`,
      )
      .join("\n");

  return `${properties(numbers, "<number>", "1")}\n${properties(lengths, "<length>", "0px")}\n@property --beam-opacity-${id} { syntax: "<number>"; initial-value: 0; inherits: true; }`;
}

function pulseDriverConfig(id: string): DriverConfig {
  const spread = 0.28;
  const drift = 14;
  const opacity = 0.46;
  const height = 0.16;
  const breathe = 2.3;
  const size = 6.4;
  const glow = 2.4;

  return {
    oscillators: [
      {
        prop: `--bw1-${id}`,
        a: 1 - spread,
        b: 1 + spread * 1.1,
        period: size * 0.9,
        delay: 0,
        unit: "",
      },
      {
        prop: `--bh1-${id}`,
        a: 1 + spread * 0.9,
        b: 1 - spread * 0.85,
        period: size * 1.26,
        delay: 0,
        unit: "",
      },
      {
        prop: `--bx1-${id}`,
        a: -drift,
        b: drift * 0.9,
        period: breathe * 1.6,
        delay: 0,
        unit: "px",
      },
      {
        prop: `--by1-${id}`,
        a: drift * 0.55,
        b: -drift * 0.7,
        period: breathe * 1.6,
        delay: 0,
        unit: "px",
      },
      {
        prop: `--bw2-${id}`,
        a: 1 + spread,
        b: 1 - spread * 0.85,
        period: size * 1.1,
        delay: 0,
        unit: "",
      },
      {
        prop: `--bh2-${id}`,
        a: 1 - spread * 0.8,
        b: 1 + spread * 1.05,
        period: size * 0.81,
        delay: 0,
        unit: "",
      },
      {
        prop: `--bx2-${id}`,
        a: drift * 0.8,
        b: -drift * 0.9,
        period: breathe * 1.88,
        delay: 0,
        unit: "px",
      },
      {
        prop: `--by2-${id}`,
        a: -drift,
        b: drift * 0.65,
        period: breathe * 1.88,
        delay: 0,
        unit: "px",
      },
      {
        prop: `--bw3-${id}`,
        a: 1 - spread * 0.6,
        b: 1 + spread * 1.15,
        period: size * 0.98,
        delay: 0,
        unit: "",
      },
      {
        prop: `--bh3-${id}`,
        a: 1 + spread * 0.75,
        b: 1 - spread,
        period: size * 1.4,
        delay: 0,
        unit: "",
      },
      {
        prop: `--bx3-${id}`,
        a: -drift * 0.6,
        b: drift,
        period: breathe * 1.45,
        delay: 0,
        unit: "px",
      },
      {
        prop: `--by3-${id}`,
        a: -drift * 0.85,
        b: drift * 0.45,
        period: breathe * 1.45,
        delay: 0,
        unit: "px",
      },
      { prop: `--bgh-${id}`, a: 1 - height, b: 1 + height, period: glow, delay: 0, unit: "" },
      { prop: `--bop-tl-${id}`, a: 1 - opacity, b: 1, period: breathe, delay: 0, unit: "" },
      {
        prop: `--bop-tr-${id}`,
        a: 1 - opacity,
        b: 1,
        period: breathe * 1.32,
        delay: breathe * 0.28,
        unit: "",
      },
      {
        prop: `--bop-bl-${id}`,
        a: 1 - opacity,
        b: 1,
        period: breathe * 0.84,
        delay: breathe * 0.55,
        unit: "",
      },
      {
        prop: `--bop-br-${id}`,
        a: 1 - opacity,
        b: 1,
        period: breathe * 1.58,
        delay: breathe * 0.83,
        unit: "",
      },
    ],
  };
}

function beamStyles(id: string, borderRadius: number) {
  const core = OUTER_CORE.map((gradient) => pulseGradient(gradient, id)).join(",\n");
  const bloom = OUTER_BLOOM.map(staticPulseGradient).join(",\n");

  return `${pulseProperties(id)}
[data-beam="${id}"] { position: relative; border-radius: ${borderRadius}px; overflow: visible; isolation: isolate; }
[data-beam="${id}"] { animation: beam-fade-in-${id} 0.6s ease forwards; }
[data-beam="${id}"]::after { content: ""; position: absolute; inset: 0; border-radius: ${borderRadius}px; padding: 1px; clip-path: inset(0 round ${borderRadius}px); background: ${core}; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude; pointer-events: none; z-index: 2; opacity: calc(var(--beam-opacity-${id}) * 0.94 * var(--beam-strength, 1)); filter: brightness(1.90) saturate(0.85); }
[data-beam="${id}"]::before { content: ""; position: absolute; inset: -10px; z-index: -1; border-radius: ${borderRadius + 10}px; background: ${core}; transform: scale(0.95, 0.9); pointer-events: none; opacity: calc(var(--beam-opacity-${id}) * 0.34 * var(--beam-strength, 1)); filter: blur(3px) brightness(1.90) saturate(0.85); }
[data-beam="${id}"] [data-beam-bloom] { position: absolute; inset: -30px; z-index: -1; border-radius: ${borderRadius + 30}px; background: ${bloom}; transform: scale(0.95, 0.9); pointer-events: none; opacity: calc(var(--beam-opacity-${id}) * 0.30 * var(--beam-strength, 1)); filter: blur(22.5px) brightness(1.90) saturate(0.85); }
@keyframes beam-fade-in-${id} { to { --beam-opacity-${id}: 1; } }
@media (prefers-reduced-motion: reduce) { [data-beam="${id}"] { --beam-opacity-${id}: 1; animation: none; } }`;
}

export function LiveAgentActivityBeam({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  const id = useId().replace(/:/g, "-");
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [borderRadius, setBorderRadius] = useState(16);
  const [glowScale, setGlowScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root) return;
    const child = root.firstElementChild as HTMLElement | null;
    if (!child) return;

    const measure = () => {
      const styles = getComputedStyle(child);
      const radius = parseFloat(styles.borderTopLeftRadius);
      if (!Number.isNaN(radius) && radius > 0) setBorderRadius(radius);

      const bounds = child.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const clamp = (value: number) => Math.max(0.35, Math.min(4, value));
      const x = +clamp(bounds.width / 350).toFixed(3);
      const y = +clamp(bounds.height / 140).toFixed(3);
      setGlowScale((previous) => (previous.x === x && previous.y === y ? previous : { x, y }));
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(child);
    return () => resizeObserver.disconnect();
  }, [children, enabled]);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? true),
      {
        rootMargin: "256px",
      },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    if (!root || !visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return registerPulseInstance(root, pulseDriverConfig(id));
  }, [enabled, id, visible]);

  const styles = useMemo(() => beamStyles(id, borderRadius), [borderRadius, id]);
  const style = {
    "--beam-strength": 0.82,
    "--pulse-glow-sx": glowScale.x,
    "--pulse-glow-sy": glowScale.y,
  } as CSSProperties;

  return (
    <>
      <style>{enabled ? styles : undefined}</style>
      <div
        ref={rootRef}
        data-beam={enabled ? id : undefined}
        className={enabled ? undefined : "contents"}
        style={enabled ? style : undefined}
      >
        {children}
        <div
          aria-hidden
          data-beam-bloom={enabled ? "" : undefined}
          className={enabled ? undefined : "hidden"}
        />
      </div>
    </>
  );
}
