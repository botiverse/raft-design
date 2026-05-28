import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Slock <noreply@slock.dev>";
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const SLOCK_INK = "#141111";
const SLOCK_YELLOW = "#FFD440";
const SLOCK_BODY_BG = "#FFFAEF";
const SLOCK_CARD_BG = "#FFFFFF";
const SLOCK_MUTED = "#6B6B6B";
const SLOCK_LINK = "#FE7DA8";
const SLOCK_LOGO_URL = `${APP_URL}/brand/slock-lockup-light.png`;

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(RESEND_API_KEY);
  }
  return resend;
}

export function escapeHtmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const client = getResend();
  if (!client) {
    console.log(`\n📧 [DEV EMAIL] To: ${to}\n   Subject: ${subject}\n   Body:\n${html}\n`);
    return;
  }

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}

// ── Email Templates ──

/** Wraps email content in a branded layout */
export function renderEmailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /*
      Match the newsletter dark-mode strategy: do not force the body/card into
      light colors, because Gmail iOS may invert text while preserving locked
      backgrounds. Only the brand bar keeps the yellow gradient so the logo
      remains legible under Gmail's natural dark transform.
    */
    body, .slock-shell { background-color: ${SLOCK_BODY_BG}; color: ${SLOCK_INK}; }
    .slock-email-bar { background-color: ${SLOCK_YELLOW}; background-image: linear-gradient(${SLOCK_YELLOW}, ${SLOCK_YELLOW}); color: ${SLOCK_INK}; }
    .slock-card, .slock-content { background-color: ${SLOCK_CARD_BG}; color: ${SLOCK_INK}; }
    .slock-content strong { color: inherit; }
    .slock-button { background-color: ${SLOCK_YELLOW}; color: ${SLOCK_INK}; }
    .slock-link { color: ${SLOCK_LINK}; }
    .slock-muted { color: ${SLOCK_MUTED}; }
  </style>
</head>
<body class="slock-shell" style="margin: 0; padding: 0; background-color: ${SLOCK_BODY_BG}; color: ${SLOCK_INK}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table class="slock-shell" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${SLOCK_BODY_BG}; color: ${SLOCK_INK}; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width: 480px; width: 100%;">
          <!-- Card -->
          <tr>
            <td class="slock-card" style="background-color: ${SLOCK_CARD_BG}; color: ${SLOCK_INK}; border: 2px solid ${SLOCK_INK}; box-shadow: 4px 4px 0 ${SLOCK_INK}; padding: 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="slock-email-bar" style="background-color: ${SLOCK_YELLOW}; background-image: linear-gradient(${SLOCK_YELLOW}, ${SLOCK_YELLOW}); color: ${SLOCK_INK}; border-bottom: 2px solid ${SLOCK_INK}; padding: 16px 24px; text-align: center;">
                    <img class="slock-brand" src="${SLOCK_LOGO_URL}" width="147" height="32" alt="Slock" style="display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none;">
                  </td>
                </tr>
                <tr>
                  <td class="slock-content" style="background-color: ${SLOCK_CARD_BG}; color: ${SLOCK_INK}; padding: 32px 24px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p class="slock-muted" style="margin: 0; color: ${SLOCK_MUTED}; font-size: 12px; line-height: 1.5;">You're receiving this because this email is tied to your Slock account.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Generates a neo-brutalism CTA button */
function emailButton(href: string, label: string): string {
  return `
<div style="margin: 24px 0;">
  <a class="slock-button" href="${href}" target="_blank" style="display: inline-block; background-color: ${SLOCK_YELLOW}; color: ${SLOCK_INK}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: none; padding: 12px 28px; border: 2px solid ${SLOCK_INK}; box-shadow: 4px 4px 0 ${SLOCK_INK}; letter-spacing: 0.5px;">${label}</a>
</div>`;
}

export function renderVerificationEmailHtml(name: string, token: string): string {
  const url = `${APP_URL}?verify=${token}`;
  return renderEmailLayout(`
    <h1 style="margin: 0 0 16px 0; color: ${SLOCK_INK}; font-size: 22px; font-weight: bold;">Verify your email</h1>
    <p style="margin: 0 0 8px 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;">Hey ${name},</p>
    <p style="margin: 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;">Click the button below to verify your email address:</p>
    ${emailButton(url, "Verify Email")}
    <p class="slock-muted" style="margin: 0 0 4px 0; color: ${SLOCK_MUTED}; font-size: 13px; line-height: 1.5;">Or copy this link: <a class="slock-link" href="${url}" style="color: ${SLOCK_LINK}; word-break: break-all;">${url}</a></p>
    <p class="slock-muted" style="margin: 0 0 4px 0; color: ${SLOCK_MUTED}; font-size: 13px;">This link expires in 24 hours.</p>
    <p class="slock-muted" style="margin: 0; color: ${SLOCK_MUTED}; font-size: 13px; line-height: 1.5;">If you didn't create a Slock account, you can safely ignore this email.</p>
  `);
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const html = renderVerificationEmailHtml(name, token);
  await sendEmail(to, "Verify your email — Slock", html);
}

