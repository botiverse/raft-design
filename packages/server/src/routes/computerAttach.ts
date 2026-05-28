/**
 * Computer attach — task #30 PR-B 3/n (RFC v0.8 contract v3 §6/§9).
 *
 * `POST /api/computer/attach` — USER-authenticated (the caller has a
 * `slock-computer login` user session). Establishes/resumes this
 * machine's `sk_computer_*` Computer attachment for one server.
 *
 * OUT of the `routeAuthPolicy` registry BY DESIGN (contract v3 §3):
 * `/api/*` user-authed pre-attach surface, not a claimed `/internal/*`
 * principal surface. Documented intentional — mirrors `/api/agent/login`
 * and the device-code grant. Gated by the same Computer-login feature
 * flag (`SLOCK_DEVICE_LOGIN_ENABLED`) so login + attach ship together.
 *
 * This issues the Computer principal itself; it does NOT mint
 * `sk_agent_*` (that is the sk_computer-gated /internal surface). Stable,
 * zero-enumeration failures.
 */
import { Router, type Router as RouterType } from "express";
import { requireAuth } from "../middleware/auth.js";
import { attachComputer } from "../services/computerCredentialService.js";
import { isDeviceAuthSurfaceEnabled } from "../services/deviceAuthService.js";

export const computerAttachRouter: RouterType = Router();

computerAttachRouter.post("/attach", requireAuth, async (req, res) => {
  // Defense-in-depth: app.ts mounts this behind the same gate, re-check
  // so a misconfigured mount cannot expose the surface.
  if (!isDeviceAuthSurfaceEnabled()) {
    res.status(404).json({ error: "Computer attach is not enabled", code: "computer_attach_disabled" });
    return;
  }
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Authentication required", code: "auth_required" });
      return;
    }
    const body = (req.body ?? {}) as { serverSlug?: unknown; name?: unknown };
    if (typeof body.serverSlug !== "string" || body.serverSlug.length === 0) {
      res.status(400).json({ error: "serverSlug is required", code: "server_slug_required" });
      return;
    }
    let name = "slock-computer";
    if (body.name !== undefined && body.name !== null) {
      if (typeof body.name !== "string" || body.name.length === 0 || body.name.length > 200) {
        res.status(400).json({ error: "name must be a non-empty string up to 200 chars", code: "name_invalid" });
        return;
      }
      name = body.name;
    }
    const result = await attachComputer({ userId, serverSlug: body.serverSlug, name });
    if (!result.ok) {
      // Uniform 403 — non-member / missing / deleted server all collapse
      // here (no existence enumeration).
      res.status(403).json({ error: "Not authorized to attach a Computer to this server", code: result.error });
      return;
    }
    res.status(201).json({
      apiKey: result.apiKey, // raw sk_computer_* — returned exactly once
      serverMachineId: result.serverMachineId,
      serverId: result.serverId,
      serverSlug: result.serverSlug,
      resumed: result.resumed,
    });
  } catch (err) {
    console.error("api.computer.attach error:", err);
    res.status(500).json({ error: "Failed to attach Computer" });
  }
});
