import { createContext, useContext, useId, useLayoutEffect, useRef, useState } from "react";

/**
 * A MessageItem is announced as an article named by its sender and its time
 * (design/foundations/states.md#located). The parts that show them register
 * their ids with the row, and the row writes `aria-labelledby` itself.
 *
 * The row writes the attribute onto its element instead of rendering it from
 * state: a part mounts after its row has rendered, so state would give every
 * message a second render on mount, in lists of thousands. Only the parts
 * that are there are named, so a continuation row, which has no sender, is
 * named by its time and points at no id that isn't in the document.
 */
type LabelPart = "sender" | "time";

type LabelRegistry = {
  register: (part: LabelPart, id: string) => () => void;
};

const MessageItemLabelContext = createContext<LabelRegistry | null>(null);

export const MessageItemLabelProvider = MessageItemLabelContext.Provider;

/**
 * The id of a sender or time part, registered with the MessageItem around it.
 * A consumer's own `id` wins and is the one registered. Outside a MessageItem
 * the part gets no id.
 */
export function useMessageItemLabelId(part: LabelPart, id: string | undefined) {
  const registry = useContext(MessageItemLabelContext);
  const generatedId = useId();
  const resolvedId = id ?? (registry ? generatedId : undefined);

  useLayoutEffect(() => {
    if (!registry || !resolvedId) return undefined;
    return registry.register(part, resolvedId);
  }, [registry, part, resolvedId]);

  return resolvedId;
}

/** Roles that can't be named: on them the row writes no `aria-labelledby`. */
const NAMELESS_ROLES = new Set(["none", "presentation", "generic"]);

type LabelMode = "parts" | "consumer" | "off";

/**
 * The row's side: a stable registry for its parts and a ref for its element.
 * A consumer's `aria-labelledby` is rendered by React and left alone; a
 * consumer's `aria-label`, or a role that takes no name, turns the parts'
 * name off, since `aria-labelledby` would win over the label.
 */
export function useMessageItemLabel({
  role,
  ariaLabel,
  ariaLabelledBy,
}: {
  role: string | undefined;
  ariaLabel: string | undefined;
  ariaLabelledBy: string | undefined;
}) {
  const mode: LabelMode =
    ariaLabelledBy !== undefined
      ? "consumer"
      : ariaLabel !== undefined || (role !== undefined && NAMELESS_ROLES.has(role))
        ? "off"
        : "parts";
  const modeRef = useRef<LabelMode>(mode);

  const [label] = useState(() => {
    const parts: Record<LabelPart, string[]> = { sender: [], time: [] };
    let element: HTMLElement | null = null;

    const sync = () => {
      if (!element || modeRef.current === "consumer") return;
      const value = modeRef.current === "parts" ? [...parts.sender, ...parts.time].join(" ") : "";
      if (!value) element.removeAttribute("aria-labelledby");
      else if (element.getAttribute("aria-labelledby") !== value) {
        element.setAttribute("aria-labelledby", value);
      }
    };

    const registry: LabelRegistry = {
      register(part, id) {
        parts[part].push(id);
        sync();
        return () => {
          const index = parts[part].indexOf(id);
          if (index !== -1) parts[part].splice(index, 1);
          sync();
        };
      },
    };

    const ref = (node: HTMLElement | null) => {
      element = node;
      sync();
    };

    return { registry, ref, sync };
  });

  useLayoutEffect(() => {
    modeRef.current = mode;
    label.sync();
  }, [mode, label]);

  return label;
}
