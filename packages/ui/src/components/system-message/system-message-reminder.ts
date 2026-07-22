export type SystemMessageTimeFormat = "12h" | "24h";

export type SystemMessageTimeFormatOptions = {
  timeFormat?: SystemMessageTimeFormat | null;
  timeZone?: string | null;
  locale?: string | string[];
};

export type SystemMessageReminderContentPart =
  | { type: "text"; value: string }
  | { type: "reminderFireAt"; value: string };

const reminderFireAtTokenPattern = /<span\s+data-reminder-fire-at="([^"]+)">[^<]*<\/span>/g;

function timeZoneOption(options: SystemMessageTimeFormatOptions): string | undefined {
  return options.timeZone || undefined;
}

function hour12(timeFormat: SystemMessageTimeFormat | null | undefined): boolean | undefined {
  if (timeFormat === "12h") return true;
  if (timeFormat === "24h") return false;
  return undefined;
}

function dateKey(date: Date, options: SystemMessageTimeFormatOptions): string {
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: timeZoneOption(options),
  });
}

function yearKey(date: Date, options: SystemMessageTimeFormatOptions): string {
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    timeZone: timeZoneOption(options),
  });
}

function formatLocalClock(date: Date, options: SystemMessageTimeFormatOptions = {}): string {
  return date.toLocaleTimeString(options.locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: hour12(options.timeFormat),
    timeZone: timeZoneOption(options),
  });
}

function formatMediumDateTime(date: Date, options: SystemMessageTimeFormatOptions = {}): string {
  return date.toLocaleString(options.locale, {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: hour12(options.timeFormat),
    timeZone: timeZoneOption(options),
  });
}

/** @deprecated Reminder parsing belongs in the consumer composition layer. */
export function splitSystemMessageReminderFireAtTokens(
  content: string,
): SystemMessageReminderContentPart[] {
  const parts: SystemMessageReminderContentPart[] = [];
  let cursor = 0;

  for (const match of content.matchAll(reminderFireAtTokenPattern)) {
    if (match.index === undefined) continue;
    if (match.index > cursor) {
      parts.push({ type: "text", value: content.slice(cursor, match.index) });
    }
    parts.push({ type: "reminderFireAt", value: match[1] });
    cursor = match.index + match[0].length;
  }

  if (cursor === 0) return [{ type: "text", value: content }];
  if (cursor < content.length) {
    parts.push({ type: "text", value: content.slice(cursor) });
  }
  return parts;
}

/** @deprecated Reminder formatting belongs in the consumer composition layer. */
export function formatSystemMessageReminderTooltip(
  value: string,
  options: SystemMessageTimeFormatOptions = {},
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatMediumDateTime(date, options);
}

/** @deprecated Reminder formatting belongs in the consumer composition layer. */
export function formatSystemMessageReminderContentTitle(
  content: string,
  options: SystemMessageTimeFormatOptions = {},
): string {
  return splitSystemMessageReminderFireAtTokens(content)
    .map((part) =>
      part.type === "reminderFireAt"
        ? formatSystemMessageReminderTooltip(part.value, options)
        : part.value,
    )
    .join("");
}

/** @deprecated Reminder formatting belongs in the consumer composition layer. */
export function formatSystemMessageReminderTime(
  value: string,
  now = new Date(),
  options: SystemMessageTimeFormatOptions = {},
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  if (dateKey(date, options) === dateKey(now, options)) {
    return `today at ${formatLocalClock(date, options)}`;
  }

  if (dateKey(date, options) === dateKey(tomorrow, options)) {
    return `tomorrow at ${formatLocalClock(date, options)}`;
  }

  const sameYear = yearKey(date, options) === yearKey(now, options);
  const datePart = date.toLocaleDateString(
    options.locale,
    sameYear
      ? { month: "short", day: "numeric", timeZone: timeZoneOption(options) }
      : { year: "numeric", month: "short", day: "numeric", timeZone: timeZoneOption(options) },
  );

  return `${datePart} at ${formatLocalClock(date, options)}`;
}
