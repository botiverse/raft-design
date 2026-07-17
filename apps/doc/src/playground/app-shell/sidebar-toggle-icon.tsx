import type { ComponentProps } from "react";

type SidebarToggleIconProps = ComponentProps<"svg">;

export function SidebarCollapseIcon(props: SidebarToggleIconProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M10 3v18" />
      <path d="m16 9-3 3 3 3" />
    </svg>
  );
}

export function SidebarExpandIcon(props: SidebarToggleIconProps) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M10 3v18" />
      <path d="m13 9 3 3-3 3" />
    </svg>
  );
}
