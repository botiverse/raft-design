import { Router, type Router as RouterType } from "express";
import { eq } from "drizzle-orm";
import { userHasServerCapability } from "../lib/serverPermissions.js";
import { getDb } from "../db/index.js";
import { agents } from "../db/schema.js";
import * as oauthService from "../services/oauthService.js";

export const integrationRouter: RouterType = Router();

integrationRouter.get("/overview", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can manage integrations" });
      return;
    }
    const items = await oauthService.getServerIntegrationsOverview(req.serverId!);
    res.json(items);
  } catch (err) {
    console.error("List integrations overview error:", err);
    res.status(500).json({ error: "Failed to load integrations overview" });
  }
});

integrationRouter.get("/clients", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can manage integrations" });
      return;
    }
    const clients = await oauthService.listOAuthClients(req.serverId!);
    res.json(clients);
  } catch (err) {
    console.error("List OAuth clients error:", err);
    res.status(500).json({ error: "Failed to list OAuth clients" });
  }
});

integrationRouter.post("/clients", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can manage integrations" });
      return;
    }
    const { name, description, homepageUrl, returnUrl, clientId } = req.body ?? {};
    const created = await oauthService.createOAuthClient({
      serverId: req.serverId!,
      createdByUserId: req.userId!,
      name,
      description,
      homepageUrl,
      returnUrl,
      clientId,
    });
    res.json(created);
  } catch (err: any) {
    const message = err?.message || "Failed to create OAuth client";
    if (message.includes("required") || message.includes("clientId")) {
      res.status(400).json({ error: message });
      return;
    }
    if (message.includes("duplicate key value")) {
      res.status(409).json({ error: "Client ID is already taken" });
      return;
    }
    console.error("Create OAuth client error:", err);
    res.status(500).json({ error: "Failed to create OAuth client" });
  }
});

integrationRouter.patch("/clients/:clientId", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can manage integrations" });
      return;
    }
    const { name, description, homepageUrl, returnUrl } = req.body ?? {};
    const updated = await oauthService.updateOAuthClient({
      serverId: req.serverId!,
      clientId: req.params.clientId,
      name,
      description,
      homepageUrl,
      returnUrl,
    });
    if (!updated) {
      res.status(404).json({ error: "OAuth client not found" });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    const message = err?.message || "Failed to update OAuth client";
    if (message.includes("required")) {
      res.status(400).json({ error: message });
      return;
    }
    console.error("Update OAuth client error:", err);
    res.status(500).json({ error: "Failed to update OAuth client" });
  }
});

integrationRouter.post("/requests/:requestId/approve", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can manage integrations" });
      return;
    }
    const remember = !!req.body?.remember;
    const result = await oauthService.approveAccessRequest({
      requestId: req.params.requestId,
      resolvedByUserId: req.userId!,
      remember,
    });
    res.json(result);
  } catch (err: any) {
    const message = err?.message || "Failed to approve request";
    if (message.includes("not found")) {
      res.status(404).json({ error: message });
      return;
    }
    console.error("Approve integration request error:", err);
    res.status(500).json({ error: "Failed to approve integration request" });
  }
});

integrationRouter.post("/requests/:requestId/deny", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can manage integrations" });
      return;
    }
    const updated = await oauthService.denyAccessRequest({
      requestId: req.params.requestId,
      resolvedByUserId: req.userId!,
    });
    if (!updated) {
      res.status(404).json({ error: "Access request not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Deny integration request error:", err);
    res.status(500).json({ error: "Failed to deny integration request" });
  }
});

integrationRouter.post("/grants/:grantId/revoke", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageServer")) {
      res.status(403).json({ error: "Only server owners and admins can manage integrations" });
      return;
    }
    const updated = await oauthService.revokeGrant({
      grantId: req.params.grantId,
      revokedByUserId: req.userId!,
    });
    if (!updated) {
      res.status(404).json({ error: "Grant not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error("Revoke integration grant error:", err);
    res.status(500).json({ error: "Failed to revoke integration grant" });
  }
});

integrationRouter.get("/agents/:agentId", async (req, res) => {
  try {
    if (!await userHasServerCapability(req.serverId!, req.userId!, "manageAgents")) {
      res.status(403).json({ error: "Only server owners and admins can view agent integrations" });
      return;
    }

    const db = getDb();
    const [agent] = await db.select({ id: agents.id, serverId: agents.serverId }).from(agents).where(eq(agents.id, req.params.agentId)).limit(1);
    if (!agent || agent.serverId !== req.serverId) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    const items = await oauthService.getAgentIntegrationsOverview(req.params.agentId);
    res.json(items);
  } catch (err) {
    console.error("List agent integrations error:", err);
    res.status(500).json({ error: "Failed to load agent integrations" });
  }
});
