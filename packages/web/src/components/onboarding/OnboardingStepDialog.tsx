import type { ReactNode } from "react";
import type { OnboardingWizardStepId } from "../../utils/onboardingWizard";
import Modal from "../Modal";
import Banner from "../ui/Banner";

export interface OnboardingStepDialogProps {
  step: OnboardingWizardStepId;
  title: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
  centerIntro?: boolean;
  introChildren?: ReactNode;
  error?: ReactNode;
  footer: ReactNode;
  children?: ReactNode;
  onClose: () => void;
}

export default function OnboardingStepDialog({
  step,
  title,
  eyebrow = "MEET SLOCK",
  icon,
  description,
  centerIntro = false,
  introChildren,
  error,
  footer,
  children,
  onClose,
}: OnboardingStepDialogProps) {
  const showIntro = !!icon || !!description || !!introChildren;

  return (
    <Modal onClose={onClose} layer={1}>
      <div
        className="w-full max-w-lg card-brutal bg-white p-6"
        data-testid="onboarding-wizard-modal"
        data-step={step}
      >
        <OnboardingStepHeader eyebrow={eyebrow} title={title} />

        {showIntro && (
          <OnboardingStepIntro
            icon={icon}
            description={description}
            centerIntro={centerIntro}
          >
            {introChildren}
          </OnboardingStepIntro>
        )}

        {error && (
          <Banner intent="warning" density="sm" className="mb-4 font-bold">
            {error}
          </Banner>
        )}

        {children}
        {footer}
      </div>
    </Modal>
  );
}

function OnboardingStepHeader({
  eyebrow,
  title,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="min-w-0">
        <div className="mb-1 font-mono text-[11px] font-bold uppercase tracking-widest text-black/50">
          {eyebrow}
        </div>
        <h2 className="text-lg font-bold uppercase">{title}</h2>
      </div>
    </div>
  );
}

function OnboardingStepIntro({
  icon,
  description,
  centerIntro,
  children,
}: {
  icon?: ReactNode;
  description?: ReactNode;
  centerIntro: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`mb-5 flex gap-3 ${
        centerIntro ? "items-center" : "items-start"
      }`}
    >
      {icon && (
        <div
          className={`flex size-7 shrink-0 items-center justify-center border-2 border-black bg-brutal-yellow ${
            centerIntro ? "" : "mt-0.5"
          }`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 space-y-2">
        {description && (
          <p className="text-sm leading-relaxed text-black/70">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
