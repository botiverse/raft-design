import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@botiverse/raft-ui";

import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { tokenGroup } from "#/lib/tokens/tokens.ts";
import type { TokenRow, TokenValue } from "#/lib/tokens/tokens.ts";

/**
 * A swatch inside a light or dark island, so both columns render live from
 * the token itself whatever the page's mode.
 */
function Swatch({ row, mode }: { row: TokenRow; mode: "light" | "dark" }) {
  if (row.type !== "color" && row.type !== "shadow") return null;
  return (
    <PreviewThemeScope
      mode={mode}
      className="inline-flex shrink-0 rounded-sticker bg-layer-canvas p-0.5"
    >
      <span
        aria-hidden
        className={
          row.type === "color"
            ? "size-6 rounded-sticker border-[1.5px] border-line-strong"
            : "size-6 rounded-sticker bg-layer-card"
        }
        style={
          row.type === "color"
            ? { background: `var(${row.cssVar})` }
            : { boxShadow: `var(${row.cssVar})` }
        }
      />
    </PreviewThemeScope>
  );
}

function Value({ row, value, mode }: { row: TokenRow; value: TokenValue; mode: "light" | "dark" }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Swatch row={row} mode={mode} />
      <span className="flex min-w-0 flex-col">
        <span className="font-mono text-mono-meta break-all">{value.display}</span>
        {value.reference ? (
          <span className="font-mono text-mono-meta text-foreground-hint">{value.reference}</span>
        ) : null}
      </span>
    </span>
  );
}

/**
 * A `tokens` block: a group from packages/ui/src/tokens.json with its light
 * and dark values, and its desktop value when it has one (from 768px; the
 * light value is then the phone's). Prose never repeats a value; this table is where readers
 * see it.
 */
export function TokensBlock({ group }: { group: string }) {
  const rows = tokenGroup(group);
  if (!rows) {
    return (
      <p className="my-6 rounded-container border border-dashed border-line-seam p-4 font-mono text-mono-meta text-foreground-hint">
        Unknown token group: {group}
      </p>
    );
  }

  const hasDesktop = rows.some((row) => row.desktop);

  return (
    <div className="my-6 overflow-x-auto rounded-container border border-line-hairline">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Light</TableHead>
            <TableHead>Dark</TableHead>
            {hasDesktop ? <TableHead>Desktop</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="align-top font-mono text-mono-meta whitespace-nowrap">
                {row.name}
                {row.description ? (
                  <span className="mt-1 block font-sans text-caption whitespace-normal text-foreground-muted">
                    {row.description}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="align-top">
                <Value row={row} value={row.light} mode="light" />
              </TableCell>
              <TableCell className="align-top">
                <Value row={row} value={row.dark} mode="dark" />
              </TableCell>
              {hasDesktop ? (
                <TableCell className="align-top">
                  {row.desktop ? <Value row={row} value={row.desktop} mode="light" /> : null}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
