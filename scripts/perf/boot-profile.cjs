#!/usr/bin/env node
/*
 * Capture real browser boot and warm-navigation profiles for Slock web.
 *
 * Examples:
 *   pnpm perf:boot-profile -- --url https://app.slock.ai/s/community/channel/<channelId>
 *   pnpm perf:boot-profile -- --url https://app.slock.ai/s/community/channel/<channelId>?msg=<messageId> --profile /tmp/chrome-profile
 *   pnpm perf:boot-profile -- --url https://app.slock.ai/s/community/channel/<channelId> --nav-url https://app.slock.ai/s/community/channel/<otherChannelId>
 *
 * Auth note:
 *   This script does not handle login. Point --profile at a Chrome user-data-dir
 *   that already has Slock localStorage tokens, or copy the needed Local Storage
 *   folder into a temporary profile before running.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

function parseArgs(argv) {
  const options = {
    url: "https://app.slock.ai/",
    navUrl: "",
    out: path.join("artifacts", "perf", `boot-profile-${new Date().toISOString().replace(/[:.]/g, "-")}`),
    profile: process.env.SLOCK_BOOT_PROFILE_CHROME_PROFILE || path.join(os.tmpdir(), "slock-boot-profile-chrome"),
    executable: process.env.CHROME_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headed: false,
    waitMs: 5000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--") continue;
    if (arg === "--url") options.url = requireValue(argv, ++i, arg);
    else if (arg === "--nav-url") options.navUrl = requireValue(argv, ++i, arg);
    else if (arg === "--out") options.out = requireValue(argv, ++i, arg);
    else if (arg === "--profile") options.profile = requireValue(argv, ++i, arg);
    else if (arg === "--executable") options.executable = requireValue(argv, ++i, arg);
    else if (arg === "--wait-ms") options.waitMs = Number(requireValue(argv, ++i, arg));
    else if (arg === "--headed") options.headed = true;
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith("-") && options.url === "https://app.slock.ai/") {
      options.url = arg;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(options.waitMs) || options.waitMs < 0) {
    throw new Error("--wait-ms must be a non-negative number");
  }
  return options;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function printHelp() {
  console.log(`Usage: pnpm perf:boot-profile -- --url <url> [options]\n\nOptions:\n  --url <url>          Target Slock web URL. Defaults to https://app.slock.ai/\n  --nav-url <url>      Optional warm-navigation target. Opens --url first, waits\n                       for messages, then changes route in-page and measures readiness.\n  --out <dir>          Output directory. Defaults to artifacts/perf/boot-profile-<timestamp>\n  --profile <dir>      Chrome user-data-dir with existing auth tokens.\n  --executable <path>  Chrome executable path. Defaults to macOS Google Chrome.\n  --wait-ms <ms>       Extra wait after first useful messages. Defaults to 5000.\n  --headed             Run headed for visual debugging.\n`);
}

async function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    try {
      return require("@playwright/test");
    } catch (_nested) {
      const local = path.resolve("node_modules/.pnpm/playwright@1.59.1/node_modules/playwright/index.js");
      if (fs.existsSync(local)) return import(pathToFileURL(local).href);
      throw error;
    }
  }
}

function summarizeApi(resources) {
  const summary = new Map();
  for (const resource of resources) {
    if (!/\/api\//.test(resource.name)) continue;
    const endpoint = resource.name.replace(/^https?:\/\/[^/]+/, "").replace(/\?.*/, "");
    const current = summary.get(endpoint) || { endpoint, count: 0, firstMs: Infinity, lastMs: 0, maxDurationMs: 0 };
    current.count += 1;
    current.firstMs = Math.min(current.firstMs, Math.round(resource.startTime));
    current.lastMs = Math.max(current.lastMs, Math.round(resource.responseEnd));
    current.maxDurationMs = Math.max(current.maxDurationMs, Math.round(resource.duration));
    summary.set(endpoint, current);
  }
  return Array.from(summary.values()).sort((a, b) => a.firstMs - b.firstMs || a.endpoint.localeCompare(b.endpoint));
}

function summarizeStates(states) {
  return states.map((state) => ({
    tMs: Math.round(state.t),
    href: state.href,
    loading: state.loadingLines,
    hasChat: state.hasChat,
    hasMessages: state.hasMessages,
    channelCount: state.channelCount,
    textStart: String(state.textStart || "").replace(/\n/g, " | ").slice(0, 180),
  }));
}

async function waitForUsefulMessages(page, timeoutMs = 45000) {
  let error = null;
  await page.waitForFunction(() => {
    const text = document.body?.innerText || "";
    return /\bCHAT\b/.test(text) && /Load older messages/i.test(text);
  }, { timeout: timeoutMs }).catch((caught) => {
    error = caught instanceof Error ? caught.message : String(caught);
  });
  return error;
}

