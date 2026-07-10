import { ComposerRoot, type ComposerRootProps } from "./composer-root";

/** @deprecated Use ComposerRootProps. */
export type ComposerStackProps = ComposerRootProps;

/** @deprecated Use ComposerRoot. */
export function ComposerStack(props: ComposerStackProps) {
  return <ComposerRoot data-slot="composer-stack" {...props} />;
}
