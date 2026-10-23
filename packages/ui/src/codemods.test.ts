import { expect, test } from "vite-plus/test";
// @ts-expect-error -- plain ESM scripts shipped in the package, without types.
import { renameDependency, renameSpecifiers } from "../codemods/package-name.mjs";
// @ts-expect-error -- plain ESM scripts shipped in the package, without types.
import { renameTokens } from "../codemods/token-names.mjs";
// @ts-expect-error -- plain ESM scripts shipped in the package, without types.
import { migrateButtonSizes, renameButtonSizes } from "../codemods/button-sizes.mjs";

test("package-name rewrites JS and CSS specifiers once, and leaves bare strings alone", () => {
  const before = [
    'import { Button } from "raft-ui";',
    'import "raft-ui/styles.css";',
    'const { cn } = require("raft-ui/cn");',
    'const Lazy = import("raft-ui/wip");',
    '@import "raft-ui/fonts.css";',
    '@import url("raft-ui/styles.css");',
    '@source "../node_modules/raft-ui/dist";',
    'dedupe: ["react", "raft-ui"],',
  ].join("\n");
  const after = renameSpecifiers(before);
  expect(after).toBe(
    [
      'import { Button } from "@botiverse/raft-ui";',
      'import "@botiverse/raft-ui/styles.css";',
      'const { cn } = require("@botiverse/raft-ui/cn");',
      'const Lazy = import("@botiverse/raft-ui/wip");',
      '@import "@botiverse/raft-ui/fonts.css";',
      '@import url("@botiverse/raft-ui/styles.css");',
      '@source "../node_modules/@botiverse/raft-ui/dist";',
      'dedupe: ["react", "raft-ui"],',
    ].join("\n"),
  );
  expect(renameSpecifiers(after)).toBe(after);
});

test("package-name escapes the slash inside a regex literal", () => {
  const before =
    'assert.match(source, /import \\{ Button \\} from "raft-ui";/);\nconst s = "a/b"; import { X } from "raft-ui";';
  const after = renameSpecifiers(before);
  expect(after).toBe(
    'assert.match(source, /import \\{ Button \\} from "@botiverse\\/raft-ui";/);\nconst s = "a/b"; import { X } from "@botiverse/raft-ui";',
  );
  expect(renameSpecifiers(after)).toBe(after);
});

test("package-name renames the dependency and keeps workspace ranges", () => {
  const json = {
    dependencies: { react: "^19", "raft-ui": "0.6.0" },
    devDependencies: { "raft-ui": "workspace:*" },
  };
  expect(renameDependency(json, "0.7.0")).toBe(true);
  expect(json).toEqual({
    dependencies: { react: "^19", "@botiverse/raft-ui": "0.7.0" },
    devDependencies: { "@botiverse/raft-ui": "workspace:*" },
  });
});

test("package-name keeps an alias that points the unscoped name at the new package", () => {
  const json = {
    dependencies: { "@botiverse/raft-ui": "0.7.0", "raft-ui": "npm:@botiverse/raft-ui@0.7.0" },
  };
  expect(renameDependency(json, "0.7.0")).toBe(false);
  expect(json.dependencies).toEqual({
    "@botiverse/raft-ui": "0.7.0",
    "raft-ui": "npm:@botiverse/raft-ui@0.7.0",
  });
});

test("token-names renames utilities and references, not declarations or BEM modifiers", () => {
  const before = [
    '<div className="border-line-muted bg-layer-panel hover:bg-primary-soft/50 shadow-raft-float" />',
    ".r-button--primary { color: var(--accent-400); border-color: var(--line); }",
    "--line: var(--line-seam);",
  ].join("\n");
  const after = renameTokens(before);
  expect(after).toBe(
    [
      '<div className="border-line-hairline bg-layer-canvas hover:bg-brand-soft/50 shadow-float" />',
      ".r-button--primary { color: var(--attention-400); border-color: var(--line-seam); }",
      "--line: var(--line-seam);",
    ].join("\n"),
  );
  expect(renameTokens(after)).toBe(after);
});