function eventTimeMs(events, label) {
  return events.find((event) => event.label === label)?.tMs ?? null;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  fs.mkdirSync(options.out, { recursive: true });
  const { chromium } = await loadPlaywright();

  const context = await chromium.launchPersistentContext(options.profile, {
    executablePath: options.executable,
    headless: !options.headed,
    viewport: { width: 1440, height: 1000 },
    args: ["--profile-directory=Default", "--disable-background-timer-throttling"],
  });

  try {
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    await client.send("Performance.enable");
    await client.send("Network.enable");

    const responses = [];
    const failures = [];
    const consoleLogs = [];
    const events = [];

    page.on("console", (message) => {
      consoleLogs.push({ ts: Date.now(), type: message.type(), text: message.text().slice(0, 500) });
    });
    page.on("response", (response) => {
      const request = response.request();
      responses.push({
        ts: Date.now(),
        url: response.url(),
        status: response.status(),
        method: request.method(),
        resourceType: request.resourceType(),
        fromServiceWorker: response.fromServiceWorker(),
        timing: request.timing(),
      });
    });
    page.on("requestfailed", (request) => {
      failures.push({ ts: Date.now(), url: request.url(), method: request.method(), failure: request.failure()?.errorText });
    });

    await page.addInitScript(() => {
      window.__slockPerf = { states: [], start: performance.now() };
      const capture = () => {
        const text = document.body?.innerText || "";
        const loadingLines = text.split("\n").filter((line) => /Loading|Restoring|Preparing|Load older/i.test(line)).slice(0, 12);
        const hasChat = /\bCHAT\b/.test(text);
        const hasMessages = /Load older messages/i.test(text) && hasChat;
        const channelCount = document.body?.innerText?.match(/CHANNELS\n\d+/)?.[0] || null;
        const state = { t: performance.now(), href: location.href, loadingLines, hasChat, hasMessages, channelCount, textStart: text.slice(0, 180) };
        const last = window.__slockPerf.states[window.__slockPerf.states.length - 1];
        const key = JSON.stringify({ loadingLines, hasChat, hasMessages, channelCount, href: location.href });
        if (!last || last.key !== key) window.__slockPerf.states.push({ ...state, key });
      };
      const observer = new MutationObserver(capture);
      window.addEventListener("DOMContentLoaded", () => {
        capture();
        observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
        window.__slockPerf.interval = setInterval(capture, 50);
      });
      window.addEventListener("load", capture);
    });

    const wallStart = Date.now();
    events.push({ ts: wallStart, label: "goto-start", targetUrl: options.url, iso: new Date().toISOString() });
    await page.goto(options.url, { waitUntil: "domcontentloaded", timeout: 60000 });
    events.push({ ts: Date.now(), label: "domcontentloaded" });
    await page.waitForLoadState("load", { timeout: 60000 }).catch(() => {});
    events.push({ ts: Date.now(), label: "load-state-load" });
    const firstUsefulError = await waitForUsefulMessages(page);
    events.push({ ts: Date.now(), label: firstUsefulError ? "first-useful-timeout" : "first-useful-messages", error: firstUsefulError });

    let warmNavigation = null;
    if (options.navUrl) {
      const navStartWall = Date.now();
      const navStartPerf = await page.evaluate(() => performance.now());
      events.push({ ts: navStartWall, label: "warm-navigation-start", targetUrl: options.navUrl });
      const targetHref = await page.evaluate((targetUrl) => {
        const url = new URL(targetUrl, location.href);
        if (url.origin !== location.origin) {
          throw new Error(`--nav-url must stay on the same origin as --url: ${url.origin} !== ${location.origin}`);
        }
        window.history.pushState({}, "", url.href);
        window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
        return url.href;
      }, options.navUrl);
      await page.waitForFunction((href) => location.href === href, targetHref, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(50);
      const navUsefulError = await waitForUsefulMessages(page);
      const navEndPerf = await page.evaluate(() => performance.now());
      const navEndWall = Date.now();
      events.push({ ts: navEndWall, label: navUsefulError ? "warm-navigation-timeout" : "warm-navigation-first-useful", error: navUsefulError });
      warmNavigation = {
        targetUrl: options.navUrl,
        targetHref,
        startPerfMs: navStartPerf,
        endPerfMs: navEndPerf,
        durationMs: navEndWall - navStartWall,
        error: navUsefulError,
      };
    }

    await page.waitForTimeout(options.waitMs);

    const cdpMetrics = await client.send("Performance.getMetrics");
    const data = await page.evaluate(() => ({
      href: location.href,
      title: document.title,
      perf: performance.getEntriesByType("navigation")[0]?.toJSON?.() || null,
      resources: performance.getEntriesByType("resource")
        .map((entry) => entry.toJSON())
        .filter((entry) => /\/api\/|assets|\.js|\.css|socket|app\.slock|api\.slock|slock-server/i.test(entry.name)),
      states: window.__slockPerf?.states || [],
      localStorageKeys: Object.keys(localStorage).filter((key) => key.startsWith("slock")).sort(),
      bodyText: document.body?.innerText?.slice(0, 1000) || "",
    }));

    await page.screenshot({ path: path.join(options.out, "final.png"), fullPage: false });
    const eventsWithDeltas = events.map(({ ts, ...event }) => ({ ...event, tMs: ts - wallStart }));
    const warmNavigationSummary = warmNavigation ? {
      ...warmNavigation,
      startPerfMs: Math.round(warmNavigation.startPerfMs),
      endPerfMs: Math.round(warmNavigation.endPerfMs),
      states: summarizeStates(data.states.filter((state) => state.t >= warmNavigation.startPerfMs)),
      api: summarizeApi(data.resources.filter((resource) => resource.startTime >= warmNavigation.startPerfMs)),
    } : null;
    const summary = {
      url: options.url,
      navUrl: options.navUrl || null,
      finalHref: data.href,
      domContentLoadedMs: Math.round(data.perf?.domContentLoadedEventEnd ?? 0),
      coldFirstUsefulMessagesMs: eventTimeMs(eventsWithDeltas, "first-useful-messages"),
      events: eventsWithDeltas,
      warmNavigation: warmNavigationSummary,
      states: summarizeStates(data.states),
      api: summarizeApi(data.resources),
      failures,
    };
    const payload = { options, wallStart, events, responses, failures, consoleLogs, cdpMetrics: cdpMetrics.metrics, ...data, summary };
    fs.writeFileSync(path.join(options.out, "profile.json"), JSON.stringify(payload, null, 2));
    fs.writeFileSync(path.join(options.out, "summary.json"), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await context.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
