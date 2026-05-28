export type ElectronInstallInspection =
  | {
      ok: true;
      pathFile: string;
      executablePath: string;
      relativeExecutablePath: string;
    }
  | {
      ok: false;
      problem: "missing-path-file" | "empty-path-file";
      pathFile: string;
    }
  | {
      ok: false;
      problem: "missing-binary";
      pathFile: string;
      executablePath: string;
      relativeExecutablePath: string;
    };

export function inspectElectronInstall(
  electronPackageDir: string,
  options?: {
    existsSync?: (targetPath: string) => boolean;
    readFileSync?: (targetPath: string, encoding: string) => string;
  },
): ElectronInstallInspection;

export function buildElectronInstallError(
  inspection: ElectronInstallInspection,
  options?: {
    rebuildCommand?: string;
    reinstallCommand?: string;
    retryCommand?: string;
  },
): string;
