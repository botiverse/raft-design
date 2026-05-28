#!/usr/bin/env python3
"""
Build a short ScopeDB trace report from pasted Slock Diagnostic Info.

This intentionally uses only Python stdlib + ScopeDB's HTTP statements API so
engineers can run it from a checkout without installing a separate SDK.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import time
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


FIELD_ALIASES = {
    "reportedatutc": "reportedAtUtc",
    "serverid": "serverId",
    "agentid": "agentId",
    "machineid": "machineId",
    "runtime": "runtime",
    "model": "model",
    "daemonversion": "daemonVersion",
    "agentstatus": "agentStatus",
    "activity": "activity",
    "activitykind": "activityKind",
    "lastactivityatutc": "lastActivityAtUtc",
}

ID_FIELDS = ("serverId", "agentId", "machineId")
CONTEXT_FIELDS = ("runtime", "model", "daemonVersion")


class DiagnosticError(RuntimeError):
    pass


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), value)


def parse_diagnostic_text(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or ":" not in line:
            continue
        key, value = line.split(":", 1)
        normalized = re.sub(r"[^a-z0-9]", "", key.lower())
        canonical = FIELD_ALIASES.get(normalized)
        if canonical and value.strip():
            result[canonical] = value.strip()
    return result


def parse_timestamp(value: str) -> dt.datetime:
    raw = value.strip()
    if raw.endswith("Z"):
        raw = raw[:-1] + "+00:00"
    parsed = dt.datetime.fromisoformat(raw)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)


def iso_z(ts: dt.datetime) -> str:
    return ts.astimezone(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def sql_string(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def scopedb_statement(sql: str, *, timeout_s: int, poll_interval_s: float = 0.5) -> dict[str, Any]:
    endpoint = os.environ.get("SCOPEDB_ENDPOINT", "").rstrip("/")
    token = os.environ.get("SCOPEDB_API_KEY", "")
    if not endpoint or not token:
        raise DiagnosticError("SCOPEDB_ENDPOINT and SCOPEDB_API_KEY must be set")

    def request(path: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(
            f"{endpoint}{path}",
            data=data,
            method="POST" if body is not None else "GET",
        )
        req.add_header("Authorization", f"Bearer {token}")
        if body is not None:
            req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=timeout_s) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as exc:
            body_text = exc.read().decode(errors="replace")
            raise DiagnosticError(f"ScopeDB HTTP {exc.code}: {body_text}") from exc

    payload = request("/v1/statements", {"statement": sql, "format": "json"})
    statement_id = payload.get("statement_id")
    deadline = time.monotonic() + timeout_s
    while payload.get("status") not in {"finished", "failed", "cancelled"}:
        if not statement_id:
            break
        if time.monotonic() > deadline:
            raise DiagnosticError(f"ScopeDB statement timed out: {statement_id}")
        time.sleep(poll_interval_s)
        payload = request(f"/v1/statements/{statement_id}?format=json")
    if payload.get("status") != "finished":
        raise DiagnosticError(f"ScopeDB statement {payload.get('status')}: {payload.get('message')}")
    return payload


def rows_as_objects(payload: dict[str, Any]) -> list[dict[str, Any]]:
    result_set = payload.get("result_set") or {}
    fields = [field["name"] for field in result_set.get("metadata", {}).get("fields", [])]
    rows = result_set.get("rows") or []
    return [dict(zip(fields, row, strict=False)) for row in rows]


def choose_search_terms(diagnostic: dict[str, str]) -> tuple[str, list[str]]:
    ids = [diagnostic.get(key, "") for key in ID_FIELDS]
    id_terms = [term for term in ids if term]
    if id_terms:
        return "diagnostic-id", sorted(set(id_terms))
    context_terms = [diagnostic.get(key, "") for key in CONTEXT_FIELDS]
    return "runtime-context", sorted(set(term for term in context_terms if term))


def build_base_where(
    start: dt.datetime,
    end: dt.datetime,
    *,
    env: str | None,
    search_terms: list[str],
) -> str:
    clauses = [
        f"start_timestamp >= {sql_string(iso_z(start))}::timestamp",
        f"start_timestamp <= {sql_string(iso_z(end))}::timestamp",
    ]
    if env:
        clauses.append(f"env = {sql_string(env)}")

    if search_terms:
        contains_terms = [
            f"contains(record['attributes']::string, {sql_string(term)})" for term in sorted(set(search_terms))
        ]
        clauses.append("(" + " OR ".join(contains_terms) + ")")
    return " AND ".join(clauses)


def query_summary(where: str) -> str:
    return f"""
FROM scopedb.otel.traces
WHERE {where}
GROUP BY env, service, span_name, status_code, http_status_code, error_type
AGGREGATE count() AS spans, max(duration_ns) AS max_duration_ns
ORDER BY spans DESC
LIMIT 40
""".strip()


def query_errors(where: str) -> str:
    return f"""
