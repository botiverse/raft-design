import { describe, expect, it } from "vitest";

import { getDocSource, renderMarkdownTwin } from "./doc-source.ts";
import { hasExample } from "./examples.ts";
import { searchPages } from "./site-map.ts";

describe("proposal site", () => {
  it("finds a component by an alias and says which name matched", () => {
    const [first] = searchPages("snackbar");
    expect(first?.page.slug).toBe("toast");
    expect(first?.matchedAlias).toBe("Snackbar");
  });

  it("ranks a title match above an alias match", () => {
    expect(searchPages("button")[0]?.page.slug).toBe("button");
  });

  it("points every example block in the mock pages at a real composition", () => {
    for (const slug of ["button", "color", "feedback"]) {
      const source = getDocSource(slug)!;
      for (const [, path] of source.raw.matchAll(/```example\n([^\n]+)\n```/g)) {
        expect(hasExample(path!.trim()), path).toBe(true);
      }
    }
  });

  it("writes the Markdown twin with examples as code and tokens as tables", async () => {
    const twin = await renderMarkdownTwin(getDocSource("color")!);
    expect(twin).not.toContain("```tokens");
    expect(twin).toContain("| `layer-frame` |");

    const button = await renderMarkdownTwin(getDocSource("button")!);
    expect(button).not.toContain("```example");
    expect(button).toContain('import { Button } from "raft-ui";');
    expect(button).toMatch(/^# Button\n\n> A control that runs an action/);
  });
});
