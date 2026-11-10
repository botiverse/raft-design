import "./fit-toolbar.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Bot, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import {
  FitToolbar,
  FitToolbarButton,
  FitToolbarGroup,
  FitToolbarSplitButton,
} from "./fit-toolbar";

// FitToolbarSplitButton: a split button (Button › Split buttons) as one
// toolbar item. The pair takes its steps as a whole: the main part becomes +
// (or its icon) with its label kept as its name and tooltip, the ▾ stays.
// Both parts are toolbar buttons: one Tab stop for the toolbar, the arrow
// keys reaching the main part and then the ▾, which opens its menu. Real
// layout only.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const el = (id: string) => screen.getByTestId(id);
const box = (id: string) => el(id).getBoundingClientRect();
const focused = () => (document.activeElement as HTMLElement | null)?.dataset.testid;

async function wide() {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
}

function Bar({ icon = true, labelOrder }: { icon?: boolean; labelOrder?: number }) {
  return (
    <FitToolbar aria-label="Members" wrap className="gap-2" data-testid="bar">
      <FitToolbarGroup firstLine className="gap-2">
        <FitToolbarButton icon={<ArrowUpDown />} labelOrder={10} data-testid="sort">
          Sort
        </FitToolbarButton>
      </FitToolbarGroup>
      <DropdownMenu>
        <FitToolbarSplitButton
          variant="primary"
          icon={icon ? <Bot /> : undefined}
          groupLabel="New agent"
          menuLabel="More ways to create an agent"
          menuTrigger={<DropdownMenuTrigger data-testid="more-ways" />}
          labelOrder={labelOrder}
          plusOrder={40}
          data-testid="create"
        >
          Create agent
        </FitToolbarSplitButton>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid="external">Connect an external agent</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </FitToolbar>
  );
}

function inRegion(width: number, ui: ReactNode) {
  return render(
    <ThemeProvider mode="light">
      <button type="button" data-testid="before">
        Before
      </button>
      <div style={{ width }} data-testid="region">
        {ui}
      </div>
      <button type="button" data-testid="after">
        After
      </button>
    </ThemeProvider>,
  );
}

const split = () => el("create").closest<HTMLElement>("[data-slot=button-split]")!;

it("is one item, the pair named as a group, each part by its own name", async () => {
  await wide();
  inRegion(600, <Bar />);
  await frame();
  expect(screen.getByRole("group", { name: "New agent" })).toBe(split());
  expect(screen.getByRole("button", { name: "Create agent" })).toBe(el("create"));
  expect(screen.getByRole("button", { name: "More ways to create an agent" })).toBe(
    el("more-ways"),
  );
  // One fit item, the split as a whole; it has no `more` step.
  expect(split().hasAttribute("data-fit-id")).toBe(true);
  expect(split().getAttribute("data-fit-steps")).toBe("plus:40");
  expect(el("create").hasAttribute("data-fit-id")).toBe(false);
  // The parts touch, the ▾ after the main part, and nothing is taken.
  expect(box("more-ways").left).toBeCloseTo(box("create").right, 0);
  expect(split().hasAttribute("data-fit-plus")).toBe(false);
  const text = el("create").querySelector("[data-slot=fit-toolbar-button-label]")!;
  expect(text.getBoundingClientRect().width).toBeGreaterThan(20);
});

it("takes its plus step as a whole: the main part becomes +, its label its name and tooltip, the ▾ stays", async () => {
  await wide();
  inRegion(600, <Bar />);
  await frame();
  const full = box("create").right - box("sort").left;
  cleanup();

  inRegion(full - 40, <Bar />);
  await frame();
  await frame();
  // The sort's label gives way first (10), then the split becomes + (40).
  expect(el("sort").hasAttribute("data-fit-label")).toBe(true);
  expect(split().hasAttribute("data-fit-plus")).toBe(true);
  expect(el("create").hasAttribute("data-fit-plus")).toBe(false);
  expect(box("create").width).toBeLessThanOrEqual(44);
  expect(box("more-ways").right).toBeLessThanOrEqual(box("region").right + 0.5);
  expect(box("more-ways").left).toBeCloseTo(box("create").right, 0);
  const plus = el("create").querySelector("[data-slot=fit-toolbar-button-plus]")!;
  expect(plus.getClientRects().length).toBe(1);
  const icon = el("create").querySelector("[data-slot=fit-toolbar-button-icon] svg")!;
  expect(icon.getClientRects().length).toBe(0);
  expect(screen.getByRole("button", { name: "Create agent" })).toBe(el("create"));
  expect(el("more-ways").getClientRects().length).toBe(1);
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.hover(el("create"));
  await waitFor(
    () =>
      expect(document.querySelector("[data-slot=tooltip-content]")?.textContent).toBe(
        "Create agent",
      ),
    { timeout: 3000 },
  );
  await userEvent.unhover(el("create"));
});

it("takes a label step only with an icon", async () => {
  await wide();
  inRegion(600, <Bar labelOrder={20} />);
  await frame();
  expect(split().getAttribute("data-fit-steps")).toBe("label:20 plus:40");
  cleanup();
  inRegion(600, <Bar icon={false} labelOrder={20} />);
  await frame();
  expect(split().getAttribute("data-fit-steps")).toBe("plus:40");
});

it("the toolbar keeps one Tab stop; the arrow keys reach the main part, then the ▾, which opens its menu", async () => {
  await wide();
  inRegion(600, <Bar />);
  await frame();
  const { userEvent } = await import("vite-plus/test/browser/context");
  const stops = () =>
    Array.from(el("bar").querySelectorAll<HTMLElement>("button")).filter(
      (node) => node.tabIndex >= 0,
    );
  expect(stops()).toHaveLength(1);
  el("before").focus();
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("sort");
  await userEvent.keyboard("{ArrowRight}");
  expect(focused()).toBe("create");
  await userEvent.keyboard("{ArrowRight}");
  expect(focused()).toBe("more-ways");
  await userEvent.keyboard("{ArrowRight}");
  expect(focused()).toBe("sort");
  await userEvent.keyboard("{ArrowLeft}");
  expect(focused()).toBe("more-ways");
  expect(stops().map((node) => node.dataset.testid)).toEqual(["more-ways"]);
  await userEvent.keyboard("{Enter}");
  await waitFor(() => expect(screen.getByTestId("external")).toBeTruthy());
  expect(el("more-ways").getAttribute("aria-expanded")).toBe("true");
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(focused()).toBe("more-ways"));
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("after");
});
