import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  PanelHeader,
  PanelHeaderContent,
  type PanelHeaderContentProps,
  type PanelHeaderProps,
} from "../conversation-panel/conversation-panel";
import { conversationPanel } from "../conversation-panel/conversation-panel.recipe";
import {
  Panel,
  PanelBody,
  PanelSection,
  type PanelBodyProps,
  type PanelProps,
  type PanelSectionProps,
} from "../panel/panel";
import { profilePanel } from "./profile-panel.recipe";

export type ProfilePanelProps = PanelProps;

export function ProfilePanel({ className, ...props }: ProfilePanelProps) {
  const theme = useThemeFamily();
  const { root } = profilePanel({ theme });

  return <Panel {...props} data-slot="profile-panel" className={root({ className })} />;
}

export type ProfilePanelHeaderProps = PanelHeaderProps;

export function ProfilePanelHeader({ className, ...props }: ProfilePanelHeaderProps) {
  const theme = useThemeFamily();
  const { header } = profilePanel({ theme });

  return <PanelHeader {...props} className={header({ className })} />;
}

export type ProfilePanelHeaderContentProps = PanelHeaderContentProps;

export function ProfilePanelHeaderContent({ className, ...props }: ProfilePanelHeaderContentProps) {
  const theme = useThemeFamily();
  const { headerContent } = profilePanel({ theme });

  return <PanelHeaderContent {...props} className={headerContent({ className })} />;
}

export type ProfilePanelBodyProps = PanelBodyProps;

// Shares the conversation panel's raised content chrome so profile detail
// surfaces read as the same material as the chat panel.
export function ProfilePanelBody({ className, ...props }: ProfilePanelBodyProps) {
  const theme = useThemeFamily();
  const { content } = conversationPanel({ theme });

  return <PanelBody {...props} data-slot="profile-panel-body" className={content({ className })} />;
}

export type ProfilePanelSectionProps = PanelSectionProps;

export function ProfilePanelSection({ className, ...props }: ProfilePanelSectionProps) {
  const theme = useThemeFamily();
  const { section } = profilePanel({ theme });

  return <PanelSection {...props} className={section({ className })} />;
}
