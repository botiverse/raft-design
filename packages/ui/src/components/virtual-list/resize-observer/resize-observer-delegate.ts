import { ownerWindow } from "../../../lib/owner-window";

/*
 * One shared ResizeObserver for every list and item of a window: the browser's own. Each window has
 * its own (a list rendered into another window under PortalContainerProvider): an observer reports
 * in its window's rendering cycle, and the page's stops while the page's window is hidden. Where
 * there is none (a test environment without layout), nothing is observed; rows are still measured
 * when they mount.
 */

/** The entries the delegate passes on are for the elements `observe()` was called with. */
export type ObservedResizeEntry = ResizeObserverEntry & { target: HTMLElement };
type ObservedResizeCallback = (entry: ObservedResizeEntry) => void;

/**
 * Observes elements with one ResizeObserver, created on the first `observe()`, and calls each
 * element's own callback. Entries whose target is detached (no `parentElement`) are ignored.
 * `runAfterEntries(fn)` (from an element's callback) runs `fn` once after every entry of the current
 * notification has been delivered: VirtualList measures all of a list's rows once per notification,
 * not once per row.
 */
class ResizeObserverDelegate {
  view: Window & typeof globalThis;
  constructor(view: Window & typeof globalThis) {
    this.view = view;
  }

  observer: ResizeObserver | null | undefined = undefined;
  callbacksMap = new Map<Element, ObservedResizeCallback>();
  observedDomSet = new WeakSet<Element>();
  afterEntries = new Set<() => void>();

  /** The window's shared observer, created on first use; `null` without a native ResizeObserver. */
  ensureObserver(): ResizeObserver | null {
    if (this.observer === undefined) {
      const { ResizeObserver } = this.view;
      this.observer =
        typeof ResizeObserver === "undefined" ? null : new ResizeObserver(this.callback.bind(this));
    }
    return this.observer;
  }

  callback(entries: ResizeObserverEntry[]): void {
    for (const entry of entries) {
      if (!entry.target.parentElement) {
        continue;
      }
      const callback = this.callbacksMap.get(entry.target);
      if (callback) {
        callback(entry as ObservedResizeEntry);
      }
    }
    const afterEntries = [...this.afterEntries];
    this.afterEntries.clear();
    for (const fn of afterEntries) {
      fn();
    }
  }

  runAfterEntries(fn: () => void): void {
    this.afterEntries.add(fn);
  }

  observe(el: HTMLElement, callback: ObservedResizeCallback): void {
    this.callbacksMap.set(el, callback);
    if (!this.observedDomSet.has(el)) {
      this.ensureObserver()?.observe(el);
      this.observedDomSet.add(el);
    }
  }

  unobserve(el: HTMLElement): void {
    this.callbacksMap.delete(el);
    if (this.observedDomSet.has(el)) {
      this.ensureObserver()?.unobserve(el);
      this.observedDomSet.delete(el);
    }
  }
}

const delegates = new WeakMap<Window, ResizeObserverDelegate>();

/**
 * The shared delegate of the window `element` is in (the page's own for none), created on first
 * use. Observe and unobserve an element with the delegate of its own window.
 */
export function getResizeObserverDelegate(element?: Node | null): ResizeObserverDelegate {
  const view = ownerWindow(element);
  let delegate = delegates.get(view);
  if (!delegate) {
    delegate = new ResizeObserverDelegate(view);
    delegates.set(view, delegate);
  }
  return delegate;
}
