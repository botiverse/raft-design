import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("auth frame uses the same yellow top bar language as the mobile app", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/brand/AuthBrandShell.tsx"),
    "utf8",
  );

  assert.match(
    source,
    /AUTH_BRAND_SHELL_CLASS =\s+"min-h-0 flex-1 overflow-y-auto bg-white font-display safe-top safe-bottom"/,
  );
  assert.match(source, /AUTH_BRAND_STACK_CLASS =\s+"flex min-h-full w-full flex-col"/);
  assert.match(source, /AUTH_BRAND_TOP_BAR_CLASS =/);
  assert.match(
    source,
    /flex h-panel-header shrink-0 items-center border-b-2 border-black bg-brutal-yellow px-4/,
  );
  assert.match(source, /import SlockBrandLockup from "\.\/SlockBrandLockup";/);
  assert.match(source, /<SlockBrandLockup className="h-5 w-auto" \/>/);
  assert.doesNotMatch(source, /bg-black|text-brutal-yellow/);
  assert.doesNotMatch(source, /WHERE HUMANS AND AI AGENTS COLLABORATE/);
  assert.ok(
    source.indexOf("<AuthBrandTopBar />") < source.indexOf("<div className={`w-full ${maxWidthClass}`}>"),
    "brand header must render before the centered form content",
  );
  assert.doesNotMatch(source, /absolute left-|pointer-events-none|top-4|fixed|justify-center">\s*<SlockBrandLockup/);
  assert.doesNotMatch(source, /pt-24|sm:pt-16|-translate-y|translate-y-0/);
});

test("AuthPageFrame delegates to the shared centered card frame", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/auth/AuthPageFrame.tsx"),
    "utf8",
  );

  assert.match(source, /export \{ default, AuthBrandIntro as AuthPageIntro \} from "\.\.\/brand\/AuthBrandShell";/);
  assert.doesNotMatch(source, /absolute left-|pointer-events-none|top-4/);
});

test("shared auth brand shell provides the Sign In intro primitive", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/brand/AuthBrandShell.tsx"),
    "utf8",
  );

  assert.match(source, /export function AuthBrandIntro/);
  assert.match(source, /src="\/brand\/slock-icon\.svg"/);
  assert.match(source, /className="mx-auto mb-4 size-9"/);
  assert.match(source, /<h1 className="text-xl font-bold">\{title\}<\/h1>/);
});

test("server picker uses the same branded centered card frame", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/auth/ServerSelector.tsx"),
    "utf8",
  );

  assert.match(source, /import CenteredCardFrame from "\.\/CenteredCardFrame";/);
  assert.equal(source.split("<CenteredCardFrame>").length - 1, 2);
  assert.doesNotMatch(source, /SERVER_SELECTOR_SHELL_CLASS|SERVER_SELECTOR_CENTER_CLASS/);
  assert.doesNotMatch(source, /items-center justify-center bg-brutal-cream font-display p-4 safe-top overflow-y-auto/);
});

test("server picker lets the shared auth shell own long-list scrolling", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/auth/ServerSelector.tsx"),
    "utf8",
  );

  assert.match(source, /data-testid="server-selector-list"/);
  assert.doesNotMatch(source, /max-h-\[calc\(100dvh-160px\)\]/);
  assert.doesNotMatch(source, /overflow-y-auto overscroll-contain/);
  assert.match(source, /className="mb-6 space-y-2"/);
  assert.match(source, /btn-brutal w-full bg-brutal-yellow/);
  assert.match(source, /className="mt-3 text-center"/);
});

test("centered web pages use the shared auth frame without an outer brutal card", () => {
  for (const file of [
    "LoginPage.tsx",
    "RegisterPage.tsx",
    "ForgotPasswordPage.tsx",
    "ResetPasswordPage.tsx",
    "InviteAcceptPage.tsx",
    "EmailVerificationPage.tsx",
    "ServerSelector.tsx",
    "SocialAuthCallbackPage.tsx",
  ]) {
    const source = readFileSync(
      resolve(repoRoot, `src/components/auth/${file}`),
      "utf8",
    );

    assert.doesNotMatch(
      source,
      /w-full border-2 border-black bg-white p-8(?: text-center| text-center text-xl font-bold)? shadow-brutal/,
      `${file} must not wrap the auth surface in a heavy card`,
    );
  }
});

