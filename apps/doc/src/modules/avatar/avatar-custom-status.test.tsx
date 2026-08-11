import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarBadge, Status, ThemeProvider } from "raft-ui";

const THEMES = ["brutal", "elegant"] as const;

function renderAvatarBadge(badge: ReactNode, theme: (typeof THEMES)[number]) {
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} syncDom={false}>
      <Avatar size="sm" type="agent">
        {badge}
      </Avatar>
    </ThemeProvider>,
  );
}

describe("AvatarBadge custom Status sizing", () => {
  it("preserves the custom Status size while still applying corner placement", () => {
    for (const theme of THEMES) {
      const markup = renderAvatarBadge(
        <AvatarBadge render={<Status aria-hidden size="lg" variant="success" />} />,
        theme,
      );

      expect(markup).toContain("size-[11px]");
      expect(markup).toContain("absolute z-10");
      expect(markup).not.toContain("group-data-[size=sm]/avatar:size-2");
    }
  });

  it("keeps the parent-responsive size map for the default badge dot", () => {
    for (const theme of THEMES) {
      const markup = renderAvatarBadge(<AvatarBadge />, theme);

      expect(markup).toContain("group-data-[size=sm]/avatar:size-2");
      expect(markup).toContain("rounded-full");
    }
  });
});
