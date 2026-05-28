import { screenshotPages } from "./screenshot-artifacts.mjs";

function formatAvailableStates(pages) {
  return pages.map((page) => page.state).join(", ");
}

export function buildCaptureScreenshotsHelp(pages = screenshotPages) {
  return `Usage: pnpm screenshots -- [--state <state>] [--output-dir <dir>] [--generated-at <iso>] [--portable-manifest]

Available states: ${formatAvailableStates(pages)}
`;
}

export function buildCheckScreenshotOutputHelp(pages = screenshotPages) {
  return `Usage: node scripts/check-screenshot-output.mjs [--output-dir <dir>|<dir>] [--state <state>] [--portable-manifest]

Available states: ${formatAvailableStates(pages)}
`;
}

export function buildVerifyScreenshotsHelp(pages = screenshotPages) {
  return `Usage: pnpm screenshots:verify -- [--state <state>] [--output-dir <dir>] [--generated-at <iso>] [--portable-manifest]

Available states: ${formatAvailableStates(pages)}
`;
}
