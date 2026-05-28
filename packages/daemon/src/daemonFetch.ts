import type { Dispatcher } from "undici";
import { buildFetchDispatcher } from "./proxy.js";

export type DaemonFetchInput = string | URL;
export type ProxyAwareRequestInit = RequestInit & { dispatcher?: Dispatcher };

// Centralize daemon outbound HTTP so every server/worker path honors the same
// HTTPS_PROXY / HTTP_PROXY / NO_PROXY rules as the WebSocket connection.
export function withDaemonFetchProxy(
  input: DaemonFetchInput,
  init: RequestInit = {},
  env: NodeJS.ProcessEnv = process.env,
): ProxyAwareRequestInit {
  const dispatcher = buildFetchDispatcher(input.toString(), env);
  return dispatcher ? { ...init, dispatcher } : init;
}

export function daemonFetch(
  input: DaemonFetchInput,
  init?: RequestInit,
  env: NodeJS.ProcessEnv = process.env,
): Promise<Response> {
  return fetch(input, withDaemonFetchProxy(input, init, env));
}
