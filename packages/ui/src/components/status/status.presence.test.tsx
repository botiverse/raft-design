/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Status } from "./status";

afterEach(cleanup);

test.each([
  ["online", "--presence-online"],
  ["busy", "--presence-busy"],
  ["error", "--presence-error"],
  ["offline", "--presence-offline"],
  ["external", "--presence-external"],
] as const)("the %s light takes its presence colour", (variant, token) => {
  render(<Status variant={variant} role="img" aria-label={variant} />);
  const light = screen.getByRole("img", { name: variant });
  expect(light.className.split(/\s+/)).toContain(`[--status-color:var(${token})]`);
});

test("the default light is still offline stone", () => {
  render(<Status role="img" aria-label="Offline" />);
  expect(screen.getByRole("img", { name: "Offline" }).className).toContain(
    "[--status-color:var(--presence-offline)]",
  );
});
