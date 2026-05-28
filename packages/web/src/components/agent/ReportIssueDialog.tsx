import { useMemo, useState } from "react";
import { Bug, CheckCircle, X } from "lucide-react";
import Modal from "../Modal";
import Banner from "../ui/Banner";
import Checkbox from "../ui/Checkbox";
import SectionEyebrow from "../ui/SectionEyebrow";
import FormField from "../ui/FormField";
import api from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { useServerStore } from "../../store/serverStore";
import { useAgentStore, type Agent } from "../../store/agentStore";
import { useMachineStore } from "../../store/machineStore";
import webPackage from "../../../package.json";
import { buildFeedbackExportBundle, type FeedbackExportBundleV2 } from "../../utils/feedbackExportBundle";
import { detectBrowserTimezone } from "../../utils/timeFormatting";

interface ReportIssueDialogProps {
  agent: Agent;
  dmChannelId?: string;
  onClose: () => void;
}

const FEEDBACK_EXPORT_URL = import.meta.env.VITE_FEEDBACK_EXPORT_URL?.replace(/\/+$/, "") || "";
const FEEDBACK_EXPORT_ENABLED = Boolean(FEEDBACK_EXPORT_URL);
const VERSION_ENV = import.meta.env as ImportMetaEnv & { VITE_APP_VERSION?: string; VITE_COMMIT_SHA?: string };
const FEEDBACK_APP_VERSION = [
  VERSION_ENV.VITE_APP_VERSION?.trim() || webPackage.version,
  VERSION_ENV.VITE_COMMIT_SHA?.trim(),
].filter(Boolean).join("+") || null;

type ScopeAttestationResponse = {
  attestation: string;
  scope: string;
  expiresAt: string;
};

type CreateReportResponse = {
  id: string;
  upload: {
    method: "PUT";
    url: string;
    headers: Record<string, string>;
  };
  completeToken: string;
  expiresAt: string;
};

function buildExportFilename(agent: Agent) {
  const safeName = (agent.displayName || agent.name)
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "agent";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `slock-feedback-export-${safeName}-${timestamp}.json`;
}

