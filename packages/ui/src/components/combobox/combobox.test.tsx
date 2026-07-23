import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Combobox, ComboboxControl, ComboboxInput, ComboboxInputGroup } from "./combobox";

function renderInput(owner: "control" | "group") {
  const input =
    owner === "control" ? (
      <ComboboxControl>
        <ComboboxInput aria-label="Search models" />
      </ComboboxControl>
    ) : (
      <ComboboxInputGroup>
        <ComboboxInput aria-label="Search models" />
      </ComboboxInputGroup>
    );

  const markup = renderToStaticMarkup(
    <ThemeProvider theme="elegant" syncDom={false}>
      <Combobox items={[]}>{input}</Combobox>
    </ThemeProvider>,
  );
  const inputMarkup = markup.match(/<input\b(?=[^>]*data-slot="combobox-input")[^>]*>/)?.[0];
  const className = inputMarkup?.match(/class="([^"]*)"/)?.[1];

  expect(className).toBeDefined();
  return className ?? "";
}

describe("combobox input ownership", () => {
  it("keeps the input bare when ComboboxControl owns the field surface", () => {
    const className = renderInput("control");

    expect(className).toContain("border-0");
    expect(className).toContain("bg-transparent");
    expect(className).toContain("focus-visible:ring-0");
    expect(className).not.toContain("border-line-subtle");
    expect(className).not.toContain("focus-visible:ring-2");
  });

  it("keeps the framed search field inside ComboboxInputGroup", () => {
    const className = renderInput("group");

    expect(className).toContain("border-line-subtle");
    expect(className).toContain("focus-visible:ring-2");
    expect(className).not.toContain("border-0");
  });
});
