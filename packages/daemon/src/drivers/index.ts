import type { RuntimeDriver } from "./types.js";
import { ClaudeDriver } from "./claude.js";
import { CodexDriver } from "./codex.js";
import { AntigravityDriver } from "./antigravity.js";
import { CopilotDriver } from "./copilot.js";
import { CursorDriver } from "./cursor.js";
import { GeminiDriver } from "./gemini.js";
import { KimiDriver } from "./kimi.js";
import { OpenCodeDriver } from "./opencode.js";

export type { RuntimeDriver, ParsedEvent, SpawnContext, SpawnResult } from "./types.js";

const driverFactories: Record<string, () => RuntimeDriver> = {
  claude: () => new ClaudeDriver(),
  codex: () => new CodexDriver(),
  antigravity: () => new AntigravityDriver(),
  copilot: () => new CopilotDriver(),
  cursor: () => new CursorDriver(),
  gemini: () => new GeminiDriver(),
  kimi: () => new KimiDriver(),
  opencode: () => new OpenCodeDriver(),
};

/** Get the driver for a runtime ID. Throws if unknown. */
export function getDriver(runtimeId: string): RuntimeDriver {
  const createDriver = driverFactories[runtimeId];
  const driver = createDriver?.();
  if (!driver) {
    throw new Error(`Unknown runtime: ${runtimeId}. Available: ${Object.keys(driverFactories).join(", ")}`);
  }
  return driver;
}
