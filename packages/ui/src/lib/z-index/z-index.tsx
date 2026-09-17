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

export const Z_INDEX_TIER_BASE_VALUES: Record<ZIndexTier, number> = {
  base: 0,
  sticky: 100,
  float: 200,
  dropdown: 1000,
  modal: 2000,
  toast: 3000,
  lightbox: 5000,
  tooltip: 6000,
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
 * ZIndexScope establishes or inherits a z-index stacking layer for overlays and nested popups/dialogs.
 * - When nested inside a higher-or-equal tier (e.g. nested modal inside modal, or dropdown inside modal),
 *   it increments the level so children always sit above the containing surface.
 * - When nested inside a lower tier (e.g. modal inside sticky or tooltip inside modal), it establishes
 *   its own tier at level 0.
 */
export function ZIndexScope({ tier, offset = 0, children }: ZIndexScopeProps) {
  const parent = useContext(ZIndexContext);

  const contextValue = useMemo<ZIndexContextValue>(() => {
    if (!parent) {
      return {
        tier,
        level: 0,
        offset,
      };
    }

    const parentBase = Z_INDEX_TIER_BASE_VALUES[parent.tier] ?? 0;
    const ownBase = Z_INDEX_TIER_BASE_VALUES[tier] ?? 0;

    // If parent is same or higher tier, increment level within parent's tier
    if (parentBase >= ownBase) {
      const nextLevel = Math.min(parent.level + 1, MAX_Z_INDEX_NESTING);
      if (process.env.NODE_ENV !== "production" && parent.level + 1 > MAX_Z_INDEX_NESTING) {
        console.warn(
          `[rui] Excessive z-index nesting detected in tier "${parent.tier}" (level: ${parent.level + 1}). ` +
            `Consider flattening the overlay hierarchy.`,
        );
      }
      return {
        tier: parent.tier,
        level: nextLevel,
        offset: parent.offset + offset,
      };
    }

    // If own tier is strictly higher than parent (e.g. tooltip or lightbox inside modal), use own tier at level 0
    return {
      tier,
      level: 0,
      offset,
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
  zIndex: string | number;
  style: CSSProperties;
}

/**
 * Hook to retrieve the current z-index for an overlay or element.
 * - At root level without parent context and offset=0, it returns a pure CSS variable `var(--r-z-*)`
 *   for zero runtime overhead and 100% SSR compatibility.
 * - In nested context:
 *   If own tier is strictly higher than context (e.g. tooltip inside modal context), it uses own tier variable.
 *   If context tier is strictly higher than own tier (e.g. dropdown inside modal without an inner ZIndexScope),
 *   it elevates atop the context by at least 1 level: Math.max(context.level, 1).
 *   If context tier equals own tier (e.g. dialog content reading dialog context), it matches context level.
 */
export function useZIndex(options: UseZIndexOptions = {}): UseZIndexReturn {
  const context = useContext(ZIndexContext);
  const requestedTier = options.tier;
  const explicitOffset = options.offset ?? 0;

  if (!context) {
    const tier = requestedTier ?? "base";
    const varName = Z_INDEX_TIER_VARIABLES[tier] ?? "--r-z-base";
    if (explicitOffset === 0) {
      return {
        tier,
        level: 0,
        zIndex: `var(${varName})`,
        style: { zIndex: `var(${varName})` },
      };
    }
    const zIndex =
      explicitOffset > 0
        ? `calc(var(${varName}) + ${explicitOffset})`
        : `calc(var(${varName}) - ${Math.abs(explicitOffset)})`;
    return {
      tier,
      level: 0,
      zIndex,
      style: { zIndex },
    };
  }

  const ownTier = requestedTier ?? context.tier;
  const contextBase = Z_INDEX_TIER_BASE_VALUES[context.tier] ?? 0;
  const ownBase = Z_INDEX_TIER_BASE_VALUES[ownTier] ?? 0;

  // 1. If own tier is strictly higher than context tier (e.g. tooltip inside modal),
  // own tier takes precedence
  if (ownBase > contextBase) {
    const varName = Z_INDEX_TIER_VARIABLES[ownTier] ?? "--r-z-base";
    const zIndex =
      explicitOffset === 0
        ? `var(${varName})`
        : explicitOffset > 0
          ? `calc(var(${varName}) + ${explicitOffset})`
          : `calc(var(${varName}) - ${Math.abs(explicitOffset)})`;
    return {
      tier: ownTier,
      level: 0,
      zIndex,
      style: { zIndex },
    };
  }

  // 2. If context tier is strictly higher than own tier (e.g. dropdown inside modal),
  // ensure child is elevated at least above the modal surface (level >= 1)
  const effectiveTier = context.tier;
  const effectiveLevel = contextBase > ownBase ? Math.max(context.level, 1) : context.level;

  const totalIncrement = effectiveLevel * Z_INDEX_STEP + context.offset + explicitOffset;
  const varName = Z_INDEX_TIER_VARIABLES[effectiveTier] ?? "--r-z-base";
  const zIndex =
    totalIncrement === 0
      ? `var(${varName})`
      : totalIncrement > 0
        ? `calc(var(${varName}) + ${totalIncrement})`
        : `calc(var(${varName}) - ${Math.abs(totalIncrement)})`;
  return {
    tier: effectiveTier,
    level: effectiveLevel,
    zIndex,
    style: { zIndex },
  };
}
