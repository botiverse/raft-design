import { Buffer } from "node:buffer";
import { Router, type Request, type Router as RouterType } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as oauthService from "../services/oauthService.js";

export const oauthRouter: RouterType = Router();

function parseClientCredentials(req: Parameters<typeof oauthRouter.post>[1] extends never ? never : any) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf8");
      const separator = decoded.indexOf(":");
      if (separator > 0) {
        return {
          clientId: decoded.slice(0, separator),
          clientSecret: decoded.slice(separator + 1),
        };
      }
    } catch {
      // fall through
    }
  }

  const bodyClientId = typeof req.body?.clientId === "string" ? req.body.clientId : null;
  const bodyClientSecret = typeof req.body?.clientSecret === "string" ? req.body.clientSecret : null;
  if (bodyClientId && bodyClientSecret) {
    return { clientId: bodyClientId, clientSecret: bodyClientSecret };
  }
  return null;
}

async function requireOAuthClient(req: any, res: any) {
  const creds = parseClientCredentials(req);
  if (!creds) {
    res.status(401).json({ error: "Client credentials are required" });
    return null;
  }
  const client = await oauthService.authenticateOAuthClient(creds.clientId, creds.clientSecret);
  if (!client) {
    res.status(401).json({ error: "Invalid client credentials" });
    return null;
  }
  return client;
}

oauthRouter.get("/.well-known/openid-configuration", (_req, res) => {
  const issuer = process.env.SERVER_URL || "";
  res.json({
    issuer,
    token_endpoint: `${issuer}/api/oauth/token`,
    userinfo_endpoint: `${issuer}/api/oauth/userinfo`,
    grant_types_supported: ["authorization_code", "urn:slock:grant-type:agent_request"],
    scopes_supported: ["openid", "profile", "identity"],
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
  });
});

oauthRouter.post("/requests/agent", async (req, res) => {
  const client = await requireOAuthClient(req, res);
  if (!client) return;

  try {
    const { serverSlug, agentName, scopes } = req.body ?? {};
    const result = await oauthService.requestAgentAccess({
      clientId: client.id,
      serverSlug,
      agentName,
      scopes,
    });
    res.json({
      requestId: result.request.id,
      status: result.status,
      client: {
        clientId: client.clientId,
        name: result.client.name,
        description: result.client.description,
        homepageUrl: result.client.homepageUrl,
      },
      agent: {
        id: result.agent.agentId,
        name: result.agent.agentName,
        displayName: result.agent.agentDisplayName,
        serverId: result.agent.serverId,
        serverSlug: result.agent.serverSlug,
      },
      scopes: result.request.scopes ?? [],
    });
  } catch (err: any) {
    const message = err?.message || "Failed to request agent access";
    if (message.includes("not found") || message.includes("server")) {
      res.status(404).json({ error: message });
      return;
    }
    if (message.includes("scope") || message.includes("required")) {
      res.status(400).json({ error: message });
      return;
    }
    console.error("Request agent access error:", err);
    res.status(500).json({ error: "Failed to request agent access" });
  }
});

oauthRouter.post("/authorize/human", requireAuth, async (req, res) => {
  const { clientId, serverId, returnUrl, scopes } = req.body ?? {};
  if (typeof clientId !== "string" || !clientId.trim()) {
    res.status(400).json({ error: "clientId is required" });
    return;
  }
  if (typeof serverId !== "string" || !serverId.trim()) {
    res.status(400).json({ error: "serverId is required" });
    return;
  }

  try {
    const result = await oauthService.issueHumanAuthorizationCode({
      clientKey: clientId,
      userId: req.userId!,
      serverId,
      returnUrl,
      scopes,
    });

    res.json({
      code: result.code,
      client: {
        clientId: result.client.clientId,
        name: result.client.name,
        description: result.client.description,
        homepageUrl: result.client.homepageUrl,
      },
      server: result.server,
      scopes: result.scopes,
      returnUrl: result.returnUrl,
    });
  } catch (err: any) {
    const message = err?.message || "Failed to issue Login with Slock code";
    if (message.includes("not found") || message.includes("member")) {
      res.status(404).json({ error: message });
      return;
    }
    if (message.includes("returnUrl") || message.includes("scope") || message.includes("required")) {
      res.status(400).json({ error: message });
      return;
    }
    console.error("Human authorization code error:", err);
    res.status(500).json({ error: "Failed to issue Login with Slock code" });
  }
});

