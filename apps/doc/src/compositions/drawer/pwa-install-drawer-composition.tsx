import {
  PwaInstallDrawerComposition,
  type PwaInstallDrawerCompositionProps,
} from "./pwa-install-drawer-base.tsx";

export type PwaInstallSafariDrawerCompositionProps = Omit<
  PwaInstallDrawerCompositionProps,
  "variant"
>;

export function PwaInstallSafariDrawerComposition(props: PwaInstallSafariDrawerCompositionProps) {
  return <PwaInstallDrawerComposition variant="safari" {...props} />;
}
