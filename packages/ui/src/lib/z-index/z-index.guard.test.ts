import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";

const OVERLAY_COMPONENT_DIRS = [
  "dialog",
  "alert-dialog",
  "drawer",
  "popover",
  "select",
  "combobox",
  "dropdown-menu",
  "context-menu",
  "tooltip",
  "toast",
  "lightbox",
  "preview-card",
];

const DISALLOWED_RAW_CONTAINER_Z_PATTERN =
  /\b(z-30|z-40|z-50|z-60|z-70|z-80|z-90|z-100|z-1000|z-2000|z-3000|z-5000|z-9999)\b/;

function walkDir(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (/\.(tsx?|css)$/.test(file) && !file.includes(".test.")) {
      results.push(fullPath);
    }
  }
  return results;
}

describe("overlay raw z-index regression guard", () => {
  it("ensures overlay component containers do not hardcode arbitrary high z-index utilities (z-30..z-9999)", () => {
    const componentsRoot = path.resolve(__dirname, "../../components");
    const violations: { file: string; match: string }[] = [];

    for (const overlayDir of OVERLAY_COMPONENT_DIRS) {
      const fullDirPath = path.join(componentsRoot, overlayDir);
      if (!fs.existsSync(fullDirPath)) continue;

      const files = walkDir(fullDirPath);
      for (const file of files) {
        const content = fs.readFileSync(file, "utf8");
        const match = content.match(DISALLOWED_RAW_CONTAINER_Z_PATTERN);
        if (match) {
          violations.push({
            file: path.relative(componentsRoot, file),
            match: match[0],
          });
        }
      }
    }

    expect(
      violations,
      `Detected hardcoded container z-index classes in overlay components! Use semantic tokens (z-modal, z-dropdown, etc.) or useZIndex(). Violations: ${JSON.stringify(violations)}`,
    ).toEqual([]);
  });
});
