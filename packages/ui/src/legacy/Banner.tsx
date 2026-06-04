import { AlertTriangle, CheckCircle2, CircleAlert, Info } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

export type BannerIntent = "destructive" | "warning" | "info" | "success";
export type BannerDensity = "sm" | "md" | "lg";

const INTENT_SURFACE: Record<BannerIntent, string> = {
  destructive: "bg-brutal-red/20",
  warning: "bg-brutal-orange/20",
  info: "bg-brutal-yellow/30",
  success: "bg-brutal-lime/20",
};

const INTENT_DEFAULT_ICON: Record<BannerIntent, ReactNode> = {
  destructive: <AlertTriangle size={18} className="mt-0.5 shrink-0 text-black" />,
  warning: <CircleAlert size={18} className="mt-0.5 shrink-0 text-black" />,
  info: <Info size={18} className="mt-0.5 shrink-0 text-black" />,
  success: <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-black" />,
};

const DENSITY_PADDING: Record<BannerDensity, string> = {
  sm: "p-2",
  md: "p-3",
  lg: "p-4 shadow-brutal-sm",
};

const DENSITY_TEXT: Record<BannerDensity, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
};

const DENSITY_GAP: Record<BannerDensity, string> = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-3",
};

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  intent: BannerIntent;
  density?: BannerDensity;
  title?: ReactNode;
  children?: ReactNode;
  withIcon?: boolean;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function Banner({
  intent,
  density = "md",
  title,
  children,
  icon,
  withIcon = false,
  actions,
  className = "",
  ...rest
}: BannerProps) {
  const resolvedIcon = icon !== undefined ? icon : withIcon ? INTENT_DEFAULT_ICON[intent] : null;
  return (
    <div
      {...rest}
      className={`flex items-start ${DENSITY_GAP[density]} border-2 border-black ${INTENT_SURFACE[intent]} ${DENSITY_PADDING[density]} ${className}`}
    >
      {resolvedIcon}
      <div className={`min-w-0 flex-1 ${DENSITY_TEXT[density]} text-black`}>
        {title && <div className="mb-0.5 font-bold">{title}</div>}
        {children}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
