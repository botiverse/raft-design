/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { SaveStatus, SaveStatusError, SaveStatusSaved } from "./save-status";

afterEach(cleanup);

test("with nothing to say the line is empty, so it is hidden", () => {
  render(<SaveStatus data-testid="line" />);
  const line = screen.getByTestId("line");
  expect(line.childNodes.length).toBe(0);
  expect(line.className.split(/\s+/)).toContain("empty:hidden");
});

test("the deprecated SaveStatusSaved renders nothing, whatever its children", () => {
  render(
    <SaveStatus data-testid="line">
      <SaveStatusSaved>Saved</SaveStatusSaved>
    </SaveStatus>,
  );
  expect(screen.getByTestId("line").childNodes.length).toBe(0);
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByText("Saved")).toBeNull();
});

test("a failure is an alert", () => {
  render(
    <SaveStatus id="line">
      <SaveStatusError>Couldn&apos;t save. Try again.</SaveStatusError>
    </SaveStatus>,
  );
  expect(screen.getByRole("alert").textContent).toBe("Couldn't save. Try again.");
  expect(screen.queryByRole("status")).toBeNull();
  expect(document.getElementById("line")?.dataset.slot).toBe("save-status");
});
