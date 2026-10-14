/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { OtterIndicator } from "./otter-indicator";
import { Step, Steps } from "./steps";

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
});
