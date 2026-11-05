/**
 * @vitest-environment jsdom
 *
 * Pins the block card's structure (app-link-card.md, Anatomy): Raft's header
 * comes first, before anything the app sends, so a screen reader reads the
 * app's name before the app's words; every part renders its slot; the host
 * keeps its characters in order inside a right-to-left box, so it loses its
 * start when cut; and the placeholder is busy, holds the header it is given,
 * and hides its gray bars; and the card is a group its title names.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  AppLinkCard,
  AppLinkCardActions,
  AppLinkCardBody,
  AppLinkCardEyebrow,
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardMeta,
  AppLinkCardName,
  AppLinkCardPlaceholder,
  AppLinkCardTitle,
} from "./app-link-card";

afterEach(cleanup);

function header() {
  return (
    <AppLinkCardHeader data-testid="header">
      <AppLinkCardIcon data-testid="icon">
        <img src="/app-icons/stamp.svg" alt="" />
      </AppLinkCardIcon>
      <AppLinkCardName data-testid="name">Stamp</AppLinkCardName>
      <AppLinkCardHost data-testid="host">stamp.build</AppLinkCardHost>
    </AppLinkCardHeader>
  );
}

test("the header comes first, then the item, then the buttons", () => {
  render(
    <AppLinkCard data-testid="card">
      {header()}
      <AppLinkCardBody data-testid="body">
        <AppLinkCardEyebrow data-testid="eyebrow">botiverse/slock</AppLinkCardEyebrow>
        <AppLinkCardTitle data-testid="title">#10449 refactor(i18n)</AppLinkCardTitle>
        <AppLinkCardMeta data-testid="meta">Merged</AppLinkCardMeta>
      </AppLinkCardBody>
      <AppLinkCardActions data-testid="actions">
        <button type="button">Approve</button>
      </AppLinkCardActions>
    </AppLinkCard>,
  );

  const card = screen.getByTestId("card");
  expect(card.getAttribute("data-slot")).toBe("app-link-card");
  expect([...card.children].map((child) => child.getAttribute("data-slot"))).toEqual([
    "app-link-card-header",
    "app-link-card-body",
    "app-link-card-actions",
  ]);
  for (const [id, slot] of [
    ["icon", "app-link-card-icon"],
    ["name", "app-link-card-name"],
    ["host", "app-link-card-host"],
    ["eyebrow", "app-link-card-eyebrow"],
    ["title", "app-link-card-title"],
    ["meta", "app-link-card-meta"],
  ]) {
    expect(screen.getByTestId(id).getAttribute("data-slot")).toBe(slot);
  }
  expect(card.textContent?.startsWith("Stampstamp.build")).toBe(true);
  expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
});

test("the header sits under a hairline; the title clamps to 2 lines", () => {
  render(
    <AppLinkCard>
      {header()}
      <AppLinkCardBody>
        <AppLinkCardTitle data-testid="title">A title</AppLinkCardTitle>
      </AppLinkCardBody>
    </AppLinkCard>,
  );
  const headerClasses = screen.getByTestId("header").className.split(/\s+/);
  expect(headerClasses).toContain("border-b");
  expect(headerClasses).toContain("border-line-hairline");
  expect(screen.getByTestId("title").className.split(/\s+/)).toContain("line-clamp-2");
});

test("the host keeps its characters in order inside a right-to-left box", () => {
  render(<AppLinkCardHost data-testid="host">review.attacker.example</AppLinkCardHost>);
  const outer = screen.getByTestId("host").firstElementChild as HTMLElement;
  expect(outer.getAttribute("dir")).toBe("rtl");
  const inner = outer.firstElementChild as HTMLElement;
  expect(inner.getAttribute("dir")).toBe("ltr");
  expect(inner.textContent).toBe("review.attacker.example");
});

test("the placeholder is busy, holds its header and hides its bars", () => {
  render(<AppLinkCardPlaceholder data-testid="placeholder">{header()}</AppLinkCardPlaceholder>);
  const placeholder = screen.getByTestId("placeholder");
  expect(placeholder.getAttribute("data-slot")).toBe("app-link-card-placeholder");
  expect(placeholder.getAttribute("aria-busy")).toBe("true");
  expect(placeholder.firstElementChild).toBe(screen.getByTestId("header"));
  const rest = [...placeholder.children].slice(1);
  expect(rest.length).toBe(2);
  for (const child of rest) expect(child.getAttribute("aria-hidden")).toBe("true");
  expect(placeholder.querySelectorAll("[data-slot=skeleton]").length).toBeGreaterThan(0);
});

test("the placeholder has the card's frame", () => {
  render(
    <>
      <AppLinkCard data-testid="card" />
      <AppLinkCardPlaceholder data-testid="placeholder" />
    </>,
  );
  expect(screen.getByTestId("placeholder").className).toBe(screen.getByTestId("card").className);
});

test("the card is a group, named by its title through aria-labelledby", () => {
  render(
    <AppLinkCard aria-labelledby="title-10451">
      {header()}
      <AppLinkCardBody>
        <AppLinkCardTitle id="title-10451">
          #10451 test(i18n): cover the zh-CN fallback
        </AppLinkCardTitle>
      </AppLinkCardBody>
      <AppLinkCardActions>
        <button type="button">Approve</button>
      </AppLinkCardActions>
    </AppLinkCard>,
  );
  const group = screen.getByRole("group", { name: "#10451 test(i18n): cover the zh-CN fallback" });
  expect(group.getAttribute("data-slot")).toBe("app-link-card");
  expect(group.contains(screen.getByRole("button", { name: "Approve" }))).toBe(true);
});
