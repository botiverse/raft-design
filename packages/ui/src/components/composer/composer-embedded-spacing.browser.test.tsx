import "./composer-suggestion-list.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerSubmit,
  ComposerToolbar,
} from "./composer";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

// Shape › Inside a frame: a control embedded in the composer sits 6px from the
// frame's outer edge, and two of them sit the same 6px apart.
it("the composer's buttons sit as far apart as they sit from its edge", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "480px" }}>
        <Composer data-testid="composer">
          <ComposerInput placeholder="Message" />
          <ComposerToolbar>
            <ComposerActions>
              <ComposerIconButton aria-label="Image">
                <svg viewBox="0 0 24 24" />
              </ComposerIconButton>
              <ComposerIconButton aria-label="File">
                <svg viewBox="0 0 24 24" />
              </ComposerIconButton>
            </ComposerActions>
            <ComposerMeta>
              <ComposerSubmit aria-label="Send">
                <svg viewBox="0 0 24 24" />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
      </div>
    </ThemeProvider>,
  );
  const frame = screen.getByTestId("composer").getBoundingClientRect();
  const image = screen.getByRole("button", { name: "Image" }).getBoundingClientRect();
  const file = screen.getByRole("button", { name: "File" }).getBoundingClientRect();
  const send = screen.getByRole("button", { name: "Send" }).getBoundingClientRect();

  expect(Math.round(image.left - frame.left)).toBe(6);
  expect(Math.round(frame.bottom - image.bottom)).toBe(6);
  expect(Math.round(frame.right - send.right)).toBe(6);
  expect(Math.round(file.left - image.right)).toBe(6);
});
