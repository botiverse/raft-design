---
title: Raft Chat — Onboarding
summary: The first-run setup of a workspace — a blocking dialog of five steps, from connecting a computer to handing over to the first agent.
---

# Raft Chat — Onboarding

Until a new workspace has a computer and its first agent, the app shows its setup as a dialog over the workspace, with a scrim. The dialog can't be dismissed: Esc doesn't close it and it has no ×. The native apps show the same steps as a full page instead.

## Structure

The steps, in order:

1. **Connect a computer** (960px wide): what a computer is, the command to run, and a log that follows the connection. When the workspace already has computers that are offline, the step becomes Start your computer, with the command that brings one back.
2. **Create the first agent** ("Meet Cindy"), with the same form as Create Agent.
3. **Tell the agent about you**: a short survey of option grids.
4. **Choose your display style**.
5. **The handoff**: the agent takes it from here.

Steps 3 to 5 share one frame, 720px wide and about 520px high, so the dialog doesn't change size between them. Every step has:

- **A header**: the step label "Set up your server" in Space Mono, the title in `text-title` and one line of explanation.
- **A body** that scrolls inside the frame.
- **A footer** with muted text links on the left (Switch server, and on the first two steps Server settings) and the pink button on the right (Next, Continue, Let's Go). On a narrow screen the pink button spans the width.

```example
dialog/compositions/server-setup-step
```

## Rules

- Use the brand only on the handoff step: the agent's 99px avatar hops once, and two square marks pop beside it and fade. The other steps are plain dialogs on paper.
- Don't add a Skip button or step dots. The way out of setup is Switch server.
- Write the step label in sentence case, like every other label ([0002](../../decisions/0002-no-all-caps.md)).
