/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { SaveStatus, SaveStatusError, SaveStatusSaved } from "./save-status";

afterEach(cleanup);

test("the empty saved region is a polite live region with no check", () => {
  const { container } = render(
    <SaveStatus>
      <SaveStatusSaved />
    </SaveStatus>,
  );
  const region = screen.getByRole("status");
  expect(region.getAttribute("aria-live")).toBe("polite");
  expect(region.textContent).toBe("");
  expect(container.querySelector("svg")).toBeNull();
});

test("the saved words come with a hidden check", () => {
  render(
    <SaveStatus>
      <SaveStatusSaved>Saved</SaveStatusSaved>
    </SaveStatus>,
  );
  const region = screen.getByRole("status");
  expect(region.textContent).toBe("Saved");
  expect(region.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
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
