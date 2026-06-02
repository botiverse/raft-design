type TodoListProps = {
  items: readonly string[];
};

/** Tracks outstanding work for a component, rendered as an unchecked checklist. */
export function TodoList({ items }: TodoListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
          <span className="mt-0.5 size-4 shrink-0 rounded border border-gray-300" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}
