import { useCallback, useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import BottomSheet from "../ui/BottomSheet";
import {
  PWA_INSTALL_OPEN_EVENT,
  PWA_INSTALL_SESSION_DISMISSED_KEY,
  PWA_INSTALL_SESSION_COUNT_KEY,
  getCooldownState,
  getPwaInstallDisplayMode,
  getPwaInstallPlatform,
  getSessionCountBucket,
  hasPwaInstallPath,
  isPwaStandalone,
  readNumberStorage,
  recordPwaInstallEvent,
  type PwaInstallCooldownState,
  type PwaInstallPlatform,
  type PwaInstallSurface,
} from "../../utils/pwaInstall";

function isMobileViewportNow(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

function IosInstructionSheet({
  variant,
  onClose,
  onCopyLink,
}: {
  variant: "safari" | "other";
  onClose: () => void;
  onCopyLink: () => void;
}) {
  const isSafari = variant === "safari";
  return (
    <BottomSheet
      role="dialog"
      aria-modal="true"
      aria-label="Add Slock to Home Screen"
      onClose={onClose}
      className="md:hidden"
      sheetClassName="p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-black leading-tight text-black">Add Slock to your Home Screen</div>
          <div className="mt-1 text-sm text-black/60">
            {isSafari
              ? "Open Slock as a fullscreen app — faster, more focused."
              : "Open this page in Safari first, then add it to your Home Screen."}
          </div>
        </div>
        <button type="button" onClick={onClose} className="btn-brutal-sm bg-white p-1" aria-label="Close install instructions">
          <X size={16} />
        </button>
      </div>

      {isSafari ? (
        <div className="border-2 border-black bg-brutal-cream p-2">
          <img
            src="/pwa/ios-add-to-home-screen-3step.svg"
            alt="Three steps: tap Safari Share, choose Add to Home Screen, then tap Add."
            className="block w-full"
          />
        </div>
      ) : (
        <div className="border-2 border-black bg-brutal-cream p-3 text-sm text-black">
          iOS only allows Home Screen installation from Safari. Copy this page link, open Safari, then use Share → Add to Home Screen.
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!isSafari && (
          <button type="button" onClick={onCopyLink} className="btn-brutal bg-brutal-yellow px-3 py-2 text-xs">
            Copy Link
          </button>
        )}
        <button type="button" onClick={onClose} className="btn-brutal bg-white px-3 py-2 text-xs">
          {isSafari ? "Got it" : "Close"}
        </button>
      </div>
    </BottomSheet>
  );
}

export function PwaInstallSettingsCard() {
  const [platform, setPlatform] = useState<PwaInstallPlatform>("other");
  const [standalone, setStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const [cooldownState, setCooldownState] = useState<PwaInstallCooldownState>("not_dismissed");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPlatform(getPwaInstallPlatform(window.navigator.userAgent));
    setStandalone(isPwaStandalone(window));
    setIsMobile(isMobileViewportNow());
    setSessionCount(readNumberStorage(window.localStorage, PWA_INSTALL_SESSION_COUNT_KEY) ?? 1);
    setCooldownState(
      window.sessionStorage.getItem(PWA_INSTALL_SESSION_DISMISSED_KEY) === "1"
        ? "dismissed_active"
        : getCooldownState(Date.now(), null),
    );
  }, []);

  useEffect(() => {
    if (!isMobile || standalone || typeof window === "undefined") return;
    if (!hasPwaInstallPath({ platform, hasNativePrompt: false })) return;
    recordPwaInstallEvent({
      event: "pwa_install_cta_shown",
      platform,
      surface: "settings",
      trigger: "settings",
      displayMode: getPwaInstallDisplayMode(window),
      sessionCountBucket: getSessionCountBucket(sessionCount),
      cooldownState,
    });
  }, [cooldownState, isMobile, platform, sessionCount, standalone]);

  if (!isMobile || standalone || !hasPwaInstallPath({ platform, hasNativePrompt: false })) return null;

  const helpText = "Open this page in Safari, then add Slock to your Home Screen.";

  return (
    <div data-pwa-install-settings-card className="mb-6 md:hidden">
      <div className="border-2 border-black bg-white p-4 shadow-brutal-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-bold text-black">
              <Smartphone size={16} />
              Add Slock to Home Screen
            </div>
            <div className="mt-1 text-xs text-black/60">{helpText}</div>
          </div>
          <button
            type="button"
            className="btn-brutal bg-brutal-pink px-3 py-1.5 text-xs"
            onClick={() => {
              recordPwaInstallEvent({
                event: "pwa_install_cta_clicked",
                platform,
                surface: "settings",
                trigger: "settings",
                displayMode: getPwaInstallDisplayMode(window),
                sessionCountBucket: getSessionCountBucket(sessionCount),
                cooldownState,
              });
              window.dispatchEvent(new CustomEvent(PWA_INSTALL_OPEN_EVENT, { detail: { source: "settings" } }));
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PwaInstallPrompt() {
  const [platform, setPlatform] = useState<PwaInstallPlatform>("other");
  const [sessionCount, setSessionCount] = useState(1);
  const [cooldownState, setCooldownState] = useState<PwaInstallCooldownState>("not_dismissed");
  const [standalone, setStandalone] = useState(false);
  const [sheet, setSheet] = useState<null | "safari" | "other">(null);

  const track = useCallback((event: Parameters<typeof recordPwaInstallEvent>[0]["event"], surface: PwaInstallSurface, extra: Partial<Parameters<typeof recordPwaInstallEvent>[0]> = {}) => {
    if (typeof window === "undefined") return;
    recordPwaInstallEvent({
      event,
      platform,
      surface,
      trigger: extra.trigger ?? "supported_browser",
      displayMode: getPwaInstallDisplayMode(window),
      sessionCountBucket: getSessionCountBucket(sessionCount),
      cooldownState,
      ...extra,
    });
  }, [cooldownState, platform, sessionCount]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextStandalone = isPwaStandalone(window);
    setPlatform(getPwaInstallPlatform(window.navigator.userAgent));
    setSessionCount(readNumberStorage(window.localStorage, PWA_INSTALL_SESSION_COUNT_KEY) ?? 1);
    setCooldownState(window.sessionStorage.getItem(PWA_INSTALL_SESSION_DISMISSED_KEY) === "1" ? "dismissed_active" : "not_dismissed");
    setStandalone(nextStandalone);
  }, []);

  useEffect(() => {
    if (!standalone) return;
    track("pwa_install_standalone_detected", "settings");
  }, [standalone, track]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOpen = (event: Event) => {
      const source = (event as CustomEvent<{ source?: string }>).detail?.source === "settings" ? "settings" : "notification_center";
      track("pwa_install_cta_clicked", source);
      if (platform === "ios_safari") {
        setSheet("safari");
        track("pwa_install_cta_shown", "ios_instruction_sheet");
      } else {
        setSheet("other");
        track("pwa_install_cta_shown", "ios_instruction_sheet");
      }
    };
    window.addEventListener(PWA_INSTALL_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(PWA_INSTALL_OPEN_EVENT, onOpen);
  }, [platform, track]);

  const closeSheet = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(PWA_INSTALL_SESSION_DISMISSED_KEY, "1");
      setCooldownState("dismissed_active");
    }
    track("pwa_install_ios_instruction_dismissed", "ios_instruction_sheet");
    setSheet(null);
  };

  const copyLink = () => {
    if (typeof window === "undefined") return;
    void navigator.clipboard?.writeText(window.location.href);
    track("pwa_install_cta_clicked", "ios_instruction_sheet");
  };

  if (standalone) return null;

  return sheet ? <IosInstructionSheet variant={sheet} onClose={closeSheet} onCopyLink={copyLink} /> : null;
}
