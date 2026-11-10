/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  ListRow,
  ListRowBody,
  ListRowBottom,
  ListRowChevron,
  ListRowDescription,
  ListRowGroup,
  ListRowIcon,
  ListRowMeta,
  ListRowSubtitle,
  ListRowTitle,
  ListRowTop,
  ListRowValue,
} from "./list-row";

afterEach(cleanup);

const classes = (element: Element) => element.className.split(/\s+/);

describe("ListRow", () => {
  test("is a button that lays the row-hover overlay on hover and the pressed one on press", () => {
    render(<ListRow>launch-week</ListRow>);
    const row = screen.getByRole("button", { name: "launch-week" });
    expect(row.getAttribute("type")).toBe("button");
    expect(row.getAttribute("data-slot")).toBe("list-row");
    expect(row.getAttribute("data-variant")).toBe("default");
    const rowClasses = classes(row);
    expect(rowClasses).toContain("min-h-16");
    expect(rowClasses).toContain(
      "not-disabled:not-aria-disabled:not-data-selected:hover:overlay-subtle",
    );
    expect(rowClasses).toContain(
      "not-disabled:not-aria-disabled:not-data-selected:active:overlay-medium",
    );
    // A flush row keeps its focus ring inside, so an inset card cannot clip it;
    // it is not the token, so it carries the keyboard-only gate.
    expect(rowClasses).toContain("focus-visible:keyboard:inset-ring-2");
  });

  test("a row that goes somewhere renders the link, without a button type", () => {
    render(
      <ListRow render={<a href="/c/launch-week" />}>
        <ListRowBody>
          <ListRowTitle>launch-week</ListRowTitle>
        </ListRowBody>
      </ListRow>,
    );
    const row = screen.getByRole("link", { name: "launch-week" });
    expect(row.getAttribute("href")).toBe("/c/launch-week");
    expect(row.hasAttribute("type")).toBe(false);
  });

  test("a hairline from the text start separates two rows; a setting's starts at the edge", () => {
    const { rerender } = render(<ListRow data-testid="row" />);
    let rowClasses = classes(screen.getByTestId("row"));
    expect(rowClasses).toContain("[--list-row-rule-start:63px]");
    expect(rowClasses).toContain("before:left-(--list-row-rule-start)");
    expect(rowClasses).toContain("[[data-slot=list-row]+&]:before:block");
    expect(rowClasses).toContain("[li+li>&]:before:block");

    rerender(<ListRow data-testid="row" variant="plain" />);
    rowClasses = classes(screen.getByTestId("row"));
    // 12 + 24 + 12: one line of text makes 48, so no minimum is set.
    expect(rowClasses.some((name) => name.startsWith("min-h-"))).toBe(false);
    expect(rowClasses).toContain("[--list-row-rule-start:16px]");
    expect(rowClasses).toContain("[[data-slot=list-row]+&]:before:block");
  });

  test("an attached row draws no hairline above it and, in a settings group, no top padding", () => {
    const { rerender } = render(<ListRow data-testid="row" variant="plain" />);
    let row = screen.getByTestId("row");
    expect(row.hasAttribute("data-attached")).toBe(false);
    expect(classes(row)).not.toContain("pt-0");
    const plainClasses = row.className;

    rerender(<ListRow data-testid="row" variant="plain" attached />);
    row = screen.getByTestId("row");
    expect(row.getAttribute("data-attached")).toBe("");
    const rowClasses = classes(row);
    expect(rowClasses).not.toContain("[[data-slot=list-row]+&]:before:block");
    expect(rowClasses).not.toContain("[li+li>&]:before:block");
    expect(rowClasses).toContain("pt-0");
    // A target keeps the control height as its least (44px by touch); a
    // display-only row isn't one.
    expect(rowClasses).toContain("min-h-control");
    rerender(<ListRow data-testid="row" variant="plain" attached interactive={false} />);
    expect(classes(screen.getByTestId("row"))).not.toContain("min-h-control");

    // `attached={false}` is the default: the same classes as no prop at all.
    rerender(<ListRow data-testid="row" variant="plain" attached={false} />);
    expect(screen.getByTestId("row").className).toBe(plainClasses);
  });

  test("an attached default row loses only its hairline: its padding and height stay", () => {
    const { rerender } = render(<ListRow data-testid="row" />);
    const before = classes(screen.getByTestId("row"));
    rerender(<ListRow data-testid="row" attached />);
    const after = classes(screen.getByTestId("row"));
    expect(after).not.toContain("[[data-slot=list-row]+&]:before:block");
    expect(after).not.toContain("pt-0");
    expect(after).not.toContain("min-h-control");
    // Only the hairline's classes go, and nothing comes in their place.
    const removed = before.filter((c) => !after.includes(c));
    expect(removed.length).toBeGreaterThan(0);
    expect(removed.every((c) => c.includes("before:"))).toBe(true);
    expect(after.filter((c) => !before.includes(c))).toEqual([]);
  });

  test("entry rows are a set of buttons: no lines between them", () => {
    render(
      <ListRow variant="entry" data-testid="row">
        <ListRowIcon data-testid="icon">
          <svg />
        </ListRowIcon>
        <ListRowBody>
          <ListRowTitle>Search</ListRowTitle>
        </ListRowBody>
      </ListRow>,
    );
    const row = screen.getByTestId("row");
    expect(row.getAttribute("data-variant")).toBe("entry");
    expect(row.className).not.toContain("min-h-");
    expect(row.className).not.toContain("before:border-t");
    const icon = screen.getByTestId("icon");
    expect(icon.getAttribute("aria-hidden")).toBe("true");
    expect(classes(icon)).toContain("[&>svg]:size-5");
    expect(classes(icon)).toContain("text-(--list-row-risk-ink,var(--list-row-ink-3))");
  });

  test("a selected row takes the cyan wash and its hover is gated off", () => {
    render(
      <ListRow selected aria-current="true">
        release-review
      </ListRow>,
    );
    const row = screen.getByRole("button", { name: "release-review" });
    expect(row.hasAttribute("data-selected")).toBe(true);
    expect(row.getAttribute("aria-current")).toBe("true");
    expect(classes(row)).toContain("data-selected:bg-info-soft");
    expect(
      classes(row).filter(
        (name) => name.includes("overlay-medium") && !name.includes("not-data-selected"),
      ),
    ).toEqual([]);
  });

  test("a display-only row is a div with no hover, press or button type", () => {
    render(
      <ListRow variant="plain" interactive={false} data-testid="row">
        <ListRowBody>
          <ListRowTitle>Agents can merge to main</ListRowTitle>
        </ListRowBody>
      </ListRow>,
    );
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("DIV");
    expect(row.hasAttribute("type")).toBe(false);
    expect(row.className).not.toContain("overlay-medium");
  });

  test("the row owns its inks: the tone sets them, and never on a disabled row", () => {
    const { rerender } = render(
      <ListRow data-testid="row" tone="unread">
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle data-testid="title">launch-week</ListRowTitle>
            <ListRowMeta data-testid="time">10:42</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription data-testid="description">Wug: drafted.</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>,
    );
    const row = screen.getByTestId("row");
    expect(row.getAttribute("data-tone")).toBe("unread");
    expect(classes(row)).toEqual(
      expect.arrayContaining([
        "text-(--list-row-ink)",
        "not-disabled:not-aria-disabled:data-[tone=unread]:[--list-row-ink-2:var(--foreground)]",
        "not-disabled:not-aria-disabled:data-[tone=muted]:[--list-row-ink:var(--foreground-muted)]",
        "not-disabled:not-aria-disabled:data-[tone=away]:[--list-row-ink:var(--foreground-hint)]",
        "disabled:[--list-row-ink:var(--foreground-disabled)]",
        "aria-disabled:[--list-row-ink-3:var(--foreground-disabled)]",
      ]),
    );
    expect(classes(screen.getByTestId("title"))).toContain(
      "group-data-[tone=unread]/list-row:font-bold",
    );
    // The parts read the row's inks instead of choosing their own.
    expect(classes(screen.getByTestId("description"))).toEqual(
      expect.arrayContaining(["text-callout", "text-(--list-row-ink-2)"]),
    );
    expect(classes(screen.getByTestId("time"))).toEqual(
      expect.arrayContaining(["font-mono", "text-(--list-row-ink-3)"]),
    );

    rerender(<ListRow data-testid="row" />);
    expect(screen.getByTestId("row").hasAttribute("data-tone")).toBe(false);
  });

  test("every part that is not the title reads ink-3 or ink-2 from the row", () => {
    render(
      <ListRow variant="plain" disabled>
        <ListRowIcon data-testid="icon" />
        <ListRowValue data-testid="value">English</ListRowValue>
        <ListRowChevron data-testid="chevron" />
      </ListRow>,
    );
    for (const id of ["value", "chevron"]) {
      expect(classes(screen.getByTestId(id))).toContain("text-(--list-row-ink-3)");
    }
    // The icon reads ink-3 unless an action's risk sets the risk ink.
    expect(classes(screen.getByTestId("icon"))).toContain(
      "text-(--list-row-risk-ink,var(--list-row-ink-3))",
    );
  });

  describe("an action's risk", () => {
    const actionRow = (props: Partial<Parameters<typeof ListRow>[0]>) => (
      <ListRow data-testid="row" variant="plain" {...props}>
        <ListRowIcon data-testid="icon" />
        <ListRowBody>
          <ListRowTitle data-testid="title">Delete channel</ListRowTitle>
          <ListRowDescription data-testid="description">Everyone loses it.</ListRowDescription>
        </ListRowBody>
        <ListRowValue data-testid="value">3</ListRowValue>
        <ListRowChevron data-testid="chevron" />
      </ListRow>
    );
    const WARNING =
      "not-disabled:not-aria-disabled:data-[tone=warning]:[--list-row-risk-ink:var(--warning-strong)]";
    const DANGER =
      "not-disabled:not-aria-disabled:data-[tone=danger]:[--list-row-risk-ink:var(--danger-strong)]";

    test("warning and danger set the risk ink on an enabled interactive row, and say so in data-tone", () => {
      const { rerender } = render(actionRow({ tone: "danger" }));
      const row = screen.getByTestId("row");
      expect(row.tagName).toBe("BUTTON");
      expect(row.getAttribute("data-tone")).toBe("danger");
      // Unset by default, so a row without a risk (or one nested in another) inherits nothing.
      expect(classes(row)).toEqual(
        expect.arrayContaining(["[--list-row-risk-ink:initial]", WARNING, DANGER]),
      );

      rerender(actionRow({ tone: "warning", render: <a href="#leave" /> }));
      expect(screen.getByTestId("row").tagName).toBe("A");
      expect(screen.getByTestId("row").getAttribute("data-tone")).toBe("warning");
      expect(classes(screen.getByTestId("row"))).toEqual(expect.arrayContaining([WARNING, DANGER]));
    });

    test("only the title and the leading icon read the risk ink", () => {
      render(actionRow({ tone: "danger" }));
      // The title falls back to the row's ink by inheriting (an unset custom
      // property makes `color` inherit); the icon falls back to ink-3.
      expect(classes(screen.getByTestId("title"))).toContain("text-(--list-row-risk-ink)");
      expect(classes(screen.getByTestId("icon"))).toContain(
        "text-(--list-row-risk-ink,var(--list-row-ink-3))",
      );
      // The description, the value and the chevron never do.
      expect(classes(screen.getByTestId("description"))).toContain("text-(--list-row-ink-2)");
      for (const id of ["description", "value", "chevron"]) {
        expect(
          classes(screen.getByTestId(id)).some((name) => name.includes("risk")),
          id,
        ).toBe(false);
      }
    });

    test("the hover and press fills don't change with the risk", () => {
      render(actionRow({ tone: "danger" }));
      const fills = classes(screen.getByTestId("row")).filter((name) => name.includes("overlay-"));
      expect(fills).toEqual([
        "not-disabled:not-aria-disabled:not-data-selected:hover:overlay-subtle",
        "not-disabled:not-aria-disabled:not-data-selected:active:overlay-medium",
        "not-data-selected:data-popup-open:overlay-subtle",
      ]);
      expect(
        classes(screen.getByTestId("row")).some((name) => /bg-(danger|warning)/.test(name)),
      ).toBe(false);
    });

    test("a display-only row ignores it: only an action has a risk", () => {
      render(actionRow({ tone: "danger", interactive: false }));
      const row = screen.getByTestId("row");
      expect(row.tagName).toBe("DIV");
      expect(row.getAttribute("data-tone")).toBe("danger");
      expect(classes(row)).toContain("[--list-row-risk-ink:initial]");
      expect(classes(row).some((name) => name.includes("data-[tone=danger]"))).toBe(false);
      expect(classes(row).some((name) => name.includes("data-[tone=warning]"))).toBe(false);
    });

    test("a disabled row ignores it: the risk ink is gated on an enabled row", () => {
      render(actionRow({ tone: "warning", disabled: true }));
      const row = screen.getByTestId("row") as HTMLButtonElement;
      expect(row.disabled).toBe(true);
      // Every risk class waits for an enabled row; disabled sets the disabled inks.
      for (const name of classes(row).filter((n) => n.includes("--list-row-risk-ink:var"))) {
        expect(name.startsWith("not-disabled:not-aria-disabled:")).toBe(true);
      }
      expect(classes(row)).toEqual(
        expect.arrayContaining([
          "disabled:[--list-row-ink:var(--foreground-disabled)]",
          "disabled:[--list-row-ink-3:var(--foreground-disabled)]",
        ]),
      );
    });
  });

  test("a subtitle is data in the title's ink, at 400 and a size down, on one line", () => {
    render(
      <ListRow data-testid="row" tone="away" render={<a href="/agents/bugen" />}>
        <ListRowBody>
          <ListRowTitle>Bugen</ListRowTitle>
          <ListRowSubtitle data-testid="subtitle">Drafts the release notes</ListRowSubtitle>
        </ListRowBody>
      </ListRow>,
    );
    const subtitle = screen.getByTestId("subtitle");
    expect(subtitle.tagName).toBe("SPAN");
    expect(subtitle.getAttribute("data-slot")).toBe("list-row-subtitle");
    // It reads the row's first ink, as the title does, so a tone or the
    // disabled state reaches it, never the ink-2 of an explanation.
    expect(classes(subtitle)).toEqual(
      expect.arrayContaining([
        "truncate",
        "min-w-0",
        "text-footnote",
        "font-normal",
        "text-(--list-row-ink)",
      ]),
    );
    expect(classes(subtitle).some((name) => name.includes("ink-2") || name.includes("ink-3"))).toBe(
      false,
    );
    expect(screen.getByRole("link", { name: /Bugen/ }).getAttribute("href")).toBe("/agents/bugen");
  });

  test("a subtitle renders what it is given and keeps the caller's class", () => {
    render(
      <ListRowSubtitle data-testid="subtitle" className="font-mono" render={<time />}>
        2026-11-09
      </ListRowSubtitle>,
    );
    const subtitle = screen.getByTestId("subtitle");
    expect(subtitle.tagName).toBe("TIME");
    expect(classes(subtitle)).toContain("font-mono");
  });

  test("a preview truncates by default and wraps on request", () => {
    const { rerender } = render(<ListRowDescription data-testid="d">Off.</ListRowDescription>);
    expect(classes(screen.getByTestId("d"))).toContain("truncate");
    expect(classes(screen.getByTestId("d"))).not.toContain("whitespace-normal");

    rerender(
      <ListRowDescription data-testid="d" wrap>
        Off: a person approves every merge.
      </ListRowDescription>,
    );
    expect(classes(screen.getByTestId("d"))).toContain("whitespace-normal");
  });

  test("a setting row: the value and a decorative chevron", () => {
    render(
      <ListRow variant="plain">
        <ListRowBody>
          <ListRowTitle>Language</ListRowTitle>
        </ListRowBody>
        <ListRowValue data-testid="value">English</ListRowValue>
        <ListRowChevron data-testid="chevron" />
      </ListRow>,
    );
    expect(screen.getByRole("button", { name: /Language/ })).toBeTruthy();
    expect(classes(screen.getByTestId("value"))).toContain("max-w-[45%]");
    const chevron = screen.getByTestId("chevron");
    expect(chevron.getAttribute("aria-hidden")).toBe("true");
    expect(chevron.querySelector("svg")).not.toBeNull();
  });

  test("an inset group is a card around the rows", () => {
    render(
      <ListRowGroup data-testid="group" render={<ul />}>
        <li>
          <ListRow>Wug</ListRow>
        </li>
      </ListRowGroup>,
    );
    const group = screen.getByTestId("group");
    expect(group.tagName).toBe("UL");
    expect(group.getAttribute("data-slot")).toBe("list-row-group");
    expect(classes(group)).toEqual(
      expect.arrayContaining([
        "overflow-hidden",
        "rounded-container",
        "border",
        "border-line-hairline",
        "bg-layer-card",
      ]),
    );
  });
});

