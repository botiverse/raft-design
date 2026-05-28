export const PERF_CALLER_CONTEXT_HEADER = "X-Perf-Caller-Context";
export const AGENT_ORIGINATED_CALLER_CONTEXT = "agent_originated";

export function buildChatBridgeCommonHeaders(
  authToken: string,
  { includeContentType = true }: { includeContentType?: boolean } = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    [PERF_CALLER_CONTEXT_HEADER]: AGENT_ORIGINATED_CALLER_CONTEXT,
  };
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}
