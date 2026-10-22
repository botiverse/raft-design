import "./components/list-row/list-row.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { Checkbox } from "./components/checkbox/checkbox";
import { RadioGroup, RadioGroupItem } from "./components/radio-group/radio-group";
import { Switch } from "./components/switch/switch";
import { Field, FieldDescription, FieldItem, FieldLabel } from "./components/field/field";
import {
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowChevron,
  ListRowIcon,
  ListRowTitle,
  ListRowValue,
} from "./components/list-row";
import { Avatar } from "./components/avatar/avatar";

// A switch, a checkbox or a radio centres on the FIRST line of its label's
// text, wherever raft-ui puts it beside one, without being squeezed
// (design/foundations/alignment.md#a-control-and-its-label):
// - in a <label> row, a checkbox's or a radio's box is one line of the label
//   tall, so it lands on the text's line however the row aligns and however
//   tall its min-height (the row decides where a line of text goes);
// - in a FieldItem, the same, and a row with a switch is at least the
//   switch's 30px, the label centred on it;
// - in a plain ListRow with a description, both ends sit on the title's first
//   line; with a title alone everything stays centred at the row's height.
// On a touch screen a box or circle on its own has a 44px hit area; in a
// <label> row it reaches only half the 8px gap past its line, so a tap
// between two options lands on the nearer one. Real layout only.

const it = test.skipIf(typeof window === "undefined");

const SHORT = "Notify me";
const LONG = "Notify me about every message in channels I follow, including replies in threads";
const GAP = 8;

const DEVICES = [
  { name: "desktop", width: 1280, touch: false },
  { name: "phone", width: 390, touch: true },
] as const;

async function context() {
  return import("vite-plus/test/browser/context");
}

async function device(width: number, touch: boolean) {
  const { cdp, page } = await context();
  await page.viewport(width, 900);
  // Turning touch emulation off leaves no fine pointer, so the desktop cases
  // run first and never turn it on.
  if (touch) {
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: touch ? "coarse" : "fine" }],
  });
  await expect.poll(() => matchMedia("(pointer: fine)").matches).toBe(!touch);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await context();
  await page.viewport(1280, 720);
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

/** The first line box of a text element, from the text itself. */
function firstLine(text: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(text);
  const rects = [...range.getClientRects()].filter((r) => r.width > 0);
  const top = Math.min(...rects.map((r) => r.top));
  const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
  // The line box, not the glyphs' content box: centre on `1lh`.
  const style = getComputedStyle(text);
  const boxTop =
    text.getBoundingClientRect().top +
    parseFloat(style.paddingTop) +
    parseFloat(style.borderTopWidth);
  return { middle: boxTop + lineHeight / 2, lines: new Set(rects.map((r) => r.top)).size, top };
}

function middle(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top + r.height / 2;
}

function expectOnFirstLine(control: Element, text: HTMLElement, wraps: boolean, gap = GAP) {
  const line = firstLine(text);
  if (wraps) expect(line.lines).toBeGreaterThanOrEqual(2);
  else expect(line.lines).toBe(1);
  expect(Math.abs(middle(control) - line.middle)).toBeLessThanOrEqual(0.5);
  if (gap)
    expect(text.getBoundingClientRect().left - control.getBoundingClientRect().right).toBe(gap);
}

const TEXTS = [
  { name: "one line", text: SHORT, wraps: false },
  { name: "two lines", text: LONG, wraps: true },
] as const;

const CONTROLS: { name: string; size: [number, number]; el: () => ReactElement }[] = [
  { name: "switch", size: [50, 30], el: () => <Switch data-testid="control" aria-label="On" /> },
  {
    name: "checkbox",
    size: [20, 20],
    el: () => <Checkbox data-testid="control" aria-label="On" />,
  },
  {
    name: "radio",
    size: [20, 20],
    el: () => <RadioGroupItem data-testid="control" value="a" aria-label="On" />,
  },
];
const BOXES = CONTROLS.filter((c) => c.name !== "switch");

function Radio({ children }: { children: ReactNode }) {
  return (
    <RadioGroup aria-label="Notify" defaultValue="b">
      {children}
    </RadioGroup>
  );
}

function wrap(name: string, node: ReactNode) {
  return name === "radio" ? <Radio>{node}</Radio> : node;
}