export function renderPasswordResetEmailHtml(name: string, token: string): string {
  const url = `${APP_URL}?reset=${token}`;
  return renderEmailLayout(`
    <h1 style="margin: 0 0 16px 0; color: ${SLOCK_INK}; font-size: 22px; font-weight: bold;">Reset your password</h1>
    <p style="margin: 0 0 8px 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;">Hey ${name},</p>
    <p style="margin: 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;">Someone requested a password reset for your account. Click the button below to set a new password:</p>
    ${emailButton(url, "Reset Password")}
    <p class="slock-muted" style="margin: 0 0 4px 0; color: ${SLOCK_MUTED}; font-size: 13px; line-height: 1.5;">Or copy this link: <a class="slock-link" href="${url}" style="color: ${SLOCK_LINK}; word-break: break-all;">${url}</a></p>
    <p class="slock-muted" style="margin: 0; color: ${SLOCK_MUTED}; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore it.</p>
  `);
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const html = renderPasswordResetEmailHtml(name, token);
  await sendEmail(to, "Reset your password — Slock", html);
}

export function renderInviteEmailHtml(
  inviterName: string,
  serverName: string,
  token: string,
): string {
  const url = `${APP_URL}?invite=${token}`;
  return renderEmailLayout(`
    <h1 style="margin: 0 0 16px 0; color: ${SLOCK_INK}; font-size: 22px; font-weight: bold;">You're invited!</h1>
    <p style="margin: 0 0 8px 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;"><strong>${inviterName}</strong> invited you to join <strong>${serverName}</strong> on Slock.</p>
    <p style="margin: 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;">Slock is where humans and AI agents collaborate in real-time.</p>
    ${emailButton(url, "Accept Invite")}
    <p class="slock-muted" style="margin: 0 0 4px 0; color: ${SLOCK_MUTED}; font-size: 13px; line-height: 1.5;">Or copy this link: <a class="slock-link" href="${url}" style="color: ${SLOCK_LINK}; word-break: break-all;">${url}</a></p>
    <p class="slock-muted" style="margin: 0; color: ${SLOCK_MUTED}; font-size: 13px;">This invite expires in 7 days.</p>
  `);
}

export async function sendInviteEmail(
  to: string,
  inviterName: string,
  serverName: string,
  token: string,
): Promise<void> {
  const html = renderInviteEmailHtml(inviterName, serverName, token);
  await sendEmail(to, `${inviterName} invited you to ${serverName} — Slock`, html);
}

export function renderJointChannelInviteEmailHtml(input: {
  recipientName: string;
  inviterName: string;
  fromServerName: string;
  toServerName: string;
  toServerSlug: string;
  channelName: string;
  inviteId: string;
}): string {
  const url = `${APP_URL}/s/${encodeURIComponent(input.toServerSlug)}?jointInvite=${encodeURIComponent(input.inviteId)}`;
  const recipientName = escapeHtmlText(input.recipientName);
  const inviterName = escapeHtmlText(input.inviterName);
  const fromServerName = escapeHtmlText(input.fromServerName);
  const toServerName = escapeHtmlText(input.toServerName);
  const channelName = escapeHtmlText(input.channelName);
  return renderEmailLayout(`
    <h1 style="margin: 0 0 16px 0; color: ${SLOCK_INK}; font-size: 22px; font-weight: bold;">Joint channel invite</h1>
    <p style="margin: 0 0 8px 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;">Hey ${recipientName},</p>
    <p style="margin: 0 0 8px 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;"><strong>${inviterName}</strong> invited you to join <strong>#${channelName}</strong> with <strong>${fromServerName}</strong> from <strong>${toServerName}</strong>.</p>
    <p style="margin: 0; color: ${SLOCK_INK}; font-size: 15px; line-height: 1.5;">Open this link while signed in as a ${toServerName} admin to accept the invite.</p>
    ${emailButton(url, "Accept Invite")}
    <p class="slock-muted" style="margin: 0 0 4px 0; color: ${SLOCK_MUTED}; font-size: 13px; line-height: 1.5;">Or copy this link: <a class="slock-link" href="${url}" style="color: ${SLOCK_LINK}; word-break: break-all;">${url}</a></p>
    <p class="slock-muted" style="margin: 0; color: ${SLOCK_MUTED}; font-size: 13px; line-height: 1.5;">After it is accepted, admins on both servers can invite their own members and agents into the joint channel.</p>
  `);
}

export async function sendJointChannelInviteEmail(
  to: string,
  input: {
    recipientName: string;
    inviterName: string;
    fromServerName: string;
    toServerName: string;
    toServerSlug: string;
    channelName: string;
    inviteId: string;
  },
): Promise<void> {
  const html = renderJointChannelInviteEmailHtml(input);
  await sendEmail(to, `${input.fromServerName} invited you to #${input.channelName} — Slock`, html);
}
