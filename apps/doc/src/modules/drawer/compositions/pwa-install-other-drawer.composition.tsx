import {
  PwaInstallDrawerComposition,
  type PwaInstallDrawerCompositionProps,
} from "./pwa-install-drawer-base.tsx";

export type PwaInstallOtherDrawerCompositionProps = Omit<
  PwaInstallDrawerCompositionProps,
  "variant"
>;

export function PwaInstallOtherDrawerComposition(props: PwaInstallOtherDrawerCompositionProps) {
  return <PwaInstallDrawerComposition variant="other" {...props} />;
}
