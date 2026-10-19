import {
  BadgeInfo,
  Bell,
  BookOpenText,
  Building2,
  CreditCard,
  FileText,
  Languages,
  MessageSquare,
  Monitor,
  Type,
  User,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import {
  PanelHeaderContent,
  PanelHeading,
  PanelSectionHeader,
  PanelTitle,
  SidebarBody,
  SidebarContent,
  SidebarGroupLabel,
  SidebarItem,
  SidebarItemAside,
  SidebarItemContent,
  SidebarItemIcon,
  SidebarItemTitle,
  SidebarList,
  SidebarRoot,
  SidebarSection,
  Status,
} from "@botiverse/raft-ui";

export function SidebarSettingsListComposition() {
  const [selected, setSelected] = useState("account");
  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setSelected(event.currentTarget.value);
  }, []);

  return (
    <div className="flex h-dvh w-full max-w-sm flex-col">
      <PanelSectionHeader>
        <PanelHeaderContent>
          <PanelHeading>
            <PanelTitle>Settings</PanelTitle>
          </PanelHeading>
        </PanelHeaderContent>
      </PanelSectionHeader>
      <SidebarRoot className="min-h-0 flex-1">
        <SidebarBody>
          <SidebarContent>
            <SidebarSection>
              <SidebarGroupLabel>Personal</SidebarGroupLabel>
              <SidebarList>
                <SidebarItem value="account" active={selected === "account"} onClick={handleOpen}>
                  <SidebarItemIcon>
                    <User />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Account</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
                <SidebarItem
                  value="language-region"
                  active={selected === "language-region"}
                  onClick={handleOpen}
                >
                  <SidebarItemIcon>
                    <Languages />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Language &amp; Region</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
                <SidebarItem
                  value="appearance"
                  active={selected === "appearance"}
                  onClick={handleOpen}
                >
                  <SidebarItemIcon>
                    <Type />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Appearance</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
                <SidebarItem
                  value="notifications"
                  active={selected === "notifications"}
                  onClick={handleOpen}
                >
                  <SidebarItemIcon>
                    <Bell />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Notifications</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
              </SidebarList>
            </SidebarSection>
            <SidebarSection>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarList>
                <SidebarItem value="server" active={selected === "server"} onClick={handleOpen}>
                  <SidebarItemIcon>
                    <Building2 />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Server Profile</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
                <SidebarItem value="billing" active={selected === "billing"} onClick={handleOpen}>
                  <SidebarItemIcon>
                    <CreditCard />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Plan &amp; Billing</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
                <SidebarItem
                  value="computers"
                  active={selected === "computers"}
                  onClick={handleOpen}
                >
                  <SidebarItemIcon>
                    <Monitor />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Computers</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
              </SidebarList>
            </SidebarSection>
            <SidebarSection>
              <SidebarGroupLabel>Resources</SidebarGroupLabel>
              <SidebarList>
                <SidebarItem value="about" active={selected === "about"} onClick={handleOpen}>
                  <SidebarItemIcon>
                    <BadgeInfo />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>About</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
                <SidebarItem
                  value="documentation"
                  active={selected === "documentation"}
                  onClick={handleOpen}
                >
                  <SidebarItemIcon>
                    <BookOpenText />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Documentation</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
                <SidebarItem value="feedback" active={selected === "feedback"} onClick={handleOpen}>
                  <SidebarItemIcon>
                    <MessageSquare />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Feedback</SidebarItemTitle>
                  </SidebarItemContent>
                  <SidebarItemAside>
                    <Status variant="accent" role="img" aria-label="Feedback has new replies" />
                  </SidebarItemAside>
                </SidebarItem>
                <SidebarItem
                  value="release-notes"
                  active={selected === "release-notes"}
                  onClick={handleOpen}
                >
                  <SidebarItemIcon>
                    <FileText />
                  </SidebarItemIcon>
                  <SidebarItemContent>
                    <SidebarItemTitle>Release Notes</SidebarItemTitle>
                  </SidebarItemContent>
                </SidebarItem>
              </SidebarList>
            </SidebarSection>
          </SidebarContent>
        </SidebarBody>
      </SidebarRoot>
    </div>
  );
}
