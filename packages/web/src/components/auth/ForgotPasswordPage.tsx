import { useState, type FormEvent } from "react";
import { useAuthStore } from "../../store/authStore";
import { ArrowLeft } from "lucide-react";
import AuthPageFrame, { AuthPageIntro } from "./AuthPageFrame";
import Banner from "../ui/Banner";
import FormField from "../ui/FormField";

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export default function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthPageFrame>
        <div className="w-full">
          <AuthPageIntro title="Check your email">
            <p className="mt-2 text-sm text-black/60">
              If an account exists with <strong className="font-mono text-sm">{email}</strong>, we've sent a password reset link.
            </p>
          </AuthPageIntro>
          <div className="mb-6" />
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
        <AuthPageIntro
          title="Reset Password"
          description="Enter your email and we'll send you a link to reset your password."
        />

        {error && (
          <Banner intent="warning" className="mb-4 font-bold">{error}</Banner>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email" labelStyle="plain">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black p-2 text-base shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              required
            />
          </FormField>
          <button
            type="submit"
            disabled={loading}
            className="btn-brutal w-full bg-brutal-pink px-3 py-2 text-sm disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Reset Link"}
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
