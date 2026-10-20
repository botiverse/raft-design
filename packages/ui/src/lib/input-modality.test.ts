/**
 * @vitest-environment jsdom
 */
/**
 * The input-modality tracker behind keyboard-only focus rings
 * (design/foundations/states.md#focus): a navigation key says "keyboard",
 * a real pointer press says "pointer", typing never changes it, and every
 * uncertain case (no input yet, a screen reader) keeps rings visible.
 */
import { afterEach, beforeEach, expect, test } from "vite-plus/test";
import { installInputModality } from "./input-modality";

const modality = () => document.documentElement.getAttribute("data-input-modality");

let uninstall: () => void = () => undefined;
let field: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = `
    <textarea data-testid="textarea"></textarea>
    <input data-testid="text" type="text" />
    <input data-testid="search" type="search" />
    <input data-testid="checkbox" type="checkbox" />
    <div data-testid="editable" contenteditable="true"><span data-testid="inside">x</span></div>
    <button data-testid="button">Send</button>
  `;
  field = document.querySelector("[data-testid=textarea]")!;
  uninstall = installInputModality();
});

afterEach(() => {
  uninstall();
  document.body.innerHTML = "";
});

const byId = (id: string) => document.querySelector(`[data-testid=${id}]`)!;

function key(target: Element, init: KeyboardEventInit) {
  target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, ...init }));
}

function pointer(
  type: "pointerdown" | "pointermove",
  target: Element,
  props: Record<string, unknown> = {},
) {
  // jsdom has no PointerEvent: a MouseEvent with the fields the tracker reads.
  const event = new MouseEvent(type, { bubbles: true, detail: 1 });
  for (const [name, value] of Object.entries({
    width: 8,
    height: 8,
    pressure: 0.5,
    pointerType: "mouse",
    ...props,
  })) {
    Object.defineProperty(event, name, { value });
  }
  target.dispatchEvent(event);
}

const pointerDown = (target: Element, props?: Record<string, unknown>) =>
  pointer("pointerdown", target, props);

function focusIn(target: Element) {
  target.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
}

test("install leaves the modality unknown, so rings show until there is evidence", () => {
  expect(modality()).toBeNull();
});

test("real mouse movement settles an unknown start as pointer", () => {
  pointer("pointermove", document.body);
  expect(modality()).toBe("pointer");
});

test("mouse movement never overrides the keyboard", () => {
  key(document.body, { key: "Tab" });
  pointer("pointermove", document.body);
  expect(modality()).toBe("keyboard");
});

test("a screen reader's synthesized pointer press is virtual, not pointer", () => {
  pointerDown(byId("button"), { width: 0, height: 0, pressure: 0 });
  expect(modality()).toBe("virtual");
  pointerDown(byId("button"), { width: 1, height: 1, pressure: 0, detail: 0 });
  expect(modality()).toBe("virtual");
  pointer("pointermove", document.body, { width: 0, height: 0 });
  expect(modality()).toBe("virtual");
});

test("focus that arrives with no key or press before it is virtual (a browse cursor)", () => {
  pointerDown(byId("button"));
  focusIn(byId("button"));
  expect(modality()).toBe("pointer");
  // Long after any input, focus moves on its own.
  const realNow = performance.now.bind(performance);
  performance.now = () => realNow() + 5000;
  try {
    focusIn(byId("text"));
    expect(modality()).toBe("virtual");
  } finally {
    performance.now = realNow;
  }
});

for (const name of ["Escape", "Enter", "ArrowLeft"]) {
  test(`${name} in a text field that sends focus out of it counts as keyboard`, () => {
    pointerDown(field);
    key(field, { key: name });
    focusIn(byId("button"));
    expect(modality()).toBe("keyboard");
  });
}

test("an editing key whose focus stays in the field leaves the modality alone", () => {
  pointerDown(field);
  key(field, { key: "Escape" });
  focusIn(field);
  expect(modality()).toBe("pointer");
});

