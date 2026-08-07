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
 */
export function PropsTable({
  rows,
  nameColumnLabel = "Prop",
}: {
  rows: readonly PropRow[];
  nameColumnLabel?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <colgroup>
          <col className="w-[13rem]" />
          <col className="w-[17rem]" />
          <col className="w-[8rem]" />
          <col />
        </colgroup>
        <thead>
          <tr className="border-b border-line-muted text-foreground-muted">
            <th className="py-2 pr-6 font-medium whitespace-nowrap align-top">{nameColumnLabel}</th>
            <th className="py-2 pr-6 font-medium whitespace-nowrap align-top">Type</th>
            <th className="py-2 pr-6 font-medium whitespace-nowrap align-top">Default</th>
            <th className="py-2 font-medium align-top">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-line-muted align-top">
              <td className="py-3 pr-6 align-top">
                <InlineCode className="[overflow-wrap:anywhere]">{row.name}</InlineCode>
              </td>
              <td className="py-3 pr-6 font-mono text-xs text-info-strong align-top [overflow-wrap:anywhere]">
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
  );
}
