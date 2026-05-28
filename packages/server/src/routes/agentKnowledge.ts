import type { Request, Response } from "express";
import {
  agentBelongsToServer,
  normalizeKnowledgeTopic,
  normalizeOptionalKnowledgeField,
  recordAgentKnowledgeEvent,
  resolveAgentKnowledgeDoc,
  validateKnowledgeReason,
  type AgentKnowledgeDoc,
  type AgentKnowledgeSource,
} from "../services/agentKnowledgeService.js";

export interface AgentKnowledgeActor {
  agentId: string;
  serverId: string;
  computerId?: string | null;
}

export async function handleAgentKnowledgeGet(
  req: Request,
  res: Response,
  actor: AgentKnowledgeActor,
): Promise<void> {
  const startedAt = Date.now();
  const source = resolveKnowledgeSource(req);
  if (!source) {
    res.status(400).json({
      ok: false,
      code: "knowledge_source_invalid",
      error: "Knowledge requests must come from an implemented source",
    });
    return;
  }

  const topic = normalizeKnowledgeTopic(req.query.topic);
  if (!topic) {
    res.status(400).json({
      ok: false,
      code: "knowledge_topic_invalid",
      error: "topic query parameter is required",
    });
    return;
  }

  const reason = validateKnowledgeReason(req.query.reason);
  if (!reason.ok) {
    res.status(400).json({
      ok: false,
      code: "knowledge_reason_invalid",
      error: reason.error ?? "reason is invalid",
    });
    return;
  }

  const turnId = resolveCorrelationField(req.query.turn_id, req.header("X-Slock-Turn-Id"));
  if (!turnId.ok) {
    res.status(400).json({
      ok: false,
      code: "knowledge_turn_id_invalid",
      error: turnId.error,
    });
    return;
  }

  const traceId = resolveCorrelationField(req.query.trace_id, req.header("X-Slock-Trace-Id"));
  if (!traceId.ok) {
    res.status(400).json({
      ok: false,
      code: "knowledge_trace_id_invalid",
      error: traceId.error,
    });
    return;
  }

  try {
    const belongs = await agentBelongsToServer(actor.agentId, actor.serverId);
    if (!belongs) {
      res.status(401).json({ ok: false, code: "knowledge_agent_missing", error: "Agent no longer exists" });
      return;
    }

    const doc = await resolveAgentKnowledgeDoc(topic);
    if (!doc) {
      await recordAgentKnowledgeEvent({
        serverId: actor.serverId,
        agentId: actor.agentId,
        computerId: actor.computerId ?? null,
        topicOrPath: topic,
        source,
        status: "not_found",
        latencyMs: Date.now() - startedAt,
        turnId: turnId.value,
        traceId: traceId.value,
        reason: reason.reason,
      });
      res.status(404).json({
        ok: false,
        code: "knowledge_not_found",
        error: "Knowledge topic not found",
      });
      return;
    }

    const responseBytes = Buffer.byteLength(doc.content, "utf8");
    await recordAgentKnowledgeEvent({
      serverId: actor.serverId,
      agentId: actor.agentId,
      computerId: actor.computerId ?? null,
      docId: doc.docId,
      topicOrPath: topic,
      docVersion: doc.docVersion,
      docState: doc.docState,
      source,
      status: "success",
      latencyMs: Date.now() - startedAt,
      responseBytes,
      turnId: turnId.value,
      traceId: traceId.value,
      reason: reason.reason,
    });

    res.status(200).json(serializeKnowledgeDoc(doc));
  } catch (err) {
    console.error("agent.knowledge.get error:", err);
    try {
      await recordAgentKnowledgeEvent({
        serverId: actor.serverId,
        agentId: actor.agentId,
        computerId: actor.computerId ?? null,
        topicOrPath: topic,
        source,
        status: "error",
        latencyMs: Date.now() - startedAt,
        turnId: turnId.value,
        traceId: traceId.value,
        reason: reason.reason,
      });
    } catch (eventErr) {
      console.error("agent.knowledge.get event write failed:", eventErr);
    }
    res.status(500).json({
      ok: false,
      code: "knowledge_internal_error",
      error: "Failed to load knowledge topic",
    });
  }
}

function serializeKnowledgeDoc(doc: AgentKnowledgeDoc) {
  return {
    ok: true,
    docId: doc.docId,
    topicOrPath: doc.topicOrPath,
    docVersion: doc.docVersion,
    docState: doc.docState,
    contentType: doc.contentType,
    content: doc.content,
  };
}

function resolveKnowledgeSource(req: Request): AgentKnowledgeSource | null {
  return req.header("X-Slock-Client") === "cli" ? "cli" : null;
}

function resolveCorrelationField(
  queryValue: unknown,
  headerValue: string | undefined,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const fromQuery = normalizeOptionalKnowledgeField(queryValue);
  const fromHeader = normalizeOptionalKnowledgeField(headerValue);
  if (fromQuery && fromHeader && fromQuery !== fromHeader) {
    return { ok: false, error: "query parameter and header value disagree" };
  }
  return { ok: true, value: fromHeader ?? fromQuery };
}
