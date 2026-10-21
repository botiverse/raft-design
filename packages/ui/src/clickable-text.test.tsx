/**
 * @vitest-environment jsdom
 */
/**
 * Clickable text contract (design/foundations/states.md#clickable-text).
 *
 * Text that can be clicked, with no box around it, shows no underline at rest
 * and underlines in its own colour on hover; nothing turns pink on hover. The
 * one exception is the Markdown link, which keeps a quieter underline at rest.
 * jsdom applies no CSS, so these assert the declared classes.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { ComponentProps } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { EmptyStateDescription } from "./components/empty-state/empty-state";
import { markdown } from "./components/markdown/markdown.recipe";
import {
  MessageItemDelegatedByButton,
  MessageItemDelegatedByName,
  MessageItemSender,
  MessageItemSenderButton,
} from "./components/message-item";
import { MessageReferenceText } from "./components/message-item/message-reference";
import { MessageForwardedBundleFooterAction } from "./components/message-forwarded-bundle/message-forwarded-bundle";
import {
  MessageItemTranslationAction,
  MessageItemTranslationRetryAction,
} from "./components/message-translation/message-translation";
import { TextLink } from "./components/text-link/text-link";
import { toast, ToastProvider } from "./components/toast/toast";

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

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
  cleanup();
});

function tokens(cls: string): string[] {
  return cls.split(/\s+/).filter(Boolean);
}

/** No underline at rest, an underline on (enabled) hover, nothing pink. */
function expectHoverUnderline(cls: string) {
  const t = tokens(cls);
  expect(t, cls).not.toContain("underline");
  expect(
    t.some((c) => /^(?:not-[\w-]+:)*hover:underline$/.test(c)),
    `${cls} must underline on hover`,
  ).toBe(true);
  expect(cls).not.toMatch(/attention/);
}

test("TextLink: no underline at rest and an underline on hover, in both variants", () => {
  render(
    <>
      <TextLink>Sign Out</TextLink>
      <TextLink variant="strong">Create One</TextLink>
    </>,
  );
  for (const link of screen.getAllByRole("button")) expectHoverUnderline(link.className);
});

test("TextLink: the hover underline is gated off when disabled", () => {
  render(<TextLink disabled>Sign Out</TextLink>);
  const t = tokens(screen.getByRole("button").className);
  expect(t).toContain("not-disabled:hover:underline");
  expect(t).not.toContain("hover:underline");
});

test("Markdown link: the one clickable text underlined at rest, never pink", () => {
  const t = tokens(markdown().link());
  expect(t).toContain("underline");
  expect(t).toContain("decoration-foreground-link/40");
  expect(t).toContain("hover:decoration-current");
  expect(t.join(" ")).not.toMatch(/attention/);
  expect(t).not.toContain("font-medium");
});

test("a mention of someone else underlines in ink only on hover", () => {
  render(<MessageReferenceText variant="secondary">@Martin</MessageReferenceText>);
  const cls = screen.getByText("@Martin").className;
  expectHoverUnderline(cls);
  expect(tokens(cls)).toContain("decoration-foreground");
  expect(tokens(cls)).toContain("font-bold");
});

test("translation actions underline only on hover", () => {
  render(
    <>
      <MessageItemTranslationAction>Show Original</MessageItemTranslationAction>
      <MessageItemTranslationRetryAction>Retry</MessageItemTranslationRetryAction>
    </>,
  );
  for (const action of screen.getAllByRole("button")) expectHoverUnderline(action.className);
});

test("the forwarded bundle's footer action underlines only on hover", () => {
  render(
    <MessageForwardedBundleFooterAction>Show All 6 Messages</MessageForwardedBundleFooterAction>,
  );
  expectHoverUnderline(screen.getByRole("button").className);
});

