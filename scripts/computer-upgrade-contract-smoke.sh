#!/usr/bin/env bash
# v8.3.3 §4.4 upgrade closed-set contract smoke (PR2 v1).
#
# Companion to the unit harness in
# packages/computer/src/upgradeContractRegression.test.ts (PR #2108).
# Locks the 7-value Tier 1 closed-set end-to-end against a real
# published @slock-ai/computer tarball so packaging / phase-wire /
# spawn-shape drift surfaces.
#
# Usage:
#   scripts/computer-upgrade-contract-smoke.sh <prev-version> <new-version>
#
# Example:
#   scripts/computer-upgrade-contract-smoke.sh 0.0.9 0.0.10
#
# v1 scope (6/7 hybrid per @tygg msg=32557525, spec
# notes/task7-upgrade-contract-regression-spec.md):
#   1. NETWORK_FAILED       — closed-port registry, hydrate fails
#   2. INTEGRITY_FAILED     — SKIP: needs UPGRADE_FORCE_INTEGRITY_FAILED
#                             test-seam; tracked as PR2.2 follow-up
#   3. SWAP_FAILED          — chmod active layout read-only, rename EACCES
#   4. RESTART_FAILED       — SKIP: needs UPGRADE_RESTART_FORCE_EXIT
#                             test-seam; tracked as PR2.3 follow-up
#   5. NO_TARGET            — install new locally, run upgrade against new
#   6. ALREADY_RUNNING      — pre-hold proper-lockfile mutation lock
#
# DEPS_CHANGED is out of scope here; tracked as PR2.1 follow-up after
# runUpgrade exposes a preflight test-seam env var.
#
# Harness hygiene (spec v2.1 §3.3):
#   - per-case mktemp dir
#   - harness-root `trap rm -rf $TMP_ROOT EXIT` as sole cleanup
#   - failure artifacts: on FAIL, tar the case's slock-home tree
#     and emit GH-Actions-friendly artifact name to stdout

set -u

PREV="${1:?prev version required, e.g. 0.0.9}"
NEW="${2:?new version required, e.g. 0.0.10}"

PASS=0
FAIL=0
SKIP=0
FAILED_CASES=()

TMP_ROOT="$(mktemp -d -t upgrade-contract-XXXXXX)"
# Sole cleanup hook — preserves failed-case evidence until end of run.
trap 'rm -rf "$TMP_ROOT"' EXIT

echo "harness tmp root: $TMP_ROOT"
echo "prev=$PREV new=$NEW"
echo ""

pass() { echo "[PASS] $*"; PASS=$((PASS+1)); }
fail() { echo "[FAIL] $*"; FAIL=$((FAIL+1)); FAILED_CASES+=("$1"); }
skip() { echo "[SKIP] $*"; SKIP=$((SKIP+1)); }

# Create a per-case tmp dir + SLOCK_HOME. Echoes the case dir.
case_setup() {
  local case_id="$1"
  local case_tmp
  case_tmp="$(mktemp -d "$TMP_ROOT/${case_id}-XXX")"
  mkdir -p "$case_tmp/slock-home/computer"
  echo "$case_tmp"
}

# Install @slock-ai/computer@<ver> globally into <case_tmp>/prefix.
# Echoes path to slock-computer binary.
case_install_computer() {
  local case_tmp="$1"
  local ver="$2"
  local prefix="$case_tmp/prefix"
  mkdir -p "$prefix"
  npm i -g "@slock-ai/computer@$ver" --prefix "$prefix" --no-audit --no-fund >"$case_tmp/install.log" 2>&1
  local bin="$prefix/bin/slock-computer"
  if [ ! -x "$bin" ]; then
    echo "case_install_computer: install of @slock-ai/computer@$ver to $prefix failed; see $case_tmp/install.log" >&2
    return 1
  fi
  echo "$bin"
}

# Read the last JSON line of the case's upgrade.log. Echoes "" if missing.
case_last_log_entry() {
  local case_tmp="$1"
  local log="$case_tmp/slock-home/computer/upgrade.log"
  [ -f "$log" ] || { echo ""; return; }
  tail -n 1 "$log"
}

# Assert the last upgrade.log entry's errorCode field equals expected.
assert_errorcode() {
  local case_id="$1"
  local case_tmp="$2"
  local expected="$3"
  local last
  last="$(case_last_log_entry "$case_tmp")"
  if [ -z "$last" ]; then
    fail "$case_id: upgrade.log empty or missing"
    return 1
  fi
  echo "  log: $last"
  if echo "$last" | grep -q "\"errorCode\":\"$expected\""; then
    pass "$case_id: errorCode=$expected"
    return 0
  else
    fail "$case_id: expected errorCode=$expected, got: $last"
    return 1
  fi
}

# ============================================================
# Case 1: NETWORK_FAILED — closed-port registry
# ============================================================
echo "=== Case 1: NETWORK_FAILED (closed-port registry) ==="
C1_TMP="$(case_setup network)"
C1_BIN="$(case_install_computer "$C1_TMP" "$PREV")" || {
  fail "case1-network: prev install of $PREV failed"
}
if [ -n "${C1_BIN:-}" ] && [ -x "$C1_BIN" ]; then
  SLOCK_HOME="$C1_TMP/slock-home" \
  npm_config_registry="http://127.0.0.1:1" \
    "$C1_BIN" upgrade --target-version "$NEW" >"$C1_TMP/upgrade.out" 2>&1 || true
  assert_errorcode "case1-network" "$C1_TMP" "UPGRADE_NETWORK_FAILED" || true
