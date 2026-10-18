import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";

import { TOKEN_GROUPS } from "./tokens-data.ts";

/**
 * One swatch inside a light or dark island, so both columns render live
 * whatever the page's mode. The implementation prints the value from
 * tokens.json next to it.
 */
function Swatch({ cssVar, mode }: { cssVar: string; mode: "light" | "dark" }) {
  return (
    <PreviewThemeScope mode={mode} className="inline-flex items-center gap-2 bg-transparent">
      <span
        aria-hidden
        className="size-6 shrink-0 rounded-sticker border-[1.5px] border-line-strong"
        style={{ background: `var(${cssVar})` }}
      />
      <span className="sr-only">{mode}</span>
    </PreviewThemeScope>
  );
}

/**
 * A `tokens` block: the group's tokens with their light and dark values and
 * what each is for. Values are never typed into prose; this table is the only
 * place a reader sees them.
 */
export function TokensBlock({ group }: { group: string }) {
  const rows = TOKEN_GROUPS[group];
  if (!rows) {
    return (
      <p className="font-mono text-mono-meta text-foreground-hint">Unknown token group: {group}</p>
    );
  }

  return (
    <div className="my-6 overflow-x-auto rounded-container border border-line-hairline">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Light</TableHead>
            <TableHead>Dark</TableHead>
            <TableHead>Use</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-mono text-mono-meta whitespace-nowrap">
                {row.name}
              </TableCell>
              <TableCell>
                <Swatch cssVar={row.cssVar} mode="light" />
              </TableCell>
              <TableCell>
                <Swatch cssVar={row.cssVar} mode="dark" />
              </TableCell>
              <TableCell className="text-callout text-foreground-muted">{row.usage}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