// The label rows the control has to live with: its own recommended row, and
// the rows products write (slock: `min-h-11 items-center`, `min-h-8`).
const LABEL_ROWS = [
  { name: "items-start", className: "flex items-start gap-2 text-subhead", texts: [SHORT, LONG] },
  {
    name: "min-h-8 items-center",
    className: "flex min-h-8 items-center gap-3 text-sm",
    texts: [SHORT],
  },
  {
    name: "min-h-11 items-center",
    className: "flex min-h-11 items-center gap-2 text-sm",
    texts: [SHORT],
  },
  {
    name: "min-h-11 items-start",
    className: "flex min-h-11 items-start gap-2 text-sm",
    texts: [SHORT, LONG],
  },
  { name: "items-center gap-3", className: "flex items-center gap-3 text-sm", texts: [SHORT] },
  // Small text: a 16px line is shorter than the 20px box, which keeps its size
  // (the row is 20px); a wrapping small label gives its line 20px.
  { name: "text-xs items-center", className: "flex items-center gap-2 text-xs", texts: [SHORT] },
  {
    name: "text-xs leading-5 items-start",
    className: "flex items-start gap-2 text-xs leading-5",
    texts: [SHORT, LONG],
  },
  {
    name: "text-sm items-start",
    className: "flex items-start gap-2 text-sm",
    texts: [SHORT, LONG],
  },
] as const;

