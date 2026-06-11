export type TocItem = { id: string; title: string };

export function Toc({ items }: { items: readonly TocItem[] }) {
  return (
    <aside className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden h-screen w-[var(--rail-w)] border-l border-gray-200 px-5 py-6 xl:block">
      <nav className="pointer-events-auto max-h-full overflow-y-auto">
        <p className="mb-4 text-[13px] font-medium text-foreground-strong">On this page</p>
        <ul className="space-y-3 text-xs">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block text-foreground-muted transition-colors hover:text-gray-950"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
