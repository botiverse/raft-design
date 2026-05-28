// Canonical server info formatting for agent-facing output.
// Must match the MCP chat-bridge's list_server output exactly —
// this is an AX contract, not an implementation detail.

interface ChannelInfo {
  name: string;
  joined: boolean;
  type?: string | null;
  description?: string | null;
}

interface MemberAgentInfo {
  name: string;
  status: string;
  description?: string | null;
}

interface AgentInfo {
  name: string;
  status: string;
  description?: string | null;
}

interface MemberHumanInfo {
  name: string;
  role?: "owner" | "admin" | "member" | string | null;
  description?: string | null;
}

interface HumanInfo {
  name: string;
  description?: string | null;
}

interface RuntimeContextInfo {
  agentId?: string | null;
  serverId?: string | null;
  machineId?: string | null;
  machineName?: string | null;
  machineHostname?: string | null;
  machineOs?: string | null;
  daemonVersion?: string | null;
  workspacePath?: string | null;
}

interface ChannelMembersData {
  channel?: { ref?: string; type?: string };
  agents?: MemberAgentInfo[];
  humans?: MemberHumanInfo[];
}

interface ServerData {
  runtimeContext?: RuntimeContextInfo | null;
  channels?: ChannelInfo[];
  agents?: AgentInfo[];
  humans?: HumanInfo[];
}

function formatRuntimeContext(ctx?: RuntimeContextInfo | null): string {
  if (!ctx) return "";

  const lines: string[] = [
    "### Current Runtime",
    "Authoritative context for this agent process. Do not infer computer identity from hostname or cwd when this section is present.",
  ];
  if (ctx.agentId) lines.push(`- Agent ID: ${ctx.agentId}`);
  if (ctx.serverId) lines.push(`- Server ID: ${ctx.serverId}`);
  if (ctx.machineName || ctx.machineId) {
    const label = ctx.machineName && ctx.machineId
      ? `${ctx.machineName} (${ctx.machineId})`
      : ctx.machineName || ctx.machineId;
    lines.push(`- Computer: ${label}`);
  }
  if (ctx.machineHostname) lines.push(`- Hostname: ${ctx.machineHostname}`);
  if (ctx.machineOs) lines.push(`- OS: ${ctx.machineOs}`);
  if (ctx.daemonVersion) lines.push(`- Daemon: v${ctx.daemonVersion}`);
  if (ctx.workspacePath) lines.push(`- Workspace: ${ctx.workspacePath}`);

  return lines.length > 2 ? `${lines.join("\n")}\n\n` : "";
}

export function formatServerInfo(data: ServerData): string {
  let text = "## Server\n\n";
  const channels = data.channels ?? [];
  const agents = data.agents ?? [];
  const humans = data.humans ?? [];

  text += formatRuntimeContext(data.runtimeContext);

  text += "### Channels\n";
  text += 'Visible public channels may appear even when `joined=false`. Private channels are shown only when you are a member; do not disclose private-channel names, membership, or content outside that channel. Use `slock message read --channel "#name"` to inspect visible channels. When a public channel is not joined, you can join it with `slock channel join --target "#name"` before sending messages or receiving ordinary channel delivery. Private channels require a human with access to add you. To leave a channel you have joined, use `slock channel leave --target "#name"`. To stop following a thread, use `slock thread unfollow --target "#name:shortid"`.\n';
  if (channels.length > 0) {
    for (const t of channels) {
      const visibility = t.type === "private" ? "private" : "public";
      const status = `${visibility}, ${t.joined ? "joined" : "not joined"}`;
      text += t.description
        ? `  - #${t.name} [${status}] — ${t.description}\n`
        : `  - #${t.name} [${status}]\n`;
    }
  } else {
    text += "  (none)\n";
  }

  text += "\n### Agents\n";
  text += "Other AI agents in this server.\n";
  if (agents.length > 0) {
    for (const a of agents) {
      text += a.description
        ? `  - @${a.name} (${a.status}) — ${a.description}\n`
        : `  - @${a.name} (${a.status})\n`;
    }
  } else {
    text += "  (none)\n";
  }

  text += "\n### Humans\n";
  text += "To start a new DM: slock message send --target \"dm:@name\" <<'SLOCKMSG' followed by the message body and SLOCKMSG. To reply in an existing DM: reuse the target from received messages.\n";
  if (humans.length > 0) {
    for (const u of humans) {
      text += u.description ? `  - @${u.name} — ${u.description}\n` : `  - @${u.name}\n`;
    }
  } else {
    text += "  (none)\n";
  }

  return text;
}


export function formatChannelMembers(data: ChannelMembersData): string {
  let text = "## Channel Members\n\n";
  const ref = data.channel?.ref ?? "(unknown)";
  const type = data.channel?.type ? ` (${data.channel.type})` : "";
  const agents = data.agents ?? [];
  const humans = data.humans ?? [];

  text += `Channel: ${ref}${type}\n`;
  text += "Members means join/post authority for this surface.\n\n";

  text += "### Agents\n";
  if (agents.length > 0) {
    for (const a of agents) {
      text += a.description
        ? `  - @${a.name} (${a.status}) — ${a.description}\n`
        : `  - @${a.name} (${a.status})\n`;
    }
  } else {
    text += "  (none)\n";
  }

  text += "\n### Humans\n";
  text += "Role labels show server-level owner/admin authority; no role label means ordinary member.\n";
  if (humans.length > 0) {
    for (const u of humans) {
      const role = u.role && u.role !== "member" ? ` (${u.role})` : "";
      text += u.description ? `  - @${u.name}${role} — ${u.description}\n` : `  - @${u.name}${role}\n`;
    }
  } else {
    text += "  (none)\n";
  }

  return text;
}
