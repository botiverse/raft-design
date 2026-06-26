import { useEffect, useState } from "react";

export type TocItem = {
  id: string;
  title: string;
  children?: readonly TocItem[];
};

function getAutoSourceComparisonChildren() {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-source-comparison-item][id]"))
    .map((element) => ({
      id: element.id,
      title: element.dataset.sourceComparisonItem ?? "",
    }))
    .filter((item) => item.id && item.title);
}

function withAutoSourceComparisonChildren(items: readonly TocItem[]) {
  const sourceComparisonChildren = getAutoSourceComparisonChildren();

  if (!sourceComparisonChildren.length) {
    return items;
  }

  let changed = false;
  const nextItems = items.map((item) => {
    if (item.id !== "source-comparison") {
      return item;
    }

    changed = true;
    return { ...item, children: sourceComparisonChildren };
  });

  return changed ? nextItems : items;
}

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
  const [resolvedItems, setResolvedItems] = useState(items);

  useEffect(() => {
    setResolvedItems(withAutoSourceComparisonChildren(items));
  }, [items]);

  return (
    <aside className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden h-screen w-[var(--toc-w)] px-5 py-6 xl:block">
      <nav className="pointer-events-auto max-h-full overflow-y-auto">
        <p className="mb-4 text-[13px] font-medium text-foreground-strong">On this page</p>
        <TocEntries items={resolvedItems} />
      </nav>
    </aside>
  );
}
