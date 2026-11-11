/**
 * raft-ui's lint plugin: the Raft Design System's rules for the code of an app
 * built on raft-ui, in the ESLint plugin format, which Oxlint loads as a JS
 * plugin (`jsPlugins`). Published as `@botiverse/raft-ui/lint`.
 *
 * Enable every rule at once by extending `recommended.json` from the same
 * package (Oxlint) or adding `configs.recommended` (ESLint flat config), so a
 * rule added in a later release reaches the app with the upgrade. See
 * design/about/use-raft-ui.md#lint-rules.
 */

import { noRawZIndex } from "./no-raw-z-index";
import { preferScrollArea } from "./prefer-scroll-area";
import type { RuleModule } from "./prefer-scroll-area";

export type { RuleContext, RuleModule, RuleVisitor } from "./prefer-scroll-area";

export interface RaftUiLintConfig {
  name: string;
  plugins: Record<string, RaftUiLintPlugin>;
  rules: Record<string, "error" | "warn" | "off">;
}

export interface RaftUiLintPlugin {
  meta: { name: string };
  rules: Record<string, RuleModule>;
  configs: Record<string, RaftUiLintConfig>;
}

export const rules: Record<string, RuleModule> = {
  "prefer-scroll-area": preferScrollArea,
  "no-raw-z-index": noRawZIndex,
};

/**
 * Every rule of the plugin with its severity, as `recommended.json` lists them.
 * A rule an app can't pass yet ships `off`, so an app that lints with
 * `--max-warnings=0` (slock) stays green on the upgrade; an app turns it on in
 * its own `rules` to clear what it reports, and it turns `error` here once the
 * app has.
 */
export const recommendedRules: Record<string, "error" | "warn" | "off"> = {
  "raft-ui/prefer-scroll-area": "error",
  "raft-ui/no-raw-z-index": "error",
};

const plugin: RaftUiLintPlugin = {
  meta: { name: "raft-ui" },
  rules,
  configs: {},
};

/** ESLint flat config: `export default [raftUi.configs.recommended]`. */
export const recommended: RaftUiLintConfig = {
  name: "raft-ui/recommended",
  plugins: { "raft-ui": plugin },
  rules: recommendedRules,
};
plugin.configs.recommended = recommended;

export default plugin;
