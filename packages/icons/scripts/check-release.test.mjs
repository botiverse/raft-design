import { expect, test } from "vite-plus/test";
import { releaseError, shipped } from "./check-release.mjs";

const icon = "packages/icons/src/action-icons.tsx";

test("a code change under a version already on npm stops the release, and names the fix", () => {
  const error = releaseError({
    changed: [icon],
    version: "0.1.0",
    previousVersion: "0.1.0",
    published: true,
  });
  expect(error).toContain("@botiverse/ricons@0.1.0 is already on npm");
  expect(error).toContain(icon);
  expect(error).toContain('bump "version" in packages/icons/package.json');
  expect(error).toContain("packages/icons/CHANGELOG.md");
});

test("a bumped version goes on, published by hand already or not", () => {
  for (const published of [true, false]) {
    expect(
      releaseError({ changed: [icon], version: "0.2.0", previousVersion: "0.1.0", published }),
    ).toBeNull();
  }
});

test("the first release of ricons goes on: the previous tag has no ricons", () => {
  expect(
    releaseError({ changed: [icon], version: "0.1.0", previousVersion: null, published: true }),
  ).toBeNull();
});

test("a version not on npm yet goes on: the publish step will publish it", () => {
  expect(
    releaseError({ changed: [icon], version: "0.1.0", previousVersion: "0.1.0", published: false }),
  ).toBeNull();
});

test("tests and docs don't ship, so changing only them goes on", () => {
  const changed = [
    "packages/icons/src/icons.unfollow-artifact.browser.test.tsx",
    "packages/icons/src/icons.md",
  ];
  expect(changed.some(shipped)).toBe(false);
  expect(
    releaseError({ changed, version: "0.1.0", previousVersion: "0.1.0", published: true }),
  ).toBeNull();
});

test("the stylesheet and the source modules ship", () => {
  expect(shipped("packages/icons/src/styles.css")).toBe(true);
  expect(shipped("packages/icons/src/index.ts")).toBe(true);
  expect(shipped("packages/icons/package.json")).toBe(false);
});
