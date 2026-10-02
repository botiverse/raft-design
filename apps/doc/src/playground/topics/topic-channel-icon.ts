import {
  AlertTriangle,
  CalendarDays,
  Coffee,
  FileText,
  GitBranch,
  LifeBuoy,
  Lock,
  Megaphone,
  Rocket,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { PlaygroundTopicChannelId, PlaygroundTopicChannelRecord } from "../mock/index.ts";

const TOPIC_CHANNEL_ICONS: Partial<Record<PlaygroundTopicChannelId, LucideIcon>> = {
  announcements: Megaphone,
  "weekly-updates": CalendarDays,
  proposals: FileText,
  "engineering-help": LifeBuoy,
  releases: Rocket,
  incidents: AlertTriangle,
  research: Search,
  lounge: Coffee,
};

/** Access wins over the category icon, matching chat's private and shared rooms. */
export function getTopicChannelIcon(channel: PlaygroundTopicChannelRecord): LucideIcon {
  if (channel.access?.kind === "private") return Lock;
  if (channel.access?.kind === "shared") return GitBranch;
  return TOPIC_CHANNEL_ICONS[channel.id] ?? FileText;
}
