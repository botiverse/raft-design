import { useMemo, useState } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useServerStore } from "../store/serverStore";
import { ExperimentalBadge } from "../components/ui/ExperimentalBadge";

function appendCode(returnTo: string, code: string) {
  const url = new URL(returnTo);
  url.searchParams.set("code", code);
  return url.toString();
}

export default function HumanLoginSetupPage() {
  const user = useAuthStore((s) => s.user);
  const servers = useServerStore((s) => s.servers);
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const configuredReturnUrl = params.get("return_to") || "";
  const clientId = params.get("client_id") || "";
  const scopes = useMemo(() => {
    const raw = params.get("scope") || "openid profile";
    return raw.split(/\s+/).map((scope) => scope.trim()).filter(Boolean);
  }, [params]);
  const [selectedServerId, setSelectedServerId] = useState(() => servers[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  async function continueToApp() {
    if (!clientId.trim()) {
      setStatus("This service is missing a registered client id.");
      return;
    }
    if (!configuredReturnUrl.trim()) {
      setStatus("This service is missing a configured return URL.");
      return;
    }
    if (!selectedServerId) {
      setStatus("Choose a Slock server to continue.");
      return;
    }

    setSubmitting(true);
    setStatus("");
    try {
      const { data } = await api.post("/oauth/authorize/human", {
        clientId,
        serverId: selectedServerId,
        returnUrl: configuredReturnUrl,
        scopes,
      });
      window.location.assign(appendCode(data.returnUrl || configuredReturnUrl, data.code));
    } catch (err: any) {
      setStatus(err.response?.data?.error || "Failed to continue with Slock.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedServer = servers.find((server) => server.id === selectedServerId);

  return (
    <div className="min-h-screen bg-brutal-cream font-display text-black">
      <header className="flex items-center justify-between border-b-2 border-black bg-white px-6 py-4">
        <div className="flex items-center gap-3 font-black">
          <div className="grid size-9 place-items-center border-2 border-black bg-brutal-yellow shadow-brutal-sm">S</div>
          <div>
            <div>Slock</div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-black/50">Login with Slock</span>
              <ExperimentalBadge />
            </div>
          </div>
        </div>
        <a className="text-sm font-bold underline" href="/">Back to Slock</a>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-5 py-10 md:grid-cols-[1fr_360px]">
        <section className="border-2 border-black bg-white p-6 shadow-brutal">
          <div className="mb-4 inline-flex border-2 border-black bg-brutal-blue/30 px-2 py-1 text-xs font-black uppercase tracking-widest">
            Slock-hosted login
          </div>
          <h1 className="mb-3 text-4xl font-black leading-none">Continue to Orbital Notes</h1>
          <p className="mb-5 text-sm leading-6 text-black/70">
            You are signed in to Slock as <strong>{user?.displayName || user?.name || user?.email}</strong>.
            This page is the human Login with Slock entry for Orbital Notes.
          </p>

          <div className="border-2 border-black bg-brutal-yellow/40 p-4 text-sm">
            The return URL is configured by the service registry. Agents do not use this human browser flow:
            any installed service can ask Slock for an agent-scoped credential when the agent needs to use it.
          </div>

          <div className="mt-5">
            <div className="text-xs font-black uppercase tracking-widest">Client ID</div>
            <div className="mt-1 break-all border-2 border-black bg-white px-3 py-2 text-sm font-bold">
              {clientId || "Missing registered client id"}
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs font-black uppercase tracking-widest">Configured return URL</div>
            <div className="mt-1 break-all border-2 border-black bg-white px-3 py-2 text-sm font-bold">
              {configuredReturnUrl || "Missing service return URL"}
            </div>
          </div>

          <div className="mt-5">
            <label className="text-xs font-black uppercase tracking-widest" htmlFor="slock-login-server">
              Slock server context
            </label>
            <select
              id="slock-login-server"
              value={selectedServerId}
              onChange={(event) => setSelectedServerId(event.target.value)}
              className="mt-1 w-full border-2 border-black bg-white px-3 py-2 text-sm font-bold shadow-brutal-sm"
            >
              {servers.map((server) => (
                <option key={server.id} value={server.id}>
                  {server.name} ({server.slug})
                </option>
              ))}
            </select>
            {selectedServer && (
              <div className="mt-1 text-xs text-black/60">
                Third-party access is scoped to this server only.
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={submitting || !clientId.trim() || !configuredReturnUrl.trim() || !selectedServerId}
              onClick={continueToApp}
              className="border-2 border-black bg-brutal-yellow px-4 py-2 font-black shadow-brutal-sm disabled:opacity-50"
            >
              {submitting ? "Continuing…" : "Continue as human"}
            </button>
          </div>

          {status && <pre className="mt-4 min-h-16 overflow-auto bg-black p-3 text-xs text-white">{status}</pre>}
        </section>

        <aside className="border-2 border-black bg-white p-5 shadow-brutal-sm">
          <h2 className="mb-2 text-xl font-black">Product boundary</h2>
          <p className="text-sm leading-6 text-black/70">
            Service configuration happens in Slock's integration registry: client id, client secret, scopes, and
            allowed return URLs. Agent login is not a human approval redirect; installed services can obtain
            agent-scoped credentials from Slock when agents need them.
          </p>
        </aside>
      </main>
    </div>
  );
}
