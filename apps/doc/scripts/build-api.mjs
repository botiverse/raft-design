#!/usr/bin/env node
// Generates src/data/api/<folder>.json, one file per component folder: the props of every component raft-ui exports,
// read from its TypeScript, for the API section of each component page.
//
//   node scripts/build-api.mjs           write src/data/api/<folder>.json
//   node scripts/build-api.mjs --check   exit 1 if any of them is stale
//
// Uses the TypeScript 5 compiler API (`typescript-api`); TypeScript 7 has no
// JS API yet. A component is a PascalCase export whose call signature takes
// one props argument. Its props are the ones raft-ui and Base UI declare; the
// element's own attributes and React's are summarised as `native`.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-api";

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const uiDir = path.resolve(appDir, "../../packages/ui");
const outDir = path.join(appDir, "src/data/api");
const ENTRIES = [
  ["raft-ui", path.join(uiDir, "src/index.ts")],
  ["raft-ui/wip", path.join(uiDir, "src/wip.ts")],
];
/** Props every component has, documented once in the foundations, not per component. */
const SKIPPED_PROPS = new Set(["className", "style", "ref", "key"]);

function createProgram() {
  const configFile = ts.readConfigFile(path.join(uiDir, "tsconfig.json"), ts.sys.readFile);
  const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, uiDir);
  return ts.createProgram({
    rootNames: ENTRIES.map(([, file]) => file),
    options: { ...config.options, noEmit: true },
  });
}

function origin(declaration) {
  const file = declaration.getSourceFile().fileName;
  // A recipe's variants (`variant`, `size`) are typed by tailwind-variants.
  if (file.startsWith(path.join(uiDir, "src")) || file.includes("/tailwind-variants/")) {
    return "raft-ui";
  }
  if (file.includes("/@base-ui/")) return "base-ui";
  return "native";
}

/**
 * A recipe variant's default, from the `defaultVariants` of the recipes in
 * the component's folder, when they agree on one value.
 */
const recipeDefaultsCache = new Map();
function recipeDefaults(folderPath) {
  if (recipeDefaultsCache.has(folderPath)) return recipeDefaultsCache.get(folderPath);
  const values = new Map();
  for (const file of readdirSync(folderPath)) {
    if (!/\.tsx?$/.test(file) || /\.test\./.test(file)) continue;
    const source = readFileSync(path.join(folderPath, file), "utf8");
    for (const [, block] of source.matchAll(/defaultVariants:\s*\{([^}]*)\}/g)) {
      for (const [, key, value] of block.matchAll(
        /([\w-]+|"[^"]+"):\s*("[^"]*"|true|false|\d+)/g,
      )) {
        const name = key.replace(/"/g, "");
        values.set(name, [...(values.get(name) ?? []), value]);
      }
    }
  }
  const defaults = new Map(
    [...values]
      .filter(([, list]) => new Set(list).size === 1)
      .map(([name, list]) => [name, list[0]]),
  );
  recipeDefaultsCache.set(folderPath, defaults);
  return defaults;
}

function firstParagraph(text) {
  return text
    .split(/\n\s*\n/)[0]
    .replace(/\s+/g, " ")
    .trim();
}

function jsDocTag(symbol, checker, name) {
  const tag = symbol.getJsDocTags(checker).find((item) => item.name === name);
  return tag ? ts.displayPartsToString(tag.text ?? []).trim() : undefined;
}

/** `variant = "default"` in the component's parameter list, by prop name. */
function parameterDefaults(declaration) {
  const fn = ts.isVariableDeclaration(declaration) ? declaration.initializer : declaration;
  const parameter = fn && "parameters" in fn ? fn.parameters?.[0] : undefined;
  const defaults = new Map();
  if (parameter && ts.isObjectBindingPattern(parameter.name)) {
    for (const element of parameter.name.elements) {
      if (!element.initializer) continue;
      const name = (element.propertyName ?? element.name).getText();
      defaults.set(name, element.initializer.getText());
    }
  }
  return defaults;
}

/** React's `ReactNode` as the checker spells it out. */
const REACT_NODE =
  /string \| number \| bigint \| boolean \| ReactElement<unknown, string \| JSXElementConstructor<any>> \| Iterable<ReactNode> \| ReactPortal \| Promise<[^<>]*(?:<[^<>]*(?:<[^<>]*>[^<>]*)*>[^<>]*)*>/g;

/** The `render` prop of every Base UI part, said once in a readable form. */
const RENDER_TYPE = "ReactElement | ((props, state) => ReactElement)";

