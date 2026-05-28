import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(repoRoot, path), "utf8");

test("left rail and mobile sidebar use the notification trigger", () => {
  const leftRail = read("src/components/layout/LeftRail.tsx");
  const sidebar = read("src/components/layout/Sidebar.tsx");

  assert.match(leftRail, /import NotificationTrigger from "\.\/NotificationTrigger";/);
  assert.match(sidebar, /import NotificationTrigger from "\.\/NotificationTrigger";/);
  assert.doesNotMatch(leftRail, /WarningTrigger/);
  assert.doesNotMatch(sidebar, /WarningTrigger/);
});

test("notification center exposes notification test ids and wording", () => {
  const trigger = read("src/components/layout/NotificationTrigger.tsx");
  const adapter = read("src/components/layout/NotificationCenter.tsx");
  const primitive = read("src/components/ui/NotificationCenter.tsx");

  assert.match(trigger, /data-testid="notification-trigger-mobile"/);
  assert.match(trigger, /data-testid="notification-trigger-rail"/);
  assert.match(adapter, /data-testid="notification-center"/);
  assert.match(primitive, /title = "Notifications"/);
  assert.match(primitive, /import EmptyState from "\.\/EmptyState";/);
  assert.doesNotMatch(trigger, /warning-trigger-/);
  assert.doesNotMatch(adapter, /warning-center/);
  assert.doesNotMatch(primitive, /warning-center/);
});

test("notification center primitive keeps desktop fixed and mobile content-capped", () => {
  const primitive = read("src/components/ui/NotificationCenter.tsx");

  assert.match(primitive, /desktop:\s*\{\s*compact: "h-56",\s*regular: "h-72",\s*large: "h-96"/);
  assert.match(primitive, /mobile:\s*\{\s*compact: "max-h-\[min\(64dvh,224px\)\]"/);
  assert.match(primitive, /regular: "max-h-\[min\(72dvh,288px\)\]"/);
  assert.match(primitive, /large: "max-h-\[min\(80dvh,384px\)\]"/);
  assert.match(primitive, /overflow-y-auto overscroll-contain/);
});

test("system notification entries use kind, not warning severity", () => {
  const notifications = read("src/components/layout/useSystemNotifications.tsx");
  const kind = read("src/components/layout/notificationKind.ts");

  assert.match(notifications, /export interface NotificationEntry \{/);
  assert.match(notifications, /kind: NotificationKind;/);
  assert.doesNotMatch(notifications, /severity: WarningSeverity/);
  assert.match(kind, /export type NotificationKind = "error" \| "warning" \| "info";/);
});

test("joint channel invites are accepted from email links, not notification center rows", () => {
  const notifications = read("src/components/layout/useSystemNotifications.tsx");
  const app = read("src/App.tsx");

  assert.doesNotMatch(notifications, /joint-invites/);
  assert.doesNotMatch(notifications, /Joint channel invite/);
  assert.match(app, /jointInvite/);
  assert.match(app, /\/channels\/joint-invites\/\$\{encodeURIComponent\(jointInviteId\)\}\/accept/);
});

test("slock system notifications are adapted into the reusable UI primitive", () => {
  const adapter = read("src/components/layout/NotificationCenter.tsx");

  assert.match(adapter, /from "\.\.\/ui\/NotificationCenter";/);
  assert.match(adapter, /toPrimitiveEntry/);
  assert.match(adapter, /dismissedNotificationStore/);
  assert.doesNotMatch(adapter, /KIND_DOT_BG/);
  assert.doesNotMatch(adapter, /DEFAULT_KIND_ICON/);
});
