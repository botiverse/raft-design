import "./row-hover.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "./theme/theme-provider";
import { Badge } from "../components/badge/badge";
import { ListRow } from "../components/list-row/list-row";
import { InboxItem, InboxItemContent, InboxItemTitle } from "../components/inbox-item";
import { MessageReferenceText } from "../components/message-item/message-reference";
import { SidebarItem, SidebarItemTitle } from "../components/sidebar/sidebar-item";
import {
  SystemMessageGroup,
  SystemMessageGroupDisclosure,
} from "../components/system-message/system-message";
import { Table, TableBody, TableCell, TableRow } from "../components/table";
import { firstOklch, parseOklch } from "./row-hover.test-colors";

// Press in the two-tier model (design/foundations/states.md#hover-and-press):
// anything clickable presses with the medium tier. A real press also hovers,
// and a chip hovers with the same tier it presses with, so on screen a press
// can't be told from a hover; and Chrome sets :active on a touch only after
// the tap. So this reads the stylesheet the page really loaded: the :active
// rules that match each rendered element, and the colour they paint there.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const ALPHA = {
  medium: { light: 0.078, dark: 0.065 },
  // A list cell (lib/list-cell.ts) presses its inset shape with
  // fill-cell-press: the medium tier in light, a stronger step in dark.
  cell: { light: 0.078, dark: 0.12 },
  sticker: { light: 0.1, dark: 0.1 },
} as const;
type Tier = keyof typeof ALPHA;

const ACTIVE = /(?<!\\):active(?![\w-])/;
const ACTIVE_ALL = /(?<!\\):active(?![\w-])/g;

/** The colours the :active rules matching `el` paint, resolved in `el`'s
 *  scope: background-image (an overlay) or background-color, on the element
 *  or, for a list cell, on its ::before shape. */
function pressLayers(el: Element, read: "color" | "image", shape = false): string[] {
  const property = read === "image" ? "background-image" : "background-color";
  const declared: string[] = [];
  const walk = (rules: CSSRuleList, parent: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        if (matchMedia(rule.conditionText).matches) walk(rule.cssRules, parent);
      } else if (rule instanceof CSSStyleRule) {
        const selector = parent ? rule.selectorText.replace(/&/g, parent) : rule.selectorText;
        const value = rule.style.getPropertyValue(property);
        if (value) {
          for (const part of selector.split(/,(?![^(]*\))/)) {
            if (!ACTIVE.test(part)) continue;
            const target = part.replace(ACTIVE_ALL, "").trim();
            if (shape !== target.endsWith("::before")) continue;
            try {
              if (el.matches(target.replace(/::before$/, ""))) declared.push(value);
            } catch {
              // A selector that can't be matched on its own (a ::pseudo-element).
            }
          }
        }
        walk(rule.cssRules, selector);
      } else if ("cssRules" in rule) {
        walk((rule as CSSGroupingRule).cssRules, parent);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, "");
  return declared.map((value) => {
    const probe = document.createElement("div");
    probe.style.setProperty(property, value);
    el.parentElement!.append(probe);
    const style = getComputedStyle(probe);
    const painted = read === "image" ? firstOklch(style.backgroundImage) : style.backgroundColor;
    probe.remove();
    return painted;
  });
}

const presses: { id: string; tier: Tier; read: "color" | "image"; shape?: boolean }[] = [
  { id: "badge-solid", tier: "sticker", read: "image" },
  { id: "badge-soft", tier: "medium", read: "image" },
  { id: "badge-outline", tier: "medium", read: "color" },
  { id: "mention", tier: "sticker", read: "image" },
  { id: "inbox", tier: "cell", read: "color", shape: true },
  { id: "list-row", tier: "cell", read: "color", shape: true },
  { id: "table-row", tier: "medium", read: "color" },
  { id: "disclosure", tier: "medium", read: "color" },
  { id: "sidebar-active", tier: "sticker", read: "image", shape: true },
];

for (const mode of ["light", "dark"] as const) {
  // Chips and badges, a mention, an activity row, a table row, the
  // system-message disclosure, and the selected sidebar item (its sticker
  // takes sticker-medium).
  it(`${mode}: clickable rows, chips and the selected sidebar item press medium`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={`${mode} flex flex-col items-start gap-3 bg-layer-canvas p-3`}>
          <Badge data-testid="badge-solid" variant="warning" render={<button type="button" />}>
            Owner
          </Badge>
          <Badge data-testid="badge-soft" appearance="soft" render={<button type="button" />}>
            Member
          </Badge>
          <Badge data-testid="badge-outline" appearance="outline" render={<button type="button" />}>
            v0.19
          </Badge>
          <MessageReferenceText data-testid="mention" variant="primary">
            @you
          </MessageReferenceText>
          <div className="w-80">
            <InboxItem data-testid="inbox">
              <InboxItemContent>
                <InboxItemTitle>Kirby mentioned you</InboxItemTitle>
              </InboxItemContent>
            </InboxItem>
            <ListRow data-testid="list-row">Wug</ListRow>
          </div>
          <Table>
            <TableBody>
              <TableRow data-testid="table-row">
                <TableCell>raft-design</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <SystemMessageGroup>
            <SystemMessageGroupDisclosure data-testid="disclosure">
              3 updates
            </SystemMessageGroupDisclosure>
          </SystemMessageGroup>
          <div className="w-60 bg-layer-sidebar p-2">
            <SidebarItem data-testid="sidebar-active" data-active="">
              <SidebarItemTitle>launch-week</SidebarItemTitle>
            </SidebarItem>
          </div>
        </div>
      </ThemeProvider>,
    );
    // Tailwind injects rules as classes are seen: let the sheet settle.
    await new Promise((r) => setTimeout(r, 300));
    for (const c of presses) {
      const alphas = pressLayers(getByTestId(c.id), c.read, c.shape)
        .filter((v) => v.startsWith("oklch"))
        .map((v) => parseOklch(v)[3]);
      expect
        .soft(
          alphas.some((a) => Math.abs(a - ALPHA[c.tier][mode]) < 0.0005),
          `${mode} ${c.id} presses with the ${c.tier} tier (its :active layers: ${alphas.join(", ") || "none"})`,
        )
        .toBe(true);
    }
  });
}
