import { useThemeFamily } from "../../lib/theme/use-theme";
import { Panel, PanelSection, type PanelProps, type PanelSectionProps } from "../panel/panel";
import {
  PanelHeader,
  PanelHeaderContent,
  type PanelHeaderContentProps,
  type PanelHeaderProps,
} from "../panel/panel-header";
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

export type ProfilePanelSectionProps = PanelSectionProps;

export function ProfilePanelSection({ className, ...props }: ProfilePanelSectionProps) {
  const theme = useThemeFamily();
  const { section } = profilePanel({ theme });

  return <PanelSection {...props} className={section({ className })} />;
}
