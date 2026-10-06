/** @vitest-environment jsdom */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  AnnouncementDialog,
  AnnouncementDialogContent,
  AnnouncementDialogBody,
  AnnouncementDialogHeader,
  AnnouncementDialogLabel,
  AnnouncementDialogTitle,
  AnnouncementDialogClose,
  AnnouncementDialogText,
  AnnouncementDialogFooter,
  AnnouncementDialogAction,
  AnnouncementDialogSecondaryAction,
} from "./announcement-dialog";

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

function Fixture({ secondary = true, onAction = vi.fn(), onClose = vi.fn() }) {
  return (
    <ThemeProvider theme="brutal">
      <AnnouncementDialog open onOpenChange={onClose}>
        <AnnouncementDialogContent>
          <AnnouncementDialogBody>
            <AnnouncementDialogHeader>
              <AnnouncementDialogLabel>News</AnnouncementDialogLabel>
              <AnnouncementDialogClose aria-label="Fermer" />
            </AnnouncementDialogHeader>
            <AnnouncementDialogTitle>A long update</AnnouncementDialogTitle>
            <AnnouncementDialogText>
              <p>Content</p>
            </AnnouncementDialogText>
          </AnnouncementDialogBody>
          <AnnouncementDialogFooter>
            {secondary && (
              <AnnouncementDialogSecondaryAction onClick={onClose}>
                Got it
              </AnnouncementDialogSecondaryAction>
            )}
            <AnnouncementDialogAction onClick={onAction}>Open form</AnnouncementDialogAction>
          </AnnouncementDialogFooter>
        </AnnouncementDialogContent>
      </AnnouncementDialog>
    </ThemeProvider>
  );
}

test("opens with an accessible title and focuses main action rather than close", async () => {
  render(<Fixture />);
  expect(await screen.findByRole("dialog", { name: "A long update" })).toBeTruthy();
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open form" })),
  );
  expect(screen.getByRole("button", { name: "Fermer" })).toBeTruthy();
});
test("actions belong to the caller and have separate callbacks", async () => {
  const primary = vi.fn();
  const secondary = vi.fn();
  render(<Fixture onAction={primary} onClose={secondary} />);
  fireEvent.click(await screen.findByRole("button", { name: "Open form" }));
  expect(primary).toHaveBeenCalledTimes(1);
  expect(secondary).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Got it" }));
  expect(secondary).toHaveBeenCalledTimes(1);
});
test("single action does not require an empty secondary control", async () => {
  render(<Fixture secondary={false} />);
  await screen.findByRole("dialog");
  expect(screen.queryByRole("button", { name: "Got it" })).toBeNull();
});
