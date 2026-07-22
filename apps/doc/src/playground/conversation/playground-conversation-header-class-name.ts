import { useThemeFamily } from "raft-ui";

/**
 * Elegant desktop: fold glyph left edge at ~36px (header `pl-7` + PanelAction `px-2`),
 * matching the Chat tab icon column (content `md:ml-2` + tabs-list `px-4` + tab `px-3`).
 *
 * Neutralize the recipe's shared `px-5` / elegant `pl-9` with `px-0` first — cnfast
 * does not drop `px-*` when a `pl-*` override is added.
 */
export function usePlaygroundConversationHeaderClassName() {
  const theme = useThemeFamily();
  return theme === "elegant" ? "px-0 max-md:px-[14px] md:pl-7 md:pr-5" : undefined;
}
