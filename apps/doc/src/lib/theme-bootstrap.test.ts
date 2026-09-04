import { runInNewContext } from "node:vm";
import { beforeEach, describe, expect, it } from "vitest";
import {
  applyThemePresetToRoot,
  createThemeBootstrapScript,
  isThemePreset,
  resolveThemePreset,
} from "raft-ui";

type BootstrapStorage = Pick<Storage, "getItem">;
type BootstrapMatchMedia = (query: string) => Pick<MediaQueryList, "matches">;

function executeBootstrap(
  script: string,
  {
    storedPreset = null,
    storedValues,
    prefersDark = false,
    storageError,
  }: {
    storedPreset?: string | null;
    storedValues?: Record<string, string>;
    prefersDark?: boolean;
    storageError?: Error;
  } = {},
) {
  const requestedStorageKeys: string[] = [];
  const storage: BootstrapStorage = {
    getItem: (key) => {
      requestedStorageKeys.push(key);
      if (storageError) {
        throw storageError;
      }
      return storedValues?.[key] ?? storedPreset;
    },
  };
  const matchMedia: BootstrapMatchMedia = (query) => {
    expect(query).toBe("(prefers-color-scheme: dark)");
    return { matches: prefersDark };
  };
  runInNewContext(script, {
    atob: window.atob.bind(window),
    document,
    localStorage: storage,
    matchMedia,
  });

  return requestedStorageKeys;
}

function createUnsignedToken(subject: string, type = "access") {
  const encode = (value: object) =>
    window
      .btoa(JSON.stringify(value))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replaceAll("=", "");

  return `${encode({ alg: "none" })}.${encode({ sub: subject, type })}.`;
}

function expectRootTheme(theme: "brutal" | "elegant", mode: "light" | "dark") {
  const root = document.documentElement;
  expect(root.dataset.theme).toBe(theme);
  expect(root.classList.contains("light")).toBe(theme === "elegant" && mode === "light");
  expect(root.classList.contains("dark")).toBe(theme === "elegant" && mode === "dark");
  expect(root.style.colorScheme).toBe(theme === "elegant" ? mode : "light");
}

