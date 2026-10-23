import "./banner.test.css";
import { afterAll, afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Banner, BannerAction, BannerClose, BannerDescription, BannerTitle } from "./banner";
import { Button } from "../button/button";
import { TextLink } from "../text-link/text-link";

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
          <TextLink variant="strong" data-testid="inline-btn">
            Link
          </TextLink>
        </BannerDescription>
      </Banner>
    </ThemeProvider>,
  );

  const descColor = color(screen.getByTestId("desc"));
  const btnColor = color(screen.getByTestId("inline-btn"));
  expect(btnColor).toBe(descColor);
});

// --- action placement: bottom right, beside the last line, or a line of their own ---

function contentEnd(banner: Element): number {
  return (
    banner.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(banner).paddingRight)
  );
}

function lineHeight(el: Element): number {
  return Number.parseFloat(getComputedStyle(el).lineHeight);
}

/** The vertical center of an element's last line of text. */
function lastLineCenter(el: Element): number {
  return el.getBoundingClientRect().bottom - lineHeight(el) / 2;
}

/** The vertical center of an element's first line of text. */
function firstLineCenter(el: Element): number {
  return el.getBoundingClientRect().top + lineHeight(el) / 2;
}

function centerY(el: Element): number {
  const r = el.getBoundingClientRect();
  return (r.top + r.bottom) / 2;
}

function ActionBanner({
  width,
  title,
  text = "Pin the threads you follow.",
}: {
  width: number;
  title?: boolean;
  text?: string;
}) {
  return (
    <ThemeProvider>
      <div style={{ width: `${width}px` }} data-testid="frame">
        <Banner status="info" data-testid="banner">
          <svg data-testid="icon" />
          {title ? (
            <BannerTitle data-testid="title">Threads now show in the sidebar</BannerTitle>
          ) : null}
          <BannerDescription data-testid="desc">{text}</BannerDescription>
          <BannerAction data-testid="action">
            <Button variant="ghost" size="md">
              Dismiss
            </Button>
            <Button variant="default" size="md" data-testid="main">
              Show Me
            </Button>
          </BannerAction>
        </Banner>
      </div>
    </ThemeProvider>
  );
}

it("600px: the actions end on the banner's content edge, centered on the one line of text", () => {
  render(<ActionBanner width={600} />);
  const banner = screen.getByTestId("banner");
  const desc = screen.getByTestId("desc");
  const main = screen.getByTestId("main");
  expect(Math.abs(main.getBoundingClientRect().right - contentEnd(banner))).toBeLessThanOrEqual(
    0.5,
  );
  expect(Math.abs(centerY(main) - lastLineCenter(desc))).toBeLessThanOrEqual(0.5);
  expect(desc.getBoundingClientRect().height).toBe(lineHeight(desc));
  // Beside the text, so the banner is no taller than its one line.
  expect(main.getBoundingClientRect().left).toBeGreaterThan(desc.getBoundingClientRect().right);
});

it("600px: with a title, the actions sit beside the description, not the title", () => {
  render(<ActionBanner width={600} title />);
  const banner = screen.getByTestId("banner");
  const desc = screen.getByTestId("desc");
  const title = screen.getByTestId("title");
  const main = screen.getByTestId("main");
  expect(Math.abs(main.getBoundingClientRect().right - contentEnd(banner))).toBeLessThanOrEqual(
    0.5,
  );
  expect(Math.abs(centerY(main) - lastLineCenter(desc))).toBeLessThanOrEqual(0.5);
  expect(centerY(main)).toBeGreaterThan(title.getBoundingClientRect().bottom);
});

it("479px banner: the actions take a line of their own under the text, aligned to the end", () => {
  render(<ActionBanner width={479} />);
  const banner = screen.getByTestId("banner");
  const desc = screen.getByTestId("desc");
  const main = screen.getByTestId("main");
  // Short enough to fit beside them; the width alone sends them down.
  expect(desc.getBoundingClientRect().height).toBe(lineHeight(desc));
  expect(screen.getByTestId("action").getBoundingClientRect().top).toBeGreaterThanOrEqual(
    desc.getBoundingClientRect().bottom,
  );
  expect(Math.abs(main.getBoundingClientRect().right - contentEnd(banner))).toBeLessThanOrEqual(
    0.5,
  );
});

