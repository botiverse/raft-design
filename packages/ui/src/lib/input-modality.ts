/**
 * Input modality: whether the person last moved through the page with a
 * pointer or with the keyboard. raft-ui shows a focus indicator only after
 * keyboard navigation (design/foundations/states.md#focus): styles.css clears
 * `--focus-ring` and the `keyboard:` variant stops matching while the root
 * carries `data-input-modality="pointer"`. With no attribute (no script, or
 * the tracker not installed) every focus indicator shows, as it did before.
 */
export type InputModality = "pointer" | "keyboard";

const INPUT_MODALITY_ATTRIBUTE = "data-input-modality";

/** Keys that move focus or act on the focused element wherever focus is. */
const NAVIGATION_KEYS = new Set(["Tab", "Escape", "F6"]);

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

/** Keys that activate a control, but type into a text field. */
const ACTIVATION_KEYS = new Set(["Enter", " ", "Spacebar"]);

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
  // The focused element may sit in a shadow root; the path's first entry is it.
  const target = event.composedPath?.()[0] ?? event.target;
  return !isTextEntry(target);
}

interface Installation {
  count: number;
  remove: () => void;
}

const installations = new WeakMap<Document, Installation>();

/**
 * Track the input modality on `doc.documentElement` as
 * `data-input-modality="pointer" | "keyboard"`. It starts as `pointer`; a
 * navigation key (Tab, the arrows, Home, End, Page Up, Page Down, Esc, F6, and
 * Enter or Space outside a text field) makes it `keyboard`, and a pointer
 * press makes it `pointer` again. Typing never counts: the arrows, Enter and
 * Space in a text field, and Cmd or Ctrl shortcuts leave it as it is.
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
    const set = (modality: InputModality) => {
      if (root.getAttribute(INPUT_MODALITY_ATTRIBUTE) !== modality) {
        root.setAttribute(INPUT_MODALITY_ATTRIBUTE, modality);
      }
    };
    const onPointerDown = () => set("pointer");
    const onKeyDown = (event: KeyboardEvent) => {
      if (keyboardNavigates(event)) set("keyboard");
    };
    const options = { capture: true, passive: true } as const;
    target.addEventListener("pointerdown", onPointerDown, options);
    target.addEventListener("keydown", onKeyDown, options);
    set("pointer");
    installation = {
      count: 0,
      remove: () => {
        target.removeEventListener("pointerdown", onPointerDown, options);
        target.removeEventListener("keydown", onKeyDown, options);
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
