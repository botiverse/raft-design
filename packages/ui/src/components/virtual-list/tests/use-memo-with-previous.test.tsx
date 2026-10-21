/** @vitest-environment jsdom */
import { StrictMode } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { useMemoWithPrevious } from "../hooks/use-memo-with-previous";

afterEach(cleanup);

describe("useMemoWithPrevious", () => {
  it("passes the deps of the last committed render, even when StrictMode calls it twice", () => {
    const seen: (readonly [number] | undefined)[] = [];
    function Probe({ value }: { value: number }) {
      useMemoWithPrevious(
        (previous) => {
          seen.push(previous);
        },
        [value] as const,
      );
      return null;
    }

    const { rerender } = render(
      <StrictMode>
        <Probe value={1} />
      </StrictMode>,
    );
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((previous) => previous === undefined)).toBe(true);

    seen.length = 0;
    rerender(
      <StrictMode>
        <Probe value={2} />
      </StrictMode>,
    );
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((previous) => previous?.[0] === 1)).toBe(true);
  });
});
