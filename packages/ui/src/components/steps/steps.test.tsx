/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { IslandIndicator } from "./island-indicator";
import { OtterIndicator, OtterTraveler } from "./otter-indicator";
import { Step, Steps } from "./steps";
import type { StepStatus, StepTravelerState } from "./steps";

// jsdom loads no stylesheet: a traveler takes its pace from these.
const pace = {
  "--r-steps-traveler-arrive-duration": "1.2s",
  "--r-steps-traveler-rest-duration": "1000ms",
} as CSSProperties;

/** Draws the traveler as its step number and pose. */
function renderTravelerLabel({ index, status }: StepTravelerState) {
  return <span data-testid="traveler">{`${index}-${status}`}</span>;
}

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never;
}

afterEach(cleanup);

function statuses() {
  return screen
    .getAllByRole("listitem")
    .map((item) => /r-step--(process|finish|error|wait)\b/.exec(item.className)?.[1]);
}

describe("Steps", () => {
  test("renders an ordered list with size and direction modifiers", () => {
    render(
      <Steps data-testid="steps" size="sm" vertical>
        <Step title="One" />
      </Steps>,
    );
    const list = screen.getByTestId("steps");
    expect(list.tagName).toBe("OL");
    expect(list.getAttribute("data-slot")).toBe("steps");
    expect(list.className).toBe("r-steps r-steps--sm r-steps--vertical");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  test("defaults to the md size in a row", () => {
    render(
      <Steps data-testid="steps">
        <Step title="One" />
      </Steps>,
    );
    expect(screen.getByTestId("steps").className).toBe("r-steps r-steps--md r-steps--horizontal");
  });

  test("adds the elegant modifier under the elegant theme", () => {
    render(
      <ThemeProvider theme="elegant">
        <Steps data-testid="steps">
          <Step title="One" />
        </Steps>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("steps").className).toContain("r-steps--elegant");
  });

  test("numbers the steps and derives each status from current", () => {
    render(
      <Steps current={2} status="error">
        <Step title="A" />
        {null}
        <Step title="B" />
        <Step title="C" />
      </Steps>,
    );
    expect(statuses()).toEqual(["finish", "error", "wait"]);
    const [first, second, third] = screen.getAllByRole("listitem");
    expect(second?.getAttribute("aria-current")).toBe("step");
    expect(first?.hasAttribute("aria-current")).toBe(false);
    expect(third?.querySelector(".r-step__index")?.textContent).toBe("3");
  });

  test("puts every step in progress without current, and a step's own status wins", () => {
    render(
      <Steps>
        <Step title="A" />
        <Step status="wait" title="B" />
      </Steps>,
    );
    expect(statuses()).toEqual(["process", "wait"]);
    expect(screen.queryByRole("listitem", { current: "step" })).toBeNull();
  });

  test("shows the finish and error icons and names those statuses for screen readers", () => {
    render(
      <Steps
        current={2}
        errorIcon={<svg data-testid="error" />}
        finishIcon={<svg data-testid="finish" />}
        status="error"
      >
        <Step icon={<svg data-testid="ignored" />} title="Build" />
        <Step title="Deploy" />
        <Step icon={<svg data-testid="icon" />} title="Verify" />
      </Steps>,
    );
    expect(screen.getByTestId("finish").parentElement?.className).toBe("r-step__indicator");
    expect(screen.getByTestId("error").parentElement?.className).toBe("r-step__indicator");
    expect(screen.getByTestId("icon").parentElement?.className).toBe("r-step__indicator");
    expect(screen.queryByTestId("ignored")).toBeNull();
    expect(screen.getByText("Build").textContent).toBe("Build Completed");
    expect(screen.getByText("Deploy").textContent).toBe("Deploy Failed");
    expect(screen.getByText("Verify").textContent).toBe("Verify");
  });

  test("takes the status labels from finishLabel and errorLabel", () => {
    render(
      <Steps current={2} status="error" finishLabel="已完成" errorLabel="失败">
        <Step title="A" />
        <Step title="B" />
      </Steps>,
    );
    expect(screen.getByText("A").textContent).toBe("A 已完成");
    expect(screen.getByText("B").textContent).toBe("B 失败");
  });

  test("renders the description, with children overriding it", () => {
    render(
      <Steps>
        <Step description="ignored" title="Deploy">
          Ship it
        </Step>
      </Steps>,
    );
    expect(screen.getByText("Ship it").className).toBe("r-step__description");
    expect(screen.queryByText("ignored")).toBeNull();
  });

  test("has no buttons unless onUpdateCurrent is set", () => {
    render(
      <Steps current={1}>
        <Step title="A" />
        <Step title="B" />
      </Steps>,
    );
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  test("reports the clicked step and skips disabled and current steps", () => {
    const onUpdateCurrent = vi.fn();
    render(
      <Steps current={1} onUpdateCurrent={onUpdateCurrent}>
        <Step description="First" title="A" />
        <Step title="B" />
        <Step disabled title="C" />
      </Steps>,
    );
    const [a, b, c] = screen.getAllByRole("button");
    expect(a?.getAttribute("aria-describedby")).toBe(screen.getByText("First").id);
    fireEvent.click(a!);
    expect(onUpdateCurrent).not.toHaveBeenCalled();
    fireEvent.click(b!);
    expect(onUpdateCurrent).toHaveBeenCalledWith(2);
    expect(c).toHaveProperty("disabled", true);
    const items = screen.getAllByRole("listitem");
    expect(items[2]?.className).toContain("r-step--disabled");
    expect(items[2]?.className).not.toContain("r-step--clickable");
    expect(items[1]?.className).toContain("r-step--clickable");
    // Controlled: the current step stays until the parent moves it.
    expect(statuses()).toEqual(["process", "wait", "wait"]);
  });

  test("moves the current step on click when uncontrolled", () => {
    const onUpdateCurrent = vi.fn();
    render(
      <Steps defaultCurrent={1} onUpdateCurrent={onUpdateCurrent}>
        <Step title="A" />
        <Step title="B" />
        <Step title="C" />
      </Steps>,
    );
    fireEvent.click(screen.getByRole("button", { name: "C" }));
    expect(onUpdateCurrent).toHaveBeenCalledWith(3);
    expect(statuses()).toEqual(["finish", "finish", "process"]);
    expect(screen.getAllByRole("listitem")[2]?.getAttribute("aria-current")).toBe("step");
  });
});

describe("Steps track and renderIndicator", () => {
  test("adds the river modifier for track river", () => {
    render(
      <Steps data-testid="steps" track="river">
        <Step title="One" />
      </Steps>,
    );
    expect(screen.getByTestId("steps").className).toBe(
      "r-steps r-steps--md r-steps--horizontal r-steps--river",
    );
  });

  test("renders a custom indicator with the step's state", () => {
    const renderIndicator = vi.fn(({ index, status, current }) =>
      current ? <span data-testid="custom">{`${index}-${status}`}</span> : undefined,
    );
    const { container } = render(
      <Steps current={2} renderIndicator={renderIndicator}>
        <Step title="One" />
        <Step title="Two" />
        <Step title="Three" />
      </Steps>,
    );
    expect(screen.getByTestId("custom").textContent).toBe("2-process");
    const indicators = container.querySelectorAll("[data-slot='step-indicator']");
    expect(indicators[1].className).toBe("r-step__indicator r-step__indicator--custom");
    // `undefined` keeps the default marker and box.
    expect(indicators[0].className).toBe("r-step__indicator");
    expect(indicators[0].querySelector("svg")).not.toBeNull();
    expect(indicators[2].textContent).toBe("3");
    expect(renderIndicator).toHaveBeenCalledWith(
      expect.objectContaining({ index: 1, status: "finish", current: false }),
    );
  });

  test("OtterIndicator poses by status", () => {
    const { container } = render(
      <>
        <OtterIndicator status="wait" />
        <OtterIndicator status="process" />
        <OtterIndicator status="finish" className="extra" />
        <OtterIndicator status="error" />
      </>,
    );
    const otters = [...container.querySelectorAll("[data-slot='otter-indicator']")];
    expect(otters.map((otter) => otter.getAttribute("class"))).toEqual([
      "r-otter-indicator r-otter-indicator--wait",
      "r-otter-indicator r-otter-indicator--process",
      "r-otter-indicator r-otter-indicator--finish extra",
      "r-otter-indicator r-otter-indicator--error",
    ]);
    // Asleep on the dry bank: no water and the "z"s; afloat otherwise.
    expect(otters[0].querySelector(".r-otter-indicator__wave")).toBeNull();
    expect(otters[0].querySelectorAll(".r-otter-indicator__z")).toHaveLength(2);
    expect(otters[1].querySelector(".r-otter-indicator__wave")).not.toBeNull();
    // Only a failed step loses the parcel overboard.
    expect(otters[3].querySelector(".r-otter-indicator__parcel--adrift")).not.toBeNull();
    expect(otters[1].querySelector(".r-otter-indicator__parcel--adrift")).toBeNull();
    // Each clip path id is unique and referenced by its own otter.
    const ids = otters.map((otter) => otter.querySelector("clipPath")?.id);
    expect(new Set(ids).size).toBe(4);
  });

  describe("renderTraveler", () => {
    const view = (current: number, status: StepStatus = "process") => (
      <Steps
        current={current}
        status={status}
        track="river"
        renderTraveler={renderTravelerLabel}
        style={pace}
      >
        <Step title="One" />
        <Step title="Two" />
        <Step title="Three" />
      </Steps>
    );
    /** The traveler's step number, its mode and what it was drawn with. */
    const where = (container: HTMLElement) => {
      const steps = [...container.querySelectorAll("[data-slot='step']")];
      const host = steps.findIndex((step) => step.hasAttribute("data-traveler"));
      return `${host + 1}:${steps[host]?.getAttribute("data-traveler")}:${
        screen.queryByTestId("traveler")?.textContent
      }`;
    };

    afterEach(() => {
      vi.useRealTimers();
    });

    test("swims the reach of the step in progress", () => {
      const { container, rerender } = render(view(1));
      expect(container.querySelector("[data-slot='steps']")?.className).toContain(
        "r-steps--traveler",
      );
      expect(where(container)).toBe("1:live:1-process");
      expect(container.querySelectorAll("[data-slot='step-traveler']")).toHaveLength(1);
      // Step one finishing: it first swims on into step one.
      rerender(view(2, "error"));
      expect(where(container)).toBe("1:arrive:1-process");
    });

    test("lands at a finished step, rests, then takes the next reach", () => {
      vi.useFakeTimers();
      const { container, rerender } = render(view(2));
      expect(where(container)).toBe("2:live:2-process");
      rerender(view(3));
      expect(where(container)).toBe("2:arrive:2-process");
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(where(container)).toBe("2:rest:2-finish");
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(where(container)).toBe("3:live:3-process");
    });

    test("never skips a step when steps finish faster than it swims", () => {
      vi.useFakeTimers();
      const { container, rerender } = render(view(1));
      rerender(view(3, "finish"));
      const seen = [where(container)];
      for (let i = 0; i < 40; i += 1) {
        act(() => {
          vi.advanceTimersByTime(200);
        });
        const now = where(container);
        if (now !== seen.at(-1)) seen.push(now);
      }
      expect(seen).toEqual([
        "1:arrive:1-process",
        "1:rest:1-finish",
        "2:arrive:2-process",
        "2:rest:2-finish",
        "3:arrive:3-process",
        "3:rest:3-finish",
      ]);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      // Every step done: it stays on the last one.
      expect(where(container)).toBe("3:rest:3-finish");

      // A restart sends it straight back.
      rerender(view(1));
      expect(where(container)).toBe("1:live:1-process");
    });

    test("keeps swimming while steps finish one after another, flags only where it landed", () => {
      vi.useFakeTimers();
      const { container, rerender } = render(view(1));
      const flags = () =>
        [...container.querySelectorAll("[data-slot='step']")]
          .map((step) => (step.classList.contains("r-step--finish") ? "F" : "-"))
          .join("");
      // Clicks every 500ms, faster than it swims a reach.
      rerender(view(2));
      act(() => {
        vi.advanceTimersByTime(500);
      });
      rerender(view(3));
      act(() => {
        vi.advanceTimersByTime(500);
      });
      rerender(view(3, "finish"));
      expect(flags()).toBe("---");
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(where(container)).toBe("1:rest:1-finish");
      expect(flags()).toBe("F--");
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(where(container)).toBe("2:rest:2-finish");
      expect(flags()).toBe("FF-");
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(flags()).toBe("FFF");
    });

    test("no step ever shows ahead of the traveler", () => {
      vi.useFakeTimers();
      const { container, rerender } = render(view(1));
      const check = () => {
        const steps = [...container.querySelectorAll("[data-slot='step']")];
        const host = steps.findIndex((step) => step.hasAttribute("data-traveler"));
        const mode = steps[host]?.getAttribute("data-traveler");
        // Markers it has reached: the one it rests at and those before it.
        const reached = mode === "rest" ? host + 1 : host;
        steps.forEach((step, i) => {
          expect(step.classList.contains("r-step--finish")).toBe(i < reached);
          if (i > host) expect(step.classList.contains("r-step--wait")).toBe(true);
        });
      };
      for (const next of [2, 3, 1, 2, 3, 3] as const) {
        rerender(view(next, next === 3 ? "finish" : "process"));
        for (let t = 0; t < 12; t += 1) {
          check();
          act(() => {
            vi.advanceTimersByTime(250);
          });
        }
      }
      check();
    });

    test("goes straight to the steps with no pace set", () => {
      vi.useFakeTimers();
      const { container, rerender } = render(
        <Steps current={1} track="river" renderTraveler={renderTravelerLabel}>
          <Step title="One" />
          <Step title="Two" />
        </Steps>,
      );
      rerender(
        <Steps current={2} status="finish" track="river" renderTraveler={renderTravelerLabel}>
          <Step title="One" />
          <Step title="Two" />
        </Steps>,
      );
      // Each 0ms leg is its own timer, set once the last one has rendered.
      for (let leg = 0; leg < 4; leg += 1) {
        act(() => {
          vi.advanceTimersByTime(0);
        });
      }
      expect(where(container)).toBe("2:rest:2-finish");
    });

    test("steps past its route show their own status", () => {
      const { container } = render(
        <Steps track="river" renderTraveler={renderTravelerLabel} style={pace}>
          <Step title="One" status="finish" />
          <Step title="Two" status="process" />
          <Step title="Three" status="finish" />
          <Step title="Four" status="error" />
        </Steps>,
      );
      expect(where(container)).toBe("2:live:2-process");
      const classes = [...container.querySelectorAll("[data-slot='step']")].map((step) =>
        [...step.classList].find((name) => name.startsWith("r-step--"))!,
      );
      expect(classes).toEqual([
        "r-step--finish",
        "r-step--process",
        "r-step--finish",
        "r-step--error",
      ]);
    });

    test("stops in the reach of a failed step", () => {
      const { container, rerender } = render(view(2));
      rerender(view(2, "error"));
      expect(where(container)).toBe("2:live:2-error");
    });

    test("leaves the steps alone without renderTraveler", () => {
      const { container } = render(
        <Steps current={2} track="river">
          <Step title="One" />
          <Step title="Two" />
        </Steps>,
      );
      expect(container.querySelector("[data-traveler]")).toBeNull();
      expect(container.querySelector("[data-slot='steps']")?.className).not.toContain(
        "r-steps--traveler",
      );
    });
  });

  test("renderTraveler draws nothing off the river", () => {
    const renderTraveler = vi.fn(() => <span data-testid="traveler" />);
    render(
      <Steps current={1} renderTraveler={renderTraveler}>
        <Step title="One" />
        <Step title="Two" />
      </Steps>,
    );
    expect(screen.queryByTestId("traveler")).toBeNull();
    expect(renderTraveler).not.toHaveBeenCalled();
  });

  test("IslandIndicator flies a flag only when finished", () => {
    const { container } = render(
      <>
        <IslandIndicator status="wait" />
        <IslandIndicator status="process" />
        <IslandIndicator status="finish" />
        <IslandIndicator status="error" />
      </>,
    );
    const islands = [...container.querySelectorAll("[data-slot='island-indicator']")];
    expect(islands.map((island) => island.getAttribute("class"))).toEqual([
      "r-island-indicator r-island-indicator--wait",
      "r-island-indicator r-island-indicator--process",
      "r-island-indicator r-island-indicator--finish",
      "r-island-indicator r-island-indicator--error",
    ]);
    expect(
      islands.map((island) => island.querySelector(".r-island-indicator__flag") !== null),
    ).toEqual([false, false, true, false]);
    // The finished island's flag carries the Raft mark.
    expect(islands[2].querySelector(".r-island-indicator__flag svg")).not.toBeNull();
    expect(islands[1].querySelector(".r-island-indicator__ring")).not.toBeNull();
  });

  test("OtterTraveler splashes in the river's water, red when the step ahead failed", () => {
    const { container } = render(
      <>
        <OtterTraveler status="process" />
        <OtterTraveler status="error" />
      </>,
    );
    const otters = [...container.querySelectorAll("[data-slot='otter-traveler']")];
    expect(otters[0].getAttribute("class")).toBe(
      "r-otter-indicator r-otter-traveler r-otter-indicator--process",
    );
    expect(otters[0].querySelector(".r-otter-indicator__wave")?.getAttribute("fill")).toContain(
      "--r-steps-river-water-color",
    );
    expect(otters[1].querySelector(".r-otter-indicator__wave")?.getAttribute("fill")).toContain(
      "--r-steps-river-error-color",
    );
    expect(otters[1].querySelector(".r-otter-indicator__parcel--adrift")).not.toBeNull();
  });
});
