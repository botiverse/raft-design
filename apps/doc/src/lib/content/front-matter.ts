// Front matter as design/authoring/README.md defines it: flat `key: value`
// pairs, where a value is a string, a quoted string or a list, written inline
// (`[a, b]`, which the formatter may wrap over several indented lines) or as
// `- item` lines. Numbers stay strings, so `number: 0013` keeps its zeros.

export type FrontMatter = {
  title: string;
  summary: string;
  /** Component docs: experimental | stable | deprecated. Decisions: accepted | superseded. */
  status?: string;
  aliases?: string[];
  /** Component docs: core | collaboration. The index groups by layer, then by category. */
  layer?: string;
  category?: string;
  related?: string[];
  replacedBy?: string;
  /** Position in the section's reading order, lowest first. Pages without it follow. */
  order?: string;
  /**
   * Site paths this page used to have (`patterns/agents`). Each one, and its
   * `.md` twin, answers with a 301 to the page.
   */
  redirectFrom?: string[];
  /** Decision records. */
  number?: string;
  date?: string;
};

function unquote(value: string) {
  const quoted = value.match(/^(["'])([\s\S]*)\1$/);
  return quoted ? quoted[2]! : value;
}

function parseValue(raw: string): string | string[] {
  const value = raw.trim();
  const list = value.match(/^\[(.*)\]$/);
  if (!list) return unquote(value);
  return list[1]!
    .split(",")
    .map((item) => unquote(item.trim()))
    .filter(Boolean);
}

/** Splits a Markdown file into its front matter and the Markdown after it. */
export function parseFrontMatter(source: string): { data: FrontMatter; content: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: { title: "", summary: "" }, content: source };
  const data: Record<string, string | string[]> = {};
  const lines = match[1]!.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const separator = line.indexOf(":");
    if (separator <= 0 || /^\s/.test(line) || line.startsWith("#")) continue;
    let value = line.slice(separator + 1);
    // A value continued on the indented lines below it.
    const continuation: string[] = [];
    while (index + 1 < lines.length && /^\s+\S/.test(lines[index + 1]!)) {
      continuation.push(lines[++index]!.trim());
    }
    if (continuation.length > 0) {
      value = continuation.every((item) => item.startsWith("- "))
        ? `[${continuation.map((item) => item.slice(2)).join(", ")}]`
        : `${value} ${continuation.join(" ")}`;
    }
    data[line.slice(0, separator).trim()] = parseValue(value);
  }
  return {
    data: { title: "", summary: "", ...data } as FrontMatter,
    content: source.slice(match[0].length),
  };
}
