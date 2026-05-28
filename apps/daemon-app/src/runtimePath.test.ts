import test from "node:test";
import assert from "node:assert/strict";
import { getServerRuntimeDirectoryPath, getWorkspaceDirectoryPath } from "./runtimePath";

test("getServerRuntimeDirectoryPath builds a unix-style runtime path", () => {
  assert.equal(getServerRuntimeDirectoryPath("/tmp/daemon-app", "server-123"), "/tmp/daemon-app/runtime/server-123");
});

test("getServerRuntimeDirectoryPath builds a windows-style runtime path", () => {
  assert.equal(
    getServerRuntimeDirectoryPath("C:\\Users\\dayu\\AppData\\Roaming\\Slock Daemon", "server-123"),
    "C:\\Users\\dayu\\AppData\\Roaming\\Slock Daemon\\runtime\\server-123",
  );
});

test("getServerRuntimeDirectoryPath ignores trailing separators in the userData path", () => {
  assert.equal(getServerRuntimeDirectoryPath("/tmp/daemon-app/", "server-123"), "/tmp/daemon-app/runtime/server-123");
});

test("getWorkspaceDirectoryPath nests the workspace inside the server runtime directory", () => {
  assert.equal(
    getWorkspaceDirectoryPath("/tmp/daemon-app", "server-123", "workspace-456"),
    "/tmp/daemon-app/runtime/server-123/workspace-456",
  );
});
