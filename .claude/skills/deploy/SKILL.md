---
name: deploy
description: Deploy staging branch to production by fast-forward merging into main and pushing. Use when the user says "deploy", "发布", "上线", or wants to ship staging to production.
disable-model-invocation: true
user-invocable: true
allowed-tools: Bash
---

# Deploy Staging to Production

Fast-forward merge `staging` into `main` and push. This triggers a production deploy since main auto-deploys.

## Steps

1. **Pre-flight checks:**
   - Run `git status` — abort if there are uncommitted changes
   - Run `git fetch origin` to ensure we have latest remote state
   - Run `git log --oneline origin/main..origin/staging` — show the user what commits will be deployed
   - If there are no new commits, tell the user "staging is already up to date with main, nothing to deploy" and stop

2. **Confirm with the user** — list the commits and ask "确认发布这些 commit 到生产？" before proceeding. Do NOT skip this step.

3. **Merge and push:**
   - `git checkout main`
   - `git pull --ff-only origin main` (ensure local main is up to date)
   - `git merge --ff-only staging` — if this fails (not fast-forwardable), abort and explain why
   - `git push origin main`

4. **Switch back:** `git checkout staging`

5. **Report:** Tell the user the deploy is done, list the commits that were deployed, and remind them that main auto-deploys to production.

## Important

- **Never force push.** If fast-forward merge fails, stop and explain.
- **Never rebase or create merge commits.** Only `--ff-only`.
- **Always switch back to staging** when done, regardless of success or failure.
- **Keep staging branch** — do not delete it locally or remotely.
