import { describe, expect, it } from "vitest";

import { stripSourceCodeBlocks, stripTopLevelImports } from "./source-code.ts";

describe("stripTopLevelImports", () => {
  it("keeps snippets with a single import line unchanged", () => {
    const code = `import { Button } from "@raft/ui";

<Button>Save</Button>`;

    expect(stripTopLevelImports(code)).toBe(code);
  });

  it("strips top-level imports when the import block spans multiple lines", () => {
    const code = `import {
  Button,
  IconButton,
} from "@raft/ui";

<Button>Save</Button>`;

    expect(stripTopLevelImports(code)).toBe("<Button>Save</Button>");
  });

  it("strips top-level imports when there are multiple import lines", () => {
    const code = `import { Button } from "@raft/ui";
import { Plus } from "lucide-react";

<Button>
  <Plus />
  New
</Button>`;

    expect(stripTopLevelImports(code)).toBe(`<Button>
  <Plus />
  New
</Button>`);
  });

  it("keeps snippets without imports unchanged", () => {
    const code = `<Button>Save</Button>`;

    expect(stripTopLevelImports(code)).toBe(code);
  });
});

describe("stripSourceCodeBlocks", () => {
  it("removes every docs-only source block wrapped in strip markers", () => {
    const code = `export function ButtonContent() {
  return <Button>Save</Button>;
}

// @docs-source-strip-start
import { ButtonComparisonPreview } from "./preview.tsx";
// @docs-source-strip-end

// @docs-source-strip-start
export function ButtonComposition() {
  return (
    <Preview>
      <ButtonContent />
    </Preview>
  );
}
// @docs-source-strip-end`;

    expect(stripSourceCodeBlocks(code)).toBe(`export function ButtonContent() {
  return <Button>Save</Button>;
}`);
  });
});
