import Stripe from "stripe";
import { and, eq, lt, isNull } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { subscriptions, servers, webhookEvents } from "../db/schema.js";
import { randomUUID } from "node:crypto";
import type { Server as SocketIOServer } from "socket.io";

// ── Socket.io reference for broadcasting plan changes ──

let _io: SocketIOServer | null = null;

export function setIO(io: SocketIOServer) {
  _io = io;
}

function broadcastPlanChange(serverId: string, plan: string) {
  if (_io) {
    _io.to(`server:${serverId}`).emit("server:plan-updated", { serverId, plan });
  }
}

// ── Stripe Client (lazy init — only created when env vars are present) ──

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/** Returns true if Stripe is configured (STRIPE_SECRET_KEY is set). */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

// ── Redirect URL Validation ──

/** Get allowed origins from CORS_ORIGIN env (for redirect URL validation). */
function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return ["http://localhost:5173"];
  return raw.split(",").map((s) => s.trim());
}

/** Validate that a redirect URL's origin is in our CORS allowlist. */
export function validateRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return getAllowedOrigins().includes(parsed.origin);
  } catch {
    return false;
  }
}

// ── Checkout ──

// Checkout is currently disabled — no paid plans configured.
// Re-enable when new Stripe price IDs are set up.
export async function createCheckoutSession(
  _serverId: string,
  _userId: string,
  _successUrl: string,
  _cancelUrl: string,
): Promise<string> {
  throw new Error("Paid plans are not currently available");
}

// ── Customer Portal ──

export async function createPortalSession(
  serverId: string,
  returnUrl: string,
): Promise<string> {
  const stripe = getStripe();
  const sub = await getSubscription(serverId);
  if (!sub) throw new Error("No active subscription");

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

// ── Subscription CRUD ──

export async function getSubscription(serverId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.serverId, serverId));
  if (!row) return null;

  // If subscription looks active but period has expired, verify with Stripe
  if (
    row.status === "active" &&
    row.currentPeriodEnd &&
    new Date(row.currentPeriodEnd) < new Date()
  ) {
    await refreshSubscriptionStatus(row);
    // Re-fetch after refresh
    const [updated] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.serverId, serverId));
    return updated ?? null;
  }

  return row;
}

/**
 * Verify subscription status with Stripe and update local record.
 * Called when currentPeriodEnd has passed but status is still "active"
 * (indicates a missed webhook).
 */
async function refreshSubscriptionStatus(sub: typeof subscriptions.$inferSelect): Promise<void> {
  if (!isStripeConfigured()) return;

  try {
    const stripe = getStripe();
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const db = getDb();

    if (stripeSub.status === "canceled" || stripeSub.status === "unpaid" || stripeSub.status === "incomplete_expired") {
      // Subscription is dead — downgrade
      await db.update(servers)
        .set({ plan: "free", planDowngradedAt: new Date(), updatedAt: new Date() })
        .where(eq(servers.id, sub.serverId));
      await db.delete(subscriptions).where(eq(subscriptions.id, sub.id));
      console.log(`[Billing] Server ${sub.serverId} downgraded to free (stale subscription detected)`);
      broadcastPlanChange(sub.serverId, "free");
    } else {
      // Still alive — sync latest state from Stripe
      const periodEnd = getPeriodEnd(stripeSub);
      await db.update(subscriptions)
        .set({
          status: mapStripeStatus(stripeSub.status),
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, sub.id));
    }
  } catch (err) {
    console.error(`[Billing] Failed to refresh subscription for server ${sub.serverId}:`, err);
  }
}

// ── [UNUSED] Extra-Agent Quantity Sync ──
// All plans now use hard maxAgents caps. Re-enable when per-agent billing returns.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _unusedSyncAgentQuantity() { /* see git history */ }

// ── Helpers ──

const STRIPE_STATUS_MAP: Record<string, "active" | "past_due" | "canceled" | "incomplete"> = {
  active: "active",
  past_due: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "canceled",
  trialing: "active",
  unpaid: "past_due",
};

function mapStripeStatus(status: string): "active" | "past_due" | "canceled" | "incomplete" {
  return STRIPE_STATUS_MAP[status] || "incomplete";
}

/** Extract current_period_end from a Stripe subscription (lives on items in v20+). */
function getPeriodEnd(stripeSub: Stripe.Subscription): Date | null {
  const firstItem = stripeSub.items.data[0];
  if (firstItem?.current_period_end) {
    return new Date(firstItem.current_period_end * 1000);
  }
  return null;
}

/** Extract subscription ID from an Invoice (parent.subscription_details in v20+). */
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails) return null;
  const sub = subDetails.subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return sub.id;
  return null;
}

// ── Cancel subscription on server deletion ──

/**
 * Cancel a server's Stripe subscription (if any) when the server is deleted.
 * This immediately cancels on Stripe and removes the local subscription record.
 */
