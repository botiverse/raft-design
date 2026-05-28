import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useServerStore } from "../../store/serverStore";
import api from "../../api/client";
import { storePendingInvite } from "../../utils/socialAuth";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import Banner from "../ui/Banner";
import CenteredCardFrame from "./CenteredCardFrame";
import { AuthPageIntro } from "./AuthPageFrame";
import AgreementBody from "../server/AgreementBody";

interface InviteAcceptPageProps {
  token: string;
  onInviteConsumed: () => void;
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
}

function pluralize(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * Inside-count sentence for the invite page. Returns JSX (not a raw string) so
 * the numeric/noun segments can be bolded individually while the connective
 * ("Meet", "and", "inside.") stays regular weight. Returns null when the
 * server has no humans/agents to mention.
 */
function renderInsideCount(humans: number, agents: number): React.ReactNode {
  const segments: React.ReactNode[] = [];
  if (humans > 0) segments.push(<strong key="h">{pluralize(humans, "human", "humans")}</strong>);
  if (agents > 0) segments.push(<strong key="a">{pluralize(agents, "agent", "agents")}</strong>);
  if (segments.length === 0) return null;
  return (
    <>
      Meet {segments[0]}
      {segments.length > 1 && <> and {segments[1]}</>} inside.
    </>
  );
}

function renderInsidePreview(inviteInfo: { memberCount: number; agentCount: number; insideCountsHidden?: boolean }): React.ReactNode {
  if (inviteInfo.insideCountsHidden) {
    return <>Meet <strong>everyone</strong> inside.</>;
  }
  return renderInsideCount(inviteInfo.memberCount, inviteInfo.agentCount);
}

function clearInviteUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("invite");
  const nextPath = window.location.pathname.startsWith("/join/") ? "/" : url.pathname;
  const nextSearch = url.searchParams.toString();
  window.history.replaceState({}, "", `${nextPath}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`);
}