function typeText(checker, type, location, name) {
  if (name === "render") return RENDER_TYPE;
  const text = checker.typeToString(
    checker.getNonNullableType(type),
    location,
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinitionsOutsideCurrentScope,
  );
  // Module paths are machine-specific: `import("/…/react").ReactNode` → `ReactNode`.
  return text
    .replace(/import\("[^"]*"\)\./g, "")
    .replace(/\s+/g, " ")
    .replace(REACT_NODE, "ReactNode")
    .trim();
}

function defaultOf(prop, checker, parameterDefaultsByName, variantDefaults) {
  const value =
    parameterDefaultsByName.get(prop.name) ??
    jsDocTag(prop, checker, "default") ??
    variantDefaults.get(prop.name);
  return value ? { default: value } : {};
}

function componentApi(checker, name, symbol, entry) {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration || !/^[A-Z]/.test(name)) return null;
  const file = declaration.getSourceFile().fileName;
  const folder = file.match(/\/components\/([\w-]+)\//)?.[1];
  if (!folder) return null;
  const signatures = checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures();
  const signature = signatures[0];
  if (!signature || signature.parameters.length !== 1) return null;
  const returns = checker.typeToString(signature.getReturnType());
  if (!/Element|ReactNode|null/.test(returns)) return null;

  const propsType = checker.getTypeOfSymbolAtLocation(signature.parameters[0], declaration);
  const defaults = parameterDefaults(declaration);
  const variantDefaults = recipeDefaults(path.dirname(file));
  let native = false;
  const props = [];
  for (const prop of propsType.getProperties()) {
    if (SKIPPED_PROPS.has(prop.name)) continue;
    const propDeclaration = prop.valueDeclaration ?? prop.declarations?.[0];
    // A prop with no declaration comes from a mapped type: a recipe's variants.
    const from = propDeclaration ? origin(propDeclaration) : "raft-ui";
    if (from === "native") {
      native = true;
      continue;
    }
    const description = firstParagraph(
      ts.displayPartsToString(prop.getDocumentationComment(checker)),
    );
    const deprecated = jsDocTag(prop, checker, "deprecated");
    props.push({
      name: prop.name,
      type: typeText(
        checker,
        checker.getTypeOfSymbolAtLocation(prop, declaration),
        declaration,
        prop.name,
      ),
      required: (prop.flags & ts.SymbolFlags.Optional) === 0,
      ...defaultOf(prop, checker, defaults, variantDefaults),
      ...(description ? { description } : {}),
      ...(deprecated !== undefined ? { deprecated: deprecated || true } : {}),
      from,
    });
  }
  // raft-ui's own props first, then Base UI's, each alphabetical.
  props.sort((a, b) =>
    a.from === b.from ? a.name.localeCompare(b.name) : a.from === "raft-ui" ? -1 : 1,
  );

  const description = firstParagraph(
    ts.displayPartsToString(symbol.getDocumentationComment(checker)),
  );
  const deprecated = jsDocTag(symbol, checker, "deprecated");
  return {
    folder,
    api: {
      name,
      entry,
      ...(description ? { description } : {}),
      ...(deprecated !== undefined ? { deprecated: deprecated || true } : {}),
      native,
      props,
    },
  };
}

export function buildApi() {
  const program = createProgram();
  const checker = program.getTypeChecker();
  const byFolder = {};
  const seen = new Set();
  for (const [entry, file] of ENTRIES) {
    const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(file));
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      if (seen.has(exported.name)) continue;
      const symbol =
        exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      if (!(symbol.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))) continue;
      const result = componentApi(checker, exported.name, symbol, entry);
      if (!result) continue;
      seen.add(exported.name);
      (byFolder[result.folder] ??= []).push(result.api);
    }
  }
  const folders = Object.keys(byFolder).sort();
  // A small index the site loads eagerly (nav, search, changes); the full
  // props load with each component page.
  const index = Object.fromEntries(
    folders.map((folder) => {
      const components = byFolder[folder];
      const status = components.every((component) => component.deprecated)
        ? "deprecated"
        : components.every((component) => component.entry === "raft-ui/wip")
          ? "experimental"
          : "stable";
      const description = components.find((component) => component.description)?.description;
      return [
        folder,
        {
          names: components.map((component) => component.name),
          status,
          ...(description ? { description } : {}),
        },
      ];
    }),
  );
  return new Map([
    ["_index.json", `${JSON.stringify(index, null, 2)}\n`],
    ...folders.map((folder) => [
      `${folder}.json`,
      `${JSON.stringify(byFolder[folder], null, 2)}\n`,
    ]),
  ]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = buildApi();
  if (process.argv.includes("--check")) {
    const current = existsSync(outDir) ? readdirSync(outDir).sort() : [];
    const stale = [...files].filter(
      ([name, text]) =>
        !existsSync(path.join(outDir, name)) ||
        readFileSync(path.join(outDir, name), "utf8") !== text,
    );
    const extra = current.filter((name) => !files.has(name));
    if (stale.length || extra.length) {
      console.error(
        `src/data/api is stale (${[...stale.map(([name]) => name), ...extra].join(", ")}): run \`node scripts/build-api.mjs\`.`,
      );
      process.exit(1);
    }
  } else {
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });
    for (const [name, text] of files) writeFileSync(path.join(outDir, name), text);
    console.log(`api: wrote ${files.size - 1} folders to src/data/api`);
  }
}
