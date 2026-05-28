import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

// #proj-chat task #33: Gravatar is requested with `d=404`, so humans without
// a registered Gravatar (the common case — the server always derives a
// gravatarHash from the email, so the placeholder branch never triggers for
// server members) used to render a broken-image box until onError fired. The
// fix gates the Gravatar <img> behind a successful onLoad: the clean User
// placeholder shows by default and the image only replaces it once it loads.
// (Regression introduced by #1843, which moved human mention candidates from
// a forced placeholder onto the Gravatar path.)

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(
  resolve(repoRoot, "src/components/member/GravatarAvatar.tsx"),
  "utf8",
);

test("GravatarAvatar gates the Gravatar image behind a successful onLoad", () => {
  assert.match(
    source,
    /onLoad=\{\(\) => \{[\s\S]*loadedGravatarHashes\.add\(hash\)[\s\S]*setGravatarLoaded\(true\);[\s\S]*\}\}/,
    "the Gravatar <img> must flip a loaded flag via onLoad",
  );
  assert.match(
    source,
    /onError=\{\(\) => \{[\s\S]*failedGravatarHashes\.add\(hash\)[\s\S]*setFailed\(true\);[\s\S]*\}\}/,
    "the Gravatar <img> must still fall back on error",
  );
});

test("GravatarAvatar shows the User placeholder until the Gravatar loads", () => {
  assert.match(
    source,
    /\{!gravatarLoaded && <User size=\{iconSize\} className="relative z-10" \/>\}/,
    "the User placeholder must render while the Gravatar has not loaded",
  );
  assert.match(
    source,
    /: "absolute inset-0 h-full w-full object-cover opacity-0 pointer-events-none"/,
    "the Gravatar <img> must stay mounted but transparent until it has loaded",
  );
  assert.doesNotMatch(
    source,
    /: "hidden"/,
    "the Gravatar <img> must not use display:none, which can make repeated row probes inconsistent",
  );
});

test("GravatarAvatar resets load state from the shared cache when the identity inputs change", () => {
  // Without this reset, switching the rendered person (new hash/email) could
  // keep showing the previous person's loaded Gravatar or fallback state.
  assert.match(
    source,
    /const applyHash = \(nextHash: string \| null\) => \{[\s\S]*setFailed\(nextHash \? failedGravatarHashes\.has\(nextHash\) : false\);[\s\S]*setGravatarLoaded\(nextHash \? loadedGravatarHashes\.has\(nextHash\) : false\);[\s\S]*\};/,
    "identity changes must reset loaded/failed state from the cache via one transition helper",
  );
  assert.match(
    source,
    /applyHash\(null\);\s*sha256Hex\(email\.trim\(\)\.toLowerCase\(\)\)\.then\(applyHash\)/,
    "client-side email hash fallback must flow through the same transition helper",
  );
});

test("GravatarAvatar caches loaded and failed Gravatar hashes across repeated rows", () => {
  assert.match(
    source,
    /const loadedGravatarHashes = new Set<string>\(\)/,
    "loaded Gravatar hashes must be cached outside each avatar instance",
  );
  assert.match(
    source,
    /const failedGravatarHashes = new Set<string>\(\)/,
    "failed Gravatar hashes must be cached outside each avatar instance",
  );
  assert.match(
    source,
    /loadedGravatarHashes\.has\(initialHash\)/,
    "a repeated avatar for an already loaded hash should render loaded immediately",
  );
  assert.match(
    source,
    /loadedGravatarHashes\.add\(hash\)/,
    "successful Gravatar loads must seed the shared loaded cache",
  );
  assert.match(
    source,
    /failedGravatarHashes\.add\(hash\)/,
    "Gravatar 404s must seed the shared failed cache",
  );
});
