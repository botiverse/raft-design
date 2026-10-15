/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarBadge } from "./avatar";
import type { AvatarBadgeOffset } from "./avatar";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function badge(theme: "brutal" | "elegant", offset?: AvatarBadgeOffset) {
  const { container } = render(
    <ThemeProvider theme={theme}>
      <Avatar size="md" type="agent">
        <AvatarBadge offset={offset} />
      </Avatar>
    </ThemeProvider>,
  );
  return container.querySelector<HTMLElement>('[data-slot="avatar-badge"]')!;
}

afterEach(cleanup);

test("without offset the badge keeps the recipe's corner and no inline placement", () => {
  const el = badge("brutal");
  expect(el.className.split(/\s+/)).toContain("bottom-0");
  expect(el.getAttribute("style")).toBeNull();
});

test("offset centres the badge on [x, y] from the avatar's top-left", () => {
  for (const theme of ["brutal", "elegant"] as const) {
    const el = badge(theme, ["100%", 0]);
    expect(el.style.left).toBe("100%");
    expect(el.style.top).toBe("0px");
    // The recipe's own corner is switched off so only the offset places it.
    expect(el.style.right).toBe("auto");
    expect(el.style.bottom).toBe("auto");
    expect(el.style.translate).toBe("-50% -50%");
    cleanup();
  }
});

test("numbers are px and strings pass through as CSS lengths", () => {
  const el = badge("elegant", [6, "0.25rem"]);
  expect(el.style.left).toBe("6px");
  expect(el.style.top).toBe("0.25rem");
});

test("an offset badge still sits above the avatar image", () => {
  expect(badge("brutal", [0, 0]).className.split(/\s+/)).toContain("z-10");
});
