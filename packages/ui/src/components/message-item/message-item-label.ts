import {
  createContext,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * A MessageItem is announced as an article named by its sender and its time
 * (design/foundations/states.md#located). The parts that show them register
 * their ids with the row, and the row writes `role` and `aria-labelledby`
 * itself.
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

/** What the consumer set on the row: on MessageItem or on its `render` element. */
type ConsumerLabel = {
  role: string | undefined;
  ariaLabel: string | undefined;
  ariaLabelledBy: string | undefined;
};

/**
 * The row's side: a stable registry for its parts and a ref for its element.
 * The row writes `role="article"` and `aria-labelledby` itself, and only once
 * something names it: a sender or time part, or the consumer's `aria-label` or
 * `aria-labelledby`. A row with none of them (a receipt card in the text
 * column, say) stays a plain `div`, not an article with no name.
 *
 * A consumer's `role` or `aria-labelledby` is rendered by React and left
 * alone. A consumer's `aria-label`, or a role that takes no name, turns the
 * parts' `aria-labelledby` off, since it would win over the label.
 */
export function useMessageItemLabel(consumer: ConsumerLabel) {
  const consumerRef = useRef(consumer);

  const [label] = useState(() => {
    const parts: Record<LabelPart, string[]> = { sender: [], time: [] };
    let element: HTMLElement | null = null;

    const write = (name: string, value: string) => {
      if (!element) return;
      if (!value) element.removeAttribute(name);
      else if (element.getAttribute(name) !== value) element.setAttribute(name, value);
    };

    const sync = () => {
      const { role, ariaLabel, ariaLabelledBy } = consumerRef.current;
      const ids = [...parts.sender, ...parts.time].join(" ");
      if (role === undefined) {
        const named = ids !== "" || ariaLabel !== undefined || ariaLabelledBy !== undefined;
        write("role", named ? "article" : "");
      }
      if (ariaLabelledBy === undefined) {
        const nameable = role === undefined || !NAMELESS_ROLES.has(role);
        write("aria-labelledby", ariaLabel === undefined && nameable ? ids : "");
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

  const { role, ariaLabel, ariaLabelledBy } = consumer;
  useLayoutEffect(() => {
    consumerRef.current = { role, ariaLabel, ariaLabelledBy };
    label.sync();
  }, [role, ariaLabel, ariaLabelledBy, label]);

  return label;
}

/**
 * The consumer's role and name, from MessageItem's props and, where `render`
 * is an element, from that element's props, which Base UI merges over them.
 * A `render` function's props can't be read: pass them to MessageItem.
 */
export function readConsumerLabel(
  props: {
    role?: string | undefined;
    "aria-label"?: string | undefined;
    "aria-labelledby"?: string | undefined;
  },
  render: unknown,
): ConsumerLabel {
  const own = isValidElement(render)
    ? (render.props as Record<string, unknown>)
    : ({} as Record<string, unknown>);
  const pick = (key: "role" | "aria-label" | "aria-labelledby") =>
    (key in own ? own[key] : props[key]) as string | undefined;
  return {
    role: pick("role"),
    ariaLabel: pick("aria-label"),
    ariaLabelledBy: pick("aria-labelledby"),
  };
}
