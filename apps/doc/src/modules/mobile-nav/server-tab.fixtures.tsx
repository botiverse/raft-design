import { Activity, CheckSquare, Home, Search } from "lucide-react";

export type Server = { id: string; name: string; unread: number; muted?: boolean };

export const SERVERS: Server[] = [
  { id: "hq", name: "Raft HQ", unread: 0 },
  { id: "launch", name: "Launch Crew", unread: 3 },
  { id: "guild", name: "Design Guild", unread: 12 },
  { id: "labs", name: "Botiverse Research Laboratories", unread: 0 },
  { id: "club", name: "Open Source Club", unread: 5, muted: true },
];

export const TABS = [
  { id: "home", label: "Home", icon: <Home /> },
  { id: "activity", label: "Activity", icon: <Activity /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare /> },
  { id: "search", label: "Search", icon: <Search /> },
];