async function sha256Hex(blob: Blob) {
  const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function ReportIssueDialog({ agent, dmChannelId, onClose }: ReportIssueDialogProps) {
  const user = useAuthStore((s) => s.user);
  const server = useServerStore((s) => s.current);
  const getActivityLog = useAgentStore((s) => s.getActivityLog);
  const getTrajectoryLog = useAgentStore((s) => s.getTrajectoryLog);
  const machines = useMachineStore((s) => s.machines);
  const machine = useMemo(
    () => (agent.machineId ? machines.find((entry) => entry.id === agent.machineId) : null),
    [agent.machineId, machines]
  );

  const [description, setDescription] = useState("");
  const [includeRecentMessages, setIncludeRecentMessages] = useState(true);
  const [includeActivityLog, setIncludeActivityLog] = useState(true);
  const [includeTrajectoryLog, setIncludeTrajectoryLog] = useState(true);
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!consented || loading) return;
    if (!FEEDBACK_EXPORT_ENABLED) {
      setError("Feedback export is not configured for this deployment yet.");
      return;
    }
    if (!server?.id) {
      setError("Current server is unavailable.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let recentMessages: unknown[] | null = null;
      if (includeRecentMessages && dmChannelId) {
        const { data } = await api.get(`/messages/channel/${dmChannelId}?limit=100`);
        recentMessages = Array.isArray(data?.messages) ? data.messages : [];
      }

      const activityLog = includeActivityLog ? getActivityLog(agent.id) : null;
      const trajectoryLog = includeTrajectoryLog ? getTrajectoryLog(agent.id) : null;

      const bundle: FeedbackExportBundleV2 = buildFeedbackExportBundle({
        appVersion: FEEDBACK_APP_VERSION,
        daemonVersion: machine?.daemonVersion ?? null,
        reporter: {
          id: user?.id ?? null,
          email: user?.email ?? null,
          name: user?.name ?? null,
          displayName: user?.displayName ?? null,
        },
        server: {
          id: server.id,
          slug: server.slug ?? null,
          name: server.name ?? null,
        },
        agent: {
          id: agent.id,
          name: agent.name,
          displayName: agent.displayName,
          description: agent.description,
          status: agent.status,
          runtime: agent.runtime,
          model: agent.model,
          reasoningEffort: agent.reasoningEffort,
          machineId: agent.machineId,
          machineName: machine?.name ?? null,
          machineStatus: machine?.status ?? null,
        },
        recentMessages,
        ephemeralActivityBuffer: activityLog,
        durableTrajectoryLog: trajectoryLog,
        includeRecentMessages,
        includeEphemeralActivityBuffer: includeActivityLog,
        includeDurableTrajectoryLog: includeTrajectoryLog,
        description,
        browser: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          language: navigator.language,
          languages: navigator.languages,
          platform: navigator.platform,
          timezone: detectBrowserTimezone() ?? "unknown",
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
        },
      });

      const bundleFile = new File(
        [JSON.stringify(bundle, null, 2)],
        buildExportFilename(agent),
        { type: "application/json" }
      );
      const bundleSha256 = await sha256Hex(bundleFile);

      const { data: session } = await api.post<ScopeAttestationResponse>(
        `/servers/${server.id}/scope-attestation`,
        { scope: "feedback-report:create" }
      );

      const createResponse = await fetch(`${FEEDBACK_EXPORT_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attestation: session.attestation,
          agentId: agent.id,
          agentName: agent.displayName || agent.name,
          bundleFilename: bundleFile.name,
          bundleContentType: bundleFile.type || "application/json",
          bundleSizeBytes: bundleFile.size,
          bundleSha256,
          source: "slock-web",
          category: "bug",
          title: `Issue report for ${agent.displayName || agent.name}`,
          description: description.trim() || undefined,
          appVersion: bundle.appVersion ?? undefined,
          daemonVersion: bundle.daemonVersion ?? undefined,
          metadata: {
            schemaVersion: bundle.schemaVersion,
            dmChannelId: dmChannelId || null,
            deploymentEnv: import.meta.env.VITE_DEPLOYMENT_ENV || null,
            includes: {
              recentMessages: bundle.logs.recentMessages.included,
              activityLog: bundle.logs.ephemeralActivityBuffer.included,
              trajectoryLog: bundle.logs.durableTrajectoryLog.included,
              ephemeralActivityBuffer: bundle.logs.ephemeralActivityBuffer.included,
              durableTrajectoryLog: bundle.logs.durableTrajectoryLog.included,
            },
          },
        }),
      });

      if (!createResponse.ok) {
        const body = await createResponse.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || "Failed to create feedback report");
      }

      const report = await createResponse.json() as CreateReportResponse;

      const uploadResponse = await fetch(report.upload.url, {
        method: report.upload.method,
        headers: report.upload.headers,
        body: bundleFile,
      });
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload feedback bundle");
      }

      const completeResponse = await fetch(`${FEEDBACK_EXPORT_URL}/api/reports/${report.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completeToken: report.completeToken,
        }),
      });
      if (!completeResponse.ok) {
        const body = await completeResponse.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || "Failed to finalize feedback report");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit issue report");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Modal onClose={onClose}>
        <div className="w-full max-w-sm card-brutal p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold uppercase">Report Submitted</h2>
            <button onClick={onClose} className="btn-brutal-sm bg-white p-1">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex size-12 items-center justify-center border-2 border-black bg-brutal-lime">
              <CheckCircle size={24} />
            </div>
            <div className="text-center">
              <p className="font-bold text-black">Feedback export uploaded.</p>
              <p className="mt-1 text-sm text-black/60">
                The bundle includes the issue description plus the client-side context you selected.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="btn-brutal bg-brutal-lime px-4 py-2 text-sm">
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-sm card-brutal p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug size={18} />
            <h2 className="text-lg font-bold uppercase">Report Issue</h2>
          </div>
          <button onClick={onClose} className="btn-brutal-sm bg-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 border-2 border-black bg-white px-3 py-2">
          <SectionEyebrow>Agent</SectionEyebrow>
          <p className="mt-0.5 font-bold text-black">{agent.displayName || agent.name}</p>
        </div>

        <FormField label="Describe the issue" optional className="mb-4">
          <textarea
            className="input-brutal w-full resize-none rounded-none p-2 text-sm"
            rows={3}
            placeholder="What went wrong? What did you expect?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </FormField>

        <div className="mb-4">
          <SectionEyebrow as="div" className="mb-1">Include</SectionEyebrow>
          <div className="flex flex-col gap-1.5">
            <label className="flex select-none items-center gap-2">
              <Checkbox
                checked={includeRecentMessages}
                onChange={(e) => setIncludeRecentMessages(e.target.checked)}
                disabled={loading}
              />
              <span className="text-sm">Recent DM messages with this agent</span>
            </label>
            <label className="flex select-none items-center gap-2">
              <Checkbox
                checked={includeActivityLog}
                onChange={(e) => setIncludeActivityLog(e.target.checked)}
                disabled={loading}
              />
              <span className="text-sm">Recent live agent activity</span>
            </label>
            <label className="flex select-none items-center gap-2">
              <Checkbox
                checked={includeTrajectoryLog}
                onChange={(e) => setIncludeTrajectoryLog(e.target.checked)}
                disabled={loading}
              />
              <span className="text-sm">Activity tab history</span>
            </label>
          </div>
        </div>

        <Banner intent="warning" withIcon density="sm" className="mb-5">
          <p className="mb-2 text-black/80">
            This report may contain <strong>prompt history, file paths, and command output</strong>.
            Sensitive data redaction is best-effort and not guaranteed.
          </p>
          <label className="flex select-none items-center gap-2">
            <Checkbox
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              disabled={loading}
            />
            <span className="text-xs font-bold">I understand and consent to sharing this data</span>
          </label>
        </Banner>

        {error && (
          <Banner intent="warning" className="mb-4 font-bold">
            {error}
          </Banner>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-brutal bg-white px-4 py-2 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !consented}
            className="btn-brutal bg-brutal-pink px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Report Issue"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
