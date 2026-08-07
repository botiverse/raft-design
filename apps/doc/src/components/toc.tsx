import { useEffect, useState } from "react";

export type TocItem = {
  id: string;
  title: string;
  children?: readonly TocItem[];
};

function getAutoChildren() {
  const childrenByParent = new Map<string, TocItem[]>();

  for (const element of document.querySelectorAll<HTMLElement>(
    "[data-doc-toc-parent][data-doc-toc-item][id]",
  )) {
    const parentId = element.dataset.docTocParent;
    const title = element.dataset.docTocItem;

    if (!parentId || !title) {
      continue;
    }

    const children = childrenByParent.get(parentId) ?? [];
    children.push({ id: element.id, title });
    childrenByParent.set(parentId, children);
  }

  return childrenByParent;
}

function withAutoChildren(items: readonly TocItem[]) {
  const childrenByParent = getAutoChildren();

  if (!childrenByParent.size) {
    return items;
  }

  let changed = false;
  const nextItems = items.map((item) => {
    const children = childrenByParent.get(item.id);

    if (!children?.length) {
      return item;
    }

    changed = true;
    return { ...item, children };
  });

  return changed ? nextItems : items;
}

function TocEntries({ items, depth = 0 }: { items: readonly TocItem[]; depth?: number }) {
  return (
    <ul
      className={
        depth === 0 ? "space-y-3 text-xs" : "mt-2 space-y-2 border-l border-line-muted pl-3"
      }
    >
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={`block transition-colors hover:text-foreground ${
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
    setResolvedItems(withAutoChildren(items));
  }, [items]);

  return (
    <aside className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden h-screen w-(--toc-w) px-5 py-6 xl:block">
      <nav className="pointer-events-auto max-h-full overflow-y-auto">
        <p className="mb-4 text-[13px] font-medium text-foreground">On this page</p>
        <TocEntries items={resolvedItems} />
      </nav>
    </aside>
  );
}
