import { useEffect, useRef, useState, useMemo } from "react";
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useServerStore, type Server } from "./store/serverStore";
import AgentLoginKeySetupPage from "./pages/AgentLoginKeySetupPage";
import DeviceLoginPage from "./pages/DeviceLoginPage";
import HumanLoginSetupPage from "./pages/HumanLoginSetupPage";
import { useChannelStore } from "./store/channelStore";
import api from "./api/client";
import PaletteAuditPage from "./pages/PaletteAuditPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import EmailVerificationPage from "./components/auth/EmailVerificationPage";
import InviteAcceptPage from "./components/auth/InviteAcceptPage";
import SocialAuthCallbackPage from "./components/auth/SocialAuthCallbackPage";
import ServerSelector from "./components/auth/ServerSelector";
import ImageLightbox from "./components/ImageLightbox";
import MainLayout from "./components/layout/MainLayout";
import {
  MAX_AUTH_RESTORE_MS,
  getAuthBootstrapView,
  hasAuthRestoreTimedOut,
  shouldRetryAuthRestore,
} from "./utils/authRestoreMachine";
import { shouldRecoverAuthOnBrowserSignal } from "./utils/browserRecoveryPolicy";
import { PENDING_INVITE_STORAGE_KEY } from "./utils/socialAuth";
import { useLastLocationResume } from "./hooks/useLastLocationResume";
import { NavigationDepthTracker, useAppNavigate } from "./hooks/useAppNavigate";
import {
  SLOCKDEV_EMAIL,
  SLOCKDEV_PASSWORD,
  getEnvironmentLabel,
  getSlockdevSeedCommand,
  isSlockdevEnvironment,
  shouldAutoLoginSlockdev,
  type AuthView,
} from "./utils/devMode";

