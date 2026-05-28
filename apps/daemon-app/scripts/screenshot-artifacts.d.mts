export interface ScreenshotPage {
  state: string;
  marker: string;
}

export interface ScreenshotManifestEntry {
  state: string;
  title: string;
  fileName: string;
  relativePath: string;
  absolutePath?: string;
}

export interface ScreenshotManifest {
  outputDir?: string;
  generatedAt: string;
  screenshots: ScreenshotManifestEntry[];
}

export interface ScreenshotCliArgs {
  outputDir: string;
  generatedAt: string | null;
  portableManifest: boolean;
  selectedPages: ScreenshotPage[];
  cleanOutputDir: boolean;
}

export function parseScreenshotCliArgs(
  argv: string[],
  options: {
    cwd: string;
    defaultOutputDir: string;
    pages?: ScreenshotPage[];
  },
): ScreenshotCliArgs;

export function buildScreenshotManifest(
  outputDir: string,
  selectedPages: ScreenshotPage[],
  files: string[],
  generatedAt?: string,
  options?: {
    portableManifest?: boolean;
  },
): ScreenshotManifest;

export function buildScreenshotIndexHtml(manifest: ScreenshotManifest): string;

export const screenshotPages: ScreenshotPage[];
