import { useState, useEffect } from "react";
import { X, Copy, Check, Terminal, CheckCircle, Monitor, Cloud } from "lucide-react";
import { useMachineStore } from "../../store/machineStore";
import { useServerStore } from "../../store/serverStore";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { getServerUrl } from "../../utils/server";
import { getComputerSetupCommand } from "../../utils/computerSetupCommand";
import { PLAN_CONFIG, getEffectiveLimits, type ServerPlan } from "@slock-ai/shared";
import Modal from "../Modal";
import StatusDot from "../ui/StatusDot";
import SectionEyebrow from "../ui/SectionEyebrow";
import FormField from "../ui/FormField";
import Banner from "../ui/Banner";
import { ExperimentalBadge } from "../ui/ExperimentalBadge";

function isQuotaError(error: string): boolean {
  return error.includes("limit reached");
}

type DialogStep = "type" | "waiting" | "connected";
type MachineType = "local" | "cloud";
type CommandCopyTarget = "daemon" | "computer";

export default function AddMachineDialog({ onClose }: { onClose: () => void }) {
  const nav = useAppNavigate();
  const [step, setStep] = useState<DialogStep>("type");
  const [machineType, setMachineType] = useState<MachineType>("local");
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [machineId, setMachineId] = useState("");
  const [copiedCommand, setCopiedCommand] = useState<CommandCopyTarget | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const registerMachine = useMachineStore((s) => s.registerMachine);
  const renameMachine = useMachineStore((s) => s.renameMachine);
  const serverName = useServerStore((s) => s.current?.name) || "server";
  const serverSlug = useServerStore((s) => s.current?.slug);
  const deleteMachine = useMachineStore((s) => s.deleteMachine);
  const machines = useMachineStore((s) => s.machines);

  const plan = (useServerStore((s) => s.current?.plan) || "free") as ServerPlan;
  const maxMachines = getEffectiveLimits(plan).maxMachines;
  const atLimit = maxMachines !== -1 && machines.length >= maxMachines;

  const serverUrl = getServerUrl();

  const loadMachines = useMachineStore((s) => s.loadMachines);

  // Watch for the machine coming online
  const pendingMachine = machineId ? machines.find((m) => m.id === machineId) : null;
  const isConnected = pendingMachine?.status === "online";

  useEffect(() => {
    if (isConnected && step === "waiting") {
      setStep("connected");
      // Pre-fill name with hostname from daemon
      if (pendingMachine?.hostname) {
        setName(pendingMachine.hostname);
      }
    }
  }, [isConnected, step, pendingMachine?.hostname]);

  // Poll machine status as fallback in case Socket.io event is missed
  useEffect(() => {
    if (step !== "waiting" || !machineId) return;
    const interval = setInterval(() => {
      loadMachines();
    }, 3000);
    return () => clearInterval(interval);
  }, [step, machineId, loadMachines]);

  const handleSelectType = async () => {
    setRegistering(true);
    setError("");
    try {
      const result = await registerMachine("my-computer");
      setApiKey(result.apiKey);
      setMachineId(result.machine.id);
      setStep("waiting");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to register computer");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    // If we already created a machine but it never connected, clean it up
    if (machineId && !isConnected) {
      try {
        await deleteMachine(machineId);
      } catch {
        // ignore cleanup error
      }
    }
    onClose();
  };

  const handleDone = async () => {
    const finalName = name.trim() || pendingMachine?.hostname || "";
    if (finalName && machineId && finalName !== "my-computer") {
      setSaving(true);
      try {
        await renameMachine(machineId, finalName);
      } catch {
        // ignore — name stays as default
      } finally {
        setSaving(false);
      }
    }
    useMachineStore.getState().clearPendingApiKey();
    onClose();
    nav.toMachine(machineId);
  };

  const handleCopy = async (target: CommandCopyTarget, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCommand(target);
    setTimeout(() => {
      setCopiedCommand((current) => (current === target ? null : current));
    }, 2000);
  };

  const daemonDistTag = import.meta.env.VITE_DEPLOYMENT_ENV === "staging" ? "staging" : "latest";
  const runCommand = `npx @slock-ai/daemon@${daemonDistTag} --server-url ${serverUrl} --api-key ${apiKey} # ${serverName}`;
  const computerSetupCommand = getComputerSetupCommand(serverSlug, import.meta.env.VITE_DEPLOYMENT_ENV, serverUrl, {
    legacyApiKey: apiKey,
  });

  return (
    <Modal onClose={step === "connected" ? handleDone : handleCancel}>
      <div className="w-full max-w-lg card-brutal p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">
            {step === "type" && "Add Computer"}
            {step === "waiting" && "Connect Computer"}
            {step === "connected" && "Computer Connected"}
          </h2>
          <button
            onClick={step === "connected" ? handleDone : handleCancel}
            className="btn-brutal-sm bg-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {atLimit && step === "type" && (
          <div className="mb-4 border-2 border-black bg-brutal-orange p-3 text-sm text-black font-bold">
            Computer limit reached ({machines.length}/{maxMachines} on {PLAN_CONFIG[plan].displayName} plan).{" "}
            <button
              type="button"
              onClick={() => {
                onClose();
                nav.toSettings("server");
              }}
              className="font-bold text-black underline"
            >
              Upgrade for more
            </button>
          </div>
        )}
        {error && !atLimit && (
          <Banner intent="warning" className="mb-4 font-bold">
            {error}
            {isQuotaError(error) && (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    nav.toSettings("server");
                  }}
                  className="font-bold text-black underline"
                >
                  View Plans
                </button>
              </>
            )}
          </Banner>
        )}

        {/* Step 1: Choose machine type */}
        {step === "type" && (
          <div>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMachineType("local")}
                className={`flex-1 flex items-center gap-2 border-2 p-3 text-left transition-colors ${
                  machineType === "local"
                    ? "border-black bg-brutal-yellow font-bold shadow-brutal-sm"
                    : "border-black/30 bg-white hover:border-black"
                }`}
              >
                <Monitor size={18} className="text-black" />
                <div>
                  <div className="text-sm font-bold uppercase">Your Computer</div>
                  <div className="text-xs text-black/50 font-normal normal-case">Run agents on your own computer</div>
                </div>
              </button>
              <div
                className="flex-1 flex items-center gap-2 border-2 border-dashed border-black/30 bg-white p-3 text-left cursor-not-allowed"
              >
                <Cloud size={18} className="text-black/25" />
                <div>
                  <div className="text-sm font-bold uppercase text-black/30">Cloud Computer</div>
                  <div className="text-xs text-black/25 font-normal normal-case">Coming soon</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-brutal bg-white px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSelectType}
                disabled={registering || atLimit}
                className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registering ? "Setting up…" : "Next"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Waiting for connection */}
        {step === "waiting" && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Terminal size={16} className="text-black" />
              <span className="font-bold text-sm">
                Run this command on your computer to connect:
              </span>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <code className="flex-1 border-2 border-black bg-black text-brutal-lime px-3 py-2 font-mono text-xs break-all shadow-brutal-sm">
                {runCommand}
              </code>
              <button
                onClick={() => handleCopy("daemon", runCommand)}
                className="btn-brutal-sm bg-white px-2 py-1.5"
                title="Copy command"
              >
                {copiedCommand === "daemon" ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            {computerSetupCommand && (
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <SectionEyebrow as="div">
                    Computer
                  </SectionEyebrow>
                  <ExperimentalBadge />
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 border-2 border-black bg-black text-brutal-lime px-3 py-2 font-mono text-xs break-all shadow-brutal-sm">
                    {computerSetupCommand}
                  </code>
                  <button
                    onClick={() => handleCopy("computer", computerSetupCommand)}
                    className="btn-brutal-sm bg-white px-2 py-1.5"
                    title="Copy Computer (experimental) command"
                  >
                    {copiedCommand === "computer" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Waiting indicator */}
            <Banner
              intent="info"
              className="mb-4"
              icon={<StatusDot tone="bg-brutal-orange" pulse className="self-center" />}
            >
              <span className="font-bold text-black">
                Waiting for computer to connect...
              </span>
            </Banner>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-brutal bg-white px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled
                className="btn-brutal bg-brutal-lime/50 px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Connected — name the machine */}
        {step === "connected" && (
          <div>
            <div className="mb-4 flex items-center gap-3 border-2 border-black bg-brutal-lime/30 p-4">
              <CheckCircle size={24} className="text-black shrink-0" />
              <div>
                <div className="font-bold text-sm text-black">
                  Computer connected successfully!
                </div>
                {pendingMachine?.hostname && (
                  <div className="text-xs text-black/60 font-mono mt-0.5">
                    {pendingMachine.hostname} — {pendingMachine.os || "Unknown OS"}
                  </div>
                )}
              </div>
            </div>

            <FormField
              label="Computer Name"
              hint="A friendly name for this computer."
              className="mb-4"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-brutal w-full text-sm"
                placeholder={pendingMachine?.hostname || "My Mac"}
                autoFocus
              />
            </FormField>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleDone}
                disabled={saving}
                className="btn-brutal bg-brutal-lime px-4 py-2 text-sm disabled:opacity-50"
              >
                {saving ? "Saving…" : "Done"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
