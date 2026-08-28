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

describe("AvatarBadge render prop ownership", () => {
  it("keeps a rendered Status authoritative over visual size", () => {
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

  it("lets a render callback compose placement without inheriting dot size", () => {
    for (const theme of THEMES) {
      const markup = renderAvatarBadge(
        <AvatarBadge
          render={(badgeProps) => (
            <Status {...badgeProps} aria-hidden size="lg" variant="success" />
          )}
        />,
        theme,
      );

      expect(markup).toContain("size-[11px]");
      expect(markup).toContain("absolute z-10");
      expect(markup).not.toContain("group-data-[size=sm]/avatar:size-2");
    }
  });

  it("keeps AvatarBadge props above the built-in dot and then falls back to Avatar size", () => {
    for (const theme of THEMES) {
      const markup = renderAvatarBadge(<AvatarBadge className="bg-info" />, theme);

      expect(markup).toContain("bg-info");
      expect(markup).not.toContain("bg-success");
      expect(markup).toContain("group-data-[size=sm]/avatar:size-2");
      expect(markup).toContain("rounded-full");
    }
  });
});
