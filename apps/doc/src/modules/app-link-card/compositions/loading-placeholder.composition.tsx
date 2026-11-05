import {
  AppLinkCardHeader,
  AppLinkCardHost,
  AppLinkCardIcon,
  AppLinkCardName,
  AppLinkCardPlaceholder,
} from "@botiverse/raft-ui/wip";

export function AppLinkCardLoadingPlaceholderComposition() {
  return (
    <div className="flex w-full justify-center p-6">
      <AppLinkCardPlaceholder>
        <AppLinkCardHeader>
          <AppLinkCardIcon>
            <img src="/app-icons/stamp.svg" alt="" />
          </AppLinkCardIcon>
          <AppLinkCardName>Stamp</AppLinkCardName>
          <AppLinkCardHost>stamp.build</AppLinkCardHost>
        </AppLinkCardHeader>
      </AppLinkCardPlaceholder>
    </div>
  );
}
