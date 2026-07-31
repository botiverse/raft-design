import { ChevronDown, Hash } from "lucide-react";
import { useState } from "react";
import {
  Status,
  SidebarBody,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemTitle,
  SidebarList,
  SidebarRoot,
} from "raft-ui";
import {
  SidebarServer,
  SidebarServerAvatar,
  SidebarServerChevron,
  SidebarServerIndicator,
  SidebarServerLabel,
} from "../sidebar-server-switcher";

export function SidebarMobilePartsComposition() {
  const [selected, setSelected] = useState("raft-ui-migration");
  const [announcement, setAnnouncement] = useState({ message: "", sequence: 0 });

  function announce(message: string) {
    setAnnouncement((current) => ({ message, sequence: current.sequence + 1 }));
  }

  return (
    <SidebarRoot className="h-dvh">
      <SidebarHeader>
        <SidebarServer
          title="Raft Playground"
          render={<button type="button" />}
          onClick={() => announce("Switched to Raft Playground")}
        >
          <SidebarServerAvatar>
            <img alt="" src="/android-chrome-192x192.png" />
          </SidebarServerAvatar>
          <SidebarServerLabel>Raft Playground</SidebarServerLabel>
          <SidebarServerChevron aria-hidden>
            <ChevronDown />
          </SidebarServerChevron>
          <SidebarServerIndicator>
            <Status aria-label="Other servers have unread messages" attention size="sm" />
          </SidebarServerIndicator>
        </SidebarServer>
        <span className="sr-only" aria-live="polite">
          <span key={announcement.sequence}>{announcement.message}</span>
        </span>
      </SidebarHeader>
      <SidebarBody>
        <SidebarContent>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarList>
            <SidebarItem
              active={selected === "raft-ui-migration"}
              onClick={() => setSelected("raft-ui-migration")}
            >
              <SidebarItemChannelIcon aria-hidden>
                <Hash />
              </SidebarItemChannelIcon>
              <SidebarItemContent>
                <SidebarItemTitle>raft-ui-migration</SidebarItemTitle>
              </SidebarItemContent>
            </SidebarItem>
            <SidebarItem
              active={selected === "weekly-priorities"}
              onClick={() => setSelected("weekly-priorities")}
            >
              <SidebarItemChannelIcon aria-hidden>
                <Hash />
              </SidebarItemChannelIcon>
              <SidebarItemContent>
                <SidebarItemTitle>weekly-priorities</SidebarItemTitle>
              </SidebarItemContent>
            </SidebarItem>
          </SidebarList>
        </SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}
