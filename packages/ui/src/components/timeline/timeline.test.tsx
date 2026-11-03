/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Timeline, TimelineContent, TimelineItem, TimelineTime, TimelineTitle } from "./timeline";

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

const markerIcon = <svg data-testid="icon" />;

afterEach(cleanup);

describe("Timeline", () => {
  test("renders an ordered list with size and placement modifiers", () => {
    render(
      <Timeline data-testid="timeline" size="lg" itemPlacement="right">
        <TimelineItem>One</TimelineItem>
      </Timeline>,
    );
    const list = screen.getByTestId("timeline");
    expect(list.tagName).toBe("OL");
    expect(list.getAttribute("data-slot")).toBe("timeline");
    expect(list.className).toBe("r-timeline r-timeline--lg r-timeline--right");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  test("drops the placement when horizontal and sets a custom icon size", () => {
    render(
      <Timeline data-testid="timeline" horizontal iconSize={18}>
        <TimelineItem>One</TimelineItem>
      </Timeline>,
    );
    const list = screen.getByTestId("timeline");
    expect(list.className).toBe("r-timeline r-timeline--md r-timeline--horizontal");
    expect(list.style.getPropertyValue("--r-timeline-custom-icon-size")).toBe("18px");
  });

  test("renders title, content and time parts inside the item body", () => {
    render(
      <Timeline>
        <TimelineItem>
          <TimelineTitle>Deploy</TimelineTitle>
          <TimelineContent>Shipped</TimelineContent>
          <TimelineTime>09:00</TimelineTime>
        </TimelineItem>
      </Timeline>,
    );
    expect(screen.getByText("Deploy").className).toBe("r-timeline-title");
    expect(screen.getByText("Shipped").className).toBe("r-timeline-content");
    expect(screen.getByText("09:00").className).toBe("r-timeline-time");
    expect(screen.getByText("Deploy").parentElement?.className).toBe("r-timeline-item__body");
  });

  test("renders the compact panel size", () => {
    render(
      <Timeline data-testid="timeline" size="sm">
        <TimelineItem>One</TimelineItem>
      </Timeline>,
    );
    expect(screen.getByTestId("timeline").className).toBe(
      "r-timeline r-timeline--sm r-timeline--left",
    );
  });

  test("maps the accent variant", () => {
    render(
      <Timeline>
        <TimelineItem variant="accent">One</TimelineItem>
      </Timeline>,
    );
    expect(screen.getByRole("listitem").className).toBe("r-timeline-item r-timeline-item--accent");
  });

  test("maps variant, line type, color and icon", () => {
    render(
      <Timeline>
        <TimelineItem variant="danger" lineType="dashed" color="red" icon={markerIcon}>
          One
        </TimelineItem>
      </Timeline>,
    );
    const item = screen.getByRole("listitem");
    expect(item.className).toBe(
      "r-timeline-item r-timeline-item--danger r-timeline-item--dashed r-timeline-item--color",
    );
    expect(item.style.getPropertyValue("--r-timeline-custom-color")).toBe("red");
    expect(screen.getByTestId("icon").parentElement?.className).toBe("r-timeline-item__icon");
    expect(item.querySelector(".r-timeline-item__marker")).toBeNull();
  });

  test("a Backlog item is hollow, and an icon in it keeps a visible colour", () => {
    render(
      <Timeline>
        <TimelineItem taskStatus="backlog">Parked</TimelineItem>
        <TimelineItem taskStatus="backlog" icon={markerIcon}>
          Parked, with an icon
        </TimelineItem>
      </Timeline>,
    );
    const [pixel, withIcon] = screen.getAllByRole("listitem");
    for (const item of [pixel!, withIcon!]) {
      expect(item.getAttribute("data-task-status")).toBe("backlog");
      expect(item.className).toContain("r-timeline-item--color");
      // The item colour is a real ink, never `transparent`: the icon is drawn
      // in it (timeline.css, .r-timeline-item__icon).
      expect(item.style.getPropertyValue("--r-timeline-custom-color")).toBe("var(--line-strong)");
      // The marker takes none of it as fill, and its edge takes it.
      expect(item.style.getPropertyValue("--r-timeline-marker-fill")).toBe("0%");
      expect(item.style.getPropertyValue("--r-timeline-marker-border-color")).toBe(
        "var(--r-timeline-item-color)",
      );
    }
    expect(screen.getByTestId("icon").parentElement?.className).toBe("r-timeline-item__icon");
  });

  test("an explicit color on a Backlog item wins, with the default marker", () => {
    render(
      <Timeline>
        <TimelineItem taskStatus="backlog" color="red">
          Parked
        </TimelineItem>
      </Timeline>,
    );
    const item = screen.getByRole("listitem");
    expect(item.style.getPropertyValue("--r-timeline-custom-color")).toBe("red");
    expect(item.style.getPropertyValue("--r-timeline-marker-fill")).toBe("");
  });
});
