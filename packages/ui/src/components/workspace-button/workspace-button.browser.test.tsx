import "./workspace-button.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar/avatar";
import { WorkspaceButton, WorkspaceButtonName } from "./workspace-button";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function renderButton(name: string, width = 400) {
  render(
    <ThemeProvider>
      <div style={{ width: `${width}px`, display: "flex" }}>
        <WorkspaceButton data-testid="button">
          <Avatar type="server" size="sm" data-testid="avatar">
            <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <WorkspaceButtonName data-testid="name">{name}</WorkspaceButtonName>
        </WorkspaceButton>
      </div>
    </ThemeProvider>,
  );
  const button = screen.getByTestId("button");
  const chevron = button.querySelector("[data-slot=workspace-button-chevron]");
  if (!chevron) throw new Error("the button draws no chevron");
  return {
    button: button.getBoundingClientRect(),
    avatar: screen.getByTestId("avatar").getBoundingClientRect(),
    name: screen.getByTestId("name").getBoundingClientRect(),
    chevron: chevron.getBoundingClientRect(),
  };
}

it("is avatar, name and chevron on one 36px button", () => {
  const { button, avatar, name, chevron } = renderButton("Acme");
  expect(button.height).toBe(36);
  expect(avatar.width).toBe(27);
  // 10px of padding inside the on-frame button's transparent border.
  expect(avatar.left - button.left).toBeGreaterThanOrEqual(10);
  expect(avatar.left - button.left).toBeLessThanOrEqual(12);
  expect(name.left - avatar.right).toBe(8);
  expect(chevron.left - name.right).toBe(4);
  expect(chevron.width).toBe(16);
  expect(button.right - chevron.right).toBeCloseTo(avatar.left - button.left, 1);
});

it("ellipsizes a long name at 200px and keeps the chevron", () => {
  const { name, chevron, button } = renderButton("A".repeat(80));
  expect(name.width).toBe(200);
  expect(chevron.width).toBe(16);
  expect(chevron.right).toBeLessThanOrEqual(button.right);
});

it("shrinks from the name in a narrow bar, never the avatar or chevron", () => {
  const { name, avatar, chevron, button } = renderButton("A".repeat(80), 160);
  expect(button.width).toBeLessThanOrEqual(160);
  expect(avatar.width).toBe(27);
  expect(chevron.width).toBe(16);
  expect(name.width).toBeLessThan(200);
  expect(chevron.right).toBeLessThanOrEqual(button.right);
});
