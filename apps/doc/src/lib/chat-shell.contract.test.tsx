import { existsSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as ChatShellParts from "raft-ui/wip";

const REQUIRED_PARTS = [
  "ChatShellRoot",
  "ChatShellRail",
  "ChatShellSidebar",
  "ChatShellMain",
  "ChatShellPanelStack",
  "ChatShellMobileBar",
  "ChatRailRoot",
  "ChatRailHeader",
  "ChatRailServerButton",
  "ChatRailNav",
  "ChatRailItem",
  "ChatRailItemIcon",
  "ChatRailItemLabel",
  "ChatRailItemBadge",
  "ChatRailItemIndicator",
  "ChatRailFooter",
  "ChatSidebarRoot",
  "ChatSidebarHeader",
  "ChatSidebarBody",
  "ChatSidebarSection",
  "ChatSidebarList",
  "ChatSidebarFooter",
  "ChatPanelStackRoot",
  "ChatPanelStackItem",
  "ChatPanelStackContent",
  "ChatPanelResizeHandle",
] as const satisfies readonly (keyof typeof ChatShellParts)[];

afterEach(() => {
  cleanup();
});

describe("chat-shell component family", () => {
  it("exports every flat part from raft-ui/wip", () => {
    for (const part of REQUIRED_PARTS) {
      expect(ChatShellParts[part]).toBeTypeOf("function");
    }
  });

  it("keeps source shell geometry in the brutal default theme", () => {
    const { container } = render(
      <ChatShellParts.ChatShellRoot>
        <ChatShellParts.ChatShellRail />
        <ChatShellParts.ChatShellSidebar />
        <ChatShellParts.ChatShellMain />
        <ChatShellParts.ChatShellPanelStack>
          <ChatShellParts.ChatPanelStackRoot>
            <ChatShellParts.ChatPanelStackItem />
          </ChatShellParts.ChatPanelStackRoot>
        </ChatShellParts.ChatShellPanelStack>
      </ChatShellParts.ChatShellRoot>,
    );

    expect(slot(container, "chat-shell-root").className).toContain("bg-brutal-cream");
    expect(slot(container, "chat-shell-root").className).toContain("font-display");
    expect(slot(container, "chat-shell-rail").className).toContain("w-16");
    expect(slot(container, "chat-shell-rail").className).toContain("w-[50px]");
    expect(slot(container, "chat-shell-rail").className).toContain("bg-soft-signal");
    expect(slot(container, "chat-shell-sidebar").className).toContain("w-60");
    expect(slot(container, "chat-shell-sidebar").className).toContain("bg-brutal-cream");
    expect(slot(container, "chat-panel-stack-item").className).toContain("w-[400px]");
    expect(slot(container, "chat-panel-stack-item").className).toContain("border-l-2");
  });

  it("keeps source header and sidebar surface contracts on the flat parts", () => {
    const { container } = render(
      <>
        <ChatShellParts.ChatRailHeader />
        <ChatShellParts.ChatSidebarRoot>
          <ChatShellParts.ChatSidebarHeader />
          <ChatShellParts.ChatSidebarBody />
        </ChatShellParts.ChatSidebarRoot>
      </>,
    );

    expect(slot(container, "chat-rail-header").className).toContain("h-[62px]");
    expect(slot(container, "chat-sidebar-root").className).toContain("select-none");
    expect(slot(container, "chat-sidebar-header").className).toContain("h-[62px]");
    expect(slot(container, "chat-sidebar-header").className).toContain("bg-brutal-cream");
    expect(slot(container, "chat-sidebar-header").className).toContain("px-5");
    expect(slot(container, "chat-sidebar-body").className).toContain("bg-brutal-cream");
  });

  it("keeps chat-shell data-free and out of docs composition fixtures", () => {
    const source = readSource("../../../../packages/ui/src/components/chat-shell/chat-shell.tsx");

    expect(source).not.toMatch(/useChannelStore|useServerStore|useAppNavigate/);
    expect(source).not.toMatch(/packages\/web|packages\\web/);
    expect(source).not.toMatch(/from ["']#\/store|from ["']#\/hooks/);
    expect(existsSync(new URL("../compositions/chat-shell", import.meta.url))).toBe(false);
  });

  it("keeps App Shell docs grouped as standalone routes", () => {
    const sidebar = readSource("../components/sidebar.tsx");

    expect(sidebar).toContain('title: "App Shell"');
    expect(sidebar).toContain('to: "/components/chat-shell"');
    expect(sidebar).toContain('to: "/components/chat-rail"');
    expect(sidebar).toContain('to: "/components/chat-sidebar"');
    expect(sidebar).toContain('to: "/components/chat-panel-stack"');
  });

  it("keeps rail selection controlled and app-owned", () => {
    const handleValueChange = vi.fn();
    const handleSelect = vi.fn();
    const { getByRole } = render(
      <ChatShellParts.ChatRailRoot value="chat" onValueChange={handleValueChange}>
        <ChatShellParts.ChatRailItem value="chat" aria-label="Chat" />
        <ChatShellParts.ChatRailItem value="search" aria-label="Search" onSelect={handleSelect} />
      </ChatShellParts.ChatRailRoot>,
    );

    expect(getByRole("button", { name: "Chat" }).getAttribute("aria-pressed")).toBe("true");
    expect(getByRole("button", { name: "Search" }).getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(getByRole("button", { name: "Search" }));

    expect(handleSelect).toHaveBeenCalledWith("search");
    expect(handleValueChange).toHaveBeenCalledWith("search");
  });
});

function slot(container: HTMLElement, name: string) {
  const element = container.querySelector(`[data-slot="${name}"]`);
  expect(element).not.toBeNull();
  return element as HTMLElement;
}

function readSource(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}
