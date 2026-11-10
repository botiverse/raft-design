import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, within } from "@testing-library/react";

import { ListRowAttachedComposition } from "./attached.composition.tsx";

// An attached row draws no hairline, so only sight ties it to its setting.
// The canonical example ties it for assistive technology too: the attached
// row is a group named by the setting's title, so "Start time" is announced
// inside "Quiet hours" (packages/ui/src/components/list-row/list-row.md).

afterEach(() => cleanup());

test("the attached row is a group named by the setting it belongs to, holding its controls", () => {
  render(<ListRowAttachedComposition />);
  const group = screen.getByRole("group", { name: "Quiet hours" });
  expect(group.hasAttribute("data-attached")).toBe(true);
  expect(within(group).getByLabelText("Start time")).toBeTruthy();
  expect(within(group).getByLabelText("End time")).toBeTruthy();

  // The setting's switch and the group share one name, its title.
  const quietHours = screen.getByRole("switch", { name: "Quiet hours" });
  expect(group.contains(quietHours)).toBe(false);
  // The next setting isn't part of it.
  expect(within(group).queryByRole("switch")).toBeNull();
});