const LONG =
  "Older messages are kept and come back when the server moves to Pro, so nothing in this channel is lost while it waits.";

it("700px: text that would wrap beside the actions keeps its line, and the actions go under it", () => {
  render(<ActionBanner width={700} text={LONG} />);
  const banner = screen.getByTestId("banner");
  const desc = screen.getByTestId("desc");
  const main = screen.getByTestId("main");
  expect(screen.getByTestId("action").getBoundingClientRect().top).toBeGreaterThanOrEqual(
    desc.getBoundingClientRect().bottom,
  );
  expect(Math.abs(main.getBoundingClientRect().right - contentEnd(banner))).toBeLessThanOrEqual(
    0.5,
  );
  // The text runs to the content edge, not to where the actions would start.
  expect(desc.getBoundingClientRect().right).toBeCloseTo(contentEnd(banner), 0);
});

it("the actions come back beside the text when the banner grows wide enough", async () => {
  render(<ActionBanner width={700} text={LONG} />);
  const desc = screen.getByTestId("desc");
  const action = screen.getByTestId("action");
  expect(action.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    desc.getBoundingClientRect().bottom,
  );
  screen.getByTestId("frame").style.width = "1400px";
  await vi.waitFor(() => {
    expect(desc.getBoundingClientRect().height).toBe(lineHeight(desc));
    expect(
      Math.abs(centerY(screen.getByTestId("main")) - lastLineCenter(desc)),
    ).toBeLessThanOrEqual(0.5);
  });
  screen.getByTestId("frame").style.width = "700px";
  await vi.waitFor(() => {
    expect(action.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      desc.getBoundingClientRect().bottom,
    );
  });
});

it("a title with no description: the actions center on the title's line", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "600px" }}>
        <Banner status="info" data-testid="banner">
          <BannerTitle data-testid="title">Title</BannerTitle>
          <BannerAction>
            <Button variant="default" size="md" data-testid="main">
              Retry
            </Button>
          </BannerAction>
        </Banner>
      </div>
    </ThemeProvider>,
  );
  const title = screen.getByTestId("title");
  expect(
    Math.abs(centerY(screen.getByTestId("main")) - firstLineCenter(title)),
  ).toBeLessThanOrEqual(0.5);
});

// --- BannerClose: the × at the end of the first line ---

for (const [width, size] of [
  [600, "md"],
  [360, "md"],
  [600, "sm"],
] as const) {
  it(`${width}px ${size}: the × centers on the first line and its icon box ends on the padding`, () => {
    render(
      <ThemeProvider>
        <div style={{ width: `${width}px` }}>
          <Banner status="info" size={size} data-testid="banner">
            <svg />
            <BannerTitle data-testid="title">Press ⌘K to jump to any channel</BannerTitle>
            <BannerDescription>
              Or to any person or agent, from anywhere in Raft, without leaving the keyboard.
            </BannerDescription>
            <BannerClose data-testid="close" />
          </Banner>
        </div>
      </ThemeProvider>,
    );
    const banner = screen.getByTestId("banner");
    const close = screen.getByTestId("close");
    const glyph = close.querySelector("svg")!;
    expect(close.getAttribute("aria-label")).toBe("Dismiss");
    expect(
      Math.abs(centerY(close) - firstLineCenter(screen.getByTestId("title"))),
    ).toBeLessThanOrEqual(0.5);
    expect(Math.abs(glyph.getBoundingClientRect().right - contentEnd(banner))).toBeLessThanOrEqual(
      0.5,
    );
    // The 32px hit area doesn't make the first line taller.
    expect(
      screen.getByTestId("title").getBoundingClientRect().top - banner.getBoundingClientRect().top,
    ).toBe(Number.parseFloat(getComputedStyle(banner).paddingTop));
  });
}

