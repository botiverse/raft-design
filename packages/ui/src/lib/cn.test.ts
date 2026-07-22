import { describe, expect, it } from "vite-plus/test";

import { cn } from "./cn";

describe("cn", () => {
  it("resolves standard shadow scale against shadow-none", () => {
    expect(cn("shadow-md", "shadow-none")).toBe("shadow-none");
    expect(cn("shadow-sm", "shadow-none")).toBe("shadow-none");
    expect(cn("shadow-xl", "shadow-md")).toBe("shadow-md");
    expect(cn("shadow-none", "shadow-md")).toBe("shadow-md");
  });

  it("resolves custom field-hover shadow against the scale", () => {
    expect(cn("shadow-field-hover", "shadow-none")).toBe("shadow-none");
    expect(cn("shadow-md", "shadow-field-hover")).toBe("shadow-field-hover");
  });

  it("lets picker chrome drop DropdownMenu shadow-md", () => {
    expect(
      cn(
        "border-2 border-black bg-layer-popover shadow-md",
        "rounded-none border-2 border-line-strong border-black bg-white shadow-none",
      ),
    ).toBe("rounded-none border-2 border-line-strong border-black bg-white shadow-none");
  });
});