describe("theme preset contract", () => {
  beforeEach(() => {
    const root = document.documentElement;
    delete root.dataset.theme;
    root.classList.remove("light", "dark");
    root.style.removeProperty("color-scheme");
  });

  it("accepts only the four public presets", () => {
    expect(isThemePreset("brutal")).toBe(true);
    expect(isThemePreset("elegant-light")).toBe(true);
    expect(isThemePreset("elegant-dark")).toBe(true);
    expect(isThemePreset("elegant-system")).toBe(true);
    expect(isThemePreset("elegant")).toBe(false);
    expect(isThemePreset("dark")).toBe(false);
    expect(isThemePreset(null)).toBe(false);
  });

  it("maps every preset onto the existing family and mode axes", () => {
    expect(resolveThemePreset("brutal", "dark")).toEqual({
      theme: "brutal",
      mode: "light",
      resolvedMode: "light",
    });
    expect(resolveThemePreset("elegant-light", "dark")).toEqual({
      theme: "elegant",
      mode: "light",
      resolvedMode: "light",
    });
    expect(resolveThemePreset("elegant-dark", "light")).toEqual({
      theme: "elegant",
      mode: "dark",
      resolvedMode: "dark",
    });
    expect(resolveThemePreset("elegant-system", "dark")).toEqual({
      theme: "elegant",
      mode: "system",
      resolvedMode: "dark",
    });
  });

  it("applies root DOM state and removes stale family classes", () => {
    const root = document.documentElement;

    applyThemePresetToRoot(root, "elegant-dark", "light");
    expectRootTheme("elegant", "dark");

    applyThemePresetToRoot(root, "brutal", "dark");
    expectRootTheme("brutal", "light");
  });

  it("bootstraps a stored preset synchronously before React starts", () => {
    const script = createThemeBootstrapScript({ storageKey: "raft-theme" });

    executeBootstrap(script, { storedPreset: "elegant-dark" });

    expectRootTheme("elegant", "dark");
  });

  it("resolves the system preset from the current media query", () => {
    const script = createThemeBootstrapScript({ storageKey: "raft-theme" });

    executeBootstrap(script, { storedPreset: "elegant-system", prefersDark: true });
    expectRootTheme("elegant", "dark");

    executeBootstrap(script, { storedPreset: "elegant-system", prefersDark: false });
    expectRootTheme("elegant", "light");
  });

  it("isolates stored presets by the active JWT subject", () => {
    const script = createThemeBootstrapScript({
      storageKeyPrefix: "raft:theme-preset:v1:",
      account: { kind: "jwt-sub", tokenStorageKey: "slock_access_token" },
    });
    const sharedPresets = {
      "raft:theme-preset:v1:account-a": "elegant-dark",
      "raft:theme-preset:v1:account-b": "elegant-light",
    };

    const accountAKeys = executeBootstrap(script, {
      storedValues: {
        ...sharedPresets,
        slock_access_token: createUnsignedToken("account-a"),
      },
    });
    expect(accountAKeys).toEqual(["slock_access_token", "raft:theme-preset:v1:account-a"]);
    expectRootTheme("elegant", "dark");

    const accountBKeys = executeBootstrap(script, {
      storedValues: {
        ...sharedPresets,
        slock_access_token: createUnsignedToken("account-b"),
      },
    });
    expect(accountBKeys).toEqual(["slock_access_token", "raft:theme-preset:v1:account-b"]);
    expectRootTheme("elegant", "light");
  });

  it("does not read an account preset when the token subject is invalid", () => {
    const script = createThemeBootstrapScript({
      storageKeyPrefix: "raft:theme-preset:v1:",
      account: { kind: "jwt-sub", tokenStorageKey: "slock_access_token" },
      defaultPreset: "brutal",
    });

    const requestedKeys = executeBootstrap(script, {
      storedValues: {
        slock_access_token: "invalid-token",
        "raft:theme-preset:v1:undefined": "elegant-dark",
      },
    });

    expect(requestedKeys).toEqual(["slock_access_token"]);
    expectRootTheme("brutal", "light");
  });

  it("does not read an account preset from a non-access JWT with a valid subject", () => {
    const script = createThemeBootstrapScript({
      storageKeyPrefix: "raft:theme-preset:v1:",
      account: { kind: "jwt-sub", tokenStorageKey: "slock_access_token" },
      defaultPreset: "brutal",
    });

    const requestedKeys = executeBootstrap(script, {
      storedValues: {
        slock_access_token: createUnsignedToken("account-a", "refresh"),
        "raft:theme-preset:v1:account-a": "elegant-dark",
      },
    });

    expect(requestedKeys).toEqual(["slock_access_token"]);
    expectRootTheme("brutal", "light");
  });

  it("falls back deterministically for missing, invalid, or inaccessible storage", () => {
    const script = createThemeBootstrapScript({
      storageKey: "raft-theme",
      defaultPreset: "brutal",
    });

    executeBootstrap(script, { storedPreset: null });
    expectRootTheme("brutal", "light");

    executeBootstrap(script, { storedPreset: "unknown" });
    expectRootTheme("brutal", "light");

    executeBootstrap(script, { storageError: new Error("storage denied") });
    expectRootTheme("brutal", "light");
  });

  it("escapes script-closing characters in consumer-provided storage keys", () => {
    const hostileStorageKey = '</script><script data-injected="true">';
    const script = createThemeBootstrapScript({ storageKey: hostileStorageKey });

    expect(script).not.toContain("</script");
    const requestedKeys = executeBootstrap(script, {
      storedValues: { [hostileStorageKey]: "elegant-dark" },
    });
    expect(requestedKeys).toEqual([hostileStorageKey]);
    expectRootTheme("elegant", "dark");
  });
});