FROM scopedb.otel.traces
WHERE {where}
  AND (
    status_code = 'error'
    OR error_type IS NOT NULL
    OR http_status_code >= 500
    OR contains(record['attributes']::string, 'runtime-error')
    OR contains(record['attributes']::string, 'runtime_error_class')
    OR contains(record['attributes']::string, 'activity:error')
  )
SELECT start_timestamp, env, service, span_name, status_code, http_status_code, error_type,
       duration_ns, trace_id, span_id, record['attributes'] AS attrs
ORDER BY start_timestamp ASC
LIMIT 80
""".strip()


def query_recent(where: str) -> str:
    return f"""
FROM scopedb.otel.traces
WHERE {where}
SELECT start_timestamp, env, service, span_name, status_code, http_status_code, error_type,
       duration_ns, trace_id, span_id, record['attributes'] AS attrs
ORDER BY start_timestamp ASC
LIMIT 120
""".strip()


def parse_attrs(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if not isinstance(value, str) or not value:
        return {}
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        return {}


def seconds(ns: Any) -> float:
    try:
        return int(ns) / 1_000_000_000
    except (TypeError, ValueError):
        return 0.0


def compact_span(row: dict[str, Any]) -> str:
    attrs = parse_attrs(row.get("attrs"))
    interesting_keys = [
        "outcome",
        "reason",
        "activity",
        "activityKind",
        "runtime",
        "model",
        "daemonVersion",
        "runtime_error_class",
        "runtime_error_fingerprint",
        "failure_class",
        "error_class",
        "close_code",
        "http.route",
        "route_pattern",
    ]
    bits = []
    for key in interesting_keys:
        if key in attrs and attrs[key] is not None:
            bits.append(f"{key}={attrs[key]}")
    duration = seconds(row.get("duration_ns"))
    duration_text = f"{duration:.1f}s" if duration >= 1 else f"{duration * 1000:.0f}ms"
    status = row.get("status_code") or "-"
    http = row.get("http_status_code")
    http_part = f" http={http}" if http is not None else ""
    attr_part = f" ({'; '.join(bits[:6])})" if bits else ""
    return (
        f"- {row.get('start_timestamp')} {row.get('service')}/{row.get('span_name')} "
        f"status={status}{http_part} duration={duration_text}{attr_part}"
    )


def markdown_report(
    diagnostic: dict[str, str],
    *,
    start: dt.datetime,
    end: dt.datetime,
    env: str | None,
    window_minutes: int,
    search_mode: str,
    search_terms: list[str],
    summary: list[dict[str, Any]],
    errors: list[dict[str, Any]],
    recent: list[dict[str, Any]],
) -> str:
    ids = ", ".join(f"{key}={diagnostic[key]}" for key in ID_FIELDS if diagnostic.get(key)) or "(none)"
    context = ", ".join(f"{key}={diagnostic[key]}" for key in CONTEXT_FIELDS if diagnostic.get(key)) or "(none)"
    lines = [
        "# Slock Trace Diagnostic",
        "",
        f"- Window: {iso_z(start)} .. {iso_z(end)}",
        f"- Window minutes: ±{window_minutes}",
        f"- Env filter: {env or '(all)'}",
        f"- Search mode: {search_mode}",
        f"- Search terms: {', '.join(search_terms) if search_terms else '(none)'}",
        f"- IDs: {ids}",
        f"- Runtime context: {context}",
        "",
        "## Summary",
    ]
    if not summary:
        lines.append("- No matching spans found. Widen the window or remove `--env`.")
    else:
        for row in summary[:12]:
            duration = seconds(row.get("max_duration_ns"))
            duration_text = f"{duration:.1f}s" if duration >= 1 else f"{duration * 1000:.0f}ms"
            http = row.get("http_status_code")
            http_part = f", http={http}" if http is not None else ""
            lines.append(
                f"- {row.get('spans')}x {row.get('env')}/{row.get('service')}/{row.get('span_name')} "
                f"status={row.get('status_code') or '-'}{http_part}, max={duration_text}"
            )

    lines.extend(["", "## Error / Suspicious Spans"])
    if not errors:
        lines.append("- No error/5xx/runtime-error spans matched this diagnostic window.")
    else:
        lines.extend(compact_span(row) for row in errors[:20])

    lines.extend(["", "## Recent Matching Spans"])
    if not recent:
        lines.append("- No matching spans.")
    else:
        lines.extend(compact_span(row) for row in recent[:25])

    lines.extend(
        [
            "",
            "## Next Checks",
            "- If no daemon spans match, verify the daemon is uploading traces and widen the window.",
            "- If daemon spans match but server spans do not, inspect machine websocket / delivery spans around the same time.",
            "- If only HTTP route spans match, rerun with the agentId/machineId from the relevant server response or diagnostic.",
        ]
    )
    return "\n".join(lines) + "\n"


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, help="File containing pasted Slock Diagnostic Info. Defaults to stdin.")
    parser.add_argument("--env-file", type=Path, default=Path(".env.scopedb"), help="Optional env file with ScopeDB credentials.")
    parser.add_argument("--env", help="Optional ScopeDB env filter, e.g. production, staging, play.")
    parser.add_argument("--window-minutes", type=int, default=10, help="Minutes before/after reportedAtUtc to query.")
    parser.add_argument("--timeout-seconds", type=int, default=60, help="ScopeDB request/statement timeout.")
    parser.add_argument("--json", action="store_true", help="Emit raw JSON instead of markdown.")
    parser.add_argument("--print-sql", action="store_true", help="Print generated ScopeQL and exit without querying.")
    parser.add_argument("--self-test", action="store_true", help="Run deterministic parser/helper tests and exit.")
    args = parser.parse_args(argv)

    if args.self_test:
        suite = unittest.defaultTestLoader.loadTestsFromTestCase(TraceDiagnosticUnitTests)
        result = unittest.TextTestRunner(verbosity=2).run(suite)
        return 0 if result.wasSuccessful() else 1

    load_env_file(args.env_file)
    text = args.input.read_text() if args.input else sys.stdin.read()
    diagnostic = parse_diagnostic_text(text)
    if "reportedAtUtc" not in diagnostic:
        raise DiagnosticError("Diagnostic input must include reportedAtUtc")

    reported_at = parse_timestamp(diagnostic["reportedAtUtc"])
    delta = dt.timedelta(minutes=args.window_minutes)
    start = reported_at - delta
    end = reported_at + delta
    search_mode, search_terms = choose_search_terms(diagnostic)
    where = build_base_where(
        start,
        end,
        env=args.env,
        search_terms=search_terms,
    )
    sqls = {
        "summary": query_summary(where),
        "errors": query_errors(where),
        "recent": query_recent(where),
    }
    if args.print_sql:
        print(json.dumps(sqls, indent=2))
        return 0

    payloads = {
        name: rows_as_objects(scopedb_statement(sql, timeout_s=args.timeout_seconds))
        for name, sql in sqls.items()
    }
    if args.json:
        print(
            json.dumps(
                {
                    "diagnostic": diagnostic,
                    "window": {
                        "start": iso_z(start),
                        "end": iso_z(end),
                        "minutes": args.window_minutes,
                        "env": args.env,
                    },
                    "search": {"mode": search_mode, "terms": search_terms},
                    "results": payloads,
                },
                indent=2,
            )
        )
    else:
        print(
            markdown_report(
                diagnostic,
                start=start,
                end=end,
                env=args.env,
                window_minutes=args.window_minutes,
                search_mode=search_mode,
                search_terms=search_terms,
                summary=payloads["summary"],
                errors=payloads["errors"],
                recent=payloads["recent"],
            )
        )
    return 0


class TraceDiagnosticUnitTests(unittest.TestCase):
    def test_parse_diagnostic_text_accepts_canonical_fields(self) -> None:
        parsed = parse_diagnostic_text(
            """
            Slock Diagnostic Info
            reportedAtUtc: 2026-05-18T07:44:03.737Z
            serverId: server-1
            agentId: agent-1
            machineId: machine-1
            daemonVersion: 0.50.0
            ignored: value
            """
        )
        self.assertEqual(parsed["reportedAtUtc"], "2026-05-18T07:44:03.737Z")
        self.assertEqual(parsed["serverId"], "server-1")
        self.assertEqual(parsed["agentId"], "agent-1")
        self.assertEqual(parsed["machineId"], "machine-1")
        self.assertEqual(parsed["daemonVersion"], "0.50.0")
        self.assertNotIn("ignored", parsed)

    def test_parse_timestamp_accepts_z_fractional_seconds(self) -> None:
        parsed = parse_timestamp("2026-05-18T07:44:03.737Z")
        self.assertEqual(parsed.tzinfo, dt.timezone.utc)
        self.assertEqual(iso_z(parsed), "2026-05-18T07:44:03Z")

    def test_sql_string_escapes_quotes_and_backslashes(self) -> None:
        self.assertEqual(sql_string("a'b\\c"), "'a''b\\\\c'")

    def test_choose_search_terms_prefers_ids_over_runtime_context(self) -> None:
        mode, terms = choose_search_terms({"agentId": "agent-1", "runtime": "claude"})
        self.assertEqual(mode, "diagnostic-id")
        self.assertEqual(terms, ["agent-1"])

        mode, terms = choose_search_terms({"runtime": "claude", "model": "opus"})
        self.assertEqual(mode, "runtime-context")
        self.assertEqual(terms, ["claude", "opus"])

    def test_rows_as_objects_tolerates_short_rows(self) -> None:
        payload = {
            "result_set": {
                "metadata": {"fields": [{"name": "a"}, {"name": "b"}]},
                "rows": [[1], [2, 3]],
            }
        }
        self.assertEqual(rows_as_objects(payload), [{"a": 1}, {"a": 2, "b": 3}])


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv[1:]))
    except DiagnosticError as exc:
        print(f"trace-diagnostic: {exc}", file=sys.stderr)
        raise SystemExit(1)
