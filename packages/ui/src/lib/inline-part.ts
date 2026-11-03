// A part that sits inline in running text, such as a key or a shortcut, and is
// never a leading icon: a container that sorts its children (TooltipContent)
// reads the mark instead of importing the part, so it depends on no component.
const INLINE_PART = Symbol.for("@botiverse/raft-ui/inline-part");

/** Mark a component as an inline part. */
export function markInlinePart<T extends object>(component: T): T {
  Object.defineProperty(component, INLINE_PART, { value: true });
  return component;
}

/** Whether an element type was marked with markInlinePart. */
export function isInlinePart(type: unknown): boolean {
  return (
    (typeof type === "function" || (typeof type === "object" && type !== null)) &&
    INLINE_PART in type
  );
}
