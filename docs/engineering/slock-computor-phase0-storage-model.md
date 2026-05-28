# slock-computor Phase 0 — Storage Model

**Status:** Locked (2026-05-10 contract freeze)  
**Date:** 2026-05-10  
**Design thread:** #proj-daemon:9c76657a  
**Implementation thread:** #wg-slock-computer:fca8183d

## Overview

This document defines the SLOCK_HOME storage model for Phase 0 (current daemon + near-term slock-computor). It establishes what SLOCK_HOME is, what it contains, and what it is NOT.

## SLOCK_HOME Definition

**SLOCK_HOME is the Slock user-data root** — an app-level data directory, analogous to:
- Chrome: `~/Library/Application Support/Google/Chrome/` (user data dir)
- VS Code: `~/Library/Application Support/Code/`
- Docker: `~/.docker/`

### What SLOCK_HOME is NOT

- **NOT a profile root**: Profiles (if/when implemented) will be a reference layer inside SLOCK_HOME, not SLOCK_HOME itself
- **NOT bound to a single account**: Multiple human accounts may use the same SLOCK_HOME (future multi-account support)
- **NOT bound to a single machine**: The same SLOCK_HOME may be referenced by multiple machine instances (though Phase 0 does not support this)
- **NOT bound to a single server**: Agents may attach to multiple servers from the same SLOCK_HOME

**Chrome analogy**: SLOCK_HOME corresponds to Chrome's user data directory (`~/Library/Application Support/Google/Chrome/`). Profiles are subdirectories within it (`Profile 1/`, `Profile 2/`), not the user data directory itself.

## Phase 0 Storage Layout

```
SLOCK_HOME/
  agents/
    <agent-id>/              # Agent workspace (persistent across sessions)
      MEMORY.md              # Agent memory index
      notes/                 # Agent knowledge files
      <work-files>           # Code checkouts, artifacts, etc.
  
  machines/
    machine-<fingerprint>/   # Legacy daemon runtime state
      daemon.lock            # Process lock
      traces/                # Local trace files
  
  attachments/
    <attachment-files>       # Local attachment cache
```

### Canonical Stores

Phase 0 defines three canonical stores:

1. **`agents/<agent-id>/`** — Agent workspace
   - Long-term work assets (MEMORY.md, notes/, code checkouts)
   - Does NOT move when switching human accounts or machines
   - Owned by the agent, not by any human or machine

2. **`machines/<local-bucket-key>/`** — Machine runtime state
   - Current implementation: `machine-<apiKeyFingerprint前16位>/`
   - Contains daemon.lock, traces/
   - Local filesystem index, NOT the server-side machine UUID
   - See "machines/ Directory Naming" section below

3. **`attachments/`** — Local attachment cache
   - Shared across all agents and machines in this SLOCK_HOME
   - Profile-scope semantics left open for future design

### Non-Contract Artifacts

These directories may exist but are NOT part of the Phase 0 contract:
- `reviews/` — Temporary review artifacts
- `logs/` — Daemon logs
- `pm2/` — Process manager state
- Other tool-specific directories

## machines/ Directory Naming

### Current State (Phase 0)

Legacy daemon uses `machines/machine-<apiKeyFingerprint前16位>/` as the local bucket key.

**Why fingerprint instead of server machine UUID?**
- **Bootstrap ordering**: Daemon needs a stable local bucket for daemon.lock and traces BEFORE completing server handshake
- Server machine UUID is only available after authentication succeeds
- API key fingerprint is locally available immediately

### Future Direction (Non-Normative)

With a future OAuth-based auth flow (e.g. slock-computor), bootstrap ordering would be resolved — the machine UUID would be available before local directory creation. The exact directory naming, migration strategy, and coexistence model for old vs new daemon are **deferred to Phase 1 UX doc** and are not commitments of this Phase 0 contract.

Design intent (subject to Phase 1 decisions):
- New computor would likely use a separate top-level directory (e.g. `computers/`) rather than reusing `machines/`
- Old daemon continues using `machines/` undisturbed
- No directory rename or data migration required

## Future: profiles/ Reference Layer

Phase 0 does NOT implement profiles. This section describes the future design direction.

### Profile as Reference Layer

When multi-profile support is added, `profiles/<id>/` will be a **reference/control layer**:
- Stores pointers to underlying resources (agents, machines, attachments)
- Stores auth state (active human, session tokens)
- **Does NOT own** the underlying directories

Example profile structure (future):
```json
{
  "profileId": "prof_abc123",
  "activeHuman": "usr_xyz789",
  "machineRefs": [
    {
      "serverMachineId": "mach_uuid_from_server",
      "localMachineStateKey": "machine-0a3947bc"
    }
  ],
  "agentRefs": [
    "agt_agent1_uuid",
    "agt_agent2_uuid"
  ]
}
```

### Why Profiles Don't Own Directories

- **Agent workspace portability**: `agents/<agent-id>/` should not move when switching profiles
- **Machine state independence**: `machines/` or `computers/` directories are runtime state, not profile-owned assets
- **Attachment sharing**: Attachments may be shared across profiles (cache efficiency)

## Implementation Notes

### SLOCK_HOME Inheritance

- SLOCK_HOME is set by the parent process (shell, launcher, or explicit env var)
- Child processes (agents, runtime drivers) inherit SLOCK_HOME from their parent
- **Contract**: Child processes MUST NOT override SLOCK_HOME via `spawnEnv` or similar mechanisms
- See PR #1500 for enforcement details

### Directory Creation

- `agents/<agent-id>/` created on first agent spawn
- `machines/<key>/` created on daemon startup
- `attachments/` created on first attachment download
- Future directories (`profiles/`, etc.) reserved for future implementation

### Cleanup Policy

- Agent workspaces persist indefinitely (user must manually delete)
- Machine state persists until machine is detached or daemon is uninstalled
- Attachments follow cache eviction policy (TBD)

## Open Questions

None. This document reflects the locked Phase 0 contract as of 2026-05-10.

## References

- Design thread: #proj-daemon:9c76657a
- Implementation thread: #wg-slock-computer:fca8183d
- PR #1500: SLOCK_HOME hard contract enforcement (staging hotfix, separate PR)
- Chrome user data directory: <https://chromium.googlesource.com/chromium/src/+/master/docs/user_data_dir.md>
