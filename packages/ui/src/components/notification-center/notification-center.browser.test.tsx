import "./notification-center.test.css";
/**
 * The notification center on a phone, in a real layout (elevation.md,
 * "Popups"): opened from a bell at the right end of the top bar, the popup
 * sits 8px from each screen edge, as the server list under the same top bar
 * does, on every phone width. Base UI's default 5px collision padding and a
 * `min(92vw, 360px)` width left it 6px from the right edge and 25px from the
 * left on a 390px phone.
 */
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  NotificationCenter,
  NotificationCenterHeader,
  NotificationCenterPopup,
  NotificationCenterTitle,
  NotificationCenterTrigger,
} from "./notification-center";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

async function openOnPhone(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 844);
  render(
    <ThemeProvider mode="light">
      {/* A phone's top bar: the 40px bell's icon box ends on the 16px margin,
          so the button itself ends 6px from the screen's right edge. */}
      <div style={{ display: "flex", justifyContent: "flex-end", height: 56, paddingRight: 6 }}>
        <NotificationCenter defaultOpen>
          <NotificationCenterTrigger type="button" aria-label="Notifications" />
          <NotificationCenterPopup viewport="mobile" align="end" sideOffset={8}>
            <NotificationCenterHeader>
              <NotificationCenterTitle>Notifications</NotificationCenterTitle>
            </NotificationCenterHeader>
          </NotificationCenterPopup>
        </NotificationCenter>
      </div>
    </ThemeProvider>,
  );
  const popup = await waitFor(() => {
    const el = document.querySelector<HTMLElement>("[data-slot=notification-center-popup]");
    expect(el).not.toBeNull();
    expect(el!.getBoundingClientRect().width).toBeGreaterThan(0);
    return el!;
  });
  // Let the positioner settle after its first measurement.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return popup.getBoundingClientRect();
}

for (const width of [320, 375, 390, 430]) {
  it(`on a ${width}px phone the popup is 8px from both screen edges`, async () => {
    const box = await openOnPhone(width);
    const left = box.left;
    const right = document.documentElement.clientWidth - box.right;
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
    expect(left).toBeCloseTo(8, 0);
    expect(right).toBeCloseTo(8, 0);
  });
}
