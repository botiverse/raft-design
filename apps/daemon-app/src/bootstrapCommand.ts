import { parseDaemonCliArgs } from "@slock-ai/daemon/core";
import { normalizeServerOrigin } from "./serverBaseUrl";

export interface ParsedMachineBootstrap {
  apiKey: string;
  serverUrl: string | null;
  source: "command" | "raw-key";
}

function stripMatchingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function tokenizeShellArgs(raw: string): string[] {
  const matches = raw.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return matches.map((part) => stripMatchingQuotes(part));
}

function stripTrailingShellComment(raw: string): string {
  let activeQuote: '"' | "'" | null = null;

  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === '"' || char === "'") {
      activeQuote = activeQuote === char ? null : activeQuote ?? char;
      continue;
    }

    if (char === "#" && !activeQuote && (index === 0 || /\s/.test(raw[index - 1] ?? ""))) {
      return raw.slice(0, index).trimEnd();
    }
  }

  return raw;
}

export function normalizeDaemonServerUrl(rawUrl: string): string {
  return normalizeServerOrigin(rawUrl);
}

export function parseMachineBootstrapInput(raw: string): ParsedMachineBootstrap | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const parsedArgs = parseDaemonCliArgs(tokenizeShellArgs(stripTrailingShellComment(trimmed).replace(/\s+/g, " ")));
  if (parsedArgs) {
    return {
      apiKey: parsedArgs.apiKey,
      serverUrl: normalizeDaemonServerUrl(parsedArgs.serverUrl),
      source: "command",
    };
  }

  if (/^sk_machine_[A-Za-z0-9._-]+$/.test(trimmed)) {
    return {
      apiKey: trimmed,
      serverUrl: null,
      source: "raw-key",
    };
  }

  return null;
}
