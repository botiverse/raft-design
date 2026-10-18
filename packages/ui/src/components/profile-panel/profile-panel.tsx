import { conversationPanel } from "../conversation-panel/conversation-panel.recipe";
import { Panel, PanelBody, PanelSection } from "../panel/panel";
import type { PanelBodyProps, PanelProps, PanelSectionProps } from "../panel/panel";
import { PanelHeader, PanelHeaderContent } from "../panel/panel-header";
import type { PanelHeaderContentProps, PanelHeaderProps } from "../panel/panel-header";
import { profilePanel } from "./profile-panel.recipe";

export type ProfilePanelProps = PanelProps;

export function ProfilePanel({ className, edge = "inset", ...props }: ProfilePanelProps) {
  const { root } = profilePanel();

  return <Panel {...props} edge={edge} data-slot="profile-panel" className={root({ className })} />;
}

export type ProfilePanelHeaderProps = PanelHeaderProps;

export function ProfilePanelHeader({ className, ...props }: ProfilePanelHeaderProps) {
  const { header } = profilePanel();

  return <PanelHeader {...props} className={header({ className })} />;
}

export type ProfilePanelHeaderContentProps = PanelHeaderContentProps;

export function ProfilePanelHeaderContent({ className, ...props }: ProfilePanelHeaderContentProps) {
  const { headerContent } = profilePanel();

  return <PanelHeaderContent {...props} className={headerContent({ className })} />;
}

export type ProfilePanelBodyProps = PanelBodyProps;

// Shares the conversation panel's raised content chrome so profile detail
// surfaces read as the same material as the chat panel.
export function ProfilePanelBody({ className, ...props }: ProfilePanelBodyProps) {
  const { content } = conversationPanel();

  return <PanelBody {...props} data-slot="profile-panel-body" className={content({ className })} />;
}

export type ProfilePanelSectionProps = PanelSectionProps;

export function ProfilePanelSection({ className, ...props }: ProfilePanelSectionProps) {
  const { section } = profilePanel();

  return <PanelSection {...props} className={section({ className })} />;
}
