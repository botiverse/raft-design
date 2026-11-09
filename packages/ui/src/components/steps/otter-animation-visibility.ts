/** One observer/listener per document, regardless of the number of illustrations. */
const documents = new WeakMap<Document, { observe: (node: SVGSVGElement) => () => void }>();

export function observeOtterAnimation(node: SVGSVGElement): () => void {
  const doc = node.ownerDocument;
  let manager = documents.get(doc);
  if (!manager) {
    const visible = new Map<SVGSVGElement, boolean>();
    const update = (element: SVGSVGElement, intersects: boolean) => {
      element.dataset.animate = String(intersects && !doc.hidden);
    };
    const onVisibility = () => {
      for (const [element, intersects] of visible) update(element, intersects);
    };
    const Observer = doc.defaultView?.IntersectionObserver;
    const observer = Observer
      ? new Observer((entries) => {
          for (const entry of entries) {
            const element = entry.target as SVGSVGElement;
            if (!visible.has(element)) continue;
            visible.set(element, entry.isIntersecting);
            update(element, entry.isIntersecting);
          }
        })
      : null;
    doc.addEventListener("visibilitychange", onVisibility);
    manager = {
      observe(element) {
        visible.set(element, !observer);
        update(element, !observer);
        observer?.observe(element);
        return () => {
          observer?.unobserve(element);
          visible.delete(element);
          delete element.dataset.animate;
          if (visible.size === 0) {
            observer?.disconnect();
            doc.removeEventListener("visibilitychange", onVisibility);
            documents.delete(doc);
          }
        };
      },
    };
    documents.set(doc, manager);
  }
  return manager.observe(node);
}
