/**
 * Input modality: whether the person last moved through the page with a
 * pointer, with the keyboard, or by a virtual cursor (a screen reader). raft-ui shows a focus indicator only after
 * keyboard navigation (design/foundations/states.md#focus): styles.css clears
 * `--focus-ring` and the `keyboard:` variant stops matching while the root
 * carries `data-input-modality="pointer"`. With no attribute (no script, or
 * the tracker not installed) every focus indicator shows, as it did before.
 */
export type InputModality = "pointer" | "keyboard" | "virtual";

const INPUT_MODALITY_ATTRIBUTE = "data-input-modality";

/** Keys that move focus wherever focus is. */
const NAVIGATION_KEYS = new Set(["Tab", "F6"]);

/** Keys that navigate a widget, but move the caret in a text field. */
const CARET_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

/**
 * Keys that activate or dismiss a control, but belong to editing in a text
 * field. Esc in the composer closes a suggestion list or cancels an edit; it
 * must not turn the composer's ring on for someone using a mouse.
 */
const ACTIVATION_KEYS = new Set(["Enter", " ", "Spacebar", "Escape"]);

/** Input types that take typed text (and whose arrow keys move a caret or step a value). */
const TEXT_INPUT_TYPES = new Set([
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "number",
  "date",
  "datetime-local",
  "month",
  "time",
  "week",
]);

/** `isContentEditable`, for DOMs that don't implement it. */
const EDITABLE =
  '[contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';

function isTextEntry(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object" || !("nodeType" in target)) return false;
  const element = target as HTMLElement;
  if (element.tagName === "TEXTAREA") return true;
  if (element.tagName === "INPUT") return TEXT_INPUT_TYPES.has((element as HTMLInputElement).type);
  return element.isContentEditable === true || element.closest?.(EDITABLE) != null;
}

function keyboardNavigates(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey) return false;
  if (NAVIGATION_KEYS.has(event.key)) return true;
  if (!CARET_KEYS.has(event.key) && !ACTIVATION_KEYS.has(event.key)) return false;
  return !isTextEntry(eventTarget(event));
}

/** A key that edits in a text field, but may also send focus out of it (Esc closing a dialog, Enter submitting). */
function editingKeyInField(event: KeyboardEvent): HTMLElement | null {
  if (event.metaKey || event.ctrlKey) return null;
  if (!CARET_KEYS.has(event.key) && !ACTIVATION_KEYS.has(event.key)) return null;
  const target = eventTarget(event);
  return isTextEntry(target) ? (target as HTMLElement) : null;
}

/** The focused element may sit in a shadow root; the path's first entry is it. */
function eventTarget(event: Event): EventTarget | null {
  return event.composedPath?.()[0] ?? event.target;
}

/**
 * A pointer event a screen reader synthesizes (VoiceOver, TalkBack, NVDA
 * activating an element): it has no real contact area. Same test as React
 * Aria's `isVirtualPointerEvent`.
 */
function isVirtualPointerEvent(event: PointerEvent): boolean {
  return (
    (event.width === 0 && event.height === 0) ||
    (event.width === 1 &&
      event.height === 1 &&
      event.pressure === 0 &&
      event.detail === 0 &&
      event.pointerType === "mouse")
  );
}

/** How long after a key or a pointer press a focus move still counts as caused by it. */
const CAUSE_WINDOW_MS = 1000;

interface Installation {
  count: number;
  remove: () => void;
}

const installations = new WeakMap<Document, Installation>();

