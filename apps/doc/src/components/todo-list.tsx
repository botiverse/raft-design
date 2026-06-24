import { Badge, type BadgeProps } from "raft-ui";

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

const STATUS_VARIANT: Record<TodoStatus, BadgeProps["variant"]> = {
  done: "success",
  todo: "muted",
  deferred: "default",
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
            className="flex items-start gap-2.5 text-sm text-foreground-muted"
            aria-label={`${STATUS_LABEL[normalized.status]}: ${normalized.label}`}
          >
            <Badge
              appearance="soft"
              variant={STATUS_VARIANT[normalized.status]}
              uppercase
              className="mt-0.5 shrink-0"
            >
              {STATUS_LABEL[normalized.status]}
            </Badge>
            {normalized.label}
          </li>
        );
      })}
    </ul>
  );
}
