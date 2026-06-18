import { describe, expect, it } from "vitest";

import { stripTopLevelImports } from "./highlight.tsx";

describe("stripTopLevelImports", () => {
  it("keeps snippets with a single import line unchanged", () => {
    const code = `import { Button } from "@slock/ui";

<Button>Save</Button>`;

    expect(stripTopLevelImports(code)).toBe(code);
  });

  it("strips top-level imports when the import block spans multiple lines", () => {
    const code = `import {
  Button,
  IconButton,
} from "@slock/ui";

<Button>Save</Button>`;

    expect(stripTopLevelImports(code)).toBe("<Button>Save</Button>");
  });

  it("strips top-level imports when there are multiple import lines", () => {
    const code = `import { Button } from "@slock/ui";
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
