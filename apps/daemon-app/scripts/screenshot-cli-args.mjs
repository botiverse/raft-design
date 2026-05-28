export function normalizeScreenshotCliArgs(argv) {
  return argv[0] === "--" ? argv.slice(1) : argv;
}

export function screenshotCliHasHelpFlag(argv) {
  const normalizedArgs = normalizeScreenshotCliArgs(argv);
  return normalizedArgs.includes("--help") || normalizedArgs.includes("-h");
}
