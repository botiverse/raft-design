import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import { Bookmark, Inbox, Star } from "lucide-react";
import {
  SidebarItem,
  SidebarItemIcon,
  SidebarItemMeta,
  SidebarItemTitle,
} from "@botiverse/raft-ui";

export function SidebarItemNavigationComposition() {
  const [active, setActive] = useState("saved");
  const handleSelect = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setActive(event.currentTarget.value);
  }, []);

  return (
    <div>
      <SidebarItem value="saved" active={active === "saved"} onClick={handleSelect}>
        <SidebarItemIcon aria-hidden>
          <Bookmark />
        </SidebarItemIcon>
        <SidebarItemTitle>Saved</SidebarItemTitle>
        <SidebarItemMeta>7</SidebarItemMeta>
      </SidebarItem>

      <SidebarItem value="priority" active={active === "priority"} onClick={handleSelect}>
        <SidebarItemIcon aria-hidden>
          <Star />
        </SidebarItemIcon>
        <SidebarItemTitle>Priority</SidebarItemTitle>
        <SidebarItemMeta>2</SidebarItemMeta>
      </SidebarItem>

      <SidebarItem value="activity" active={active === "activity"} onClick={handleSelect}>
        <SidebarItemIcon aria-hidden>
          <Inbox />
        </SidebarItemIcon>
        <SidebarItemTitle>Activity</SidebarItemTitle>
        <SidebarItemMeta>5</SidebarItemMeta>
      </SidebarItem>
    </div>
  );
}
