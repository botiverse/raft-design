import type { Channel } from "../../store/channelStore";

export type SidebarSortMode = "manual" | "recent" | "az";

function timestampMs(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function labelKey(value: string | null | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase();
}

function compareLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: "base", numeric: true });
}

export function sidebarDmLabel(dm: Channel): string {
  return dm.peerDisplayName || dm.peerName || dm.name;
}

export function sortSidebarItems<T extends { id: string; createdAt: string; lastMessageAt?: string | null }>(
  items: T[],
  mode: SidebarSortMode,
  getLabel: (item: T) => string,
): T[] {
  if (mode === "manual") return items;
  return [...items].sort((a, b) => {
    if (mode === "recent") {
      const aTime = timestampMs(a.lastMessageAt) || timestampMs(a.createdAt);
      const bTime = timestampMs(b.lastMessageAt) || timestampMs(b.createdAt);
      if (aTime !== bTime) return bTime - aTime;
    }

    const labelResult = compareLabels(labelKey(getLabel(a)), labelKey(getLabel(b)));
    if (labelResult !== 0) return labelResult;
    return a.id.localeCompare(b.id);
  });
}

export function sortSidebarChannels(
  channels: Channel[],
  mode: SidebarSortMode,
  allChannelId?: string | null,
): Channel[] {
  if (mode === "manual") return channels;
  const allChannel = allChannelId ? channels.find((channel) => channel.id === allChannelId) ?? null : null;
  const rest = channels.filter((channel) => channel.id !== allChannelId);
  const sorted = sortSidebarItems(rest, mode, (channel) => channel.name);
  return allChannel ? [allChannel, ...sorted] : sorted;
}

export function sortSidebarDms(dms: Channel[], mode: SidebarSortMode): Channel[] {
  return sortSidebarItems(dms, mode, sidebarDmLabel);
}

export interface SidebarPinnedSortItem {
  id: string;
  createdAt: string;
  lastMessageAt?: string | null;
  label: string;
}

export function sortSidebarPinnedItems<T extends SidebarPinnedSortItem>(items: T[], mode: SidebarSortMode): T[] {
  return sortSidebarItems(items, mode, (item) => item.label);
}
