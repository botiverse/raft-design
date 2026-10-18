import { loadExampleSource } from "./examples.ts";
import { TOKEN_GROUPS } from "./tokens-data.ts";

// Proposal mock (B3). The implementation reads design/**/*.md and
// packages/ui/src/components/*/*.md; until the English docs land, the mock
// pages read placeholder sources from ./content.
const files = import.meta.glob<string>("./content/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export type FrontMatter = {
  title: string;
  summary: string;
  status?: string;
  aliases?: string[];
  category?: string;
  related?: string[];
  placeholder?: boolean;
};

export type DocSource = {
  slug: string;
  frontMatter: FrontMatter;
  /** The Markdown after the front matter and the `# Title` line. */
  body: string;
  raw: string;
  headings: { id: string; title: string }[];
};

function parseValue(value: string): string | string[] | boolean {
  const trimmed = value.trim();
  if (trimmed === "true" || trimmed === "false") return trimmed === "true";
  const list = trimmed.match(/^\[(.*)\]$/);
  if (list) {
    return list[1]!
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return trimmed;
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parse(slug: string, raw: string): DocSource {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const frontMatter: Record<string, unknown> = {};
  for (const line of match?.[1]?.split("\n") ?? []) {
    const separator = line.indexOf(":");
    if (separator > 0)
      frontMatter[line.slice(0, separator).trim()] = parseValue(line.slice(separator + 1));
  }
  const body = raw
    .slice(match?.[0].length ?? 0)
    .replace(/^\s*# .+\n+/, "")
    .trim();
  const headings = [...body.matchAll(/^## (.+)$/gm)].map(([, title]) => ({
    id: slugifyHeading(title!),
    title: title!,
  }));
  return { slug, frontMatter: frontMatter as FrontMatter, body, raw, headings };
}

const sources = new Map(
  Object.entries(files).map(([path, raw]) => {
    const slug = path.split("/").at(-1)!.replace(/\.md$/, "");
    return [slug, parse(slug, raw)];
  }),
);

export function getDocSource(slug: string) {
  return sources.get(slug);
}

function tokensTable(group: string) {
  const rows = TOKEN_GROUPS[group] ?? [];
  return [
    "| Token | Use |",
    "| --- | --- |",
    ...rows.map((row) => `| \`${row.name}\` | ${row.usage} |`),
  ].join("\n");
}

/**
 * The page's Markdown twin, as `/<page>.md` and llms-full.txt serve it: the
 * same source with every `example` block replaced by the composition's code
 * and every `tokens` block by its table. The implementation adds the light and
 * dark values from tokens.json and, for components, the generated props.
 */
export async function renderMarkdownTwin(source: DocSource, extra = "") {
  const blocks = [...source.raw.matchAll(/```(example|tokens)\n([^\n]+)\n```/g)];
  let markdown = source.raw.replace(/^---\n[\s\S]*?\n---\n\n?/, "");
  for (const [block, kind, argument] of blocks) {
    const replacement =
      kind === "tokens"
        ? tokensTable(argument!.trim())
        : `\`\`\`tsx\n${(await loadExampleSource(argument!.trim())) ?? `// ${argument}`}\n\`\`\``;
    markdown = markdown.replace(block, replacement);
  }
  const summary = `> ${source.frontMatter.summary}`;
  markdown = markdown.replace(/^(# .+\n)/, `$1\n${summary}\n`);
  return `${markdown.trim()}${extra}\n`;
}