/** Parse URL search params once */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const joinMatch = window.location.pathname.match(/^\/join\/([^/?#]+)/);
  return {
    authCallback: params.get("auth_callback"),
    verifyToken: params.get("verify"),
    resetToken: params.get("reset"),
    inviteToken: params.get("invite") || joinMatch?.[1] || null,
  };
}

const deploymentEnv = import.meta.env.VITE_DEPLOYMENT_ENV;
const isSlockdev = isSlockdevEnvironment(deploymentEnv);
const environmentLabel = getEnvironmentLabel(deploymentEnv);
const APP_DOCUMENT_TITLE = "Slock";

function getServerDocumentTitle(server: Pick<Server, "name" | "slug">): string {
  const serverLabel = server.name.trim() || server.slug;
  return `${serverLabel} | ${APP_DOCUMENT_TITLE}`;
}

const SERVER_SELECTION_REQUESTED_KEY = "slock_server_selection_requested";

export function requestServerSelection() {
  try {
    sessionStorage.setItem(SERVER_SELECTION_REQUESTED_KEY, "1");
  } catch {
    // Ignore storage failures; navigation still falls back safely.
  }
}

function consumeServerSelectionRequest(): boolean {
  try {
    const requested = sessionStorage.getItem(SERVER_SELECTION_REQUESTED_KEY) === "1";
    if (requested) {
      sessionStorage.removeItem(SERVER_SELECTION_REQUESTED_KEY);
    }
    return requested;
  } catch {
    return false;
  }
}

function EnvironmentBadge() {
  if (!environmentLabel) return null;
  const className = isSlockdev
    ? "bg-brutal-yellow"
    : "bg-brutal-orange";
  return (
    <div className={`fixed bottom-2 left-2 z-40 border-2 border-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-brutal-sm opacity-80 safe-bottom ${className}`}>
      {environmentLabel}
    </div>
  );
}

function SlockdevDebugPanel() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const envName = import.meta.env.VITE_SLOCKDEV_ENV_NAME || "";
  const previewDescription = import.meta.env.VITE_SLOCKDEV_PREVIEW_DESCRIPTION?.trim() || "";
  const seedCommand = getSlockdevSeedCommand(envName);

  if (!isSlockdev) return null;

  const clearLocalState = () => {
    localStorage.removeItem("slock_access_token");
    localStorage.removeItem("slock_refresh_token");
    localStorage.removeItem("slock_last_server_slug");
    localStorage.removeItem(PENDING_INVITE_STORAGE_KEY);
    window.location.assign("/");
  };

  const copySeedCommand = async () => {
    try {
      await navigator.clipboard.writeText(seedCommand);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.warn("Failed to copy slockdev seed command", err);
    }
  };

  return (
    <div className="fixed bottom-2 right-2 z-50 flex flex-col items-end gap-2 font-display safe-bottom">
      {open && (
        <div className="w-72 border-2 border-black bg-white p-3 text-xs shadow-brutal">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <div className="font-bold uppercase tracking-widest text-black">Dev tools</div>
              <div className="text-black/50">{envName || "slockdev"} - {user?.name || "signed out"}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border border-black bg-white px-2 py-1 font-bold hover:bg-black hover:text-white"
            >
              x
            </button>
          </div>

          {previewDescription ? (
            <details className="mb-2 border border-black/20 bg-brutal-yellow/20 p-2" title={previewDescription}>
              <summary className="cursor-pointer select-none text-[10px] font-bold uppercase tracking-widest text-black/60">
                Preview description
              </summary>
              <p className="mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-words text-black/70">
                {previewDescription}
              </p>
            </details>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => login(SLOCKDEV_EMAIL, SLOCKDEV_PASSWORD).catch((err) => {
                console.error("Dev login failed", err);
              })}
              className="border-2 border-black bg-brutal-pink px-2 py-1 font-bold disabled:opacity-50"
            >
              Dev login
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="border-2 border-black bg-white px-2 py-1 font-bold"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("slock_last_server_slug");
                window.location.assign("/");
              }}
              className="border-2 border-black bg-white px-2 py-1 font-bold"
            >
              Server Picker
            </button>
            <button
              type="button"
              onClick={logout}
              className="border-2 border-black bg-white px-2 py-1 font-bold"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={clearLocalState}
              className="col-span-2 border-2 border-black bg-brutal-orange/30 px-2 py-1 font-bold"
            >
              Clear Local Session
            </button>
            <button
              type="button"
              onClick={copySeedCommand}
              className="col-span-2 border-2 border-black bg-brutal-yellow px-2 py-1 text-left font-mono text-[11px] font-bold"
            >
              {copied ? "Copied" : seedCommand}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title={previewDescription || undefined}
        className="border-2 border-black bg-brutal-yellow px-2 py-1 text-[10px] font-bold uppercase tracking-widest shadow-brutal-sm"
      >
        Dev tools
      </button>
    </div>
  );
}

/** Resolves server from URL slug and renders MainLayout */
function ServerAccessDeniedPage() {
  const servers = useServerStore((s) => s.servers);
  const current = useServerStore((s) => s.current);
  const navigate = useNavigate();
  const lastSlug = typeof window !== "undefined" ? localStorage.getItem("slock_last_server_slug") : null;
  const fallbackServer =
    (current ? servers.find((server) => server.id === current.id) : null) ??
    (lastSlug ? servers.find((server) => server.slug === lastSlug) : null) ??
    servers[0] ??
    null;
  const fallbackPath = fallbackServer ? `/s/${fallbackServer.slug}` : "/";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      navigate(fallbackPath, { replace: true });
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [fallbackPath, navigate]);

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-brutal-cream px-4 font-display safe-top safe-bottom">
      <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-brutal">
        <h1 className="text-2xl font-black text-black">Server not found</h1>
        <p className="mt-3 text-sm leading-6 text-black/70">
          {fallbackServer
            ? <>Redirecting to <strong>{fallbackServer.name}</strong> in 3 seconds.</>
            : <>Redirecting to your server list in 3 seconds.</>}
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => navigate(fallbackPath, { replace: true })}
            className="text-sm font-bold text-black/50 underline hover:text-black"
          >
            {fallbackServer ? "Go to my server" : "Choose a server"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ServerResolver() {
  const { serverSlug } = useParams<{ serverSlug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const appNav = useAppNavigate();
  const servers = useServerStore((s) => s.servers);
  const current = useServerStore((s) => s.current);
  const setCurrent = useServerStore((s) => s.setCurrent);
  const loading = useServerStore((s) => s.loading);
  const server = serverSlug ? servers.find((s) => s.slug === serverSlug) : undefined;
  const jointInviteId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("jointInvite");
  }, [location.search]);
  const jointInviteAcceptingRef = useRef<string | null>(null);
  const [showServerSelector, setShowServerSelector] = useState(false);

  useEffect(() => {
    if (loading || server) return;
    if (consumeServerSelectionRequest()) {
      setShowServerSelector(true);
      navigate("/", { replace: true });
    }
  }, [loading, navigate, server]);

  useEffect(() => {
    if (loading || !serverSlug) return;
    if (server && server.id !== current?.id) {
      setCurrent(server);
    }
  }, [serverSlug, server, loading, current?.id, setCurrent]);

  useEffect(() => {
    document.title = server ? getServerDocumentTitle(server) : APP_DOCUMENT_TITLE;
    return () => {
      document.title = APP_DOCUMENT_TITLE;
    };
  }, [server?.id, server?.name, server?.slug]);

  useEffect(() => {
    if (!jointInviteId || !server || !current || current.id !== server.id) return;
    if (jointInviteAcceptingRef.current === jointInviteId) return;

    jointInviteAcceptingRef.current = jointInviteId;
    api.post(`/channels/joint-invites/${encodeURIComponent(jointInviteId)}/accept`)
      .then(async ({ data }) => {
        const channelId = typeof data?.id === "string" ? data.id : null;
        if (channelId) {
          await useChannelStore.getState().ensureChannel(channelId);
          appNav.toChannel(channelId);
          return;
        }
        const params = new URLSearchParams(location.search);
        params.delete("jointInvite");
        const query = params.toString();
        navigate(`${location.pathname}${query ? `?${query}` : ""}`, { replace: true });
      })
      .catch((err) => {
        jointInviteAcceptingRef.current = null;
        console.error("Failed to accept joint channel invite", err);
      });
  }, [appNav, current, jointInviteId, location.pathname, location.search, navigate, server]);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-brutal-cream font-display safe-top">
        <div className="text-xl font-bold">Loading servers…</div>
      </div>
    );
  }

  if (!server) {
    if (showServerSelector) {
      return (
        <ServerSelector
          onSelect={(nextServer) => {
            setCurrent(nextServer);
            navigate(`/s/${nextServer.slug}`, { replace: true });
          }}
        />
      );
    }
    return <ServerAccessDeniedPage />;
  }

  if (!current || current.id !== server.id) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-brutal-cream font-display safe-top">
        <div className="text-xl font-bold">Loading…</div>
      </div>
    );
  }

  return <MainLayout key={server.id} />;
}

