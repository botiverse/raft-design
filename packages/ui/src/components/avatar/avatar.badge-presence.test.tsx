/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Avatar, AvatarBadge, AvatarFallback } from "./avatar";

afterEach(cleanup);

function renderBadge(props: Parameters<typeof AvatarBadge>[0]) {
  render(
    <Avatar size="md" type="agent">
      <AvatarFallback>W</AvatarFallback>
      <AvatarBadge data-testid="badge" {...props} />
    </Avatar>,
  );
  return screen.getByTestId("badge").className.split(/\s+/);
}

test("the dot is drawn in the status colour, online by default", () => {
  const names = renderBadge({});
  expect(names).toContain("bg-(--status-color)");
  expect(names).toContain("[--status-color:var(--presence-online)]");
});

test.each(["busy", "error", "offline", "external"] as const)(
  "a %s dot swaps the light, not the dot",
  (presence) => {
    const names = renderBadge({ presence });
    expect(names).toContain(`[--status-color:var(--presence-${presence})]`);
    expect(names).not.toContain("[--status-color:var(--presence-online)]");
    expect(names).toContain("border-sticker-ink");
  },
);

test("a custom indicator keeps only the corner placement", () => {
  const names = renderBadge({ presence: "busy", render: <span /> });
  expect(names.some((name) => name.startsWith("[--status-color:"))).toBe(false);
  expect(names).toContain("absolute");
});
