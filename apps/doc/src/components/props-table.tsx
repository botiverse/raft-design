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
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-2 pr-6 font-medium">Prop</th>
            <th className="py-2 pr-6 font-medium">Type</th>
            <th className="py-2 pr-6 font-medium">Default</th>
            <th className="py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-gray-100 align-top">
              <td className="py-3 pr-6">
                <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-900">
                  {row.name}
                </code>
              </td>
              <td className="py-3 pr-6 font-mono text-xs text-blue-700">{row.type}</td>
              <td className="py-3 pr-6 font-mono text-xs text-gray-500">{row.default ?? "—"}</td>
              <td className="py-3 text-gray-600">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
