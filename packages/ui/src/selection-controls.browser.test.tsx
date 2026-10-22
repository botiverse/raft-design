import "./components/list-row/list-row.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { Checkbox } from "./components/checkbox/checkbox";
import { RadioGroup, RadioGroupItem } from "./components/radio-group/radio-group";
import { Switch } from "./components/switch/switch";
import { Field, FieldItem, FieldLabel } from "./components/field/field";
import {
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowIcon,
  ListRowTitle,
} from "./components/list-row";
import { Avatar } from "./components/avatar/avatar";

// A switch, a checkbox or a radio centres on the FIRST line of its label,
// 8px before it, wherever raft-ui puts it beside one: FieldItem, a <label>
// row, the end of a plain ListRow (design/foundations/alignment.md#a-control-
// and-its-label). The switch keeps 50 x 30, the box and the circle 20, and the
// box's and the circle's hit area is 44 tall on a touch screen (36 with a
// mouse). Real layout only: jsdom has no boxes.

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

function Radio({ children }: { children: ReactNode }) {
  return (
    <RadioGroup aria-label="Notify" defaultValue="b">
      {children}
    </RadioGroup>
  );
}

const TEXTS = [
  { name: "one line", text: SHORT, wraps: false },
  { name: "two lines", text: LONG, wraps: true },
] as const;

for (const { name: deviceName, width: deviceWidth, touch } of DEVICES) {
  for (const control of CONTROLS) {
    for (const { name, text, wraps } of TEXTS) {
      it(`${deviceName}: a ${control.name} in a <label> row sits on its first line (${name})`, async () => {
        await device(deviceWidth, touch);
        // `items-center` on purpose: the control places itself, whatever the
        // row asks, and the row doesn't grow for a switch taller than a line.
        const row = (
          <label className="flex w-[260px] items-center gap-2 text-subhead">
            {control.el()}
            <span data-testid="text">{text}</span>
          </label>
        );
        render(control.name === "radio" ? <Radio>{row}</Radio> : row);
        const el = screen.getByTestId("control");
        const r = el.getBoundingClientRect();
        expect([r.width, r.height]).toEqual(control.size);
        expectOnFirstLine(el, screen.getByTestId("text"), wraps);
        if (!wraps) {
          const label = el.closest("label")!;
          expect(label.getBoundingClientRect().height).toBe(
            parseFloat(getComputedStyle(label).lineHeight),
          );
        }
      });

      it(`${deviceName}: a ${control.name} in a FieldItem sits on its label's first line (${name})`, async () => {
        await device(deviceWidth, touch);
        const field = (
          <Field className="w-[260px]">
            <FieldItem>
              {control.el()}
              <FieldLabel data-testid="text">{text}</FieldLabel>
            </FieldItem>
          </Field>
        );
        render(control.name === "radio" ? <Radio>{field}</Radio> : field);
        expectOnFirstLine(screen.getByTestId("control"), screen.getByTestId("text"), wraps);
      });

      it(`${deviceName}: a ${control.name} at the end of a plain ListRow sits on the title's line (${name})`, async () => {
        await device(deviceWidth, touch);
        const list = (
          <ListRowGroup className="w-80">
            <ListRow variant="plain" interactive={false}>
              <ListRowIcon data-testid="lead">
                <svg viewBox="0 0 24 24" />
              </ListRowIcon>
              <ListRowBody>
                <ListRowTitle data-testid="text">Agents can merge</ListRowTitle>
                {wraps ? <ListRowDescription wrap>{LONG}</ListRowDescription> : null}
              </ListRowBody>
              {control.el()}
            </ListRow>
          </ListRowGroup>
        );
        render(control.name === "radio" ? <Radio>{list}</Radio> : list);
        const title = screen.getByTestId("text");
        const el = screen.getByTestId("control");
        expect(Math.abs(middle(el) - firstLine(title).middle)).toBeLessThanOrEqual(0.5);
        // Both ends: the leading icon sits on the same line as the control.
        const lead = screen.getByTestId("lead");
        expect(Math.abs(middle(lead) - firstLine(title).middle)).toBeLessThanOrEqual(0.5);
        if (wraps) {
          // With a description, the block's centre is well below the title.
          const body = title.parentElement!;
          expect(middle(body) - middle(el)).toBeGreaterThan(8);
        } else {
          // One line: the row is its padding and the title's line (48px on
          // a phone), the switch overhanging the line instead of growing it.
          const row = el.closest<HTMLElement>("[data-slot=list-row]")!;
          expect(row.getBoundingClientRect().height).toBe(
            24 + parseFloat(getComputedStyle(title).lineHeight),
          );
        }
      });
    }
  }

  for (const description of [false, true]) {
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
      // With a title alone the title is the block: avatar, title and switch
      // share the row's centre. With a description all three leave the
      // block's centre for the title's line.
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
    // The 30px switch overhangs a 22-24px line by 3-4px, into the row's 12px
    // padding: the next switch is still at least 12px away.
    for (let i = 1; i < rects.length; i += 1) {
      expect(rects[i]!.top - rects[i - 1]!.bottom).toBeGreaterThanOrEqual(12);
    }
  });

  for (const control of CONTROLS.filter((c) => c.name !== "switch")) {
    it(`${deviceName}: a ${control.name}'s hit area is 44 wide and ${touch ? 44 : 36} tall`, async () => {
      await device(deviceWidth, touch);
      render(
        <div className="p-10">
          {control.name === "radio" ? <Radio>{control.el()}</Radio> : control.el()}
        </div>,
      );
      const el = screen.getByTestId("control");
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const hits = (dx: number, dy: number) => {
        const target = document.elementFromPoint(x + dx, y + dy);
        return target === el || el.contains(target);
      };
      // Scan across the control's centre in half pixels: the hit area runs
      // from the first point that lands on the control to the last.
      const extent = (axis: "x" | "y") => {
        const hit: number[] = [];
        for (let d = -30; d <= 30; d += 0.5)
          if (axis === "y" ? hits(0, d) : hits(d, 0)) hit.push(d);
        return hit[hit.length - 1]! - hit[0]!;
      };
      // Hit-testing snaps to pixels, so the extent can read 1px over.
      const [w, h] = [extent("x"), extent("y")];
      const tall = touch ? 44 : 36;
      expect(w, "width").toBeGreaterThanOrEqual(44);
      expect(w, "width").toBeLessThanOrEqual(45);
      expect(h, "height").toBeGreaterThanOrEqual(tall);
      expect(h, "height").toBeLessThanOrEqual(tall + 1);
    });
  }
}