/** Auto-redirect to last server, or show ServerSelector */
function ServerRedirect() {
  const servers = useServerStore((s) => s.servers);
  const loading = useServerStore((s) => s.loading);
  const setCurrent = useServerStore((s) => s.setCurrent);
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-brutal-cream font-display safe-top">
        <div className="text-xl font-bold">Loading servers…</div>
      </div>
    );
  }

  // Auto-redirect to last used server
  const lastSlug = localStorage.getItem("slock_last_server_slug");
  const lastServer = lastSlug ? servers.find((s) => s.slug === lastSlug) : null;
  if (lastServer) {
    return <Navigate to={`/s/${lastServer.slug}`} replace />;
  }

  // No last server — show selector (user picks or creates)
  return (
    <ServerSelector
      onSelect={(server) => {
        setCurrent(server);
        navigate(`/s/${server.slug}`);
      }}
    />
  );
}

// Standalone palette audit page (#proj-uiux:0e6befb8 task #92).
// Bypasses auth + MainLayout so it can scroll freely (the normal
// shell pins #root with overflow:hidden which fights long pages).
// Routed at the App boundary so the auth/data hooks below run inside
// AppShell and are never conditionally skipped — earlier the early-return
// gated `window.location.pathname === "/palette-audit"` made every hook in
// AppShell rules-of-hooks-conditional under SPA nav.
function AppShell() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const initialized = useAuthStore((s) => s.initialized);
  const restoreState = useAuthStore((s) => s.restoreState);
  const login = useAuthStore((s) => s.login);
  const loadUser = useAuthStore((s) => s.loadUser);
  const logout = useAuthStore((s) => s.logout);
  const acceptInvite = useAuthStore((s) => s.acceptInvite);

  const serverLoading = useServerStore((s) => s.loading);
  const loadServers = useServerStore((s) => s.loadServers);
  const navigate = useNavigate();

  const [authView, setAuthView] = useState<AuthView>("login");
  const [devAutoLoginAttempted, setDevAutoLoginAttempted] = useState(false);

  // Read URL params once on mount, but inviteToken is stateful so it can be cleared
  const urlParamsRef = useMemo(() => getUrlParams(), []);
  const [inviteToken, setInviteToken] = useState<string | null>(urlParamsRef.inviteToken);
  const urlParams = useMemo(() => ({ ...urlParamsRef, inviteToken }), [urlParamsRef, inviteToken]);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const hasStoredSession = !!(accessToken && refreshToken);
  const authBootstrapView = getAuthBootstrapView({ initialized, restoreState });
  const authRestoreStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldAutoLoginSlockdev({
      deploymentEnv,
      initialized,
      attempted: devAutoLoginAttempted,
      hasUser: !!user,
      hasStoredSession,
      authView,
      authCallback: urlParams.authCallback,
      resetToken: urlParams.resetToken,
      inviteToken: urlParams.inviteToken,
    })) {
      return;
    }

    setDevAutoLoginAttempted(true);
    login(SLOCKDEV_EMAIL, SLOCKDEV_PASSWORD).catch((err) => {
      console.warn("Slockdev auto-login failed", err);
    });
  }, [
    initialized,
    devAutoLoginAttempted,
    user,
    hasStoredSession,
    authView,
    urlParams.authCallback,
    urlParams.resetToken,
    urlParams.inviteToken,
    login,
  ]);

  // Mobile browsers can transiently fail /auth/me during foreground restore.
  // Keep retrying session restoration while credentials still exist so the UI
  // doesn't bounce back to the login screen during a recoverable outage.
  useEffect(() => {
    if (!shouldRetryAuthRestore({ initialized, restoreState, hasStoredSession })) {
      authRestoreStartedAtRef.current = null;
      return;
    }

    if (authRestoreStartedAtRef.current === null) {
      authRestoreStartedAtRef.current = Date.now();
    }

    const elapsedMs = Date.now() - authRestoreStartedAtRef.current;
    if (hasAuthRestoreTimedOut({ initialized, restoreState, hasStoredSession, elapsedMs })) {
      logout();
      return;
    }

    const retryInterval = window.setInterval(() => {
      const retryElapsedMs = authRestoreStartedAtRef.current === null
        ? 0
        : Date.now() - authRestoreStartedAtRef.current;
      if (hasAuthRestoreTimedOut({ initialized, restoreState, hasStoredSession, elapsedMs: retryElapsedMs })) {
        logout();
        return;
      }
      loadUser();
    }, 1500);
    const timeout = window.setTimeout(() => {
      logout();
    }, Math.max(0, MAX_AUTH_RESTORE_MS - elapsedMs));
    return () => {
      window.clearInterval(retryInterval);
      window.clearTimeout(timeout);
    };
  }, [initialized, restoreState, hasStoredSession, loadUser, logout]);

  useEffect(() => {
    const handleRecoverySignal = () => {
      if (
        shouldRecoverAuthOnBrowserSignal({
          visible: document.visibilityState === "visible",
          online: navigator.onLine,
          initialized,
          restoreState,
          hasStoredSession,
        })
      ) {
        loadUser();
      }
    };

    window.addEventListener("online", handleRecoverySignal);
    document.addEventListener("visibilitychange", handleRecoverySignal);
    return () => {
      window.removeEventListener("online", handleRecoverySignal);
      document.removeEventListener("visibilitychange", handleRecoverySignal);
    };
  }, [initialized, restoreState, hasStoredSession, loadUser]);

  // Load servers when user is authenticated
  useEffect(() => {
    if (user) {
      loadServers();
    }
  }, [user, loadServers]);

  // Precise PWA resume: restore the last deep location on cold start from `/`.
  // Only active once the user is authenticated and there's no pending invite,
  // so it doesn't fight with login / email-verification / invite redirects.
  const canResumeLocation = !!user && user.emailVerified && !urlParams.inviteToken && !serverLoading;
  useLastLocationResume(canResumeLocation);

  // Auto-accept pending invite from localStorage (set during invite flow → login/register)
  useEffect(() => {
    if (!user || !user.emailVerified) return;
    const pendingInvite = localStorage.getItem(PENDING_INVITE_STORAGE_KEY);
    if (!pendingInvite) return;

    localStorage.removeItem(PENDING_INVITE_STORAGE_KEY);
    acceptInvite(pendingInvite)
      .then(async (result) => {
        await loadServers();
        const newServers = useServerStore.getState().servers;
        const joinedServer = newServers.find((s) => s.id === result.serverId);
        if (joinedServer) {
          useServerStore.getState().setCurrent(joinedServer);
          navigate(`/s/${joinedServer.slug}`, { replace: true });
        }
      })
      .catch((err) => {
        const response = err?.response?.data;
        if (response?.error === "agreement_required" || response?.error === "agreement_changed") {
          setInviteToken(pendingInvite);
          navigate(`/?invite=${encodeURIComponent(pendingInvite)}`, { replace: true });
          return;
        }
        console.error("Failed to auto-accept invite:", err);
      });
  }, [user, acceptInvite, loadServers, navigate]);

  // Determine page content
  let content: React.ReactNode;

  if (urlParams.authCallback === "social") {
    content = <SocialAuthCallbackPage />;
  } else if (authBootstrapView === "loading" || authBootstrapView === "restoring") {
    content = (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-brutal-cream font-display safe-top">
        <div className="text-xl font-bold">
          {authBootstrapView === "restoring" ? "Restoring session…" : "Loading…"}
        </div>
      </div>
    );
  } else if (urlParams.resetToken && !user) {
    content = (
      <ResetPasswordPage
        token={urlParams.resetToken}
        onBack={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("reset");
          window.history.replaceState({}, "", url.pathname + url.hash);
          setAuthView("login");
          window.location.reload();
        }}
      />
    );
  } else if (!user) {
    if (urlParams.inviteToken) {
      content = (
        <InviteAcceptPage
          token={urlParams.inviteToken}
          onInviteConsumed={() => setInviteToken(null)}
          onSwitchToLogin={() => {
            setInviteToken(null);
            setAuthView("login");
          }}
          onSwitchToRegister={() => {
            setInviteToken(null);
            setAuthView("register");
          }}
        />
      );
    } else if (authView === "register") {
      content = <RegisterPage onSwitchToLogin={() => setAuthView("login")} />;
    } else if (authView === "forgot-password") {
      content = <ForgotPasswordPage onBack={() => setAuthView("login")} />;
    } else {
      content = (
        <LoginPage
          onSwitchToRegister={() => setAuthView("register")}
          onForgotPassword={() => setAuthView("forgot-password")}
        />
      );
    }
  } else if (urlParams.inviteToken) {
    content = (
      <InviteAcceptPage
        token={urlParams.inviteToken}
        onInviteConsumed={() => setInviteToken(null)}
        onSwitchToLogin={() => {}}
        onSwitchToRegister={() => {}}
      />
    );
  } else if (!user.emailVerified) {
    content = <EmailVerificationPage initialToken={urlParams.verifyToken} />;
  } else if (serverLoading) {
    content = (
      <div className="flex min-h-0 flex-1 items-center justify-center bg-brutal-cream font-display safe-top">
        <div className="text-xl font-bold">Loading servers…</div>
      </div>
    );
  } else {
    // Authenticated + servers loaded → URL-based server routing
    content = (
      <Routes>
        <Route path="/login-with-slock/setup" element={<HumanLoginSetupPage />} />
        <Route path="/login-with-slock-human/setup" element={<HumanLoginSetupPage />} />
        <Route path="/login-with-slock-agent/setup" element={<AgentLoginKeySetupPage />} />
        <Route path="/login/device" element={<DeviceLoginPage />} />
        <Route path="/s/:serverSlug/*" element={<ServerResolver />} />
        <Route path="*" element={<ServerRedirect />} />
      </Routes>
    );
  }

  return (
    <>
      <NavigationDepthTracker />
      <EnvironmentBadge />
      <SlockdevDebugPanel />
      {content}
      <ImageLightbox />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/palette-audit" element={<PaletteAuditPage />} />
      <Route path="/*" element={<AppShell />} />
    </Routes>
  );
}

export default App;