export async function cancelSubscriptionForDeletedServer(serverId: string): Promise<void> {
  const db = getDb();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.serverId, serverId));
  if (!sub) return; // No subscription — nothing to cancel

  if (isStripeConfigured()) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
      console.log(`[Billing] Canceled Stripe subscription ${sub.stripeSubscriptionId} for deleted server ${serverId}`);
    } catch (err) {
      console.error(`[Billing] Failed to cancel Stripe subscription for server ${serverId}:`, err);
      // Still remove local record — the webhook will handle cleanup if cancel eventually goes through
    }
  }

  await db.delete(subscriptions).where(eq(subscriptions.id, sub.id));
}

// ── Webhook Handling ──

export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Process a Stripe webhook event with idempotency protection.
 * Each event.id is recorded in the webhookEvents table; duplicate deliveries are skipped.
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  const db = getDb();

  // Idempotency: skip already-processed events (prevents replay attacks and Stripe retries)
  const [existing] = await db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(eq(webhookEvents.id, event.id));
  if (existing) {
    console.log(`[Billing] Skipping duplicate webhook event ${event.id} (${event.type})`);
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
  }

  // Record processed event (onConflictDoNothing guards against race between concurrent webhook deliveries)
  await db.insert(webhookEvents).values({
    id: event.id,
    type: event.type,
  }).onConflictDoNothing();
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const serverId = session.metadata?.serverId;
  if (!serverId || session.mode !== "subscription") return;

  // Skip if server has been deleted
  const db0 = getDb();
  const [srv] = await db0.select({ id: servers.id }).from(servers)
    .where(and(eq(servers.id, serverId), isNull(servers.deletedAt)));
  if (!srv) {
    console.log(`[Billing] Skipping checkout for deleted server ${serverId}`);
    return;
  }

  const stripe = getStripe();
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Fetch the full subscription to verify real status + get line item IDs
  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

  // Guard: only upgrade if subscription is actually alive on Stripe.
  // A replayed/stale checkout event for a since-canceled subscription must not re-upgrade.
  if (["canceled", "unpaid", "incomplete_expired"].includes(stripeSub.status)) {
    console.warn(`[Billing] checkout.session.completed for ${subscriptionId} but status is ${stripeSub.status} — skipping upgrade`);
    return;
  }

  const periodEnd = getPeriodEnd(stripeSub);
  const db = getDb();

  // Upsert subscription record
  await db
    .insert(subscriptions)
    .values({
      id: randomUUID(),
      serverId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      status: mapStripeStatus(stripeSub.status),
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    })
    .onConflictDoUpdate({
      target: subscriptions.serverId,
      set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        status: mapStripeStatus(stripeSub.status),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

  // Plan upgrades via Stripe are currently disabled (all paid plans removed).
  // When new plans are added, re-enable plan upgrade logic here.
  console.log(`[Billing] Checkout completed for server ${serverId}, but no plan upgrade applied (paid plans disabled)`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const db = getDb();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
  if (!sub) return;

  const stripe = getStripe();
  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

  await db
    .update(subscriptions)
    .set({
      status: "active",
      currentPeriodEnd: getPeriodEnd(stripeSub),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.id));
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const db = getDb();
  await db
    .update(subscriptions)
    .set({ status: "past_due", updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription): Promise<void> {
  const db = getDb();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id));
  if (!sub) return;

  await db
    .update(subscriptions)
    .set({
      status: mapStripeStatus(stripeSub.status),
      currentPeriodEnd: getPeriodEnd(stripeSub),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, sub.id));
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void> {
  const db = getDb();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSub.id));
  if (!sub) return;

  // Downgrade server to free (start grace period) — only if server is not deleted
  await db
    .update(servers)
    .set({ plan: "free", planDowngradedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(servers.id, sub.serverId), isNull(servers.deletedAt)));

  // Remove subscription record
  await db.delete(subscriptions).where(eq(subscriptions.id, sub.id));

  console.log(`[Billing] Server ${sub.serverId} downgraded to free plan`);
  broadcastPlanChange(sub.serverId, "free");
}

// ── Periodic Subscription Refresh ──

/**
 * Scan for subscriptions that look active but whose period has expired,
 * then verify each against the Stripe API. This catches missed webhooks
 * (e.g. Stripe endpoint was down) so stale subscriptions get downgraded.
 * Called periodically from server.ts alongside other maintenance tasks.
 */
export async function refreshStaleSubscriptions(): Promise<void> {
  if (!isStripeConfigured()) return;

  const db = getDb();
  const stale = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, "active"),
        lt(subscriptions.currentPeriodEnd, new Date()),
      ),
    );

  if (stale.length === 0) return;

  console.log(`[Billing] Found ${stale.length} stale subscription(s), verifying with Stripe...`);
  for (const sub of stale) {
    await refreshSubscriptionStatus(sub);
  }
}

// ── Webhook Event Cleanup ──

/** Delete webhook events older than 48 hours. Called periodically from server.ts. */
export async function cleanupWebhookEvents(): Promise<void> {
  const db = getDb();
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 48);
  const result = await db.delete(webhookEvents).where(lt(webhookEvents.processedAt, cutoff));
  if (result.rowCount && result.rowCount > 0) {
    console.log(`[Billing] Cleaned up ${result.rowCount} old webhook events`);
  }
}
