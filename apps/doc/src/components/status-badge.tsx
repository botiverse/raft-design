// Progress badges. An item carries its status until it drops the badge once done.
const STATUS = {
  "in-progress": { label: "WIP", className: "bg-amber-100 text-amber-700" },
  review: { label: "Review", className: "bg-violet-100 text-violet-700" },
} as const;

export type StatusKey = keyof typeof STATUS;

export function StatusBadge({ status }: { status?: StatusKey }) {
  if (!status) return null;
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS[status].className}`}
    >
      {STATUS[status].label}
    </span>
  );
}
