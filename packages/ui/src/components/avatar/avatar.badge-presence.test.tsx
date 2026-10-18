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

test("the default dot is online", () => {
  const names = renderBadge({});
  expect(names).toContain("bg-presence-online");
});

test.each(["busy", "error", "offline", "external"] as const)(
  "a %s dot swaps the light, not the dot",
  (variant) => {
    const names = renderBadge({ variant });
    expect(names).toContain(`bg-presence-${variant}`);
    expect(names).not.toContain("bg-presence-online");
    expect(names).toContain("border-sticker-ink");
  },
);

test("a custom indicator keeps only the corner placement", () => {
  const names = renderBadge({ variant: "busy", render: <span /> });
  expect(names).not.toContain("bg-presence-busy");
  expect(names).toContain("absolute");
});
