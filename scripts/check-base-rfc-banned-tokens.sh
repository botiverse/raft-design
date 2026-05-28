#!/usr/bin/env bash
#
# check-base-rfc-banned-tokens.sh — verify base credential RFC contains NO Computer-specific upgrade tokens.
#
# This is the absence-check half of the dual-script contract for the Computer RFC split:
#   - this script (absence): banned-verbatim 10 tokens in base RFC must be 0 occurrences
#   - check-computer-rfc-required-tokens.sh (presence, lives in liuliu's Computer product PR):
#     same 10 tokens MUST each appear at least once in Computer RFC §4 slice
#
# Background: Computer RFC v8.3.3 §4.4 (6) defines 3 closed-set families totaling 10 tokens.
# When the base credential RFC is split out, §11 stable-error-code framework must remain
# framework-only (registration/naming/revision meta-contract) and MUST NOT collect any of
# these 10 token literals — that would dilute Computer §4 hardness into base abstraction.
#
# Canonical source: packages/computer/src/upgradeLog.ts L54-62 + RFC §4.4 (6) L361 / L365.
# See feedback_byte_pin_cli_cross_verify family (4 sub-rules) for the discipline this enforces.
#
# Usage:
#   ./scripts/check-base-rfc-banned-tokens.sh
#   BASE_RFC=docs/server/some-other-file.html ./scripts/check-base-rfc-banned-tokens.sh
#
# Self-test pattern (verify-the-verifier sub-rule):
#   tmp=$(mktemp "${TMPDIR:-/tmp}/base-rfc.XXXXXX")
#   trap 'rm -f "$tmp"' EXIT
#   cp docs/server/slock-credential-rfc.zh.html "$tmp"
#   echo 'UPGRADE_DEPS_CHANGED sentinel for self-test' >> "$tmp"
#   BASE_RFC="$tmp" ./scripts/check-base-rfc-banned-tokens.sh   # expect exit 1 + LEAK: line
#   cp docs/server/slock-credential-rfc.zh.html "$tmp"
#   BASE_RFC="$tmp" ./scripts/check-base-rfc-banned-tokens.sh   # expect exit 0
#

set -u

BASE_RFC="${BASE_RFC:-docs/server/slock-credential-rfc.zh.html}"

if [ ! -f "$BASE_RFC" ]; then
  echo "ERROR: BASE_RFC file not found: $BASE_RFC" >&2
  exit 2
fi

# Banned-verbatim 10 tokens (Computer-specific upgrade closed-sets).
# DO NOT use regex alternation form `rg -F 'A|B|C'` — that treats A|B|C as literal string
# (because -F = fixed strings), returning 0 hits even when A, B, or C is present.
# Per-token literal loop is the safe form.
banned_tokens=(
  # Set 1 — attempt outcomes (7 values, upgradeLog.ts L54-62 + RFC §4.4 (6) L361)
  UPGRADE_DEPS_CHANGED
  UPGRADE_NETWORK_FAILED
  UPGRADE_INTEGRITY_FAILED
  UPGRADE_SWAP_FAILED
  UPGRADE_RESTART_FAILED
  UPGRADE_NO_TARGET
  UPGRADE_ALREADY_RUNNING
  # Set 2 — pre-condition rejection (2 values, RFC §4.4 L365 independent closed-set)
  UPGRADE_REQUIRES_ADOPTION
  CHANNEL_INVALID
  # Set 3 — informational (1 value, RFC §4.4 L365 independent closed-set)
  LEGACY_DAEMON_INSTALL_DETECTED
)

# Note: UPGRADE_OK / UPGRADE_NOOP are NOT in this list. They are UpgradeLogEntry.outcome
# field values (discriminated union, upgradeLog.ts L92-115), orthogonal to errorCode
# closed-sets. The base RFC may legitimately reference them as outcome-axis concepts.

leak_count=0
for t in "${banned_tokens[@]}"; do
  if rg -F -q "$t" "$BASE_RFC" 2>/dev/null; then
    echo "LEAK: $t in $BASE_RFC"
    leak_count=$((leak_count + 1))
  fi
done

if [ "$leak_count" -gt 0 ]; then
  echo ""
  echo "FAIL: $leak_count banned token(s) leaked into base RFC."
  echo "Computer-specific upgrade tokens must stay in Computer product RFC §4 only."
  echo "Base RFC §11 must be framework-only (registration/naming/revision meta-contract)."
  exit 1
fi

echo "OK: no banned tokens in $BASE_RFC"
exit 0
