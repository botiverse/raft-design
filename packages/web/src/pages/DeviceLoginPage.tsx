import { useMemo, useState, type FormEvent } from "react";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import AuthPageFrame, { AuthPageIntro } from "../components/auth/AuthPageFrame";
import Banner from "../components/ui/Banner";
import FormField from "../components/ui/FormField";

function initialUserCode(): string {
  return new URLSearchParams(window.location.search).get("user_code") || "";
}

function normalizeUserCode(value: string): string {
  return value.trim().toUpperCase();
}

export default function DeviceLoginPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const initialCode = useMemo(() => initialUserCode(), []);
  const [userCode, setUserCode] = useState(initialCode);
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");

  const normalizedCode = normalizeUserCode(userCode);

  async function approveDeviceLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalizedCode) return;

    setSubmitting(true);
    setError("");
    try {
      await api.post("/auth/device/approve", { userCode: normalizedCode, approve: true });
      setApproved(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("user_code");
      window.history.replaceState({}, "", url.pathname + url.hash);
    } catch (err: any) {
      const code = err.response?.data?.code;
      const fallback = err.response?.data?.error || "Device login could not be approved.";
      if (code === "user_code_invalid") {
        setError("That device code is invalid. Check the code in your terminal and try again.");
      } else if (code === "expired") {
        setError("That device code has expired. Re-run `slock-computer login`.");
      } else if (code === "already_resolved") {
        setError("That device login request was already used. Re-run `slock-computer login` if needed.");
      } else {
        setError(fallback);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (approved) {
    return (
      <AuthPageFrame>
        <div className="w-full">
          <AuthPageIntro
            title="Device login approved"
            description="Return to your terminal. Slock Computer will finish login automatically."
          />
          <a href="/" className="btn-brutal block w-full bg-brutal-yellow px-3 py-2 text-center text-sm">
            Back to Slock
          </a>
        </div>
      </AuthPageFrame>
    );
  }

  return (
    <AuthPageFrame>
      <div className="w-full">
        <AuthPageIntro
          title="Approve Device Login"
          description={(
            <>
              Signed in as <strong>{user?.displayName || user?.name || user?.email}</strong>.
            </>
          )}
        />

        {error ? (
          <Banner intent="warning" className="mb-4 font-bold">{error}</Banner>
        ) : null}

        <form onSubmit={approveDeviceLogin} className="space-y-4">
          <FormField label="Device code" labelStyle="plain">
            <input
              type="text"
              value={userCode}
              onChange={(event) => setUserCode(event.target.value)}
              placeholder="XXXX-XXXX"
              autoCapitalize="characters"
              autoComplete="one-time-code"
              className="w-full border-2 border-black p-2 text-center font-mono text-lg font-black tracking-widest shadow-brutal-sm focus:shadow-brutal focus:outline-none"
            />
          </FormField>

          <button
            type="submit"
            disabled={submitting || !normalizedCode}
            className="btn-brutal w-full bg-brutal-yellow px-3 py-2 text-sm disabled:opacity-50"
          >
            {submitting ? "Approving…" : "Approve Device Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full border-2 border-black bg-white p-2 text-sm font-bold shadow-brutal-sm transition-all duration-100 hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[1px] active:translate-y-[1px] active:shadow-brutal-active"
        >
          Use Another Account
        </button>
      </div>
    </AuthPageFrame>
  );
}
