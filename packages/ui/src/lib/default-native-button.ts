import type { ReactElement } from "react";

export function defaultNativeButton(render: unknown): boolean | undefined {
  if (!render || typeof render !== "object" || !("type" in render)) {
    return undefined;
  }

  const element = render as ReactElement;
  if (typeof element.type === "string") {
    return element.type === "button";
  }

  return undefined;
}
