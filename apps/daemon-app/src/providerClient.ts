import type { ProviderKind } from "./model";

export interface ProviderCredentialInput {
  kind: ProviderKind;
  apiKey: string;
  endpoint?: string | null;
}

export interface ProviderConnectivityResult {
  endpoint: string | null;
  usage: string;
}

export type FetchLike = typeof fetch;

const DEFAULT_ENDPOINTS: Record<Exclude<ProviderKind, "custom">, string> = {
  anthropic: "https://api.anthropic.com",
  openai: "https://api.openai.com/v1",
  alibaba: "https://dashscope.aliyuncs.com/compatible-mode/v1",
};

export function normalizeProviderEndpoint(kind: ProviderKind, endpoint?: string | null): string | null {
  const raw = endpoint?.trim();
  if (!raw) {
    return kind === "custom" ? null : DEFAULT_ENDPOINTS[kind];
  }
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return new URL(withProtocol).toString().replace(/\/$/, "");
}

export function formatProviderKeyHint(apiKey: string): string {
  const suffix = apiKey.slice(-4);
  return suffix ? `saved locally · ••••${suffix}` : "saved locally";
}

export async function testProviderConnection(
  input: ProviderCredentialInput,
  fetchImpl: FetchLike = fetch,
): Promise<ProviderConnectivityResult> {
  const endpoint = normalizeProviderEndpoint(input.kind, input.endpoint);
  if (!input.apiKey.trim()) {
    throw new Error("Save an API key before running a connectivity check.");
  }
  if (!endpoint) {
    throw new Error("Add an endpoint before running a connectivity check.");
  }

  const request = buildProviderRequest(input.kind, input.apiKey.trim(), endpoint);
  let response: Response;
  try {
    response = await fetchImpl(request.url, request.init);
  } catch {
    throw new Error("Failed to reach the provider endpoint from the local shell.");
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("Provider rejected the saved credentials.");
  }
  if (response.status === 404) {
    throw new Error("Provider endpoint looks wrong; the models path returned 404.");
  }
  if (!response.ok) {
    throw new Error(`Provider connectivity check failed (${response.status}).`);
  }

  return {
    endpoint,
    usage: `Connectivity verified against ${new URL(endpoint).host}`,
  };
}

function buildProviderRequest(kind: ProviderKind, apiKey: string, endpoint: string): {
  url: string;
  init: RequestInit;
} {
  if (kind === "anthropic") {
    return {
      url: new URL("/v1/models", `${endpoint}/`).toString(),
      init: {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        } satisfies Record<string, string>,
      },
    };
  }

  return {
    url: new URL("models", `${endpoint}/`).toString(),
    init: {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      } satisfies Record<string, string>,
    },
  };
}
