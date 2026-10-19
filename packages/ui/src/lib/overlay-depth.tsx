import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

export type OverlayLayerKind = "dialog" | "drawer";

// The modal surfaces open around a component, outermost first. Each modal
// Dialog, AlertDialog and Drawer root adds itself for everything under it,
// matching Base UI, which treats any dialog under another dialog's root as
// nested (and draws no backdrop for it). A portal keeps the context.
const OverlayStackContext = createContext<readonly OverlayLayerKind[]>([]);

export function OverlayLayerProvider({
  kind,
  modal,
  children,
}: {
  kind: OverlayLayerKind;
  modal: boolean;
  children?: ReactNode;
}) {
  const stack = useContext(OverlayStackContext);
  const value = useMemo(() => (modal ? [...stack, kind] : stack), [stack, kind, modal]);
  return <OverlayStackContext.Provider value={value}>{children}</OverlayStackContext.Provider>;
}

/**
 * The modal surface this overlay's own surface was opened from, or null when
 * it is the first. Called inside a surface, so the last entry is the surface
 * itself and the one before it is its parent.
 */
export function useParentOverlayKind(): OverlayLayerKind | null {
  const stack = useContext(OverlayStackContext);
  return stack.length >= 2 ? stack[stack.length - 2] : null;
}

/**
 * Wraps a dialog or drawer root's children in its layer. Base UI lets those
 * children be a render function (`({ payload }) => …`), so keep that shape.
 */
export function withOverlayLayer<Args extends unknown[]>(
  kind: OverlayLayerKind,
  modal: boolean,
  children: ReactNode | ((...args: Args) => ReactNode),
): ReactNode | ((...args: Args) => ReactNode) {
  if (typeof children === "function") {
    return (...args: Args) => (
      <OverlayLayerProvider kind={kind} modal={modal}>
        {children(...args)}
      </OverlayLayerProvider>
    );
  }
  return (
    <OverlayLayerProvider kind={kind} modal={modal}>
      {children}
    </OverlayLayerProvider>
  );
}
