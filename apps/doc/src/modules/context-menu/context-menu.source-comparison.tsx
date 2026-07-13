import {
  ContextMenuCompositionPreview,
  ContextMenuMessageMenuPreview,
  ContextMenuSelectionMenuPreview,
  ContextMenuSidebarMenuPreview,
} from "./context-menu.composition.tsx";
import { ContextMenuSourcePreview } from "./source-comparison/action-menu.source.tsx";
import { ContextMenuSourceMessageMenuPreview } from "./source-comparison/message-menu.source.tsx";
import { ContextMenuSourceSelectionMenuPreview } from "./source-comparison/selection-menu.source.tsx";
import { ContextMenuSourceSidebarMenuPreview } from "./source-comparison/sidebar-menu.source.tsx";

export const CONTEXT_MENU_COMPOSITION_PATH =
  "apps/doc/src/compositions/context-menu-composition.tsx" as const;

export {
  ContextMenuCompositionPreview,
  ContextMenuMessageMenuPreview,
  ContextMenuSelectionMenuPreview,
  ContextMenuSidebarMenuPreview,
  ContextMenuSourceMessageMenuPreview,
  ContextMenuSourcePreview,
  ContextMenuSourceSelectionMenuPreview,
  ContextMenuSourceSidebarMenuPreview,
};
