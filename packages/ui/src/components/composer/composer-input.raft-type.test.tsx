/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Composer, ComposerInput } from "./composer";

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

test("the raft composer input states the DS input type instead of inheriting its host's", () => {
  // A thread footer sets 12/16 500 caption type for its hint text; the
  // composer it hosts must still read 16/24 regular, like the channel's.
  render(
    <ThemeProvider theme="raft">
      <div className="text-caption font-medium">
        <Composer>
          <ComposerInput aria-label="Message thread" />
        </Composer>
      </div>
    </ThemeProvider>,
  );
  const classes = screen.getByRole("textbox", { name: "Message thread" }).className.split(/\s+/);
  expect(classes).toContain("text-body");
  expect(classes).toContain("font-normal");
});
