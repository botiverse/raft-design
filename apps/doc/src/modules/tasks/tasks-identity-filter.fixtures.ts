export type TasksIdentity = {
  id: string;
  label: string;
  type: "human" | "agent";
  avatarSrc?: string;
  fallback?: string;
};

export const TASKS_IDENTITY_FIXTURES = [
  { id: "avery", label: "Avery Chen", type: "human", fallback: "AC" },
  { id: "atlas", label: "Atlas", type: "agent", fallback: "A" },
  { id: "samira", label: "Samira Khan", type: "human", fallback: "SK" },
] as const satisfies readonly TasksIdentity[];
