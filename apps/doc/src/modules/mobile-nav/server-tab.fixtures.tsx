import { Activity, CheckSquare, Home, Search } from "lucide-react";

export type Server = { id: string; name: string; address: string; unread: number; muted?: boolean };

export const SERVERS: Server[] = [
  { id: "hq", name: "Raft HQ", address: "/raft-hq", unread: 0 },
  { id: "launch", name: "Launch Crew", address: "/launch", unread: 3 },
  { id: "guild", name: "Design Guild", address: "/design-guild", unread: 12 },
  { id: "labs", name: "Botiverse Research Laboratories", address: "/labs", unread: 0 },
  { id: "community", name: "Raft Community", address: "/community", unread: 5, muted: true },
];

export const TABS = [
  { id: "home", label: "Home", icon: <Home /> },
  { id: "activity", label: "Activity", icon: <Activity /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare /> },
  { id: "search", label: "Search", icon: <Search /> },
];