it("600px: a × beside a button never shares its column; the button takes a line of its own", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render(
    <ThemeProvider>
      <div style={{ width: "600px" }}>
        <Banner status="info" data-testid="banner">
          <svg />
          <BannerDescription data-testid="desc">Pin the threads you follow.</BannerDescription>
          <BannerAction data-testid="action">
            <Button variant="default" size="md" data-testid="main">
              Show Me
            </Button>
          </BannerAction>
          <BannerClose data-testid="close" />
        </Banner>
      </div>
    </ThemeProvider>,
  );
  const banner = screen.getByTestId("banner");
  const desc = screen.getByTestId("desc");
  const close = screen.getByTestId("close").getBoundingClientRect();
  const main = screen.getByTestId("main").getBoundingClientRect();
  expect(
    Math.abs(centerY(screen.getByTestId("close")) - firstLineCenter(desc)),
  ).toBeLessThanOrEqual(0.5);
  expect(screen.getByTestId("action").getBoundingClientRect().top).toBeGreaterThanOrEqual(
    desc.getBoundingClientRect().bottom,
  );
  expect(main.top).toBeGreaterThanOrEqual(close.bottom);
  expect(Math.abs(main.right - contentEnd(banner))).toBeLessThanOrEqual(0.5);
  expect(screen.getByTestId("action").contains(screen.getByTestId("close"))).toBe(false);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("BannerClose"));
  warn.mockRestore();
});

it("600px: an unbroken URL wraps inside the text column instead of running under the actions", () => {
  render(
    <ActionBanner
      width={600}
      text="https://raft.example.com/servers/acme/channels/design/threads/0123456789abcdefghijklmnopqrstuvwxyz"
    />,
  );
  const desc = screen.getByTestId("desc");
  const banner = screen.getByTestId("banner");
  expect(desc.scrollWidth).toBeLessThanOrEqual(desc.clientWidth);
  expect(desc.getBoundingClientRect().right).toBeLessThanOrEqual(contentEnd(banner) + 0.5);
  expect(screen.getByTestId("action").getBoundingClientRect().top).toBeGreaterThanOrEqual(
    desc.getBoundingClientRect().bottom,
  );
});

it("600px: a title runs on over the actions' column, so it doesn't wrap early", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "600px" }}>
        <Banner status="info" data-testid="banner">
          <svg />
          <BannerTitle data-testid="title">
            Threads you follow now show in the sidebar, pinned
          </BannerTitle>
          <BannerDescription data-testid="desc">Pin the threads you follow.</BannerDescription>
          <BannerAction data-testid="action">
            <Button variant="ghost" size="md">
              Dismiss
            </Button>
            <Button variant="default" size="md" data-testid="main">
              Show Me
            </Button>
          </BannerAction>
        </Banner>
      </div>
    </ThemeProvider>,
  );
  const title = screen.getByTestId("title");
  const desc = screen.getByTestId("desc");
  expect(title.getBoundingClientRect().height).toBe(lineHeight(title));
  expect(title.getBoundingClientRect().right).toBeGreaterThan(
    screen.getByTestId("action").getBoundingClientRect().left,
  );
  expect(Math.abs(centerY(screen.getByTestId("main")) - lastLineCenter(desc))).toBeLessThanOrEqual(
    0.5,
  );
});

it("600px sm: a 32px button beside the line keeps clear of the banner's edges", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "600px" }}>
        <Banner status="warning" size="sm" data-testid="banner">
          <svg />
          <BannerDescription data-testid="desc">Couldn&rsquo;t load tasks.</BannerDescription>
          <BannerAction>
            <Button variant="default" size="md" data-testid="main">
              Retry
            </Button>
          </BannerAction>
        </Banner>
      </div>
    </ThemeProvider>,
  );
  const banner = screen.getByTestId("banner").getBoundingClientRect();
  const main = screen.getByTestId("main").getBoundingClientRect();
  const desc = screen.getByTestId("desc");
  expect(Math.abs(centerY(screen.getByTestId("main")) - lastLineCenter(desc))).toBeLessThanOrEqual(
    0.5,
  );
  expect(main.top - banner.top).toBeGreaterThanOrEqual(4);
  expect(banner.bottom - main.bottom).toBeGreaterThanOrEqual(4);
});

