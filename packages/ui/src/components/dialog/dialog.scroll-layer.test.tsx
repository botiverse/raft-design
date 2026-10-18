import "./dialog.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, act } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "../button/button";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

it("tall content stays within viewport bounds", async () => {
  render(
    <ThemeProvider>
      <Dialog open modal={false}>
        <DialogContent data-testid="content">
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody data-testid="body">
            <div style={{ height: "3000px" }}>Tall content</div>
          </DialogBody>
          <DialogFooter data-testid="footer">
            <Button>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );

  await new Promise((r) => setTimeout(r, 100));

  const content = screen.getByTestId("content");
  const rect = content.getBoundingClientRect();

  expect(rect.top).toBeGreaterThanOrEqual(0);
  expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
});

it("body is scrollable when content overflows", async () => {
  render(
    <ThemeProvider>
      <Dialog open modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody data-testid="body">
            <div style={{ height: "3000px" }}>Tall content</div>
          </DialogBody>
          <DialogFooter>
            <Button>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );

  await new Promise((r) => setTimeout(r, 100));

  const body = screen.getByTestId("body");
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
});

// header is a flex sibling outside the scroll container — this verifies
// the structural invariant, not shrink-0 (which is defensive/unobservable)
it("header is outside the scroll container and unaffected by body scroll", async () => {
  render(
    <ThemeProvider>
      <Dialog open modal={false}>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
          <DialogBody data-testid="body">
            <div style={{ height: "3000px" }}>Tall content</div>
          </DialogBody>
          <DialogFooter>
            <Button>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );

  await new Promise((r) => setTimeout(r, 100));

  const header = screen.getByTestId("header");
  const body = screen.getByTestId("body");

  const headerTopBefore = header.getBoundingClientRect().top;
  act(() => {
    body.scrollTop = 500;
  });
  const headerTopAfter = header.getBoundingClientRect().top;

  expect(headerTopAfter).toBe(headerTopBefore);
});

it("layer=1 has higher z-index than layer=0", async () => {
  render(
    <ThemeProvider>
      <Dialog open modal={false}>
        <DialogContent layer={0} data-testid="outer">
          <DialogBody>Outer</DialogBody>
        </DialogContent>
      </Dialog>
      <Dialog open modal={false}>
        <DialogContent layer={1} data-testid="inner">
          <DialogBody>Inner</DialogBody>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );

  await new Promise((r) => setTimeout(r, 100));

  const outer = screen.getByTestId("outer");
  const inner = screen.getByTestId("inner");

  const outerZ = Number(getComputedStyle(outer).zIndex);
  const innerZ = Number(getComputedStyle(inner).zIndex);

  expect(innerZ).toBeGreaterThan(outerZ);
});

it("default size has a finite max-width", async () => {
  render(
    <ThemeProvider>
      <Dialog open modal={false}>
        <DialogContent data-testid="default">
          <DialogBody>Default</DialogBody>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );

  await new Promise((r) => setTimeout(r, 100));

  const el = screen.getByTestId("default");
  const maxW = getComputedStyle(el).maxWidth;

  expect(maxW).not.toBe("none");
  expect(Number.parseFloat(maxW)).toBeGreaterThan(0);
});

it("size variant controls max-width", async () => {
  render(
    <ThemeProvider>
      <Dialog open modal={false}>
        <DialogContent size="sm" data-testid="sm">
          <DialogBody>Small</DialogBody>
        </DialogContent>
      </Dialog>
      <Dialog open modal={false}>
        <DialogContent size="lg" data-testid="lg">
          <DialogBody>Large</DialogBody>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );

  await new Promise((r) => setTimeout(r, 100));

  const sm = screen.getByTestId("sm");
  const lg = screen.getByTestId("lg");

  const smMaxW = Number.parseFloat(getComputedStyle(sm).maxWidth);
  const lgMaxW = Number.parseFloat(getComputedStyle(lg).maxWidth);

  expect(lgMaxW).toBeGreaterThan(smMaxW);
});
