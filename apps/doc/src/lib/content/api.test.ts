import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { buildApi } from "../../../scripts/build-api.mjs";

import { API_INDEX, apiMarkdown, changesFor, loadComponentApi } from "./api.ts";

describe("generated API", () => {
  it("is current: run `node scripts/build-api.mjs` after changing raft-ui's exports or props", () => {
    for (const [name, text] of buildApi()) {
      // Tests run from apps/doc.
      const file = path.join(process.cwd(), "src/data/api", name);
      expect(readFileSync(file, "utf8"), name).toBe(text);
    }
  }, 60_000);

  it("reads a recipe's variants and their defaults", async () => {
    const [button] = await loadComponentApi("button");
    const variant = button!.props.find((prop) => prop.name === "variant")!;
    expect(variant.type).toContain('"primary"');
    expect(variant.default).toBe('"default"');
    expect(JSON.stringify(button)).not.toContain("/Users/");
  });

  it("marks a folder by the entry it is exported from", () => {
    expect(API_INDEX["save-status"]?.status).toBe("experimental");
    expect(API_INDEX.button?.status).toBe("stable");
  });

  it("writes the API and changes for the Markdown twin", async () => {
    const markdown = apiMarkdown(await loadComponentApi("button"));
    expect(markdown).toMatch(/^## API\n\n### Button\n/);
    expect(markdown).toContain("| `variant` |");
    expect(changesFor("button").every((change) => /`Button\b/.test(change.text))).toBe(true);
  });
});
