import { useState, type FormEvent } from "react";
import { useAuthStore } from "../../store/authStore";
import { ArrowLeft } from "lucide-react";
import AuthPageFrame, { AuthPageIntro } from "./AuthPageFrame";
import Banner from "../ui/Banner";
import FormField from "../ui/FormField";
import { AUTH_COPY, authServerErrorMessage } from "./authErrors";

interface ResetPasswordPageProps {
  token: string;
  onBack: () => void;
}

export default function ResetPasswordPage({ token, onBack }: ResetPasswordPageProps) {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (password.length < 8) {
      setFieldErrors({ password: AUTH_COPY.passwordTooShort });
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: AUTH_COPY.passwordsDoNotMatch });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("reset");
      window.history.replaceState({}, "", url.pathname + url.hash);
    } catch (err: any) {
      setError(authServerErrorMessage(err, "Password reset failed. The link may be expired."));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthPageFrame>
        <div className="w-full">
          <AuthPageIntro
            title="Password reset"
            description="Your password has been updated. You can now sign in."
          />
          <button
            onClick={onBack}
            className="btn-brutal flex w-full items-center justify-center gap-2 bg-brutal-pink px-3 py-2 text-sm"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        </div>
      </AuthPageFrame>
    );
  }

  return (
    <AuthPageFrame>
      <div className="w-full">
        <AuthPageIntro title="Set New Password" />

        {error && (
          <Banner intent="warning" className="mb-4 font-bold">{error}</Banner>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="New password" labelStyle="plain" error={fieldErrors.password}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              className="w-full border-2 border-black p-2 text-base shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              placeholder="Min 8 characters"
              required
            />
          </FormField>
          <FormField label="Confirm password" labelStyle="plain" error={fieldErrors.confirmPassword}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
              }}
              className="w-full border-2 border-black p-2 text-base shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              required
            />
          </FormField>
          <button
            type="submit"
            disabled={loading}
            className="btn-brutal w-full bg-brutal-pink px-3 py-2 text-sm disabled:opacity-50"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <button onClick={onBack} className="font-bold text-brutal-pink underline">
            Back to Sign In
          </button>
        </p>
      </div>
    </AuthPageFrame>
  );
}
