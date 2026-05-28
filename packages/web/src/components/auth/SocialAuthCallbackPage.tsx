import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { CURRENT_LEGAL_ACCEPTANCE } from "@slock-ai/shared";
import api from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { PENDING_INVITE_STORAGE_KEY, sanitizeReturnTo, takePendingInviteRedirectPath } from "../../utils/socialAuth";
import Banner from "../ui/Banner";
import type { SocialAuthProviderId } from "../../hooks/useAuthProviders";
import CenteredCardFrame from "./CenteredCardFrame";
import { AuthPageIntro } from "./AuthPageFrame";
import LegalAcceptanceCheckbox from "./LegalAcceptanceCheckbox";

function isSocialAuthProviderId(value: string | null): value is SocialAuthProviderId {
  return value === "google" || value === "github";
}

function getProviderLabel(provider: SocialAuthProviderId | null): string {
  switch (provider) {
    case "google":
      return "Google";
    case "github":
      return "GitHub";
    default:
      return "Social";
  }
}

export default function SocialAuthCallbackPage() {
  const setTokens = useAuthStore((state) => state.setTokens);
  const loadUser = useAuthStore((state) => state.loadUser);
  const [error, setError] = useState("");
  const [needsLegalAcceptance, setNeedsLegalAcceptance] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const callbackParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const provider = searchParams.get("provider");
    return {
      provider: isSocialAuthProviderId(provider) ? provider : null,
      mode: searchParams.get("mode"),
      code: searchParams.get("code"),
      returnTo: sanitizeReturnTo(searchParams.get("returnTo")),
      error: searchParams.get("error"),
    };
  }, []);

  const finishSignIn = useCallback(async (includeLegalAcceptance: boolean) => {
    setFinishing(true);
    setError("");
    try {
      if (callbackParams.error) {
        setError(callbackParams.error);
        return;
      }

      if (!callbackParams.provider) {
        setError("This sign-in provider is not supported yet.");
        return;
      }

      if (!callbackParams.code) {
        setError(`${getProviderLabel(callbackParams.provider)} did not return a sign-in code. Please try again.`);
        return;
      }

      const { data } = await api.post(`/auth/${callbackParams.provider}/complete`, {
        code: callbackParams.code,
        ...(includeLegalAcceptance
          ? {
              acceptTerms: true,
              termsVersion: CURRENT_LEGAL_ACCEPTANCE.termsVersion,
              privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
              legalAcceptanceSource: window.localStorage.getItem(PENDING_INVITE_STORAGE_KEY) ? "invite" : "oauth",
            }
          : {}),
      });

      if (data.mode === "login") {
        if (!data.accessToken || !data.refreshToken) {
          setError(`${getProviderLabel(callbackParams.provider)} sign-in did not return a session. Please try again.`);
          return;
        }
        setTokens(data.accessToken, data.refreshToken);

        const pendingInviteRedirect = takePendingInviteRedirectPath();
        if (pendingInviteRedirect) {
          // Let the normal invite page consume the token after the OAuth round-trip.
          // Loading the user here would race App's pending-invite effect with this
          // callback redirect and can drop the invite before it is accepted.
          window.location.replace(pendingInviteRedirect);
          return;
        }

        await loadUser();
        window.location.replace(sanitizeReturnTo(data.returnTo ?? callbackParams.returnTo));
        return;
      }

      if (data.mode === "link") {
        window.location.replace(sanitizeReturnTo(data.returnTo ?? callbackParams.returnTo));
        return;
      }

      setError("This sign-in callback is invalid. Please try again.");
    } catch (err: any) {
      const errorCode = err?.response?.data?.error;
      if (errorCode === "LEGAL_ACCEPTANCE_REQUIRED" || errorCode === "TERMS_CHANGED") {
        setNeedsLegalAcceptance(true);
        setError(errorCode === "TERMS_CHANGED"
          ? "The Terms of Service or Privacy Policy changed. Review and continue."
          : "");
        return;
      }
      setError(err?.response?.data?.error || err?.message || "Failed to finish sign-in");
    } finally {
      setFinishing(false);
    }
  }, [callbackParams, loadUser, setTokens]);

  useLayoutEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash}`);
  }, []);

  useEffect(() => {
    if (!needsLegalAcceptance) {
      void finishSignIn(false);
    }
  }, [finishSignIn, needsLegalAcceptance]);

  if (!needsLegalAcceptance && !error) {
    return null;
  }

  return (
    <CenteredCardFrame>
      <div className="w-full">
        <AuthPageIntro title={`${getProviderLabel(callbackParams.provider)} sign-in`} />
        {needsLegalAcceptance ? (
          <div className="space-y-4">
            {error && (
              <Banner intent="warning" className="font-bold">
                {error}
              </Banner>
            )}
            <LegalAcceptanceCheckbox
              checked={acceptedLegal}
              onChange={setAcceptedLegal}
              disabled={finishing}
            />
            <button
              type="button"
              disabled={!acceptedLegal || finishing}
              onClick={() => void finishSignIn(true)}
              className="btn-brutal w-full bg-brutal-pink px-4 py-2 text-sm disabled:opacity-50"
            >
              {finishing ? "Finishing…" : "Continue"}
            </button>
          </div>
        ) : error ? (
          <div className="space-y-3">
            <Banner intent="warning" className="font-bold">
              {error}
            </Banner>
            <button
              type="button"
              onClick={() => window.location.replace("/")}
              className="btn-brutal bg-white px-4 py-2 text-sm"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="text-sm font-bold text-black/70">Finishing sign-in…</div>
        )}
      </div>
    </CenteredCardFrame>
  );
}
