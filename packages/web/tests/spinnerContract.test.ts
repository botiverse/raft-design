import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Spinner from "../src/components/ui/Spinner";

const repoRoot = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(repoRoot, path), "utf8");

test("Spinner exposes xs/sm/md/lg + default/inverse + ring visual", () => {
  const xsDefault = renderToStaticMarkup(
    React.createElement(Spinner, { size: "xs" }),
  );
  const smDefault = renderToStaticMarkup(
    React.createElement(Spinner, { size: "sm" }),
  );
  const mdDefault = renderToStaticMarkup(
    React.createElement(Spinner, { size: "md" }),
  );
  const lgInverse = renderToStaticMarkup(
    React.createElement(Spinner, { size: "lg", variant: "inverse" }),
  );

  // Size axis is physical px tuned to the existing inline spinners the
  // primitive replaces. Don't add intermediate tiers without first
  // checking that no existing callsite already fits an existing tier.
  assert.match(xsDefault, /size-2\.5/);
  assert.match(smDefault, /size-4/);
  assert.match(mdDefault, /size-5/);
  assert.match(lgInverse, /size-8/);

  // Ring visual: rounded-full + animate-spin + border-2 with track + tip.
  assert.match(mdDefault, /rounded-full/);
  assert.match(mdDefault, /animate-spin/);
  assert.match(mdDefault, /border-2/);

  // Default tone is black-on-light: faded black track with solid black tip.
  assert.match(mdDefault, /border-black\/20 border-t-black/);

  // Inverse tone is white-on-dark: faded white track with solid white tip.
  assert.match(lgInverse, /border-white\/40 border-t-white/);

  // role=status + aria-label so screen readers announce the loading state
  // (the inline div spinners this replaces had no a11y at all).
  assert.match(mdDefault, /role="status"/);
  assert.match(mdDefault, /aria-label="Loading"/);
});

test("Spinner accepts custom label and merges className", () => {
  const html = renderToStaticMarkup(
    React.createElement(Spinner, {
      size: "sm",
      label: "Uploading",
      className: "absolute bottom-2 right-2",
    }),
  );
  assert.match(html, /aria-label="Uploading"/);
  assert.match(html, /absolute bottom-2 right-2/);
});

test("no inline ring-style `rounded-full ... animate-spin` div outside Spinner.tsx", () => {
  // Pure CSS ring spinners must go through <Spinner>. Catches the pattern
  // `<div className="... rounded-full ... animate-spin ..." />` and its
  // span equivalent. Lucide icons spinning (RefreshCw, Loader2) are a
  // different concern — handled by the next test.
  const componentsDir = resolve(repoRoot, "src");
  let hits = "";
  try {
    hits = execSync(
      `grep -RnE '<(div|span)[^>]*rounded-full[^>]*animate-spin' ${componentsDir}`,
      { encoding: "utf8" },
    );
  } catch (err: any) {
    if (err.status === 1) hits = "";
    else throw err;
  }
  // Spinner.tsx is the only file allowed to emit this pattern.
  const allowed = hits
    .split("\n")
    .filter((line) => line && !line.includes("/components/ui/Spinner.tsx"))
    .join("\n");
  assert.equal(
    allowed.trim(),
    "",
    `inline ring spinners are banned — use <Spinner> instead:\n${allowed}`,
  );
});

test("no `<Loader2 ... animate-spin />` outside Spinner.tsx", () => {
  // Loader2 from lucide-react was the second hand-rolled spinner pattern.
  // Migrated to <Spinner>; ban it from coming back. RefreshCw is a
  // separate semantic (refresh-icon-as-affordance, spinning during its
  // own action) and is intentionally NOT banned.
  const componentsDir = resolve(repoRoot, "src");
  let hits = "";
  try {
    hits = execSync(
      `grep -RnE '<Loader2[^/>]*animate-spin' ${componentsDir}`,
      { encoding: "utf8" },
    );
  } catch (err: any) {
    if (err.status === 1) hits = "";
    else throw err;
  }
  // Spinner.tsx mentions the banned pattern in its docstring as a "do
  // not write this; use <Spinner> instead" note. That's not a callsite,
  // exclude it from the check.
  const allowed = hits
    .split("\n")
    .filter((line) => line && !line.includes("/components/ui/Spinner.tsx"))
    .join("\n");
  assert.equal(
    allowed.trim(),
    "",
    `<Loader2 ... animate-spin /> is banned — use <Spinner> instead:\n${allowed}`,
  );
});

test("migrated callsites import and use Spinner", () => {
  const imageLightbox = read("src/components/ImageLightbox.tsx");
  const attachmentChip = read("src/components/message/AttachmentChip.tsx");
  const messageItem = read("src/components/message/MessageItem.tsx");
  const messageInput = read("src/components/message/MessageInput.tsx");
  const selectModeToolbar = read("src/components/message/SelectModeToolbar.tsx");
  const agentWorkspace = read("src/components/agent/AgentWorkspace.tsx");

  assert.match(imageLightbox, /import Spinner from "\.\/ui\/Spinner"/);
  assert.match(imageLightbox, /<Spinner size="lg" variant="inverse"/);

  assert.match(attachmentChip, /import Spinner from "\.\.\/ui\/Spinner"/);
  assert.match(attachmentChip, /<Spinner size="sm"/);

  assert.match(messageItem, /import Spinner from "\.\.\/ui\/Spinner"/);
  assert.match(messageItem, /<Spinner size="xs"/);
  assert.match(messageItem, /<Spinner size="md" variant="inverse"/);

  assert.match(messageInput, /import Spinner from "\.\.\/ui\/Spinner"/);
  assert.match(messageInput, /<Spinner size="sm"/);

  assert.match(selectModeToolbar, /import Spinner from "\.\.\/ui\/Spinner"/);
  assert.match(selectModeToolbar, /<Spinner size="sm"/);

  assert.match(agentWorkspace, /import Spinner from "\.\.\/ui\/Spinner"/);
  assert.match(agentWorkspace, /<Spinner size="xs"/);
});
