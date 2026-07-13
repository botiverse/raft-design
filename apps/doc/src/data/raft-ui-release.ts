import changelogMarkdown from "../../../../packages/ui/CHANGELOG.md?raw";
import packageMetadataJson from "../../../../packages/ui/package.json?raw";

type PackageMetadata = {
  version: string;
};

const packageMetadata = JSON.parse(packageMetadataJson) as PackageMetadata;

export const raftUiChangelogMarkdown = changelogMarkdown;
export const raftUiVersion = packageMetadata.version;
