import "./banner.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Banner, BannerAction, BannerDescription, BannerTitle } from "./banner";
import { Button } from "../button/button";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function color(el: Element): string {
  return getComputedStyle(el).color;
}

// --- ghost indent: description left edge is consistent with/without BannerAction ---

it("description left edge is the same with and without BannerAction", () => {
  const { unmount } = render(
    <ThemeProvider>
      <div style={{ width: "400px" }}>
        <Banner status="warning" data-testid="b-without">
          <BannerDescription data-testid="d-without">Text</BannerDescription>
        </Banner>
      </div>
    </ThemeProvider>,
  );
  const leftWithout = screen.getByTestId("d-without").getBoundingClientRect().left;
  const bannerLeftWithout = screen.getByTestId("b-without").getBoundingClientRect().left;
  unmount();

  render(
    <ThemeProvider>
      <div style={{ width: "400px" }}>
        <Banner status="warning" data-testid="b-with">
          <BannerDescription data-testid="d-with">Text</BannerDescription>
          <BannerAction>
            <button type="button">X</button>
          </BannerAction>
        </Banner>
      </div>
    </ThemeProvider>,
  );
  const leftWith = screen.getByTestId("d-with").getBoundingClientRect().left;
  const bannerLeftWith = screen.getByTestId("b-with").getBoundingClientRect().left;

  const offsetWithout = leftWithout - bannerLeftWithout;
  const offsetWith = leftWith - bannerLeftWith;
  expect(offsetWith).toBeGreaterThan(0);
  expect(offsetWith).toBe(offsetWithout);
});

// --- inline button colour: an inline link reads the description's ink ---

it("warning inline button reads the description's colour", () => {
  render(
    <ThemeProvider>
      <Banner status="warning" data-testid="banner">
        <BannerDescription data-testid="desc">
          Text{" "}
          <Button variant="link" size="inline" data-testid="inline-btn">
            Link
          </Button>
        </BannerDescription>
      </Banner>
    </ThemeProvider>,
  );

  const descColor = color(screen.getByTestId("desc"));
  const btnColor = color(screen.getByTestId("inline-btn"));
  expect(btnColor).toBe(descColor);
});

// --- action placement: actions get their own row under the text at every width ---

for (const width of [280, 600]) {
  it(`${width}px: two actions sit on their own row under the description`, () => {
    render(
      <ThemeProvider>
        <div style={{ width: `${width}px` }}>
          <Banner status="warning" data-testid="banner">
            <BannerTitle>Title</BannerTitle>
            <BannerDescription data-testid="desc">Description text</BannerDescription>
            <BannerAction data-testid="action">
              <Button variant="outline" size="xs">
                A
              </Button>
              <Button variant="outline" size="xs">
                B
              </Button>
            </BannerAction>
          </Banner>
        </div>
      </ThemeProvider>,
    );

    const descRect = screen.getByTestId("desc").getBoundingClientRect();
    const actionRect = screen.getByTestId("action").getBoundingClientRect();
    expect(actionRect.top).toBeGreaterThanOrEqual(descRect.bottom);
    // …starting on the description's left edge.
    expect(Math.abs(actionRect.left - descRect.left)).toBeLessThanOrEqual(1);
  });

  it(`${width}px: a single action sits on its own row under the description`, () => {
    render(
      <ThemeProvider>
        <div style={{ width: `${width}px` }}>
          <Banner status="warning" data-testid="banner">
            <BannerTitle>Title</BannerTitle>
            <BannerDescription data-testid="desc">Description text</BannerDescription>
            <BannerAction data-testid="action">
              <Button variant="ghost" size="icon-xs">
                X
              </Button>
            </BannerAction>
          </Banner>
        </div>
      </ThemeProvider>,
    );

    const descRect = screen.getByTestId("desc").getBoundingClientRect();
    const actionRect = screen.getByTestId("action").getBoundingClientRect();
    expect(actionRect.top).toBeGreaterThanOrEqual(descRect.bottom);
    expect(getComputedStyle(screen.getByTestId("action")).gridRowStart).not.toBe("span 2");
  });
}

it("action keeps its single-row placement when there is no description", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "600px" }}>
        <Banner status="info" data-testid="banner">
          <BannerTitle>Title</BannerTitle>
          <BannerAction data-testid="action">
            <Button variant="ghost" size="icon-xs">
              X
            </Button>
          </BannerAction>
        </Banner>
      </div>
    </ThemeProvider>,
  );

  const actionStyle = getComputedStyle(screen.getByTestId("action"));
  expect(actionStyle.gridRowStart).not.toBe("span 2");
});
