export type TocItem = {
  id: string;
  title: string;
  children?: readonly TocItem[];
};

function TocEntries({ items, depth = 0 }: { items: readonly TocItem[]; depth?: number }) {
  return (
    <ul
      className={
        depth === 0 ? "space-y-3 text-xs" : "mt-2 space-y-2 border-l border-line-subtle pl-3"
      }
    >
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={`block transition-colors hover:text-foreground-strong ${
              depth === 0 ? "text-foreground-muted" : "text-foreground-placeholder"
            }`}
          >
            {item.title}
          </a>
          {item.children?.length ? <TocEntries items={item.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

export function Toc({ items }: { items: readonly TocItem[] }) {
  return (
    <aside className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden h-screen w-[var(--rail-w)] px-5 py-6 xl:block">
      <nav className="pointer-events-auto max-h-full overflow-y-auto">
        <p className="mb-4 text-[13px] font-medium text-foreground-strong">On this page</p>
        <TocEntries items={items} />
      </nav>
    </aside>
  );
}
