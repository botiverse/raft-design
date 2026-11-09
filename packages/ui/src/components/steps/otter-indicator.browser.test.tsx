import { createRef } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { OtterIndicator } from "./otter-indicator";

const it = test.skipIf(typeof window === "undefined");
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
afterEach(async () => {
  cleanup();
  vi.restoreAllMocks();
  if (typeof window !== "undefined") {
    const { cdp } = await import("vite-plus/test/browser/context");
    await cdp().send("Emulation.setEmulatedMedia", { features: [] });
  }
});

it("keeps the SVG ref, dimensions and decorative default", () => {
  const ref = createRef<SVGSVGElement>();
  render(<OtterIndicator ref={ref} status="wait" width={56} height={56} data-testid="ottie" />);
  expect(ref.current).toBe(screen.getByTestId("ottie"));
  expect(ref.current?.tagName).toBe("svg");
  expect(ref.current?.getAttribute("viewBox")).toBe("0 0 48 48");
  expect(ref.current?.getBoundingClientRect().width).toBe(56);
  expect(ref.current?.getAttribute("aria-hidden")).toBe("true");
});

it("pauses an illustration outside the viewport and resumes its clock on return", async () => {
  render(<OtterIndicator status="wait" width={56} height={56} data-testid="ottie" />);
  const node = screen.getByTestId("ottie");
  await expect.poll(() => node.dataset.animate).toBe("true");
  const animation = node.getAnimations({ subtree: true })[0]!;
  node.style.position = "fixed";
  node.style.top = "20000px";
  await expect.poll(() => node.dataset.animate).toBe("false");
  await wait(50);
  const time = animation.currentTime;
  await wait(150);
  expect(animation.currentTime).toBe(time);
  node.style.top = "0";
  await expect.poll(() => node.dataset.animate).toBe("true");
  await wait(100);
  expect(Number(animation.currentTime)).toBeGreaterThan(Number(time));
});

it("pauses the CSS clock while the document is hidden", async () => {
  render(<OtterIndicator status="process" width={56} height={56} data-testid="ottie" />);
  const node = screen.getByTestId("ottie");
  await expect.poll(() => node.dataset.animate).toBe("true");
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  document.dispatchEvent(new Event("visibilitychange"));
  expect(node.dataset.animate).toBe("false");
  await wait(50);
  const animation = node.getAnimations({ subtree: true })[0]!;
  const time = animation.currentTime;
  await wait(150);
  expect(animation.currentTime).toBe(time);
  hidden.mockRestore();
  document.dispatchEvent(new Event("visibilitychange"));
  expect(node.dataset.animate).toBe("true");
});

it("reduced motion has no animation and holds the final error pose", async () => {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  render(<OtterIndicator status="error" width={56} height={56} data-testid="ottie" />);
  const node = screen.getByTestId("ottie");
  expect(node.getAnimations({ subtree: true })).toHaveLength(0);
  const image = node.querySelector(".r-otter-indicator__frames")!;
  expect(getComputedStyle(image).backgroundPosition).toBe("100% 100%");
  expect(getComputedStyle(node.querySelector("text")!).opacity).toBe("1");
});

it("error and completion settle once; changing status starts the next action", async () => {
  const view = render(<OtterIndicator status="error" width={56} height={56} data-testid="ottie" />);
  const node = screen.getByTestId("ottie");
  await expect.poll(() => node.dataset.animate).toBe("true");
  await expect
    .poll(
      () =>
        node
          .getAnimations({ subtree: true })
          .every((animation) => animation.playState === "finished"),
      { timeout: 3000 },
    )
    .toBe(true);
  expect(node.querySelector(".r-otter-indicator__frames")!.getAnimations()).toHaveLength(1);
  const times = node.getAnimations({ subtree: true }).map((animation) => animation.currentTime);
  await wait(150);
  expect(node.getAnimations({ subtree: true }).map((animation) => animation.currentTime)).toEqual(
    times,
  );
  view.rerender(<OtterIndicator status="finish" width={56} height={56} data-testid="ottie" />);
  await expect
    .poll(() =>
      node.getAnimations({ subtree: true }).some((animation) => animation.playState === "running"),
    )
    .toBe(true);
  await expect
    .poll(
      () =>
        node
          .getAnimations({ subtree: true })
          .every((animation) => animation.playState === "finished"),
      { timeout: 3000 },
    )
    .toBe(true);
});
