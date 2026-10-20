/**
 * @vitest-environment jsdom
 */
/**
 * The input-modality tracker behind keyboard-only focus rings
 * (design/foundations/states.md#focus): a navigation key says "keyboard",
 * a pointer press says "pointer", and typing never changes it.
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

function pointerDown(target: Element) {
  // jsdom has no PointerEvent; the tracker reads only the event type.
  target.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
}

test("install starts in pointer modality", () => {
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

test("install after uninstall starts again in pointer modality", () => {
  key(document.body, { key: "Tab" });
  uninstall();
  uninstall = installInputModality();
  expect(modality()).toBe("pointer");
});
