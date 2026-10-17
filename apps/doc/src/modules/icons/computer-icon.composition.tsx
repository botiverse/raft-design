import { ComputerIcon } from "@botiverse/raft-ui";
import type { ComputerDevice, ComputerPlatform } from "@botiverse/raft-ui";

const DEVICES: readonly (ComputerDevice | null)[] = [
  null,
  "laptop",
  "mini",
  "studio",
  "imac",
  "desktop",
  "server",
  "vm",
];
const PLATFORMS: readonly (ComputerPlatform | null)[] = ["macos", "linux", "windows", null];

const DEVICE_LABELS: Record<string, string> = {
  unknown: "Unknown",
  laptop: "Laptop",
  mini: "Mini",
  studio: "Studio",
  imac: "iMac",
  desktop: "Desktop",
  server: "Server",
  vm: "VM",
};

const PLATFORM_LABELS: Record<string, string> = {
  macos: "macOS",
  linux: "Linux",
  windows: "Windows",
  none: "No platform",
};

export function ComputerIconComposition() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs text-foreground-muted">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium" />
            {DEVICES.map((device) => (
              <th key={device ?? "unknown"} className="p-2 font-medium">
                {DEVICE_LABELS[device ?? "unknown"]}
              </th>
            ))}
            <th className="p-2 font-medium">Hosted</th>
          </tr>
        </thead>
        <tbody>
          {PLATFORMS.map((platform) => (
            <tr key={platform ?? "none"} className="border-t border-line-muted">
              <th className="p-2 text-left font-medium whitespace-nowrap">
                {PLATFORM_LABELS[platform ?? "none"]}
              </th>
              {DEVICES.map((device) => (
                <td key={device ?? "unknown"} className="p-3 text-center">
                  <ComputerIcon
                    device={device}
                    platform={platform}
                    className="inline size-6 text-foreground-strong"
                  />
                </td>
              ))}
              <td className="p-3 text-center">
                <ComputerIcon
                  hosted
                  platform={platform}
                  className="inline size-6 text-foreground-strong"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComputerIconSizesComposition() {
  return (
    <div className="flex flex-wrap items-end gap-6 text-foreground-strong">
      <ComputerIcon device="mini" platform="macos" className="size-3.5" />
      <ComputerIcon device="mini" platform="macos" className="size-[18px]" />
      <ComputerIcon device="server" platform="linux" className="size-[18px]" />
      <ComputerIcon platform="windows" className="size-[18px]" />
      <ComputerIcon device="laptop" platform="macos" className="size-6" />
      <ComputerIcon device="laptop" platform="linux" className="size-12" />
    </div>
  );
}
