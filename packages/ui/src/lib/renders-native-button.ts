import type { Button as BaseButton } from "@base-ui/react/button";
import { defaultNativeButton } from "./default-native-button";

// True when the resolved render target is a native <button>: a nullish render
// (default BaseButton renders a native button) or an explicit <button> element.
// Other native elements, components, and function renders return false so
// button-only attributes (type, aria-pressed) never leak onto non-button roles.
export function rendersNativeButton(render: BaseButton.Props["render"]): boolean {
  return render == null || defaultNativeButton(render) === true;
}
