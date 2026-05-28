import { normalizeScreenshotCliArgs } from "./screenshot-cli-args.mjs";

export const DEFAULT_VERIFY_SCREENSHOT_GENERATED_AT = "2026-04-10T00:00:00.000Z";

export function normalizeVerifyScreenshotArgs(argv) {
  const normalizedArgs = normalizeScreenshotCliArgs(argv);
  const nextArgs = [...normalizedArgs];

  if (!nextArgs.includes("--portable-manifest")) {
    nextArgs.push("--portable-manifest");
  }
  if (!nextArgs.includes("--generated-at")) {
    nextArgs.push("--generated-at", DEFAULT_VERIFY_SCREENSHOT_GENERATED_AT);
  }

  return nextArgs;
}
