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

export function PropsTable({
  rows,
  nameColumnLabel = "Prop",
}: {
  rows: readonly PropRow[];
  nameColumnLabel?: string;
}) {
  const showDefault = rows.some((row) => hasDefaultValue(row.default));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-muted text-foreground-muted">
            <th className="py-2 pr-6 font-medium">{nameColumnLabel}</th>
            <th className="py-2 pr-6 font-medium">Type</th>
            {showDefault ? <th className="py-2 pr-6 font-medium">Default</th> : null}
            <th className="py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-line-muted align-top">
              <td className="py-3 pr-6 whitespace-nowrap">
                <InlineCode className="whitespace-nowrap [overflow-wrap:normal]">
                  {row.name}
                </InlineCode>
              </td>
              <td className="py-3 pr-6 font-mono text-xs text-info-tint-foreground">{row.type}</td>
              {showDefault ? (
                <td className="py-3 pr-6 font-mono text-xs text-foreground-muted">
                  {hasDefaultValue(row.default) ? row.default : "—"}
                </td>
              ) : null}
              <td className="py-3 text-foreground-muted">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
