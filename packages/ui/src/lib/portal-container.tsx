import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { ownerWindow } from "./owner-window";

// `undefined`: no provider, the overlays keep their own default (the body).
const PortalContainerContext = createContext<HTMLElement | null | undefined>(undefined);

// Whether this is inside the portal of a raft-ui overlay that Base UI nests
// other portals into (a Base UI `FloatingPortal`: Popover, Menu, ContextMenu,
// Select, Combobox, Dialog, AlertDialog, Drawer, Lightbox, NotificationCenter).
// An overlay opened there passes no container, so Base UI puts it in that
// overlay's portal, as it does with no provider: that portal is already in the
// provider's container, and the nesting keeps the inner one inside the outer
// one (isInsideOverlay, z-order, a press in it is a press inside).
const NestedPortalContext = createContext(false);

export type PortalContainerProviderProps = {
  /**
   * Where every raft-ui overlay under it renders by default: an element of
   * the document they belong in, such as the `body` of a window opened with
   * `window.open`. `null` while that element doesn't exist yet: an overlay
   * opened then waits for it and renders nothing, instead of opening in the
   * wrong document.
   */
  container: HTMLElement | null;
  children?: ReactNode;
};

/**
 * Sets where the raft-ui overlays under it render (popover.md, "Rendering in
 * another window"): Popover, DropdownMenu, ContextMenu, Tooltip, PreviewCard,
 * Select, Combobox, ComboboxSelect, NotificationCenter, Dialog, AlertDialog,
 * Drawer, Lightbox, a ToastProvider's viewport, DragLift and DragRefusalHint.
 * Each still takes a `container` (or `portalProps.container`,
 * `portalContainer`) of its own first; an overlay opened inside another
 * Base UI overlay goes inside that one's portal, as without a provider.
 *
 * For a part of the app rendered into another document (an Electron
 * auxiliary window opened with `window.open("about:blank")` and filled with
 * `createPortal` from the main window's tree): Base UI portals to the global
 * `document.body`, which is the main window's, and the context that would
 * redirect it is private to Base UI. Wrap the subtree you portal into the
 * other document, inside the `createPortal`, and pass an element of that
 * document. It renders no element.
 */
export function PortalContainerProvider({ container, children }: PortalContainerProviderProps) {
  return (
    <PortalContainerContext.Provider value={container}>
      <NestedPortalContext.Provider value={false}>{children}</NestedPortalContext.Provider>
    </PortalContainerContext.Provider>
  );
}

/**
 * The container the nearest `PortalContainerProvider` sets: an element,
 * `null` while it doesn't exist yet, and `undefined` with no provider. For a
 * portal of the app's own (`createPortal(node, usePortalContainer() ??
 * document.body)`) that must follow the same rule as raft-ui's overlays.
 */
export function usePortalContainer(): HTMLElement | null | undefined {
  return useContext(PortalContainerContext);
}

/**
 * The window the nearest provider's container is in, or `undefined` with no
 * provider (or no container yet): for the parts of an overlay that read the
 * window rather than an element, such as a media query.
 */
export function usePortalWindow(): (Window & typeof globalThis) | undefined {
  const container = useContext(PortalContainerContext);
  return container ? ownerWindow(container) : undefined;
}

/**
 * The container to give a Base UI portal: the caller's own when it passes one
 * (`null` included, Base UI's "wait"), else nothing inside another raft-ui
 * overlay's portal (Base UI nests it there), else the provider's, else
 * nothing (Base UI's default, the body).
 */
export function useResolvedPortalContainer<Container>(
  container: Container | undefined,
): Container | HTMLElement | null | undefined {
  const provided = useContext(PortalContainerContext);
  const nested = useContext(NestedPortalContext);
  if (container !== undefined) return container;
  if (nested) return undefined;
  return provided;
}

/**
 * Marks its children as inside a raft-ui overlay's Base UI `FloatingPortal`,
 * for a part that renders `<Base….Portal>` with JSX children of its own
 * rather than through usePortalContainerProps' `children`.
 */
export function InsideNestingPortal({ children }: { children?: ReactNode }) {
  return <NestedPortalContext.Provider value={true}>{children}</NestedPortalContext.Provider>;
}

type PortalProps = { container?: unknown; children?: ReactNode };

/**
 * A raft-ui `…Portal` part's props with the container resolved
 * (useResolvedPortalContainer). `nests`: the part is a Base UI
 * `FloatingPortal`, which other portals nest into (every overlay but Tooltip,
 * PreviewCard and Toast, whose `FloatingPortalLite` doesn't), so its children
 * are marked as inside it. Without a provider the container stays as the
 * caller passed it and nothing is rendered differently.
 */
export function usePortalContainerProps<Props extends PortalProps>(
  props: Props,
  nests: boolean,
): Props {
  const container = useResolvedPortalContainer(props.container) as Props["container"];
  const withContainer = container === props.container ? props : { ...props, container };
  if (!nests) return withContainer;
  return {
    ...withContainer,
    children: <InsideNestingPortal>{props.children}</InsideNestingPortal>,
  };
}
