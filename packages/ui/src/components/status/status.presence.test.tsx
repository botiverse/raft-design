/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { PRESENCE_COLOR } from "../../lib/presence";
import type { Presence } from "../../lib/presence";
import { Status } from "./status";

afterEach(cleanup);

const lightOf = (name: string) =>
  screen
    .getByRole("img", { name })
    .className.split(/\s+/)
    .filter((cls) => cls.startsWith("[--status-color:"));

test.each(Object.keys(PRESENCE_COLOR) as Presence[])(
  "the %s light takes its presence colour, and only that one",
  (presence) => {
    render(<Status presence={presence} role="img" aria-label={presence} />);
    expect(lightOf(presence)).toEqual([`[--status-color:var(--presence-${presence})]`]);
  },
);

test("presence takes the place of a variant's colour", () => {
  render(<Status variant="danger" presence="busy" role="img" aria-label="Working" />);
  expect(lightOf("Working")).toEqual(["[--status-color:var(--presence-busy)]"]);
});

test("without presence the variants are unchanged; the default is stone", () => {
  render(<Status role="img" aria-label="Idle" />);
  expect(lightOf("Idle")).toEqual(["[--status-color:var(--presence-offline)]"]);
});
