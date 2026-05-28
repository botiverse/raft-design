import { useMemo } from "react";
import { useTranslationStore } from "../store/translationStore";
import {
  formatClock,
  formatClockWithSeconds,
  formatMediumDateTime,
  formatMessageTime,
  formatShortDateTime,
  type TimeFormatOptions,
} from "../utils/timeFormatting";

export function useTimeFormatter() {
  const effectiveTimezone = useTranslationStore((state) => state.settings.effectiveTimezone);
  const effectiveTimeFormat = useTranslationStore((state) => state.settings.effectiveTimeFormat);

  return useMemo(() => {
    const base: TimeFormatOptions = {
      timeZone: effectiveTimezone,
      timeFormat: effectiveTimeFormat,
    };

    return {
      options: base,
      formatClock: (value: Date | string | number | null | undefined) => formatClock(value, base),
      formatClockWithSeconds: (value: Date | string | number | null | undefined) => formatClockWithSeconds(value, base),
      formatMessageTime: (value: Date | string | number | null | undefined) => formatMessageTime(value, base),
      formatShortDateTime: (value: Date | string | number | null | undefined) => formatShortDateTime(value, base),
      formatMediumDateTime: (value: Date | string | number | null | undefined) => formatMediumDateTime(value, base),
    };
  }, [effectiveTimeFormat, effectiveTimezone]);
}