test("invite and email verification pages use the branded auth frame", () => {
  for (const file of ["InviteAcceptPage.tsx", "EmailVerificationPage.tsx"]) {
    const source = readFileSync(
      resolve(repoRoot, `src/components/auth/${file}`),
      "utf8",
    );

    assert.match(source, /import CenteredCardFrame from "\.\/CenteredCardFrame";/);
    assert.match(source, /<CenteredCardFrame>/);
    assert.doesNotMatch(source, /flex min-h-0 flex-1 overflow-y-auto bg-brutal-cream font-display p-4 safe-top safe-bottom/);
  }
});

test("login page follows the modern auth layout and hides social buttons unless providers are enabled", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/auth/LoginPage.tsx"),
    "utf8",
  );

  assert.match(source, /useAuthProviders/);
  assert.match(source, /enabledProviders\.length > 0/);
  assert.match(source, /enabledProviders\.map\(\(provider\) =>/);
  assert.match(source, /import AuthPageFrame, \{ AuthPageIntro \} from "\.\/AuthPageFrame";/);
  assert.match(source, /import \{ CURRENT_LEGAL_ACCEPTANCE \} from "@slock-ai\/shared";/);
  assert.match(source, /<AuthPageIntro title="Sign In" \/>/);
  assert.match(source, /uppercase tracking-widest text-black\/45">or<\/span>/);
  assert.match(source, /By continuing, you agree to the/);
  assert.match(source, /href=\{CURRENT_LEGAL_ACCEPTANCE\.termsUrl\}/);
  assert.match(source, /href=\{CURRENT_LEGAL_ACCEPTANCE\.privacyUrl\}/);
  assert.match(source, /className="mt-4 text-center text-xs leading-5 text-black\/60"/);
  assert.doesNotMatch(source, /SOCIAL_AUTH_PREVIEW_PROVIDERS/);
});

test("all centered auth surfaces reuse the Sign In intro layout", () => {
  for (const file of [
    "LoginPage.tsx",
    "RegisterPage.tsx",
    "ForgotPasswordPage.tsx",
    "ResetPasswordPage.tsx",
    "InviteAcceptPage.tsx",
    "EmailVerificationPage.tsx",
    "ServerSelector.tsx",
    "SocialAuthCallbackPage.tsx",
  ]) {
    const source = readFileSync(
      resolve(repoRoot, `src/components/auth/${file}`),
      "utf8",
    );

    assert.match(source, /AuthPageIntro/, `${file} should use the shared Sign In intro layout`);
    assert.doesNotMatch(source, /size-16 items-center justify-center border-2 border-black bg-brutal-(?:yellow|cyan|lime)/);
  }
});

test("legal acceptance checkbox uses the shared brutal checkbox primitive", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/auth/LegalAcceptanceCheckbox.tsx"),
    "utf8",
  );

  assert.match(source, /import Checkbox from "\.\.\/ui\/Checkbox";/);
  assert.match(source, /<Checkbox\s+size="md"/);
  assert.doesNotMatch(source, /accent-brutal-pink/);
  assert.doesNotMatch(source, /<input[\s\S]{0,120}type="checkbox"/);
});

test("social auth callback error recovery uses neutral sign-in language", () => {
  const source = readFileSync(
    resolve(repoRoot, "src/components/auth/SocialAuthCallbackPage.tsx"),
    "utf8",
  );

  assert.match(source, /Back to Sign In/);
  assert.match(source, /className="btn-brutal bg-white px-4 py-2 text-sm"/);
  assert.doesNotMatch(source, /Return to app|bg-brutal-cyan/);
});
