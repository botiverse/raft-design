function trimTrailingSeparators(value: string): string {
  return value.replace(/[\\/]+$/, "");
}

export function getServerRuntimeDirectoryPath(userDataPath: string, serverId: string): string {
  const normalizedUserDataPath = trimTrailingSeparators(userDataPath);
  const separator = normalizedUserDataPath.includes("\\") ? "\\" : "/";
  return `${normalizedUserDataPath}${separator}runtime${separator}${serverId}`;
}

export function getWorkspaceDirectoryPath(userDataPath: string, serverId: string, directoryName: string): string {
  const runtimeDirectoryPath = getServerRuntimeDirectoryPath(userDataPath, serverId);
  const separator = runtimeDirectoryPath.includes("\\") ? "\\" : "/";
  return `${runtimeDirectoryPath}${separator}${directoryName}`;
}
