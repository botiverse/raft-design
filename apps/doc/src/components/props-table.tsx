import { InlineCode } from "cuvii-rui";

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export function PropsTable({ rows }: { rows: readonly PropRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-subtle text-foreground-muted">
            <th className="py-2 pr-6 font-medium">Prop</th>
            <th className="py-2 pr-6 font-medium">Type</th>
            <th className="py-2 pr-6 font-medium">Default</th>
            <th className="py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-line-subtle align-top">
              <td className="py-3 pr-6">
                <InlineCode>{row.name}</InlineCode>
              </td>
              <td className="py-3 pr-6 font-mono text-xs text-info-dark">{row.type}</td>
              <td className="py-3 pr-6 font-mono text-xs text-foreground-muted">
                {row.default ?? "—"}
              </td>
              <td className="py-3 text-foreground-muted">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
