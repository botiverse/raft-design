import { Monitor, Plus } from "lucide-react";
import { useMachineStore } from "../../store/machineStore";
import { useServerStore } from "../../store/serverStore";
import { useServerPermissions } from "../../hooks/useServerPermissions";
import { useAppNavigate, useMobileBack } from "../../hooks/useAppNavigate";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import PanelHeader from "../ui/PanelHeader";
import StatusDot from "../ui/StatusDot";

/**
 * Mobile-only Computers panel — renders as a regular detail panel
 * (yellow h-[62px] navbar, cream body, card-style machine items) so
 * /computers visually matches other Settings sub-pages like Account
 * / Browser / Server. Reported as a styling inconsistency by
 * @stdrc 2026-05-01 `#proj-uiux:c8711d2a` msg 2a500cb7 — previously
 * /computers on mobile rendered via the Sidebar's inline branch with
 * uppercase section headers and transparent-border list rows, which
 * read as sidebar navigation rather than a page.
 *
 * Desktop still uses the Sidebar's dedicated Computers rail column;
 * only mobile routes /computers here.
 */
export default function MobileComputersPanel() {
  const machines = useMachineStore((s) => s.machines);
  const setShowAddMachine = useMachineStore((s) => s.setShowAddMachine);
  const serverSlug = useServerStore((s) => s.current?.slug);
  const { capabilities } = useServerPermissions();
  const canManageServer = capabilities.manageServer;
  const nav = useAppNavigate();
  // Computers is a level-2 view under Settings on mobile; back pops
  // to the Settings tab home (or app root if serverSlug is missing).
  const onMobileBack = useMobileBack(serverSlug ? `/s/${serverSlug}/settings` : "/");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header — uses canonical PanelHeader so padding (`gap-3 px-5`),
          back-chevron sizing, and action-slot wrapping match every other
          Settings sub-page (Account / Browser / Server). Was hand-rolled
          with `gap-3 px-5` before; converted to PanelHeader after stdrc
          confirmed (2026-05-14 #wg-theme:16123203) that the wider BEFORE
          padding is the canonical look on every breakpoint. */}
      <PanelHeader
        title="Computers"
        onMobileBack={onMobileBack}
        mobileBackProps={{ "data-testid": "computers-mobile-back", title: "Back" }}
        actions={
          canManageServer ? (
            <Button
              onClick={() => setShowAddMachine(true)}
              data-testid="computers-add-button"
              shape="icon"
              title="Add computer"
            >
              <Plus size={14} />
            </Button>
          ) : null
        }
      />

      {/* Body — cream page background with card-style machine rows,
          matching the visual weight of Tasks / Saved / Threads. */}
      <div className="flex-1 overflow-y-auto bg-white p-4 safe-bottom">
        {machines.length === 0 ? (
          <EmptyState
            className="flex h-full flex-col items-center justify-center"
            icon={<Monitor size={36} />}
            title="No computers yet"
            description="Connect a machine to run agents from here."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {machines.map((machine) => (
              <button
                key={machine.id}
                onClick={() => nav.toComputer(machine.id)}
                data-testid={`computer-list-item-${machine.id}`}
                className="flex w-full items-center gap-3 border-2 border-black bg-white p-3 text-left shadow-brutal-sm transition-all duration-100 hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-active"
              >
                <div className="flex size-10 shrink-0 items-center justify-center border-2 border-black bg-brutal-yellow">
                  <Monitor size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="min-w-0 truncate text-sm font-bold text-black">{machine.name}</span>
                    <StatusDot
                      tone={machine.status === "online" ? "bg-brutal-lime" : "bg-gray-400"}
                      className="shrink-0"
                      title={machine.status}
                    />
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-black/50 font-mono">
                    {machine.daemonVersion ? (
                      <span className="truncate">daemon v{machine.daemonVersion}</span>
                    ) : (
                      <span className="text-black/30 italic">daemon offline</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