test("a link in an empty state's description underlines only on hover", () => {
  render(
    <EmptyStateDescription>
      Nothing here yet. <a href="#help">Learn More</a>
    </EmptyStateDescription>,
  );
  const t = tokens(screen.getByText(/Nothing here yet/).className);
  expect(t).not.toContain("[&>a]:underline");
  // The hover: variant (not a bare :hover in the selector) keeps Tailwind's
  // @media (hover: hover) guard, so a tap on a phone doesn't leave it stuck.
  expect(t).toContain("[&>a]:hover:underline");
  expect(t.join(" ")).not.toMatch(/:hover\]/);
  expect(t.join(" ")).not.toMatch(/attention/);
});

test("a toast's action and close are bold text that underlines only on hover", async () => {
  render(
    <ThemeProvider>
      <ToastProvider />
    </ThemeProvider>,
  );
  act(() => {
    toast.success("Message sent", { action: { label: "View" }, dismissible: true });
  });
  await screen.findByText("Message sent");
  const action = document.querySelector('[data-slot="toast-action"]');
  const close = document.querySelector('[data-slot="toast-close"]');
  expect(action, "toast action must render").not.toBeNull();
  expect(close, "toast close must render").not.toBeNull();
  expectHoverUnderline(action!.className);
  expectHoverUnderline(close!.className);
});

// Stands in for a Tooltip trigger: a wrapper that puts its own data-slot on
// the element it renders.
function renderAsTooltipTrigger(props: ComponentProps<"a">) {
  return <a {...props} href="#martin" data-slot="tooltip-trigger" />;
}

test("the sender button underlines on hover even when a wrapper replaces its data-slot", () => {
  render(
    <>
      <MessageItemSenderButton render={renderAsTooltipTrigger}>Martin</MessageItemSenderButton>
      <MessageItemSender>Bugen</MessageItemSender>
    </>,
  );
  const button = screen.getByText("Martin");
  expect(button.getAttribute("data-slot")).toBe("tooltip-trigger");
  expect(button.className).not.toMatch(/data-\[slot=/);
  expect(tokens(button.className)).toContain("hover:underline");
  expect(tokens(button.className)).toContain("cursor-pointer");

  const plain = screen.getByText("Bugen").className;
  expect(plain).not.toMatch(/underline/);
  expect(tokens(plain)).not.toContain("cursor-pointer");
});

test("the assistant's name in a delegated label underlines on hover only when it opens something", () => {
  render(
    <>
      <MessageItemDelegatedByButton>Friday</MessageItemDelegatedByButton>
      <MessageItemDelegatedByName>a deleted assistant</MessageItemDelegatedByName>
    </>,
  );
  expectHoverUnderline(screen.getByRole("button").className);
  expect(tokens(screen.getByRole("button").className)).toContain("cursor-pointer");
  expect(screen.getByText("a deleted assistant").className).not.toMatch(/underline/);
});

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(?:ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

test("no text in raft-ui turns pink on hover", () => {
  const offenders = sources(join(__dirname, "components")).filter((path) =>
    /hover:(?:decoration|text)-attention/.test(readFileSync(path, "utf8")),
  );
  expect(offenders).toEqual([]);
});

test("no hover in raft-ui is a bare :hover selector, which a tap on a phone leaves stuck", () => {
  // `[&>tr:hover]:x` skips Tailwind v4's @media (hover: hover) guard; write
  // `[&>tr]:hover:x` instead. When the hover is on a child (`has-[…:hover]`),
  // `hover:` can't say it: prefix `[@media(hover:hover)]:` to keep the guard.
  const offenders = sources(__dirname).flatMap((path) =>
    readFileSync(path, "utf8")
      .split(/[\s"'`]+/)
      .filter((token) => token.includes(":hover]") && !token.startsWith("[@media(hover:hover)]:"))
      .map((token) => `${relative(__dirname, path)}: ${token}`),
  );
  expect(offenders).toEqual([]);
});

test("the video failure action is clickable text: underline on hover", async () => {
  const { messageVideoPreview } =
    await import("./components/message-attachment/message-video-preview.recipe");
  const t = messageVideoPreview().failureAction().split(/\s+/);
  expect(t).toContain("hover:underline");
  expect(t).not.toContain("underline");
});
