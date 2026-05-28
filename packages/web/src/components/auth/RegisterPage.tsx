import { useState, type FormEvent } from "react";
import { useAuthStore } from "../../store/authStore";
import { CURRENT_LEGAL_ACCEPTANCE, validateName } from "@slock-ai/shared";
import AuthPageFrame, { AuthPageIntro } from "./AuthPageFrame";
import Banner from "../ui/Banner";
import LegalAcceptanceCheckbox from "./LegalAcceptanceCheckbox";
import { PENDING_INVITE_STORAGE_KEY } from "../../utils/socialAuth";
import FormField from "../ui/FormField";
import { AUTH_COPY, authServerErrorMessage, isValidEmailFormat } from "./authErrors";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export default function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const nameError = validateName(name, "Name", 5);
    if (nameError) {
      setFieldErrors({ name: nameError });
      return;
    }
    if (!isValidEmailFormat(email)) {
      setFieldErrors({ email: AUTH_COPY.invalidEmail });
      return;
    }
    if (password.length < 8) {
      setFieldErrors({ password: AUTH_COPY.passwordTooShort });
      return;
    }
    if (!acceptedLegal) {
      setError("You must agree to the Terms of Service and acknowledge the Privacy Policy to create an account.");
      return;
    }

    try {
      await register(email, password, name.trim(), {
        acceptTerms: acceptedLegal,
        termsVersion: CURRENT_LEGAL_ACCEPTANCE.termsVersion,
        privacyVersion: CURRENT_LEGAL_ACCEPTANCE.privacyVersion,
        legalAcceptanceSource: window.localStorage.getItem(PENDING_INVITE_STORAGE_KEY) ? "invite" : "signup",
      });
    } catch (err: any) {
      setError(authServerErrorMessage(err, "Registration failed"));
    }
  };

  return (
    <AuthPageFrame>
      <div className="w-full">
        <AuthPageIntro title="Create Account" />

        {error && (
          <Banner intent="warning" className="mb-4 font-bold">{error}</Banner>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Name" labelStyle="plain" error={fieldErrors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              className="w-full border-2 border-black p-2 text-base shadow-brutal-sm focus:shadow-brutal focus:outline-none"
              placeholder="Letters, numbers, hyphens, underscores"
              required
            />
          </FormField>
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
              placeholder="Min 8 characters"
              required
            />
          </FormField>
          <LegalAcceptanceCheckbox
            checked={acceptedLegal}
            onChange={setAcceptedLegal}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !acceptedLegal}
            className="btn-brutal w-full bg-brutal-pink px-3 py-2 text-sm disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="font-bold text-brutal-pink underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </AuthPageFrame>
  );
}
