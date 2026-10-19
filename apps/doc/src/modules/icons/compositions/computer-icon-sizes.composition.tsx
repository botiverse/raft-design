import { ComputerIcon } from "@botiverse/raft-ui";
import type { ComputerDevice } from "@botiverse/raft-ui";

const DEVICES: readonly (ComputerDevice | null)[] = [
  null,
  "laptop",
  "mini",
  "studio",
  "imac",
  "desktop",
  "server",
  "vm",
  "container",
];

const SIZES = [
  { label: "14px", className: "size-3.5" },
  { label: "18px", className: "size-[18px]" },
  { label: "24px", className: "size-6" },
  { label: "48px", className: "size-12" },
] as const;

export function ComputerIconSizesComposition() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs text-foreground-muted">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium" />
            {SIZES.map((size) => (
              <th key={size.label} colSpan={2} className="p-2 font-medium">
                {size.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DEVICES.map((device) => (
            <tr key={device ?? "unknown"} className="border-t border-line-muted">
              <th className="p-2 text-left font-mono font-medium whitespace-nowrap">
                {device ?? "unknown"}
              </th>
              {SIZES.map((size) => (
                <td key={size.label} colSpan={2} className="p-2">
                  <span className="flex items-center justify-center gap-3 text-foreground-strong">
                    <ComputerIcon device={device} className={size.className} />
                    <ComputerIcon device={device} platform="linux" className={size.className} />
                  </span>
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-line-muted">
            <th className="p-2 text-left font-mono font-medium whitespace-nowrap">cloud</th>
            {SIZES.map((size) => (
              <td key={size.label} colSpan={2} className="p-2">
                <span className="flex items-center justify-center gap-3 text-foreground-strong">
                  <ComputerIcon cloud className={size.className} />
                  <ComputerIcon cloud platform="linux" className={size.className} />
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