oauthRouter.post("/token", async (req, res) => {
  const client = await requireOAuthClient(req, res);
  if (!client) return;

  const grantType = typeof req.body?.grantType === "string" ? req.body.grantType : typeof req.body?.grant_type === "string" ? req.body.grant_type : "";
  if (grantType !== "authorization_code" && grantType !== "urn:slock:grant-type:agent_request") {
    res.status(400).json({ error: "Unsupported grant type" });
    return;
  }

  const requestId = grantType === "authorization_code"
    ? typeof req.body?.code === "string" ? req.body.code : ""
    : typeof req.body?.requestId === "string" ? req.body.requestId : typeof req.body?.request_id === "string" ? req.body.request_id : "";
  if (!requestId) {
    res.status(400).json({ error: grantType === "authorization_code" ? "code is required" : "requestId is required" });
    return;
  }

  try {
    const exchanged = await oauthService.exchangeAccessRequest({
      clientId: client.id,
      requestId,
    });
    res.json({
      access_token: exchanged.accessToken,
      token_type: "Bearer",
      expires_in: Math.max(1, Math.floor((exchanged.expiresAt.getTime() - Date.now()) / 1000)),
      scope: exchanged.scopes.join(" "),
    });
  } catch (err: any) {
    const message = err?.message || "Failed to exchange access request";
    if (message === "authorization_pending") {
      res.status(400).json({ error: "authorization_pending" });
      return;
    }
    if (message === "access_denied") {
      res.status(403).json({ error: "access_denied" });
      return;
    }
    if (message === "request_already_consumed") {
      res.status(409).json({ error: message });
      return;
    }
    if (message.includes("not found")) {
      res.status(404).json({ error: message });
      return;
    }
    console.error("Token exchange error:", err);
    res.status(500).json({ error: "Failed to issue access token" });
  }
});

oauthRouter.get("/userinfo", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  try {
    const token = await oauthService.getIdentityByAccessToken(authHeader.slice(7));
    if (!token) {
      res.status(401).json({ error: "Invalid or expired access token" });
      return;
    }

    const common = {
      scope: (token.scopes ?? []).join(" "),
      client_id: token.clientKey,
      client_name: token.clientName,
      server_id: token.serverId,
      server_slug: token.serverSlug,
    };

    if (token.principalType === "human") {
      const picture = userinfoPictureUrl(token.humanAvatarUrl, req);
      res.json({
        ...common,
        sub: token.humanId,
        type: "human",
        server_role: token.humanRole,
        preferred_username: token.humanName,
        name: token.humanDisplayName || token.humanName,
        avatar_url: token.humanAvatarUrl,
        picture,
        description: token.humanDescription,
      });
      return;
    }

    const picture = userinfoPictureUrl(token.agentAvatarUrl, req);
    res.json({
      ...common,
      sub: token.agentId,
      type: "agent",
      preferred_username: token.agentName,
      name: token.agentDisplayName || token.agentName,
      avatar_url: token.agentAvatarUrl,
      picture,
      description: token.agentDescription,
    });
  } catch (err) {
    console.error("OAuth userinfo error:", err);
    res.status(500).json({ error: "Failed to load userinfo" });
  }
});

function userinfoPictureUrl(avatarUrl: string | null, req: Request): string | null {
  if (!avatarUrl) return null;
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  if (!avatarUrl.startsWith("/")) return null;

  const origin = process.env.SERVER_URL?.trim() || `${req.protocol}://${req.get("host")}`;
  return new URL(avatarUrl, origin).toString();
}
