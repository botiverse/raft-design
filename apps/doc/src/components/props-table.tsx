import { InlineCode } from "raft-ui";

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

const EMPTY_DEFAULTS = new Set(["", "-", "–", "—"]);

function hasDefaultValue(value: string | undefined): value is string {
  return value != null && !EMPTY_DEFAULTS.has(value.trim());
}

/**
 * API reference table in the same shape as shadcn / Base UI / Kumo docs:
 * one row per prop, fixed Prop | Type | Default | Description columns so every
 * part subsection on a page lines up, and the Default column always present.
 *
 * Below md the four fixed columns cannot share the phone width: the fixed
 * widths alone exceed the viewport, which used to collapse Description to 0
 * while the reader had to scroll for it anyway (measured 208 / 272 / 128 / 0
 * at 390px). The same rows therefore render as stacked blocks there — name and
 * default, then type, then the description — because the descriptions are the
 * most useful content on an API page.
 */
export function PropsTable({
  rows,
  nameColumnLabel = "Prop",
}: {
  rows: readonly PropRow[];
  nameColumnLabel?: string;
}) {
  return (
    <>
      {/* Stacked layout below md; hidden at md+ where the fixed table fits. */}
      <div className="md:hidden">
        {rows.map((row) => (
          <div key={row.name} className="space-y-1 border-b border-line-muted py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <InlineCode className="wrap-anywhere">{row.name}</InlineCode>
              {hasDefaultValue(row.default) ? (
                <span className="font-mono text-xs text-foreground-muted">
                  default: {row.default}
                </span>
              ) : null}
            </div>
            <div className="font-mono text-xs text-info-strong wrap-anywhere">{row.type}</div>
            <div className="text-foreground-muted">{row.description}</div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-[13rem]" />
            <col className="w-[17rem]" />
            <col className="w-[8rem]" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b border-line-muted text-foreground-muted">
              <th className="py-2 pr-6 font-medium whitespace-nowrap align-top">
                {nameColumnLabel}
              </th>
              <th className="py-2 pr-6 font-medium whitespace-nowrap align-top">Type</th>
              <th className="py-2 pr-6 font-medium whitespace-nowrap align-top">Default</th>
              <th className="py-2 font-medium align-top">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-line-muted align-top">
                <td className="py-3 pr-6 align-top">
                  <InlineCode className="wrap-anywhere">{row.name}</InlineCode>
                </td>
                <td className="py-3 pr-6 font-mono text-xs text-info-strong align-top wrap-anywhere">
                  {row.type}
                </td>
                <td className="py-3 pr-6 font-mono text-xs whitespace-nowrap text-foreground-muted align-top">
                  {hasDefaultValue(row.default) ? row.default : "—"}
                </td>
                <td className="py-3 text-foreground-muted align-top">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
