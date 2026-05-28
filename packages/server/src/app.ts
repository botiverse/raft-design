import express, { type Express, type RequestHandler } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { channelRouter } from "./routes/channels.js";
import { messageRouter } from "./routes/messages.js";
import { agentRouter, agentAvatarRouter } from "./routes/agents.js";
import { agentCredentialsHandler } from "./routes/agentCredentials.js";
import { listManageableAgentsHandler } from "./routes/agentDiscovery.js";
import { internalRouter } from "./routes/internal.js";
import { authRouter } from "./routes/auth.js";
import { agentLoginRouter } from "./routes/agentLogin.js";
import { deviceAuthRouter } from "./routes/deviceAuth.js";
import { computerAttachRouter } from "./routes/computerAttach.js";
import { computerAdoptRouter } from "./routes/computerAdopt.js";
import { isDeviceAuthSurfaceEnabled } from "./services/deviceAuthService.js";
import { internalComputerRouter } from "./routes/internalComputer.js";
import { internalAgentApiRouter } from "./routes/internalAgentApi.js";
import { serverRouter } from "./routes/servers.js";
import { billingRouter, stripeWebhookHandler } from "./routes/billing.js";
import { resendNewsletterWebhookHandler } from "./routes/newsletterWebhooks.js";
import { taskRouter } from "./routes/tasks.js";
import { reminderRouter } from "./routes/reminders.js";
import { attachmentRouter, attachmentPublicRouter } from "./routes/attachments.js";
import { pushRouter } from "./routes/push.js";
import { announcementRouter } from "./routes/announcements.js";
import { integrationRouter } from "./routes/integrations.js";
import { actionsRouter } from "./routes/actions.js";
import { productEventsRouter } from "./routes/productEvents.js";
import { oauthRouter } from "./routes/oauth.js";
import { messageTranslationBatchHandler } from "./routes/messageTranslations.js";
import { otlpRelayHandler } from "./routes/otlpRelay.js";
import { requireAuth, requireVerified, requireServer, requireMachineAuth, requireFlexAuth, requireServerForFlex } from "./middleware/auth.js";
import { authFromRegistry } from "./middleware/authFromRegistry.js";
import { perfAttributionMiddleware } from "./middleware/perfAttribution.js";
import { requestObservabilityMiddleware } from "./middleware/requestObservability.js";
import { slockdevActivityMiddleware } from "./middleware/slockdevActivity.js";
import { AGENT_BOOTSTRAP_SURFACE_ENABLED_ENV, isAgentBootstrapSurfaceEnabled } from "./services/agentCredentialService.js";

/** Parse CORS_ORIGIN env into a value suitable for the cors middleware. */
function parseCorsOrigin(): string | string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return "http://localhost:5173";
  if (raw.includes(",")) return raw.split(",").map((s) => s.trim());
  return raw;
}

// Advisory contract marker for the new v0.8 internal surfaces. It lets
// daemon/CLI clients and operator diagnostics tell "new surface exists but is
// disabled/version-mismatched" apart from legacy `/internal/*` behavior.
const INTERNAL_EXPERIMENTAL_API_VERSION = "1";

function experimentalInternalSurfaceContract(surface: "computer" | "agent-api"): RequestHandler {
  return (req, res, next) => {
    res.setHeader("Sec-Slock-Api-Version", INTERNAL_EXPERIMENTAL_API_VERSION);
    if ((process.env.SLOCK_EXPERIMENTAL_SURFACES_DISABLED ?? "").trim().toLowerCase() === "true") {
      console.warn("[experimental-surface-disabled]", {
        surface,
        path: req.originalUrl,
      });
      res.status(503).json({
        error: "Experimental internal surface is disabled",
        code: "experimental_surface_disabled",
        retry_after: null,
      });
      return;
    }
    next();
  };
}

