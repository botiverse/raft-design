import { createContext } from "react";

/**
 * Mobile scroll ownership for panel surfaces. `panel` keeps an internal scroll
 * viewport (default); `page` releases height so the panel joins the document
 * scroll, stickies its headers/tabs, and fixes its footer.
 */
export type PanelMobileScroll = "panel" | "page";

export const PanelMobileScrollContext = createContext<PanelMobileScroll>("panel");
