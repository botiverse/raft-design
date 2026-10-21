/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar";
import {
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorDelegatedBy,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewHeader,
} from "../message-quoted-preview";
import {
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageItemDelegatedByButton,
  MessageItemDelegatedByName,
} from "./message-item-delegated";
import { MessageItemHeader, MessageItemSender } from "./message-item-header";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

function tokens(el: Element) {
  return el.className.split(/\s+/);
}

test("the label is a span with its slot, and its words are the product's", () => {
  render(
    <MessageItemHeader data-testid="header">
      <MessageItemSender>Alice</MessageItemSender>
      <MessageItemDelegatedBy data-testid="label">
        sent by <MessageItemDelegatedByName>Friday</MessageItemDelegatedByName>
      </MessageItemDelegatedBy>
    </MessageItemHeader>,
  );
  const label = screen.getByTestId("label");
  expect(label.tagName).toBe("SPAN");
  expect(label.getAttribute("data-slot")).toBe("message-item-delegated-by");
  expect(label.textContent).toBe("sent by Friday");
  // Read with the header, in the order it shows: no hiding, no extra name.
  expect(label.getAttribute("aria-hidden")).toBeNull();
  expect(label.getAttribute("aria-label")).toBeNull();
  expect(screen.getByTestId("header").textContent).toBe("Alicesent by Friday");
});

test("the label is one step stronger than the role, never truncates as a whole and caps at 45%", () => {
  render(<MessageItemDelegatedBy data-testid="label">sent by</MessageItemDelegatedBy>);
  const t = tokens(screen.getByTestId("label"));
  expect(t).toContain("text-foreground-muted");
  expect(t).toContain("text-caption");
  expect(t).toContain("shrink-0");
  expect(t).toContain("max-w-[45%]");
  expect(t).toContain("whitespace-pre");
  expect(t).not.toContain("truncate");
});

test("only the assistant's name truncates", () => {
  render(
    <>
      <MessageItemDelegatedByName>Friday</MessageItemDelegatedByName>
      <MessageItemDelegatedByButton>Saturday</MessageItemDelegatedByButton>
    </>,
  );
  const name = screen.getByText("Friday");
  expect(name.getAttribute("data-slot")).toBe("message-item-delegated-by-name");
  expect(tokens(name)).toEqual(expect.arrayContaining(["min-w-0", "truncate"]));

  const button = screen.getByRole("button", { name: "Saturday" });
  expect(button.getAttribute("type")).toBe("button");
  expect(button.getAttribute("data-slot")).toBe("message-item-delegated-by-button");
  expect(tokens(button)).toEqual(expect.arrayContaining(["min-w-0", "truncate"]));
});

test("the name can be a link the product chooses", () => {
  render(
    <MessageItemDelegatedByButton render={<a href="#friday" />}>
      Friday
    </MessageItemDelegatedByButton>,
  );
  const link = screen.getByRole("link", { name: "Friday" });
  expect(link.getAttribute("href")).toBe("#friday");
});

function Face(props: { className?: string; "aria-hidden"?: boolean }) {
  return (
    <ThemeProvider>
      <Avatar size="md" type="human">
        <AvatarFallback>A</AvatarFallback>
        <MessageItemDelegatedAvatar data-testid="face" {...props}>
          <Avatar size="2xs" type="agent" />
        </MessageItemDelegatedAvatar>
      </Avatar>
    </ThemeProvider>
  );
}

test("the face is the avatar's corner badge, decorative, at 19px with no presence dot", () => {
  render(<Face />);
  const face = screen.getByTestId("face");
  expect(face.getAttribute("data-slot")).toBe("avatar-badge");
  expect(face.getAttribute("aria-hidden")).toBe("true");
  const t = tokens(face);
  // The light's corner and overhang stay; its size and cut-out are replaced.
  expect(t).toEqual(expect.arrayContaining(["-right-1", "-bottom-1", "absolute", "z-10"]));
  expect(t).toEqual(
    expect.arrayContaining(["size-[19px]", "group-data-[size=md]/avatar:size-[19px]"]),
  );
  expect(t).not.toContain("size-[11px]");
  expect(t).not.toContain("group-data-[size=md]/avatar:size-[11px]");
  expect(t).toContain("outline-none");
  expect(face.className).not.toMatch(/bg-success|status-color/);
  expect(face.querySelector('[data-slot="avatar"][data-size="2xs"]')).not.toBeNull();
});

test("the ring reads the row's fill over the canvas, wider in dark mode for the die-cut edge", () => {
  render(<Face />);
  const t = tokens(screen.getByTestId("face"));
  expect(t).toContain(
    "shadow-[0_0_0_1.5px_var(--mi-row-fill,transparent),0_0_0_1.5px_var(--layer-canvas)]",
  );
  expect(t).toContain(
    "dark:shadow-[0_0_0_3px_var(--mi-row-fill,transparent),0_0_0_3px_var(--layer-canvas)]",
  );
});

test("the quoted author's label is its own part that never truncates", () => {
  render(
    <MessageQuotedPreviewHeader data-testid="header">
      <MessageQuotedPreviewAuthor>
        <MessageQuotedPreviewAuthorName>Alice</MessageQuotedPreviewAuthorName>
        <MessageQuotedPreviewAuthorDelegatedBy data-testid="label">
          (sent by Friday)
        </MessageQuotedPreviewAuthorDelegatedBy>
      </MessageQuotedPreviewAuthor>
    </MessageQuotedPreviewHeader>,
  );
  const label = screen.getByTestId("label");
  expect(label.getAttribute("data-slot")).toBe("message-quoted-preview-author-delegated-by");
  expect(tokens(label)).toEqual(expect.arrayContaining(["shrink-0", "whitespace-nowrap"]));
  expect(tokens(label)).not.toContain("truncate");
  expect(tokens(screen.getByTestId("header"))).toContain(
    "has-data-[slot=message-quoted-preview-author-delegated-by]:flex-wrap",
  );
});
