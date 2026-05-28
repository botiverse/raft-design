export function classifyHistoryAroundCursor(around: string): "seq" | "short_id" | "message_id" {
  if (/^[0-9a-f]{8}$/i.test(around)) return "short_id";
  if (/^\d+$/.test(around)) return "seq";
  return "message_id";
}
