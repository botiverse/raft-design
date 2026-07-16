import { Ban, CheckCircle, Circle, Eye, Play } from "lucide-react";

import type { PlaygroundTaskStatus } from "../mock/index.ts";

export const TASK_STATUS_CONFIG: Record<
  PlaygroundTaskStatus,
  {
    variant: "accent" | "information" | "muted" | "success" | "warning";
    icon: typeof Circle;
    label: string;
  }
> = {
  todo: { variant: "warning", icon: Circle, label: "Todo" },
  in_progress: { variant: "information", icon: Play, label: "In Progress" },
  in_review: { variant: "accent", icon: Eye, label: "In Review" },
  done: { variant: "success", icon: CheckCircle, label: "Done" },
  closed: { variant: "muted", icon: Ban, label: "Closed" },
};