test("token-names moves the old hover names onto the two hover tiers", () => {
  const before = [
    '<a className="hover:press-overlay active:press-overlay-sticker hover:row-hover-overlay data-popup-open:row-open-overlay" />',
    '<b className="hover:bg-fill-pressed hover:bg-fill-frame-pressed hover:bg-fill-row-hover data-popup-open:bg-fill-row-open" />',
    ".x { --fill: var(--fill-message-hover); background: var(--sticker-pressed); }",
    ".y { color: var(--color-fill-pressed); border-color: var(--color-primary-soft); }",
  ].join("\n");
  const after = renameTokens(before);
  expect(after).toBe(
    [
      '<a className="hover:overlay-medium active:overlay-sticker-medium hover:overlay-subtle data-popup-open:overlay-subtle" />',
      '<b className="hover:bg-fill-medium hover:bg-fill-frame-medium hover:bg-fill-subtle data-popup-open:bg-fill-subtle" />',
      ".x { --fill: var(--fill-subtle); background: var(--sticker-medium); }",
      ".y { color: var(--color-fill-medium); border-color: var(--color-brand-soft); }",
    ].join("\n"),
  );
  expect(renameTokens(after)).toBe(after);
});

test("button-sizes renames Button's duplicate sizes, and only a Button's", () => {
  const before = [
    'use(<Button size="sm">Save</Button>);',
    'use(<Button variant="ghost" size=\'icon-sm\' aria-label="More" />);',
    'use(<Button\n  size={inHead ? "sm" : "lg"}\n  onClick={() => go({ size: "sm" })}\n/>);',
    'use(<><Button size={"xs"} /> <Button size="icon-xs" /></>);',
    'use(<><DialogClose size="icon-xs" /> <ComposerSubmit size="icon-sm" /></>);',
    'use(<><AlertDialogCancel size="sm" /> <FileAction size="icon-sm" /></>);',
    'use(<><Dialog size="sm" /> <Banner size="sm" /> <Avatar size="xs" /></>);',
    'const cls = buttonVariants({ variant: "ghost", size: "icon-sm" });',
    'const other = { size: "sm" };',
  ].join("\n");
  const after = renameButtonSizes(before);
  expect(after).toBe(
    [
      'use(<Button size="md">Save</Button>);',
      'use(<Button variant="ghost" size=\'icon-md\' aria-label="More" />);',
      'use(<Button\n  size={inHead ? "md" : "lg"}\n  onClick={() => go({ size: "sm" })}\n/>);',
      'use(<><Button size={"md"} /> <Button size="icon-md" /></>);',
      'use(<><DialogClose size="icon-md" /> <ComposerSubmit size="icon-md" /></>);',
      'use(<><AlertDialogCancel size="md" /> <FileAction size="icon-md" /></>);',
      'use(<><Dialog size="sm" /> <Banner size="sm" /> <Avatar size="xs" /></>);',
      'const cls = buttonVariants({ variant: "ghost", size: "icon-md" });',
      'const other = { size: "sm" };',
    ].join("\n"),
  );
  expect(renameButtonSizes(after)).toBe(after);
  expect(renameButtonSizes('use(<MyButton size="sm" />);', ["MyButton"])).toBe(
    'use(<MyButton size="md" />);',
  );
});

test("button-sizes reads comments, strings and JSX text as such", () => {
  // An apostrophe in a comment or in JSX text once opened a quote that ran to
  // the end of the file, and a Spinner far below was taken for the Button.
  const before = [
    "function A() {",
    "  // Keep RUI's spacing here.",
    "  return (",
    "    <div>",
    '      <Button size="sm">It\'s fine</Button>',
    "      {/* don't */}",
    '      <Spinner size="sm" />',
    "      Don't {`it's`} <Spinner size='sm' />",
    "    </div>",
    "  );",
    "}",
  ].join("\n");
  const after = renameButtonSizes(before);
  expect(after).toContain('<Button size="md">It\'s fine</Button>');
  expect(after).toContain('<Spinner size="sm" />');
  expect(after).toContain("<Spinner size='sm' />");
});

test("button-sizes finds a Button in another element's props and reports what it leaves", () => {
  const before = [
    "use(<Card",
    '  actions={<Button size="sm">Accept</Button>}',
    '  render={(props) => <Button {...props} size="icon-sm" />}',
    "/>);",
    'use(<Banner size="sm" />);',
    'const size = compact ? "sm" : "md";',
    'assert.match(source, /size=\\{compact \\? "icon-sm" : "sm"\\}/);',
  ].join("\n");
  const { source, left } = migrateButtonSizes(before);
  expect(source).toContain('actions={<Button size="md">Accept</Button>}');
  expect(source).toContain('<Button {...props} size="icon-md" />');
  expect(left).toEqual([
    { line: 5, value: "sm", where: "<Banner size>" },
    { line: 6, value: "sm", where: "a string" },
    { line: 7, value: "icon-sm", where: "a regular expression" },
  ]);
});
