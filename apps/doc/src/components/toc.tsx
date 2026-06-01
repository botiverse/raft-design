export type TocItem = { id: string; title: string };

export function Toc({ items }: { items: readonly TocItem[] }) {
  return (
    <aside className="sticky top-10 hidden h-fit w-56 shrink-0 xl:block">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">On this page</p>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block text-gray-500 transition-colors hover:text-gray-900"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