fi
echo ""

# ============================================================
# Case 2: INTEGRITY_FAILED — SKIP (needs test-seam)
# ============================================================
echo "=== Case 2: INTEGRITY_FAILED ==="
skip "case2-integrity: needs UPGRADE_FORCE_INTEGRITY_FAILED test-seam in runUpgrade; tracked as PR2.2 follow-up"
echo ""

# ============================================================
# Case 3: SWAP_FAILED — chmod active layout read-only
# ============================================================
echo "=== Case 3: SWAP_FAILED (chmod active layout ro) ==="
C3_TMP="$(case_setup swap)"
C3_BIN="$(case_install_computer "$C3_TMP" "$PREV")" || {
  fail "case3-swap: prev install of $PREV failed"
}
if [ -n "${C3_BIN:-}" ] && [ -x "$C3_BIN" ]; then
  # Lock down the install dir so the swap-phase atomic rename fails
  # with EACCES on the parent.
  C3_INSTALL_DIR="$C3_TMP/prefix/lib/node_modules/@slock-ai"
  chmod -R a-w "$C3_INSTALL_DIR" 2>/dev/null || true
  SLOCK_HOME="$C3_TMP/slock-home" \
    "$C3_BIN" upgrade --target-version "$NEW" >"$C3_TMP/upgrade.out" 2>&1 || true
  # Restore write bit so trap cleanup can rm -rf.
  chmod -R u+w "$C3_INSTALL_DIR" 2>/dev/null || true
  assert_errorcode "case3-swap" "$C3_TMP" "UPGRADE_SWAP_FAILED" || true
fi
echo ""

# ============================================================
# Case 4: RESTART_FAILED — SKIP (needs test-seam)
# ============================================================
echo "=== Case 4: RESTART_FAILED ==="
skip "case4-restart: needs UPGRADE_RESTART_FORCE_EXIT test-seam in runUpgrade; tracked as PR2.3 follow-up"
echo ""

# ============================================================
# Case 5: NO_TARGET — install new locally, run upgrade against new
# ============================================================
echo "=== Case 5: NO_TARGET (already at target) ==="
C5_TMP="$(case_setup no-target)"
C5_BIN="$(case_install_computer "$C5_TMP" "$NEW")" || {
  fail "case5-no-target: install of $NEW failed"
}
if [ -n "${C5_BIN:-}" ] && [ -x "$C5_BIN" ]; then
  SLOCK_HOME="$C5_TMP/slock-home" \
    "$C5_BIN" upgrade --target-version "$NEW" >"$C5_TMP/upgrade.out" 2>&1 || true
  assert_errorcode "case5-no-target" "$C5_TMP" "UPGRADE_NO_TARGET" || true
fi
echo ""

# ============================================================
# Case 6: ALREADY_RUNNING — pre-hold proper-lockfile mutation lock
# ============================================================
echo "=== Case 6: ALREADY_RUNNING (pre-held mutation lock) ==="
C6_TMP="$(case_setup already-running)"
C6_BIN="$(case_install_computer "$C6_TMP" "$PREV")" || {
  fail "case6-already-running: prev install of $PREV failed"
}
if [ -n "${C6_BIN:-}" ] && [ -x "$C6_BIN" ]; then
  # proper-lockfile expects ~/.slock/computer/.lock as a fresh directory
  # with mtime within the 60s staleness window. Create it + touch to
  # claim the lock for the duration of the upgrade attempt.
  LOCK_DIR="$C6_TMP/slock-home/computer/.lock"
  mkdir -p "$LOCK_DIR"
  touch "$LOCK_DIR"
  SLOCK_HOME="$C6_TMP/slock-home" \
    "$C6_BIN" upgrade --target-version "$NEW" >"$C6_TMP/upgrade.out" 2>&1 || true
  assert_errorcode "case6-already-running" "$C6_TMP" "UPGRADE_ALREADY_RUNNING" || true
fi
echo ""

# ============================================================
# Failure artifact emission (GH-Actions-friendly)
# ============================================================
if [ "$FAIL" -gt 0 ]; then
  ARTIFACT_DIR="${UPGRADE_CONTRACT_ARTIFACT_DIR:-$TMP_ROOT/_artifacts}"
  mkdir -p "$ARTIFACT_DIR"
  for cid in "${FAILED_CASES[@]}"; do
    # Find the case dir whose basename starts with the case id slug
    # (set_setup produces e.g. network-AbC, swap-XyZ, ...).
    case "$cid" in
      case1-network)        slug="network" ;;
      case3-swap)           slug="swap" ;;
      case5-no-target)      slug="no-target" ;;
      case6-already-running) slug="already-running" ;;
      *)                    slug="" ;;
    esac
    if [ -n "$slug" ]; then
      for d in "$TMP_ROOT"/${slug}-*; do
        [ -d "$d" ] || continue
        out="$ARTIFACT_DIR/${cid}.tar.gz"
        (cd "$TMP_ROOT" && tar czf "$out" "$(basename "$d")") || true
        echo "::notice file=$out::Failure artifact for $cid"
      done
    fi
  done
  # Emit a stable path that GH Actions actions/upload-artifact can pick up.
  echo "ARTIFACT_DIR=$ARTIFACT_DIR"
fi

echo ""
echo "=== SUMMARY ==="
echo "PASS: $PASS"
echo "FAIL: $FAIL"
echo "SKIP: $SKIP (tracked as PR2.x follow-ups; see script header)"

[ "$FAIL" -eq 0 ]
