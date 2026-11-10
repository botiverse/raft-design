/**
 * What a place in a list is to you, shared by every row that lists places
 * (ListRow, SidebarItem): something waits for you (`unread`), you muted it
 * (`muted`), or you are not in it: offline or not joined (`away`).
 */
export type RowTone = "default" | "unread" | "muted" | "away";

/**
 * What an action row risks (ListRow only): the action interrupts but can be
 * undone (`warning`: orange, Leave channel, Stop all agents), or it cannot be
 * undone (`danger`: red, Delete channel). The same names and meanings as
 * Button's `warning` and `danger` (design/foundations/color.md#meanings-of-color).
 */
export type RiskTone = "warning" | "danger";
