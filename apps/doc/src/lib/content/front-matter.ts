// Front matter as design/authoring/README.md defines it: flat `key: value`
// lines, where a value is a string, a quoted string or an inline list
// (`[a, b]`). Numbers stay strings, so `number: 0013` keeps its zeros.

export type FrontMatter = {
  title: string;
  summary: string;
  /** Component docs: experimental | stable | deprecated. Decisions: accepted | superseded. */
  status?: string;
  aliases?: string[];
  category?: string;
  related?: string[];
  replacedBy?: string;
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
  for (const line of match[1]!.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator <= 0 || line.startsWith(" ") || line.startsWith("#")) continue;
    data[line.slice(0, separator).trim()] = parseValue(line.slice(separator + 1));
  }
  return {
    data: { title: "", summary: "", ...data } as FrontMatter,
    content: source.slice(match[0].length),
  };
}