export default function InviteAcceptPage({
  token,
  onInviteConsumed,
  onSwitchToLogin,
  onSwitchToRegister,
}: InviteAcceptPageProps) {
  const user = useAuthStore((s) => s.user);
  const acceptInvite = useAuthStore((s) => s.acceptInvite);
  const loadServers = useServerStore((s) => s.loadServers);
  const setCurrent = useServerStore((s) => s.setCurrent);
  const navigate = useNavigate();

  const [inviteInfo, setInviteInfo] = useState<{
    kind: "email" | "join_link";
    serverName: string;
    inviterName: string | null;
    memberCount: number;
    agentCount: number;
    insideCountsHidden?: boolean;
    agreement: {
      id: string;
      title: string;
      bodyMarkdown: string;
      version: number;
    } | null;
  } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptedServerName, setAcceptedServerName] = useState("");
  const [acceptedServerId, setAcceptedServerId] = useState("");
  const [error, setError] = useState("");
  const insidePreview = inviteInfo ? renderInsidePreview(inviteInfo) : null;

  // Load invite info
  useEffect(() => {
    const loadInfo = async () => {
      try {
        const { data } = await api.get(`/auth/invite-info?token=${encodeURIComponent(token)}`);
        setInviteInfo(data);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          setError("This invite link is invalid or has expired.");
        } else if (status === 429) {
          setError("Too many attempts. Please wait a minute and try again.");
        } else {
          setError("Failed to load invite link. Please try again.");
        }
      } finally {
        setLoadingInfo(false);
      }
    };
    loadInfo();
  }, [token]);

  // Auto-accept if user is logged in
  useEffect(() => {
    if (user && inviteInfo && !inviteInfo.agreement && !accepted && !accepting) {
      handleAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, inviteInfo]);

  const handleAccept = async (agreementId?: string | null) => {
    setAccepting(true);
    setError("");
    try {
      const result = await acceptInvite(token, agreementId);
      setAccepted(true);
      setAcceptedServerName(result.serverName);
      setAcceptedServerId(result.serverId);

      clearInviteUrl();
      onInviteConsumed();

      // Reload servers and route directly into the joined server so we do not
      // fall back through "/" and restore a previously active server tab.
      await loadServers();
      const joinedServer = useServerStore.getState().servers.find((server) => server.id === result.serverId);
      if (joinedServer) {
        setCurrent(joinedServer);
        navigate(`/s/${joinedServer.slug}`, { replace: true });
        return;
      }

      // Fallback only if the fresh server list still does not contain the joined
      // server yet. The continue button will retry by serverId.
    } catch (err: any) {
      const response = err?.response?.data;
      if ((response?.error === "agreement_required" || response?.error === "agreement_changed") && response.agreement) {
        setInviteInfo((current) => current ? { ...current, agreement: response.agreement } : current);
        setError("");
        return;
      }
      setError(response?.error || "Failed to accept invite");
    } finally {
      setAccepting(false);
    }
  };

  const handleContinue = () => {
    const joinedServer = useServerStore.getState().servers.find((server) => server.id === acceptedServerId);
    if (joinedServer) {
      setCurrent(joinedServer);
      navigate(`/s/${joinedServer.slug}`, { replace: true });
      return;
    }
    window.location.reload();
  };

  if (loadingInfo) {
    return (
      <CenteredCardFrame>
        <div className="w-full">
          <AuthPageIntro title="Loading invite…" />
        </div>
      </CenteredCardFrame>
    );
  }

  if (accepted) {
    return (
      <CenteredCardFrame>
        <div className="w-full">
          <AuthPageIntro
            title="You're in"
            description={<>You've joined <strong>{acceptedServerName}</strong>.</>}
          />
          <button
            onClick={handleContinue}
            className="btn-brutal w-full bg-brutal-pink px-3 py-2 text-sm"
          >
            Continue to Slock
          </button>
        </div>
      </CenteredCardFrame>
    );
  }

  return (
    <CenteredCardFrame>
      <div className="w-full">
        {error ? (
          <>
            <AuthPageIntro title="Invite error" />
            <Banner intent="warning" className="mb-6 font-bold">
              {error}
            </Banner>
          </>
        ) : inviteInfo ? (
          <>
            <AuthPageIntro
              title={inviteInfo.kind === "join_link" ? "Join this server" : "You're invited"}
              description={inviteInfo.kind === "join_link" ? (
                <>Use this link to join <strong>{inviteInfo.serverName}</strong> on Slock.</>
              ) : (
                <>
                  <strong>{inviteInfo.inviterName}</strong> invited you to join{" "}
                  <strong>{inviteInfo.serverName}</strong> on Slock.
                </>
              )}
            >
              {insidePreview && (
                <p className="mt-2 text-sm text-black/60">
                  {insidePreview}
                </p>
              )}
            </AuthPageIntro>
            {inviteInfo.agreement && (
              <div className="card-brutal mb-4 p-4 text-left">
                <div className="mb-3">
                  <div className="text-sm font-bold text-black">{inviteInfo.agreement.title}</div>
                  <div className="mt-0.5 text-xs text-black/50">Version {inviteInfo.agreement.version}</div>
                </div>
                <div className="max-h-56 overflow-y-auto border-2 border-black/30 bg-brutal-cream p-3 text-sm">
                  <AgreementBody source={inviteInfo.agreement.bodyMarkdown} />
                </div>
              </div>
            )}
          </>
        ) : null}

        {accepting && (
          <div className="mb-4 text-center text-sm text-black/60">Joining server…</div>
        )}

        {user && inviteInfo?.agreement && !error && (
          <button
            onClick={() => void handleAccept(inviteInfo.agreement?.id)}
            disabled={accepting}
            className="btn-brutal w-full bg-brutal-pink px-3 py-2 text-sm disabled:opacity-50"
          >
            {accepting ? "Joining server…" : "Agree & Join"}
          </button>
        )}

        {!user && inviteInfo && !error && (
          <div className="space-y-3">
            <p className="text-center text-sm text-black/60 mb-4">
              Sign in or create an account to accept this invite.
            </p>
            <button
              onClick={() => {
                // Store invite token for after login, then clear URL and switch view
                storePendingInvite(token);
                clearInviteUrl();
                onSwitchToLogin();
              }}
              className="btn-brutal flex w-full items-center justify-center gap-2 bg-brutal-pink px-3 py-2 text-sm"
            >
              <LogIn size={16} />
              Sign In
            </button>
            <button
              onClick={() => {
                storePendingInvite(token);
                clearInviteUrl();
                onSwitchToRegister();
              }}
              className="btn-brutal-sm flex w-full items-center justify-center gap-2 bg-white p-2 text-sm"
            >
              <UserPlus size={14} />
              Create Account
            </button>
          </div>
        )}

        {error && (
          <button
            onClick={() => {
              clearInviteUrl();
              window.location.reload();
            }}
            className="btn-brutal flex w-full items-center justify-center gap-2 bg-white px-3 py-2 text-sm"
          >
            <ArrowLeft size={16} />
            Go to Slock
          </button>
        )}
      </div>
    </CenteredCardFrame>
  );
}
