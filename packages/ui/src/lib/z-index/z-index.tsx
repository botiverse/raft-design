import { createContext, useContext, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";

export type ZIndexTier =
  | "base"
  | "sticky"
  | "float"
  | "dropdown"
  | "modal"
  | "toast"
  | "lightbox"
  | "tooltip";

export const Z_INDEX_TIER_VARIABLES: Record<ZIndexTier, string> = {
  base: "--r-z-base",
  sticky: "--r-z-sticky",
  float: "--r-z-float",
  dropdown: "--r-z-dropdown",
  modal: "--r-z-modal",
  toast: "--r-z-toast",
  lightbox: "--r-z-lightbox",
  tooltip: "--r-z-tooltip",
};

export const Z_INDEX_STEP = 100;
export const MAX_Z_INDEX_NESTING = 5;

export interface ZIndexContextValue {
  tier: ZIndexTier;
  level: number;
  offset: number;
}

const ZIndexContext = createContext<ZIndexContextValue | null>(null);

export interface ZIndexScopeProps {
  tier: ZIndexTier;
  offset?: number;
  children?: ReactNode;
}

/**
 * ZIndexScope manages z-index stacking layers for overlays and nested popups/dialogs.
 * When nesting within the same tier (or explicit scopes), it tracks the nesting level
 * and allows dynamic elevation computation while bounding to safe limits.
 */
export function ZIndexScope({ tier, offset = 0, children }: ZIndexScopeProps) {
  const parent = useContext(ZIndexContext);

  const contextValue = useMemo<ZIndexContextValue>(() => {
    const isSameTier = parent?.tier === tier;
    const nextLevel = isSameTier ? (parent?.level ?? 0) + 1 : 0;

    if (process.env.NODE_ENV !== "production" && nextLevel > MAX_Z_INDEX_NESTING) {
      console.warn(
        `[rui] Excessive z-index nesting detected in tier "${tier}" (level: ${nextLevel}). ` +
          `Consider flattening the overlay hierarchy.`,
      );
    }

    const clampedLevel = Math.min(nextLevel, MAX_Z_INDEX_NESTING);
    const accumulatedOffset = (parent && isSameTier ? parent.offset : 0) + offset;

    return {
      tier,
      level: clampedLevel,
      offset: accumulatedOffset,
    };
  }, [parent, tier, offset]);

  return <ZIndexContext.Provider value={contextValue}>{children}</ZIndexContext.Provider>;
}

export interface UseZIndexOptions {
  tier?: ZIndexTier;
  offset?: number;
}

export interface UseZIndexReturn {
  tier: ZIndexTier;
  level: number;
  zIndex: number | string;
  style: CSSProperties;
}

/**
 * Hook to retrieve the current z-index for an overlay or element.
 * If at root level (level === 0 and offset === 0), it returns a pure CSS variable `var(--r-z-*)`
 * for zero-overhead SSR and pure CSS rendering.
 * If nested or offset, it calculates using `calc(var(--r-z-*) + offset)` or incremental stacking.
 */
export function useZIndex(options: UseZIndexOptions = {}): UseZIndexReturn {
  const parent = useContext(ZIndexContext);
  const tier = options.tier ?? parent?.tier ?? "base";
  const explicitOffset = options.offset ?? 0;

  const isSameTier = parent?.tier === tier;
  const level = isSameTier ? parent.level : 0;
  const totalOffset = (isSameTier ? parent.offset : 0) + explicitOffset;

  const totalIncrement = level * Z_INDEX_STEP + totalOffset;
  const varName = Z_INDEX_TIER_VARIABLES[tier] ?? "--r-z-base";

  let zIndex: string | number;
  if (totalIncrement === 0) {
    zIndex = `var(${varName})`;
  } else if (totalIncrement > 0) {
    zIndex = `calc(var(${varName}) + ${totalIncrement})`;
  } else {
    zIndex = `calc(var(${varName}) - ${Math.abs(totalIncrement)})`;
  }

  return {
    tier,
    level,
    zIndex,
    style: { zIndex },
  };
}
