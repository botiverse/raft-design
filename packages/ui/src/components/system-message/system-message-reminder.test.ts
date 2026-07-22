import { describe, expect, it } from "vite-plus/test";

import {
  formatSystemMessageReminderContentTitle,
  formatSystemMessageReminderTime,
  formatSystemMessageReminderTooltip,
  splitSystemMessageReminderFireAtTokens,
} from "./system-message-reminder";

describe("system message reminder formatting", () => {
  it("formats same-day reminder receipts using local today phrasing", () => {
    const now = new Date("2026-04-25T08:00:00.000Z");
    const rendered = formatSystemMessageReminderTime("2026-04-25T08:49:00.000Z", now);
    expect(rendered).toMatch(/^today at /);
  });

  it("formats next-day reminder receipts using local tomorrow phrasing", () => {
    const now = new Date("2026-04-25T08:00:00.000Z");
    const rendered = formatSystemMessageReminderTime("2026-04-26T08:49:00.000Z", now);
    expect(rendered).toMatch(/^tomorrow at /);
  });

  it("formats reminder receipt clock and day labels with the selected UI time settings", () => {
    const now = new Date("2026-05-14T23:30:00.000Z");
    const rendered = formatSystemMessageReminderTime("2026-05-15T00:15:00.000Z", now, {
      locale: "en-US",
      timeFormat: "24h",
      timeZone: "America/Los_Angeles",
    });
    expect(rendered).toBe("today at 17:15");
  });

  it("formats later reminder receipts with month/day phrasing", () => {
    const now = new Date("2026-04-25T08:00:00.000Z");
    const rendered = formatSystemMessageReminderTime("2026-04-28T08:49:00.000Z", now);
    expect(rendered).toMatch(/^[A-Z][a-z]{2} \d{1,2} at /);
  });

  it("tooltip formatter falls back to the original value for invalid dates", () => {
    expect(formatSystemMessageReminderTooltip("not-a-date")).toBe("not-a-date");
  });

  it("splits server reminder receipt fire-at tokens for system message rendering", () => {
    expect(
      splitSystemMessageReminderFireAtTokens(
        '@agent scheduled a reminder - fires <span data-reminder-fire-at="2026-05-07T01:00:00.000Z">2026-05-07 01:00 UTC</span>',
      ),
    ).toEqual([
      { type: "text", value: "@agent scheduled a reminder - fires " },
      { type: "reminderFireAt", value: "2026-05-07T01:00:00.000Z" },
    ]);
  });

  it("formats reminder receipt content titles without leaking raw span tokens", () => {
    const title = formatSystemMessageReminderContentTitle(
      '@agent scheduled a reminder - fires <span data-reminder-fire-at="2026-05-07T01:00:00.000Z">2026-05-07 01:00 UTC</span>',
    );

    expect(title).toMatch(/^@agent scheduled a reminder - fires /);
    expect(title).not.toMatch(/<span/);
    expect(title).not.toMatch(/data-reminder-fire-at/);
    expect(title).not.toMatch(/2026-05-07 01:00 UTC/);
  });
});
