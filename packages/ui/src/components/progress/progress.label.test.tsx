/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack } from "./progress";

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

afterEach(cleanup);

/**
 * The `label` prop exists for bare usages with no visible ProgressLabel:
 * slock kept a ui/ProgressBar shell only to wire `aria-label={label ?? default}`.
 * Attribute-level facts, so these run in the node pool like dialog.chrome.test.
 */
test("label: is wired as the progressbar's accessible name", () => {
  render(
    <ThemeProvider theme="elegant">
      <Progress value={48} label="上传中">
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </ThemeProvider>,
  );
  const bar = screen.getByRole("progressbar");
  expect(bar.getAttribute("aria-label")).toBe("上传中");
});

test("label: omitted leaves no aria-label (existing callsites unchanged)", () => {
  render(
    <ThemeProvider theme="elegant">
      <Progress value={48}>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </ThemeProvider>,
  );
  expect(screen.getByRole("progressbar").hasAttribute("aria-label")).toBe(false);
});

test("label: a visible ProgressLabel keeps the aria-labelledby association", () => {
  render(
    <ThemeProvider theme="elegant">
      <Progress value={48} label="上传中">
        <ProgressLabel>正在上传 example.txt</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </ThemeProvider>,
  );
  const bar = screen.getByRole("progressbar");
  // Base UI associates the visible label via aria-labelledby, which takes
  // precedence over aria-label for the accessible name.
  const labelledby = bar.getAttribute("aria-labelledby");
  expect(labelledby).toBeTruthy();
  const labelEl = document.getElementById(labelledby!);
  expect(labelEl?.textContent).toBe("正在上传 example.txt");
});
