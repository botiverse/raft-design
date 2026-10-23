/**
 * @vitest-environment jsdom
 *
 * Pins the parts an app link is built from (message-item.md, App links):
 * `capped` stops a chip, or the pending chip that precedes it, at
 * min(100%, 24em), and only when passed, so every existing chip keeps its
 * `max-w-full`; `MessageReferenceIcon` boxes a non-svg icon (an app's image)
 * at 14px, centred, and the chip counts it as a leading mark, as it does an
 * svg: 4.5px at each end (lib/inline-chip.ts). The ink itself is measured in
 * chip-ink.browser.test.tsx.
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  MessageReferenceChip,
  MessageReferenceIcon,
  MessageReferenceLabel,
  MessageReferencePending,
} from "./message-reference";

afterEach(cleanup);

const CAP = "max-w-[min(100%,24em)]";

function tokens(el: Element) {
  return el.className.split(/\s+/);
}

describe("capped", () => {
  test("is off by default: a chip keeps the full line, as before", () => {
    render(
      <>
        <MessageReferenceChip data-testid="plain" variant="info">
          #launch-week
        </MessageReferenceChip>
        <MessageReferenceChip data-testid="off" variant="info" capped={false}>
          #launch-week
        </MessageReferenceChip>
        <MessageReferencePending data-testid="pending">#launch-week</MessageReferencePending>
      </>,
    );
    for (const id of ["plain", "off", "pending"]) {
      const classes = tokens(screen.getByTestId(id));
      expect(classes).toContain("max-w-full");
      expect(classes).not.toContain(CAP);
    }
    expect(screen.getByTestId("off").className).toBe(screen.getByTestId("plain").className);
  });

  test("caps the chip and the pending chip at the same width", () => {
    render(
      <>
        <MessageReferenceChip data-testid="chip" variant="info" capped>
          <MessageReferenceLabel>refactor(i18n): one display-locale source</MessageReferenceLabel>
        </MessageReferenceChip>
        <MessageReferencePending data-testid="pending" capped>
          <MessageReferenceLabel>stamp.build/botiverse/slock/pull/10449</MessageReferenceLabel>
        </MessageReferencePending>
      </>,
    );
    for (const id of ["chip", "pending"]) {
      const classes = tokens(screen.getByTestId(id));
      expect(classes).toContain(CAP);
      expect(classes).not.toContain("max-w-full");
      expect(classes).toContain("truncate");
    }
  });
});

describe("MessageReferenceIcon", () => {
  test("boxes the node it is given at 14px, centred, as the chip's leading mark", () => {
    render(
      <MessageReferenceChip data-testid="chip" variant="info" capped>
        <MessageReferenceIcon data-testid="icon">
          <img src="/app-icons/stamp.svg" alt="" />
        </MessageReferenceIcon>
        <MessageReferenceLabel>refactor(i18n): one display-locale source</MessageReferenceLabel>
      </MessageReferenceChip>,
    );
    const icon = screen.getByTestId("icon");
    expect(icon.tagName).toBe("SPAN");
    expect(icon.getAttribute("data-slot")).toBe("message-reference-icon");
    expect(icon.querySelector("img")?.getAttribute("src")).toBe("/app-icons/stamp.svg");
    const classes = tokens(icon);
    for (const name of ["size-3.5", "shrink-0", "self-center", "*:size-full"]) {
      expect(classes).toContain(name);
    }
    expect(classes.some((name) => name.startsWith("ml-") || name.startsWith("-ml-"))).toBe(false);
    expect(tokens(screen.getByTestId("chip"))).toContain(
      "has-[>svg,>[data-slot=spinner],>[data-slot=message-reference-icon]]:px-[4.5px]",
    );
  });

  test("renders a product's element through render", () => {
    render(
      <MessageReferenceIcon data-testid="icon" render={<i />}>
        <img src="/app-icons/stamp.svg" alt="" />
      </MessageReferenceIcon>,
    );
    const icon = screen.getByTestId("icon");
    expect(icon.tagName).toBe("I");
    expect(tokens(icon)).toContain("size-3.5");
  });
});
