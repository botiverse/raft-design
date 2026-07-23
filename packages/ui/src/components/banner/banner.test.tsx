import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import { ThemeProvider } from "../../lib/theme/theme-provider";
import { BannerAction } from "./banner";

describe("banner action alignment", () => {
  it.each(["brutal", "elegant"] as const)("aligns %s actions to the top", (theme) => {
    const markup = renderToStaticMarkup(
      <ThemeProvider theme={theme} syncDom={false}>
        <BannerAction>Dismiss</BannerAction>
      </ThemeProvider>,
    );

    expect(markup).toContain("self-start");
    expect(markup).not.toContain("self-center");
    expect(markup).not.toContain("data-align");
  });
});
