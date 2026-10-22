import "./ellipsis.test.css";
import { useRef } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { useTruncated } from "../../lib/use-truncated";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function settle() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

function Name({ id, children }: { id: string; children: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const truncated = useTruncated(ref);
  return (
    <span ref={ref} data-testid={id} data-state={String(truncated)} className="block truncate px-2">
      {children}
    </span>
  );
}

it("tells a cut text from one that fits, and follows its box", async () => {
  render(
    <ThemeProvider>
      <div data-testid="box" className="w-[160px] text-footnote">
        <Name id="long">Quarterly planning for the design system</Name>
        <Name id="short">Notes</Name>
      </div>
    </ThemeProvider>,
  );
  await settle();
  const state = (id: string) => screen.getByTestId(id).getAttribute("data-state");
  expect(state("long")).toBe("true");
  expect(state("short")).toBe("false");
  screen.getByTestId("box").style.width = "600px";
  await settle();
  await settle();
  expect(state("long")).toBe("false");
});
