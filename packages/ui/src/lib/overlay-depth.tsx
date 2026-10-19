import { createContext, useContext } from "react";
import type { ReactNode } from "react";

// How many modal surfaces (dialog, alert dialog, sheet) are open beneath the
// current one. Each modal surface provides one more to what it renders, and a
// portal keeps the context, so a dialog opened from a sheet sees 1.
const OverlayDepthContext = createContext(0);

export function useOverlayDepth() {
  return useContext(OverlayDepthContext);
}

export function OverlayDepthProvider({ children }: { children?: ReactNode }) {
  const depth = useContext(OverlayDepthContext);
  return <OverlayDepthContext.Provider value={depth + 1}>{children}</OverlayDepthContext.Provider>;
}
