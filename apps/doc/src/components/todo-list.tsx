type TodoStatus = "done" | "todo" | "deferred";

type TodoListItem =
  | string
  | {
      label: string;
      status: TodoStatus;
    };

type TodoListProps = {
  items: readonly TodoListItem[];
};

const STATUS_LABEL: Record<TodoStatus, string> = {
  done: "Done",
  todo: "Todo",
  deferred: "Deferred",
};

const STATUS_CLASS: Record<TodoStatus, string> = {
  done: "border-emerald-200 bg-emerald-50 text-emerald-700",
  todo: "border-amber-200 bg-amber-50 text-amber-700",
  deferred: "border-gray-200 bg-gray-50 text-gray-500",
};

/** Tracks component work with lightweight status labels. */
export function TodoList({ items }: TodoListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const normalized =
          typeof item === "string" ? { label: item, status: "todo" as const } : item;

        return (
          <li
            key={normalized.label}
            className="flex items-start gap-2.5 text-sm text-gray-600"
            aria-label={`${STATUS_LABEL[normalized.status]}: ${normalized.label}`}
          >
            <span
              className={`mt-0.5 inline-flex h-4 shrink-0 items-center border px-1 text-[9px] font-bold uppercase leading-none ${STATUS_CLASS[normalized.status]}`}
            >
              {STATUS_LABEL[normalized.status]}
            </span>
            {normalized.label}
          </li>
        );
      })}
    </ul>
  );
}
