# apps/doc

The Raft Design System documentation site, <https://raft-design.botiverse.build>. It renders the
Markdown docs in `design/` and `packages/ui/src/components/*/*.md` with live raft-ui examples, and
serves every page as Markdown for agents. How the site is designed, and why, is in
[DESIGN.md](./DESIGN.md); how to work in it is in [AGENTS.md](./AGENTS.md).

```bash
vp run doc#dev                      # local site
node scripts/build-api.mjs          # after changing raft-ui's exports or props
vp run doc#build                    # build, prerender, twins, llms.txt, components.json
```

The site is a TanStack Start app on Cloudflare Workers (`wrangler.jsonc`). Pull requests get a
Workers Builds preview.
