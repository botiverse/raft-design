import { useCallback, useEffect, useState } from "react";
import { RUNTIME_MODELS, type RuntimeModelInfo } from "@slock-ai/shared";
import api from "../api/client";
import { useServerStore } from "../store/serverStore";

interface RuntimeModelsResult {
  models: RuntimeModelInfo[];
  default?: string;
  loading: boolean;
  fromMachine: boolean;
  rescan: () => void;
}

const cache = new Map<string, { models: RuntimeModelInfo[]; default?: string }>();

function staticModelVerification(runtime: string): RuntimeModelInfo["verified"] {
  if (runtime === "gemini") return "suggestion_only";
  return runtime === "opencode" ? "suggestion_only" : "launchable";
}

function staticFallback(runtime: string): RuntimeModelInfo[] {
  return (RUNTIME_MODELS[runtime] || RUNTIME_MODELS.claude || []).map((model) => ({
    ...model,
    verified: model.verified ?? staticModelVerification(runtime),
  }));
}

export function useRuntimeModels(machineId: string | null | undefined, runtime: string): RuntimeModelsResult {
  const serverId = useServerStore((s) => s.current?.id);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [state, setState] = useState<{ models: RuntimeModelInfo[]; default?: string; loading: boolean; fromMachine: boolean }>(
    () => ({ models: staticFallback(runtime), loading: false, fromMachine: false }),
  );

  const rescan = useCallback(() => {
    if (machineId && runtime) {
      cache.delete(`${machineId}:${runtime}`);
    }
    setRefreshNonce((n) => n + 1);
  }, [machineId, runtime]);

  useEffect(() => {
    if (!machineId || !runtime || !serverId) {
      setState({ models: staticFallback(runtime), loading: false, fromMachine: false });
      return;
    }
    const key = `${machineId}:${runtime}`;
    const cached = cache.get(key);
    if (cached) {
      setState({ models: cached.models, default: cached.default, loading: false, fromMachine: true });
      return;
    }
    let cancelled = false;
    setState({ models: staticFallback(runtime), loading: true, fromMachine: false });
    api
      .get(`/servers/${serverId}/machines/${machineId}/runtime-models/${runtime}`)
      .then((res) => {
        if (cancelled) return;
        const payload = res.data as { models: RuntimeModelInfo[]; default?: string };
        if (payload?.models?.length) {
          cache.set(key, payload);
          setState({ models: payload.models, default: payload.default, loading: false, fromMachine: true });
        } else {
          setState({ models: staticFallback(runtime), loading: false, fromMachine: false });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setState({ models: staticFallback(runtime), loading: false, fromMachine: false });
      });
    return () => {
      cancelled = true;
    };
  }, [machineId, runtime, serverId, refreshNonce]);

  return { ...state, rescan };
}
