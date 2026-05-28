import { WebSocketServer, type WebSocket } from "ws";
import type http from "node:http";
import { URL } from "node:url";
import { findMachineByApiKey, getMachine } from "../services/machineService.js";
import {
  findComputerByApiKey,
  isComputerApiKey,
} from "../services/computerCredentialService.js";
import { getServer } from "../services/serverService.js";
import type { AgentOrchestrator } from "../services/agentOrchestrator.js";
import type { MachineToServerMessage } from "@slock-ai/shared";

/**
 * Setup WebSocket endpoint for machine connections: ws://server/daemon/connect?key=<api_key>
 * Route path kept as /daemon/connect for backward compatibility with existing daemon processes.
 * Accepts both sk_daemon_ and sk_machine_ API key prefixes.
 */
export function setupMachineWebSocket(server: http.Server, orchestrator: AgentOrchestrator) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    try {
      const url = new URL(request.url || "", `http://${request.headers.host}`);

      if (url.pathname !== "/daemon/connect") {
        // Not a machine connection — let Socket.io handle it
        return;
      }

      const apiKey = url.searchParams.get("key");
      // task #30 PR-F — a Computer connects with its sk_computer_*; it is
      // resolved to the `machines` row it was linked to at attach time
      // (computers.machineId) and handed to the SAME WS/orchestrator path
      // as a normal machine. No orchestrator change. sk_daemon_/sk_machine_
      // keep the existing direct-machine path.
      const isComputer = !!apiKey && isComputerApiKey(apiKey);
      if (
        !apiKey ||
        (!apiKey.startsWith("sk_daemon_") && !apiKey.startsWith("sk_machine_") && !isComputer)
      ) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      // Find machine by API key (prefix-indexed O(1) lookup), or — for a
      // Computer principal — resolve Computer → its linked machine row.
      let matchedMachine:
        | { id: string; serverId: string; legacyKeyMigratedAt?: Date | null }
        | null = null;
      let legacyKeyMigratedAt: Date | null = null;
      if (isComputer) {
        const computer = await findComputerByApiKey(apiKey);
        if (computer?.machineId) {
          matchedMachine = await getMachine(computer.machineId);
        }
      } else {
        const machine = await findMachineByApiKey(apiKey);
        if (machine) {
          matchedMachine = machine;
          legacyKeyMigratedAt =
            "legacyKeyMigratedAt" in machine ? machine.legacyKeyMigratedAt ?? null : null;
        }
      }

      if (!matchedMachine) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      // RFC v8.2 §5.11.3: a legacy sk_machine_*/sk_daemon_* key that has
      // already been migrated to a Computer attachment must be refused on
      // /daemon/connect — the daemon process holding the old key keeps
      // retrying and that retry must surface a stable close so the operator
      // notices. Using WS-spec close code 4409 (private-range application
      // close) to signal `legacy_machine_key_migrated`; the HTTP upgrade
      // pre-handshake is rejected with 401 + Slock-Reason so older clients
      // still see a clear failure reason.
      if (!isComputer && legacyKeyMigratedAt) {
        socket.write(
          "HTTP/1.1 401 Unauthorized\r\nSlock-Reason: legacy_machine_key_migrated\r\n\r\n",
        );
        socket.destroy();
        return;
      }

      // Reject if the machine's server has been deleted
      const server = await getServer(matchedMachine.serverId);
      if (!server) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, matchedMachine);
      });
    } catch (err) {
      console.error("Machine WebSocket upgrade error:", err);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  });

  wss.on("connection", (ws: WebSocket, machine: any) => {
    orchestrator.registerMachine(machine.id, machine.serverId, ws).catch((err) => {
      console.error(`[Machine ${machine.id}] Registration failed:`, err);
    });

    ws.on("message", (data: Buffer) => {
      try {
        const msg: MachineToServerMessage = JSON.parse(data.toString());
        orchestrator.handleMachineMessage(machine.id, msg).catch((err) => {
          console.error(`[Machine ${machine.id}] Message handling failed:`, err);
        });
      } catch (err) {
        console.error(`[Machine ${machine.id}] Invalid message:`, err);
      }
    });

    ws.on("close", (code, reasonBuffer) => {
      orchestrator.handleMachineDisconnect(machine.id, ws, {
        cause: "socket_close",
        closeCode: code,
        closeReason: reasonBuffer.toString("utf8"),
      }).catch((err) => {
        console.error(`[Machine ${machine.id}] Disconnect handling failed:`, err);
      });
    });

    ws.on("error", (err: Error) => {
      console.error(`[Machine ${machine.id}] WebSocket error:`, err);
      orchestrator.handleMachineDisconnect(machine.id, ws, {
        cause: "socket_error",
        errorMessage: err.message,
      }).catch((err2) => {
        console.error(`[Machine ${machine.id}] Disconnect handling failed:`, err2);
      });
    });
  });

  return wss;
}
