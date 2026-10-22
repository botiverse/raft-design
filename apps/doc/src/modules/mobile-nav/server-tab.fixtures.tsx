import { Activity, CheckSquare, Home, Search } from "lucide-react";

export type Server = { id: string; name: string; slug: string; unread: number; muted?: boolean };

export const SERVERS: Server[] = [
  { id: "hq", name: "Raft HQ", slug: "/raft-hq", unread: 0 },
  { id: "launch", name: "Launch Crew", slug: "/launch", unread: 3 },
  { id: "guild", name: "Design Guild", slug: "/design-guild", unread: 12 },
  { id: "labs", name: "Botiverse Research Laboratories", slug: "/labs", unread: 0 },
  { id: "club", name: "Open Source Club", slug: "/oss-club", unread: 5, muted: true },
];

export const TABS = [
  { id: "home", label: "Home", icon: <Home /> },
  { id: "activity", label: "Activity", icon: <Activity /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare /> },
  { id: "search", label: "Search", icon: <Search /> },
];
