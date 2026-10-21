import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarBadge, AvatarFallback } from "../avatar";
import { MessageItem } from "./message-item-root";
import { MessageItemAvatarSlot } from "./message-item-gutter";
import { MessageItemContent } from "./message-item-content";
import {
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
} from "./message-item-header";
import {
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageItemDelegatedByName,
} from "./message-item-delegated";

// A message an assistant sent for its owner (RFC 077). The words of "sent by
// Friday" never truncate while the names around them do, and the label never
// takes more than 45% of the line. The assistant's face sits on the owner's
// avatar exactly where an md presence light sits, at 19px, ringed with the
// row's surface. Measured in a real browser.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Row({
  width,
  owner,
  role,
  label,
}: {
  width: number;
  owner: string;
  role?: string;
  label: ReactNode;
}) {
  return (
    <ThemeProvider>
      <div style={{ width }}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader data-testid="header">
              <MessageItemSenderGroup>
                <MessageItemSender data-testid="owner">{owner}</MessageItemSender>
                {role ? <MessageItemMeta>{role}</MessageItemMeta> : null}
              </MessageItemSenderGroup>
              <MessageItemDelegatedBy data-testid="label">{label}</MessageItemDelegatedBy>
              <MessageItemTime data-testid="time">10:42</MessageItemTime>
            </MessageItemHeader>
          </MessageItemContent>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

/** Each run of words directly in the label, with its laid-out and natural width. */
function words(label: HTMLElement) {
  const probe = document.createElement("span");
  probe.className = label.className;
  probe.style.cssText = "position:absolute;visibility:hidden;max-width:none";
  document.body.append(probe);
  const out = [...label.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim())
    .map((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      probe.textContent = node.textContent;
      return { text: node.textContent!, rect, natural: probe.getBoundingClientRect().width };
    });
  probe.remove();
  return out;
}

function expectWordsWhole(label: HTMLElement) {
  const labelRect = label.getBoundingClientRect();
  for (const run of words(label)) {
    // Laid out at its full width, on one line, inside the label's box.
    expect(run.rect.width, run.text).toBeGreaterThanOrEqual(run.natural - 0.5);
    expect(run.rect.height, run.text).toBeLessThan(labelRect.height + 1);
    expect(run.rect.left, run.text).toBeGreaterThanOrEqual(labelRect.left - 0.5);
    expect(run.rect.right, run.text).toBeLessThanOrEqual(labelRect.right + 0.5);
  }
}

function truncated(el: HTMLElement) {
  return el.scrollWidth > el.clientWidth + 1;
}

it("the words never truncate; the assistant's name does, within 45% of the line", () => {
  render(
    <Row
      width={560}
      owner="Alexandra Konstantinopoulou"
      role="Product & Brand · APAC"
      label={
        <>
          sent by{" "}
          <MessageItemDelegatedByName data-testid="name">
            Friday Release Coordinator for the Launch Week
          </MessageItemDelegatedByName>
        </>
      }
    />,
  );
  const header = screen.getByTestId("header");
  const label = screen.getByTestId("label");
  const name = screen.getByTestId("name");
  const owner = screen.getByTestId("owner");

  expectWordsWhole(label);
  expect(truncated(name)).toBe(true);
  expect(truncated(owner)).toBe(true);

  const style = getComputedStyle(header);
  const line = header.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(line * 0.45 + 0.5);
  // Nothing overlaps: the owner, then the label, then the time.
  expect(owner.getBoundingClientRect().right).toBeLessThanOrEqual(
    label.getBoundingClientRect().left + 0.5,
  );
  expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(
    screen.getByTestId("time").getBoundingClientRect().left + 0.5,
  );
});

it("words on both sides of the name (由 … 代发) stay whole on a narrow line", () => {
  render(
    <Row
      width={300}
      owner="Alexandra Konstantinopoulou"
      label={
        <>
          由{" "}
          <MessageItemDelegatedByName data-testid="name">
            Friday Release Coordinator
          </MessageItemDelegatedByName>{" "}
          代发
        </>
      }
    />,
  );
  const label = screen.getByTestId("label");
  expect(words(label).map((run) => run.text.trim())).toEqual(["由", "代发"]);
  expectWordsWhole(label);
  expect(truncated(screen.getByTestId("name"))).toBe(true);
  expect(truncated(screen.getByTestId("owner"))).toBe(true);
});

it("a short label takes only its own width and truncates nothing", () => {
  render(
    <Row
      width={560}
      owner="Alice"
      label={
        <>
          sent by <MessageItemDelegatedByName data-testid="name">Friday</MessageItemDelegatedByName>
        </>
      }
    />,
  );
  expectWordsWhole(screen.getByTestId("label"));
  expect(truncated(screen.getByTestId("name"))).toBe(false);
  expect(truncated(screen.getByTestId("owner"))).toBe(false);
});

function Faces({ popupOpen = false, deleted = false }: { popupOpen?: boolean; deleted?: boolean }) {
  return (
    <ThemeProvider>
      <div style={{ width: 560 }}>
        <MessageItem data-testid="row" data-popup-open={popupOpen ? "" : undefined}>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human" data-testid="owner-avatar">
              <AvatarFallback>A</AvatarFallback>
              <MessageItemDelegatedAvatar data-testid="face" deleted={deleted}>
                <Avatar size="2xs" type="agent" data-testid="face-avatar" />
              </MessageItemDelegatedAvatar>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemAvatarSlot>
              <Avatar size="md" type="agent" data-testid="agent-avatar">
                <AvatarBadge data-testid="light" />
              </Avatar>
            </MessageItemAvatarSlot>
          </MessageItemContent>
        </MessageItem>
        <span data-testid="canvas" style={{ color: "var(--layer-canvas)" }} />
        <span data-testid="pressed" style={{ color: "var(--fill-pressed)" }} />
      </div>
    </ThemeProvider>
  );
}

it("the face is 19px and sticks out of the owner's avatar as far as an md presence light", () => {
  render(<Faces />);
  const owner = screen.getByTestId("owner-avatar").getBoundingClientRect();
  const face = screen.getByTestId("face").getBoundingClientRect();
  const faceAvatar = screen.getByTestId("face-avatar").getBoundingClientRect();
  const agent = screen.getByTestId("agent-avatar").getBoundingClientRect();
  const light = screen.getByTestId("light").getBoundingClientRect();

  expect(face.width).toBe(19);
  expect(face.height).toBe(19);
  expect(faceAvatar.width).toBe(19);
  expect(faceAvatar.left).toBe(face.left);
  expect(faceAvatar.top).toBe(face.top);

  // The same visible overhang past the avatar's outer edge as the presence
  // light: both rings (the light's outline, the face's shadow) are the
  // surface, so what shows is the face's own edge, 2.5px out (the browser
  // snaps the 1.5px ink edge, so 2.5 to 3).
  const overhang = face.right - owner.right;
  expect(overhang).toBeCloseTo(light.right - agent.right, 1);
  expect(face.bottom - owner.bottom).toBeCloseTo(light.bottom - agent.bottom, 1);
  expect(overhang).toBeGreaterThanOrEqual(2.5);
  expect(overhang).toBeLessThanOrEqual(3);
  const style = getComputedStyle(screen.getByTestId("face"));
  expect(style.right).toBe("-4px");
  expect(style.bottom).toBe("-4px");
  // 15px of it lies over the avatar, measured from inside the avatar's ink
  // edge (the edge the light is placed from; the browser snaps its width).
  const ownerEl = screen.getByTestId("owner-avatar");
  const innerRight = owner.left + ownerEl.clientLeft + ownerEl.clientWidth;
  const innerBottom = owner.top + ownerEl.clientTop + ownerEl.clientHeight;
  expect(innerRight - face.left).toBeCloseTo(15, 1);
  expect(innerBottom - face.top).toBeCloseTo(15, 1);
  expect(screen.getByTestId("face").getAttribute("aria-hidden")).toBe("true");
});

it("a 1.5px ring in the row's surface separates the face from the avatar", () => {
  render(<Faces />);
  const canvas = getComputedStyle(screen.getByTestId("canvas")).color;
  const shadow = getComputedStyle(screen.getByTestId("face")).boxShadow;
  // At rest the row has no fill: a transparent wash over the canvas.
  expect(shadow).toContain(`${canvas} 0px 0px 0px 1.5px`);
  expect(shadow).toMatch(/rgba\(0, 0, 0, 0\) 0px 0px 0px 1\.5px/);
  expect(getComputedStyle(screen.getByTestId("face")).outlineStyle).toBe("none");
});

it("the ring takes the row's fill while the row is highlighted", () => {
  render(<Faces popupOpen />);
  const pressed = getComputedStyle(screen.getByTestId("pressed")).color;
  const canvas = getComputedStyle(screen.getByTestId("canvas")).color;
  const shadow = getComputedStyle(screen.getByTestId("face")).boxShadow;
  expect(shadow).toContain(`${pressed} 0px 0px 0px 1.5px`);
  // One value: the row paints the same fill the ring reads.
  expect(getComputedStyle(screen.getByTestId("row")).backgroundColor).toBe(pressed);
  expect(shadow).toContain(`${canvas} 0px 0px 0px 1.5px`);
});

it("a deleted assistant's face is grayed over an opaque backing, never the owner's avatar", () => {
  render(<Faces deleted />);
  const face = getComputedStyle(screen.getByTestId("face"));
  const canvas = getComputedStyle(screen.getByTestId("canvas")).color;
  expect(face.backgroundColor).toBe(canvas);
  const inner = getComputedStyle(screen.getByTestId("face-avatar"));
  expect(inner.filter).toContain("grayscale(1)");
  expect(Number(inner.opacity)).toBeLessThan(1);
});

it("the face's placeholder icon is sized for 2xs, not for the owner's md avatar", () => {
  render(<Faces />);
  const icon = screen.getByTestId("face-avatar").querySelector("svg")!;
  const ownerIcon = screen.getByTestId("owner-avatar").querySelector(":scope > span > svg");
  expect(icon.getBoundingClientRect().width).toBe(12);
  expect(icon.getBoundingClientRect().width).toBeLessThan(
    ownerIcon ? ownerIcon.getBoundingClientRect().width : 18,
  );
  const box = screen.getByTestId("face-avatar").getBoundingClientRect();
  expect(icon.getBoundingClientRect().right).toBeLessThanOrEqual(box.right);
});
