import path from "node:path";
import { normalizeScreenshotCliArgs } from "./screenshot-cli-args.mjs";

export const screenshotPages = [
  { state: "login", marker: "Slock Daemon — login" },
  { state: "setup", marker: "Slock Daemon — setup · Botiverse" },
  { state: "dashboard", marker: "Slock Daemon — dashboard · Botiverse" },
  { state: "providers", marker: "Slock Daemon — providers · Botiverse" },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function parseScreenshotCliArgs(argv, options) {
  const { cwd, defaultOutputDir, pages = screenshotPages } = options;
  const normalizedArgs = normalizeScreenshotCliArgs(argv);
  const pagesByState = new Map(pages.map((page) => [page.state, page]));
  let outputDir = defaultOutputDir;
  let generatedAt = null;
  let portableManifest = false;
  const selectedStates = [];

  for (let index = 0; index < normalizedArgs.length; index += 1) {
    const argument = normalizedArgs[index];
    if (argument === "--state") {
      const next = normalizedArgs[index + 1];
      if (!next) {
        throw new Error("Missing value for --state.");
      }
      selectedStates.push(next);
      index += 1;
      continue;
    }
    if (argument === "--output-dir") {
      const next = normalizedArgs[index + 1];
      if (!next) {
        throw new Error("Missing value for --output-dir.");
      }
      outputDir = path.resolve(cwd, next);
      index += 1;
      continue;
    }
    if (argument === "--generated-at") {
      const next = normalizedArgs[index + 1];
      if (!next) {
        throw new Error("Missing value for --generated-at.");
      }
      generatedAt = next;
      index += 1;
      continue;
    }
    if (argument === "--portable-manifest") {
      portableManifest = true;
      continue;
    }
    throw new Error(`Unknown screenshot argument: ${argument}`);
  }

  const resolvedStates = [...new Set(selectedStates.length > 0 ? selectedStates : pages.map((page) => page.state))];
  const selectedPages = resolvedStates.map((state) => {
    const page = pagesByState.get(state);
    if (!page) {
      throw new Error(`Unknown screenshot state: ${state}. Expected one of ${pages.map((entry) => entry.state).join(", ")}.`);
    }
    return page;
  });

  return {
    outputDir,
    generatedAt,
    portableManifest,
    selectedPages,
    cleanOutputDir: outputDir !== defaultOutputDir || selectedStates.length === 0,
  };
}

export function buildScreenshotManifest(
  outputDir,
  selectedPages,
  files,
  generatedAt = new Date().toISOString(),
  options = {},
) {
  const { portableManifest = false } = options;
  return {
    ...(portableManifest ? {} : { outputDir }),
    generatedAt,
    screenshots: selectedPages.map((page, index) => ({
      state: page.state,
      title: page.marker,
      fileName: path.basename(files[index]),
      relativePath: path.basename(files[index]),
      ...(portableManifest ? {} : { absolutePath: files[index] }),
    })),
  };
}

export function buildScreenshotIndexHtml(manifest) {
  const cards = manifest.screenshots
    .map(
      (entry) => `
        <article class="card">
          <div class="meta">
            <div>
              <h2>${escapeHtml(entry.state)}</h2>
              <p>${escapeHtml(entry.title)}</p>
            </div>
            <code>${escapeHtml(entry.fileName)}</code>
          </div>
          <a class="image-link" href="./${encodeURIComponent(entry.fileName)}">
            <img src="./${encodeURIComponent(entry.fileName)}" alt="${escapeHtml(entry.title)}" />
          </a>
        </article>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Slock Daemon Screenshots</title>
    <style>
      :root {
        color-scheme: light;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body {
        margin: 0;
        background: #f5f0dc;
        color: #111;
      }
      main {
        margin: 0 auto;
        max-width: 1400px;
        padding: 32px 24px 48px;
      }
      header {
        margin-bottom: 24px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
      }
      header p,
      header code {
        margin: 0;
        color: #555;
      }
      .grid {
        display: grid;
        gap: 20px;
      }
      .card {
        border: 3px solid #111;
        background: white;
        box-shadow: 8px 8px 0 #111;
        padding: 16px;
      }
      .meta {
        align-items: start;
        display: flex;
        gap: 12px;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .meta h2 {
        margin: 0 0 4px;
        font-size: 18px;
        text-transform: capitalize;
      }
      .meta p {
        margin: 0;
        color: #555;
      }
      .meta code {
        background: #f3f3f3;
        border: 2px solid #111;
        font-size: 12px;
        padding: 6px 8px;
      }
      .image-link {
        display: block;
      }
      img {
        border: 2px solid #111;
        display: block;
        height: auto;
        max-width: 100%;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Slock Daemon Screenshots</h1>
        <p>Generated at <code>${escapeHtml(manifest.generatedAt)}</code></p>
      </header>
      <section class="grid">
        ${cards}
      </section>
    </main>
  </body>
</html>`;
}
