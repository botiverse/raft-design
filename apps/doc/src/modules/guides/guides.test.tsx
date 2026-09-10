import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { guides } from "./guides.ts";
import { GuideContent } from "./guide-content.tsx";

test("published guides share the packaged source and resolve their links and section anchors", () => {
  expect(Object.keys(guides)).toContain("overview");
  const pages = Object.fromEntries(
    Object.entries(guides).map(([slug, guide]) => {
      const document = new DOMParser().parseFromString(
        renderToStaticMarkup(<GuideContent>{guide.body}</GuideContent>),
        "text/html",
      );
      expect(document.body.textContent).not.toMatch(/^\s*name:/);
      expect(document.querySelector("h1")).toBeNull();
      return [slug, document];
    }),
  );
  for (const page of Object.values(pages)) {
    for (const link of page.querySelectorAll<HTMLAnchorElement>('a[href^="/guides/"]')) {
      const url = new URL(link.getAttribute("href")!, "https://rui.botiverse.build");
      const target = pages[url.pathname.split("/").at(-1)!];
      expect(target, url.pathname).toBeDefined();
      if (url.hash) expect(target.getElementById(url.hash.slice(1)), url.href).not.toBeNull();
      expect(link.target).toBe("");
    }
  }
  const reachable = new Set<string>();
  const pending = ["overview"];
  while (pending.length) {
    const slug = pending.pop()!;
    if (reachable.has(slug)) continue;
    reachable.add(slug);
    for (const link of pages[slug].querySelectorAll('a[href^="/guides/"]')) {
      pending.push(link.getAttribute("href")!.split("#")[0].split("/").at(-1)!);
    }
  }
  expect([...reachable].sort()).toEqual(Object.keys(guides).sort());
});
