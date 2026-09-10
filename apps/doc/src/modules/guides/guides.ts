const sources = import.meta.glob("../../../../../packages/ui/skills/raft-ui-guide/rules/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const guides = Object.fromEntries(
  Object.entries(sources).map(([path, source]) => {
    const slug = path.split("/").at(-1)!.replace(/\.md$/, "");
    const content = source.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
    const title = content.match(/^# (.+)/)?.[1] ?? slug;
    const body = content
      .replace(/^# .+\n*/, "")
      .replace(/\]\(\.\/([\w-]+)\.md(#[^)]*)?\)/g, "](/guides/$1$2)");
    return [slug, { title, body, slug }];
  }),
);
