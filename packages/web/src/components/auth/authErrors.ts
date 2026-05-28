const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AUTH_COPY = {
  invalidEmail: "Invalid email format",
  passwordRequired: "Password is required",
  passwordTooShort: "Password must be at least 8 characters",
  passwordsDoNotMatch: "Passwords do not match",
  incorrectCredentials: "Incorrect email or password.",
} as const;

export function isValidEmailFormat(email: string) {
  return EMAIL_FORMAT.test(email.trim());
}

export function authServerErrorMessage(error: any, fallback: string) {
  const code = error?.response?.data?.code;
  const message = error?.response?.data?.error;
  if (code === "AUTH_INVALID_CREDENTIALS" || message === "Invalid email or password") {
    return AUTH_COPY.incorrectCredentials;
  }
  return message || fallback;
}
