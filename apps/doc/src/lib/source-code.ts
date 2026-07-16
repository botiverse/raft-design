export function stripSourceCodeBlocks(code: string) {
  return code
    .replace(/^\s*\/\/ @docs-source-strip-start\n[\s\S]*?^\s*\/\/ @docs-source-strip-end\n?/gm, "")
    .replace(
      /^\s*\{\/\* @docs-source-strip-start \*\/\}\n[\s\S]*?^\s*\{\/\* @docs-source-strip-end \*\/\}\n?/gm,
      "",
    )
    .trimEnd();
}

export function stripTopLevelImports(code: string) {
  const lines = code.split("\n");
  let index = 0;
  let sawImport = false;
  let importLineCount = 0;

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";

    if (line === "") {
      index += 1;
      continue;
    }

    if (!line.startsWith("import ")) {
      break;
    }

    sawImport = true;

    const importStartIndex = index;

    do {
      index += 1;
    } while (index < lines.length && !lines[index - 1]?.trimEnd().endsWith(";"));

    importLineCount += index - importStartIndex;
  }

  if (!sawImport || importLineCount <= 1) {
    return code;
  }

  while (index < lines.length && lines[index]?.trim() === "") {
    index += 1;
  }

  return lines.slice(index).join("\n");
}
