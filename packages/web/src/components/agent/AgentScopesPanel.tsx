// Agent permissions panel — toggle grantable scopes for an agent.
//
// Spec: #proj-permission:10bdc2c9 (locked 2026-05-10).
//
//   • Resource-grouped toggles using AGENT_SCOPE_GROUPS from shared.
//   • Only rendered when the viewer has the `manageAgents` capability;
//     read-only viewers never see this panel (the parent gates rendering).
//
// Wire shape: GET / PUT /api/agents/:id/scopes return AgentScopeSet:
//   { agentId, granted: AgentGrantableScope[], revision, updatedAt }
//
// Save semantics: optimistic local state, single PUT on Save, snap back to
// server response on success or to last-known-good on failure. We do not
// auto-save per-toggle — the human's mental model here is "pick the set you
// want, commit it" — and the server's revision counter is whole-set anyway.

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  AGENT_SCOPE_GROUPS,
  type AgentGrantableScope,
  type AgentScopeSet,
} from "@slock-ai/shared";
import api from "../../api/client";
import Banner from "../ui/Banner";
import Checkbox from "../ui/Checkbox";

interface Props {
  agentId: string;
}

export default function AgentScopesPanel({ agentId }: Props) {
  const [serverSet, setServerSet] = useState<AgentScopeSet | null>(null);
  const [draft, setDraft] = useState<Set<AgentGrantableScope> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AgentScopeSet>(`/agents/${agentId}/scopes`);
      setServerSet(data);
      setDraft(new Set(data.granted));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load agent permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const dirty = useMemo(() => {
    if (!serverSet || !draft) return false;
    if (draft.size !== serverSet.granted.length) return true;
    for (const s of serverSet.granted) if (!draft.has(s)) return true;
    return false;
  }, [serverSet, draft]);

  const toggle = (scope: AgentGrantableScope) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      const scopes = Array.from(draft);
      const { data } = await api.put<AgentScopeSet>(`/agents/${agentId}/scopes`, { scopes });
      setServerSet(data);
      setDraft(new Set(data.granted));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to save agent permissions");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!serverSet) return;
    setDraft(new Set(serverSet.granted));
  };

  const applyDefault = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.put<AgentScopeSet>(`/agents/${agentId}/scopes`, { mode: "default" });
      setServerSet(data);
      setDraft(new Set(data.granted));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to reset agent permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-5 py-4">
        <span className="text-sm text-black/40 font-mono">Loading permissions…</span>
      </div>
    );
  }

  if (error && !serverSet) {
    return (
      <div className="px-5 py-4 flex flex-col items-start gap-3">
        <Banner intent="warning">{error}</Banner>
        <button
          type="button"
          onClick={() => void load()}
          className="btn-brutal-sm flex items-center gap-1 bg-white px-2 py-1 text-xs font-bold"
        >
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  if (!serverSet || !draft) return null;

  const renderGroup = (group: (typeof AGENT_SCOPE_GROUPS)[number]) => (
    <div key={group.resource} className="border-2 border-black bg-white">
      <div className="border-b-2 border-black px-3 py-2">
        <div className="text-sm font-bold text-black">{group.label}</div>
        <div className="text-xs text-black/50">{group.description}</div>
      </div>
      <div>
        {group.scopes.map((row) => {
          const checked = draft.has(row.scope);
          return (
            <label
              key={row.scope}
              className="flex items-start gap-3 border-b border-black/10 px-3 py-2 last:border-b-0 hover:bg-brutal-yellow/30"
            >
              <Checkbox
                size="md"
                checked={checked}
                onChange={() => toggle(row.scope)}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-black">{row.verbLabel}</span>
                  <code className="font-mono text-[10px] text-black/40">{row.scope}</code>
                </div>
                <div className="mt-0.5 text-xs text-black/60">{row.description}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );

  const notificationGroups = AGENT_SCOPE_GROUPS.filter((group) => group.section === "notifications");
  const cliGroups = AGENT_SCOPE_GROUPS.filter((group) => group.section === "cli");

  return (
    <div className="px-5 py-4">
      {error && (
        <div className="mb-3">
          <Banner intent="warning">{error}</Banner>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-2 border-black bg-white px-3 py-2">
        <div>
          <div className="text-sm font-bold text-black">
            {serverSet.mode === "default" ? "Using default permissions" : "Customized permissions"}
          </div>
          <div className="text-xs text-black/50">
            {serverSet.mode === "default"
              ? "New default capabilities are enabled automatically for this agent."
              : "New capabilities stay off until you turn them on for this agent."}
          </div>
        </div>
        {serverSet.mode === "custom" && (
          <button
            type="button"
            onClick={() => void applyDefault()}
            disabled={saving}
            className="btn-brutal-sm bg-white px-2 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use default
          </button>
        )}
      </div>

      <div className="space-y-5">
        <section>
          <div className="mb-2">
            <div className="text-sm font-bold text-black">Notifications / inbox</div>
            <div className="text-xs text-black/50">Controls what can wake the agent or enter its inbox.</div>
          </div>
          <div className="space-y-3">{notificationGroups.map(renderGroup)}</div>
        </section>

        <section>
          <div className="mb-2">
            <div className="text-sm font-bold text-black">Slock CLI permissions</div>
            <div className="text-xs text-black/50">Controls what the agent can actively do through slock CLI commands.</div>
          </div>
          <div className="space-y-3">{cliGroups.map(renderGroup)}</div>
        </section>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={!dirty || saving}
          className="btn-brutal flex items-center gap-2 bg-brutal-pink px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save permissions"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={!dirty || saving}
          className="btn-brutal flex items-center gap-2 bg-white px-4 py-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Discard
        </button>
        <span className="ml-auto text-[11px] text-black/40 font-mono">
          rev {serverSet.revision}
        </span>
      </div>
    </div>
  );
}