export function createApp(): Express {
  const app = express();
  const rateLimitValidate = process.env.NODE_ENV === "test" ? false : undefined;

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // Configure Helmet with CSP that allows CDN images (for thumbnails served via CDN_BASE_URL)
  const imgSrc = ["'self'"];
  if (process.env.CDN_BASE_URL) {
    try {
      const cdnHost = new URL(process.env.CDN_BASE_URL).origin;
      imgSrc.push(cdnHost);
    } catch {
      // Invalid URL — skip adding to CSP
    }
  }
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": imgSrc,
      },
    },
  }));

  const corsOrigin = parseCorsOrigin();
  app.use(cors({ origin: corsOrigin, credentials: true }));

  // Stripe webhook must be registered BEFORE express.json() to preserve raw body for signature verification
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);
  // Resend webhook must also use the raw body because Svix signatures are payload-sensitive.
  app.post("/api/webhooks/resend", express.raw({ type: "application/json" }), resendNewsletterWebhookHandler);

  // Cloudflare Workers cannot reach Fly private networking directly. This
  // endpoint is a narrow authenticated OTLP pass-through to internal Telescope.
  app.post(
    "/internal/trace-ingest/otlp/v1/traces",
    express.raw({ type: "*/*", limit: process.env.OTLP_RELAY_MAX_BYTES ?? "10mb" }),
    (req, res, next) => {
      otlpRelayHandler(req, res).catch(next);
    },
  );

  app.use(express.json());
  app.use(slockdevActivityMiddleware);
  app.use(requestObservabilityMiddleware);
  app.use(perfAttributionMiddleware);

  // Rate limiter for auth endpoints (general)
  const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later" },
    // Invite join flow can legitimately burst from one IP (e.g. admin onboarding multiple users).
    // Keep auth brute-force protection strict for login/register/etc, but exclude invite routes.
    skip: (req) => req.path === "/invite-info" || req.path === "/accept-invite",
  });

  // Separate (more lenient) limiter for join-link invite flow endpoints.
  const inviteFlowLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many invite requests, please try again in a minute" },
  });

  // Stricter rate limiter for forgot-password (5 requests/hour/IP)
  const forgotPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many password reset requests. Please try again later." },
  });

  // Auth routes (rate limited, no auth required)
  // Apply stricter limiter specifically to forgot-password before the general auth limiter
  app.use("/api/auth/forgot-password", forgotPasswordLimiter);
  app.use("/api/auth/invite-info", inviteFlowLimiter);
  app.use("/api/auth/accept-invite", inviteFlowLimiter);
  // task #30 PR-A2 (RFC v0.8 contract v3 §3): shared device-code login
  // grant. Mounted BEFORE the generic `/api/auth` router so the device
  // sub-paths take precedence. OUT of `routeAuthPolicy` BY DESIGN — `/api/*`
  // pre-credential surface, not a claimed `/internal/*` principal surface
  // (documented intentional, mirrors `/api/agent/login`). Default-on after
  // PR-G; operators set `SLOCK_DEVICE_LOGIN_ENABLED=false` as emergency
  // kill switch only.
  if (isDeviceAuthSurfaceEnabled()) {
    app.use("/api/auth/device", authLimiter, deviceAuthRouter);
    // task #30 PR-B 3/n: user-authed Computer attach. Same Computer-login
    // feature gate (login + attach ship together). OUT of routeAuthPolicy
    // BY DESIGN (/api/* user-authed pre-attach, not /internal/* principal
    // surface; documented intentional, mirrors /api/agent/login).
    app.use("/api/computer", authLimiter, computerAttachRouter);
    // task #39 PR-J1: legacy machine → Computer adoption (RFC v8.2 §5.11).
    // Same Computer-login feature gate — adoption is the migration path FROM
    // legacy sk_machine_* INTO the sk_computer_* control plane this gate
    // governs, so it lives behind the same flag.
    app.use("/api/computer", authLimiter, computerAdoptRouter);
  } else {
    console.warn("[device-login-disabled] SLOCK_DEVICE_LOGIN_ENABLED is explicitly off — Computer attach + device authorize are disabled");
  }
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/oauth", authLimiter, oauthRouter);
  // `docs/server/slock-credential-rfc.zh.html#section-credential-model`:
  // self-hosted bootstrap primitive. The code path stays testable, but the
  // external login/onboarding surface is not published in this PR. Production
  // must explicitly opt in before `/api/agent/login` is mounted; managed-runner
  // launch uses `/internal/computer/*` instead.
  if (isAgentBootstrapSurfaceEnabled()) {
    console.warn(`[self-hosted-runner-bootstrap-enabled] ${AGENT_BOOTSTRAP_SURFACE_ENABLED_ENV}=true`);
    app.use("/api/agent", authLimiter, agentLoginRouter);
  }
  app.use("/api/push", pushRouter);
  app.use("/api/announcements", announcementRouter);

  // Server routes (auth + verified required, no server context needed)
  app.use("/api/servers", requireAuth, requireVerified, serverRouter);

  // Rate limiter for billing mutation endpoints (checkout/portal create Stripe sessions)
  const billingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many billing requests, please try again later" },
    skip: (req) => req.method === "GET", // Allow reads (subscription info)
  });

  // Rate limiter for file uploads (10 uploads/minute/IP to prevent abuse).
  // This covers both human `/api/attachments/upload` and agent `/internal/.../upload`.
  const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    validate: rateLimitValidate,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many uploads, please try again later" },
    skip: (req) => req.method === "GET", // Allow reads (serving files)
  });

  // Attachment serving — requires auth + rate limited
  const downloadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    validate: rateLimitValidate,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many download requests, please try again later" },
    keyGenerator: (req) => req.userId || req.machineId || req.ip || "unknown",
  });
  app.use("/api/attachments", requireFlexAuth, requireServerForFlex, downloadLimiter, attachmentPublicRouter);
  // Intentionally unauthenticated static-asset fallback for local dev.
  // Production serves avatars directly from the CDN (`CDN_BASE_URL`) which
  // is also public. URLs are capability-based (`/avatars/:serverId/:hash.webp`
  // where `:hash` is 32 hex chars of sha256(content)) — membership is the
  // only thing that reveals the URL in the first place. This is a documented
  // exception to the X-Server-Id contract added in #proj-security task #10.
  app.use("/api/avatars", agentAvatarRouter);

  // Rate limiter for message sending (60 messages/minute/user)
  const messageLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    validate: rateLimitValidate,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many messages, please slow down" },
    skip: (req) => req.method === "GET",
    keyGenerator: (req) => req.userId || req.ip || "unknown",
  });

  const translationLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    validate: rateLimitValidate,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many translation requests, please slow down" },
    keyGenerator: (req) => req.userId || req.ip || "unknown",
  });

  // Resource routes (auth + verified + server required)
  app.post(/^\/api\/message-translations:batch$/, requireAuth, requireVerified, requireServer, translationLimiter, messageTranslationBatchHandler);
  app.use("/api/channels", requireAuth, requireVerified, requireServer, channelRouter);
  app.use("/api/messages", requireAuth, requireVerified, requireServer, messageLimiter, messageRouter);
  // Mount the agent CLI resource-explicit surfaces BEFORE the generic
  // agentRouter so Express's first-match wins and we skip `requireServer`.
  // These routes derive server context from the subject (agent row /
  // user's memberships); requiring `X-Server-Id` would force CLI callers
  // like `slock agent login` / `slock agent list` to know a serverId
  // out-of-band, which defeats the agent-facing UX. §3 invariant: CLI
  // resource-explicit surfaces never use the web active-server header.
  // See `#proj-runtime:3d515727` (XX msg=dc316ca3 / Hao msg=b50c93bd).
  app.get("/api/agents/manageable", requireAuth, requireVerified, listManageableAgentsHandler);
  app.post("/api/agents/:id/credentials", requireAuth, requireVerified, agentCredentialsHandler);
  app.use("/api/agents", requireAuth, requireVerified, requireServer, agentRouter);
  app.use("/api/billing", requireAuth, requireVerified, requireServer, billingLimiter, billingRouter);
  app.use("/api/tasks", requireAuth, requireVerified, requireServer, taskRouter);
  app.use("/api/reminders", requireAuth, requireVerified, requireServer, reminderRouter);
  app.use("/api/attachments", requireAuth, requireVerified, requireServer, uploadLimiter, attachmentRouter);
  app.use("/api/integrations", requireAuth, requireVerified, requireServer, integrationRouter);
  app.use("/api/actions", requireAuth, requireVerified, requireServer, actionsRouter);
  app.use("/api/product-events", requireAuth, requireVerified, requireServer, productEventsRouter);

  // Apply the same upload concurrency guard to the agent upload surface before
  // the general internal router. Uploads can now be up to 50MB and still use the
  // server-proxy path, so the agent path must not bypass the upload limiter.
  app.use("/internal/agent/:id/upload", requireMachineAuth, uploadLimiter);

  // `docs/server/slock-credential-rfc.zh.html#section-api-auth-surface` —
  // `/internal/computer/*` sk_computer_* surface. Mounted BEFORE the generic
  // `/internal` machine-auth route so the more specific prefix wins.
  // SLOCK_EXPERIMENTAL_SURFACES_DISABLED is a hard-disable switch for these
  // v0.8 surfaces. New daemon builds must fail managed-runner startup loudly
  // when this surface is disabled; rollback the daemon binary for release
  // safety instead of falling back in-process to `/internal/agent/:id/*`.
  // Cross-principal rejection (sk_machine_* / sk_agent_* keys presented here)
  // is handled inside `requireComputerAuth` via the `isComputerApiKey` shape
  // check.
  app.use("/internal/computer", experimentalInternalSurfaceContract("computer"), authFromRegistry(), internalComputerRouter);

  // `docs/server/slock-credential-rfc.zh.html#section-api-auth-surface` —
  // `/internal/agent-api/*` sk_agent_* surface. Mounted BEFORE the generic
  // `/internal` machine-auth route so the more specific prefix wins. The
  // bound agentId is read from the credential row — there is NO `:id` path
  // param. Cross-principal rejection (sk_machine_* / sk_computer_* / JWT) is
  // handled inside `requireAgentCredentialAuth`.
  app.use("/internal/agent-api", experimentalInternalSurfaceContract("agent-api"), authFromRegistry(), internalAgentApiRouter);

  // Internal routes (machine auth)
  app.use("/internal", requireMachineAuth, internalRouter);

  // Health check — verifies DB connectivity so Fly.io can detect stale connections
  app.get("/health", async (_req, res) => {
    try {
      const { pingDatabase } = await import("./db/index.js");
      await pingDatabase();
      res.json({ status: "ok" });
    } catch (err) {
      console.error("Health check DB query failed:", (err as Error).message);
      res.status(503).json({ status: "error", detail: "database unreachable" });
    }
  });

  return app;
}
