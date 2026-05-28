import { app, BrowserWindow } from "electron";
import { createServer } from "node:http";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildScreenshotIndexHtml,
  buildScreenshotManifest,
  parseScreenshotCliArgs,
  screenshotPages,
} from "./screenshot-artifacts.mjs";
import { screenshotCliHasHelpFlag } from "./screenshot-cli-args.mjs";
import { buildCaptureScreenshotsHelp } from "./screenshot-help.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const packageRoot = path.resolve(scriptDir, "..");
const rendererRoot = path.join(packageRoot, "dist", "renderer");
const preloadPath = path.join(scriptDir, "screenshot-preload.cjs");
const defaultOutputDir = path.join(packageRoot, "artifacts", "screenshots");

if (process.env.DAEMON_APP_USER_DATA_DIR) {
  app.setPath("userData", process.env.DAEMON_APP_USER_DATA_DIR);
}

const pages = screenshotPages;
const rawArgs = process.argv.slice(2);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createStaticServer(rootDir) {
  const server = createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1");
      let pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname === "/") {
        pathname = "/index.html";
      }
      const resolvedPath = path.resolve(rootDir, `.${pathname}`);
      if (!resolvedPath.startsWith(rootDir)) {
        res.writeHead(403).end("forbidden");
        return;
      }
      const data = await readFile(resolvedPath);
      const contentType = contentTypes[path.extname(resolvedPath)] ?? "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    } catch {
      res.writeHead(404).end("not found");
    }
  });

  return {
    async start() {
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
          server.off("error", reject);
          resolve();
        });
      });
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Failed to determine screenshot server port.");
      }
      return `http://127.0.0.1:${address.port}`;
    },
    async stop() {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    },
  };
}

async function waitForReady(window, marker, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let lastState = null;
  while (Date.now() < deadline) {
    const state = await window.webContents.executeJavaScript(`(() => ({
      preload: document.documentElement.dataset.daemonAppPreload,
      title: document.title,
      stylesheets: Array.from(document.styleSheets).length
    }))()`);
    lastState = state;
    if (state.preload === "ready" && state.title.includes(marker) && state.stylesheets > 0) {
      return;
    }
    await delay(100);
  }
  throw new Error(
    `Timed out waiting for screenshot renderer marker: ${marker} (last state: ${JSON.stringify(lastState)})`,
  );
}

function createCaptureWindow() {
  return new BrowserWindow({
    show: false,
    width: 1400,
    height: 980,
    backgroundColor: "#fff9db",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
}

function createKeepAliveWindow() {
  return new BrowserWindow({
    show: false,
    width: 1,
    height: 1,
    backgroundColor: "#fff9db",
  });
}

async function captureScreenshotPage(baseUrl, page, outputDir) {
  const window = createCaptureWindow();
  try {
    await window.loadURL(`${baseUrl}/index.html?state=${encodeURIComponent(page.state)}&capture=${Date.now()}`);
    await waitForReady(window, page.marker);
    await window.webContents.executeJavaScript(
      "document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)",
    );
    await delay(250);
    const image = await window.webContents.capturePage();
    const filePath = path.join(outputDir, `daemon-${page.state}.png`);
    await writeFile(filePath, image.toPNG());
    return filePath;
  } finally {
    if (!window.isDestroyed()) {
      window.destroy();
    }
  }
}

async function main() {
  if (screenshotCliHasHelpFlag(rawArgs)) {
    console.log(buildCaptureScreenshotsHelp(pages));
    return;
  }

  const { outputDir, generatedAt, portableManifest, selectedPages, cleanOutputDir } = parseScreenshotCliArgs(
    rawArgs,
    {
      cwd: process.cwd(),
      defaultOutputDir,
      pages,
    },
  );
  if (cleanOutputDir) {
    await rm(outputDir, { recursive: true, force: true });
  }
  await mkdir(outputDir, { recursive: true });
  await app.whenReady();

  const staticServer = createStaticServer(rendererRoot);
  const baseUrl = await staticServer.start();
  const keepAliveWindow = createKeepAliveWindow();

  try {
    const files = [];
    for (const page of selectedPages) {
      files.push(await captureScreenshotPage(baseUrl, page, outputDir));
    }
    const manifest = buildScreenshotManifest(outputDir, selectedPages, files, generatedAt ?? undefined, {
      portableManifest,
    });
    await writeFile(
      path.join(outputDir, "manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    );
    await writeFile(
      path.join(outputDir, "index.html"),
      buildScreenshotIndexHtml(manifest),
      "utf8",
    );
    console.log(
      JSON.stringify(
        {
          ...manifest,
          indexFile: path.join(outputDir, "index.html"),
        },
        null,
        2,
      ),
    );
  } finally {
    if (!keepAliveWindow.isDestroyed()) {
      keepAliveWindow.destroy();
    }
    await staticServer.stop();
    app.quit();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
  app.quit();
});
