import { memo, useMemo } from "react";

/**
 * Pixel art avatar system for agents.
 * Each avatar is an 8×8 grid rendered via CSS grid with 1:1 cells.
 * Stored as avatarUrl = "pixel:key" (predefined) or "pixel:random:seed" (generated).
 */

// Color palette — soft pastel.
// Aligned with design-system tokens in `slock-design/tokens/colors.json`
// v1.2.0 (2026-05-03): O/C/L/R now match the OKLCH-aligned named palette
// (soft-orange / soft-cyan / soft-lime / soft-coral). G + B stay
// avatar-specific because the role palette has no green / blue-gray.
// Keep in sync with `slock-landing/src/components/PixelAvatar.tsx`.
const C = {
  _: "transparent",
  K: "#141111",    // black/outline — Slock Ink
  W: "#FFFFFF",    // white/highlight — pixel highlights need pure white
  P: "#FE7DA8",    // pink — Bubble Pink
  O: "#F8A16F",    // orange — Soft Orange (v1.2.0)
  Y: "#FFD440",    // yellow — Soft Signal
  L: "#A9D877",    // lime — Soft Lime (v1.2.0)
  C: "#27CCF3",    // cyan — Soft Cyan (v1.2.0)
  V: "#BBAFE6",    // lavender — Soft Haze
  B: "#576574",    // blue-gray — avatar-specific (no role-palette equivalent)
  R: "#F97264",    // red — Soft Coral (v1.2.0)
  G: "#9DCAAA",    // green — avatar-specific sage (no role-palette equivalent)
};

type PaletteKey = keyof typeof C;

