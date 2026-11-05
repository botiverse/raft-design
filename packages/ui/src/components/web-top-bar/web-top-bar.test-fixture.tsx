import type { CSSProperties, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { AppRailItem, AppRailItemLabel, AppRailNav, AppRailRoot } from "../app-rail";
import { Avatar, AvatarFallback } from "../avatar";
import { Button } from "../button/button";
import { SearchTrigger, SearchTriggerLabel } from "../search";
import { WorkspaceButton, WorkspaceButtonName } from "../workspace-button";
import { WebTopBarCenter, WebTopBarEnd, WebTopBarRoot, WebTopBarStart } from "./web-top-bar";

const Icon = ({ id }: { id: string }) => <svg data-testid={id} viewBox="0 0 24 24" />;

/** What the product puts beside the workspace button and before the bell: a few avatars. */
export function Avatars({ count, prefix }: { count: number; prefix: string }) {
  return Array.from({ length: count }, (_, i) => (
    <Avatar key={i} type="server" size="sm" data-testid={`${prefix}-${i}`}>
      <AvatarFallback>{String.fromCharCode(65 + i)}</AvatarFallback>
    </Avatar>
  ));
}

export type BarOptions = {
  start?: ReactNode;
  end?: ReactNode;
  /** CSS custom properties on the bar, such as a frame inset. */
  style?: CSSProperties;
};

/**
 * The bar across the whole window, the way the product draws it, with the
 * rail under it so the start can be measured against a rail item.
 */
export function renderBar({ start, end, style }: BarOptions = {}) {
  render(
    <ThemeProvider>
      <div style={{ position: "fixed", insetInline: 0, top: 0, ...style }}>
        <WebTopBarRoot data-testid="bar">
          <WebTopBarStart data-testid="start">
            <WorkspaceButton data-testid="workspace">
              <Avatar type="server" size="sm">
                <AvatarFallback>R</AvatarFallback>
              </Avatar>
              <WorkspaceButtonName>Raft HQ</WorkspaceButtonName>
            </WorkspaceButton>
            {start}
          </WebTopBarStart>
          <WebTopBarCenter data-testid="center">
            <SearchTrigger data-testid="search">
              <SearchTriggerLabel>Search</SearchTriggerLabel>
            </SearchTrigger>
          </WebTopBarCenter>
          <WebTopBarEnd data-testid="end">
            {end}
            <Button variant="on-frame" size="icon-md" aria-label="Notifications" data-testid="bell">
              <Icon id="bell-icon" />
            </Button>
          </WebTopBarEnd>
        </WebTopBarRoot>
        <div style={{ height: 200 }}>
          <AppRailRoot>
            <AppRailNav>
              <AppRailItem data-testid="rail-item">
                <Icon id="rail-icon" />
                <AppRailItemLabel>Home</AppRailItemLabel>
              </AppRailItem>
            </AppRailNav>
          </AppRailRoot>
        </div>
      </div>
    </ThemeProvider>,
  );
  const box = (id: string) => screen.getByTestId(id).getBoundingClientRect();
  return {
    bar: box("bar"),
    start: box("start"),
    center: box("center"),
    end: box("end"),
    workspace: box("workspace"),
    search: box("search"),
    bell: box("bell"),
    bellIcon: box("bell-icon"),
    railItem: box("rail-item"),
  };
}
