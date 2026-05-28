import assert from "node:assert/strict";
import test from "node:test";
import {
  renderInviteEmailHtml,
  renderJointChannelInviteEmailHtml,
  renderPasswordResetEmailHtml,
  renderVerificationEmailHtml,
} from "./emailService.js";

const LOGO_URL = "http://localhost:5173/brand/slock-lockup-light.png";

function renderAllTemplates(): string[] {
  return [
    renderVerificationEmailHtml("Avery", "verify-token"),
    renderPasswordResetEmailHtml("Avery", "reset-token"),
    renderInviteEmailHtml("Cindy", "Slock HQ", "invite-token"),
    renderJointChannelInviteEmailHtml({
      recipientName: "Avery",
      inviterName: "Cindy",
      fromServerName: "Botiverse",
      toServerName: "Target",
      toServerSlug: "target",
      channelName: "partners",
      inviteId: "joint-invite-id",
    }),
  ];
}

test("transactional email templates place the current brand lockup in the card header", () => {
  for (const html of renderAllTemplates()) {
    assert.match(html, new RegExp(`src="${LOGO_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.match(html, /width="147" height="32" alt="Slock"/);
    assert.match(html, /alt="Slock"/);
    assert.match(html, /class="slock-email-bar"/);
    assert.match(html, /class="slock-brand"/);
    assert.match(html, /class="slock-card"[^>]*padding: 0/);
    assert.match(html, /border-bottom: 2px solid #141111; padding: 16px 24px; text-align: center/);
    assert.match(html, /<td class="slock-content" style="background-color: #FFFFFF; color: #141111; padding: 32px 24px;">/);
    assert.match(html, /display: block; margin: 0 auto;/);
    assert.match(html, /You're receiving this because this email is tied to your Slock account\./);
    assert.doesNotMatch(html, /WHERE HUMANS AND AI AGENTS COLLABORATE/);
    assert.doesNotMatch(html, />Slock<\/p>/);
    assert.ok(
      html.indexOf("class=\"slock-card\"") < html.indexOf("class=\"slock-email-bar\""),
      "brand bar should live inside the email card so header and body share one shadow",
    );
    assert.doesNotMatch(html, /class="slock-banner"/);
    assert.doesNotMatch(html, /Courier New[^>]*>Slock</);
  }
});

test("transactional email templates match the newsletter dark-mode strategy", () => {
  for (const html of renderAllTemplates()) {
    assert.doesNotMatch(html, /<meta name="color-scheme" content="light only">/);
    assert.doesNotMatch(html, /<meta name="supported-color-schemes" content="light">/);
    assert.doesNotMatch(html, /color-scheme: light/);
    assert.doesNotMatch(html, /background-image: linear-gradient\(#FFFAEF, #FFFAEF\)/);
    assert.doesNotMatch(html, /background-image: linear-gradient\(#FFFFFF, #FFFFFF\)/);
    assert.doesNotMatch(html, /background-color: #FFFFFF !important; color: #141111 !important/);
    assert.doesNotMatch(html, /<h1 class="slock-content"/);
    assert.doesNotMatch(html, /<p class="slock-content"/);
    assert.doesNotMatch(html, /<span style="color: #141111;">/);
    assert.match(html, /class="slock-email-bar" style="background-color: #FFD440; background-image: linear-gradient\(#FFD440, #FFD440\); color: #141111;/);
    assert.match(html, /class="slock-button" href="[^"]+" target="_blank" style="display: inline-block; background-color: #FFD440; color: #141111;/);
    assert.match(html, /<a class="slock-link" href="[^"]+" style="color: #FE7DA8; word-break: break-all;">/);
    assert.match(html, /class="slock-card"/);
    assert.match(html, /class="slock-content"/);
    assert.match(html, /class="slock-button"/);
  }
});

test("verification email explains what to do if the recipient did not sign up", () => {
  const html = renderVerificationEmailHtml("Avery", "verify-token");

  assert.match(html, /If you didn't create a Slock account, you can safely ignore this email\./);
});

test("joint channel invite email uses a direct accept link instead of My invitations", () => {
  const html = renderJointChannelInviteEmailHtml({
    recipientName: "Avery",
    inviterName: "Cindy",
    fromServerName: "Botiverse",
    toServerName: "Target",
    toServerSlug: "target",
    channelName: "partners",
    inviteId: "joint-invite-id",
  });

  assert.match(html, /href="http:\/\/localhost:5173\/s\/target\?jointInvite=joint-invite-id"/);
  assert.match(html, />Accept Invite</);
  assert.doesNotMatch(html, /My invitations/);
});

test("joint channel invite email escapes user and server controlled text", () => {
  const html = renderJointChannelInviteEmailHtml({
    recipientName: "<img src=x onerror=alert(1)>",
    inviterName: "<b onclick=alert(1)>Cindy</b>",
    fromServerName: "Botiverse <script>alert(1)</script>",
    toServerName: "Target & Friends",
    toServerSlug: "target",
    channelName: "partners\"><img src=x onerror=alert(1)>",
    inviteId: "joint-invite-id",
  });

  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /&lt;b onclick=alert\(1\)&gt;Cindy&lt;\/b&gt;/);
  assert.match(html, /Botiverse &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /Target &amp; Friends/);
  assert.match(html, /partners&quot;&gt;&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x onerror=alert\(1\)>/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /<b onclick=alert\(1\)>Cindy<\/b>/);
});
