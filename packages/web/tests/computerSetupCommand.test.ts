import assert from "node:assert/strict";
import test from "node:test";

import { getComputerSetupCommand, STAGING_COMPUTER_SERVER_URL } from "../src/utils/computerSetupCommand";

test("Computer setup command omits server-url outside staging", () => {
  assert.equal(
    getComputerSetupCommand("botiverse", "production"),
    "npx @slock-ai/computer@latest setup /botiverse",
  );
});

test("Computer setup command includes staging server-url on staging", () => {
  assert.equal(
    getComputerSetupCommand("botiverse", "staging"),
    `npx @slock-ai/computer@latest setup /botiverse --server-url ${STAGING_COMPUTER_SERVER_URL}`,
  );
});

test("Computer setup command adopts the legacy daemon key when generated from a daemon command", () => {
  assert.equal(
    getComputerSetupCommand("botiverse", "production", undefined, { legacyApiKey: "sk_machine_test" }),
    "npx @slock-ai/computer@latest setup /botiverse --adopt-legacy --legacy-api-key sk_machine_test",
  );
});

test("Computer setup command is hidden outside botiverse except local slockdev", () => {
  assert.equal(getComputerSetupCommand("other-server", "production"), null);
  assert.equal(getComputerSetupCommand("/other-server", "staging"), null);
});

test("Computer setup command includes local server-url on slockdev", () => {
  assert.equal(
    getComputerSetupCommand("dev", "slockdev", "http://localhost:13036"),
    "npx @slock-ai/computer@latest setup /dev --server-url http://localhost:13036",
  );
});
