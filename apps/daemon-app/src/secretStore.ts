import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface SecretStorageAdapter {
  isEncryptionAvailable(): boolean;
  encryptString(value: string): Buffer;
  decryptString(value: Buffer): string;
}

export interface StoredUserSession {
  accessToken: string;
  refreshToken: string;
}

interface SecretFileShape {
  machineApiKeys?: Record<string, string>;
  providerApiKeys?: Record<string, string>;
  userSessions?: Record<string, string>;
}

export class DaemonAppSecretStore {
  private writeChain: Promise<void> = Promise.resolve();

  constructor(
    private readonly filePath: string,
    private readonly storage: SecretStorageAdapter,
  ) {}

  async hasMachineApiKey(serverId: string): Promise<boolean> {
    const secrets = await this.readSecrets();
    return Boolean(secrets.machineApiKeys?.[serverId]);
  }

  async getMachineApiKey(serverId: string): Promise<string | null> {
    const secrets = await this.readSecrets();
    const encoded = secrets.machineApiKeys?.[serverId];
    if (!encoded) {
      return null;
    }
    return this.storage.decryptString(Buffer.from(encoded, "base64"));
  }

  async setMachineApiKey(serverId: string, apiKey: string): Promise<void> {
    if (!this.storage.isEncryptionAvailable()) {
      throw new Error("Local secret encryption is not available on this machine.");
    }
    return this.serializeWrite(async () => {
      const secrets = await this.readSecrets();
      const encoded = this.storage.encryptString(apiKey).toString("base64");
      const next: SecretFileShape = {
        ...secrets,
        machineApiKeys: {
          ...(secrets.machineApiKeys ?? {}),
          [serverId]: encoded,
        },
      };
      await this.writeSecrets(next);
    });
  }

  async clearMachineApiKey(serverId: string): Promise<void> {
    return this.serializeWrite(async () => {
      const secrets = await this.readSecrets();
      if (!secrets.machineApiKeys?.[serverId]) {
        return;
      }

      const nextKeys = { ...secrets.machineApiKeys };
      delete nextKeys[serverId];
      await this.writeSecrets({
        ...secrets,
        machineApiKeys: nextKeys,
      });
    });
  }

  async hasProviderApiKey(providerId: string): Promise<boolean> {
    const secrets = await this.readSecrets();
    return Boolean(secrets.providerApiKeys?.[providerId]);
  }

  async getProviderApiKey(providerId: string): Promise<string | null> {
    const secrets = await this.readSecrets();
    const encoded = secrets.providerApiKeys?.[providerId];
    if (!encoded) {
      return null;
    }
    return this.storage.decryptString(Buffer.from(encoded, "base64"));
  }

  async setProviderApiKey(providerId: string, apiKey: string): Promise<void> {
    if (!this.storage.isEncryptionAvailable()) {
      throw new Error("Local secret encryption is not available on this machine.");
    }
    return this.serializeWrite(async () => {
      const secrets = await this.readSecrets();
      const encoded = this.storage.encryptString(apiKey).toString("base64");
      const next: SecretFileShape = {
        ...secrets,
        providerApiKeys: {
          ...(secrets.providerApiKeys ?? {}),
          [providerId]: encoded,
        },
      };
      await this.writeSecrets(next);
    });
  }

  async clearProviderApiKey(providerId: string): Promise<void> {
    return this.serializeWrite(async () => {
      const secrets = await this.readSecrets();
      if (!secrets.providerApiKeys?.[providerId]) {
        return;
      }

      const nextKeys = { ...secrets.providerApiKeys };
      delete nextKeys[providerId];
      await this.writeSecrets({
        ...secrets,
        providerApiKeys: nextKeys,
      });
    });
  }

  async getUserSession(serverId: string): Promise<StoredUserSession | null> {
    const secrets = await this.readSecrets();
    const encoded = secrets.userSessions?.[serverId];
    if (!encoded) {
      return null;
    }

    const decoded = this.storage.decryptString(Buffer.from(encoded, "base64"));
    const parsed = JSON.parse(decoded) as Partial<StoredUserSession>;
    if (!parsed.accessToken || !parsed.refreshToken) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    };
  }

  async setUserSession(serverId: string, session: StoredUserSession): Promise<void> {
    if (!this.storage.isEncryptionAvailable()) {
      throw new Error("Local secret encryption is not available on this machine.");
    }
    return this.serializeWrite(async () => {
      const secrets = await this.readSecrets();
      const encoded = this.storage.encryptString(JSON.stringify(session)).toString("base64");
      const next: SecretFileShape = {
        ...secrets,
        userSessions: {
          ...(secrets.userSessions ?? {}),
          [serverId]: encoded,
        },
      };
      await this.writeSecrets(next);
    });
  }

  async clearUserSession(serverId: string): Promise<void> {
    return this.serializeWrite(async () => {
      const secrets = await this.readSecrets();
      if (!secrets.userSessions?.[serverId]) {
        return;
      }

      const nextSessions = { ...secrets.userSessions };
      delete nextSessions[serverId];
      await this.writeSecrets({
        ...secrets,
        userSessions: nextSessions,
      });
    });
  }

  getFilePath(): string {
    return this.filePath;
  }

  private async readSecrets(): Promise<SecretFileShape> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as SecretFileShape;
    } catch {
      return {};
    }
  }

  private async writeSecrets(secrets: SecretFileShape): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(secrets, null, 2)}\n`, "utf-8");
  }

  private async serializeWrite(writer: () => Promise<void>): Promise<void> {
    const writePromise = this.writeChain.then(writer);
    this.writeChain = writePromise.then(
      () => undefined,
      () => undefined,
    );
    await writePromise;
  }
}