test("Tab and Shift+Tab switch to keyboard, a pointer press switches back", () => {
  key(document.body, { key: "Tab" });
  expect(modality()).toBe("keyboard");
  pointerDown(byId("button"));
  expect(modality()).toBe("pointer");
  key(document.body, { key: "Tab", shiftKey: true });
  expect(modality()).toBe("keyboard");
});

test("Tab counts inside a text field too", () => {
  key(field, { key: "Tab" });
  expect(modality()).toBe("keyboard");
});

for (const name of [
  "ArrowDown",
  "ArrowLeft",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Escape",
  "F6",
]) {
  test(`${name} outside a text field switches to keyboard`, () => {
    key(byId("button"), { key: name });
    expect(modality()).toBe("keyboard");
  });
}

test("Enter and Space on a button or a checkbox switch to keyboard", () => {
  key(byId("button"), { key: "Enter" });
  expect(modality()).toBe("keyboard");
  pointerDown(document.body);
  key(byId("checkbox"), { key: " " });
  expect(modality()).toBe("keyboard");
});

for (const id of ["textarea", "text", "search", "editable", "inside"]) {
  test(`typing, Enter, Space, Esc and the caret keys in ${id} leave pointer modality`, () => {
    pointerDown(byId(id));
    for (const name of [
      "a",
      "Z",
      "1",
      "Enter",
      " ",
      "Escape",
      "ArrowLeft",
      "ArrowUp",
      "Home",
      "End",
    ]) {
      key(byId(id), { key: name });
    }
    key(byId(id), { key: "Backspace" });
    expect(modality()).toBe("pointer");
  });
}

test("modifier keys and Cmd or Ctrl shortcuts do not count", () => {
  pointerDown(byId("button"));
  for (const name of ["Shift", "Control", "Alt", "Meta", "CapsLock"])
    key(byId("button"), { key: name });
  key(byId("button"), { key: "ArrowDown", metaKey: true });
  key(byId("button"), { key: "Tab", ctrlKey: true });
  key(byId("button"), { key: "Enter", ctrlKey: true });
  expect(modality()).toBe("pointer");
});

/** Record every write of the attribute while `run` runs. */
function writesDuring(run: () => void): string[] {
  const root = document.documentElement;
  const writes: string[] = [];
  const set = root.setAttribute.bind(root);
  root.setAttribute = (name: string, value: string) => {
    if (name === "data-input-modality") writes.push(value);
    set(name, value);
  };
  try {
    run();
  } finally {
    delete (root as { setAttribute?: unknown }).setAttribute;
  }
  return writes;
}

test("writes the attribute only when the modality changes", () => {
  const writes = writesDuring(() => {
    key(document.body, { key: "Tab" });
    key(document.body, { key: "Tab" });
    key(document.body, { key: "ArrowDown" });
    pointerDown(document.body);
    pointerDown(document.body);
  });
  expect(writes).toEqual(["keyboard", "pointer"]);
});

test("installing twice adds no second set of listeners, and both must be undone", () => {
  const second = installInputModality();
  expect(writesDuring(() => key(document.body, { key: "Tab" }))).toEqual(["keyboard"]);

  second();
  second();
  // The first installation still holds the tracker.
  pointerDown(document.body);
  expect(modality()).toBe("pointer");
  key(document.body, { key: "Tab" });
  expect(modality()).toBe("keyboard");
});

test("uninstall removes the listeners and the attribute, so rings fall back to showing", () => {
  uninstall();
  expect(modality()).toBeNull();
  key(document.body, { key: "Tab" });
  pointerDown(document.body);
  expect(modality()).toBeNull();
});

test("install after uninstall starts unknown again", () => {
  key(document.body, { key: "Tab" });
  uninstall();
  uninstall = installInputModality();
  expect(modality()).toBeNull();
});
