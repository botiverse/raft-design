// @ts-expect-error — CSS side-effect import for browser test only
import "./banner.test.css";
import { afterEach, expect, test } from "vitest";
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

it("brutal description left edge is the same with and without BannerAction", () => {
  const { unmount } = render(
    <ThemeProvider theme="brutal">
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
    <ThemeProvider theme="brutal">
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

// --- inline button color: elegant warning description buttons inherit semantic orange ---

it("elegant warning inline button inherits description color, not default foreground", () => {
  render(
    <ThemeProvider theme="elegant">
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

it("elegant warning BannerAction button does NOT inherit description color", () => {
  render(
    <ThemeProvider theme="elegant">
      <Banner status="warning" data-testid="banner">
        <BannerDescription data-testid="desc">Text</BannerDescription>
        <BannerAction>
          <Button variant="ghost" size="icon-xs" data-testid="action-btn">
            X
          </Button>
        </BannerAction>
      </Banner>
    </ThemeProvider>,
  );

  const descColor = color(screen.getByTestId("desc"));
  const actionBtnColor = color(screen.getByTestId("action-btn"));
  expect(actionBtnColor).not.toBe(descColor);
});

it("elegant warning description is a different color from brutal warning description", () => {
  const { unmount } = render(
    <ThemeProvider theme="elegant">
      <Banner status="warning" data-testid="banner">
        <BannerDescription data-testid="desc">Text</BannerDescription>
      </Banner>
    </ThemeProvider>,
  );
  const elegantColor = color(screen.getByTestId("desc"));
  unmount();

  render(
    <ThemeProvider theme="brutal">
      <Banner status="warning" data-testid="banner">
        <BannerDescription data-testid="desc">Text</BannerDescription>
      </Banner>
    </ThemeProvider>,
  );
  const brutalColor = color(screen.getByTestId("desc"));

  expect(elegantColor).not.toBe(brutalColor);
});

// --- action wrapping: narrow wraps, wide stays inline (both themes) ---

for (const theme of ["brutal", "elegant"] as const) {
  it(`${theme}: two actions wrap to a new row at narrow container width`, () => {
    render(
      <ThemeProvider theme={theme}>
        <div style={{ width: "280px" }}>
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
    expect(actionRect.top).toBeGreaterThan(descRect.top);
  });

  it(`${theme}: single action wraps to a new row at narrow container width`, () => {
    render(
      <ThemeProvider theme={theme}>
        <div style={{ width: "280px" }}>
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
    expect(actionRect.top).toBeGreaterThan(descRect.top);
  });

  it(`${theme}: single action stays on the description row at wide container width`, () => {
    render(
      <ThemeProvider theme={theme}>
        <div style={{ width: "600px" }}>
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
    expect(actionRect.top).toBeLessThanOrEqual(descRect.bottom);
  });

  it(`${theme}: two actions stay on the description row at wide container width`, () => {
    render(
      <ThemeProvider theme={theme}>
        <div style={{ width: "600px" }}>
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
    expect(actionRect.top).toBeLessThanOrEqual(descRect.bottom);
  });
}
