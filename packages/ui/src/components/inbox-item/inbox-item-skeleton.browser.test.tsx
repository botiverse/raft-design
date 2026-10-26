import "./inbox-item.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "../avatar/avatar";
import {
  ListRow,
  ListRowBody,
  ListRowBottom,
  ListRowDescription,
  ListRowMeta,
  ListRowTitle,
  ListRowTop,
} from "../list-row/list-row";
import { ListRowSkeleton } from "../list-row/list-row-skeleton";
import {
  InboxItem,
  InboxItemBody,
  InboxItemContent,
  InboxItemContext,
  InboxItemHeading,
  InboxItemLeading,
  InboxItemMarks,
  InboxItemSender,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
} from "./inbox-item";
import { InboxItemSkeleton, InboxItemSkeletonList } from "./inbox-item-skeleton";

// "Make the skeleton the same size as the content it stands for" (feedback.md):
// a skeleton row must be exactly as tall as the loaded one-line row it stands
// for, in both densities, so nothing jumps when the content arrives. Measured
// in a real browser at a phone width; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
});

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

/** Tailwind rules are injected on demand: poll until the value settles. */
async function settled(read: () => number): Promise<number> {
  let prev = Number.NaN;
  let next = read();
  for (let i = 0; i < 50 && next !== prev; i += 1) {
    prev = next;
    await new Promise((resolve) => setTimeout(resolve, 50));
    next = read();
  }
  return next;
}

async function heightsOf(loaded: ReactNode, skeleton: ReactNode) {
  render(
    <div className="flex w-[390px] flex-col">
      <div data-testid="loaded">{loaded}</div>
      <div data-testid="skeleton">{skeleton}</div>
    </div>,
  );
  const height = (id: string) => screen.getByTestId(id).getBoundingClientRect().height;
  return {
    loaded: await settled(() => height("loaded")),
    skeleton: await settled(() => height("skeleton")),
  };
}

function LoadedDefault({ context }: { context?: boolean }) {
  return (
    <InboxItem data-unread>
      <InboxItemTrigger aria-label="Open Release 0.21.2" />
      <InboxItemContent>
        {context ? (
          <InboxItemContext>
            <span className="min-w-0 truncate">#raft-ui</span>
          </InboxItemContext>
        ) : null}
        <InboxItemHeading>
          <InboxItemTitle>
            <svg aria-hidden viewBox="0 0 14 14" />
            Release 0.21.2
          </InboxItemTitle>
        </InboxItemHeading>
        <InboxItemBody>
          <InboxItemSender>Kirby: </InboxItemSender>
          Shipped.
        </InboxItemBody>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>09:18</InboxItemTimestamp>
      </InboxItemTrailing>
    </InboxItem>
  );
}

function LoadedCompact({ leading }: { leading?: boolean }) {
  return (
    <InboxItem density="compact" data-unread>
      <InboxItemTrigger aria-label="Open Atlas" />
      {leading ? (
        <InboxItemLeading>
          <Avatar size="md" type="agent">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </InboxItemLeading>
      ) : null}
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>Atlas</InboxItemTitle>
        </InboxItemHeading>
        <InboxItemBody>The deploy is green.</InboxItemBody>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>2m</InboxItemTimestamp>
        <InboxItemMarks>
          <span>2</span>
        </InboxItemMarks>
      </InboxItemTrailing>
    </InboxItem>
  );
}

it("a default skeleton row is as tall as a loaded one-line row", async () => {
  const { loaded, skeleton } = await heightsOf(<LoadedDefault />, <InboxItemSkeleton />);
  expect(loaded).toBeGreaterThan(40);
  expect(skeleton).toBe(loaded);
});

it("a default skeleton row with a context line is as tall as a loaded one with its context", async () => {
  const { loaded, skeleton } = await heightsOf(
    <LoadedDefault context />,
    <InboxItemSkeleton context />,
  );
  expect(loaded).toBeGreaterThan(60);
  expect(skeleton).toBe(loaded);
});

it("a compact skeleton row is as tall as a loaded compact row, with and without a leading avatar", async () => {
  const plain = await heightsOf(<LoadedCompact />, <InboxItemSkeleton density="compact" />);
  expect(plain.skeleton).toBe(plain.loaded);
  cleanup();
  const lead = await heightsOf(
    <LoadedCompact leading />,
    <InboxItemSkeleton density="compact" leading />,
  );
  expect(lead.loaded).toBeGreaterThan(60);
  expect(lead.skeleton).toBe(lead.loaded);
});

it("a skeleton list is as tall as the loaded list of as many rows: the list gap, no border", async () => {
  const { loaded, skeleton } = await heightsOf(
    <div className="flex flex-col gap-0.5">
      <LoadedDefault context />
      <LoadedDefault context />
      <LoadedDefault context />
    </div>,
    <InboxItemSkeletonList count={3} context delay={0} />,
  );
  expect(skeleton).toBe(loaded);
});

it("each bar sits inside its text slot", async () => {
  render(
    <div className="w-[390px]">
      <InboxItemSkeleton data-testid="row" context />
    </div>,
  );
  const row = screen.getByTestId("row");
  await settled(() => row.getBoundingClientRect().height);
  for (const slot of [
    "inbox-item-context",
    "inbox-item-title",
    "inbox-item-body",
    "inbox-item-timestamp",
  ]) {
    const box = row.querySelector(`[data-slot=${slot}]`)!.getBoundingClientRect();
    const bar = row
      .querySelector(`[data-slot=${slot}] [data-slot=skeleton]`)!
      .getBoundingClientRect();
    expect(bar.width, slot).toBeGreaterThan(0);
    expect(bar.height, slot).toBeGreaterThan(0);
    expect(bar.top, slot).toBeGreaterThanOrEqual(box.top);
    expect(bar.bottom, slot).toBeLessThanOrEqual(box.bottom);
  }
});

it("a ListRow skeleton is as tall as a loaded row, default and plain", async () => {
  const conversation = await heightsOf(
    <ListRow>
      <Avatar size="md" type="agent">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <ListRowBody>
        <ListRowTop>
          <ListRowTitle>Atlas</ListRowTitle>
          <ListRowMeta>2m</ListRowMeta>
        </ListRowTop>
        <ListRowBottom>
          <ListRowDescription>The deploy is green.</ListRowDescription>
        </ListRowBottom>
      </ListRowBody>
    </ListRow>,
    <ListRowSkeleton />,
  );
  expect(conversation.skeleton).toBe(conversation.loaded);
  cleanup();
  const setting = await heightsOf(
    <ListRow variant="plain">
      <ListRowBody>
        <ListRowTop>
          <ListRowTitle>Notifications</ListRowTitle>
        </ListRowTop>
      </ListRowBody>
    </ListRow>,
    <ListRowSkeleton variant="plain" />,
  );
  expect(setting.skeleton).toBe(setting.loaded);
});