/**
 * Track the input modality on `doc.documentElement` as
 * `data-input-modality="pointer" | "keyboard" | "virtual"`. Only `pointer`
 * hides focus rings, so every uncertain case keeps them visible:
 *
 * - **Unknown at first.** No attribute until there is evidence, so a keyboard
 *   user who hasn't pressed Tab yet still sees focus moved by code. The first
 *   real mouse movement or press makes it `pointer`.
 * - **Keyboard**: Tab and F6 anywhere; the arrows, Home, End, Page Up, Page
 *   Down, Enter, Space and Esc outside a text field. Inside a text field those
 *   keys edit and leave the modality alone, unless focus leaves the field
 *   right after (Esc closing a dialog, Enter submitting): then it is
 *   `keyboard`. Typing and Cmd or Ctrl shortcuts never count; a shortcut that
 *   moves focus to a control is caught by the next rule.
 * - **Virtual**: focus that arrives with no key or pointer press just before
 *   it (a screen reader's browse cursor, a timer), and a screen reader's
 *   synthesized pointer press. Rings show.
 * - **Pointer**: a real pointer press, or real pointer movement while the
 *   modality is still unknown or virtual.
 *
 * `ThemeProvider` calls this for you. Installing twice adds no second set of
 * listeners. Returns a function that undoes this installation; the listeners
 * and the attribute go once every installation is undone.
 */
export function installInputModality(doc?: Document): () => void {
  const target = doc ?? (typeof document === "undefined" ? undefined : document);
  if (!target) return () => undefined;

  let installation = installations.get(target);
  if (!installation) {
    const root = target.documentElement;
    const current = () => root.getAttribute(INPUT_MODALITY_ATTRIBUTE);
    const set = (modality: InputModality) => {
      if (current() !== modality) root.setAttribute(INPUT_MODALITY_ATTRIBUTE, modality);
    };
    const now = () => target.defaultView?.performance?.now() ?? Date.now();
    let lastInputAt = -Infinity;
    // The text field an editing key was pressed in, while focus may still leave it.
    let editingIn: HTMLElement | null = null;
    let editingAt = -Infinity;

    const onPointerDown = (event: PointerEvent) => {
      lastInputAt = now();
      editingIn = null;
      set(isVirtualPointerEvent(event) ? "virtual" : "pointer");
    };
    const onPointerMove = (event: PointerEvent) => {
      // Real movement settles an unknown or virtual start; it never overrides the keyboard.
      if (current() === "keyboard" || current() === "pointer") return;
      if (event.pointerType === "mouse" && !isVirtualPointerEvent(event)) set("pointer");
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Shift" ||
        event.key === "Control" ||
        event.key === "Alt" ||
        event.key === "Meta"
      )
        return;
      lastInputAt = now();
      if (keyboardNavigates(event)) {
        editingIn = null;
        set("keyboard");
        return;
      }
      const field = editingKeyInField(event);
      if (field) {
        editingIn = field;
        editingAt = now();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      const focused = eventTarget(event) as Node | null;
      if (editingIn && now() - editingAt < CAUSE_WINDOW_MS) {
        const left = !focused || (focused !== editingIn && !editingIn.contains(focused));
        if (left) {
          editingIn = null;
          set("keyboard");
          return;
        }
        return;
      }
      if (now() - lastInputAt > CAUSE_WINDOW_MS) set("virtual");
    };
    const options = { capture: true, passive: true } as const;
    target.addEventListener("pointerdown", onPointerDown, options);
    target.addEventListener("pointermove", onPointerMove, options);
    target.addEventListener("keydown", onKeyDown, options);
    target.addEventListener("focusin", onFocusIn, options);
    installation = {
      count: 0,
      remove: () => {
        target.removeEventListener("pointerdown", onPointerDown, options);
        target.removeEventListener("pointermove", onPointerMove, options);
        target.removeEventListener("keydown", onKeyDown, options);
        target.removeEventListener("focusin", onFocusIn, options);
        root.removeAttribute(INPUT_MODALITY_ATTRIBUTE);
      },
    };
    installations.set(target, installation);
  }
  installation.count += 1;

  let undone = false;
  const current = installation;
  return () => {
    if (undone) return;
    undone = true;
    current.count -= 1;
    if (current.count === 0) {
      current.remove();
      installations.delete(target);
    }
  };
}