// A list of places or people on a phone opts in to the list cell
// (design/patterns/lists.md); a settings card keeps the default look above.
describe("ListRow cell", () => {
  test("draws no line in any variant, and every state on the inset shape", () => {
    for (const variant of ["default", "plain", "entry"] as const) {
      const { unmount } = render(<ListRow cell data-testid="row" variant={variant} />);
      const rowClasses = classes(screen.getByTestId("row"));
      expect(rowClasses.join(" "), variant).not.toContain("border-t");
      expect(rowClasses, variant).toContain("list-cell");
      expect(rowClasses, variant).toContain("before:left-(--cell-inset-x)");
      expect(
        rowClasses.some((name) => /(?:^|:)overlay-/.test(name)),
        variant,
      ).toBe(false);
      expect(rowClasses, variant).not.toContain("data-selected:bg-info-soft");
      expect(rowClasses, variant).not.toContain("focus-visible:keyboard:inset-ring-2");
      expect(rowClasses, variant).toContain("focus-visible:keyboard:before:inset-ring-2");
      expect(rowClasses, variant).toContain(
        "not-data-active:not-data-selected:not-data-disabled:not-disabled:not-aria-disabled:hover:before:bg-fill-cell-hover",
      );
      unmount();
    }
  });

  test("a selected cell takes the cell's selected tint on its shape", () => {
    render(
      <ListRow cell selected>
        release-review
      </ListRow>,
    );
    expect(classes(screen.getByRole("button"))).toContain(
      "data-selected:before:bg-fill-cell-selected",
    );
  });

  test("a display-only cell has no hover or press", () => {
    render(<ListRow cell interactive={false} data-testid="row" />);
    expect(screen.getByTestId("row").className).not.toContain("bg-fill-cell-hover");
  });
});
