import { useState, type FormEvent } from "react";
import { CURRENT_LEGAL_ACCEPTANCE } from "@slock-ai/shared";
import { useAuthStore } from "../../store/authStore";
import type { SocialAuthProviderId } from "../../hooks/useAuthProviders";
import { useAuthProviders } from "../../hooks/useAuthProviders";
import { buildSocialAuthStartUrl, getCurrentReturnTo } from "../../utils/socialAuth";
import AuthPageFrame, { AuthPageIntro } from "./AuthPageFrame";
import Banner from "../ui/Banner";
import FormField from "../ui/FormField";
import { AUTH_COPY, authServerErrorMessage, isValidEmailFormat } from "./authErrors";

interface LoginPageProps {
  onSwitchToRegister?: () => void;
  onForgotPassword: () => void;
}

const SOCIAL_BUTTON_BASE = "w-full flex items-center justify-center gap-3 border-2 border-black px-3 py-2 text-sm font-bold shadow-brutal transition-all duration-100 hover:-translate-y-[1px] hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-.9 2.4-1.9 3.2l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.4-.2-2H12Z"
      />
      <path
        fill="#34A853"
        d="M12 21.6c2.6 0 4.9-.9 6.5-2.4l-3.1-2.4c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1l-3.2 2.5c1.6 3.2 4.9 5.5 8.8 5.5Z"
      />
      <path
        fill="#4285F4"
        d="M6.4 13.6c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L3.2 7.7C2.4 9.2 2 10.5 2 12s.4 2.8 1.2 4.3l3.2-2.7Z"
      />
      <path
        fill="#FBBC05"
        d="M12 6.2c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 3.2 14.6 2.4 12 2.4c-3.9 0-7.2 2.2-8.8 5.4l3.2 2.5C7.2 7.9 9.4 6.2 12 6.2Z"
      />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0 fill-current">
      <path d="M12 .5C5.6.5.5 5.7.5 12.2c0 5.2 3.4 9.7 8.1 11.2.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.7-2.7-.3-5.5-1.4-5.5-6 0-1.3.5-2.5 1.3-3.3-.1-.3-.6-1.6.1-3.2 0 0 1.1-.4 3.5 1.3a11.8 11.8 0 0 1 6.4 0c2.4-1.7 3.5-1.3 3.5-1.3.7 1.6.2 2.9.1 3.2.8.9 1.3 2 1.3 3.3 0 4.7-2.8 5.7-5.6 6 .5.4.8 1.2.8 2.3v3.4c0 .3.2.8.8.6 4.7-1.5 8.1-5.9 8.1-11.2C23.5 5.7 18.4.5 12 .5Z" />
    </svg>
  );
}

function SocialProviderButton({
  providerId,
  label,
  onClick,
}: {
  providerId: SocialAuthProviderId;
  label: string;
  onClick: (providerId: SocialAuthProviderId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(providerId)}
      className={`${SOCIAL_BUTTON_BASE} ${providerId === "github" ? "bg-black text-white" : "bg-white text-black"}`}
    >
      {providerId === "google" ? <GoogleLogo /> : <GitHubLogo />}
      <span>Continue with {label}</span>
    </button>
  );
}

export default function LoginPage({ onSwitchToRegister, onForgotPassword }: LoginPageProps) {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const { enabledProviders } = useAuthProviders();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleSocialLogin = (providerId: SocialAuthProviderId) => {
    window.location.href = buildSocialAuthStartUrl(providerId, getCurrentReturnTo());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    if (!isValidEmailFormat(email)) {
      setFieldErrors({ email: AUTH_COPY.invalidEmail });
      return;
    }
    if (!password) {
      setFieldErrors({ password: AUTH_COPY.passwordRequired });
      return;
    }
    try {
      await login(email, password);
    } catch (err: any) {
      setError(authServerErrorMessage(err, "Login failed"));
    }
  };

  return (
    <AuthPageFrame>
      <div className="w-full">
        <AuthPageIntro title="Sign In" />

        {error && (
          <Banner intent="warning" className="mb-4 font-bold">{error}</Banner>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Email" labelStyle="plain" error={fieldErrors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
              className="w-full border-2 border-black p-2 text-base shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              required
            />
          </FormField>
          <FormField label="Password" labelStyle="plain" error={fieldErrors.password}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: undefined }));
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
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {enabledProviders.length > 0 && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="h-0.5 flex-1 bg-black" />
              <span className="text-xs font-bold uppercase tracking-widest text-black/45">or</span>
              <div className="h-0.5 flex-1 bg-black" />
            </div>
            <div className="space-y-2">
              {enabledProviders.map((provider) => (
                <SocialProviderButton
                  key={provider.id}
                  providerId={provider.id}
                  label={provider.label}
                  onClick={handleSocialLogin}
                />
              ))}
            </div>
          </>
        )}

        <p className="mt-4 text-center text-xs leading-5 text-black/60">
          By continuing, you agree to the{" "}
          <a
            href={CURRENT_LEGAL_ACCEPTANCE.termsUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-black"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href={CURRENT_LEGAL_ACCEPTANCE.privacyUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-black"
          >
            Privacy Policy
          </a>
          .
        </p>

        <p className="mt-3 text-center text-sm">
          <button
            onClick={onForgotPassword}
            className="text-black/50 underline hover:text-black"
          >
            Forgot Password?
          </button>
        </p>

        {onSwitchToRegister && (
          <p className="mt-2 text-center text-sm">
            No account?{" "}
            <button
              onClick={onSwitchToRegister}
              className="font-bold text-brutal-pink underline"
            >
              Create One
            </button>
          </p>
        )}
      </div>
    </AuthPageFrame>
  );
}
