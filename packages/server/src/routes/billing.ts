import { Router, type Router as RouterType, type Request, type Response } from "express";
import { hasServerCapability } from "@slock-ai/shared";
import * as billingService from "../services/billingService.js";
import { getServerRole } from "../lib/serverPermissions.js";

export const billingRouter: RouterType = Router();

// POST /api/billing/checkout — create Stripe Checkout session (owner only)
billingRouter.post("/checkout", async (req: Request, res: Response) => {
  try {
    if (!billingService.isStripeConfigured()) {
      res.status(503).json({ error: "Billing is not configured" });
      return;
    }

    // Verify owner
    const member = await getServerRole(req.serverId!, req.userId!);
    if (!hasServerCapability(member, "manageBilling")) {
      res.status(403).json({ error: "Only the server owner can manage billing" });
      return;
    }

    // Check if already subscribed
    const existing = await billingService.getSubscription(req.serverId!);
    if (existing && existing.status === "active") {
      res.status(400).json({ error: "Server already has an active subscription" });
      return;
    }

    const { successUrl, cancelUrl, targetPlan } = req.body;
    if (!successUrl || !cancelUrl) {
      res.status(400).json({ error: "successUrl and cancelUrl are required" });
      return;
    }
    if (!billingService.validateRedirectUrl(successUrl) || !billingService.validateRedirectUrl(cancelUrl)) {
      res.status(400).json({ error: "Invalid redirect URL" });
      return;
    }

    const url = await billingService.createCheckoutSession(
      req.serverId!,
      req.userId!,
      successUrl,
      cancelUrl,
    );

    res.json({ url });
  } catch (err: any) {
    console.error("[Billing] Checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// POST /api/billing/portal — create Stripe Customer Portal session (owner only)
billingRouter.post("/portal", async (req: Request, res: Response) => {
  try {
    if (!billingService.isStripeConfigured()) {
      res.status(503).json({ error: "Billing is not configured" });
      return;
    }

    const member = await getServerRole(req.serverId!, req.userId!);
    if (!hasServerCapability(member, "manageBilling")) {
      res.status(403).json({ error: "Only the server owner can manage billing" });
      return;
    }

    const { returnUrl } = req.body;
    if (!returnUrl) {
      res.status(400).json({ error: "returnUrl is required" });
      return;
    }
    if (!billingService.validateRedirectUrl(returnUrl)) {
      res.status(400).json({ error: "Invalid redirect URL" });
      return;
    }

    const url = await billingService.createPortalSession(req.serverId!, returnUrl);
    res.json({ url });
  } catch (err: any) {
    console.error("[Billing] Portal error:", err);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

// GET /api/billing/subscription — get current subscription info
billingRouter.get("/subscription", async (req: Request, res: Response) => {
  try {
    const sub = await billingService.getSubscription(req.serverId!);
    res.json({
      subscription: sub
        ? {
            status: sub.status,
            currentPeriodEnd: sub.currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          }
        : null,
      stripeConfigured: billingService.isStripeConfigured(),
    });
  } catch {
    res.status(500).json({ error: "Failed to get subscription" });
  }
});

// POST /api/webhooks/stripe — Stripe webhook (registered separately in app.ts with raw body)
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  if (!billingService.isStripeConfigured()) {
    res.status(503).json({ error: "Billing is not configured" });
    return;
  }

  const signature = req.headers["stripe-signature"] as string;
  if (!signature) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  try {
    const event = billingService.constructWebhookEvent(req.body as Buffer, signature);
    await billingService.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (err: any) {
    console.error("[Billing] Webhook error:", err.message);
    res.status(400).json({ error: "Webhook signature verification failed" });
  }
}