for (const { name: deviceName, width: deviceWidth, touch } of DEVICES) {
  for (const control of BOXES) {
    for (const row of LABEL_ROWS) {
      for (const text of row.texts) {
        const lines = text === LONG ? "two lines" : "one line";
        it(`${deviceName}: a ${control.name} in a \`${row.name}\` <label> sits on its text's first line (${lines})`, async () => {
          await device(deviceWidth, touch);
          render(
            wrap(
              control.name,
              <label className={`w-[260px] ${row.className}`}>
                {control.el()}
                <span data-testid="text">{text}</span>
              </label>,
            ),
          );
          const el = screen.getByTestId("control");
          const r = el.getBoundingClientRect();
          expect([r.width, r.height]).toEqual(control.size);
          const span = screen.getByTestId("text");
          const gap = span.getBoundingClientRect().left - r.right;
          expectOnFirstLine(el, span, text === LONG, gap);
          expect(gap).toBe(row.className.includes("gap-3") ? 12 : GAP);
          // The row is never shorter than the control, nor than its text.
          const label = el.closest("label")!;
          expect(label.getBoundingClientRect().height).toBe(
            Math.max(
              span.getBoundingClientRect().height,
              control.size[1],
              parseFloat(getComputedStyle(label).minHeight) || 0,
            ),
          );
        });
      }
    }
  }

  const FIELD_ITEMS = [
    { name: "one line", text: SHORT, description: false, wraps: false },
    { name: "wrapped", text: LONG, description: false, wraps: true },
    { name: "with a description", text: SHORT, description: true, wraps: false },
  ] as const;
  for (const control of CONTROLS) {
    for (const { name, text, description, wraps } of FIELD_ITEMS) {
      it(`${deviceName}: a ${control.name} in a FieldItem sits on its label's first line, at main's height (${name})`, async () => {
        await device(deviceWidth, touch);
        render(
          wrap(
            control.name,
            <Field className="w-[260px]">
              <FieldItem data-testid="item">
                {control.el()}
                <div data-testid="column" className="grid gap-0.5">
                  <FieldLabel data-testid="text">{text}</FieldLabel>
                  {description ? <FieldDescription>Off: only mentions.</FieldDescription> : null}
                </div>
              </FieldItem>
            </Field>,
          ),
        );
        const el = screen.getByTestId("control");
        expect([el.getBoundingClientRect().width, el.getBoundingClientRect().height]).toEqual(
          control.size,
        );
        expectOnFirstLine(el, screen.getByTestId("text"), wraps);
        // The row is as tall as on main: its text column, or the control
        // pulled up by half the difference to the label's line, whichever is
        // taller. Nothing is added above or below.
        const item = screen.getByTestId("item");
        const lineHeight = parseFloat(getComputedStyle(item).lineHeight);
        const column = screen.getByTestId("column").getBoundingClientRect().height;
        expect(item.getBoundingClientRect().height).toBe(
          Math.max(column, (lineHeight + control.size[1]) / 2),
        );
      });
    }
  }

  for (const control of CONTROLS) {
    for (const { name, wraps } of TEXTS) {
      it(`${deviceName}: a ${control.name} at the end of a plain ListRow (${name})`, async () => {
        await device(deviceWidth, touch);
        render(
          wrap(
            control.name,
            <ListRowGroup className="w-80">
              <ListRow variant="plain" interactive={false} data-testid="row">
                <ListRowIcon data-testid="lead">
                  <svg viewBox="0 0 24 24" />
                </ListRowIcon>
                <ListRowBody>
                  <ListRowTitle data-testid="text">Agents can merge</ListRowTitle>
                  {wraps ? <ListRowDescription wrap>{LONG}</ListRowDescription> : null}
                </ListRowBody>
                {control.el()}
              </ListRow>
            </ListRowGroup>,
          ),
        );
        const title = screen.getByTestId("text");
        const el = screen.getByTestId("control");
        const lead = screen.getByTestId("lead");
        const row = screen.getByTestId("row");
        // Never squeezed.
        expect([el.getBoundingClientRect().width, el.getBoundingClientRect().height]).toEqual(
          control.size,
        );
        // Both ends on the title's line: with a title alone that is the row's
        // centre, with a description the title's first line.
        for (const end of [el, lead]) {
          expect(Math.abs(middle(end) - firstLine(title).middle)).toBeLessThanOrEqual(0.5);
        }
        if (wraps) {
          expect(middle(title.parentElement!) - middle(el)).toBeGreaterThan(8);
        } else {
          // A title alone: the row is its padding and its tallest part, as
          // before (54px with a switch on a phone).
          const lineHeight = parseFloat(getComputedStyle(title).lineHeight);
          expect(row.getBoundingClientRect().height).toBe(
            24 + Math.max(lineHeight, control.size[1]),
          );
          expect(Math.abs(middle(el) - middle(row))).toBeLessThanOrEqual(0.5);
        }
      });
    }
  }

  for (const description of [false, true]) {
    it(`${deviceName}: a plain ListRow's value and chevron ${description ? "sit on the title's line" : "stay centred with a title alone"}`, async () => {
      await device(deviceWidth, touch);
      render(
        <ListRowGroup className="w-80">
          <ListRow variant="plain">
            <ListRowBody>
              <ListRowTitle data-testid="text">Appearance</ListRowTitle>
              {description ? <ListRowDescription wrap>{LONG}</ListRowDescription> : null}
            </ListRowBody>
            <ListRowValue data-testid="value">System</ListRowValue>
            <ListRowChevron data-testid="chevron" />
          </ListRow>
        </ListRowGroup>,
      );
      const line = firstLine(screen.getByTestId("text")).middle;
      for (const id of ["value", "chevron"]) {
        expect(Math.abs(middle(screen.getByTestId(id)) - line), id).toBeLessThanOrEqual(0.5);
      }
    });

    it(`${deviceName}: a plain ListRow's 35px avatar ${description ? "sits on the title's line" : "stays centred with a title alone"}`, async () => {
      await device(deviceWidth, touch);
      render(
        <ListRowGroup className="w-80">
          <ListRow variant="plain" interactive={false}>
            <Avatar data-testid="lead" size="md" type="human" />
            <ListRowBody>
              <ListRowTitle data-testid="text">Ada Lovelace</ListRowTitle>
              {description ? <ListRowDescription wrap>{LONG}</ListRowDescription> : null}
            </ListRowBody>
            <Switch data-testid="control" aria-label="On" />
          </ListRow>
        </ListRowGroup>,
      );
      const title = screen.getByTestId("text");
      const lead = screen.getByTestId("lead");
      for (const el of [lead, screen.getByTestId("control")]) {
        expect(Math.abs(middle(el) - firstLine(title).middle)).toBeLessThanOrEqual(0.5);
      }
      if (!description) {
        const row = lead.closest<HTMLElement>("[data-slot=list-row]")!;
        expect(Math.abs(middle(lead) - middle(row))).toBeLessThanOrEqual(0.5);
      }
    });
  }

  it(`${deviceName}: switches in stacked settings rows keep the row's padding between them`, async () => {
    await device(deviceWidth, touch);
    render(
      <ListRowGroup className="w-80">
        {["Mentions", "Thread replies", "Direct messages"].map((title, index) => (
          <ListRow key={title} variant="plain" interactive={false}>
            <ListRowBody>
              <ListRowTitle>{title}</ListRowTitle>
              {index === 1 ? <ListRowDescription wrap>{LONG}</ListRowDescription> : null}
            </ListRowBody>
            <Switch data-testid="stacked" aria-label={title} />
          </ListRow>
        ))}
      </ListRowGroup>,
    );
    const rects = screen.getAllByTestId("stacked").map((el) => el.getBoundingClientRect());
    for (let i = 1; i < rects.length; i += 1) {
      expect(rects[i]!.top - rects[i - 1]!.bottom).toBeGreaterThanOrEqual(12);
    }
  });

  for (const control of BOXES) {
    // A box or a circle on its own: 44 tall on a touch screen. With a mouse
    // the hit area is as it was (checkbox 44 x 36, radio 41 x 33: its ::after
    // starts inside its 1.5px border).
    const wide = control.name === "radio" ? 41 : 44;
    const tall = touch ? 44 : control.name === "radio" ? 33 : 36;
    it(`${deviceName}: a ${control.name} on its own has a hit area ${wide} wide and ${tall} tall`, async () => {
      await device(deviceWidth, touch);
      render(<div className="p-10">{wrap(control.name, control.el())}</div>);
      const el = screen.getByTestId("control");
      const r = el.getBoundingClientRect();
      const [x, y] = [r.left + r.width / 2, r.top + r.height / 2];
      const hits = (dx: number, dy: number) => {
        const target = document.elementFromPoint(x + dx, y + dy);
        return target === el || el.contains(target);
      };
      // Scan across the centre in half pixels; hit-testing snaps to pixels,
      // so the extent can read 1px over.
      const extent = (axis: "x" | "y") => {
        const hit: number[] = [];
        for (let d = -30; d <= 30; d += 0.5)
          if (axis === "y" ? hits(0, d) : hits(d, 0)) hit.push(d);
        return hit[hit.length - 1]! - hit[0]!;
      };
      for (const [value, want, label] of [
        [extent("x"), wide, "width"],
        [extent("y"), tall, "height"],
      ] as const) {
        expect(value, label).toBeGreaterThanOrEqual(want);
        expect(value, label).toBeLessThanOrEqual(want + 1);
      }
    });

    it(`${deviceName}: a tap between two ${control.name} rows lands on the nearer one`, async () => {
      await device(deviceWidth, touch);
      const row = (key: string) => (
        <label key={key} className="flex items-start gap-2 text-sm" data-testid={`row-${key}`}>
          {control.name === "radio" ? (
            <RadioGroupItem value={key} data-testid={`control-${key}`} />
          ) : (
            <Checkbox data-testid={`control-${key}`} />
          )}
          <span>Option {key}</span>
        </label>
      );
      render(
        <div className="w-[260px] p-10">
          {control.name === "radio" ? (
            <RadioGroup aria-label="Options">{[row("a"), row("b")]}</RadioGroup>
          ) : (
            <div className="grid gap-2">{[row("a"), row("b")]}</div>
          )}
        </div>,
      );
      const a = screen.getByTestId("control-a").getBoundingClientRect();
      const b = screen.getByTestId("control-b").getBoundingClientRect();
      const gap = b.top - a.bottom;
      const x = a.left + a.width / 2;
      const owner = (y: number) =>
        document.elementFromPoint(x, y)?.closest("label")?.dataset.testid;
      // Just below the first box, and just above the second.
      expect(owner(a.bottom + 1), "1px below a").toBe("row-a");
      // Within a pixel of the middle either may win: a 1.5px border renders
      // as 1px at a device pixel ratio of 1, and hit-testing snaps to pixels.
      expect(owner(a.bottom + gap / 2 - 2), "nearer a").toBe("row-a");
      expect(owner(b.top - gap / 2 + 2), "nearer b").toBe("row-b");
      expect(owner(b.top - 1), "1px above b").toBe("row-b");
    });
  }
}
