import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Status } from "../status";
import { Avatar, AvatarBadge, type AvatarSize } from "./avatar";

const BADGE_SIZES = [
  ["xl", "group-data-[size=xl]/avatar:size-3.5"],
  ["lg", "group-data-[size=lg]/avatar:size-3"],
  ["md", "group-data-[size=md]/avatar:size-2.5"],
  ["sm", "group-data-[size=sm]/avatar:size-2"],
  ["xs", "group-data-[size=xs]/avatar:size-1.5"],
  ["2xs", "group-data-[size=2xs]/avatar:size-1.5"],
  ["3xs", "group-data-[size=3xs]/avatar:size-1.5"],
] as const satisfies ReadonlyArray<readonly [AvatarSize, string]>;

function renderAvatar(size: AvatarSize, indicator: "dot" | "status") {
  const markup = renderToStaticMarkup(
    <ThemeProvider theme="elegant" syncDom={false}>
      <Avatar size={size} type="agent">
        <AvatarBadge
          render={indicator === "status" ? <Status aria-hidden variant="success" /> : undefined}
        />
      </Avatar>
    </ThemeProvider>,
  );
  const avatarMarkup = markup.match(/<span\b(?=[^>]*data-slot="avatar")[^>]*>/)?.[0];
  const badgeMarkup = markup.match(/<span\b(?=[^>]*data-slot="avatar-badge")[^>]*>/)?.[0];
  const className = badgeMarkup?.match(/class="([^"]*)"/)?.[1];

  expect(avatarMarkup).toContain(`data-size="${size}"`);
  expect(className).toBeDefined();
  return className ?? "";
}

describe("avatar badge sizing", () => {
  it.each(BADGE_SIZES)("maps %s avatars to one shared badge size", (size, badgeSize) => {
    expect(renderAvatar(size, "dot")).toContain(badgeSize);
    expect(renderAvatar(size, "status")).toContain(badgeSize);
  });
});
