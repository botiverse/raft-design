/**
 * Computer legacy adoption — task #39 PR-J1 (RFC v0.8 v8.2 §5.11 / §10.13).
 *
 * `POST /api/computer/adopt-legacy` — USER-authenticated. The caller proves
 * ownership of a legacy `sk_machine_*` daemon by supplying its raw key, in
 * exchange for a fresh `sk_computer_*` Computer attachment on the same
 * server. One-time per machine.
 *
 * OUT of the `routeAuthPolicy` registry BY DESIGN (same rationale as
 * `/api/computer/attach`): /api/* user-authed pre-attach, not an /internal/*
 * principal surface. Gated by `SLOCK_DEVICE_LOGIN_ENABLED` so it ships
 * together with login + attach.
 *
 * Outcomes (§10.13):
 *   201 success                          → { apiKey, computerId, machineId, serverId, resumed }
 *   401 legacy_key_invalid               → unknown / wrong-server / malformed key
 *   409 legacy_machine_key_migrated      → already migrated (canonical concurrent loser)
 *   403 not_authorized                   → user not a member of machine's server
 *   400 legacy_api_key_required          → request shape invalid
 *   404 computer_adopt_disabled          → feature flag off
 *   500 internal                         → unexpected
 *
 * Raw-key hygiene: the inbound legacy key is read once into the service
 * call and never logged, never written back, never echoed in any response.
 */
import { Router, type Router as RouterType } from "express";
import { requireAuth } from "../middleware/auth.js";
import { adoptLegacyMachine } from "../services/computerAdoptionService.js";
import { isDeviceAuthSurfaceEnabled } from "../services/deviceAuthService.js";

export const computerAdoptRouter: RouterType = Router();

computerAdoptRouter.post("/adopt-legacy", requireAuth, async (req, res) => {
  if (!isDeviceAuthSurfaceEnabled()) {
    res.status(404).json({
      error: "Computer legacy adoption is not enabled",
      code: "computer_adopt_disabled",
    });
    return;
  }
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: "Authentication required", code: "auth_required" });
      return;
    }
    const body = (req.body ?? {}) as { legacyApiKey?: unknown; name?: unknown };
    if (typeof body.legacyApiKey !== "string" || body.legacyApiKey.length === 0) {
      res.status(400).json({
        error: "legacyApiKey is required",
        code: "legacy_api_key_required",
      });
      return;
    }
    let name: string | undefined;
    if (body.name !== undefined && body.name !== null) {
      if (typeof body.name !== "string" || body.name.length === 0 || body.name.length > 200) {
        res.status(400).json({ error: "name must be a non-empty string up to 200 chars", code: "name_invalid" });
        return;
      }
      name = body.name;
    }

    const result = await adoptLegacyMachine({
      userId,
      legacyApiKey: body.legacyApiKey,
      name,
    });

    if (!result.ok) {
      switch (result.code) {
        case "legacy_key_invalid":
          res.status(401).json({ error: "Invalid legacy machine key", code: "legacy_key_invalid" });
          return;
        case "legacy_machine_key_migrated":
          res.status(409).json({
            error: "This machine has already been migrated to a Computer attachment",
            code: "legacy_machine_key_migrated",
          });
          return;
        case "not_authorized":
          res.status(403).json({
            error: "Not authorized to adopt this machine",
            code: "not_authorized",
          });
          return;
      }
    }

    res.status(201).json({
      apiKey: result.apiKey, // raw sk_computer_* — returned exactly once
      computerId: result.computerId,
      machineId: result.machineId,
      serverId: result.serverId,
      resumed: result.resumed,
    });
  } catch (err) {
    console.error("api.computer.adopt-legacy error:", err);
    res.status(500).json({ error: "Failed to adopt legacy machine" });
  }
});