it("600px sm: the ×'s hover fill keeps clear of the banner's edges", () => {
  render(
    <ThemeProvider>
      <div style={{ width: "600px" }}>
        <Banner status="success" size="sm" data-testid="banner">
          <svg />
          <BannerDescription data-testid="desc">Changed the model of 4 agents.</BannerDescription>
          <BannerClose data-testid="close" />
        </Banner>
      </div>
    </ThemeProvider>,
  );
  const banner = screen.getByTestId("banner").getBoundingClientRect();
  const close = screen.getByTestId("close").getBoundingClientRect();
  expect(
    Math.abs(centerY(screen.getByTestId("close")) - firstLineCenter(screen.getByTestId("desc"))),
  ).toBeLessThanOrEqual(0.5);
  expect(close.top - banner.top).toBeGreaterThanOrEqual(4);
  expect(banner.bottom - close.bottom).toBeGreaterThanOrEqual(4);
});

// --- type: a banner's text is never smaller than its button's label, at every size ---

async function device(width: number, pointer: "fine" | "coarse") {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 900);
  // Turning touch emulation off leaves no fine pointer, so the desktop cases
  // run first and never turn it on.
  if (pointer === "coarse") {
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: pointer }],
  });
  await expect.poll(() => matchMedia("(pointer: fine)").matches).toBe(pointer === "fine");
}

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

function fontSize(el: Element): number {
  return Number.parseFloat(getComputedStyle(el).fontSize);
}

for (const [name, width, pointer] of [
  ["desktop", 1280, "fine"],
  ["phone", 390, "coarse"],
] as const) {
  for (const size of ["sm", "md", "lg"] as const) {
    it(`${name} ${size}: the text is the size of the 32px button's label or larger, the same as md`, async () => {
      await device(width, pointer);
      render(
        <ThemeProvider>
          <div style={{ width: "360px" }}>
            <Banner status="warning" size={size} data-testid="banner">
              <svg />
              <BannerTitle data-testid="title">Notifications are off</BannerTitle>
              <BannerDescription data-testid="desc">
                Turn them on to hear about replies.
              </BannerDescription>
              <BannerAction>
                <Button variant="default" size="md" data-testid="main">
                  Turn On
                </Button>
              </BannerAction>
            </Banner>
            <Banner status="warning" size="md" data-testid="md">
              <BannerDescription data-testid="md-desc">Turn them on.</BannerDescription>
            </Banner>
          </div>
        </ThemeProvider>,
      );
      const label = fontSize(screen.getByTestId("main"));
      for (const id of ["desc", "title"]) {
        const text = fontSize(screen.getByTestId(id));
        expect(text).toBeGreaterThanOrEqual(label);
        expect(text).toBe(fontSize(screen.getByTestId("md-desc")));
        expect(lineHeight(screen.getByTestId(id))).toBe(lineHeight(screen.getByTestId("md-desc")));
      }
      // On a desktop the label is 14px, the size of the text beside it.
      if (pointer === "fine") expect(fontSize(screen.getByTestId("desc"))).toBe(label);
    });
  }

  it(`${name} sm: a 32px button beside the line centers on it, as far from the top as from the bottom`, async () => {
    await device(width, pointer);
    render(
      <ThemeProvider>
        <div style={{ width: "600px" }}>
          <Banner status="warning" size="sm" data-testid="banner">
            <svg />
            <BannerDescription data-testid="desc">Couldn&rsquo;t load tasks.</BannerDescription>
            <BannerAction data-testid="action">
              <Button variant="default" size="md" data-testid="main">
                Retry
              </Button>
            </BannerAction>
          </Banner>
        </div>
      </ThemeProvider>,
    );
    const banner = screen.getByTestId("banner").getBoundingClientRect();
    const main = screen.getByTestId("main").getBoundingClientRect();
    const desc = screen.getByTestId("desc");
    expect(main.left).toBeGreaterThan(desc.getBoundingClientRect().right);
    expect(
      Math.abs(centerY(screen.getByTestId("main")) - lastLineCenter(desc)),
    ).toBeLessThanOrEqual(0.5);
    expect(Math.abs(main.top - banner.top - (banner.bottom - main.bottom))).toBeLessThanOrEqual(
      0.5,
    );
    expect(main.top - banner.top).toBeGreaterThanOrEqual(4);
  });
}
