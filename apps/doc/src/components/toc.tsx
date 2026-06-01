export type TocItem = { id: string; title: string };

export function Toc({ items }: { items: readonly TocItem[] }) {
  return (
    <aside className="fixed inset-y-0 right-0 z-30 hidden h-screen w-[var(--rail-w)] overflow-y-auto border-l border-gray-200 px-5 py-6 xl:block">
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
