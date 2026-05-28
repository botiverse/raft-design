import type { ScreenshotManifest, ScreenshotPage } from "./screenshot-artifacts.mjs";

export interface ScreenshotVerifyCliArgs {
  outputDir: string;
  portableManifest: boolean;
  selectedPages: ScreenshotPage[];
}

export function parseScreenshotVerifyCliArgs(
  argv: string[],
  options: {
    cwd: string;
    defaultOutputDir: string;
    pages?: ScreenshotPage[];
  },
): ScreenshotVerifyCliArgs;

export function verifyScreenshotArtifacts(
  manifest: ScreenshotManifest,
  indexHtml: string,
  options?: {
    pages?: ScreenshotPage[];
    portableManifest?: boolean;
  },
): {
  screenshots: number;
  fileNames: string[];
};