// 8×8 pixel art definitions
const AVATARS: Record<string, { grid: PaletteKey[][]; bg: string }> = {
  robot: {
    bg: C.C,
    grid: [
      ["_","K","K","K","K","K","K","_"],
      ["K","C","K","W","W","K","C","K"],
      ["K","W","K","W","W","K","W","K"],
      ["K","K","K","K","K","K","K","K"],
      ["_","K","W","K","K","W","K","_"],
      ["_","K","K","K","K","K","K","_"],
      ["_","K","K","_","_","K","K","_"],
      ["_","K","K","_","_","K","K","_"],
    ],
  },
  cat: {
    bg: C.Y,
    grid: [
      ["K","_","_","_","_","_","_","K"],
      ["K","K","_","_","_","_","K","K"],
      ["K","Y","K","Y","Y","K","Y","K"],
      ["K","Y","Y","Y","Y","Y","Y","K"],
      ["K","Y","K","Y","Y","K","Y","K"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["_","_","K","Y","Y","K","_","_"],
      ["_","_","_","K","K","_","_","_"],
    ],
  },
  ghost: {
    bg: C.V,
    grid: [
      ["_","_","K","K","K","K","_","_"],
      ["_","K","W","W","W","W","K","_"],
      ["K","W","K","W","W","K","W","K"],
      ["K","W","W","W","W","W","W","K"],
      ["K","W","W","W","W","W","W","K"],
      ["K","W","W","K","K","W","W","K"],
      ["K","W","K","W","W","K","W","K"],
      ["K","_","K","_","_","K","_","K"],
    ],
  },
  skull: {
    bg: C.O,
    grid: [
      ["_","K","K","K","K","K","K","_"],
      ["K","W","W","W","W","W","W","K"],
      ["K","W","K","W","W","K","W","K"],
      ["K","W","W","W","W","W","W","K"],
      ["_","K","W","W","W","W","K","_"],
      ["_","K","W","K","W","K","K","_"],
      ["_","_","K","K","K","K","_","_"],
      ["_","_","_","K","K","_","_","_"],
    ],
  },
  alien: {
    bg: C.L,
    grid: [
      ["_","K","K","K","K","K","K","_"],
      ["K","G","G","G","G","G","G","K"],
      ["K","G","K","K","K","K","G","K"],
      ["K","G","G","G","G","G","G","K"],
      ["_","K","G","G","G","G","K","_"],
      ["_","_","K","G","G","K","_","_"],
      ["_","_","K","G","G","K","_","_"],
      ["_","K","K","_","_","K","K","_"],
    ],
  },
  heart: {
    bg: C.P,
    grid: [
      ["_","_","_","_","_","_","_","_"],
      ["_","K","K","_","_","K","K","_"],
      ["K","R","R","K","K","R","R","K"],
      ["K","R","R","R","R","R","R","K"],
      ["K","R","R","R","R","R","R","K"],
      ["_","K","R","R","R","R","K","_"],
      ["_","_","K","R","R","K","_","_"],
      ["_","_","_","K","K","_","_","_"],
    ],
  },
  star: {
    bg: C.Y,
    grid: [
      ["_","_","_","K","K","_","_","_"],
      ["_","_","_","K","K","_","_","_"],
      ["K","K","K","K","K","K","K","K"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["_","_","K","Y","Y","K","_","_"],
      ["_","K","Y","K","K","Y","K","_"],
      ["K","Y","K","_","_","K","Y","K"],
      ["K","K","_","_","_","_","K","K"],
    ],
  },
  flame: {
    bg: C.O,
    grid: [
      ["_","_","_","K","_","_","_","_"],
      ["_","_","K","R","K","_","_","_"],
      ["_","_","K","R","K","K","_","_"],
      ["_","K","O","R","R","R","K","_"],
      ["_","K","O","O","R","R","K","_"],
      ["K","Y","O","O","O","R","K","_"],
      ["K","Y","Y","O","O","K","_","_"],
      ["_","K","K","K","K","_","_","_"],
    ],
  },
  diamond: {
    bg: C.C,
    grid: [
      ["_","_","_","K","K","_","_","_"],
      ["_","_","K","C","C","K","_","_"],
      ["_","K","C","W","C","C","K","_"],
      ["K","C","W","C","C","C","C","K"],
      ["K","C","C","C","C","C","C","K"],
      ["_","K","C","C","C","C","K","_"],
      ["_","_","K","C","C","K","_","_"],
      ["_","_","_","K","K","_","_","_"],
    ],
  },
  mushroom: {
    bg: C.P,
    grid: [
      ["_","_","K","K","K","K","_","_"],
      ["_","K","R","W","W","R","K","_"],
      ["K","R","R","W","W","R","R","K"],
      ["K","R","R","R","R","R","R","K"],
      ["_","K","K","K","K","K","K","_"],
      ["_","_","K","W","W","K","_","_"],
      ["_","_","K","W","W","K","_","_"],
      ["_","K","K","K","K","K","K","_"],
    ],
  },
  eye: {
    bg: C.V,
    grid: [
      ["_","_","_","_","_","_","_","_"],
      ["_","_","K","K","K","K","_","_"],
      ["_","K","W","W","W","W","K","_"],
      ["K","W","W","K","K","W","W","K"],
      ["K","W","W","K","K","W","W","K"],
      ["_","K","W","W","W","W","K","_"],
      ["_","_","K","K","K","K","_","_"],
      ["_","_","_","_","_","_","_","_"],
    ],
  },
  crown: {
    bg: C.Y,
    grid: [
      ["_","_","_","_","_","_","_","_"],
      ["_","K","_","K","K","_","K","_"],
      ["_","K","K","K","K","K","K","_"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["K","K","K","K","K","K","K","K"],
      ["K","Y","Y","Y","Y","Y","Y","K"],
      ["K","K","K","K","K","K","K","K"],
    ],
  },
  // Sprites 13-16 — added 2026-04-28 (Duoyu v2 set, stdrc-picked).
  // Bg coverage adds R/B/L which the original 12 didn't use. See
  // slock-design/tokens/avatar-palette.json v1.2.0.
  cloud: {
    bg: C.C,
    grid: [
      ["_","_","_","_","_","_","_","_"],
      ["_","_","K","K","_","_","_","_"],
      ["_","K","W","W","K","K","_","_"],
      ["K","W","W","W","W","W","K","_"],
      ["K","W","W","W","W","W","W","K"],
      ["K","W","W","W","W","W","W","K"],
      ["_","K","K","K","K","K","K","_"],
      ["_","_","_","_","_","_","_","_"],
    ],
  },
  sun: {
    bg: C.R,
    grid: [
      ["_","K","_","K","K","_","K","_"],
      ["K","_","K","Y","Y","K","_","K"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["K","Y","Y","Y","Y","Y","Y","K"],
      ["K","Y","Y","Y","Y","Y","Y","K"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["K","_","K","Y","Y","K","_","K"],
      ["_","K","_","K","K","_","K","_"],
    ],
  },
  bell: {
    bg: C.B,
    grid: [
      ["_","_","_","K","K","_","_","_"],
      ["_","_","K","Y","Y","K","_","_"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["_","K","Y","Y","Y","Y","K","_"],
      ["K","Y","Y","Y","Y","Y","Y","K"],
      ["K","K","K","K","K","K","K","K"],
      ["_","_","_","K","K","_","_","_"],
    ],
  },
  tree: {
    bg: C.L,
    grid: [
      ["_","_","_","K","K","_","_","_"],
      ["_","_","K","G","G","K","_","_"],
      ["_","K","G","G","G","G","K","_"],
      ["K","G","G","G","G","G","G","K"],
      ["K","G","G","G","G","G","G","K"],
      ["_","K","K","G","G","K","K","_"],
      ["_","_","K","O","O","K","_","_"],
      ["_","_","_","K","K","_","_","_"],
    ],
  },
};

export const AVATAR_KEYS = Object.keys(AVATARS);

/** Default avatar key used when agent has no avatar set */
export const DEFAULT_AVATAR_KEY = "robot";

export function getAvatarData(key: string) {
  return AVATARS[key] || null;
}

// --- Seeded random pixel avatar generator ---

/** Simple seeded PRNG (mulberry32) */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string to a 32-bit integer */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Pre-defined harmonious color schemes: [background, foreground].
 * Each scheme pairs a light bg with a contrasting fg for clean identicon look.
 */
const COLOR_SCHEMES: [string, PaletteKey][] = [
  [C.C, "K"],   // cyan bg, black fg
  [C.Y, "K"],   // yellow bg, black fg
  [C.L, "K"],   // lime bg, black fg
  [C.P, "W"],   // pink bg, white fg
  [C.V, "K"],   // lavender bg, black fg
  ["#1E1E1C", "C"],  // dark bg, cyan fg
  ["#1E1E1C", "G"],  // dark bg, green fg
  ["#1E1E1C", "P"],  // dark bg, pink fg
  ["#1E1E1C", "Y"],  // dark bg, yellow fg
  ["#1E1E1C", "V"],  // dark bg, lavender fg
  [C.O, "K"],   // orange bg, black fg
  [C.C, "W"],   // cyan bg, white fg
];

/** Cache for generated avatars to avoid recalculating */
const generatedCache = new Map<string, { grid: PaletteKey[][]; bg: string }>();

/**
 * Generate a deterministic 8×8 identicon-style pixel avatar from a seed string.
 * Uses a 5×8 grid (center column + left half mirrored to right) for vertical symmetry,
 * with a single foreground color on a harmonious background — similar to GitHub identicons.
 */
function generateAvatar(seed: string): { grid: PaletteKey[][]; bg: string } {
  const cached = generatedCache.get(seed);
  if (cached) return cached;

  const rng = mulberry32(hashString(seed));
  const scheme = COLOR_SCHEMES[Math.floor(rng() * COLOR_SCHEMES.length)];
  const bg = scheme[0];
  const fg = scheme[1];

  // Generate a 4×8 half-grid (left side), then mirror horizontally.
  // ~45% fill rate gives recognizable shapes without being too dense or sparse.
  const grid: PaletteKey[][] = [];
  for (let y = 0; y < 8; y++) {
    const left: PaletteKey[] = [];
    for (let x = 0; x < 4; x++) {
      left.push(rng() < 0.45 ? fg : "_");
    }
    // Mirror: columns 0-3 then 3-0 (8 wide, center columns 3,4 share same value)
    grid.push([left[0], left[1], left[2], left[3], left[3], left[2], left[1], left[0]]);
  }

  const result = { grid, bg };
  generatedCache.set(seed, result);
  return result;
}

/** Check if an avatarUrl is a random generated avatar */
export function isRandomAvatar(avatarUrl: string | null): boolean {
  return avatarUrl?.startsWith("pixel:random:") ?? false;
}

/** Extract the seed from a random avatar URL */
export function parseRandomSeed(avatarUrl: string | null): string | null {
  if (!avatarUrl?.startsWith("pixel:random:")) return null;
  return avatarUrl.slice(13);
}

/** Generate a new random seed */
export function generateRandomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Parse "pixel:key" or "pixel:random:seed" format from avatarUrl */
export function parsePixelAvatar(avatarUrl: string | null): string | null {
  if (!avatarUrl?.startsWith("pixel:")) return null;
  return avatarUrl.slice(6);
}

/** Get the effective pixel avatar key for an agent (falls back to default) */
export function getEffectiveAvatarKey(avatarUrl: string | null): string {
  return parsePixelAvatar(avatarUrl) || DEFAULT_AVATAR_KEY;
}

/** Render a pixel art avatar at the given size */
const PixelAvatar = memo(function PixelAvatar({
  avatarKey,
  size = 40,
  className = "",
}: {
  avatarKey: string;
  size?: number;
  className?: string;
}) {
  // Determine if this is a random avatar (key starts with "random:")
  const isRandom = avatarKey.startsWith("random:");
  const seed = isRandom ? avatarKey.slice(7) : null;

  const data = useMemo(() => {
    if (seed) return generateAvatar(seed);
    return AVATARS[avatarKey] || null;
  }, [avatarKey, seed]);

  if (!data) return null;

  const cellSize = size / 8;

  return (
    <div
      className={`shrink-0 ${className}`}
      style={{
        // Default to fixed `size`. Callers can override via className
        // (`!w-full !h-full`) to make the grid fill its parent — used by
        // AvatarSlot to push pixels flush to the border on non-integer
        // DPR devices.
        width: size,
        height: size,
        display: "grid",
        gridTemplateColumns: `repeat(8, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(8, minmax(0, 1fr))`,
        backgroundColor: data.bg,
        imageRendering: "pixelated",
      }}
      data-cell-size={cellSize}
    >
      {data.grid.flat().map((colorKey, i) => (
        <div
          key={i}
          style={{
            backgroundColor: colorKey === "_" ? "transparent" : C[colorKey],
          }}
        />
      ))}
    </div>
  );
});

/** Check if avatarUrl is a custom image (not pixel:* format) */
export function isCustomAvatar(avatarUrl: string | null): boolean {
  if (!avatarUrl) return false;
  return !avatarUrl.startsWith("pixel:");
}

/** Render an agent avatar — custom image if uploaded, pixel art otherwise */
export const AgentAvatar = memo(function AgentAvatar({
  avatarUrl,
  size = 40,
  className = "",
}: {
  avatarUrl: string | null;
  size?: number;
  className?: string;
}) {
  if (isCustomAvatar(avatarUrl)) {
    return (
      <img
        src={avatarUrl!}
        alt="Agent avatar"
        className={`shrink-0 object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return <PixelAvatar avatarKey={getEffectiveAvatarKey(avatarUrl)} size={size} className={className} />;
});

export default PixelAvatar;
