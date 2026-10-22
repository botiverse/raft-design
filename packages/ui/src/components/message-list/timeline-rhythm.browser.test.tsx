import "./message-list.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "../message-item/message-item-root";
import { MessageItemAvatarSlot, MessageItemGutter } from "../message-item/message-item-gutter";
import { MessageItemBody, MessageItemContent } from "../message-item/message-item-content";
import { MessageItemHeader, MessageItemSender } from "../message-item/message-item-header";
import {
  SystemMessage,
  SystemMessageContent,
  SystemMessageGroup,
  SystemMessageGroupDisclosure,
  SystemMessageGroupHeader,
  SystemMessageGroupPanel,
  SystemMessageGroupSummary,
} from "../system-message/system-message";
import {
  ConversationPanelBody,
  ConversationPanelFooter,
  ConversationPanelRoot,
} from "../conversation-panel/conversation-panel";
import {
  ThreadPanelBody,
  ThreadPanelFooter,
  ThreadPanelOriginalMessage,
  ThreadPanelReplySummary,
  ThreadPanelRoot,
} from "../thread-panel/thread-panel";
import { Composer, ComposerInput } from "../composer/composer";
import { ComposerRoot } from "../composer/composer-root";
import { MessageList } from "./message-list";
import { MessageListDateDivider, MessageListNotice } from "./message-list-markers";

// The timeline rhythm (design/foundations/spacing.md#timeline-rhythm),
// measured text to text: 8px between the rows of a turn, 16px between turns (a sender line, an event line),
// 24px on both sides of a date line, measured to its rule, and from the
// notice at the top of the history to the date line under it.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Turn({ id }: { id: string }) {
  return (
    <MessageItem>
      <MessageItemGutter>
        <MessageItemAvatarSlot>
          <div style={{ width: 35, height: 35, background: "#eee" }} />
        </MessageItemAvatarSlot>
      </MessageItemGutter>
      <MessageItemContent>
        <MessageItemHeader data-testid={`top-${id}`}>
          <MessageItemSender>Developer</MessageItemSender>
        </MessageItemHeader>
        <MessageItemBody data-testid={`bottom-${id}`}>Short message.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

// The line box of the text: an element's content box, without its padding.
function lineBox(id: string) {
  const el = screen.getByTestId(id);
  const box = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return {
    top: box.top + parseFloat(style.paddingTop),
    bottom: box.bottom - parseFloat(style.paddingBottom),
  };
}

// The middle of the date line's 1px rule.
function rule(id: string) {
  const divider = screen.getByTestId(id);
  const line = divider.querySelector("div")!.getBoundingClientRect();
  return line.top + line.height / 2;
}

function expectGap(name: string, actual: number, expected: number) {
  expect(
    Math.abs(actual - expected),
    `${name}: ${actual.toFixed(2)}, expected ${expected}`,
  ).toBeLessThanOrEqual(0.5);
}

function Continuation({ id }: { id: string }) {
  return (
    <MessageItem compact>
      <MessageItemGutter />
      <MessageItemContent>
        <MessageItemBody data-testid={`top-${id}`}>Short follow-up.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

function Timeline() {
  return (
    <ThemeProvider>
      <div data-testid="list" className="pt-timeline-start" style={{ width: "560px" }}>
        <MessageListNotice data-testid="notice">Beginning of messages</MessageListNotice>
        <MessageListDateDivider data-testid="day-1">Monday</MessageListDateDivider>
        <Turn id="a" />
        <Continuation id="a2" />
        <SystemMessage>
          <SystemMessageContent data-testid="note">Niko joined the channel.</SystemMessageContent>
        </SystemMessage>
        <Turn id="b" />
        <MessageListDateDivider data-testid="day-2">Today</MessageListDateDivider>
        <Turn id="c" />
        <SystemMessageGroup>
          <SystemMessageGroupHeader>
            <SystemMessageGroupDisclosure>
              <SystemMessageGroupSummary data-testid="group">3 events</SystemMessageGroupSummary>
            </SystemMessageGroupDisclosure>
          </SystemMessageGroupHeader>
        </SystemMessageGroup>
        <Turn id="d" />
      </div>
    </ThemeProvider>
  );
}

async function checkRhythm() {
  render(<Timeline />);
  const note = lineBox("note");
  const group = lineBox("group");
  expectGap(
    "list top -> notice",
    lineBox("notice").top - screen.getByTestId("list").getBoundingClientRect().top,
    24,
  );
  expectGap("notice -> date line", rule("day-1") - lineBox("notice").bottom, 24);
  expectGap("date line -> turn", lineBox("top-a").top - rule("day-1"), 24);
  expectGap("turn -> its continuation", lineBox("top-a2").top - lineBox("bottom-a").bottom, 8);
  expectGap("continuation -> event line", note.top - lineBox("top-a2").bottom, 16);
  expectGap("event line -> turn", lineBox("top-b").top - note.bottom, 16);
  expectGap("turn -> date line", rule("day-2") - lineBox("bottom-b").bottom, 24);
  expectGap("date line -> next turn", lineBox("top-c").top - rule("day-2"), 24);
  expectGap("turn -> event group", group.top - lineBox("bottom-c").bottom, 16);
  expectGap("event group -> turn", lineBox("top-d").top - group.bottom, 16);
}

it("on a phone, turns sit 16px apart and a date line 24px from the text on both sides", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
  await checkRhythm();
});

it("on a desktop, turns sit 16px apart and a date line 24px from the text on both sides", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
  await checkRhythm();
});

it("an open event group keeps 6px under its header and around its lines, as before the rhythm", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
  render(
    <ThemeProvider>
      <div style={{ width: "560px" }}>
        <SystemMessageGroup defaultOpen>
          <SystemMessageGroupHeader>
            <SystemMessageGroupDisclosure data-testid="open-disclosure">
              <SystemMessageGroupSummary data-testid="open-summary">
                2 events
              </SystemMessageGroupSummary>
            </SystemMessageGroupDisclosure>
          </SystemMessageGroupHeader>
          <SystemMessageGroupPanel>
            <SystemMessage>
              <SystemMessageContent data-testid="open-line">
                Niko joined the channel.
              </SystemMessageContent>
            </SystemMessage>
          </SystemMessageGroupPanel>
        </SystemMessageGroup>
      </div>
    </ThemeProvider>,
  );
  const summary = lineBox("open-summary");
  const button = screen.getByTestId("open-disclosure").getBoundingClientRect();
  // The disclosure's overhang under its text, the header's 6px, the line's 6px.
  const expected = button.bottom - summary.bottom + 6 + 6;
  expectGap("open header -> its first line", lineBox("open-line").top - summary.bottom, expected);
});

