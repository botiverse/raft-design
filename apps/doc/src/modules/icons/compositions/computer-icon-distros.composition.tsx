import { ComputerIcon, computerDistro } from "@botiverse/raft-ui";

const MACHINES = [
  { osId: "ubuntu", osIdLike: "debian" },
  { osId: "debian", osIdLike: null },
  { osId: "fedora", osIdLike: null },
  { osId: "arch", osIdLike: null },
  { osId: "alpine", osIdLike: null },
  { osId: "centos", osIdLike: "rhel fedora" },
  { osId: "rhel", osIdLike: "fedora" },
  { osId: "rocky", osIdLike: "rhel centos fedora" },
  { osId: "nixos", osIdLike: null },
  { osId: "opensuse-tumbleweed", osIdLike: "opensuse suse" },
  { osId: "gentoo", osIdLike: null },
  { osId: null, osIdLike: null },
] as const;

const SIZES = [
  { label: "14px", className: "size-3.5" },
  { label: "16px", className: "size-4" },
  { label: "18px", className: "size-[18px]" },
  { label: "20px", className: "size-5" },
  { label: "24px", className: "size-6" },
  { label: "48px", className: "size-12" },
] as const;

export function ComputerIconDistrosComposition() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs text-foreground-muted">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium">ID / ID_LIKE</th>
            <th className="p-2 text-left font-medium">distro</th>
            {SIZES.map((size) => (
              <th key={size.label} className="p-2 font-medium">
                {size.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MACHINES.map(({ osId, osIdLike }) => {
            const distro = computerDistro(osId, osIdLike);
            return (
              <tr key={osId ?? "none"} className="border-t border-line-muted">
                <th className="p-2 text-left font-mono font-medium whitespace-nowrap">
                  {osId ?? "(none)"}
                  {osIdLike ? ` / ${osIdLike}` : null}
                </th>
                <td className="p-2 font-mono">{distro ?? "Tux"}</td>
                {SIZES.map((size) => (
                  <td key={size.label} className="p-2 text-center text-foreground-strong">
                    <ComputerIcon
                      device="server"
                      platform="linux"
                      distro={distro}
                      className={`inline ${size.className}`}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
