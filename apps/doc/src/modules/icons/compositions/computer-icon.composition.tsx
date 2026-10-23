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
  "container",
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
  container: "Container",
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
            <th className="p-2 font-medium">Cloud</th>
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
                  cloud
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