function PanelTurn({ id }: { id: string }) {
  return <Turn id={id} />;
}

it("in a conversation panel, the composer's frame sits 24px under the last line", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
  render(
    <ThemeProvider>
      <div style={{ width: "560px", height: "600px", display: "flex" }}>
        <ConversationPanelRoot>
          <ConversationPanelBody>
            <MessageList>
              <div className="pt-timeline-start">
                <MessageListNotice data-testid="panel-notice">
                  Beginning of messages
                </MessageListNotice>
              </div>
              <div className="flex-1" />
              <PanelTurn id="p" />
              <div className="pb-timeline-end" />
            </MessageList>
          </ConversationPanelBody>
          <ConversationPanelFooter>
            <ComposerRoot>
              <Composer data-testid="panel-composer">
                <ComposerInput aria-label="Message" />
              </Composer>
            </ComposerRoot>
          </ConversationPanelFooter>
        </ConversationPanelRoot>
      </div>
    </ThemeProvider>,
  );
  const frame = screen.getByTestId("panel-composer").getBoundingClientRect().top;
  expectGap("last line -> composer frame", frame - lineBox("bottom-p").bottom, 24);
});

it("in a thread panel, the root's rule sits 24px from the text on both sides", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
  render(
    <ThemeProvider>
      <div style={{ width: "400px", height: "600px", display: "flex" }}>
        <ThreadPanelRoot>
          <ThreadPanelOriginalMessage data-testid="root">
            <Turn id="r" />
          </ThreadPanelOriginalMessage>
          <ThreadPanelBody>
            <MessageList>
              <ThreadPanelReplySummary>
                <MessageListNotice data-testid="replies-notice">
                  Beginning of replies
                </MessageListNotice>
              </ThreadPanelReplySummary>
              <div className="flex-1" />
              <Turn id="t" />
              <div className="pb-timeline-end" />
            </MessageList>
          </ThreadPanelBody>
          <ThreadPanelFooter>
            <ComposerRoot>
              <Composer data-testid="thread-composer">
                <ComposerInput aria-label="Message thread" />
              </Composer>
            </ComposerRoot>
          </ThreadPanelFooter>
        </ThreadPanelRoot>
      </div>
    </ThemeProvider>,
  );
  const root = screen.getByTestId("root");
  const ruleY =
    root.getBoundingClientRect().bottom - parseFloat(getComputedStyle(root).borderBottomWidth) / 2;
  expectGap("root -> its rule", ruleY - lineBox("bottom-r").bottom, 24);
  expectGap("rule -> replies", lineBox("replies-notice").top - ruleY, 24);
  const frame = screen.getByTestId("thread-composer").getBoundingClientRect().top;
  expectGap("last reply -> composer frame", frame - lineBox("bottom-t").bottom, 24);
});
