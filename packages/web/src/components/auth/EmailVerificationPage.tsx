import { useState, useEffect, type FormEvent } from "react";
import { useAuthStore } from "../../store/authStore";
import { RefreshCw, LogOut, KeyRound } from "lucide-react";
import Banner from "../ui/Banner";
import CenteredCardFrame from "./CenteredCardFrame";
import { AuthPageIntro } from "./AuthPageFrame";

interface EmailVerificationPageProps {
  initialToken?: string | null;
}

export default function EmailVerificationPage({ initialToken }: EmailVerificationPageProps) {
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  // Auto-verify if token provided via URL
  useEffect(() => {
    if (initialToken) {
      handleVerify(initialToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const handleVerify = async (token: string) => {
    setVerifying(true);
    setError("");
    try {
      await verifyEmail(token);
      setVerified(true);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("verify");
      window.history.replaceState({}, "", url.pathname + url.hash);
    } catch (err: any) {
      setError(err.response?.data?.error || "Verification failed. The link may be expired.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setResendSuccess(false);
    try {
      await resendVerification();
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      handleVerify(manualToken.trim());
    }
  };

  if (verified) {
    return (
      <CenteredCardFrame>
        <div className="w-full">
          <AuthPageIntro
            title="Email verified"
            description="Your email has been verified. You can now use Slock."
          />
          <button
            onClick={() => window.location.reload()}
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
        <AuthPageIntro title="Check your email">
          <p className="mt-2 text-sm text-black/60">
            We sent a verification link to
          </p>
          <p className="mt-1 font-mono text-sm font-bold">{user?.email}</p>
        </AuthPageIntro>

        {error && (
          <Banner intent="warning" className="mb-4 font-bold">
            {error}
          </Banner>
        )}

        {resendSuccess && (
          <div className="mb-4 border-2 border-black bg-brutal-lime/30 p-3 text-sm font-bold">
            Verification email resent! Check your inbox.
          </div>
        )}

        {verifying && (
          <div className="mb-4 text-center text-sm text-black/60">
            Verifying...
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleResend}
            disabled={resending}
            className="btn-brutal flex w-full items-center justify-center gap-2 bg-brutal-pink px-3 py-2 text-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
            {resending ? "Sending…" : "Resend Verification Email"}
          </button>

          {/* Manual token entry */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-sm text-black/50 underline hover:text-black"
            >
              <KeyRound size={12} className="inline mr-1" />
              {showManualInput ? "Hide Manual Entry" : "Enter Code Manually"}
            </button>
          </div>

          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste verification token"
                className="flex-1 border-2 border-black p-2 text-base shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              />
              <button
                type="submit"
                disabled={verifying || !manualToken.trim()}
                className="btn-brutal border-2 border-black bg-brutal-lime px-3 py-1.5 text-sm font-bold disabled:opacity-50"
              >
                {verifying ? "…" : "Verify"}
              </button>
            </form>
          )}

          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 border-2 border-black bg-white p-2 font-bold text-sm shadow-brutal-sm transition-all duration-100 hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-active"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </CenteredCardFrame>
  );
}
