/**
 * What a place in a list is to you, shared by every row that lists places
 * (ListRow, SidebarItem): something waits for you (`unread`), you muted it
 * (`muted`), or you are not in it: offline or not joined (`away`).
 */
export type RowTone = "default" | "unread" | "muted" | "away";
