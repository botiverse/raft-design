import type { CSSProperties } from "react";

export type FloatButtonPosition = "fixed" | "absolute" | "relative";
export type FloatButtonSide = "bottom-right" | "bottom-left" | "top-right" | "top-left";
export type FloatButtonOffset = number | string | [number | string, number | string];

export function resolvePositionStyles(options: {
  position?: FloatButtonPosition;
  side?: FloatButtonSide;
  offset?: FloatButtonOffset;
  style?: CSSProperties;
}): CSSProperties {
  const { position, side, offset, style } = options;

  if (!position && !side && offset === undefined) {
    return style ?? {};
  }

  const resolvedPosition = position ?? "fixed";

  if (resolvedPosition === "relative") {
    return {
      position: "relative",
      ...style,
    };
  }

  const resolvedSide = side ?? "bottom-right";
  const [offsetX, offsetY] = normalizeOffset(offset ?? 16);

  const posStyles: CSSProperties = {
    position: resolvedPosition,
  };

  if (resolvedSide === "bottom-right") {
    posStyles.bottom = offsetY;
    posStyles.right = offsetX;
  } else if (resolvedSide === "bottom-left") {
    posStyles.bottom = offsetY;
    posStyles.left = offsetX;
  } else if (resolvedSide === "top-right") {
    posStyles.top = offsetY;
    posStyles.right = offsetX;
  } else if (resolvedSide === "top-left") {
    posStyles.top = offsetY;
    posStyles.left = offsetX;
  }

  return {
    ...posStyles,
    ...style,
  };
}

function normalizeOffset(offset: FloatButtonOffset): [string, string] {
  if (Array.isArray(offset)) {
    return [formatLength(offset[0]), formatLength(offset[1])];
  }
  const formatted = formatLength(offset);
  return [formatted, formatted];
}

function formatLength(val: number | string): string {
  if (typeof val === "number") {
    return `${val}px`;
  }
  return val;
}
