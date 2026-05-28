import { memo, useMemo } from "react";

// Color palette (brutal theme)
const C = {
  _: "transparent",
  K: "#000000",
  W: "#FFFFFF",
  P: "#FF6B9D",
  O: "#FF9F43",
  Y: "#FECA57",
  L: "#A8E6CF",
  C: "#48DBFB",
  V: "#C8A2E8",
  B: "#576574",
  R: "#EE5A24",
  G: "#78E08F",
} as const;

type PaletteKey = keyof typeof C;

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
};

export const AVATAR_KEYS = Object.keys(AVATARS);

// --- Seeded random pixel avatar generator ---
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

const COLOR_SCHEMES: [string, PaletteKey][] = [
  [C.C, "K"], [C.Y, "K"], [C.L, "K"], [C.P, "W"], [C.V, "K"],
  ["#2D3436", "C"], ["#2D3436", "G"], ["#2D3436", "P"],
  ["#2D3436", "Y"], ["#2D3436", "V"], [C.O, "K"], [C.C, "W"],
];

const generatedCache = new Map<string, { grid: PaletteKey[][]; bg: string }>();

function generateAvatar(seed: string): { grid: PaletteKey[][]; bg: string } {
  const cached = generatedCache.get(seed);
  if (cached) return cached;

  const rng = mulberry32(hashString(seed));
  const scheme = COLOR_SCHEMES[Math.floor(rng() * COLOR_SCHEMES.length)];
  const bg = scheme[0];
  const fg = scheme[1];

  const grid: PaletteKey[][] = [];
  for (let y = 0; y < 8; y++) {
    const left: PaletteKey[] = [];
    for (let x = 0; x < 4; x++) {
      left.push(rng() < 0.45 ? fg : "_");
    }
    grid.push([left[0], left[1], left[2], left[3], left[3], left[2], left[1], left[0]]);
  }

  const result = { grid, bg };
  generatedCache.set(seed, result);
  return result;
}

const PixelAvatar = memo(function PixelAvatar({
  avatarKey,
  size = 40,
  className = "",
}: {
  avatarKey: string;
  size?: number;
  className?: string;
}) {
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
        width: size,
        height: size,
        display: "grid",
        gridTemplateColumns: `repeat(8, ${cellSize}px)`,
        gridTemplateRows: `repeat(8, ${cellSize}px)`,
        backgroundColor: data.bg,
        imageRendering: "pixelated",
      }}
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

export default PixelAvatar;
