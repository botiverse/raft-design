import type { Button as BaseButton } from "@base-ui/react/button";
import type { ReactElement } from "react";

export function defaultNativeButton(render: BaseButton.Props["render"]): boolean | undefined {
  if (!render || typeof render !== "object" || !("type" in render)) {
    return undefined;
  }

  const element = render as ReactElement;
  if (typeof element.type === "string") {
    return element.type === "button";
  }

  return undefined;
}
