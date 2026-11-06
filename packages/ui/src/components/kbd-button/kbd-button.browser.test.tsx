import "./kbd-button.test.css";
import { afterEach, beforeAll, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { useCallback, useState } from "react";
import { ListRow, ListRowBody, ListRowTitle } from "../list-row/list-row";
import { KbdShortcut } from "../kbd/kbd-shortcut";
import type { KbdKeyName } from "../kbd/kbd-keys";
import { KbdButton, KbdButtonCaret } from "./kbd-button";

// KbdButton in a one-line list row (24px caps beside a 22px title, so the
// caps and the field, not the text, would set its height), under real layout, with a mouse on a desktop: at
// rest its caps sit exactly where a read-only KbdShortcut's sit (the box
// reaches 4px past them and the margin takes it back), and the row keeps its
// height; its hit area reaches 44px; recording, it is the control height
// (34px) and still leaves the row's height and the caps' centre where they
// were. jsdom has no boxes.

const it = test.skipIf(typeof window === "undefined");

const SEARCH: KbdKeyName[] = ["mod", "shift", "k"];

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1024, 800);
  await document.fonts.load('13px "Space Mono"');
  await document.fonts.ready;
});

afterEach(cleanup);

function renderRows({ recording = false }: { recording?: boolean } = {}) {
  render(
    <div className="w-100">
      <ListRow variant="plain" interactive={false} data-testid="read-only-row">
        <ListRowBody>
          <ListRowTitle>Search</ListRowTitle>
        </ListRowBody>
        <KbdShortcut data-testid="read-only" keys={SEARCH} size="md" platform="mac" />
      </ListRow>
      <ListRow variant="plain" interactive={false} data-testid="editable-row">
        <ListRowBody>
          <ListRowTitle>Search</ListRowTitle>
        </ListRowBody>
        <KbdButton
          data-testid="button"
          recording={recording}
          aria-label="Change the shortcut for Search"
        >
          <KbdShortcut data-testid="editable" keys={SEARCH} size="md" platform="mac" />
          {recording ? <KbdButtonCaret /> : null}
        </KbdButton>
      </ListRow>
    </div>,
  );
}

const rect = (testId: string) => screen.getByTestId(testId).getBoundingClientRect();
const centreY = (box: DOMRect) => box.top + box.height / 2;

describe("KbdButton at rest", () => {
  it("puts the caps where a read-only KbdShortcut sits, and keeps the row's height", () => {
    renderRows();
    const readOnly = rect("read-only");
    const editable = rect("editable");
    expect(editable.right).toBe(readOnly.right);
    expect(editable.width).toBe(readOnly.width);
    expect(centreY(editable) - rect("editable-row").top).toBe(
      centreY(readOnly) - rect("read-only-row").top,
    );
    expect(rect("editable-row").height).toBe(rect("read-only-row").height);
  });

  it("is a 32px box, 4px past the caps on every side", () => {
    renderRows();
    const button = rect("button");
    const caps = rect("editable");
    expect(button.height).toBe(32);
    expect(caps.top - button.top).toBe(4);
    expect(button.bottom - caps.bottom).toBe(4);
    expect(caps.left - button.left).toBe(4);
    expect(button.right - caps.right).toBe(4);
  });

  it("reaches a 44px hit area", () => {
    renderRows();
    const button = screen.getByTestId("button");
    const box = button.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = centreY(box);
    for (const dy of [-21.5, 21.5]) {
      const hit = document.elementFromPoint(x, y + dy);
      expect(hit === button || button.contains(hit), `dy ${dy}`).toBe(true);
    }
  });
});

describe("KbdButton recording", () => {
  it("is the control height and leaves the row's height and the caps' centre", () => {
    renderRows();
    const restRow = rect("editable-row").height;
    const restCaps = centreY(rect("editable")) - rect("editable-row").top;
    cleanup();

    renderRows({ recording: true });
    const button = screen.getByTestId("button");
    expect(button.hasAttribute("data-recording")).toBe(true);
    expect(rect("button").height).toBe(34);
    expect(rect("editable-row").height).toBe(restRow);
    expect(centreY(rect("editable")) - rect("editable-row").top).toBe(restCaps);
    // The field's end stays on the row's trailing edge, where the read-only caps end.
    expect(rect("button").right).toBe(rect("read-only").right);
  });
});

// The ring shows only after keyboard input (states.md#focus): a field started
// with a click shows its border and caret, no ring; started with Enter, the ring.
function Recordable() {
  const [recording, setRecording] = useState(false);
  const start = useCallback(() => setRecording(true), []);
  return (
    <div className="p-8">
      <button type="button" data-testid="before">
        Before
      </button>
      <KbdButton
        data-testid="button"
        recording={recording}
        onClick={start}
        aria-label="Change the shortcut for Search"
      >
        <KbdShortcut keys={SEARCH} size="md" platform="mac" />
        {recording ? <KbdButtonCaret /> : null}
      </KbdButton>
    </div>
  );
}

describe("KbdButton focus ring while recording", () => {
  it("shows no ring when recording starts with a click", async () => {
    const { userEvent } = await import("vite-plus/test/browser/context");
    render(<Recordable />);
    const button = screen.getByTestId("button");
    await userEvent.click(button);
    expect(button.hasAttribute("data-recording")).toBe(true);
    expect(document.activeElement).toBe(button);
    expect(getComputedStyle(button).boxShadow).toBe("none");
  });

  it("shows the ring when recording starts from the keyboard", async () => {
    const { userEvent } = await import("vite-plus/test/browser/context");
    render(<Recordable />);
    // The click test leaves the pointer over this spot, where hover draws a hairline ring.
    await userEvent.unhover(document.body);
    screen.getByTestId("before").focus();
    await userEvent.keyboard("{Tab}");
    const button = screen.getByTestId("button");
    expect(document.activeElement).toBe(button);
    await userEvent.keyboard("{Enter}");
    expect(button.hasAttribute("data-recording")).toBe(true);
    // The focus ring: a 2px gap in the canvas, then 2px of ink, out to 4px.
    expect(getComputedStyle(button).boxShadow).toContain("0px 0px 0px 4px");
  });
});
