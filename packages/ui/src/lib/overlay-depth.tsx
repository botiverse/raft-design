import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

/**
 * A modal surface: a centred dialog (Dialog, AlertDialog, or an app's own
 * modal) or a sheet (Drawer).
 */
export type OverlayLayerKind = "dialog" | "drawer";

// The modal surfaces open around a component, outermost first. Each modal
// Dialog, AlertDialog and Drawer root adds itself for everything under it,
// matching Base UI, which treats any dialog under another dialog's root as
// nested (and draws no backdrop for it). A portal keeps the context.
const OverlayStackContext = createContext<readonly OverlayLayerKind[]>([]);

export type OverlayLayerProviderProps = {
  /**
   * What the surface is. Use `"dialog"` for an app's own modal, whatever it
   * looks like: `"drawer"` is for a Base UI Drawer, which nests under another
   * drawer by itself and only draws its own scrim over a `"dialog"`.
   */
  kind: OverlayLayerKind;
  /** Whether it dims what is under it. A non-modal surface adds nothing. */
  modal: boolean;
  children?: ReactNode;
};

/**
 * Tells everything under it that a modal surface is open, so a raft-ui
 * Dialog, AlertDialog or Drawer opened from inside draws the lighter nested
 * scrim (design/foundations/elevation.md#stacked-overlays). raft-ui's own
 * roots add one by themselves; an app's own modal (its own backdrop, Esc and
 * focus) wraps its scrim and its content in one to join the stack, and reads
 * `useParentOverlayKind` inside it to pick its own scrim. Modal overlays only:
 * a non-modal one passes `modal={false}`, adds nothing, and must not call
 * `useParentOverlayKind` (it would read the layer below as its own).
 */
export function OverlayLayerProvider({ kind, modal, children }: OverlayLayerProviderProps) {
  const stack = useContext(OverlayStackContext);
  const value = useMemo(() => (modal ? [...stack, kind] : stack), [stack, kind, modal]);
  return <OverlayStackContext.Provider value={value}>{children}</OverlayStackContext.Provider>;
}

/**
 * The modal surface this overlay's own surface was opened from, or null when
 * it is the first. Call it inside the surface's own `OverlayLayerProvider`
 * (for raft-ui's overlays, inside their root): the last entry is the surface
 * itself and the one before it is its parent. Not null means the surface is
 * stacked over another and draws `layer-backdrop-nested` instead of
 * `layer-backdrop`. Modal overlays only: under `modal={false}` nothing is
 * added, so the last entry is the parent and this returns the wrong layer. It reads React context, so it sees the surfaces whose
 * tree this one is rendered in, portals included; one opened from outside
 * that tree is not stacked on it here.
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
