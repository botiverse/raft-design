import { cn } from "./cn.mjs";
import { Dialog as Dialog$1 } from "@base-ui/react/dialog";
import { AlertTriangle, Bell, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Copy, FileText, Image, Info, Minus, Upload, X } from "lucide-react";
import { tv } from "tailwind-variants/lite";
import { Children, Fragment, cloneElement, createContext, isValidElement, use, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button as Button$1 } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
import { Drawer as Drawer$1 } from "@base-ui/react/drawer";
import { useClipboard } from "foxact/use-clipboard";
import { Checkbox as Checkbox$1 } from "@base-ui/react/checkbox";
import { ScrollArea as ScrollArea$1 } from "@base-ui/react/scroll-area";
import { Collapsible } from "@base-ui/react/collapsible";
import { Avatar as Avatar$1, ContextMenu as ContextMenu$1 } from "@base-ui/react";
import { Menu } from "@base-ui/react/menu";
import { useHotkey } from "@tanstack/react-hotkeys";
import { Tooltip as Tooltip$1 } from "@base-ui/react/tooltip";
import { Popover as Popover$1 } from "@base-ui/react/popover";
import { PreviewCard as PreviewCard$1 } from "@base-ui/react/preview-card";
import { Input as Input$1 } from "@base-ui/react/input";
import { Field as Field$1 } from "@base-ui/react/field";
import { Combobox as Combobox$1 } from "@base-ui/react/combobox";
import { Select as Select$1 } from "@base-ui/react/select";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup as RadioGroup$1 } from "@base-ui/react/radio-group";
import { Switch as Switch$1 } from "@base-ui/react/switch";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroup$1 } from "@base-ui/react/toggle-group";
import { Toolbar } from "@base-ui/react/toolbar";
import { Progress as Progress$1 } from "@base-ui/react/progress";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, pointerWithin, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, defaultAnimateLayoutChanges, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Toast } from "@base-ui/react/toast";
import { Tabs as Tabs$1 } from "@base-ui/react/tabs";
import { Separator as Separator$1 } from "@base-ui/react/separator";
import { Group, Panel as Panel$1, Separator as Separator$2 } from "react-resizable-panels";
//#region src/lib/tv.ts
const tv$1 = ((options) => {
	const recipe = tv(options);
	const wrappedRecipe = ((props) => {
		const result = recipe(props);
		if (result == null || typeof result === "string") return cn(result);
		return Object.fromEntries(Object.entries(result).map(([slotName, slot]) => [slotName, (slotProps) => cn(slot(slotProps))]));
	});
	return Object.assign(wrappedRecipe, recipe);
});
//#endregion
//#region src/lib/theme/theme-context.ts
const ThemeContext = createContext("brutal");
const ThemeStateContext = createContext({
	theme: "brutal",
	setTheme: () => void 0,
	mode: "light",
	resolvedMode: "light"
});
//#endregion
//#region src/lib/theme/use-theme.ts
/** Read the active style family for theme-aware component recipes. */
function useThemeFamily() {
	return use(ThemeContext);
}
/** Read and update the application-level RUI theme selection. */
function useTheme() {
	return use(ThemeStateContext);
}
//#endregion
//#region src/lib/theme/theme-scope.ts
function resolveThemeScopeProps({ className, "data-theme": _dataTheme, ...props }, { theme, resolvedMode }) {
	const modeClassName = theme === "elegant" ? resolvedMode : void 0;
	const resolvedClassName = typeof className === "function" && modeClassName ? (state) => cn(className(state), modeClassName) : typeof className === "string" && modeClassName ? cn(className, modeClassName) : className ?? modeClassName;
	return {
		...props,
		"data-theme": theme,
		className: resolvedClassName
	};
}
function useThemeScopeProps(props) {
	return resolveThemeScopeProps(props, useTheme());
}
//#endregion
//#region src/lib/default-native-button.ts
function defaultNativeButton(render) {
	if (!render || typeof render !== "object" || !("type" in render)) return;
	const element = render;
	if (typeof element.type === "string") return element.type === "button";
}
//#endregion
//#region src/components/spinner/spinner.tsx
const ELEGANT_SPINNER_STYLE = `
@keyframes raft-elegant-spinner-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes raft-elegant-spinner-dash {
  0% {
    stroke-dasharray: 1 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -124;
  }
}

[data-slot="spinner"] [data-spinner-ring] {
  animation: raft-elegant-spinner-spin 1600ms linear infinite;
  transform-box: fill-box;
  transform-origin: center;
  will-change: transform;
}

[data-slot="spinner"] [data-spinner-arc] {
  animation: raft-elegant-spinner-dash 1400ms cubic-bezier(0.42, 0, 0.58, 1) infinite;
  stroke-dasharray: 1 150;
  stroke-dashoffset: 0;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="spinner"] [data-spinner-ring] {
    animation-duration: 2400ms;
    will-change: auto;
  }

  [data-slot="spinner"] [data-spinner-arc] {
    animation: none;
    stroke-dasharray: 72 150;
    stroke-dashoffset: -30;
  }
}
`;
const spinner = tv$1({
	slots: {
		root: ["relative inline-flex shrink-0 items-center justify-center", "leading-none text-current"],
		ring: "block size-full shrink-0"
	},
	variants: {
		theme: {
			brutal: {},
			elegant: {}
		},
		size: {
			xs: {},
			sm: {},
			md: {},
			lg: {}
		},
		variant: {
			default: {},
			inverse: {}
		}
	},
	defaultVariants: { size: "sm" },
	compoundVariants: [
		{
			theme: "brutal",
			size: "xs",
			class: { root: "size-2.5" }
		},
		{
			theme: "brutal",
			size: "sm",
			class: { root: "size-4" }
		},
		{
			theme: "brutal",
			size: "md",
			class: { root: "size-5" }
		},
		{
			theme: "brutal",
			size: "lg",
			class: { root: "size-8" }
		},
		{
			theme: "brutal",
			variant: "default",
			class: {
				root: "text-black",
				ring: "animate-spin rounded-full border-2 border-current/20 border-t-current"
			}
		},
		{
			theme: "brutal",
			variant: "inverse",
			class: {
				root: "text-white",
				ring: "animate-spin rounded-full border-2 border-current/40 border-t-current"
			}
		},
		{
			theme: "elegant",
			size: "xs",
			class: { root: "size-3.5" }
		},
		{
			theme: "elegant",
			size: "sm",
			class: { root: "size-3.5" }
		},
		{
			theme: "elegant",
			size: "md",
			class: { root: "size-4.5" }
		},
		{
			theme: "elegant",
			size: "lg",
			class: { root: "size-4.5" }
		}
	]
});
const spinnerStyle = /* @__PURE__ */ jsx("style", {
	href: "raft-ui-spinner",
	precedence: "default",
	children: ELEGANT_SPINNER_STYLE
});
function Spinner({ size = "sm", variant = "default", className, render, ...props }) {
	const theme = useThemeFamily();
	const { root, ring } = spinner({
		theme,
		size,
		variant
	});
	const children = theme === "elegant" ? /* @__PURE__ */ jsxs(Fragment$1, { children: [spinnerStyle, /* @__PURE__ */ jsxs("svg", {
		"data-spinner-ring": "",
		"aria-hidden": "true",
		className: ring(),
		xmlns: "http://www.w3.org/2000/svg",
		fill: "none",
		viewBox: "0 0 24 24",
		children: [/* @__PURE__ */ jsx("circle", {
			className: "opacity-20",
			cx: "12",
			cy: "12",
			r: "10",
			stroke: "currentColor",
			strokeWidth: "2.5"
		}), /* @__PURE__ */ jsx("circle", {
			"data-spinner-arc": "",
			className: "opacity-80",
			cx: "12",
			cy: "12",
			r: "10",
			fill: "none",
			pathLength: "150",
			stroke: "currentColor",
			strokeLinecap: "round",
			strokeWidth: "2.5"
		})]
	})] }) : /* @__PURE__ */ jsx("span", {
		"data-spinner-ring": "",
		"aria-hidden": "true",
		className: ring()
	});
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			role: "status",
			"aria-label": "Loading",
			className: root({ className }),
			children
		}, props),
		state: {
			slot: "spinner",
			size
		}
	});
}
//#endregion
//#region src/components/button/button.tsx
const buttonVariants = tv$1({
	slots: {
		root: [
			"relative inline-flex shrink-0 items-center justify-center",
			"font-heading whitespace-nowrap select-none",
			"rounded-none",
			"shadow-raft-sm transition-all duration-100",
			"outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-transparent",
			"data-[loading=true]:cursor-wait",
			"disabled:pointer-events-none disabled:opacity-40 data-[loading=true]:opacity-100",
			"disabled:transform-none",
			"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
		],
		content: "relative z-10 inline-flex items-center justify-center gap-[inherit] data-[loading=true]:invisible",
		loadingIndicator: "pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
	},
	variants: {
		theme: {
			brutal: { root: ["border-2 font-bold"] },
			elegant: { root: [
				"overflow-clip border-0 font-sans font-medium antialiased",
				"focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--button-focus-ring,var(--primary-400))_80%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-layer-canvas-muted",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)]",
				"before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]",
				"active:scale-[0.985]"
			] }
		},
		variant: {
			primary: { root: ["border-line-strong bg-primary-400 text-primary-950", "hover:bg-primary-500"] },
			default: { root: ["border-line-strong bg-layer-panel text-foreground", "hover:bg-layer-panel"] },
			information: { root: ["border-line-strong bg-info text-foreground-inverse", "hover:bg-info"] },
			muted: { root: ["border-line-strong bg-secondary-400 text-secondary-950", "hover:bg-secondary-400"] },
			accent: { root: ["border-line-strong bg-accent-400 text-accent-950", "hover:bg-accent-500"] },
			warning: { root: ["border-line-strong bg-warning text-warning-foreground", "hover:bg-warning"] },
			outline: { root: [
				"border-line-strong bg-transparent text-foreground",
				"hover:bg-fill-muted",
				"shadow-none"
			] },
			ghost: { root: ["border-transparent bg-transparent text-foreground-strong shadow-none", "hover:border-line-strong hover:bg-fill-muted"] },
			link: { root: ["border-transparent bg-transparent text-foreground shadow-none underline-offset-4", "hover:underline"] },
			"danger-secondary": { root: ["border-line-strong bg-danger-soft text-danger", "hover:bg-danger-soft"] },
			danger: { root: ["border-line-strong bg-danger text-danger-foreground", "hover:border-danger-hover hover:bg-danger-hover"] },
			"danger-outline": { root: [
				"border-line-strong bg-transparent text-danger",
				"hover:bg-fill-muted",
				"shadow-none"
			] }
		},
		size: {
			xs: { root: [
				"h-6 gap-1 px-2 py-0 text-[11px]",
				"has-data-[icon=inline-start]:pl-1.5 has-data-[icon=inline-end]:pr-1.5",
				"**:data-icon:size-[1em]",
				"[&_svg:not([class*='size-'])]:size-3"
			] },
			sm: { root: [
				"h-7 gap-[5px] px-2.5 py-0 text-xs",
				"has-data-[icon=inline-start]:pl-2 has-data-[icon=inline-end]:pr-2",
				"**:data-icon:size-[1em]",
				"[&_svg:not([class*='size-'])]:size-3.5"
			] },
			md: { root: [
				"h-8 gap-[5.5px] px-3 py-0 text-sm",
				"has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
				"**:data-icon:size-[1em]"
			] },
			lg: { root: [
				"gap-1.5 px-3.5 py-0 text-base",
				"has-data-[icon=inline-start]:pl-3 has-data-[icon=inline-end]:pr-3",
				"**:data-icon:size-[1em]"
			] },
			"icon-xs": { root: ["size-6 p-0 text-[11px]", "[&_svg:not([class*='size-'])]:size-3"] },
			"icon-sm": { root: ["size-7 p-0 text-xs", "[&_svg:not([class*='size-'])]:size-3.5"] },
			"icon-md": { root: "size-8 p-0 text-sm" },
			"icon-lg": { root: "p-0 text-sm" }
		}
	},
	defaultVariants: {
		variant: "default",
		size: "md"
	},
	compoundVariants: [
		{
			theme: "elegant",
			size: "xs",
			class: { root: "rounded-sm" }
		},
		{
			theme: "elegant",
			size: "icon-xs",
			class: { root: "rounded-sm" }
		},
		{
			theme: "elegant",
			size: "sm",
			class: { root: "rounded-sm" }
		},
		{
			theme: "elegant",
			size: "icon-sm",
			class: { root: "rounded-sm" }
		},
		{
			theme: "elegant",
			size: "md",
			class: { root: "rounded-md" }
		},
		{
			theme: "elegant",
			size: "icon-md",
			class: { root: "rounded-md" }
		},
		{
			theme: "elegant",
			size: "lg",
			class: { root: "h-9 rounded-md" }
		},
		{
			theme: "elegant",
			size: "icon-lg",
			class: { root: "size-9 rounded-md" }
		},
		{
			theme: "elegant",
			variant: [
				"default",
				"primary",
				"outline",
				"information",
				"muted",
				"accent",
				"warning",
				"danger",
				"danger-secondary",
				"danger-outline"
			],
			class: { root: "dark:shadow-raft-xs" }
		},
		{
			theme: "elegant",
			variant: ["default", "outline"],
			class: { root: "[--button-focus-ring:var(--foreground)]" }
		},
		{
			theme: "elegant",
			variant: [
				"ghost",
				"link",
				"muted"
			],
			class: { root: "[--button-focus-ring:var(--line-hairline)]" }
		},
		{
			theme: "elegant",
			variant: [
				"danger-secondary",
				"danger",
				"danger-outline"
			],
			class: { root: "[--button-focus-ring:var(--danger)]" }
		},
		{
			theme: "brutal",
			variant: "primary",
			class: { root: "bg-brutal-yellow text-foreground-strong hover:bg-brutal-yellow" }
		},
		{
			theme: "brutal",
			variant: "default",
			class: { root: "bg-layer-panel text-foreground-strong hover:bg-layer-panel" }
		},
		{
			theme: "brutal",
			variant: "outline",
			class: { root: "bg-layer-panel text-foreground-strong shadow-raft-sm hover:bg-layer-panel" }
		},
		{
			theme: "brutal",
			variant: "information",
			class: { root: "bg-brutal-cyan text-foreground-strong hover:bg-brutal-cyan" }
		},
		{
			theme: "brutal",
			variant: "muted",
			class: { root: "bg-brutal-stone text-foreground-strong hover:bg-brutal-stone" }
		},
		{
			theme: "brutal",
			variant: "accent",
			class: { root: "bg-brutal-pink text-foreground-strong hover:bg-brutal-pink" }
		},
		{
			theme: "brutal",
			variant: "danger",
			class: { root: "bg-brutal-red text-foreground-strong hover:border-line-strong hover:bg-brutal-red" }
		},
		{
			theme: "brutal",
			variant: "danger-secondary",
			class: { root: "text-[color-mix(in_oklab,var(--danger)_72%,transparent)] hover:border-line-strong" }
		},
		{
			theme: "brutal",
			variant: "warning",
			class: { root: "bg-brutal-orange text-foreground-strong hover:bg-brutal-orange" }
		},
		{
			theme: "brutal",
			size: "lg",
			class: { root: ["h-10 px-4 text-sm", "has-data-[icon=inline-start]:pl-3.5 has-data-[icon=inline-end]:pr-3.5"] }
		},
		{
			theme: "brutal",
			size: "icon-lg",
			class: { root: "size-10" }
		},
		{
			theme: "elegant",
			variant: "default",
			class: { root: [
				"bg-foreground text-foreground-inverse",
				"dark:bg-ink",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--foreground)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/8%)_0%,oklab(0%_0_0/0%)_100%)]",
				"hover:bg-[oklch(0.31_0.006_106.42)] dark:hover:bg-foreground-strong"
			] }
		},
		{
			theme: "elegant",
			variant: "primary",
			class: { root: [
				"bg-primary-400 text-primary-950",
				"[--button-focus-ring:var(--primary-400)]",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.15),0_0_0_1px_var(--primary-edge)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/11%)_0%,oklab(100%_0_0/0%)_0%,oklab(0%_0_0/0%)_100%)]",
				"hover:bg-primary-hover",
				"dark:hover:bg-primary-500"
			] }
		},
		{
			theme: "elegant",
			variant: "outline",
			class: { root: [
				"bg-layer-panel text-foreground dark:text-foreground-muted",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0/0%)_30%,oklab(0%_0_0/1%)_100%)]",
				"hover:bg-fill-muted",
				"dark:bg-fill-muted dark:hover:bg-fill-strong"
			] }
		},
		{
			theme: "elegant",
			variant: "ghost",
			class: { root: ["bg-transparent text-foreground-muted shadow-none", "hover:bg-ink-4"] }
		},
		{
			theme: "elegant",
			variant: "danger-secondary",
			class: { root: [
				"bg-danger-soft text-danger",
				"dark:bg-[oklch(0.37_0.06_27)] dark:text-[oklch(0.8_0.17_22)]",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.08),0_0_0_1px_var(--danger-muted)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/4%)_0%,oklab(0%_0_0/0%)_100%)]",
				"hover:bg-danger-muted",
				"dark:hover:bg-[oklch(0.4_0.07_27)]"
			] }
		},
		{
			theme: "elegant",
			variant: "danger",
			class: { root: [
				"bg-danger text-danger-foreground",
				"dark:bg-[oklch(0.58_0.21_27)] dark:text-[oklch(0.985_0.004_106.42)]",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--danger)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/10%)_0%,oklab(0%_0_0/0%)_100%)]",
				"hover:bg-danger-hover",
				"dark:hover:bg-[oklch(0.61_0.21_27)]"
			] }
		},
		{
			theme: "elegant",
			variant: "danger-outline",
			class: { root: [
				"bg-layer-panel text-danger",
				"dark:bg-fill-muted dark:text-[oklch(0.78_0.19_25)]",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.025),0_0_0_1px_var(--danger-muted)]",
				"hover:bg-danger-soft",
				"dark:hover:bg-fill-strong"
			] }
		},
		{
			theme: "elegant",
			variant: "accent",
			class: { root: [
				"bg-accent-400 text-accent-950",
				"dark:text-foreground-inverse",
				"[--button-focus-ring:var(--accent-400)]",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--accent-400)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/8%)_0%,oklab(0%_0_0/0%)_100%)]",
				"hover:bg-accent-hover"
			] }
		},
		{
			theme: "elegant",
			variant: "warning",
			class: { root: [
				"bg-warning text-[oklch(0.25_0.05_50)]",
				"dark:bg-[oklch(0.66_0.17_46)]",
				"[--button-focus-ring:var(--warning)]",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.14),0_0_0_1px_var(--warning)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/10%)_0%,oklab(0%_0_0/0%)_100%)]",
				"hover:bg-warning-hover",
				"dark:hover:bg-[oklch(0.69_0.17_46)]"
			] }
		},
		{
			theme: "elegant",
			variant: "link",
			class: { root: "bg-transparent text-foreground-muted shadow-none" }
		},
		{
			theme: "elegant",
			variant: "information",
			class: { root: [
				"bg-info text-foreground-inverse",
				"dark:bg-info-strong",
				"[--button-focus-ring:var(--info)]",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_0_0_1px_var(--info)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/8%)_0%,oklab(0%_0_0/0%)_100%)]",
				"hover:bg-info-hover",
				"dark:hover:bg-info"
			] }
		},
		{
			theme: "elegant",
			variant: "muted",
			class: { root: [
				"bg-fill-muted text-foreground-muted dark:text-foreground-placeholder",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/5%)_0%,oklab(0%_0_0/1%)_100%)]",
				"hover:bg-fill-strong",
				"dark:bg-layer-panel",
				"dark:hover:bg-fill-muted"
			] }
		},
		{
			theme: "brutal",
			variant: [
				"primary",
				"default",
				"information",
				"muted",
				"accent",
				"warning",
				"outline",
				"danger-secondary",
				"danger"
			],
			class: { root: [
				"hover:-translate-y-px hover:shadow-raft-md",
				"active:translate-px",
				"active:shadow-raft-xs"
			] }
		},
		{
			theme: "brutal",
			variant: "danger-outline",
			class: { root: ["hover:-translate-y-px", "active:translate-px"] }
		}
	]
});
function Button({ variant, size, loading = false, loadingLabel = "Loading", disabled, className, children, render, nativeButton, ...props }) {
	const theme = useThemeFamily();
	const { root, content, loadingIndicator } = buttonVariants({
		theme,
		variant,
		size
	});
	return /* @__PURE__ */ jsxs(Button$1, {
		...props,
		render,
		nativeButton: nativeButton ?? defaultNativeButton(render),
		"data-slot": "button",
		className: root({ className }),
		"data-loading": loading ? "true" : void 0,
		disabled: disabled || loading,
		"aria-disabled": loading || void 0,
		children: [loading ? /* @__PURE__ */ jsx("span", {
			"data-slot": "button-loading-indicator",
			className: loadingIndicator(),
			children: /* @__PURE__ */ jsx(Spinner, { "aria-label": loadingLabel })
		}) : null, /* @__PURE__ */ jsx("span", {
			"data-slot": "button-content",
			"data-loading": loading ? "true" : void 0,
			className: content(),
			children
		})]
	});
}
//#endregion
//#region src/components/alert-dialog/alert-dialog.tsx
const alertDialog = tv$1({
	slots: {
		overlay: [
			"fixed inset-0 z-50",
			"transition-opacity duration-150 ease-out",
			"data-starting-style:opacity-0 data-ending-style:opacity-0"
		],
		content: [
			"fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-[408px] -translate-1/2 ",
			"origin-center transform-gpu outline-none transition-[opacity,transform] duration-150 ease-out",
			"data-starting-style:scale-[.98] data-starting-style:opacity-0",
			"data-ending-style:opacity-0"
		],
		header: ["grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3 min-w-0"],
		body: ["min-w-0"],
		footer: ["flex items-center justify-end gap-3"],
		title: ["m-0 min-w-0 text-foreground"],
		description: ["m-0 text-foreground-muted"]
	},
	variants: { theme: {
		brutal: {
			overlay: ["bg-layer-backdrop"],
			content: ["gap-4 border-2 border-line-strong bg-layer-panel px-6 py-4 shadow-raft-xl"],
			body: ["py-2 font-medium"],
			title: ["font-heading text-lg leading-none font-bold uppercase"],
			description: ["font-sans text-sm leading-5 text-foreground-strong/60"]
		},
		elegant: {
			overlay: ["bg-layer-backdrop backdrop-blur-[2px]"],
			content: ["overflow-clip rounded-lg bg-layer-popover shadow-raft-xl"],
			header: ["border-b border-line-muted/75 bg-layer-inset px-5 py-3", "dark:border-transparent dark:bg-transparent"],
			body: ["px-6 py-5 dark:pt-2.5"],
			footer: ["border-t border-line-muted/75 bg-layer-inset px-5 py-3", "dark:border-transparent dark:bg-transparent"],
			title: ["font-sans text-sm leading-5 font-medium tracking-[-0.005em]"],
			description: ["font-sans text-sm leading-5 text-foreground-hint"]
		}
	} }
});
function AlertDialog(props) {
	return /* @__PURE__ */ jsx(Dialog$1.Root, {
		"data-slot": "alert-dialog",
		...props
	});
}
function AlertDialogTrigger(props) {
	return /* @__PURE__ */ jsx(Dialog$1.Trigger, {
		"data-slot": "alert-dialog-trigger",
		...props
	});
}
function AlertDialogPortal(props) {
	return /* @__PURE__ */ jsx(Dialog$1.Portal, {
		"data-slot": "alert-dialog-portal",
		...useThemeScopeProps(props)
	});
}
function AlertDialogClose({ className, variant, size, children, ...props }) {
	const isBrutal = useThemeFamily() === "brutal";
	return /* @__PURE__ */ jsx(Dialog$1.Close, {
		"data-slot": "alert-dialog-close",
		render: /* @__PURE__ */ jsx(Button, {
			variant: variant ?? (isBrutal ? "outline" : "ghost"),
			size: size ?? (isBrutal ? "icon-md" : "icon-sm"),
			"aria-label": "Close",
			className: isBrutal ? className : cn("p-0 text-foreground-placeholder hover:border-transparent hover:bg-transparent hover:text-foreground-strong", className)
		}),
		...props,
		children: children ?? /* @__PURE__ */ jsx(X, { className: isBrutal ? "size-5" : "size-4" })
	});
}
function AlertDialogOverlay({ className, ...props }) {
	const theme = useThemeFamily();
	const { overlay } = alertDialog({ theme });
	return /* @__PURE__ */ jsx(Dialog$1.Backdrop, {
		"data-slot": "alert-dialog-overlay",
		className: overlay({ className }),
		...props
	});
}
function AlertDialogContent({ className, children, portalProps, overlay, ...props }) {
	const theme = useThemeFamily();
	const { content } = alertDialog({ theme });
	return /* @__PURE__ */ jsxs(AlertDialogPortal, {
		...portalProps,
		children: [overlay === false ? null : /* @__PURE__ */ jsx(AlertDialogOverlay, { ...overlay }), /* @__PURE__ */ jsx(Dialog$1.Popup, {
			"data-slot": "alert-dialog-content",
			className: content({ className }),
			...props,
			role: "alertdialog",
			children
		})]
	});
}
function AlertDialogHeader({ className, ...props }) {
	const theme = useThemeFamily();
	const { header } = alertDialog({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert-dialog-header",
		className: header({ className }),
		...props
	});
}
function AlertDialogBody({ className, ...props }) {
	const theme = useThemeFamily();
	const { body } = alertDialog({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert-dialog-body",
		className: body({ className }),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	const theme = useThemeFamily();
	const { footer } = alertDialog({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert-dialog-footer",
		className: footer({ className }),
		...props
	});
}
function AlertDialogTitle({ className, ...props }) {
	const theme = useThemeFamily();
	const { title } = alertDialog({ theme });
	return /* @__PURE__ */ jsx(Dialog$1.Title, {
		"data-slot": "alert-dialog-title",
		className: title({ className }),
		...props
	});
}
function AlertDialogDescription({ className, ...props }) {
	const theme = useThemeFamily();
	const { description } = alertDialog({ theme });
	return /* @__PURE__ */ jsx(Dialog$1.Description, {
		"data-slot": "alert-dialog-description",
		className: description({ className }),
		...props
	});
}
function AlertDialogAction(props) {
	return /* @__PURE__ */ jsx(Button, {
		"data-slot": "alert-dialog-action",
		...props
	});
}
function AlertDialogCancel({ className, variant = "outline", size = "sm", ...props }) {
	return /* @__PURE__ */ jsx(Dialog$1.Close, {
		"data-slot": "alert-dialog-cancel",
		render: /* @__PURE__ */ jsx(Button, {
			className,
			variant,
			size
		}),
		...props
	});
}
//#endregion
//#region src/components/dialog/dialog.tsx
const dialog = tv$1({
	slots: {
		overlay: [
			"fixed inset-0 z-50",
			"transition-opacity duration-150 ease-out",
			"data-starting-style:opacity-0 data-ending-style:opacity-0"
		],
		content: [
			"fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-1/2 ",
			"origin-center transform-gpu outline-none transition-[opacity,transform] duration-150 ease-out",
			"data-starting-style:scale-[.98] data-starting-style:opacity-0",
			"data-ending-style:opacity-0"
		],
		header: ["grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3 min-w-0"],
		body: ["min-w-0"],
		footer: ["flex items-center justify-end gap-3"],
		title: ["m-0 min-w-0 text-foreground"],
		description: ["m-0 text-foreground-muted"]
	},
	variants: { theme: {
		brutal: {
			overlay: ["bg-layer-backdrop"],
			content: ["gap-4 border-2 border-line-strong bg-layer-panel px-6 py-4 shadow-raft-xl"],
			body: ["py-2 font-medium"],
			title: ["font-heading text-lg leading-none font-bold uppercase"],
			description: ["font-sans text-sm leading-5 text-foreground-strong/60"]
		},
		elegant: {
			overlay: ["bg-layer-backdrop backdrop-blur-[2px]"],
			content: ["overflow-clip rounded-lg bg-layer-popover shadow-raft-xl"],
			header: ["border-b border-line-muted/75 bg-layer-inset px-6 py-3", "dark:border-transparent dark:bg-transparent"],
			body: ["px-6 py-5 dark:pt-2.5"],
			footer: ["border-t border-line-muted/75 bg-layer-inset px-6 py-3", "dark:border-transparent dark:bg-transparent"],
			title: ["font-sans text-sm leading-5 font-medium tracking-[-0.005em]"],
			description: ["font-sans text-sm leading-5 text-foreground-hint"]
		}
	} }
});
function Dialog(props) {
	return /* @__PURE__ */ jsx(Dialog$1.Root, {
		"data-slot": "dialog",
		...props
	});
}
function DialogTrigger(props) {
	return /* @__PURE__ */ jsx(Dialog$1.Trigger, {
		"data-slot": "dialog-trigger",
		...props
	});
}
function DialogPortal(props) {
	return /* @__PURE__ */ jsx(Dialog$1.Portal, {
		"data-slot": "dialog-portal",
		...useThemeScopeProps(props)
	});
}
function DialogOverlay({ className, ...props }) {
	const theme = useThemeFamily();
	const { overlay } = dialog({ theme });
	return /* @__PURE__ */ jsx(Dialog$1.Backdrop, {
		"data-slot": "dialog-overlay",
		className: overlay({ className }),
		...props
	});
}
function DialogContent({ className, children, portalProps, overlay, ...props }) {
	const theme = useThemeFamily();
	const { content } = dialog({ theme });
	return /* @__PURE__ */ jsxs(DialogPortal, {
		...portalProps,
		children: [overlay === false ? null : /* @__PURE__ */ jsx(DialogOverlay, { ...overlay }), /* @__PURE__ */ jsx(Dialog$1.Popup, {
			"data-slot": "dialog-content",
			className: content({ className }),
			...props,
			children
		})]
	});
}
function DialogClose({ className, variant, size, children, render, ...props }) {
	const isBrutal = useThemeFamily() === "brutal";
	if (render) return /* @__PURE__ */ jsx(Dialog$1.Close, {
		"data-slot": "dialog-close",
		render,
		...props,
		children
	});
	return /* @__PURE__ */ jsx(Dialog$1.Close, {
		"data-slot": "dialog-close",
		render: /* @__PURE__ */ jsx(Button, {
			variant: variant ?? (isBrutal ? "outline" : "ghost"),
			size: size ?? (isBrutal ? "icon-md" : "icon-sm"),
			"aria-label": "Close",
			className: isBrutal ? className : cn("p-0 text-foreground-placeholder hover:border-transparent hover:bg-transparent hover:text-foreground-strong", className)
		}),
		...props,
		children: children ?? /* @__PURE__ */ jsx(X, { className: isBrutal ? "size-5" : "size-4" })
	});
}
function DialogHeader({ className, ...props }) {
	const theme = useThemeFamily();
	const { header } = dialog({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "dialog-header",
		className: header({ className }),
		...props
	});
}
function DialogBody({ className, ...props }) {
	const theme = useThemeFamily();
	const { body } = dialog({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "dialog-body",
		className: body({ className }),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	const theme = useThemeFamily();
	const { footer } = dialog({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "dialog-footer",
		className: footer({ className }),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	const theme = useThemeFamily();
	const { title } = dialog({ theme });
	return /* @__PURE__ */ jsx(Dialog$1.Title, {
		"data-slot": "dialog-title",
		className: title({ className }),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	const theme = useThemeFamily();
	const { description } = dialog({ theme });
	return /* @__PURE__ */ jsx(Dialog$1.Description, {
		"data-slot": "dialog-description",
		className: description({ className }),
		...props
	});
}
const drawer = tv$1({
	extend: tv$1({
		slots: {
			overlay: [
				"opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))]",
				"transition-opacity duration-200 ease-slide",
				"data-starting-style:opacity-0 data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-150",
				"motion-reduce:transition-none"
			],
			popup: [
				"[--drawer-blur:2px] [--drawer-ease:var(--ease-slide)]",
				"[--closed-transform:translate3d(var(--drawer-exit-x,0px),var(--drawer-exit-y,0px),0)]",
				"[--drawer-stack-peek:16px] [--drawer-stack-step:0.05]",
				"[--drawer-stack-progress:clamp(0,var(--drawer-swipe-progress),1)]",
				"[--drawer-stack-offset:max(0px,calc((var(--nested-drawers)-var(--drawer-stack-progress))*var(--drawer-stack-peek)))]",
				"[--drawer-stack-scale-base:calc(max(0,1-(var(--nested-drawers)*var(--drawer-stack-step))))]",
				"[--drawer-stack-scale:clamp(0,calc(var(--drawer-stack-scale-base)+(var(--drawer-stack-step)*var(--drawer-stack-progress))),1)]",
				"[--drawer-stack-shrink:calc(1-var(--drawer-stack-scale))]",
				"[--drawer-stack-shrink-offset:calc(var(--drawer-stack-shrink)*var(--drawer-stack-size))]",
				"origin-(--drawer-transform-origin)",
				"transform-[translate3d(calc(var(--drawer-swipe-x,0px)+var(--drawer-stack-x,0px)),calc(var(--drawer-swipe-y,0px)+var(--drawer-stack-y,0px)),0)_scale(var(--drawer-stack-scale))]",
				"opacity-100 blur-0",
				"transition-[transform,height,opacity,filter] duration-240 ease-(--drawer-ease) will-change-transform",
				"data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*180ms)]",
				"data-starting-style:transform-(--closed-transform) data-starting-style:opacity-0 data-starting-style:blur-(--drawer-blur)",
				"data-ending-style:transform-(--closed-transform) data-ending-style:opacity-0 data-ending-style:blur-(--drawer-blur)",
				"data-swiping:duration-0 data-nested-drawer-swiping:duration-0 motion-reduce:transition-none"
			],
			content: ["transition-opacity duration-150 ease-slide motion-reduce:transition-none", "group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100"],
			swipeHandle: ["transition-opacity duration-150 motion-reduce:transition-none", "group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100"]
		},
		variants: {
			side: {
				down: { popup: [
					"[--drawer-exit-y:calc(100%+var(--drawer-inset)+2px)]",
					"[--drawer-stack-y:calc(0px-var(--drawer-stack-offset)-var(--drawer-stack-shrink-offset))]",
					"[--drawer-transform-origin:50%_100%]"
				] },
				up: { popup: [
					"[--drawer-exit-y:calc(-100%-var(--drawer-inset)-2px)]",
					"[--drawer-stack-y:calc(var(--drawer-stack-offset)+var(--drawer-stack-shrink-offset))]",
					"[--drawer-transform-origin:50%_0%]"
				] },
				left: { popup: [
					"[--drawer-exit-x:calc(-100%-var(--drawer-inset)-2px)]",
					"[--drawer-stack-x:calc(var(--drawer-stack-offset)+var(--drawer-stack-shrink-offset))]",
					"[--drawer-transform-origin:0%_50%]"
				] },
				right: { popup: [
					"[--drawer-exit-x:calc(100%+var(--drawer-inset)+2px)]",
					"[--drawer-stack-x:calc(0px-var(--drawer-stack-offset)-var(--drawer-stack-shrink-offset))]",
					"[--drawer-transform-origin:100%_50%]"
				] }
			},
			axis: {
				x: { popup: ["[--drawer-stack-size:100%]", "[--drawer-swipe-x:var(--drawer-swipe-movement-x)]"] },
				y: { popup: ["[--drawer-stack-size:max(0px,var(--drawer-frontmost-height,var(--drawer-height)))]", "[--drawer-swipe-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y))]"] }
			},
			snapPoints: { true: { overlay: ["[--drawer-overlay-min-opacity:0.5]"] } }
		}
	}),
	slots: {
		overlay: [
			"fixed inset-0 z-50 min-h-dvh select-none",
			"bg-layer-backdrop",
			"supports-[-webkit-touch-callout:none]:absolute"
		],
		viewport: ["pointer-events-none fixed inset-0 z-50 select-none"],
		popup: [
			"group/drawer-popup pointer-events-auto fixed z-50 flex h-(--drawer-content-height) flex-col outline-none",
			"text-foreground-strong",
			"[--drawer-inset:12px] [--drawer-content-height:var(--drawer-height,auto)]",
			"data-nested-drawer-open:overflow-hidden"
		],
		content: ["flex min-h-0 flex-1 flex-col rounded-[inherit] select-text", "group-data-swiping/drawer-popup:select-none"],
		swipeHandle: ["relative z-10 shrink-0 cursor-grab select-none active:cursor-grabbing", "before:absolute before:rounded-full before:bg-ink-20 before:content-['']"],
		close: ["shrink-0"],
		closeIcon: [],
		header: ["flex flex-col items-center px-6 pt-8 pb-2 text-center"],
		body: ["flex flex-1 flex-col items-center px-6 pt-4 pb-6 text-center"],
		footer: ["mt-auto px-6 py-5"],
		actions: ["flex w-full flex-col items-stretch gap-2.5", "**:data-[slot=button]:w-full"],
		title: ["max-w-sm text-pretty text-center text-2xl leading-8 text-foreground"],
		description: ["max-w-sm text-pretty text-center text-sm leading-5 text-foreground-strong/60"]
	},
	variants: {
		theme: {
			brutal: {
				title: ["font-bold"],
				swipeHandle: ["before:rounded-none before:bg-ink-40"],
				popup: ["border-2 border-line-strong bg-layer-panel shadow-raft-xl"],
				close: ["bg-layer-panel"],
				closeIcon: ["size-5"]
			},
			elegant: {
				overlay: ["backdrop-blur-[2px]"],
				popup: ["overflow-clip rounded-lg bg-layer-popover shadow-raft-xl md:rounded-xl"],
				close: ["p-0 text-foreground-placeholder hover:bg-transparent hover:text-foreground-strong"],
				closeIcon: ["size-4"],
				header: ["bg-layer-panel px-8 pt-9 pb-2", "dark:bg-transparent"],
				body: ["bg-layer-panel px-8 pt-4 pb-7", "dark:bg-transparent"],
				footer: ["mt-0 px-8 py-5"],
				title: ["font-sans text-2xl leading-8 font-semibold"],
				description: ["font-sans text-sm leading-5 text-foreground-muted"]
			}
		},
		side: {
			down: {
				popup: ["[--drawer-inset:max(12px,env(safe-area-inset-bottom,0px))]", "bottom-(--drawer-inset) min-h-64 max-h-[82vh]"],
				swipeHandle: ["before:top-3"]
			},
			up: {
				popup: ["[--drawer-inset:max(12px,env(safe-area-inset-top,0px))]", "top-(--drawer-inset) max-h-[80vh]"],
				swipeHandle: ["order-last", "before:bottom-3"]
			},
			left: {
				popup: ["left-(--drawer-inset)"],
				swipeHandle: ["order-last", "before:right-3"]
			},
			right: {
				popup: ["right-(--drawer-inset)"],
				swipeHandle: ["before:left-3"]
			}
		},
		axis: {
			x: {
				popup: ["inset-y-3", "flex-row w-3/4 max-w-sm"],
				swipeHandle: ["my-auto h-16 w-11", "before:top-1/2 before:h-12 before:w-1.5 before:-translate-y-1/2"],
				header: ["flex-row justify-between gap-3 pt-6 text-left"],
				body: ["items-stretch text-left"],
				footer: ["py-4"],
				title: ["min-w-0 max-w-none flex-1 text-left"],
				description: ["max-w-none text-left"]
			},
			y: {
				popup: ["data-nested-drawer-open:h-(--drawer-frontmost-height)", "inset-x-3 mx-auto md:max-w-md"],
				swipeHandle: ["mx-auto h-11 w-16", "before:left-1/2 before:h-1.5 before:w-12 before:-translate-x-1/2"]
			}
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			side: "right",
			class: { popup: ["[--drawer-inset:20px]"] }
		},
		{
			theme: "brutal",
			side: "down",
			class: { popup: ["[--drawer-inset:max(20px,env(safe-area-inset-bottom,0px))]"] }
		},
		{
			theme: "elegant",
			axis: "x",
			class: { popup: ["md:max-w-md"] }
		},
		{
			side: "down",
			snapPoints: true,
			class: { header: ["pt-2"] }
		},
		{
			axis: "y",
			snapPoints: true,
			class: { popup: ["[--drawer-content-height:100dvh]"] }
		}
	]
});
//#endregion
//#region src/components/drawer/drawer.tsx
const DrawerConfigContext = createContext(null);
function useDrawerConfig() {
	const context = useContext(DrawerConfigContext);
	if (!context) throw new Error("Drawer parts must be used within Drawer.");
	return context;
}
function Drawer({ modal = true, snapPoints, swipeDirection = "down", ...props }) {
	const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
	const swipeAxis = swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";
	const contextValue = useMemo(() => ({
		hasSnapPoints,
		modal,
		swipeAxis,
		swipeDirection
	}), [
		hasSnapPoints,
		modal,
		swipeAxis,
		swipeDirection
	]);
	return /* @__PURE__ */ jsx(DrawerConfigContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ jsx(Drawer$1.Root, {
			modal,
			snapPoints,
			swipeDirection,
			...props
		})
	});
}
function DrawerTrigger(props) {
	return /* @__PURE__ */ jsx(Drawer$1.Trigger, {
		"data-slot": "drawer-trigger",
		...props
	});
}
function DrawerPortal(props) {
	return /* @__PURE__ */ jsx(Drawer$1.Portal, {
		"data-slot": "drawer-portal",
		...useThemeScopeProps(props)
	});
}
function DrawerOverlay({ className, ...props }) {
	const { hasSnapPoints } = useDrawerConfig();
	const { overlay } = drawer({
		theme: useThemeFamily(),
		snapPoints: hasSnapPoints
	});
	return /* @__PURE__ */ jsx(Drawer$1.Backdrop, {
		"data-slot": "drawer-overlay",
		className: overlay({ className }),
		...props
	});
}
function DrawerSwipeHandle() {
	const { swipeAxis, swipeDirection } = useDrawerConfig();
	const { swipeHandle } = drawer({
		theme: useThemeFamily(),
		side: swipeDirection,
		axis: swipeAxis
	});
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "drawer-swipe-handle",
		"aria-hidden": "true",
		className: swipeHandle()
	});
}
function DrawerContent({ className, children, portalProps, ...props }) {
	const { hasSnapPoints, modal, swipeAxis, swipeDirection } = useDrawerConfig();
	const { content, popup, viewport } = drawer({
		theme: useThemeFamily(),
		side: swipeDirection,
		axis: swipeAxis,
		snapPoints: hasSnapPoints
	});
	return /* @__PURE__ */ jsxs(DrawerPortal, {
		...portalProps,
		children: [modal === true ? /* @__PURE__ */ jsx(DrawerOverlay, {}) : null, /* @__PURE__ */ jsx(Drawer$1.Viewport, {
			"data-slot": "drawer-viewport",
			className: cn(viewport(), modal === true && "pointer-events-auto"),
			children: /* @__PURE__ */ jsxs(Drawer$1.Popup, {
				"data-slot": "drawer-popup",
				className: popup({ className }),
				...props,
				children: [hasSnapPoints ? /* @__PURE__ */ jsx(DrawerSwipeHandle, {}) : null, /* @__PURE__ */ jsx(Drawer$1.Content, {
					"data-slot": "drawer-content",
					className: content(),
					children
				})]
			})
		})]
	});
}
function DrawerClose({ className, variant, size, children, render, ...props }) {
	const theme = useThemeFamily();
	const isBrutal = theme === "brutal";
	const { close, closeIcon } = drawer({ theme });
	if (render) return /* @__PURE__ */ jsx(Drawer$1.Close, {
		"data-slot": "drawer-close",
		className,
		render,
		...props,
		children
	});
	return /* @__PURE__ */ jsx(Drawer$1.Close, {
		"data-slot": "drawer-close",
		render: /* @__PURE__ */ jsx(Button, {
			variant: variant ?? (isBrutal ? "outline" : "ghost"),
			size: size ?? (isBrutal ? "icon-md" : "icon-sm"),
			"aria-label": "Close"
		}),
		className: close({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(X, { className: closeIcon() })
	});
}
function DrawerHeader({ className, render, ...props }) {
	const { hasSnapPoints, swipeAxis, swipeDirection } = useDrawerConfig();
	const { header } = drawer({
		theme: useThemeFamily(),
		side: swipeDirection,
		axis: swipeAxis,
		snapPoints: hasSnapPoints
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: header({ className }) }, props),
		state: { slot: "drawer-header" }
	});
}
function DrawerFooter({ className, render, ...props }) {
	const { swipeAxis } = useDrawerConfig();
	const { footer } = drawer({
		theme: useThemeFamily(),
		axis: swipeAxis
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: footer({ className }) }, props),
		state: { slot: "drawer-footer" }
	});
}
function DrawerBody({ className, render, ...props }) {
	const { swipeAxis } = useDrawerConfig();
	const { body } = drawer({
		theme: useThemeFamily(),
		axis: swipeAxis
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: body({ className }) }, props),
		state: { slot: "drawer-body" }
	});
}
function DrawerActions({ className, render, children, ...props }) {
	const { actions } = drawer({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			className: actions({ className }),
			children
		}, props),
		state: { slot: "drawer-actions" }
	});
}
function DrawerTitle({ className, ...props }) {
	const { swipeAxis } = useDrawerConfig();
	const { title } = drawer({
		theme: useThemeFamily(),
		axis: swipeAxis
	});
	return /* @__PURE__ */ jsx(Drawer$1.Title, {
		"data-slot": "drawer-title",
		className: title({ className }),
		...props
	});
}
function DrawerDescription({ className, ...props }) {
	const { swipeAxis } = useDrawerConfig();
	const { description } = drawer({
		theme: useThemeFamily(),
		axis: swipeAxis
	});
	return /* @__PURE__ */ jsx(Drawer$1.Description, {
		"data-slot": "drawer-description",
		className: description({ className }),
		...props
	});
}
//#endregion
//#region src/components/card/card.recipe.ts
const card = tv$1({
	slots: {
		root: ["flex min-w-0 flex-col overflow-hidden", "text-foreground"],
		header: [
			"group/card-header grid min-w-0 auto-rows-min grid-cols-1 items-start gap-x-4 gap-y-1",
			"has-[>[data-slot=card-leading]]:grid-cols-[auto_minmax(0,1fr)]",
			"has-[>[data-slot=card-trailing]]:grid-cols-[minmax(0,1fr)_auto]",
			"has-[>[data-slot=card-leading]]:has-[>[data-slot=card-trailing]]:grid-cols-[auto_minmax(0,1fr)_auto]"
		],
		title: ["col-start-1 row-start-1 min-w-0", "group-has-[>[data-slot=card-leading]]/card-header:col-start-2"],
		leading: [
			"col-start-1 row-span-2 row-start-1",
			"flex shrink-0 items-center self-start",
			"[&>svg]:size-4 [&>svg]:shrink-0"
		],
		description: ["col-start-1 row-start-2 min-w-0", "group-has-[>[data-slot=card-leading]]/card-header:col-start-2"],
		trailing: [
			"col-start-2 row-start-1",
			"flex shrink-0 items-center self-center justify-self-end",
			"group-has-[>[data-slot=card-leading]]/card-header:col-start-3"
		],
		content: ["min-w-0"],
		footer: ["flex min-w-0 flex-wrap items-center gap-2"]
	},
	variants: {
		theme: {
			brutal: {
				leading: ["min-h-5"],
				title: ["font-heading text-lg leading-5 font-bold"],
				description: ["font-sans text-sm leading-5 text-foreground-strong/60"],
				footer: [
					"flex-nowrap items-center",
					"font-sans text-xs leading-4 text-foreground-muted",
					"[&>svg]:size-3.5 [&>svg]:shrink-0",
					"[&>:not(svg)]:min-w-0"
				]
			},
			elegant: {
				leading: ["min-h-[22px]"],
				title: ["font-sans text-base leading-[22px] font-medium"],
				description: ["font-sans text-xs leading-4 tracking-[0.01em] text-pretty", "text-foreground-muted"],
				footer: [
					"flex-nowrap items-center",
					"font-sans text-xs leading-4 text-foreground-hint",
					"[&>svg]:size-3.5 [&>svg]:shrink-0",
					"[&>:not(svg)]:min-w-0"
				]
			}
		},
		variant: {
			default: {},
			inset: {}
		}
	},
	defaultVariants: { variant: "default" },
	compoundVariants: [
		{
			theme: "brutal",
			variant: "default",
			class: {
				root: ["border-2 border-line-strong bg-layer-panel", "shadow-raft-md"],
				header: "border-b-2 border-line-strong p-4",
				content: "p-4",
				footer: "border-t-2 border-line-strong bg-layer-inset px-4 py-3"
			}
		},
		{
			theme: "brutal",
			variant: "inset",
			class: {
				root: ["border-2 border-line-strong bg-layer-panel px-2", "shadow-raft-md"],
				header: "px-4 py-3",
				content: "-mx-2 border-y-2 border-line-strong bg-layer-panel px-6 py-4",
				footer: "px-4 py-3"
			}
		},
		{
			theme: "elegant",
			variant: "default",
			class: {
				root: ["rounded-lg border-[0.5px] border-line-muted bg-layer-panel", "shadow-raft-xs dark:border-transparent"],
				header: "p-5 has-[+[data-slot=card-content]]:pb-0",
				content: "p-5",
				footer: ["border-t border-line-hairline bg-layer-inset px-5 py-3.5", "dark:border-transparent dark:bg-transparent"]
			}
		},
		{
			theme: "elegant",
			variant: "inset",
			class: {
				root: ["rounded-lg border-[0.5px] border-line-muted bg-layer-card p-[2px]", "shadow-raft-xs dark:border-transparent"],
				header: "px-5 py-3.5",
				content: ["overflow-clip rounded-[5.5px] border-[0.5px] border-line-hairline bg-layer-panel p-5", "dark:border-transparent dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.04),0_0_0_1px_oklch(0_0_0/0.35)]"],
				footer: "px-5 py-3"
			}
		}
	]
});
//#endregion
//#region src/components/card/card.tsx
const CardVariantContext = createContext("default");
function useCardRecipe() {
	return card({
		theme: useThemeFamily(),
		variant: use(CardVariantContext)
	});
}
function Card({ className, render, variant = "default", ...props }) {
	const { root } = card({
		theme: useThemeFamily(),
		variant
	});
	const element = useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "card",
			"data-variant": variant,
			className: root({ className })
		}, props)
	});
	return /* @__PURE__ */ jsx(CardVariantContext, {
		value: variant,
		children: element
	});
}
function CardHeader({ className, render, ...props }) {
	const { header } = useCardRecipe();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "card-header",
			className: header({ className })
		}, props)
	});
}
function CardTitle({ className, render, ...props }) {
	const { title } = useCardRecipe();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "card-title",
			className: title({ className })
		}, props)
	});
}
function CardLeading({ className, render, ...props }) {
	const { leading } = useCardRecipe();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "card-leading",
			className: leading({ className })
		}, props)
	});
}
function CardDescription({ className, render, ...props }) {
	const { description } = useCardRecipe();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "card-description",
			className: description({ className })
		}, props)
	});
}
function CardTrailing({ className, render, ...props }) {
	const { trailing } = useCardRecipe();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "card-trailing",
			className: trailing({ className })
		}, props)
	});
}
function CardContent({ className, render, ...props }) {
	const { content } = useCardRecipe();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "card-content",
			className: content({ className })
		}, props)
	});
}
function CardFooter({ className, render, ...props }) {
	const { footer } = useCardRecipe();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "card-footer",
			className: footer({ className })
		}, props)
	});
}
//#endregion
//#region src/components/status/status.tsx
const STATUS_STYLE = `
@keyframes raft-status-pulse-background {
  0% {
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--status-color) 42%, transparent);
  }
  70%,
  100% {
    box-shadow: 0 0 0 8px color-mix(in oklch, var(--status-color) 0%, transparent);
  }
}

/* Pulse + attention: animate a bottom-layer ring; leave attention outline untouched. */
[data-slot="status"][data-attention][data-pulse]:not([data-pulse="false"])::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  animation: raft-status-pulse-background 1.4s ease-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="status"][data-attention][data-pulse]:not([data-pulse="false"])::before {
    animation: none;
  }
}
`;
const status = tv$1({
	extend: tv$1({
		slots: { root: ["relative inline-block shrink-0 rounded-full", "bg-(--status-color)"] },
		variants: {
			theme: {
				brutal: { root: "border border-line-strong" },
				elegant: {}
			},
			variant: {
				default: { root: "[--status-color:var(--color-gray-400)]" },
				primary: { root: "[--status-color:var(--color-primary-400)]" },
				information: { root: "[--status-color:var(--color-info)]" },
				muted: { root: "[--status-color:var(--color-secondary-400)]" },
				accent: { root: "[--status-color:var(--color-accent-400)]" },
				success: { root: "[--status-color:var(--color-success)]" },
				warning: { root: "[--status-color:var(--color-warning)]" },
				danger: { root: "[--status-color:var(--color-danger)]" }
			}
		},
		defaultVariants: { variant: "default" }
	}),
	variants: {
		theme: {
			brutal: {},
			elegant: {}
		},
		size: {
			xs: { root: "size-1" },
			sm: { root: "size-2" },
			md: { root: "size-2.5" },
			lg: { root: "size-[11px]" }
		},
		pulse: {
			true: { root: "" },
			false: { root: "" }
		},
		attention: {
			true: { root: "" },
			false: { root: "" }
		}
	},
	defaultVariants: {
		size: "md",
		variant: "default",
		pulse: false,
		attention: false
	},
	compoundVariants: [
		{
			theme: "brutal",
			variant: "success",
			class: { root: "[--status-color:var(--color-brutal-lime)]" }
		},
		{
			theme: "brutal",
			variant: "warning",
			class: { root: "[--status-color:var(--color-warning)]" }
		},
		{
			theme: "brutal",
			pulse: true,
			class: { root: "animate-pulse" }
		},
		{
			theme: "elegant",
			attention: true,
			class: { root: [
				"isolate overflow-visible",
				"border border-[color-mix(in_oklch,var(--status-color)_58%,transparent)]",
				"shadow-[inset_0_0.5px_1px_color-mix(in_oklch,oklch(1_0_0)_55%,transparent)]"
			] }
		},
		{
			theme: "elegant",
			pulse: true,
			attention: false,
			class: { root: "animate-[raft-status-pulse-background_1.4s_ease-out_infinite] motion-reduce:animate-none" }
		}
	]
});
const statusStyle = /* @__PURE__ */ jsx("style", {
	href: "raft-ui-status",
	precedence: "default",
	children: STATUS_STYLE
});
function StatusRoot({ size, variant, pulse, attention, className, render, ...props }) {
	const theme = useThemeFamily();
	const resolvedPulse = pulse ?? false;
	const resolvedAttention = attention ?? false;
	const { root } = status({
		theme,
		size,
		variant,
		pulse: resolvedPulse,
		attention: resolvedAttention
	});
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			className: root({ className }),
			children: statusStyle
		}, props),
		state: {
			slot: "status",
			variant,
			pulse: resolvedPulse,
			attention: resolvedAttention,
			size
		}
	});
}
const Status = StatusRoot;
//#endregion
//#region src/components/app-rail/app-rail.recipe.ts
const appRail = tv$1({
	slots: {
		root: ["flex size-full  flex-col items-center select-none"],
		header: ["relative flex w-full shrink-0 items-center justify-center"],
		nav: ["flex w-full flex-1 flex-col items-center gap-1.5 py-2"],
		footer: ["flex w-full shrink-0 flex-col items-center justify-center gap-1.5"],
		item: [
			"relative inline-flex shrink-0 items-center justify-center",
			"outline-none",
			"disabled:pointer-events-none disabled:opacity-45",
			"[&_svg]:size-4.5 [&_svg]:shrink-0"
		],
		itemIcon: ["relative inline-flex items-center justify-center"],
		itemAttentionMask: ["pointer-events-none absolute inset-0", "[&_svg]:size-full [&_svg]:shrink-0"],
		itemLabel: ["sr-only"],
		itemBadge: ["absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center", "px-1 text-[10px] font-bold leading-4"],
		itemIndicator: ["pointer-events-none absolute -right-1 top-[-2px]"]
	},
	variants: { theme: {
		brutal: {
			root: "w-16 border-r-2 border-black bg-primary text-foreground-strong md:[@media(max-height:600px)]:w-[50px]",
			header: "h-(--shell-header-height,62px) border-b-2 border-black [@media(max-height:600px)]:h-12",
			footer: "h-auto pb-2 [@media(max-height:600px)]:pb-1",
			item: [
				"size-10 border-2 border-transparent text-foreground-strong",
				"transition-colors",
				"hover:border-black hover:bg-white",
				"data-[selected=true]:border-black data-[selected=true]:bg-white data-[selected=true]:shadow-raft-sm",
				"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
				"md:[@media(max-height:600px)]:size-9"
			],
			itemBadge: "border-2 border-black bg-brutal-pink text-black",
			itemAttentionMask: "hidden"
		},
		elegant: {
			root: "w-14 bg-layer-canvas-muted",
			header: "h-(--shell-header-height,56px) border-b-0",
			nav: ["px-2 pt-4 pb-2"],
			footer: ["h-auto gap-1.5 px-2 pb-2", "*:data-[slot=app-rail-item]:text-foreground-muted"],
			item: [
				"size-auto min-w-9 p-3 rounded-md border border-transparent",
				"text-[13px] text-foreground-icon [&_svg]:size-4",
				"hover:bg-fill-strong/80 hover:text-foreground-strong",
				"active:bg-fill-strong/80 active:text-foreground-strong",
				"dark:hover:bg-ink-6 dark:active:bg-ink-6",
				"data-[selected=true]:border-transparent data-[selected=true]:bg-fill-strong",
				"dark:data-[selected=true]:bg-layer-card",
				"data-[selected=true]:text-foreground-muted data-[selected=true]:shadow-none",
				"dark:data-[selected=true]:text-foreground-strong dark:data-[selected=true]:shadow-raft-sm",
				"focus-visible:ring-[0.5px] focus-visible:ring-primary-500"
			],
			itemBadge: [
				"rounded-full border-0 bg-primary-400 text-primary-950",
				"px-1 font-mono text-[10px] font-[450] leading-none tabular-nums normal-case tracking-normal",
				"ring-2 ring-layer-canvas-muted"
			],
			itemAttentionMask: [
				"text-[oklch(73.4%_0.149_89.2)] drop-shadow-[0_0_1px_oklch(88.3%_0.162_91.9/0.82)]",
				"mask-[radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]",
				"[-webkit-mask-image:radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]"
			],
			itemIndicator: "data-[variant=primary]:bg-[color-mix(in_srgb-linear,var(--color-primary-400)_86%,var(--ink))]"
		}
	} }
});
//#endregion
//#region src/components/app-rail/app-rail.tsx
function AppRailRoot({ className, render, ...props }) {
	const { root } = appRail({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "app-rail-root",
			className: root({ className })
		}, props)
	});
}
function AppRailHeader({ className, render, ...props }) {
	const { header } = appRail({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "app-rail-header",
			className: header({ className })
		}, props)
	});
}
function AppRailNav({ className, render, ...props }) {
	const { nav } = appRail({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "nav",
		render,
		props: mergeProps({
			"data-slot": "app-rail-nav",
			className: nav({ className })
		}, props)
	});
}
function AppRailItem({ nativeButton = true, selected, disabled, className, render, ...props }) {
	const { item } = appRail({ theme: useThemeFamily() });
	const defaultProps = {
		type: nativeButton ? "button" : void 0,
		disabled: nativeButton ? disabled : void 0,
		"aria-pressed": nativeButton ? selected : void 0,
		"data-slot": "app-rail-item",
		"data-selected": selected ? "true" : void 0,
		"data-disabled": disabled ? "true" : void 0,
		className: item({ className })
	};
	return useRender({
		render: render ?? /* @__PURE__ */ jsx(Button$1, {}),
		props: mergeProps(defaultProps, props)
	});
}
function AppRailItemIcon({ className, render, ...props }) {
	const { itemIcon } = appRail();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "app-rail-item-icon",
			className: itemIcon({ className })
		}, props)
	});
}
function AppRailItemAttention({ title, children }) {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx(AppRailItemAttentionMask, {
			"aria-hidden": true,
			children
		}),
		/* @__PURE__ */ jsx(AppRailItemIndicator, { "aria-hidden": true }),
		title ? /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: title
		}) : null
	] });
}
function AppRailItemAttentionMask({ className, render, ...props }) {
	const { itemAttentionMask } = appRail({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "app-rail-item-attention-mask",
			className: itemAttentionMask({ className })
		}, props)
	});
}
function AppRailItemLabel({ className, render, ...props }) {
	const { itemLabel } = appRail({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "app-rail-item-label",
			className: itemLabel({ className })
		}, props)
	});
}
function AppRailItemBadge({ className, render, ...props }) {
	const { itemBadge } = appRail({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "app-rail-item-badge",
			className: itemBadge({ className })
		}, props)
	});
}
function AppRailItemIndicator({ className, size = "sm", variant, attention = true, ...props }) {
	const theme = useThemeFamily();
	const { itemIndicator } = appRail({ theme });
	return /* @__PURE__ */ jsx(Status, {
		"aria-hidden": true,
		attention,
		size,
		variant: variant ?? (theme === "elegant" ? "primary" : "accent"),
		"data-slot": "app-rail-item-indicator",
		className: itemIndicator({ className }),
		...props
	});
}
function AppRailFooter({ className, render, ...props }) {
	const { footer } = appRail({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "app-rail-footer",
			className: footer({ className })
		}, props)
	});
}
//#endregion
//#region src/components/copyable-code/copyable-code.tsx
const copyableCode = tv$1({
	slots: {
		root: ["group/copyable-code flex w-full min-w-0 items-center gap-2"],
		code: ["min-w-0 flex-1 font-mono text-xs"],
		codeInner: ["block w-full min-w-0 max-w-full break-all"],
		action: [
			"shrink-0",
			"**:data-[slot=button]:transition-[color,background-color,box-shadow]",
			"**:data-[slot=button]:duration-150 [&_[data-slot=button]]:ease-out"
		],
		iconSwap: [
			"relative inline-grid size-3",
			"**:data-[slot=copyable-code-icon]:col-start-1 **:data-[slot=copyable-code-icon]:row-start-1",
			"**:data-[slot=copyable-code-icon]:origin-center",
			"**:data-[slot=copyable-code-icon]:transition-[opacity,filter,scale]",
			"**:data-[slot=copyable-code-icon]:duration-170",
			"**:data-[slot=copyable-code-icon]:ease-[cubic-bezier(0.16,1,0.3,1)]",
			"**:data-[slot=copyable-code-icon]:will-change-[opacity,filter,scale]",
			"motion-reduce:**:data-[slot=copyable-code-icon]:transition-none",
			"data-[state=idle]:**:data-[icon=copy]:scale-100 data-[state=idle]:**:data-[icon=copy]:opacity-100 data-[state=idle]:[&_[data-icon=copy]]:blur-0",
			"data-[state=idle]:**:data-[icon=check]:scale-[0.72] data-[state=idle]:**:data-[icon=check]:opacity-0 data-[state=idle]:**:data-[icon=check]:blur-[1px]",
			"data-[state=copied]:**:data-[icon=check]:scale-100 data-[state=copied]:**:data-[icon=check]:opacity-100 data-[state=copied]:[&_[data-icon=check]]:blur-0",
			"data-[state=copied]:**:data-[icon=copy]:scale-[0.72] data-[state=copied]:**:data-[icon=copy]:opacity-0 data-[state=copied]:**:data-[icon=copy]:blur-[1px]"
		]
	},
	variants: {
		theme: {
			brutal: {
				code: ["border-2 border-line-strong bg-black text-[oklch(0.88_0.18_132)] shadow-raft-sm"],
				codeInner: "break-all"
			},
			elegant: {
				code: [
					"bg-layer-inset text-[oklch(0.45_0.04_74)]",
					"ring-[0.5px] ring-ink-20 dark:ring-ink-10",
					"dark:text-[oklch(0.82_0.06_90)]"
				],
				codeInner: ["border-x border-dashed border-ink-10 dark:border-ink-16 bg-layer-panel px-1", "dark:bg-[oklch(0.15_0.004_106.42)]"],
				action: [
					"**:data-[slot=button]:text-foreground-muted",
					"**:data-[slot=button]:shadow-none",
					"**:data-[slot=button]:hover:bg-transparent **:data-[slot=button]:hover:text-foreground **:data-[slot=button]:hover:before:bg-transparent"
				]
			}
		},
		size: {
			sm: { code: "px-3 py-1.5 leading-5" },
			md: { code: "px-3 py-2 leading-5" }
		}
	},
	defaultVariants: { size: "md" },
	compoundVariants: [{
		theme: "elegant",
		size: "sm",
		class: {
			code: "px-2 py-0",
			codeInner: "py-1.5 leading-5"
		}
	}, {
		theme: "elegant",
		size: "md",
		class: {
			code: "px-2 py-0",
			codeInner: "py-2 leading-5"
		}
	}]
});
const CopyableCodeContext = createContext(null);
function useCopyableCode(part) {
	const context = useContext(CopyableCodeContext);
	if (!context) throw new Error(`${part} must be used inside CopyableCodeRoot.`);
	return context;
}
function CopyableCodeRoot({ copied, onCopy, size = "md", className, ...props }) {
	const theme = useThemeFamily();
	const { root } = copyableCode({
		theme,
		size
	});
	const { copied: clipboardCopied, copy } = useClipboard({ timeout: 1400 });
	const effectiveCopied = copied ?? clipboardCopied;
	const copyValue = useCallback(async (value) => {
		await copy(value);
		await onCopy?.(value);
	}, [copy, onCopy]);
	const context = useMemo(() => ({
		copied: effectiveCopied,
		copyValue,
		size
	}), [
		copyValue,
		effectiveCopied,
		size
	]);
	return /* @__PURE__ */ jsx(CopyableCodeContext.Provider, {
		value: context,
		children: /* @__PURE__ */ jsx("div", {
			"data-slot": "copyable-code-root",
			"data-size": size,
			"data-state": effectiveCopied ? "copied" : "idle",
			className: root({ className }),
			...props
		})
	});
}
function CopyableCode({ children, className, truncate, ...props }) {
	const { size } = useCopyableCode("CopyableCode");
	const theme = useThemeFamily();
	const { code, codeInner } = copyableCode({
		theme,
		size
	});
	const scrollClassName = "overflow-x-auto overflow-y-hidden break-normal whitespace-nowrap text-clip [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
	return /* @__PURE__ */ jsx("code", {
		"data-slot": "copyable-code",
		"data-truncate": truncate ? "true" : void 0,
		className: code({ className }),
		...props,
		children: /* @__PURE__ */ jsx("span", {
			"data-slot": "copyable-code-inner",
			className: codeInner({ className: [truncate && scrollClassName] }),
			children
		})
	});
}
function CopyableCodeAction({ children, buttonClassName, className, onClick, size, variant, ...props }) {
	const { copied, copyValue } = useCopyableCode("CopyableCodeAction");
	const theme = useThemeFamily();
	const { action } = copyableCode({ theme });
	const accessibleLabel = copied ? "Copied code" : "Copy code";
	const buttonSize = size ?? (theme === "elegant" ? "icon-xs" : "icon-sm");
	const buttonVariant = variant ?? (theme === "elegant" ? "ghost" : "outline");
	const handleClick = async (event) => {
		const value = event.currentTarget.closest("[data-slot=\"copyable-code-root\"]")?.querySelector("[data-slot=\"copyable-code\"]")?.textContent ?? "";
		await copyValue(value);
		onClick?.(event);
	};
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "copyable-code-action",
		className: action({ className }),
		children: /* @__PURE__ */ jsx(Button, {
			type: "button",
			variant: buttonVariant,
			size: buttonSize,
			"aria-label": props["aria-label"] ?? accessibleLabel,
			"aria-live": "polite",
			onClick: handleClick,
			className: buttonClassName,
			...props,
			children: typeof children === "function" ? children({ copied }) : children ?? /* @__PURE__ */ jsx(CopyableCodeActionIcon, { copied })
		})
	});
}
function CopyableCodeActionIcon({ copied }) {
	const { iconSwap } = copyableCode();
	return /* @__PURE__ */ jsxs("span", {
		"data-slot": "copyable-code-icon-swap",
		"data-state": copied ? "copied" : "idle",
		className: iconSwap(),
		"aria-hidden": true,
		children: [/* @__PURE__ */ jsx(Copy, {
			"data-slot": "copyable-code-icon",
			"data-icon": "copy",
			className: "size-3",
			strokeWidth: 1.75
		}), /* @__PURE__ */ jsx(Check, {
			"data-slot": "copyable-code-icon",
			"data-icon": "check",
			className: "size-3",
			strokeWidth: 1.75
		})]
	});
}
//#endregion
//#region src/components/checkbox/checkbox-indicator.tsx
const checkboxIndicator = tv$1({
	slots: { root: [
		"inline-flex shrink-0 items-center justify-center",
		"transition-colors",
		"[&_svg]:shrink-0"
	] },
	variants: {
		theme: {
			brutal: { root: ["border-2 border-line-strong"] },
			elegant: {}
		},
		shape: {
			square: { root: "" },
			circle: { root: "rounded-full" }
		},
		size: {
			sm: { root: ["size-3.5", "[&_svg:not([class*='size-'])]:size-2.5 [&_svg]:stroke-4"] },
			md: { root: ["size-4", "[&_svg:not([class*='size-'])]:size-3 [&_svg]:stroke-4"] },
			lg: { root: ["size-5", "[&_svg:not([class*='size-'])]:size-[13px] [&_svg]:stroke-3"] }
		},
		fill: {
			black: { root: "" },
			yellow: { root: "" }
		},
		checked: {
			true: { root: "" },
			false: { root: "bg-layer-panel text-transparent" }
		},
		disabled: {
			true: { root: "opacity-50" },
			false: { root: "" }
		},
		previewOnHover: {
			true: { root: "" },
			false: { root: "" }
		}
	},
	compoundVariants: [
		{
			checked: true,
			fill: "black",
			class: { root: "bg-line-strong text-foreground-inverse" }
		},
		{
			checked: true,
			fill: "yellow",
			class: { root: "bg-primary-400 text-foreground" }
		},
		{
			checked: false,
			previewOnHover: true,
			class: { root: "group-hover:text-foreground-strong/20" }
		}
	],
	defaultVariants: {
		shape: "square",
		size: "sm",
		fill: "black",
		disabled: false,
		previewOnHover: false
	}
});
function CheckboxIndicator({ checked, mark = "check", shape, size, fill, disabled, previewOnHover, className, ...props }) {
	const theme = useThemeFamily();
	const { root } = checkboxIndicator({
		theme,
		shape,
		size,
		fill,
		checked,
		disabled,
		previewOnHover
	});
	const Icon = mark === "minus" ? Minus : Check;
	return /* @__PURE__ */ jsx("span", {
		...props,
		"data-slot": "checkbox-indicator-graphic",
		"aria-hidden": true,
		className: root({ className }),
		children: (checked || previewOnHover) && /* @__PURE__ */ jsx(Icon, {})
	});
}
//#endregion
//#region src/components/checkbox/checkbox.tsx
const checkbox = tv$1({
	slots: {
		root: [
			"relative inline-flex shrink-0 touch-manipulation items-center justify-center outline-none",
			"focus-visible:ring-2 focus-visible:ring-line-strong",
			"data-disabled:cursor-not-allowed",
			"after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']"
		],
		indicator: ["pointer-events-none"],
		graphic: ["pointer-events-none"],
		outerRect: ["transition-[fill,stroke] duration-160 ease-out motion-reduce:transition-none"],
		overlayRect: [
			"pointer-events-none opacity-0 transition-opacity duration-160 ease-out motion-reduce:transition-none",
			"group-data-disabled/checkbox:opacity-0",
			"group-hover/checkbox:group-data-disabled/checkbox:opacity-0 group-focus-visible/checkbox:group-data-disabled/checkbox:opacity-0"
		],
		mark: ["absolute left-1/2 top-1/2 shrink-0 origin-center -translate-1/2 "],
		checkMark: [
			"-rotate-6 scale-[0.82] opacity-0",
			"transition-[opacity,transform] duration-180 ease-out motion-reduce:transition-none",
			"motion-reduce:rotate-0 motion-reduce:scale-100"
		],
		indeterminateMark: [
			"invisible scale-x-50 opacity-0",
			"transition-[opacity,transform] duration-160 ease-out motion-reduce:transition-none",
			"motion-reduce:scale-x-100"
		]
	},
	variants: {
		theme: {
			brutal: {},
			elegant: {
				root: [
					"group/checkbox rounded-[3px] focus:outline-none",
					"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_2px_2px_-1px_oklch(0_0_0/0.04),0_4px_4px_-2px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"dark:not-data-checked:not-data-indeterminate:shadow-[inset_0_1px_1.5px_oklch(0_0_0/0.3),0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
					"transition-[box-shadow,transform] duration-100 ease-out motion-reduce:transition-none",
					"active:scale-[0.96] data-disabled:active:scale-100 motion-reduce:active:scale-100"
				],
				graphic: ["absolute inset-0 size-full"]
			}
		},
		variant: {
			default: {},
			primary: {}
		},
		color: {
			default: {},
			primary: {}
		},
		size: {
			sm: { root: "size-3.5" },
			md: { root: "size-4" },
			lg: { root: "size-5" }
		}
	},
	compoundVariants: [
		{
			theme: "elegant",
			size: "sm",
			class: { root: "size-4" }
		},
		{
			theme: "elegant",
			size: "md",
			class: { root: "size-4.5" }
		},
		{
			theme: "elegant",
			variant: "default",
			color: "default",
			class: {
				root: [
					"data-checked:shadow-[0_2px_2px_-1px_oklch(0_0_0/0.04),0_4px_4px_-2px_oklch(0_0_0/0.02)]",
					"data-indeterminate:shadow-[0_2px_2px_-1px_oklch(0_0_0/0.04),0_4px_4px_-2px_oklch(0_0_0/0.02)]",
					"dark:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"dark:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]"
				],
				outerRect: [
					"fill-layer-panel",
					"stroke-transparent",
					"dark:fill-layer-inset",
					"group-hover/checkbox:fill-[oklch(0.976_0.001_106.42)] dark:group-hover/checkbox:fill-layer-card",
					"group-focus-visible/checkbox:fill-foreground",
					"group-hover/checkbox:group-data-checked/checkbox:fill-foreground-active dark:group-hover/checkbox:group-data-checked/checkbox:fill-foreground-hover",
					"group-hover/checkbox:group-data-indeterminate/checkbox:fill-foreground-active dark:group-hover/checkbox:group-data-indeterminate/checkbox:fill-foreground-hover",
					"group-focus-visible/checkbox:group-data-checked/checkbox:fill-foreground",
					"group-focus-visible/checkbox:group-data-indeterminate/checkbox:fill-foreground",
					"group-data-checked/checkbox:fill-foreground",
					"group-data-indeterminate/checkbox:fill-foreground",
					"dark:group-data-checked/checkbox:fill-foreground",
					"dark:group-data-indeterminate/checkbox:fill-foreground",
					"dark:group-focus-visible/checkbox:fill-foreground",
					"group-data-disabled/checkbox:fill-fill-muted",
					"group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-hover/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-hover/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-focus-visible/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-focus-visible/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted"
				],
				mark: ["text-foreground-inverse group-data-disabled/checkbox:text-line"]
			}
		},
		{
			theme: "elegant",
			variant: "primary",
			class: {
				root: [
					"data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
					"data-indeterminate:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
					"hover:data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
					"hover:data-indeterminate:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
					"dark:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"dark:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"dark:hover:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"dark:hover:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"hover:data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"hover:data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]"
				],
				outerRect: [
					"fill-layer-panel",
					"stroke-transparent",
					"dark:fill-layer-inset",
					"group-hover/checkbox:fill-[oklch(0.976_0.001_106.42)] dark:group-hover/checkbox:fill-layer-card",
					"group-focus-visible/checkbox:fill-primary-400",
					"group-hover/checkbox:group-data-checked/checkbox:fill-primary-hover",
					"group-hover/checkbox:group-data-indeterminate/checkbox:fill-primary-hover",
					"group-focus-visible/checkbox:group-data-checked/checkbox:fill-primary-400",
					"group-focus-visible/checkbox:group-data-indeterminate/checkbox:fill-primary-400",
					"group-data-checked/checkbox:fill-primary-400",
					"group-data-indeterminate/checkbox:fill-primary-400",
					"dark:group-data-checked/checkbox:fill-primary-400",
					"dark:group-data-indeterminate/checkbox:fill-primary-400",
					"dark:group-focus-visible/checkbox:fill-primary-400",
					"group-data-disabled/checkbox:fill-fill-muted",
					"group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-hover/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-hover/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-focus-visible/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-focus-visible/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted"
				],
				overlayRect: ["group-hover/checkbox:group-data-checked/checkbox:opacity-100 group-focus-visible/checkbox:group-data-checked/checkbox:opacity-100", "group-hover/checkbox:group-data-indeterminate/checkbox:opacity-100 group-focus-visible/checkbox:group-data-indeterminate/checkbox:opacity-100"],
				mark: ["text-primary-950 group-data-disabled/checkbox:text-line"]
			}
		},
		{
			theme: "elegant",
			variant: "default",
			color: "primary",
			class: {
				root: [
					"data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
					"data-indeterminate:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
					"hover:data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
					"hover:data-indeterminate:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.2),0_1px_1px_-0.5px_color-mix(in_srgb,var(--primary-glow)_10%,transparent),0_2px_2px_-1px_color-mix(in_srgb,var(--primary-glow)_6%,transparent),0_0_0_1px_var(--primary-edge)]",
					"dark:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"dark:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"dark:hover:data-checked:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"dark:hover:data-indeterminate:shadow-[0_0_0_1px_oklch(0_0_0/0.45),0_2px_4px_oklch(0_0_0/0.25)]",
					"hover:data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"hover:data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
					"data-indeterminate:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]"
				],
				outerRect: [
					"fill-layer-panel",
					"stroke-transparent",
					"dark:fill-layer-inset",
					"group-hover/checkbox:fill-[oklch(0.976_0.001_106.42)] dark:group-hover/checkbox:fill-layer-card",
					"group-focus-visible/checkbox:fill-primary-400",
					"group-hover/checkbox:group-data-checked/checkbox:fill-primary-hover",
					"group-hover/checkbox:group-data-indeterminate/checkbox:fill-primary-hover",
					"group-focus-visible/checkbox:group-data-checked/checkbox:fill-primary-400",
					"group-focus-visible/checkbox:group-data-indeterminate/checkbox:fill-primary-400",
					"group-data-checked/checkbox:fill-primary-400",
					"group-data-indeterminate/checkbox:fill-primary-400",
					"dark:group-data-checked/checkbox:fill-primary-400",
					"dark:group-data-indeterminate/checkbox:fill-primary-400",
					"dark:group-focus-visible/checkbox:fill-primary-400",
					"group-data-disabled/checkbox:fill-fill-muted",
					"group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-hover/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-hover/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-focus-visible/checkbox:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"group-focus-visible/checkbox:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-checked/checkbox:group-data-disabled/checkbox:fill-fill-muted",
					"dark:group-data-indeterminate/checkbox:group-data-disabled/checkbox:fill-fill-muted"
				],
				overlayRect: ["group-hover/checkbox:group-data-checked/checkbox:opacity-100 group-focus-visible/checkbox:group-data-checked/checkbox:opacity-100", "group-hover/checkbox:group-data-indeterminate/checkbox:opacity-100 group-focus-visible/checkbox:group-data-indeterminate/checkbox:opacity-100"],
				mark: ["text-primary-950 group-data-disabled/checkbox:text-line"]
			}
		}
	],
	defaultVariants: {
		color: "default",
		size: "sm",
		variant: "default"
	}
});
function CheckboxCheckIcon({ className }) {
	return /* @__PURE__ */ jsx("svg", {
		width: "10",
		height: "8",
		viewBox: "0 0 10 8",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		className,
		children: /* @__PURE__ */ jsx("path", {
			d: "M1 3.5L4 6.5L9 1.5",
			stroke: "currentColor",
			strokeWidth: "1",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	});
}
function CheckboxIndeterminateIcon({ className }) {
	return /* @__PURE__ */ jsx("svg", {
		width: "8",
		height: "2",
		viewBox: "0 0 8 2",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		className,
		children: /* @__PURE__ */ jsx("path", {
			d: "M0 1H8",
			stroke: "currentColor",
			strokeWidth: "1",
			strokeLinecap: "round"
		})
	});
}
function ElegantCheckboxGraphic({ classNames, shape }) {
	const gradientId = `checkbox-hover-${useId().replace(/:/g, "")}`;
	const radius = shape === "circle" ? 8 : 3;
	return /* @__PURE__ */ jsxs("svg", {
		width: "100%",
		height: "100%",
		viewBox: "0 0 16 16",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		className: classNames.graphic,
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
				id: gradientId,
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ jsx("stop", {
					offset: "0%",
					stopColor: "oklab(100% 0 0 / 14%)"
				}), /* @__PURE__ */ jsx("stop", {
					offset: "100%",
					stopColor: "oklab(0% 0 0 / 3%)"
				})]
			}) }),
			/* @__PURE__ */ jsx("rect", {
				width: "16",
				height: "16",
				rx: radius,
				className: classNames.outerRect
			}),
			/* @__PURE__ */ jsx("rect", {
				width: "16",
				height: "16",
				rx: radius,
				fill: `url(#${gradientId})`,
				className: classNames.overlayRect
			})
		]
	});
}
function Checkbox({ size, color = "default", variant = "default", shape = "square", className, ...props }) {
	const theme = useThemeFamily();
	const { root, indicator, graphic, outerRect, overlayRect, mark, checkMark, indeterminateMark } = checkbox({
		theme,
		size,
		color,
		variant
	});
	if (theme === "elegant") return /* @__PURE__ */ jsxs(Checkbox$1.Root, {
		"data-slot": "checkbox",
		className: root({ className }),
		...props,
		children: [/* @__PURE__ */ jsx(ElegantCheckboxGraphic, {
			shape,
			classNames: {
				graphic: graphic(),
				outerRect: outerRect(),
				overlayRect: overlayRect()
			}
		}), /* @__PURE__ */ jsx(Checkbox$1.Indicator, {
			keepMounted: true,
			"data-slot": "checkbox-indicator",
			className: indicator(),
			render: (indicatorProps, state) => /* @__PURE__ */ jsxs("span", {
				...indicatorProps,
				className: indicator({ className: indicatorProps.className }),
				children: [/* @__PURE__ */ jsx(CheckboxCheckIcon, { className: mark({ className: checkMark({ className: state.checked && !state.indeterminate ? "rotate-0 scale-100 opacity-100" : "" }) }) }), /* @__PURE__ */ jsx(CheckboxIndeterminateIcon, { className: mark({ className: indeterminateMark({ className: state.indeterminate ? "visible scale-x-100 opacity-100" : "" }) }) })]
			})
		})]
	});
	return /* @__PURE__ */ jsx(Checkbox$1.Root, {
		"data-slot": "checkbox",
		className: root({ className }),
		...props,
		children: /* @__PURE__ */ jsx(Checkbox$1.Indicator, {
			keepMounted: true,
			"data-slot": "checkbox-indicator",
			className: indicator(),
			render: (indicatorProps, state) => /* @__PURE__ */ jsx(CheckboxIndicator, {
				...indicatorProps,
				checked: state.checked || state.indeterminate,
				disabled: state.disabled,
				mark: state.indeterminate ? "minus" : "check",
				size,
				shape,
				fill: variant === "primary" || color === "primary" ? "yellow" : "black"
			})
		})
	});
}
//#endregion
//#region src/lib/use-mobile-viewport.ts
const MOBILE_QUERY = "(max-width: 767px)";
function subscribeMobileViewport(onStoreChange) {
	if (typeof window === "undefined") return () => void 0;
	const media = window.matchMedia(MOBILE_QUERY);
	media.addEventListener("change", onStoreChange);
	return () => media.removeEventListener("change", onStoreChange);
}
function getMobileViewportSnapshot() {
	return typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches;
}
function useMobileViewport() {
	return useSyncExternalStore(subscribeMobileViewport, getMobileViewportSnapshot, () => false);
}
//#endregion
//#region src/components/scroll-area/scroll-area.recipe.ts
const scrollArea = tv$1({
	slots: {
		root: ["relative min-h-0"],
		viewport: ["size-full min-h-0 overscroll-contain outline-none", "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]"],
		content: ["min-h-full"],
		scrollbar: [
			"group/scroll-area-scrollbar z-50 flex touch-none select-none p-1",
			"opacity-0 transition-opacity duration-150 pointer-events-none",
			"data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0",
			"data-[orientation=vertical]:w-3 data-[orientation=vertical]:justify-center",
			"data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:justify-center"
		],
		thumb: [
			"relative rounded-full",
			"group-data-[orientation=vertical]/scroll-area-scrollbar:w-1.5",
			"group-data-[orientation=horizontal]/scroll-area-scrollbar:h-1.5"
		],
		corner: ["bg-transparent"]
	},
	variants: { theme: {
		brutal: { thumb: ["bg-black/35 hover:bg-black/55"] },
		elegant: { thumb: ["bg-foreground-muted/35 hover:bg-foreground-muted/55"] }
	} }
});
//#endregion
//#region src/components/scroll-area/scroll-area.tsx
function ScrollArea({ className, ...props }) {
	const { root } = scrollArea({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ScrollArea$1.Root, {
		"data-slot": "scroll-area",
		className: root({ className }),
		...props
	});
}
function ScrollAreaViewport({ className, ...props }) {
	const { viewport } = scrollArea({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ScrollArea$1.Viewport, {
		"data-slot": "scroll-area-viewport",
		className: viewport({ className }),
		...props
	});
}
function ScrollAreaContent({ className, ...props }) {
	const { content } = scrollArea({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ScrollArea$1.Content, {
		"data-slot": "scroll-area-content",
		className: content({ className }),
		...props
	});
}
function ScrollAreaScrollbar({ className, orientation = "vertical", ...props }) {
	const { scrollbar } = scrollArea({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ScrollArea$1.Scrollbar, {
		"data-slot": "scroll-area-scrollbar",
		orientation,
		className: scrollbar({ className }),
		...props
	});
}
function ScrollAreaThumb({ className, ...props }) {
	const { thumb } = scrollArea({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ScrollArea$1.Thumb, {
		"data-slot": "scroll-area-thumb",
		className: thumb({ className }),
		...props
	});
}
function ScrollAreaCorner({ className, ...props }) {
	const { corner } = scrollArea({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ScrollArea$1.Corner, {
		"data-slot": "scroll-area-corner",
		className: corner({ className }),
		...props
	});
}
//#endregion
//#region src/components/sidebar/sidebar.recipe.ts
const headerMaskLayers = [
	"data-[layer=solid]:bg-[linear-gradient(to_bottom,var(--layer-canvas-muted)_0%,var(--layer-canvas-muted)_28%,color-mix(in_oklch,var(--layer-canvas-muted)_82%,transparent)_52%,transparent_100%)]",
	"data-[layer=soft]:h-[108%] data-[layer=soft]:bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--layer-canvas-muted)_48%,transparent)_0%,color-mix(in_oklch,var(--layer-canvas-muted)_18%,transparent)_40%,transparent_100%)]",
	"data-[layer=blur]:h-[112%] data-[layer=blur]:backdrop-blur-[14px] data-[layer=blur]:backdrop-saturate-125",
	"data-[layer=blur]:[mask-image:linear-gradient(to_bottom,black_0%,black_22%,oklch(0_0_0/0.55)_48%,transparent_100%)]",
	"data-[layer=blur]:[-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_22%,oklch(0_0_0/0.55)_48%,transparent_100%)]"
];
const liveActivityFadeOverlay = [
	"has-[_[data-slot=live-agent-activity-bar]]:before:pointer-events-none has-[_[data-slot=live-agent-activity-bar]]:before:absolute has-[_[data-slot=live-agent-activity-bar]]:before:inset-x-0 has-[_[data-slot=live-agent-activity-bar]]:before:-bottom-3 has-[_[data-slot=live-agent-activity-bar]]:before:z-0 has-[_[data-slot=live-agent-activity-bar]]:before:h-20",
	"has-[_[data-slot=live-agent-activity-bar]]:before:bg-[linear-gradient(to_bottom,transparent,var(--layer-canvas-muted))] has-[_[data-slot=live-agent-activity-bar]]:before:backdrop-blur-[4px]",
	"has-[_[data-slot=live-agent-activity-bar]]:before:[mask-image:linear-gradient(to_top,black_50%,transparent)]",
	"has-[_[data-slot=live-agent-activity-bar]]:before:[-webkit-mask-image:linear-gradient(to_top,black_50%,transparent)]",
	"has-[_[data-slot=live-agent-activity-bar]]:before:content-['']"
];
const sidebarRecipe = tv$1({
	slots: {
		sidebarRoot: ["relative flex size-full min-h-0  select-none flex-col", "has-[>[data-slot=sidebar-live-activity]_[data-slot=live-agent-activity-bar]]:overflow-clip"],
		sidebarHeader: ["flex shrink-0 items-center gap-3"],
		sidebarHeaderMask: ["pointer-events-none absolute inset-x-0 top-0 -z-10 hidden"],
		sidebarHeaderMaskLayer: ["absolute inset-x-0 top-0"],
		sidebarHeaderTitle: ["truncate text-lg font-bold text-foreground"],
		sidebarGroupLabel: ["px-2 pt-1 pb-2", "font-mono text-[10px] font-medium uppercase tracking-wider text-foreground-muted"],
		sidebarBody: ["relative flex min-h-0 flex-1 overflow-hidden"],
		sidebarContent: ["relative flex min-h-0 min-w-0 flex-1"],
		sidebarViewport: ["size-full min-h-0  flex-1 overflow-x-hidden overflow-y-auto"],
		sidebarContentInner: ["min-h-full min-w-0 w-full px-2 pt-3", "pb-(--sidebar-content-bottom,12px)"],
		sidebarScrollbar: [
			"z-30 flex w-3 justify-center py-1 opacity-0 transition-opacity duration-150",
			"pointer-events-none",
			"data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
		],
		sidebarLiveActivity: ["pointer-events-none absolute inset-x-0 max-md:hidden"]
	},
	variants: { theme: {
		brutal: {
			sidebarRoot: ["bg-brutal-cream", "md:has-[>[data-slot=sidebar-live-activity]_[data-slot=live-agent-activity-bar]]:[--sidebar-content-bottom:52px]"],
			sidebarHeader: [
				"h-(--shell-header-height,62px) shrink-0 border-b-2 border-black bg-brutal-cream px-5",
				"max-md:bg-primary-400 max-md:px-4",
				"[@media(max-height:600px)]:h-12"
			],
			sidebarBody: "bg-brutal-cream max-md:bg-white",
			sidebarLiveActivity: "bottom-0 z-40"
		},
		elegant: {
			sidebarRoot: [
				"relative bg-layer-canvas-muted [--sidebar-inset-x:28px] md:[--sidebar-inset-x:26px]",
				"md:[--sidebar-inset-end:18px]",
				"md:has-[>[data-slot=sidebar-live-activity]_[data-slot=live-agent-activity-bar]]:[--sidebar-content-bottom:68px]"
			],
			sidebarHeader: [
				"absolute inset-x-0 top-0 z-20 isolate",
				"h-(--shell-header-height,56px) border-b-0 bg-transparent",
				"px-(--sidebar-inset-x,26px) md:pr-[var(--sidebar-inset-end,var(--sidebar-inset-x,26px))]",
				"[&_[data-slot=notification-center-trigger]]:-mr-2"
			],
			sidebarHeaderMask: ["block h-[calc(100%+12px)]"],
			sidebarHeaderMaskLayer: ["h-full", ...headerMaskLayers],
			sidebarHeaderTitle: "font-heading text-[17px] font-medium text-foreground-muted",
			sidebarBody: "bg-layer-canvas-muted",
			sidebarContentInner: ["px-(--sidebar-inset-x,26px) md:pr-[var(--sidebar-inset-end,var(--sidebar-inset-x,26px))]", "pt-(--shell-header-height,56px)"],
			sidebarScrollbar: "justify-end",
			sidebarLiveActivity: [
				"bottom-3 z-10",
				"pl-[26px] pr-4",
				...liveActivityFadeOverlay,
				"*:relative *:z-10"
			]
		}
	} }
});
//#endregion
//#region src/components/sidebar/sidebar.tsx
function SidebarRoot({ className, render, ...props }) {
	const { sidebarRoot } = sidebarRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-root",
			className: sidebarRoot({ className })
		}, props)
	});
}
function SidebarHeader({ children, className, render, ...props }) {
	const { sidebarHeader, sidebarHeaderMask, sidebarHeaderMaskLayer } = sidebarRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-header",
			className: sidebarHeader({ className }),
			children: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("div", {
				"aria-hidden": true,
				"data-slot": "sidebar-header-mask",
				className: sidebarHeaderMask(),
				children: [
					/* @__PURE__ */ jsx("div", {
						"data-slot": "sidebar-header-mask-layer",
						"data-layer": "solid",
						className: sidebarHeaderMaskLayer()
					}),
					/* @__PURE__ */ jsx("div", {
						"data-slot": "sidebar-header-mask-layer",
						"data-layer": "soft",
						className: sidebarHeaderMaskLayer()
					}),
					/* @__PURE__ */ jsx("div", {
						"data-slot": "sidebar-header-mask-layer",
						"data-layer": "blur",
						className: sidebarHeaderMaskLayer()
					})
				]
			}), children] })
		}, props)
	});
}
function SidebarHeaderTitle({ className, render, ...props }) {
	const { sidebarHeaderTitle } = sidebarRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-header-title",
			className: sidebarHeaderTitle({ className })
		}, props)
	});
}
function SidebarGroupLabel({ className, render, ...props }) {
	const { sidebarGroupLabel } = sidebarRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-group-label",
			className: sidebarGroupLabel({ className })
		}, props)
	});
}
function SidebarBody({ className, render, ...props }) {
	const { sidebarBody } = sidebarRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-body",
			className: sidebarBody({ className })
		}, props)
	});
}
function SidebarContent({ children, className, render, ...props }) {
	const isMobile = useMobileViewport();
	const { sidebarContent, sidebarContentInner, sidebarScrollbar, sidebarViewport } = sidebarRecipe({ theme: useThemeFamily() });
	const nativeViewport = useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-content",
			className: sidebarViewport(),
			children: /* @__PURE__ */ jsx("div", {
				className: sidebarContentInner({ className }),
				style: {
					minWidth: 0,
					width: "100%"
				},
				children
			})
		}, props)
	});
	if (isMobile) return /* @__PURE__ */ jsx("div", {
		"data-slot": "sidebar-native-scroll-area",
		className: sidebarContent(),
		children: nativeViewport
	});
	return /* @__PURE__ */ jsxs(ScrollArea, {
		"data-slot": "sidebar-scroll-area",
		className: sidebarContent(),
		children: [/* @__PURE__ */ jsx(ScrollAreaViewport, {
			...props,
			render,
			"data-slot": "sidebar-content",
			className: sidebarViewport(),
			children: /* @__PURE__ */ jsx(ScrollAreaContent, {
				className: sidebarContentInner({ className }),
				style: {
					minWidth: 0,
					width: "100%"
				},
				children
			})
		}), /* @__PURE__ */ jsx(ScrollAreaScrollbar, {
			className: sidebarScrollbar(),
			children: /* @__PURE__ */ jsx(ScrollAreaThumb, {})
		})]
	});
}
function SidebarLiveActivity({ children, className, render, ...props }) {
	const { sidebarLiveActivity } = sidebarRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-live-activity",
			className: sidebarLiveActivity({ className }),
			children
		}, props)
	});
}
//#endregion
//#region src/components/sidebar/sidebar-menu.recipe.ts
const sidebarMenuRecipe = tv$1({
	slots: {
		sidebarMenu: ["flex min-w-0 flex-1 items-center"],
		sidebarMenuIcon: [
			"flex size-3 shrink-0 items-center justify-center",
			"[&_svg]:size-3 [&_svg]:shrink-0",
			"[&_svg]:[vector-effect:non-scaling-stroke] [&_svg_*]:[vector-effect:non-scaling-stroke]"
		],
		sidebarMenuTitle: ["min-w-0 truncate"],
		sidebarMenuAside: ["flex shrink-0 items-center gap-1"],
		sidebarMenuCount: []
	},
	variants: { theme: {
		brutal: {
			sidebarMenu: [
				"h-6 gap-1 text-xs font-bold tracking-widest uppercase",
				"text-black transition-colors hover:text-black/70",
				"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[black]"
			],
			sidebarMenuIcon: ["[&_svg]:stroke-[1.5px]", "[&_svg_*]:stroke-[1.5px]"],
			sidebarMenuCount: ["font-mono normal-case tracking-normal text-black/40"]
		},
		elegant: {
			sidebarMenu: [
				"h-8 w-full justify-between gap-1.5 rounded-md px-(--sidebar-row-inset-x,6px)",
				"text-xs leading-none font-normal normal-case tracking-normal",
				"text-foreground-muted",
				"hover:bg-fill-strong/80 hover:text-foreground",
				"dark:hover:bg-ink-6",
				"active:text-foreground"
			],
			sidebarMenuIcon: ["text-foreground-icon", "[&_svg]:stroke-[1px] [&_svg_*]:stroke-[1px]"],
			sidebarMenuAside: "ml-auto",
			sidebarMenuCount: "shrink-0 font-sans text-xs font-medium leading-none normal-nums text-foreground-icon"
		}
	} }
});
//#endregion
//#region src/components/sidebar/sidebar-menu.tsx
function SidebarMenu({ className, render, ...props }) {
	const { sidebarMenu } = sidebarMenuRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			"data-slot": "sidebar-menu",
			className: sidebarMenu({ className })
		}, props)
	});
}
function SidebarMenuIcon({ className, render, ...props }) {
	const { sidebarMenuIcon } = sidebarMenuRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-menu-icon",
			className: sidebarMenuIcon({ className })
		}, props)
	});
}
function SidebarMenuTitle({ className, render, ...props }) {
	const { sidebarMenuTitle } = sidebarMenuRecipe();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-menu-title",
			className: sidebarMenuTitle({ className })
		}, props)
	});
}
function SidebarMenuAside({ className, render, ...props }) {
	const { sidebarMenuAside } = sidebarMenuRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-menu-aside",
			className: sidebarMenuAside({ className })
		}, props)
	});
}
function SidebarMenuCount({ className, render, ...props }) {
	const { sidebarMenuCount } = sidebarMenuRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-menu-count",
			className: sidebarMenuCount({ className })
		}, props)
	});
}
//#endregion
//#region src/components/badge/badge.tsx
const badge = tv$1({
	slots: { root: [
		"inline-flex w-fit shrink-0 min-w-0 max-w-full items-center gap-1 px-1.5",
		"overflow-hidden whitespace-nowrap",
		"text-[10px] font-bold leading-none",
		"transition-[filter,opacity] duration-100",
		"disabled:cursor-not-allowed disabled:opacity-60",
		"[&_[data-slot='spinner']]:size-3 [&_[data-slot='spinner']]:text-xs"
	] },
	variants: {
		theme: {
			brutal: { root: ["h-5 border border-line-strong enabled:hover:brightness-90"] },
			elegant: { root: [
				"gap-1.5 rounded-full border border-transparent px-2.5 py-0.5",
				"[&:has(svg)]:px-2",
				"[&_svg]:shrink-0 [&_svg]:translate-y-[0.5px]",
				"text-[11px] font-medium leading-3 tracking-[0.22px]",
				"enabled:hover:brightness-[0.96]"
			] }
		},
		appearance: {
			solid: { root: "" },
			soft: { root: "" },
			outline: { root: "" }
		},
		variant: {
			default: { root: "bg-layer-panel text-foreground" },
			primary: { root: "bg-primary-400 text-primary-950" },
			information: { root: "bg-info text-foreground-inverse" },
			muted: { root: "bg-secondary-400 text-foreground" },
			accent: { root: "bg-accent-400 text-accent-950" },
			success: { root: "bg-success text-success-strong" },
			warning: { root: "bg-warning text-warning-foreground" },
			danger: { root: "bg-[oklch(0.66_0.19_31)] text-foreground" }
		},
		uppercase: {
			true: { root: "" },
			false: { root: "" }
		}
	},
	defaultVariants: {
		appearance: "solid",
		variant: "default",
		uppercase: false
	},
	compoundVariants: [
		{
			theme: "brutal",
			uppercase: true,
			class: { root: "uppercase tracking-wide" }
		},
		{
			theme: "brutal",
			appearance: "solid",
			variant: "success",
			class: { root: "bg-brutal-lime text-foreground-strong" }
		},
		{
			theme: "brutal",
			appearance: "solid",
			variant: "danger",
			class: { root: "bg-brutal-red text-foreground-strong" }
		},
		{
			theme: "brutal",
			appearance: "solid",
			variant: "information",
			class: { root: "bg-info text-info-strong" }
		},
		{
			theme: "brutal",
			appearance: "solid",
			variant: "warning",
			class: { root: "bg-warning text-foreground-strong" }
		},
		{
			theme: "brutal",
			appearance: "soft",
			variant: "default",
			class: { root: "bg-secondary-100 text-secondary-800" }
		},
		{
			theme: "brutal",
			appearance: "soft",
			variant: "muted",
			class: { root: "bg-secondary-200 text-secondary-800" }
		},
		{
			theme: "brutal",
			appearance: "soft",
			variant: "primary",
			class: { root: "bg-primary-400/40 text-primary-900" }
		},
		{
			theme: "brutal",
			appearance: "soft",
			variant: "information",
			class: { root: "bg-info-muted text-info-strong" }
		},
		{
			theme: "brutal",
			appearance: "soft",
			variant: "accent",
			class: { root: "bg-accent-200 text-accent-700" }
		},
		{
			theme: "brutal",
			appearance: "soft",
			variant: "success",
			class: { root: "bg-success/30 text-[oklch(0.39_0.11_153.079)]" }
		},
		{
			theme: "brutal",
			appearance: "soft",
			variant: "warning",
			class: { root: "bg-warning-muted text-[oklch(0.43_0.12_44.441)]" }
		},
		{
			theme: "brutal",
			appearance: "soft",
			variant: "danger",
			class: { root: "bg-danger-muted text-danger-strong" }
		},
		{
			theme: "brutal",
			appearance: "outline",
			variant: "default",
			class: { root: "bg-transparent text-foreground" }
		},
		{
			theme: "brutal",
			appearance: "outline",
			variant: "muted",
			class: { root: "bg-transparent text-secondary-900" }
		},
		{
			theme: "brutal",
			appearance: "outline",
			variant: "primary",
			class: { root: "bg-transparent text-primary-700" }
		},
		{
			theme: "brutal",
			appearance: "outline",
			variant: "information",
			class: { root: "bg-transparent text-info-strong" }
		},
		{
			theme: "brutal",
			appearance: "outline",
			variant: "accent",
			class: { root: "bg-transparent text-accent-700" }
		},
		{
			theme: "brutal",
			appearance: "outline",
			variant: "success",
			class: { root: "bg-transparent text-[oklch(0.48_0.12_153.079)]" }
		},
		{
			theme: "brutal",
			appearance: "outline",
			variant: "warning",
			class: { root: "bg-transparent text-warning-strong" }
		},
		{
			theme: "brutal",
			appearance: "outline",
			variant: "danger",
			class: { root: "bg-transparent text-[oklch(0.54_0.19_31)]" }
		},
		{
			theme: "elegant",
			appearance: "solid",
			variant: "default",
			class: { root: "bg-ink-8 text-foreground-muted" }
		},
		{
			theme: "elegant",
			appearance: "solid",
			variant: "muted",
			class: { root: "bg-inactive text-inactive-foreground" }
		},
		{
			theme: "elegant",
			appearance: "solid",
			variant: "primary",
			class: { root: "bg-primary-400 text-[oklch(0.431_0.088_86.67)]" }
		},
		{
			theme: "elegant",
			appearance: "solid",
			variant: "information",
			class: { root: "bg-info text-info-strong dark:text-foreground-inverse" }
		},
		{
			theme: "elegant",
			appearance: "solid",
			variant: "accent",
			class: { root: "bg-accent-400 text-[oklch(0.281_0.112_3.73)]" }
		},
		{
			theme: "elegant",
			appearance: "solid",
			variant: "success",
			class: { root: "bg-success text-success-foreground dark:text-foreground-inverse" }
		},
		{
			theme: "elegant",
			appearance: "solid",
			variant: "warning",
			class: { root: "bg-warning text-warning-foreground dark:text-foreground-inverse" }
		},
		{
			theme: "elegant",
			appearance: "solid",
			variant: "danger",
			class: { root: "bg-[oklch(0.672_0.215_26.69)] text-white dark:text-foreground-inverse" }
		},
		{
			theme: "elegant",
			appearance: "soft",
			variant: "default",
			class: { root: "border-transparent bg-fill-strong text-[oklch(0.409_0_0)] dark:text-[oklch(0.87_0_0)]" }
		},
		{
			theme: "elegant",
			appearance: "soft",
			variant: "muted",
			class: { root: "border-transparent bg-fill-strong text-[oklch(0.447_0.002_67.77)] dark:text-[oklch(0.8_0.002_67.77)]" }
		},
		{
			theme: "elegant",
			appearance: "soft",
			variant: "primary",
			class: { root: "border-transparent bg-primary-soft text-primary-strong" }
		},
		{
			theme: "elegant",
			appearance: "soft",
			variant: "information",
			class: { root: "border-transparent bg-info-soft text-info-strong" }
		},
		{
			theme: "elegant",
			appearance: "soft",
			variant: "accent",
			class: { root: "border-transparent bg-accent-soft text-accent-strong" }
		},
		{
			theme: "elegant",
			appearance: "soft",
			variant: "success",
			class: { root: "border-transparent bg-success-soft text-success-strong" }
		},
		{
			theme: "elegant",
			appearance: "soft",
			variant: "warning",
			class: { root: "border-transparent bg-warning-soft text-warning-strong" }
		},
		{
			theme: "elegant",
			appearance: "soft",
			variant: "danger",
			class: { root: "border-transparent bg-danger-soft text-danger-strong" }
		},
		{
			theme: "elegant",
			appearance: "outline",
			variant: "default",
			class: { root: "border-line-muted bg-transparent text-foreground" }
		},
		{
			theme: "elegant",
			appearance: "outline",
			variant: "muted",
			class: { root: "border-secondary-500 bg-transparent text-secondary-900 dark:text-secondary-300" }
		},
		{
			theme: "elegant",
			appearance: "outline",
			variant: "primary",
			class: { root: "border-primary-500 bg-transparent text-primary-strong" }
		},
		{
			theme: "elegant",
			appearance: "outline",
			variant: "information",
			class: { root: "border-info bg-transparent text-info-strong" }
		},
		{
			theme: "elegant",
			appearance: "outline",
			variant: "accent",
			class: { root: "border-accent-500 bg-transparent text-accent-strong" }
		},
		{
			theme: "elegant",
			appearance: "outline",
			variant: "success",
			class: { root: "border-success bg-transparent text-success-strong" }
		},
		{
			theme: "elegant",
			appearance: "outline",
			variant: "warning",
			class: { root: "border-warning bg-transparent text-warning-strong" }
		},
		{
			theme: "elegant",
			appearance: "outline",
			variant: "danger",
			class: { root: "border-danger bg-transparent text-danger-strong" }
		}
	]
});
function BadgeRoot({ appearance, variant, uppercase, className, render, ...props }) {
	const theme = useThemeFamily();
	const resolvedAppearance = appearance ?? "solid";
	const resolvedUppercase = uppercase ?? false;
	const { root } = badge({
		theme,
		appearance: resolvedAppearance,
		variant,
		uppercase: resolvedUppercase
	});
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: root({ className }) }, props),
		state: {
			slot: "badge",
			appearance: resolvedAppearance,
			variant,
			uppercase: resolvedUppercase
		}
	});
}
function Experimental(props) {
	return /* @__PURE__ */ jsx(BadgeRoot, {
		variant: "success",
		uppercase: true,
		...props,
		children: "Experimental"
	});
}
const Badge = Object.assign(BadgeRoot, { Experimental });
//#endregion
//#region src/components/sidebar/sidebar-item.recipe.ts
const sidebarItemRecipe = tv$1({
	slots: {
		sidebarItem: [
			"group/sidebar-item mb-1 flex w-full items-center gap-1.5 px-2 py-2 text-left",
			"border-2 text-sm font-medium transition-colors",
			"[@media(max-height:600px)]:py-1 md:py-1"
		],
		sidebarItemIcon: ["flex size-4.5 shrink-0 items-center justify-center", "[&>svg]:size-3.5 [&>svg]:shrink-0"],
		sidebarItemChannelIcon: ["flex shrink-0 items-center justify-center", "[&_svg]:shrink-0 [&_svg]:stroke-[1.5]"],
		sidebarItemContent: [
			"has-[>[data-slot=sidebar-item-subtitle]]:*:data-[slot=sidebar-item-title]:max-w-[70%]",
			"has-[>[data-slot=sidebar-item-subtitle]]:*:data-[slot=sidebar-item-title]:shrink-0",
			"has-[>[data-slot=sidebar-item-meta-icon]]:items-center"
		],
		sidebarItemTitle: ["block min-w-0 truncate"],
		sidebarItemSubtitle: ["block min-w-0 flex-1 truncate text-xs font-normal"],
		sidebarItemMeta: ["ml-auto shrink-0 font-mono text-[10px]"],
		sidebarItemStatus: ["shrink-0"],
		sidebarItemIndicator: [
			"size-4 shrink-0 items-center justify-center gap-0 px-0 py-0",
			"[&:has(svg)]:px-0",
			"[&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:translate-y-0"
		],
		sidebarItemMetaIcon: ["inline-flex size-4 shrink-0 items-center justify-center", "[&_svg]:size-3 [&_svg]:shrink-0"],
		sidebarItemAside: ["flex shrink-0 items-center gap-1"],
		sidebarItemCount: ["shrink-0"]
	},
	variants: {
		theme: {
			brutal: {
				sidebarItem: [
					"border-transparent text-black",
					"hover:border-black hover:bg-white hover:shadow-raft-sm",
					"active:border-black active:bg-white active:shadow-raft-sm",
					"data-active:border-black",
					"data-active:shadow-raft-sm",
					"data-popup-open:border-black data-popup-open:bg-white data-popup-open:shadow-raft-sm",
					"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[black]"
				],
				sidebarItemTitle: "font-medium text-black",
				sidebarItemChannelIcon: "[&_svg]:size-3",
				sidebarItemSubtitle: "text-black/40",
				sidebarItemMeta: ["inline-flex h-4 items-center justify-center border border-transparent px-1.5", "font-sans text-xs font-bold leading-none tabular-nums text-black/70"],
				sidebarItemStatus: ["[&>[data-slot=status]]:size-2"],
				sidebarItemIndicator: ["rounded-sm border border-black bg-primary", "text-[10px] font-bold leading-none text-black"],
				sidebarItemMetaIcon: "text-black/70",
				sidebarItemCount: ["h-4 gap-0 rounded-sm border border-black bg-brutal-pink px-1.5 py-0.5", "font-sans text-[10px] font-bold leading-none tabular-nums text-white"]
			},
			elegant: {
				sidebarItem: [
					"relative isolate mb-0.5 -mx-(--sidebar-row-inset-x,6px) w-[calc(100%+12px)] rounded-md border border-transparent px-(--sidebar-row-inset-x,6px) py-1.5 md:py-1.5 [@media(max-height:600px)]:py-1",
					"*:z-10",
					"text-[13px] font-medium text-foreground-muted",
					"hover:border-transparent hover:bg-fill-strong/80 hover:text-foreground",
					"dark:hover:bg-ink-6 dark:active:bg-ink-6",
					"active:border-transparent active:bg-fill-strong/80 active:text-foreground",
					"data-active:border-transparent data-active:bg-layer-panel",
					"dark:data-active:bg-layer-card",
					"data-active:text-foreground-strong",
					"data-active:shadow-raft-sm data-active:ring-1 data-active:ring-line-muted/45",
					"dark:data-active:ring-transparent",
					"data-popup-open:border-transparent data-popup-open:bg-layer-panel",
					"dark:data-popup-open:bg-layer-card",
					"data-popup-open:shadow-raft-xs data-popup-open:ring-1 data-popup-open:ring-line-muted/30",
					"dark:data-popup-open:ring-transparent"
				],
				sidebarItemTitle: "font-[450] text-foreground-muted",
				sidebarItemIcon: "size-4.5 text-foreground-icon [&_svg]:stroke-[1.5]",
				sidebarItemChannelIcon: "size-3 text-foreground-icon [&_svg]:size-3.5",
				sidebarItemSubtitle: "text-ink-30",
				sidebarItemMeta: ["inline-flex h-4 min-w-4 items-center justify-center", "font-sans text-[10px] font-medium leading-none tabular-nums text-foreground-icon"],
				sidebarItemStatus: ["pointer-events-none absolute top-1/2 right-[calc(100%+2px)] -translate-y-1/2", "[&>[data-slot=status]]:size-1"],
				sidebarItemIndicator: ["rounded-sm border-0", "text-[10px] font-normal leading-none tracking-normal"],
				sidebarItemMetaIcon: "text-foreground-icon",
				sidebarItemCount: ["h-4 min-w-4 items-center justify-center rounded-sm px-1 py-0", "text-[10px] font-normal leading-none tabular-nums tracking-normal"]
			}
		},
		variant: {
			default: {},
			primary: {},
			accent: {}
		},
		stacked: {
			false: { sidebarItemContent: ["min-w-0 flex flex-1 items-baseline gap-1 text-left"] },
			true: { sidebarItemContent: ["min-w-0 flex-1 text-left"] }
		}
	},
	defaultVariants: {
		variant: "default",
		stacked: false
	},
	compoundVariants: [
		{
			theme: "brutal",
			variant: "default",
			class: { sidebarItem: "data-active:bg-white" }
		},
		{
			theme: "brutal",
			variant: "primary",
			class: { sidebarItem: "data-active:bg-brutal-yellow" }
		},
		{
			theme: "brutal",
			variant: "accent",
			class: { sidebarItem: "data-active:bg-brutal-pink" }
		}
	]
});
//#endregion
//#region src/components/sidebar/sidebar-item.tsx
function SidebarItemRoot({ active = false, className, render, ...props }) {
	return useRender({
		render: render ?? /* @__PURE__ */ jsx(Button$1, {}),
		props: mergeProps({
			type: "button",
			"data-slot": "sidebar-item",
			"data-active": active ? "true" : void 0,
			className
		}, props)
	});
}
function SidebarItem({ className, variant = "default", ...props }) {
	const { sidebarItem } = sidebarItemRecipe({
		theme: useThemeFamily(),
		variant
	});
	return /* @__PURE__ */ jsx(SidebarItemRoot, {
		"data-variant": variant,
		className: sidebarItem({ className }),
		...props
	});
}
function SidebarItemIcon({ className, render, ...props }) {
	const { sidebarItemIcon } = sidebarItemRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-icon",
			className: sidebarItemIcon({ className })
		}, props)
	});
}
function SidebarItemChannelIcon({ className, render, ...props }) {
	const { sidebarItemChannelIcon } = sidebarItemRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-channel-icon",
			className: sidebarItemChannelIcon({ className })
		}, props)
	});
}
function SidebarItemContent({ className, render, stacked, ...props }) {
	const { sidebarItemContent } = sidebarItemRecipe();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-content",
			className: sidebarItemContent({
				className,
				stacked
			})
		}, props)
	});
}
function SidebarItemTitle({ className, render, ...props }) {
	const { sidebarItemTitle } = sidebarItemRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-title",
			className: sidebarItemTitle({ className })
		}, props)
	});
}
function SidebarItemSubtitle({ className, render, ...props }) {
	const { sidebarItemSubtitle } = sidebarItemRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-subtitle",
			className: sidebarItemSubtitle({ className })
		}, props)
	});
}
function SidebarItemMeta({ className, render, ...props }) {
	const { sidebarItemMeta } = sidebarItemRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-meta",
			className: sidebarItemMeta({ className })
		}, props)
	});
}
function SidebarItemStatus({ className, render, ...props }) {
	const { sidebarItemStatus } = sidebarItemRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-status",
			className: sidebarItemStatus({ className })
		}, props)
	});
}
function SidebarItemIndicator({ appearance = "solid", className, uppercase = false, variant = "primary", ...props }) {
	const { sidebarItemIndicator } = sidebarItemRecipe({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Badge, {
		"data-slot": "sidebar-item-indicator",
		appearance,
		uppercase,
		variant,
		className: sidebarItemIndicator({ className }),
		...props
	});
}
function SidebarItemMetaIcon({ className, render, ...props }) {
	const { sidebarItemMetaIcon } = sidebarItemRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-meta-icon",
			className: sidebarItemMetaIcon({ className })
		}, props)
	});
}
function SidebarItemAside({ className, render, ...props }) {
	const { sidebarItemAside } = sidebarItemRecipe();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-item-aside",
			className: sidebarItemAside({ className })
		}, props)
	});
}
function SidebarItemCount({ appearance = "solid", className, uppercase = false, variant = "primary", ...props }) {
	const { sidebarItemCount } = sidebarItemRecipe({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Badge, {
		"data-slot": "sidebar-item-count",
		appearance,
		uppercase,
		variant,
		className: sidebarItemCount({ className }),
		...props
	});
}
//#endregion
//#region src/components/sidebar/sidebar-section.recipe.ts
const sidebarSectionRecipe = tv$1({
	slots: {
		sidebarSection: [],
		sidebarList: [],
		sidebarSectionEmpty: [],
		sidebarSectionHeader: ["flex items-center justify-between", "group/section-header"],
		sidebarSectionDisclosure: [
			"flex min-w-0 flex-1 items-center",
			"**:data-[slot=sidebar-section-chevron]:transition-transform",
			"[&[data-panel-open]_[data-slot=sidebar-section-chevron]]:rotate-90"
		],
		sidebarSectionTitle: ["min-w-0 truncate"],
		sidebarSectionCount: [],
		sidebarSectionAttention: [
			"inline-flex min-w-4.5 shrink-0 items-center justify-center",
			"group-has-data-panel-open/section-header:hidden",
			"group-has-data-popup-open/section-header:hidden",
			"group-hover/section-header:hidden"
		],
		sidebarSectionTrailing: ["relative flex min-w-4.5 shrink-0 items-center justify-end"],
		sidebarSectionControls: [
			"flex shrink-0 items-center gap-1",
			"pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 opacity-0",
			"max-md:static max-md:pointer-events-auto max-md:translate-y-0 max-md:opacity-100",
			"md:group-hover/section-header:pointer-events-auto md:group-hover/section-header:opacity-100",
			"md:focus-within:pointer-events-auto md:focus-within:opacity-100",
			"md:has-[[data-popup-open]]:pointer-events-auto md:has-[[data-popup-open]]:opacity-100"
		],
		sidebarSectionControl: ["flex size-6 items-center justify-center p-0", "[&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3.5"]
	},
	variants: { theme: {
		brutal: {
			sidebarSection: "px-0",
			sidebarSectionHeader: "mt-3 mb-1 h-6 px-2",
			sidebarSectionEmpty: [
				"px-2",
				"font-sans text-xs leading-snug",
				"text-black/50"
			],
			sidebarSectionDisclosure: [
				"h-6 gap-1.5 border-2 border-transparent text-xs font-bold tracking-widest uppercase",
				"text-black transition-colors hover:text-black/70",
				"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[black]"
			],
			sidebarSectionCount: ["font-mono text-xs font-medium normal-case tracking-normal text-black/70"],
			sidebarSectionControl: [
				"font-sans font-bold text-black/70",
				"transition-colors duration-100",
				"hover:bg-black/5 hover:text-black active:bg-black/10",
				"focus:outline-none focus-visible:bg-black/5 focus-visible:text-black focus-visible:outline-none"
			]
		},
		elegant: {
			sidebarSection: "px-0",
			sidebarSectionEmpty: [
				"px-(--sidebar-row-inset-x,6px)",
				"text-xs leading-snug",
				"text-foreground-icon"
			],
			sidebarSectionHeader: [
				"relative -mx-(--sidebar-row-inset-x,6px) mt-4 mb-0 h-8 w-[calc(100%+12px)] rounded-md px-0",
				"hover:bg-fill-strong/80",
				"dark:hover:bg-ink-6"
			],
			sidebarSectionDisclosure: [
				"h-8 w-full justify-start gap-1.5 rounded-md border border-transparent px-(--sidebar-row-inset-x,6px) text-xs font-medium leading-none normal-case tracking-normal",
				"text-foreground-icon",
				"hover:text-foreground-strong",
				"**:data-[slot=sidebar-section-chevron]:opacity-55"
			],
			sidebarSectionCount: "shrink-0 font-sans text-xs font-medium leading-none normal-nums text-foreground-icon",
			sidebarSectionTrailing: "pr-(--sidebar-row-inset-x,6px)",
			sidebarSectionControls: "right-(--sidebar-row-inset-x,6px)",
			sidebarSectionControl: ["shrink-0", "text-foreground-icon hover:text-foreground-strong"]
		}
	} }
});
//#endregion
//#region src/components/sidebar/sidebar-section.tsx
function SidebarSection({ className, defaultOpen = true, render, ...props }) {
	const { sidebarSection } = sidebarSectionRecipe({ theme: useThemeFamily() });
	const defaultProps = {
		"data-slot": "sidebar-section",
		defaultOpen,
		className: sidebarSection({ className })
	};
	return /* @__PURE__ */ jsx(Collapsible.Root, {
		render: render ?? /* @__PURE__ */ jsx("section", {}),
		...mergeProps(defaultProps, props)
	});
}
function SidebarList({ className, render, ...props }) {
	const { sidebarList } = sidebarSectionRecipe();
	const defaultProps = {
		"data-slot": "sidebar-list",
		className: sidebarList({ className })
	};
	return /* @__PURE__ */ jsx(Collapsible.Panel, {
		render,
		...mergeProps(defaultProps, props)
	});
}
function SidebarSectionEmpty({ className, render, ...props }) {
	const { sidebarSectionEmpty } = sidebarSectionRecipe({ theme: useThemeFamily() });
	const defaultProps = {
		"data-slot": "sidebar-section-empty",
		className: sidebarSectionEmpty({ className })
	};
	return /* @__PURE__ */ jsx(Collapsible.Panel, {
		render,
		...mergeProps(defaultProps, props)
	});
}
function SidebarSectionHeader({ className, render, ...props }) {
	const { sidebarSectionHeader } = sidebarSectionRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-section-header",
			className: sidebarSectionHeader({ className })
		}, props)
	});
}
function SidebarSectionDisclosure({ className, render, ...props }) {
	const { sidebarSectionDisclosure } = sidebarSectionRecipe({ theme: useThemeFamily() });
	const defaultProps = {
		type: "button",
		"data-slot": "sidebar-section-disclosure",
		className: sidebarSectionDisclosure({ className })
	};
	return useRender({
		render: render ?? /* @__PURE__ */ jsx(Collapsible.Trigger, {}),
		props: mergeProps(defaultProps, props)
	});
}
function SidebarSectionChevron({ className, render, ...props }) {
	const defaultProps = {
		"data-slot": "sidebar-section-chevron",
		className: cn("size-3", className)
	};
	return /* @__PURE__ */ jsx("span", {
		className: "flex size-4.5 shrink-0 items-center justify-center",
		"aria-hidden": "true",
		children: useRender({
			render: render ?? /* @__PURE__ */ jsx(ChevronRight, {}),
			props: mergeProps(defaultProps, props)
		})
	});
}
function SidebarSectionTitle({ className, render, ...props }) {
	const { sidebarSectionTitle } = sidebarSectionRecipe();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-section-title",
			className: sidebarSectionTitle({ className })
		}, props)
	});
}
function SidebarSectionCount({ className, render, ...props }) {
	const { sidebarSectionCount } = sidebarSectionRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "sidebar-section-count",
			className: sidebarSectionCount({ className })
		}, props)
	});
}
function SidebarSectionAttention({ className, size = "md", variant, ...props }) {
	const theme = useThemeFamily();
	const { sidebarSectionAttention } = sidebarSectionRecipe();
	const resolvedVariant = variant ?? (theme === "elegant" ? "primary" : "accent");
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": true,
		"data-slot": "sidebar-section-attention",
		className: sidebarSectionAttention(),
		children: /* @__PURE__ */ jsx(Status, {
			size,
			variant: resolvedVariant,
			className,
			...props
		})
	});
}
function SidebarSectionTrailing({ className, render, ...props }) {
	const { sidebarSectionTrailing } = sidebarSectionRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-section-trailing",
			className: sidebarSectionTrailing({ className })
		}, props)
	});
}
function SidebarSectionControls({ className, render, ...props }) {
	const { sidebarSectionControls } = sidebarSectionRecipe({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "sidebar-section-controls",
			className: sidebarSectionControls({ className })
		}, props)
	});
}
function SidebarSectionControl({ className, render, size = "icon-sm", variant = "ghost", loading = false, loadingLabel = "Loading", children, disabled, ...props }) {
	const theme = useThemeFamily();
	const { sidebarSectionControl } = sidebarSectionRecipe({ theme });
	const defaultProps = {
		type: "button",
		"data-slot": "sidebar-section-control",
		"data-loading": loading ? "true" : void 0,
		disabled: disabled || loading,
		"aria-disabled": loading || void 0,
		className: sidebarSectionControl({ className }),
		children: loading ? /* @__PURE__ */ jsx(Spinner, { "aria-label": loadingLabel }) : children
	};
	const brutalControl = useRender({
		render: render ?? /* @__PURE__ */ jsx(Button$1, {}),
		props: mergeProps(defaultProps, props)
	});
	if (theme === "elegant") return /* @__PURE__ */ jsx(Button, {
		"data-slot": "sidebar-section-control",
		size,
		variant,
		loading,
		loadingLabel,
		disabled,
		className: sidebarSectionControl({ className }),
		render,
		...props,
		children
	});
	return brutalControl;
}
const SidebarControl = SidebarSectionControl;
//#endregion
//#region src/components/panel/panel.recipe.ts
const panel = tv$1({
	slots: {
		root: ["[--panel-footer-clearance:10rem]", "text-foreground-strong"],
		header: ["[@media(max-height:600px)]:h-12"],
		body: ["relative min-h-0 flex-1 overflow-hidden"],
		scrollViewport: ["h-full min-h-0 overflow-y-auto overscroll-contain", "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]"],
		scrollContent: ["min-h-full"],
		section: ["border-t border-ink-10 px-5 py-4"],
		footer: ["relative flex shrink-0 items-center px-3 max-md:px-1.5 pt-3", "pb-[calc(env(safe-area-inset-bottom)+0.75rem)] max-md:pb-[calc(env(safe-area-inset-bottom)+0.375rem)]"]
	},
	variants: {
		theme: {
			brutal: {},
			elegant: {
				scrollContent: "md:pb-[var(--panel-footer-clearance)]",
				footer: [
					"z-40 md:absolute md:inset-x-0 md:bottom-0",
					"max-md:px-2.5 md:px-7 max-md:pt-0 md:pt-0",
					"max-md:pb-[calc(env(safe-area-inset-bottom)+0.625rem)] md:pb-3",
					"border-t-0 bg-transparent",
					"before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:z-0 before:h-36",
					"before:bg-[linear-gradient(to_bottom,transparent,var(--layer-panel))] before:backdrop-blur-[4px]",
					"dark:before:bg-[linear-gradient(to_bottom,transparent,oklch(0_0_0/0.16))] dark:before:backdrop-blur-[2px]",
					"before:mask-[linear-gradient(to_top,black_50%,transparent),linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]",
					"before:[-webkit-mask-image:linear-gradient(to_top,black_50%,transparent),linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]",
					"before:mask-intersect before:[-webkit-mask-composite:source-in]",
					"before:content-[''] *:relative *:z-10"
				]
			}
		},
		edge: {
			inset: { root: "group/panel-frame" },
			attached: { root: "group/panel-frame" }
		}
	},
	compoundVariants: [{
		theme: "brutal",
		edge: "attached",
		class: { root: ["border-l-2 border-black", "*:data-panel-frame-header:border-b-2 *:data-panel-frame-header:border-black"] }
	}, {
		theme: "elegant",
		edge: "attached",
		class: { root: ["border-l border-line-muted", "*:data-panel-frame-header:border-b *:data-panel-frame-header:border-line-muted"] }
	}]
});
//#endregion
//#region src/components/panel/panel.tsx
function Panel({ className, edge, render, ...props }) {
	const { root } = panel({
		edge,
		theme: useThemeFamily()
	});
	return useRender({
		defaultTagName: "section",
		render,
		props: mergeProps({
			"data-edge": edge,
			"data-slot": "panel",
			className: root({ className })
		}, props)
	});
}
/**
* Bare header bar: fixed height and centered flex row, no border, fill, or padding.
* Shared base for `PanelHeader`, `PanelSectionHeader`, and panel-specific headers
* such as `ThreadPanelHeader` — it is not exclusive to `PanelHeader`.
*/
function PanelHeaderRoot({ className, render, ...props }) {
	const { header } = panel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-header-root",
			className: header({ className })
		}, props)
	});
}
function PanelBody({ className, render, ...props }) {
	const { body } = panel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-body",
			className: body({ className })
		}, props)
	});
}
function PanelScrollViewport({ className, render, ...props }) {
	const { scrollViewport } = panel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-scroll-viewport",
			className: scrollViewport({ className })
		}, props)
	});
}
function PanelScrollContent({ className, render, ...props }) {
	const { scrollContent } = panel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-scroll-content",
			className: scrollContent({ className })
		}, props)
	});
}
function PanelSection({ className, render, ...props }) {
	const { section } = panel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "section",
		render,
		props: mergeProps({
			"data-slot": "panel-section",
			className: section({ className })
		}, props)
	});
}
function PanelFooter({ className, render, ...props }) {
	const { footer } = panel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-footer",
			className: footer({ className })
		}, props)
	});
}
//#endregion
//#region src/components/conversation-panel/conversation-panel.recipe.ts
const conversationPanel = tv$1({
	slots: {
		root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col"],
		content: ["flex min-h-0 min-w-0 flex-1 flex-col"],
		tabs: ["shrink-0"],
		footer: []
	},
	variants: { theme: {
		brutal: {
			root: "bg-white font-sans text-black",
			content: "bg-white",
			tabs: [
				"border-b-2 border-black bg-white",
				"*:data-[slot=tabs-list]:max-w-none *:data-[slot=tabs-list]:border-y-0 *:data-[slot=tabs-list]:border-l-0 *:data-[slot=tabs-list]:border-r-2 *:data-[slot=tabs-list]:border-black *:data-[slot=tabs-list]:bg-white",
				"[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:bg-white [&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:text-black",
				"[&>[data-slot=tabs-list]>[data-slot=tabs-tab]:first-child]:pl-[22px]",
				"[&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]]:bg-primary [&>[data-slot=tabs-list]>[data-slot=tabs-tab][data-active]:hover]:bg-primary",
				"[&>[data-slot=tabs-list]>[data-slot=tabs-tab]+[data-slot=tabs-tab]]:before:bg-black"
			],
			footer: "border-t-2 border-black bg-white"
		},
		elegant: {
			root: "relative bg-layer-canvas-muted font-sans text-foreground-strong",
			content: [
				"relative overflow-clip",
				"bg-layer-panel",
				"dark:bg-layer-card",
				"group-data-[edge=inset]/panel-frame:md:ml-2 group-data-[edge=inset]/panel-frame:md:rounded-tl-[10px]",
				"group-data-[edge=inset]/panel-frame:md:shadow-raft-xl",
				"dark:group-data-[edge=inset]/panel-frame:md:shadow-[0_0_0_1px_var(--line-muted),0_16px_32px_-8px_oklch(0_0_0_/_0.45)]"
			],
			tabs: [
				"border-b-0 bg-layer-panel max-md:bg-layer-canvas-muted",
				"dark:bg-transparent dark:max-md:bg-layer-canvas-muted",
				"max-md:border-b max-md:border-line-muted",
				"*:data-[slot=tabs-list]:border-b-0",
				"[&>[data-slot=tabs-list]]:max-md:h-10",
				"[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:max-md:h-10",
				"[&>[data-slot=tabs-list]>[data-slot=tabs-tab]]:max-md:py-2",
				"[&>[data-slot=tabs-list]>[data-slot=tabs-indicator]]:bg-primary-400",
				"max-md:[&>[data-slot=tabs-list]>[data-slot=tabs-indicator]]:h-px"
			]
		}
	} }
});
//#endregion
//#region src/components/conversation-panel/conversation-panel.tsx
function ConversationPanelRoot({ className, edge = "inset", render, ...props }) {
	const { root } = conversationPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Panel, {
		...props,
		render,
		edge,
		"data-slot": "conversation-panel-root",
		className: root({ className })
	});
}
/**
* Content region below the conversation header. A single container hosting tabs,
* body, and footer; elegant mobile sits flush to the bottom with top radius
* and top gap only; desktop keeps the left inset / rounded-tl treatment.
*/
function ConversationPanelContent({ className, render, ...props }) {
	const { content } = conversationPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "conversation-panel-content",
			className: content({ className })
		}, props)
	});
}
function ConversationPanelBody({ className, render, ...props }) {
	return /* @__PURE__ */ jsx(PanelBody, {
		...props,
		render,
		"data-slot": "conversation-panel-body",
		className
	});
}
function ConversationPanelTabs({ className, render, ...props }) {
	const { tabs } = conversationPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "conversation-panel-tabs",
			className: tabs({ className })
		}, props)
	});
}
function ConversationPanelFooter({ className, render, ...props }) {
	const { footer } = conversationPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelFooter, {
		...props,
		render,
		"data-slot": "conversation-panel-footer",
		className: footer({ className })
	});
}
//#endregion
//#region src/components/conversation-panel/conversation-panel-empty-state.tsx
const conversationPanelEmptyState = tv$1({
	slots: {
		root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3", "text-center"],
		brand: ["hidden shrink-0 rounded-md p-0.5"],
		brandMark: ["relative flex size-8 items-center justify-center overflow-hidden rounded-sm", "[&>svg]:relative [&>svg]:z-10 [&>svg]:h-5 [&>svg]:w-auto"]
	},
	variants: { theme: {
		brutal: { root: "font-heading text-lg font-bold text-black/40 uppercase" },
		elegant: {
			root: "font-heading text-sm font-medium tracking-wide text-foreground-muted",
			brand: "block bg-primary-100 shadow-raft-md ring-1 ring-line-muted/45 dark:ring-transparent",
			brandMark: [
				"bg-primary-400 shadow-raft-md ring-1 ring-line-muted/45 dark:ring-transparent",
				"before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit]",
				"before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/8%)_0%,oklab(0%_0_0/3%)_100%)] before:content-['']",
				"dark:before:hidden"
			]
		}
	} }
});
function ConversationPanelEmptyState({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = conversationPanelEmptyState({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "conversation-panel-empty-state",
			className: root({ className })
		}, props)
	});
}
function ConversationPanelEmptyStateBrand({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { brand } = conversationPanelEmptyState({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "conversation-panel-empty-state-brand",
			className: brand({ className })
		}, props)
	});
}
function ConversationPanelEmptyStateBrandMark({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { brandMark } = conversationPanelEmptyState({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "conversation-panel-empty-state-brand-mark",
			className: brandMark({ className })
		}, props)
	});
}
//#endregion
//#region src/components/kbd/kbd.tsx
const kbd = tv$1({
	slots: {
		root: [
			"pointer-events-none inline-flex w-fit shrink-0 items-center justify-center gap-1",
			"whitespace-nowrap font-sans text-sm font-medium leading-none select-none",
			"[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3"
		],
		group: ["inline-flex items-center gap-1"]
	},
	variants: { theme: {
		brutal: { root: ["text-[13px] text-foreground-strong/70"] },
		elegant: { root: [
			"min-w-5 rounded-sm bg-layer-panel px-1.5 py-1 text-[10px]",
			"font-medium text-foreground-muted ring-1 ring-inset ring-line-hairline",
			"dark:bg-fill-muted dark:ring-transparent",
			"dark:shadow-[inset_0_1px_0_oklch(0.985_0.004_106.42/0.07),0_0_0_1px_oklch(0_0_0/0.45),0_1.5px_0_oklch(0_0_0/0.5)]"
		] }
	} }
});
function Kbd({ className, ...props }) {
	const theme = useThemeFamily();
	const { root } = kbd({ theme });
	return /* @__PURE__ */ jsx("kbd", {
		"data-slot": "kbd",
		className: root({ className }),
		...props
	});
}
function KbdGroup({ className, ...props }) {
	const theme = useThemeFamily();
	const { group } = kbd({ theme });
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "kbd-group",
		className: group({ className }),
		...props
	});
}
//#endregion
//#region src/components/context-menu/context-menu.tsx
const contextMenu = tv$1({
	slots: {
		trigger: ["select-none"],
		positioner: ["isolate z-50 outline-none"],
		content: ["flex flex-col max-h-(--available-height) min-w-48 overflow-hidden bg-layer-panel", "outline-none"],
		item: ["flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1", "text-left text-sm outline-none transition-colors"],
		radioItem: ["flex w-full cursor-default select-none items-center gap-2 px-3", "text-left outline-none transition-colors"],
		submenuTrigger: ["flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1", "text-left text-sm outline-none transition-colors"],
		itemLabel: ["min-w-0 flex-1 truncate text-left"],
		footer: ["px-3 py-2 text-xs text-foreground-muted tabular-nums"],
		label: [],
		shortcut: ["ml-auto"],
		separator: ["border-t-2"],
		indicator: ["pointer-events-none ml-auto flex size-3 shrink-0 items-center justify-center"]
	},
	variants: { theme: {
		brutal: {
			content: ["border-2 border-black bg-layer-popover shadow-raft-md"],
			item: [
				"py-2 font-sans text-sm font-semibold leading-5 text-foreground-strong hover:bg-brutal-yellow/30 data-highlighted:bg-brutal-yellow/30",
				"data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5"
			],
			radioItem: [
				"h-9 overflow-hidden font-sans text-sm font-semibold leading-6 text-foreground-strong",
				"border-b border-ink-10 last:border-b-0",
				"hover:bg-brutal-yellow/30 data-highlighted:bg-brutal-yellow/30",
				"data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5"
			],
			submenuTrigger: [
				"py-2 font-sans text-sm font-semibold leading-5 text-foreground-strong hover:bg-brutal-yellow/30 data-highlighted:bg-brutal-yellow/30 data-popup-open:bg-brutal-yellow/30",
				"data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3.5"
			],
			label: ["border-b border-line-strong px-3 py-2", "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-foreground-strong/60"],
			shortcut: ["font-sans text-sm font-semibold leading-6"],
			separator: ["border-black"],
			indicator: []
		},
		elegant: {
			content: ["gap-0.5 rounded-md bg-layer-popover p-1", "shadow-raft-lg outline-none"],
			item: [
				"gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
				"text-foreground-muted",
				"transition-[background-color,color] duration-150",
				"hover:bg-ink-4 hover:text-foreground",
				"data-highlighted:bg-ink-4 data-highlighted:text-foreground",
				"data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
				"[&>svg]:text-foreground-muted",
				"hover:[&>svg]:text-foreground",
				"data-highlighted:[&>svg]:text-foreground"
			],
			radioItem: [
				"gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
				"text-foreground-muted",
				"transition-[background-color,color] duration-150",
				"hover:bg-ink-4 hover:text-foreground",
				"data-highlighted:bg-ink-4 data-highlighted:text-foreground",
				"data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
				"[&>svg]:text-foreground-muted",
				"hover:[&>svg]:text-foreground",
				"data-highlighted:[&>svg]:text-foreground"
			],
			submenuTrigger: [
				"gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
				"text-foreground-muted",
				"transition-[background-color,color] duration-150",
				"hover:bg-ink-4 hover:text-foreground",
				"data-highlighted:bg-ink-4 data-highlighted:text-foreground",
				"data-popup-open:bg-ink-4 data-popup-open:text-foreground",
				"data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
				"[&>svg~svg:last-child]:size-3",
				"[&>svg]:text-foreground-muted",
				"hover:[&>svg]:text-foreground",
				"data-highlighted:[&>svg]:text-foreground",
				"data-popup-open:[&>svg]:text-foreground"
			],
			label: ["-mx-1 mb-1 border-b border-line-hairline px-3 py-2 dark:border-ink-6", "text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45"],
			shortcut: ["text-foreground-muted"],
			separator: ["my-1 -mx-1 h-px border-0 bg-line-hairline dark:bg-ink-6"],
			indicator: []
		}
	} }
});
function ContextMenu(props) {
	return /* @__PURE__ */ jsx(ContextMenu$1.Root, {
		"data-slot": "context-menu",
		...props
	});
}
function ContextMenuSubmenu(props) {
	return /* @__PURE__ */ jsx(ContextMenu$1.SubmenuRoot, {
		"data-slot": "context-menu-submenu",
		...props
	});
}
function ContextMenuTrigger({ className, ...props }) {
	const theme = useThemeFamily();
	const { trigger } = contextMenu({ theme });
	return /* @__PURE__ */ jsx(ContextMenu$1.Trigger, {
		"data-slot": "context-menu-trigger",
		className: trigger({ className }),
		...props
	});
}
function ContextMenuPortal(props) {
	return /* @__PURE__ */ jsx(ContextMenu$1.Portal, {
		"data-slot": "context-menu-portal",
		...useThemeScopeProps(props)
	});
}
function ContextMenuContent({ align = "start", alignOffset = 0, anchor, arrowPadding, collisionAvoidance = {
	side: "shift",
	align: "shift",
	fallbackAxisSide: "none"
}, collisionBoundary, collisionPadding = 8, disableAnchorTracking = true, positionMethod = "fixed", side = "right", sideOffset = 0, sticky, portalProps, className, ...props }) {
	const theme = useThemeFamily();
	const { positioner, content } = contextMenu({ theme });
	return /* @__PURE__ */ jsx(ContextMenuPortal, {
		...portalProps,
		children: /* @__PURE__ */ jsx(ContextMenu$1.Positioner, {
			align,
			alignOffset,
			anchor,
			arrowPadding,
			collisionAvoidance,
			collisionBoundary,
			collisionPadding,
			disableAnchorTracking,
			positionMethod,
			side,
			sideOffset,
			sticky,
			className: positioner(),
			children: /* @__PURE__ */ jsx(ContextMenu$1.Popup, {
				"data-slot": "context-menu-content",
				className: content({ className }),
				...props
			})
		})
	});
}
function ContextMenuPopup({ className, ...props }) {
	const theme = useThemeFamily();
	const { content } = contextMenu({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "context-menu-content",
		className: content({ className }),
		...props
	});
}
function ContextMenuItem({ className, ...props }) {
	const theme = useThemeFamily();
	const { item } = contextMenu({ theme });
	return /* @__PURE__ */ jsx(ContextMenu$1.Item, {
		"data-slot": "context-menu-item",
		className: item({ className }),
		...props
	});
}
function ContextMenuItemLabel({ className, ...props }) {
	const { itemLabel } = contextMenu();
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "context-menu-item-label",
		className: itemLabel({ className }),
		...props
	});
}
function ContextMenuFooter({ className, ...props }) {
	const { footer } = contextMenu();
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "context-menu-footer",
		className: footer({ className }),
		...props
	});
}
function ContextMenuSubmenuTrigger({ className, ...props }) {
	const theme = useThemeFamily();
	const { submenuTrigger } = contextMenu({ theme });
	return /* @__PURE__ */ jsx(ContextMenu$1.SubmenuTrigger, {
		"data-slot": "context-menu-submenu-trigger",
		className: submenuTrigger({ className }),
		...props
	});
}
function ContextMenuLabel({ className, ...props }) {
	const theme = useThemeFamily();
	const { label } = contextMenu({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "context-menu-label",
		className: label({ className }),
		...props
	});
}
function ContextMenuShortcut({ className, ...props }) {
	const theme = useThemeFamily();
	const { shortcut } = contextMenu({ theme });
	return /* @__PURE__ */ jsx(Kbd, {
		"data-slot": "context-menu-shortcut",
		className: shortcut({ className }),
		...props
	});
}
function ContextMenuSeparator({ className, ...props }) {
	const theme = useThemeFamily();
	const { separator } = contextMenu({ theme });
	return /* @__PURE__ */ jsx(ContextMenu$1.Separator, {
		"data-slot": "context-menu-separator",
		className: separator({ className }),
		...props
	});
}
function ContextMenuCheckIcon() {
	return /* @__PURE__ */ jsx("svg", {
		width: "12",
		height: "12",
		viewBox: "0 0 12 12",
		"aria-hidden": true,
		className: "size-3 shrink-0",
		children: /* @__PURE__ */ jsx("g", {
			fill: "none",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			strokeWidth: "1",
			stroke: "currentColor",
			children: /* @__PURE__ */ jsx("path", { d: "M1.75 6.41L4.4 9.25L10.25 2.99" })
		})
	});
}
function ContextMenuRadioGroup({ ...props }) {
	return /* @__PURE__ */ jsx(ContextMenu$1.RadioGroup, {
		"data-slot": "context-menu-radio-group",
		...props
	});
}
function ContextMenuRadioItem({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { radioItem, indicator } = contextMenu({ theme });
	return /* @__PURE__ */ jsxs(ContextMenu$1.RadioItem, {
		"data-slot": "context-menu-radio-item",
		className: radioItem({ className }),
		...props,
		children: [children, /* @__PURE__ */ jsx("span", {
			className: indicator(),
			children: /* @__PURE__ */ jsx(ContextMenu$1.RadioItemIndicator, { children: /* @__PURE__ */ jsx(ContextMenuCheckIcon, {}) })
		})]
	});
}
function ContextMenuRadioItemIndicator({ className, ...props }) {
	return /* @__PURE__ */ jsx(ContextMenu$1.RadioItemIndicator, {
		"data-slot": "context-menu-radio-item-indicator",
		className,
		...props
	});
}
function ContextMenuCheckboxItem({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { item, indicator } = contextMenu({ theme });
	return /* @__PURE__ */ jsxs(ContextMenu$1.CheckboxItem, {
		"data-slot": "context-menu-checkbox-item",
		className: item({ className }),
		...props,
		children: [children, /* @__PURE__ */ jsx("span", {
			className: indicator(),
			children: /* @__PURE__ */ jsx(ContextMenu$1.CheckboxItemIndicator, { children: /* @__PURE__ */ jsx(ContextMenuCheckIcon, {}) })
		})]
	});
}
function ContextMenuCheckboxItemIndicator({ className, ...props }) {
	return /* @__PURE__ */ jsx(ContextMenu$1.CheckboxItemIndicator, {
		"data-slot": "context-menu-checkbox-item-indicator",
		className,
		...props
	});
}
//#endregion
//#region src/components/dropdown-menu/dropdown-menu.tsx
const dropdownMenu = tv$1({
	slots: {
		trigger: ["select-none"],
		positioner: ["isolate z-50 outline-none"],
		content: ["max-h-(--available-height) min-w-48 overflow-hidden bg-layer-panel", "outline-none"],
		item: ["flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1", "text-left text-sm outline-none transition-colors"],
		radioItem: ["flex w-full cursor-default select-none items-center gap-2 px-3", "text-left outline-none transition-colors"],
		submenuTrigger: ["flex w-full cursor-default select-none items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1", "text-left text-sm outline-none transition-colors"],
		itemLabel: ["min-w-0 flex-1 truncate text-left"],
		footer: ["px-3 py-2 text-xs text-foreground-muted tabular-nums"],
		label: [],
		shortcut: ["ml-auto"],
		itemCount: ["ml-auto inline-flex min-w-5 justify-center gap-0 px-1 tabular-nums"],
		separator: ["border-t-2"],
		indicator: ["pointer-events-none ml-auto flex size-3 shrink-0 items-center justify-center"],
		radioLabel: []
	},
	variants: { theme: {
		brutal: {
			trigger: ["data-popup-open:-translate-y-px data-popup-open:shadow-raft-md", "active:translate-x-0 active:-translate-y-px active:shadow-raft-md"],
			content: ["border-2 border-black bg-layer-popover shadow-raft-md"],
			item: [
				"py-2 font-sans text-sm font-medium text-foreground-strong hover:bg-primary/30 data-highlighted:bg-primary/30",
				"data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
				"data-[selected]:font-bold data-[emphasis=strong]:font-bold",
				"data-[interaction=signal]:hover:bg-primary data-[interaction=signal]:data-highlighted:bg-primary",
				"data-[interaction=accent]:hover:bg-brutal-pink data-[interaction=accent]:data-highlighted:bg-brutal-pink",
				"[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2 [&>svg:not([class*='size-'])]:size-3.5"
			],
			radioItem: [
				"overflow-hidden py-2 font-sans text-sm font-medium leading-5 text-foreground-strong",
				"border-b border-ink-10 last:border-b-0",
				"hover:bg-primary/30 data-highlighted:bg-primary/30",
				"data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
				"[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2 [&>svg:not([class*='size-'])]:size-3.5"
			],
			radioLabel: ["min-w-0 flex-1 truncate"],
			submenuTrigger: [
				"py-2 font-sans text-sm font-medium text-foreground-strong hover:bg-primary/30 data-highlighted:bg-primary/30 data-popup-open:bg-primary/30",
				"data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
				"[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2 [&>svg:not([class*='size-'])]:size-3.5"
			],
			label: ["border-b border-line-strong px-3 py-2", "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-foreground-strong/60"],
			shortcut: ["font-sans text-sm font-medium"],
			itemCount: ["rounded-sm border border-line-strong bg-brutal-pink px-1 py-0.5", "font-sans text-[10px] leading-none font-bold text-white"],
			separator: ["border-black"],
			indicator: []
		},
		elegant: {
			trigger: ["hover:bg-ink-2 active:scale-100"],
			content: [
				"gap-0 rounded-md bg-layer-popover p-1",
				"shadow-raft-lg outline-none",
				"flex flex-col"
			],
			item: [
				"gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
				"text-foreground-muted",
				"transition-[background-color,color] duration-150",
				"hover:bg-ink-4 hover:text-foreground",
				"data-highlighted:bg-ink-4 data-highlighted:text-foreground",
				"data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
				"[&>svg]:text-foreground-muted",
				"hover:[&>svg]:text-foreground",
				"data-highlighted:[&>svg]:text-foreground"
			],
			radioItem: [
				"gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
				"text-foreground-muted",
				"transition-[background-color,color] duration-150",
				"hover:bg-ink-4 hover:text-foreground",
				"data-highlighted:bg-ink-4 data-highlighted:text-foreground",
				"data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
				"[&>svg]:text-foreground-muted",
				"hover:[&>svg]:text-foreground",
				"data-highlighted:[&>svg]:text-foreground"
			],
			radioLabel: ["min-w-0 flex-1 truncate"],
			submenuTrigger: [
				"gap-2.5 rounded-sm px-3 py-1.5 text-[13px] font-normal tracking-[-0.005em]",
				"text-foreground-muted",
				"transition-[background-color,color] duration-150",
				"hover:bg-ink-4 hover:text-foreground",
				"data-highlighted:bg-ink-4 data-highlighted:text-foreground",
				"data-popup-open:bg-ink-4 data-popup-open:text-foreground",
				"data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&>svg]:size-4",
				"[&>svg~svg:last-child]:size-3",
				"[&>svg]:text-foreground-muted",
				"hover:[&>svg]:text-foreground",
				"data-highlighted:[&>svg]:text-foreground",
				"data-popup-open:[&>svg]:text-foreground"
			],
			label: ["-mx-1 mb-1 border-b border-line-hairline px-3 py-2 dark:border-ink-6", "text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45"],
			shortcut: ["text-foreground-muted"],
			itemCount: [],
			separator: ["my-1 -mx-1 h-px border-0 bg-line-hairline dark:bg-ink-6"],
			indicator: []
		}
	} }
});
function DropdownMenu(props) {
	return /* @__PURE__ */ jsx(Menu.Root, {
		"data-slot": "dropdown-menu",
		...props
	});
}
function DropdownMenuSubmenu(props) {
	return /* @__PURE__ */ jsx(Menu.SubmenuRoot, {
		"data-slot": "dropdown-menu-submenu",
		...props
	});
}
function DropdownMenuTrigger({ className, render = /* @__PURE__ */ jsx(Button, {
	variant: "outline",
	size: "md"
}), ...props }) {
	const theme = useThemeFamily();
	const { trigger } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx(Menu.Trigger, {
		"data-slot": "dropdown-menu-trigger",
		render,
		className: trigger({ className }),
		...props
	});
}
function DropdownMenuPortal(props) {
	return /* @__PURE__ */ jsx(Menu.Portal, {
		"data-slot": "dropdown-menu-portal",
		...useThemeScopeProps(props)
	});
}
function DropdownMenuPopup({ className, ...props }) {
	const theme = useThemeFamily();
	const { content } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "dropdown-menu-content",
		className: content({ className }),
		...props
	});
}
function DropdownMenuContent({ align = "start", alignOffset = 0, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking = false, positionMethod = "fixed", side = "bottom", sideOffset, sticky, portalProps, className, ...props }) {
	const theme = useThemeFamily();
	const resolvedSideOffset = sideOffset ?? (theme === "elegant" ? 6 : 4);
	const { positioner, content } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx(DropdownMenuPortal, {
		...portalProps,
		children: /* @__PURE__ */ jsx(Menu.Positioner, {
			align,
			alignOffset,
			anchor,
			arrowPadding,
			collisionAvoidance,
			collisionBoundary,
			collisionPadding,
			disableAnchorTracking,
			positionMethod,
			side,
			sideOffset: resolvedSideOffset,
			sticky,
			className: positioner(),
			children: /* @__PURE__ */ jsx(Menu.Popup, {
				"data-slot": "dropdown-menu-content",
				className: content({ className }),
				...props
			})
		})
	});
}
function DropdownMenuItem({ className, ...props }) {
	const theme = useThemeFamily();
	const { item } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx(Menu.Item, {
		"data-slot": "dropdown-menu-item",
		className: item({ className }),
		...props
	});
}
function DropdownMenuItemLabel({ className, ...props }) {
	const { itemLabel } = dropdownMenu();
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "dropdown-menu-item-label",
		className: itemLabel({ className }),
		...props
	});
}
function DropdownMenuFooter({ className, ...props }) {
	const { footer } = dropdownMenu();
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "dropdown-menu-footer",
		className: footer({ className }),
		...props
	});
}
function DropdownMenuSubmenuTrigger({ className, ...props }) {
	const theme = useThemeFamily();
	const { submenuTrigger } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx(Menu.SubmenuTrigger, {
		"data-slot": "dropdown-menu-submenu-trigger",
		className: submenuTrigger({ className }),
		...props
	});
}
function DropdownMenuLabel({ className, ...props }) {
	const theme = useThemeFamily();
	const { label } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "dropdown-menu-label",
		className: label({ className }),
		...props
	});
}
function DropdownMenuShortcut({ className, ...props }) {
	const theme = useThemeFamily();
	const { shortcut } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx(Kbd, {
		"data-slot": "dropdown-menu-shortcut",
		className: shortcut({ className }),
		...props
	});
}
function DropdownMenuItemCount({ className, ...props }) {
	const theme = useThemeFamily();
	const { itemCount } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx(Badge, {
		"data-slot": "dropdown-menu-item-count",
		className: itemCount({ className }),
		...props
	});
}
function DropdownMenuSeparator({ className, ...props }) {
	const theme = useThemeFamily();
	const { separator } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsx(Menu.Separator, {
		"data-slot": "dropdown-menu-separator",
		className: separator({ className }),
		...props
	});
}
function DropdownMenuCheckIcon() {
	return /* @__PURE__ */ jsx("svg", {
		width: "12",
		height: "12",
		viewBox: "0 0 12 12",
		"aria-hidden": true,
		className: "size-3 shrink-0",
		children: /* @__PURE__ */ jsx("g", {
			fill: "none",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			strokeWidth: "1",
			stroke: "currentColor",
			children: /* @__PURE__ */ jsx("path", { d: "M1.75 6.41L4.4 9.25L10.25 2.99" })
		})
	});
}
function DropdownMenuRadioGroup({ ...props }) {
	return /* @__PURE__ */ jsx(Menu.RadioGroup, {
		"data-slot": "dropdown-menu-radio-group",
		...props
	});
}
function DropdownMenuRadioItem({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { radioItem, radioLabel, indicator } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsxs(Menu.RadioItem, {
		"data-slot": "dropdown-menu-radio-item",
		className: radioItem({ className }),
		...props,
		children: [renderRadioItemChildren(children, radioLabel()), /* @__PURE__ */ jsx("span", {
			className: indicator(),
			children: /* @__PURE__ */ jsx(Menu.RadioItemIndicator, { children: /* @__PURE__ */ jsx(DropdownMenuCheckIcon, {}) })
		})]
	});
}
function renderRadioItemChildren(children, className) {
	if (typeof children === "string" || typeof children === "number") return /* @__PURE__ */ jsx("span", {
		"data-slot": "dropdown-menu-radio-item-label",
		className,
		children
	});
	if (Array.isArray(children) && children.every((child) => typeof child === "string")) return /* @__PURE__ */ jsx("span", {
		"data-slot": "dropdown-menu-radio-item-label",
		className,
		children
	});
	return children;
}
function DropdownMenuRadioItemIndicator({ className, ...props }) {
	return /* @__PURE__ */ jsx(Menu.RadioItemIndicator, {
		"data-slot": "dropdown-menu-radio-item-indicator",
		className,
		...props
	});
}
function DropdownMenuCheckboxItem({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { item, indicator } = dropdownMenu({ theme });
	return /* @__PURE__ */ jsxs(Menu.CheckboxItem, {
		"data-slot": "dropdown-menu-checkbox-item",
		className: item({ className }),
		...props,
		children: [children, /* @__PURE__ */ jsx("span", {
			className: indicator(),
			children: /* @__PURE__ */ jsx(Menu.CheckboxItemIndicator, { children: /* @__PURE__ */ jsx(DropdownMenuCheckIcon, {}) })
		})]
	});
}
function DropdownMenuCheckboxItemIndicator({ className, ...props }) {
	return /* @__PURE__ */ jsx(Menu.CheckboxItemIndicator, {
		"data-slot": "dropdown-menu-checkbox-item-indicator",
		className,
		...props
	});
}
//#endregion
//#region src/components/lightbox/lightbox.tsx
const lightbox = tv$1({
	slots: {
		backdrop: ["fixed inset-0 z-70 bg-layer-backdrop data-closed:hidden"],
		content: [
			"pointer-events-none fixed inset-0 z-71 flex flex-col data-closed:hidden",
			"*:data-lightbox-close:pointer-events-auto *:data-lightbox-close:absolute *:data-lightbox-close:z-20",
			"*:data-lightbox-close:top-[calc(16px+env(safe-area-inset-top,0px))] *:data-lightbox-close:right-[calc(16px+env(safe-area-inset-right,0px))]"
		],
		header: [
			"pointer-events-auto shrink-0",
			"flex items-center gap-3 pb-3",
			"pt-[calc(env(safe-area-inset-top,0px)+--spacing(3))]",
			"pl-[calc(env(safe-area-inset-left,0px)+--spacing(4))]",
			"pr-[calc(env(safe-area-inset-right,0px)+--spacing(4))]"
		],
		toolbar: [
			"pointer-events-auto shrink-0 flex items-center gap-3",
			"h-[calc(56px+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)]",
			"pl-[calc(16px+env(safe-area-inset-left,0px))] pr-[calc(16px+env(safe-area-inset-right,0px))]",
			"**:data-lightbox-close:static **:data-lightbox-close:inset-auto",
			"**:data-lightbox-close:top-auto **:data-lightbox-close:right-auto"
		],
		headerMeta: ["flex min-w-0 flex-1 items-center gap-1.5"],
		headerLabel: ["inline-flex shrink-0 items-center px-1.5 py-0.5", "text-[10px] leading-none font-bold uppercase tracking-wide"],
		title: ["min-w-0 flex-1 truncate text-sm leading-6 pt-0.5 pb-1"],
		actions: ["flex shrink-0 items-center gap-1.5"],
		stage: ["pointer-events-none relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"],
		media: ["pointer-events-auto max-h-[80vh] max-w-[86vw] border-0 bg-transparent shadow-none"],
		navigationButton: [
			"pointer-events-auto absolute z-10 inline-flex items-center justify-center",
			"border-2 border-line-strong bg-layer-panel text-foreground shadow-raft-sm",
			"transition-[background-color,color,opacity,box-shadow,transform] duration-150",
			"outline outline-[1px] outline-offset-2 outline-transparent",
			"focus-visible:outline-foreground",
			"data-[disabled=true]:cursor-default",
			"[&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0"
		],
		infoDock: ["pointer-events-none absolute right-6 bottom-20 left-6 z-10 flex justify-center"],
		infoBar: [
			"pointer-events-auto flex min-w-0 items-center",
			"bg-layer-panel text-foreground",
			"shadow-[0_12px_32px_-18px_oklch(0_0_0/0.55)]"
		],
		infoTitle: ["min-w-0 flex-1 truncate font-heading text-sm font-bold"],
		infoActions: ["flex shrink-0 items-center gap-1.5"],
		thumbnailStrip: ["pointer-events-none absolute right-0 bottom-4 left-0 z-10", "flex items-center justify-center gap-1.5"],
		thumbnail: [
			"group/lightbox-thumb pointer-events-auto relative size-12 overflow-hidden",
			"transition-[border-color,opacity,box-shadow] duration-150",
			"[&_img]:pointer-events-none [&_img]:size-full [&_img]:object-cover"
		],
		thumbnailOverlay: ["pointer-events-none absolute inset-0 block transition-colors duration-150"],
		close: ["pointer-events-auto"]
	},
	variants: { theme: {
		brutal: {
			header: ["bg-transparent shadow-none"],
			toolbar: ["border-b-2 border-black bg-white shadow-none"],
			headerLabel: ["border-2 border-black bg-primary font-heading text-black"],
			title: ["font-heading font-semibold text-black"],
			navigationButton: [
				"size-8 rounded-none",
				"hover:bg-layer-panel data-[disabled=true]:text-foreground-strong/35",
				"[&_svg]:size-6"
			],
			infoBar: [
				"w-[clamp(144px,20vw,224px)] max-w-[calc(100vw-48px)] min-w-36",
				"gap-2 rounded-none border-2 border-line-strong py-0.5 pr-0.5 pl-2.5 shadow-raft-sm",
				"[&_[data-slot=button]_svg]:stroke-2"
			],
			infoTitle: ["text-xs text-foreground-strong"],
			thumbnail: [
				"border-2 border-white/70 opacity-70 shadow-[2px_2px_0_0_black]",
				"hover:border-white hover:opacity-100 hover:shadow-[3px_3px_0_0_black]",
				"data-active:border-[3px] data-active:border-white data-active:opacity-100",
				"data-active:shadow-[4px_4px_0_0_black]"
			],
			thumbnailOverlay: ["hidden"],
			close: ["[&_svg]:size-4"]
		},
		elegant: {
			backdrop: ["bg-[oklch(0_0_0/0.72)] backdrop-blur-[2px]"],
			content: ["*:data-lightbox-close:rounded-full [&>[data-lightbox-close]]:p-1.5", "[&>[data-lightbox-close]]:[&_svg]:size-3.5"],
			header: ["bg-transparent shadow-none"],
			toolbar: ["border-b border-line-muted bg-layer-panel shadow-none"],
			headerLabel: ["rounded-full border border-line-muted bg-fill-muted font-sans text-foreground-muted"],
			title: ["font-sans font-medium text-foreground"],
			actions: ["gap-2"],
			navigationButton: [
				"size-8 rounded-full border-0",
				"bg-white/75 backdrop-blur-md",
				"dark:bg-[oklch(0.45_0.006_106.42/0.85)] dark:shadow-[0_0_0_1px_oklch(1_0_0/0.16)]",
				"text-foreground-muted dark:text-[oklch(0.92_0.003_106.42)]",
				"shadow-none",
				"hover:bg-white/85 hover:text-foreground",
				"dark:hover:bg-[oklch(0.52_0.006_106.42/0.9)] dark:hover:text-[oklch(0.985_0.004_106.42)]",
				"active:scale-[0.97]",
				"data-[disabled=true]:bg-white/35 data-[disabled=true]:text-foreground-strong/30 data-[disabled=true]:shadow-none",
				"dark:data-[disabled=true]:bg-[oklch(0.45_0.006_106.42/0.35)] dark:data-[disabled=true]:text-[oklch(0.92_0.003_106.42/0.35)]",
				"data-[disabled=true]:hover:bg-white/35 data-[disabled=true]:active:scale-100",
				"dark:data-[disabled=true]:hover:bg-[oklch(0.45_0.006_106.42/0.35)]",
				"[&_svg]:size-5"
			],
			infoBar: [
				"w-[clamp(144px,20vw,224px)] max-w-[calc(100vw-48px)] min-w-36",
				"gap-2 rounded-sm py-0.5 pr-0.5 pl-2.5",
				"bg-[oklch(0.9702_0_0/0.8)] text-foreground shadow-none backdrop-blur-[10px]",
				"dark:bg-[oklch(0.24_0.005_106.42/0.85)] dark:shadow-[0_0_0_1px_oklch(1_0_0/0.08)]",
				"**:data-[slot=button]:text-[oklch(0.439_0_0)] **:data-[slot=button]:hover:bg-ink-10 **:data-[slot=button]:hover:text-[oklch(0.269_0_0)]",
				"dark:**:data-[slot=button]:text-[oklch(0.76_0.005_106.42)] dark:**:data-[slot=button]:hover:text-[oklch(0.92_0.003_106.42)]"
			],
			infoTitle: ["font-sans text-xs font-medium text-[oklch(0.269_0_0)] dark:text-[oklch(0.92_0.003_106.42)]"],
			infoActions: ["gap-1"],
			thumbnail: [
				"rounded-sm border opacity-100 shadow-none",
				"border-white/25 hover:border-white/60",
				"data-active:border-white/90"
			],
			thumbnailOverlay: ["bg-black/45 group-hover/lightbox-thumb:bg-black/28", "group-data-active/lightbox-thumb:bg-transparent"]
		}
	} }
});
function Lightbox({ closeOnModW = true, defaultOpen = false, modal = true, onOpenChange, open, children, ...props }) {
	const dialogRef = useRef(null);
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
	const effectiveOpen = open ?? uncontrolledOpen;
	const handleOpenChange = useCallback((nextOpen, eventDetails) => {
		if (open === void 0) setUncontrolledOpen(nextOpen);
		onOpenChange?.(nextOpen, eventDetails);
	}, [onOpenChange, open]);
	const modWClose = closeOnModW && effectiveOpen ? /* @__PURE__ */ jsx(LightboxModWClose, { dialogRef }) : null;
	return /* @__PURE__ */ jsxs(Dialog$1.Root, {
		actionsRef: dialogRef,
		defaultOpen,
		modal,
		onOpenChange: handleOpenChange,
		open,
		...props,
		children: [modWClose, children]
	});
}
function LightboxModWClose({ dialogRef }) {
	useHotkey("Mod+W", (event) => {
		event.preventDefault();
		event.stopPropagation();
		dialogRef.current?.close();
	}, { meta: {
		name: "Close lightbox",
		description: "Close the active lightbox before the browser closes the tab."
	} });
	return null;
}
function LightboxTrigger(props) {
	return /* @__PURE__ */ jsx(Dialog$1.Trigger, {
		"data-slot": "lightbox-trigger",
		...props
	});
}
function LightboxPortal(props) {
	return /* @__PURE__ */ jsx(Dialog$1.Portal, {
		"data-slot": "lightbox-portal",
		...useThemeScopeProps(props)
	});
}
function LightboxContent({ className, initialFocus = false, finalFocus = false, ...props }) {
	const theme = useThemeFamily();
	const { backdrop, content } = lightbox({ theme });
	return /* @__PURE__ */ jsxs(LightboxPortal, { children: [/* @__PURE__ */ jsx(Dialog$1.Backdrop, {
		"data-slot": "lightbox-backdrop",
		className: backdrop()
	}), /* @__PURE__ */ jsx(Dialog$1.Popup, {
		"data-slot": "lightbox-content",
		initialFocus,
		finalFocus,
		className: content({ className }),
		...props
	})] });
}
function LightboxHeader({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { header } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: header({ className }) }, props),
		state: { slot: "lightbox-header" }
	});
}
function LightboxToolbar({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { toolbar } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: toolbar({ className }) }, props),
		state: { slot: "lightbox-toolbar" }
	});
}
function LightboxHeaderMeta({ render, className, ...props }) {
	const { headerMeta } = lightbox();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: headerMeta({ className }) }, props),
		state: { slot: "lightbox-header-meta" }
	});
}
function LightboxHeaderLabel({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { headerLabel } = lightbox({ theme });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: headerLabel({ className }) }, props),
		state: { slot: "lightbox-header-label" }
	});
}
function LightboxTitle({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { title } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: title({ className }) }, props),
		state: { slot: "lightbox-title" }
	});
}
function LightboxActions({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { actions } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: actions({ className }) }, props),
		state: { slot: "lightbox-actions" }
	});
}
function LightboxStage({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { stage } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: stage({ className }) }, props),
		state: { slot: "lightbox-stage" }
	});
}
function LightboxMedia({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { media } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: media({ className }) }, props),
		state: { slot: "lightbox-media" }
	});
}
function LightboxNavigationButton({ className, direction, disabled, onClick, type = "button", ...props }) {
	const theme = useThemeFamily();
	const { navigationButton } = lightbox({ theme });
	const handleClick = useCallback((event) => {
		if (disabled) {
			event.preventDefault();
			return;
		}
		onClick?.(event);
	}, [disabled, onClick]);
	return /* @__PURE__ */ jsx(Button, {
		"aria-disabled": disabled,
		className: navigationButton({ className: cn(direction === "previous" ? "left-8" : "right-8", className) }),
		"data-disabled": disabled ? "true" : void 0,
		"data-slot": "lightbox-navigation-button",
		"data-direction": direction,
		onClick: handleClick,
		size: "icon-lg",
		type,
		variant: "outline",
		...props
	});
}
function LightboxInfoDock({ render, className, ...props }) {
	const { infoDock } = lightbox();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: infoDock({ className }) }, props),
		state: { slot: "lightbox-info-dock" }
	});
}
function LightboxInfoBar({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { infoBar } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: infoBar({ className }) }, props),
		state: { slot: "lightbox-info-bar" }
	});
}
function LightboxInfoTitle({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { infoTitle } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: infoTitle({ className }) }, props),
		state: { slot: "lightbox-info-title" }
	});
}
function LightboxInfoActions({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { infoActions } = lightbox({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: infoActions({ className }) }, props),
		state: { slot: "lightbox-info-actions" }
	});
}
function LightboxThumbnailStrip({ render, className, ...props }) {
	const { thumbnailStrip } = lightbox();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: thumbnailStrip({ className }) }, props),
		state: { slot: "lightbox-thumbnail-strip" }
	});
}
function LightboxThumbnail({ active = false, className, render, type = "button", children, ...props }) {
	const theme = useThemeFamily();
	const { thumbnail, thumbnailOverlay } = lightbox({ theme });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type,
			"data-slot": "lightbox-thumbnail",
			"data-active": active ? "true" : void 0,
			className: thumbnail({ className }),
			children: /* @__PURE__ */ jsxs(Fragment$1, { children: [children, /* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				"data-slot": "lightbox-thumbnail-overlay",
				className: thumbnailOverlay()
			})] })
		}, props)
	});
}
function LightboxClose({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { close } = lightbox({ theme });
	return /* @__PURE__ */ jsx(Dialog$1.Close, {
		"data-lightbox-close": "",
		"data-slot": "lightbox-close",
		className: close({ className }),
		render: render ?? /* @__PURE__ */ jsx(Button, {
			type: "button",
			variant: "outline",
			size: theme === "elegant" ? "icon-sm" : "icon-md"
		}),
		...props
	});
}
//#endregion
//#region src/components/logo/raft-logo.tsx
function RaftLogo(props) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "0 0 113 104",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: /* @__PURE__ */ jsx(RaftMarkArtwork, {})
	});
}
function RaftWordmark(props) {
	return /* @__PURE__ */ jsx("svg", {
		viewBox: "128 0 294 104",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: /* @__PURE__ */ jsx(RaftWordmarkArtwork, {})
	});
}
function RaftLogoLockup(props) {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 422 104",
		fill: "none",
		xmlns: "http://www.w3.org/2000/svg",
		...props,
		children: [/* @__PURE__ */ jsx(RaftMarkArtwork, {}), /* @__PURE__ */ jsx(RaftWordmarkArtwork, {})]
	});
}
function RaftMarkArtwork() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("path", {
			fill: "#141111",
			d: "m112.754 38.743-3.954-22.44c-.572-3.208-2.477-5.797-5.003-7.845-1.254-1.017-5.717-4.876-7.527-6.273C93.713.184 90.362-.325 87.186.184L21.82 11.84c-4.94.73-8.878 1.636-11.91 5.75-3.51 4.748-2.478 9.337-1.652 14.022l3.08 17.517c.128.715.334 1.382.556 2.033-4.32.762-7.734 2.318-9.814 5.383-2.255 3.32-2.43 5.75-1.684 10.005l3.526 20.01c.905 4.209 4.113 6.369 8.782 10.561 5.416 4.828 7.56 7.528 12.975 6.575l70.623-12.45c6.59-1.176 11.005-7.465 9.846-14.055l-3.875-22.012a12 12 0 0 0-.588-2.143l1.287-.239c6.543-1.19 10.926-7.495 9.782-14.038z"
		}),
		/* @__PURE__ */ jsx("path", {
			fill: "#fffaef",
			d: "M18.326 87.196 85.17 75.412a4.004 4.004 0 0 0 3.256-4.653l-3.208-18.232a4.004 4.004 0 0 0-4.653-3.255c-2.192.38-4.653.826-5.892 1.048-1.954.35-5.273-.858-5.844-4.066l-1.033-5.844-28.919 31.508c-.905.826-2.97 1.922-5.114 1.413-1.858-.444-3.208-2.064-3.541-3.938l-1.922-10.91-14.578 2.573c-2.192.397-3.653 2.477-3.272 4.653l3.208 18.215a4.004 4.004 0 0 0 4.653 3.256z"
		}),
		/* @__PURE__ */ jsx("path", {
			fill: "#fffaef",
			d: "M20.915 45.508c.397 2.192 2.477 3.653 4.653 3.271l5.923-1.048c2.732-.476 5.336 1.35 5.813 4.066l1.032 5.844 28.92-31.508a5.03 5.03 0 0 1 5.113-1.413 5.05 5.05 0 0 1 3.541 3.938l1.922 10.879 13.944-2.541a4.024 4.024 0 0 0 3.24-4.653l-3.288-18.66a4.01 4.01 0 0 0-4.67-3.256L20.868 22.195c-2.192.38-3.637 2.477-3.256 4.653L20.9 45.492z"
		})
	] });
}
function RaftWordmarkArtwork() {
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [
		/* @__PURE__ */ jsx("path", {
			fill: "#141111",
			d: "M190.396 17.32c8.719 0 17.39 3.747 14.897 15.642-.715 3.399-2.271 6.289-4.701 8.703q-3.645 3.597-9.767 6.336c5.495 1.906 8.258 6.528 7.845 13.849-.444 7.734-1.064 17.93-1.064 17.93h-22.503c.54-7.036 1.747-17.168-.27-20.328-1.858-2.922-9.179-1.35-9.179-1.35l-4.574 21.677s-21.661.08-21.757 0l13.134-62.444h37.939zM176.119 29.5h-4.51s-2.922 13.53-3.192 15.389c8.338-.19 14.785-3.383 16.278-8.989 1.699-6.4-5.129-6.4-8.576-6.4M274.756 79.875h-23.551l-.191-12.42-16.087.16-4.876 12.26h-24.314l29.46-62.603h33.096zm-23.583-27.268-.111-21.058h-3.272l-8.226 21.042h11.609zM339.011 33.042h-23.615l-2.113 10.052h22.52l-3.701 16.294h-22.249l-4.288 20.407h-21.757l13.118-62.317h45.483l-3.382 15.563zM401.232 34.264h-16.389l-9.576 45.531-21.598-.08 9.56-45.45h-15.182l3.446-16.787h52.344l-2.62 16.786z"
		}),
		/* @__PURE__ */ jsx("path", {
			fill: "#141111",
			d: "M419.051 17.002c-1.287-1.493-5.511-5.48-6.75-6.75-2.271-2.334-5.193-3.89-8.448-3.89H296.91a11.116 11.116 0 0 0-10.878 8.83l-.89 4.192c-1.254-2.732-3.462-4.272-5.574-6.4-3.255-3.256-6.479-6.845-11.275-6.845h-33.096a11.11 11.11 0 0 0-10.053 6.384l-5.13 10.895c-.381-.572-.746-1.128-1.159-1.588-1.715-1.859-5.669-5.67-6.749-6.75-5.209-5.24-12.372-8.893-21.694-8.893h-37.939a11.12 11.12 0 0 0-10.879 8.83L128.461 77.46a11.1 11.1 0 0 0 3.303 10.433c1.302 1.207 5.431 5.527 6.749 6.75 3.224 3.001 5.972 3.08 10.99 3.08h18.39c2.62 0 5.05-1.032 6.972-2.588 1.969 1.604 4.447 2.589 7.003 2.589h59.411c2.366 0 4.24-.763 5.971-2.589 2.033 2.271 3.335 2.589 7.719 2.589l57.346-.064c5.256 0 9.798-3.684 10.878-8.83l2.446-11.577h17.199l-.032.175c-.683 3.271-.032 6.813 2.239 9.274 1.461 1.588 5.686 5.654 6.75 6.75 2.318 2.414 5.256 4.113 8.607 4.129l21.598.08h.048c5.257 0 9.799-3.685 10.879-8.83l7.718-36.702h7.369c5.478 0 10.132-3.986 10.989-9.401l2.621-16.786a11.08 11.08 0 0 0-2.541-8.941z"
		}),
		/* @__PURE__ */ jsx("path", {
			fill: "#fffaef",
			d: "M190.396 17.32c8.719 0 17.39 3.747 14.897 15.642-.715 3.399-2.271 6.289-4.701 8.703q-3.645 3.597-9.767 6.336c5.495 1.906 8.258 6.528 7.845 13.849-.444 7.734-1.064 17.93-1.064 17.93h-22.503c.54-7.036 1.747-17.168-.27-20.328-1.858-2.922-9.179-1.35-9.179-1.35l-4.574 21.677s-21.661.08-21.757 0l13.134-62.444h37.939zM176.119 29.5h-4.51s-2.922 13.53-3.192 15.389c8.338-.19 14.785-3.383 16.278-8.989 1.699-6.4-5.129-6.4-8.576-6.4M274.756 79.875h-23.551l-.191-12.42-16.087.16-4.876 12.26h-24.314l29.46-62.603h33.096zm-23.583-27.268-.111-21.058h-3.272l-8.226 21.042h11.609zM339.011 33.042h-23.615l-2.113 10.052h22.52l-3.701 16.294h-22.249l-4.288 20.407h-21.757l13.118-62.317h45.483l-3.382 15.563zM401.232 34.264h-16.389l-9.576 45.531-21.598-.08 9.56-45.45h-15.182l3.446-16.787h52.344l-2.62 16.786z"
		})
	] });
}
//#endregion
//#region src/components/mobile-nav/mobile-nav.tsx
const mobileNav = tv$1({
	slots: {
		root: [],
		item: [
			"relative inline-flex shrink-0 items-center justify-center outline-none",
			"disabled:pointer-events-none disabled:opacity-45",
			"[&_svg]:size-4.5 [&_svg]:shrink-0"
		],
		itemLabel: ["min-w-0 truncate"]
	},
	variants: { theme: {
		brutal: {
			root: ["grid w-full flex-none grid-flow-col auto-cols-fr items-stretch gap-0", "border-t-2 border-black bg-white pb-[min(env(safe-area-inset-bottom,0px),34px)] text-black"],
			item: [
				"min-w-0 flex-col gap-0.5 border-0 border-r-2 border-line-strong px-0 py-2 text-[10px] tracking-wider last:border-r-0",
				"text-black/55 hover:text-black active:bg-ink-6",
				"data-[selected=true]:text-black data-[selected=true]:bg-primary-400 data-[selected=true]:shadow-none",
				"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black"
			]
		},
		elegant: {
			root: ["flex w-fit max-w-full flex-none self-center items-center gap-2 rounded-full bg-layer-panel p-1 shadow-raft-lg", "mt-2 mb-[max(8px,env(safe-area-inset-bottom,0px))]"],
			item: [
				"relative size-11 min-w-0 gap-0 rounded-full border-0 p-0",
				"text-foreground-placeholder *:relative *:z-10",
				"hover:text-foreground-muted active:bg-fill-strong",
				"data-[selected=true]:bg-layer-panel data-[selected=true]:text-foreground-strong data-[selected=true]:shadow-raft-xl data-[selected=true]:ring-1 data-[selected=true]:ring-line-muted/45",
				"dark:data-[selected=true]:bg-fill-muted dark:data-[selected=true]:ring-transparent",
				"data-[selected=true]:before:pointer-events-none data-[selected=true]:before:absolute data-[selected=true]:before:inset-0 data-[selected=true]:before:z-0 data-[selected=true]:before:rounded-[inherit]",
				"data-[selected=true]:before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/12%)_0%,oklab(0%_0_0/6%)_100%)] data-[selected=true]:before:content-['']",
				"dark:data-[selected=true]:before:hidden"
			],
			itemLabel: "sr-only"
		}
	} }
});
function MobileNavRoot({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = mobileNav({ theme });
	return useRender({
		defaultTagName: "nav",
		render,
		props: mergeProps({
			"data-slot": "mobile-nav-root",
			className: root({ className })
		}, props)
	});
}
function MobileNavItem({ nativeButton = true, selected, className, render, ...props }) {
	const theme = useThemeFamily();
	const { item } = mobileNav({ theme });
	const defaultProps = {
		type: nativeButton ? "button" : void 0,
		"aria-pressed": nativeButton ? selected : void 0,
		"data-slot": "mobile-nav-item",
		"data-selected": selected ? "true" : void 0,
		className: item({ className })
	};
	return useRender({
		render: render ?? /* @__PURE__ */ jsx(Button$1, {}),
		props: mergeProps(defaultProps, props)
	});
}
function MobileNavLabel({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { itemLabel } = mobileNav({ theme });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "mobile-nav-item-label",
			className: itemLabel({ className })
		}, props)
	});
}
//#endregion
//#region src/components/tooltip/tooltip.tsx
const tooltip = tv$1({
	slots: {
		trigger: ["select-none"],
		positioner: ["isolate z-50 outline-none"],
		content: [
			"relative inline-block max-w-[min(20rem,var(--available-width,20rem))] min-w-0 px-2.5 py-1",
			"origin-(--transform-origin) outline-none",
			"transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
			"data-starting-style:scale-[0.97] data-starting-style:opacity-0",
			"data-ending-style:scale-[0.99] data-ending-style:opacity-0",
			"data-instant:transition-none",
			"motion-reduce:transition-none",
			"has-[[data-slot=kbd]]:py-1.5 has-[[data-slot=kbd]]:pr-1.5"
		],
		body: [
			"block min-w-0 text-[13px] leading-4.5 whitespace-normal wrap-break-word",
			"**:data-[slot=kbd]:relative **:data-[slot=kbd]:z-10 [&_[data-slot=kbd]]:ml-1.5",
			"[&_[data-slot=kbd]]:h-4 [&_[data-slot=kbd]]:min-w-4 [&_[data-slot=kbd]]:px-1 [&_[data-slot=kbd]]:py-0",
			"**:data-[slot=kbd]:text-[10px] [&_[data-slot=kbd]]:font-semibold **:data-[slot=kbd]:leading-none"
		],
		bodyIcon: ["shrink-0 [&>svg]:block [&>svg]:size-3.5 [&>svg]:shrink-0"],
		bodyText: ["min-w-0 flex-1"],
		arrow: [
			"pointer-events-none flex overflow-visible",
			"data-[side=top]:bottom-[-5px]",
			"data-[side=bottom]:top-[-5px] data-[side=bottom]:rotate-180",
			"data-[side=left]:right-[-8px] data-[side=left]:-rotate-90",
			"data-[side=right]:left-[-8px] data-[side=right]:rotate-90",
			"data-[side=inline-start]:right-[-8px] data-[side=inline-start]:-rotate-90",
			"data-[side=inline-end]:left-[-8px] data-[side=inline-end]:rotate-90"
		]
	},
	variants: {
		hasLeadingIcon: {
			true: { body: ["flex items-center gap-x-1.5"] },
			false: {}
		},
		theme: {
			brutal: {
				content: [
					"border-2 border-line-strong bg-primary",
					"font-sans font-bold text-foreground-strong",
					"shadow-raft-sm",
					"**:data-[slot=kbd]:border-line-strong/70 **:data-[slot=kbd]:bg-layer-panel **:data-[slot=kbd]:text-foreground-strong/70 **:data-[slot=kbd]:ring-0"
				],
				arrow: ["hidden"]
			},
			elegant: {
				content: [
					"rounded-md bg-layer-hud text-layer-hud-foreground dark:bg-layer-popover dark:text-foreground",
					"font-sans text-[13px] font-medium tracking-[-0.005em]",
					"shadow-raft-lg",
					"**:data-[slot=kbd]:bg-white/8 **:data-[slot=kbd]:text-white/72 **:data-[slot=kbd]:ring-0 dark:**:data-[slot=kbd]:bg-ink-4 dark:**:data-[slot=kbd]:text-foreground-muted"
				],
				arrow: ["dark:drop-shadow-[0_1px_0_oklch(0_0_0/0.55)]"]
			}
		}
	}
});
function TooltipProvider({ delay = 0, ...props }) {
	return /* @__PURE__ */ jsx(Tooltip$1.Provider, {
		delay,
		...props
	});
}
function Tooltip(props) {
	return /* @__PURE__ */ jsx(Tooltip$1.Root, { ...props });
}
function TooltipTrigger({ className, ...props }) {
	const theme = useThemeFamily();
	const { trigger } = tooltip({ theme });
	return /* @__PURE__ */ jsx(Tooltip$1.Trigger, {
		"data-slot": "tooltip-trigger",
		className: trigger({ className }),
		...props
	});
}
function TooltipPortal(props) {
	return /* @__PURE__ */ jsx(Tooltip$1.Portal, {
		"data-slot": "tooltip-portal",
		...useThemeScopeProps(props)
	});
}
function TooltipArrow({ className, ...props }) {
	const theme = useThemeFamily();
	const { arrow } = tooltip({ theme });
	return /* @__PURE__ */ jsx(Tooltip$1.Arrow, {
		"data-slot": "tooltip-arrow",
		className: arrow({ className }),
		...props,
		children: /* @__PURE__ */ jsx(TooltipArrowSvg, { theme })
	});
}
function TooltipArrowSvg({ theme, ...props }) {
	const isElegant = theme === "elegant";
	return /* @__PURE__ */ jsx("svg", {
		width: "12",
		height: "6",
		viewBox: "0 0 12 6",
		fill: "none",
		...props,
		children: /* @__PURE__ */ jsx("path", {
			d: "M1 0H11L6 5.25Z",
			className: isElegant ? "fill-layer-hud dark:fill-layer-popover" : "fill-layer-popover"
		})
	});
}
function flattenTooltipChildren(children) {
	return Children.toArray(children).flatMap((child) => {
		if (isValidElement(child) && child.type === Fragment) return flattenTooltipChildren(child.props.children);
		return [child];
	});
}
function isTooltipLeadingIcon(child) {
	if (!isValidElement(child)) return false;
	if (child.props["data-slot"] === "kbd") return false;
	if (child.type === "svg") return true;
	return typeof child.type !== "string";
}
function partitionTooltipBodyChildren(children) {
	const items = flattenTooltipChildren(children);
	const icons = [];
	const rest = [];
	let seenNonIcon = false;
	for (const item of items) {
		if (!seenNonIcon && isTooltipLeadingIcon(item)) {
			icons.push(item);
			continue;
		}
		seenNonIcon = true;
		rest.push(item);
	}
	return {
		icons,
		rest
	};
}
function TooltipBodyContent({ children }) {
	const { icons, rest } = partitionTooltipBodyChildren(children);
	const { body, bodyIcon, bodyText } = tooltip({ hasLeadingIcon: icons.length > 0 });
	if (icons.length === 0) return /* @__PURE__ */ jsx("span", {
		"data-slot": "tooltip-body",
		className: body(),
		children
	});
	return /* @__PURE__ */ jsxs("span", {
		"data-slot": "tooltip-body",
		className: body(),
		children: [/* @__PURE__ */ jsx("span", {
			"data-slot": "tooltip-body-icon",
			className: bodyIcon(),
			children: icons
		}), /* @__PURE__ */ jsx("span", {
			"data-slot": "tooltip-body-text",
			className: bodyText(),
			children: rest
		})]
	});
}
function TooltipContent({ align = "center", alignOffset = 0, anchor, arrowPadding, collisionAvoidance = {
	side: "shift",
	align: "shift",
	fallbackAxisSide: "none"
}, collisionBoundary, collisionPadding, disableAnchorTracking = false, positionMethod = "fixed", side = "top", sideOffset, sticky, container, portalProps, className, children, ...props }) {
	const theme = useThemeFamily();
	const { positioner, content } = tooltip({ theme });
	const resolvedSideOffset = sideOffset ?? (theme === "elegant" ? 8 : 6);
	const portalContainer = container !== void 0 ? container : portalProps?.container;
	return /* @__PURE__ */ jsx(TooltipPortal, {
		...portalProps,
		container: portalContainer,
		children: /* @__PURE__ */ jsx(Tooltip$1.Positioner, {
			align,
			alignOffset,
			anchor,
			arrowPadding,
			collisionAvoidance,
			collisionBoundary,
			collisionPadding,
			disableAnchorTracking,
			positionMethod,
			side,
			sideOffset: resolvedSideOffset,
			sticky,
			className: positioner(),
			children: /* @__PURE__ */ jsxs(Tooltip$1.Popup, {
				"data-slot": "tooltip-content",
				className: content({ className }),
				...props,
				children: [/* @__PURE__ */ jsx(TooltipBodyContent, { children }), /* @__PURE__ */ jsx(TooltipArrow, {})]
			})
		})
	});
}
//#endregion
//#region src/components/popover/popover.tsx
const popover = tv$1({
	slots: {
		trigger: ["select-none"],
		positioner: ["isolate z-50 outline-none"],
		content: ["max-h-(--available-height) min-w-[220px] overflow-hidden bg-layer-panel", "outline-none"],
		header: ["flex items-center justify-between px-3 py-2"],
		separator: ["border-t"],
		title: ["m-0 text-[10px] font-bold leading-none"],
		description: ["m-0 text-xs leading-5"],
		close: [
			"inline-flex items-center justify-center",
			"text-[10px] font-bold",
			"outline-none transition-colors"
		],
		arrow: ["size-2 rotate-45"],
		backdrop: ["fixed inset-0"],
		viewport: ["block"]
	},
	variants: { theme: {
		brutal: {
			content: ["border-2 border-line-strong bg-layer-popover shadow-raft-lg"],
			separator: ["border-line-strong"],
			title: ["font-sans uppercase tracking-wide text-foreground-strong/60"],
			description: ["font-sans text-foreground-strong"],
			close: ["font-sans uppercase tracking-wide text-foreground-strong/60 hover:text-foreground-strong"],
			arrow: ["border-l-2 border-t-2 border-line-strong bg-layer-popover"],
			backdrop: ["bg-transparent"]
		},
		elegant: {
			content: ["rounded-md bg-layer-popover", "shadow-raft-xl"],
			separator: ["border-line-hairline"],
			title: ["text-[11px] font-medium tracking-[-0.005em] text-foreground-strong/45"],
			description: ["text-xs leading-5 text-foreground-muted"],
			close: ["text-[11px] font-medium tracking-[-0.005em]", "text-foreground-muted transition-colors duration-150 hover:text-foreground"],
			arrow: ["border-l border-t border-line-hairline bg-layer-popover"],
			backdrop: ["bg-layer-backdrop backdrop-blur-[2px]"]
		}
	} }
});
function Popover(props) {
	return /* @__PURE__ */ jsx(Popover$1.Root, {
		"data-slot": "popover",
		...props
	});
}
function PopoverTrigger({ className, ...props }) {
	const theme = useThemeFamily();
	const { trigger } = popover({ theme });
	return /* @__PURE__ */ jsx(Popover$1.Trigger, {
		"data-slot": "popover-trigger",
		className: trigger({ className }),
		...props
	});
}
function PopoverPortal(props) {
	return /* @__PURE__ */ jsx(Popover$1.Portal, {
		"data-slot": "popover-portal",
		...useThemeScopeProps(props)
	});
}
function PopoverPopup({ className, ...props }) {
	const theme = useThemeFamily();
	const { content } = popover({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "popover-content",
		className: content({ className }),
		...props
	});
}
function PopoverContent({ align = "start", alignOffset = 0, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking = true, positionMethod = "fixed", side = "bottom", sideOffset = 4, sticky, container, portalProps, className, ...props }) {
	const theme = useThemeFamily();
	const { positioner, content } = popover({ theme });
	const portalContainer = container !== void 0 ? container : portalProps?.container;
	return /* @__PURE__ */ jsx(PopoverPortal, {
		...portalProps,
		container: portalContainer,
		children: /* @__PURE__ */ jsx(Popover$1.Positioner, {
			align,
			alignOffset,
			anchor,
			arrowPadding,
			collisionAvoidance,
			collisionBoundary,
			collisionPadding,
			disableAnchorTracking,
			positionMethod,
			side,
			sideOffset,
			sticky,
			className: positioner(),
			children: /* @__PURE__ */ jsx(Popover$1.Popup, {
				"data-slot": "popover-content",
				className: content({ className }),
				...props
			})
		})
	});
}
function PopoverViewport({ className, ...props }) {
	const theme = useThemeFamily();
	const { viewport } = popover({ theme });
	return /* @__PURE__ */ jsx(Popover$1.Viewport, {
		"data-slot": "popover-viewport",
		className: viewport({ className }),
		...props
	});
}
function PopoverHeader({ className, ...props }) {
	const theme = useThemeFamily();
	const { header } = popover({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "popover-header",
		className: header({ className }),
		...props
	});
}
function PopoverSeparator({ className, ...props }) {
	const theme = useThemeFamily();
	const { separator } = popover({ theme });
	return /* @__PURE__ */ jsx("div", {
		role: "separator",
		"aria-orientation": "horizontal",
		"data-slot": "popover-separator",
		className: separator({ className }),
		...props
	});
}
function PopoverTitle({ className, ...props }) {
	const theme = useThemeFamily();
	const { title } = popover({ theme });
	return /* @__PURE__ */ jsx(Popover$1.Title, {
		"data-slot": "popover-title",
		className: title({ className }),
		...props
	});
}
function PopoverDescription({ className, ...props }) {
	const theme = useThemeFamily();
	const { description } = popover({ theme });
	return /* @__PURE__ */ jsx(Popover$1.Description, {
		"data-slot": "popover-description",
		className: description({ className }),
		...props
	});
}
function PopoverClose({ className, ...props }) {
	const theme = useThemeFamily();
	const { close } = popover({ theme });
	return /* @__PURE__ */ jsx(Popover$1.Close, {
		"data-slot": "popover-close",
		className: close({ className }),
		...props
	});
}
function PopoverArrow({ className, ...props }) {
	const theme = useThemeFamily();
	const { arrow } = popover({ theme });
	return /* @__PURE__ */ jsx(Popover$1.Arrow, {
		"data-slot": "popover-arrow",
		className: arrow({ className }),
		...props
	});
}
function PopoverBackdrop({ className, ...props }) {
	const theme = useThemeFamily();
	const { backdrop } = popover({ theme });
	return /* @__PURE__ */ jsx(Popover$1.Backdrop, {
		"data-slot": "popover-backdrop",
		className: backdrop({ className }),
		...props
	});
}
//#endregion
//#region src/components/preview-card/preview-card.tsx
const previewCard = tv$1({
	slots: {
		trigger: [],
		positioner: ["isolate z-50 outline-none"],
		popup: [
			"max-h-(--available-height) min-w-[220px] overflow-hidden",
			"outline-none",
			"origin-(--transform-origin) transform-gpu opacity-100 will-change-[transform,opacity]",
			"transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
			"data-starting-style:scale-[0.97] data-starting-style:opacity-0",
			"data-ending-style:scale-[0.99] data-ending-style:opacity-0 data-ending-style:duration-150",
			"data-instant:transition-none motion-reduce:transition-none"
		],
		header: ["flex items-start gap-3 px-3 pt-3 pb-2"],
		separator: ["border-t"],
		title: ["m-0 truncate text-sm leading-none"],
		description: ["m-0 truncate px-3 py-2 text-xs leading-5"],
		arrow: ["size-2 rotate-45"]
	},
	variants: { theme: {
		brutal: {
			popup: ["border-2 border-line-strong bg-layer-popover shadow-raft-lg"],
			separator: ["border-line-strong"],
			title: ["font-sans font-bold text-foreground-strong"],
			description: ["font-sans text-foreground-strong/70"],
			arrow: ["hidden"]
		},
		elegant: {
			popup: ["rounded-md bg-layer-popover shadow-raft-xl"],
			separator: ["border-line-muted dark:border-ink-6"],
			title: ["font-sans font-medium text-foreground"],
			description: ["bg-ink-2 font-sans dark:bg-transparent", "text-foreground-hint"],
			arrow: ["border-l border-t border-line-hairline bg-layer-popover"]
		}
	} }
});
function PreviewCard(props) {
	return /* @__PURE__ */ jsx(PreviewCard$1.Root, {
		"data-slot": "preview-card",
		...props
	});
}
function PreviewCardTrigger({ delay = 80, closeDelay = 40, className, ...props }) {
	const theme = useThemeFamily();
	const { trigger } = previewCard({ theme });
	return /* @__PURE__ */ jsx(PreviewCard$1.Trigger, {
		"data-slot": "preview-card-trigger",
		delay,
		closeDelay,
		className: trigger({ className }),
		...props
	});
}
function PreviewCardPortal(props) {
	return /* @__PURE__ */ jsx(PreviewCard$1.Portal, {
		"data-slot": "preview-card-portal",
		...useThemeScopeProps(props)
	});
}
function PreviewCardPopup({ className, ...props }) {
	const themeState = useTheme();
	const { popup } = previewCard({ theme: themeState.theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "preview-card-content",
		...resolveThemeScopeProps({
			...props,
			className: popup({ className })
		}, themeState)
	});
}
function PreviewCardContent({ align = "start", alignOffset = 0, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking = true, positionMethod = "fixed", side = "bottom", sideOffset = 6, sticky, portalProps, className, ...props }) {
	const theme = useThemeFamily();
	const { positioner, popup } = previewCard({ theme });
	return /* @__PURE__ */ jsx(PreviewCardPortal, {
		...portalProps,
		children: /* @__PURE__ */ jsx(PreviewCard$1.Positioner, {
			align,
			alignOffset,
			anchor,
			arrowPadding,
			collisionAvoidance,
			collisionBoundary,
			collisionPadding,
			disableAnchorTracking,
			positionMethod,
			side,
			sideOffset,
			sticky,
			className: positioner(),
			children: /* @__PURE__ */ jsx(PreviewCard$1.Popup, {
				"data-slot": "preview-card-content",
				className: popup({ className }),
				...props
			})
		})
	});
}
function PreviewCardHeader({ className, ...props }) {
	const theme = useThemeFamily();
	const { header } = previewCard({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "preview-card-header",
		className: header({ className }),
		...props
	});
}
function PreviewCardSeparator({ className, ...props }) {
	const theme = useThemeFamily();
	const { separator } = previewCard({ theme });
	return /* @__PURE__ */ jsx("div", {
		role: "separator",
		"aria-orientation": "horizontal",
		"data-slot": "preview-card-separator",
		className: separator({ className }),
		...props
	});
}
function PreviewCardTitle({ className, ...props }) {
	const theme = useThemeFamily();
	const { title } = previewCard({ theme });
	return /* @__PURE__ */ jsx("p", {
		"data-slot": "preview-card-title",
		className: title({ className }),
		...props
	});
}
function PreviewCardDescription({ className, ...props }) {
	const theme = useThemeFamily();
	const { description } = previewCard({ theme });
	return /* @__PURE__ */ jsx("p", {
		"data-slot": "preview-card-description",
		className: description({ className }),
		...props
	});
}
function PreviewCardArrow({ className, ...props }) {
	const theme = useThemeFamily();
	const { arrow } = previewCard({ theme });
	return /* @__PURE__ */ jsx(PreviewCard$1.Arrow, {
		"data-slot": "preview-card-arrow",
		className: arrow({ className }),
		...props
	});
}
//#endregion
//#region src/components/label/label.tsx
const label = tv$1({
	slots: {
		root: [
			"group/label inline-flex w-fit items-center gap-1",
			"cursor-pointer select-none",
			"text-sm leading-none",
			"data-disabled:cursor-not-allowed data-disabled:text-foreground-disabled"
		],
		asterisk: ["text-accent-400", "group-data-disabled/label:text-foreground-disabled"],
		sub: ["font-normal normal-case", "group-data-disabled/label:text-foreground-disabled"]
	},
	variants: {
		theme: {
			brutal: {
				root: "font-bold text-foreground",
				sub: "font-bold tracking-wide text-foreground-strong/40"
			},
			elegant: {
				root: "font-medium text-foreground-strong dark:text-foreground-hint",
				sub: "text-foreground-strong/40"
			}
		},
		size: {
			sm: { root: "text-xs" },
			md: { root: "text-sm" }
		}
	},
	defaultVariants: { size: "md" }
});
function LabelRoot({ size, disabled, className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = label({
		theme,
		size
	});
	return useRender({
		defaultTagName: "label",
		render,
		props: mergeProps({
			"aria-disabled": disabled ? true : void 0,
			"data-disabled": disabled ? "" : void 0,
			className: root({ className })
		}, props),
		state: {
			slot: "label",
			disabled: disabled ?? false
		}
	});
}
function LabelAsterisk({ className, children = "*", ...props }) {
	const theme = useThemeFamily();
	const { asterisk } = label({ theme });
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "label-asterisk",
		className: asterisk({ className }),
		...props,
		children
	});
}
function LabelSub({ className, ...props }) {
	const theme = useThemeFamily();
	const { sub } = label({ theme });
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "label-sub",
		className: sub({ className }),
		...props
	});
}
function LabelOptional({ children = "(optional)", ...props }) {
	return /* @__PURE__ */ jsx(LabelSub, {
		"data-slot": "label-optional",
		...props,
		children
	});
}
const Label = Object.assign(LabelRoot, {
	Asterisk: LabelAsterisk,
	Optional: LabelOptional,
	Sub: LabelSub
});
//#endregion
//#region src/components/input/input.recipe.ts
const input = tv$1({
	slots: { root: ["w-full px-3 py-2 font-heading outline-none"] },
	variants: { theme: {
		brutal: {},
		elegant: {}
	} },
	compoundVariants: [{
		theme: "brutal",
		class: { root: [
			"border-2 border-line-strong bg-layer-panel",
			"shadow-raft-sm focus:shadow-raft-md",
			"data-invalid:border-brutal-red data-invalid:bg-brutal-red/5 data-invalid:shadow-none data-invalid:ring-2 data-invalid:ring-brutal-red/60"
		] }
	}, {
		theme: "elegant",
		class: { root: [
			"rounded-md border border-line-field bg-layer-panel",
			"dark:bg-layer-card dark:not-data-invalid:border-transparent",
			"dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
			"dark:hover:not-data-invalid:border-ink-8",
			"px-3 py-2 text-sm text-foreground transition duration-200 ease-out dark:text-foreground-strong",
			"placeholder:text-foreground-placeholder/70",
			"shadow-none hover:not-data-invalid:border-line-field-hover",
			"focus:bg-layer-panel dark:focus:bg-layer-card",
			"focus-visible:ring-1 focus-visible:ring-primary-400",
			"dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
			"data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75 data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-danger/12",
			"disabled:cursor-not-allowed disabled:border-line-muted/60 disabled:bg-fill-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
			"disabled:hover:border-line-muted/60",
			"data-invalid:disabled:border-line-muted/60 data-invalid:disabled:ring-0"
		] }
	}]
});
//#endregion
//#region src/components/input/input.tsx
function Input({ suppressPasswordManager, className, "data-invalid": dataInvalid, ...props }) {
	const { root } = input({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Input$1, {
		"data-slot": "input",
		className: root({ className: [suppressPasswordManager && "keeper-ignore", className] }),
		"data-1p-ignore": suppressPasswordManager ? "true" : void 0,
		"data-bwignore": suppressPasswordManager ? "true" : void 0,
		"data-form-type": suppressPasswordManager ? "other" : void 0,
		"data-lpignore": suppressPasswordManager ? "true" : void 0,
		...props,
		"data-invalid": dataInvalid || void 0,
		"aria-invalid": dataInvalid ? "true" : void 0
	});
}
//#endregion
//#region src/components/field/field.tsx
const field = tv$1({
	slots: {
		root: ["group/field flex flex-col gap-1.5"],
		item: ["group/field-item flex items-start gap-2", "*:data-[slot=checkbox]:mt-px"],
		label: ["block leading-none", "group-data-disabled/field:text-foreground-disabled"],
		description: ["text-xs leading-5", "group-data-disabled/field:text-foreground-disabled"],
		error: ["text-xs leading-5", "group-data-disabled/field:text-foreground-disabled"]
	},
	variants: {
		theme: {
			brutal: {
				root: ["gap-1"],
				label: ["font-bold text-foreground"],
				description: ["text-foreground-strong/50"],
				error: ["text-danger"]
			},
			elegant: {
				label: ["font-medium text-foreground-strong dark:text-foreground-hint"],
				description: ["text-[13px] text-foreground-hint", "group-data-disabled/field:text-foreground-disabled"],
				error: ["text-[13px] text-danger"]
			}
		},
		size: {
			sm: { label: "text-xs" },
			md: { label: "text-sm" }
		}
	},
	compoundVariants: [{
		theme: "brutal",
		size: "sm",
		class: { label: "text-foreground-strong/60" }
	}],
	defaultVariants: { size: "md" }
});
function Field({ className, ...props }) {
	const theme = useThemeFamily();
	const { root } = field({ theme });
	return /* @__PURE__ */ jsx(Field$1.Root, {
		"data-slot": "field",
		className: root({ className }),
		...props
	});
}
function FieldItem({ className, ...props }) {
	const theme = useThemeFamily();
	const { item } = field({ theme });
	return /* @__PURE__ */ jsx(Field$1.Item, {
		"data-slot": "field-item",
		className: item({ className }),
		...props
	});
}
function FieldLabel({ size, required, optional, className, children, ...props }) {
	const theme = useThemeFamily();
	const { label } = field({
		theme,
		size
	});
	return /* @__PURE__ */ jsxs(Field$1.Label, {
		"data-slot": "field-label",
		className: label({ className }),
		...props,
		children: [
			children,
			required ? /* @__PURE__ */ jsx(LabelAsterisk, { className: "ml-1" }) : null,
			optional ? /* @__PURE__ */ jsx(LabelOptional, { className: "ml-1" }) : null
		]
	});
}
function FieldDescription({ className, ...props }) {
	const theme = useThemeFamily();
	const { description } = field({ theme });
	return /* @__PURE__ */ jsx(Field$1.Description, {
		"data-slot": "field-description",
		className: description({ className }),
		...props
	});
}
function FieldError({ className, role = "alert", ...props }) {
	const theme = useThemeFamily();
	const { error } = field({ theme });
	return /* @__PURE__ */ jsx(Field$1.Error, {
		"data-slot": "field-error",
		role,
		className: error({ className }),
		...props
	});
}
function FieldControl(props) {
	return /* @__PURE__ */ jsx(Field$1.Control, {
		"data-slot": "field-control",
		...props
	});
}
function FieldValidity(props) {
	return /* @__PURE__ */ jsx(Field$1.Validity, { ...props });
}
//#endregion
//#region src/components/input-group/input-group.tsx
const inputGroup = tv$1({
	slots: {
		root: ["group/input-group relative flex w-full min-w-0 items-center", "has-[[data-input-group-trim=inline-end]]:[&_[data-slot=input-group-control]]:pr-0"],
		addon: [
			"flex shrink-0 items-center justify-center gap-2 px-3",
			"select-none",
			"[&>svg:not([class*='size-'])]:size-3.5"
		],
		text: ["flex shrink-0 items-center px-3 text-sm", "select-none whitespace-nowrap"],
		control: ["min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"]
	},
	variants: {
		theme: {
			brutal: {
				root: [
					"border-2 border-line-strong bg-layer-panel shadow-raft-sm",
					"has-[[data-slot=input-group-control]:focus]:not-has-[[data-slot=input-group-control][data-invalid]]:shadow-raft-md",
					"has-[[data-slot=input-group-control][data-invalid]]:border-brutal-red has-[[data-slot=input-group-control][data-invalid]]:bg-brutal-red/5 has-[[data-slot=input-group-control][data-invalid]]:shadow-none has-[[data-slot=input-group-control][data-invalid]]:ring-2 has-[[data-slot=input-group-control][data-invalid]]:ring-brutal-red/60"
				],
				addon: ["text-foreground-strong/50"],
				text: ["font-heading text-foreground-strong/50"],
				control: ["font-heading"]
			},
			elegant: {
				root: [
					"overflow-hidden rounded-md border border-line-field bg-layer-panel shadow-none",
					"dark:bg-layer-card dark:not-has-[[data-slot=input-group-control][data-invalid]]:border-transparent",
					"dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
					"dark:hover:not-has-[[data-slot=input-group-control][data-invalid]]:border-ink-8",
					"text-foreground transition duration-200 ease-out dark:text-foreground-strong",
					"hover:border-line-field-hover",
					"has-[[data-slot=input-group-control]:focus]:bg-layer-panel dark:has-[[data-slot=input-group-control]:focus]:bg-layer-card",
					"has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-primary-400",
					"dark:has-[[data-slot=input-group-control]:focus-visible]:ring-2 dark:has-[[data-slot=input-group-control]:focus-visible]:ring-primary-400/60",
					"has-[[data-slot=input-group-control][data-invalid]]:border-danger/45 has-[[data-slot=input-group-control][data-invalid]]:hover:border-danger/75 has-[[data-slot=input-group-control][data-invalid]:focus]:border-danger/75",
					"has-[[data-slot=input-group-control][data-invalid]:focus-visible]:ring-2 has-[[data-slot=input-group-control][data-invalid]:focus-visible]:ring-[color-mix(in_oklch,var(--danger)_60%,transparent)]",
					"has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed has-[[data-slot=input-group-control]:disabled]:border-line-muted/60 has-[[data-slot=input-group-control]:disabled]:bg-fill-muted/50",
					"has-[[data-slot=input-group-control]:disabled]:hover:border-line-muted/60",
					"has-[[data-slot=input-group-control][data-invalid]:disabled]:border-line-muted/60 has-[[data-slot=input-group-control][data-invalid]:disabled]:ring-0"
				],
				addon: [
					"text-foreground-muted transition duration-200 ease-out",
					"group-has-[[data-slot=input-group-control]:focus]/input-group:text-foreground-strong",
					"group-has-[[data-slot=input-group-control]:disabled]/input-group:text-foreground-disabled"
				],
				text: [
					"text-foreground-placeholder transition duration-200 ease-out",
					"group-has-[[data-slot=input-group-control]:focus]/input-group:text-foreground-muted",
					"group-has-[[data-slot=input-group-control]:disabled]/input-group:text-foreground-disabled"
				],
				control: [
					"text-foreground placeholder:text-foreground-placeholder/70 dark:text-foreground-strong",
					"transition duration-200 ease-out placeholder:transition placeholder:duration-200 placeholder:ease-out",
					"disabled:cursor-not-allowed disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled"
				]
			}
		},
		align: {
			"inline-start": {
				addon: "order-first",
				text: "order-first"
			},
			"inline-end": {
				addon: "order-last",
				text: "order-last"
			}
		},
		variant: {
			default: {},
			container: {
				addon: [
					"self-stretch border-line-muted/90 bg-fill-muted/35",
					"dark:border-ink-6 dark:bg-layer-card/60",
					"text-foreground-placeholder"
				],
				text: [
					"self-stretch border-line-muted/90 bg-fill-muted/35",
					"dark:border-ink-6 dark:bg-layer-card/60",
					"text-foreground-placeholder"
				]
			}
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			variant: "container",
			class: {
				addon: "bg-brutal-yellow/30 font-bold text-foreground-strong/70",
				text: "bg-brutal-yellow/30 font-bold text-foreground-strong/70"
			}
		},
		{
			variant: "default",
			align: "inline-start",
			class: {
				addon: "[&~[data-slot=input-group-control]]:pl-0",
				text: "[&~[data-slot=input-group-control]]:pl-0"
			}
		},
		{
			variant: "container",
			align: "inline-start",
			class: {
				addon: "border-r",
				text: "border-r"
			}
		},
		{
			theme: "brutal",
			variant: "container",
			align: "inline-start",
			class: {
				addon: "border-r-2 border-line-strong",
				text: "border-r-2 border-line-strong"
			}
		},
		{
			variant: "container",
			align: "inline-end",
			class: {
				addon: "border-l",
				text: "border-l"
			}
		},
		{
			theme: "brutal",
			variant: "container",
			align: "inline-end",
			class: {
				addon: "border-l-2 border-line-strong",
				text: "border-l-2 border-line-strong"
			}
		}
	],
	defaultVariants: {
		align: "inline-start",
		variant: "default"
	}
});
function InputGroup({ className, ...props }) {
	const theme = useThemeFamily();
	const { root } = inputGroup({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "input-group",
		className: root({ className }),
		...props
	});
}
function InputGroupAddonRoot({ align = "inline-start", variant = "default", className, ...props }) {
	const theme = useThemeFamily();
	const { addon } = inputGroup({
		theme,
		align,
		variant
	});
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "input-group-addon",
		"data-align": align,
		"data-variant": variant,
		"data-input-group-trim": variant === "default" && align === "inline-end" ? align : void 0,
		className: addon({ className }),
		...props
	});
}
function TextAddon({ align = "inline-start", variant = "default", className, ...props }) {
	const theme = useThemeFamily();
	const { text } = inputGroup({
		theme,
		align,
		variant
	});
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "input-group-text",
		"data-align": align,
		"data-variant": variant,
		"data-input-group-trim": variant === "default" && align === "inline-end" ? align : void 0,
		className: text({ className }),
		...props
	});
}
const InputGroupAddon = Object.assign(InputGroupAddonRoot, { Text: TextAddon });
function InputGroupInput({ className, suppressPasswordManager, "data-invalid": dataInvalid, ...props }) {
	const theme = useThemeFamily();
	const { control } = inputGroup({ theme });
	return /* @__PURE__ */ jsx(Input$1, {
		"data-slot": "input-group-control",
		className: control({ className: [suppressPasswordManager && "keeper-ignore", className] }),
		"data-1p-ignore": suppressPasswordManager ? "true" : void 0,
		"data-bwignore": suppressPasswordManager ? "true" : void 0,
		"data-form-type": suppressPasswordManager ? "other" : void 0,
		"data-lpignore": suppressPasswordManager ? "true" : void 0,
		...props,
		"data-invalid": dataInvalid || void 0,
		"aria-invalid": dataInvalid ? "true" : void 0
	});
}
//#endregion
//#region src/components/combobox/combobox.tsx
const combobox = tv$1({
	slots: {
		trigger: [
			"inline-flex select-none items-center justify-between gap-2",
			"outline-none transition-colors",
			"**:data-[slot='button-content']:w-full **:data-[slot='button-content']:justify-between",
			"[&>span[data-slot='combobox-trigger-content']]:min-w-0 [&>span[data-slot='combobox-trigger-content']]:flex-1",
			"[&>span[data-slot='combobox-trigger-content']>svg]:shrink-0"
		],
		triggerCount: ["inline-flex h-4 min-w-4 shrink-0 items-center justify-center px-1", "font-mono text-[10px] leading-none"],
		triggerIndicator: ["ml-auto flex shrink-0 items-center justify-center opacity-60", "[&>svg]:size-3 [&>svg]:shrink-0"],
		control: [
			"flex min-w-0 items-center gap-2",
			"outline-none transition-colors",
			"[&>svg]:pointer-events-none [&>svg]:shrink-0",
			"[&>svg:not([class*='size-'])]:size-3.5",
			"[&_[data-slot='combobox-clear']]:size-5 [&_[data-slot='combobox-clear']]:min-w-5 **:data-[slot='combobox-clear']:shrink-0",
			"[&_[data-slot='combobox-trigger-indicator']]:size-4",
			"[&_[data-slot='combobox-trigger-indicator']>svg]:size-3.5 [&_[data-slot='combobox-trigger-indicator']>svg]:shrink-0"
		],
		inputGroup: ["flex items-center gap-2 border-b px-2 py-2"],
		input: ["w-full outline-none"],
		positioner: ["isolate z-50 outline-none"],
		content: ["h-auto max-h-(--available-height) min-w-[220px] overflow-hidden bg-layer-panel", "outline-none"],
		header: ["flex items-center justify-between px-3 py-2"],
		separator: ["h-px shrink-0 border-0"],
		list: ["max-h-64 overflow-y-auto overscroll-contain scroll-py-1"],
		item: ["flex w-full shrink-0 cursor-default select-none items-center justify-between gap-2 overflow-hidden px-3 py-1.5", "text-left outline-none transition-colors"],
		itemIndicator: ["pointer-events-none ml-auto flex shrink-0 items-center justify-center"],
		label: ["m-0 font-medium"],
		clear: [
			"inline-flex h-5 min-w-8 items-center justify-center",
			"pointer-events-none opacity-0 outline-none transition-colors",
			"data-visible:pointer-events-auto data-visible:opacity-100"
		],
		empty: ["px-3 py-4 text-center text-sm"],
		groupLabel: ["px-3 py-2"],
		chips: ["flex min-h-9 flex-wrap items-center gap-1"],
		chip: ["inline-flex items-center gap-1"],
		chipRemove: ["inline-flex items-center justify-center outline-none transition-colors"]
	},
	variants: {
		theme: {
			brutal: {
				trigger: [
					"data-popup-open:-translate-y-px data-popup-open:shadow-raft-md",
					"active:translate-x-0 active:-translate-y-px active:shadow-raft-md",
					"data-has-value:bg-primary data-has-value:text-foreground-strong data-has-value:shadow-raft-sm",
					"data-has-value:hover:bg-primary data-has-value:hover:shadow-raft-sm data-has-value:active:shadow-raft-sm",
					"[&>span[data-slot='combobox-trigger-content']>svg:not([class*='size-'])]:size-4",
					"[&>span[data-slot='combobox-trigger-content']>svg:not([class*='stroke-'])]:stroke-2"
				],
				triggerCount: ["border border-line-strong"],
				inputGroup: ["border-line-strong bg-layer-panel"],
				content: ["border-2 border-line-strong bg-layer-popover shadow-raft-lg"],
				separator: ["bg-line-strong"],
				item: [
					"border-b border-ink-10 bg-layer-popover font-sans text-sm font-semibold leading-6 text-foreground-strong last:border-b-0",
					"hover:bg-brutal-yellow/30 data-highlighted:bg-brutal-yellow/30",
					"data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
					"[&_svg]:pointer-events-none [&_svg]:shrink-0",
					"[&_svg:not([class*='size-'])]:size-3",
					"[&_svg:not([class*='stroke-'])]:stroke-2"
				],
				itemIndicator: ["text-foreground-strong [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2"],
				label: ["font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-foreground-strong/60"],
				clear: ["font-sans text-[10px] font-bold uppercase tracking-wide text-foreground-strong hover:text-foreground-strong", "[&>svg]:stroke-2 [&>svg_*]:stroke-2"],
				triggerIndicator: ["text-foreground-strong opacity-100", "[&>svg]:stroke-2 [&>svg_*]:stroke-2"],
				control: [
					"border-2 border-line-strong bg-layer-panel px-2 py-1",
					"font-sans text-sm font-semibold text-foreground-strong shadow-raft-sm",
					"focus-within:shadow-raft-md",
					"data-[popup-open]:translate-x-0 data-[popup-open]:translate-y-0",
					"[&>svg:not([class*='stroke-'])]:stroke-[1.5]",
					"[&_[data-slot='combobox-trigger-indicator']>svg]:stroke-[1.5] [&_[data-slot='combobox-trigger-indicator']>svg_*]:stroke-[1.5] [&_[data-slot='combobox-trigger-indicator']>svg_*]:fill-none"
				],
				empty: ["font-sans text-sm font-semibold text-foreground-strong/50"],
				groupLabel: ["font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-foreground-strong/60"],
				chips: ["border-2 border-line-strong bg-layer-panel px-2 py-1"],
				chip: ["border border-line-strong bg-brutal-yellow px-1.5 py-0.5 font-sans text-xs font-bold"],
				chipRemove: ["text-foreground-strong/50 hover:text-foreground-strong"]
			},
			elegant: {
				trigger: [
					"text-sm font-medium tracking-[-0.005em] text-foreground-muted",
					"hover:bg-ink-2 active:scale-100",
					"focus-visible:ring-1 focus-visible:ring-primary-400",
					"[&>span[data-slot='combobox-trigger-content']>svg:not([class*='size-'])]:size-3",
					"[&>span[data-slot='combobox-trigger-content']>svg:not([class*='stroke-'])]:stroke-[1.5]"
				],
				triggerCount: ["rounded-sm bg-primary-400 font-sans font-medium tracking-[0.22px] text-primary-950"],
				inputGroup: ["border-line-hairline bg-layer-popover px-1.5 pt-1 pb-2"],
				content: ["rounded-md bg-layer-popover", "shadow-raft-lg"],
				header: ["pl-2 pr-1.5 pt-2.5 pb-0.5"],
				separator: ["hidden bg-line-hairline"],
				list: ["flex flex-col gap-0.5 px-1.5 py-1"],
				item: [
					"rounded-sm bg-transparent px-2 text-sm font-normal tracking-[-0.005em] text-foreground-muted",
					"transition-[background-color,color] duration-150",
					"hover:bg-ink-4 hover:text-foreground",
					"data-highlighted:bg-ink-4 data-highlighted:text-foreground",
					"data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
					"[&_svg]:pointer-events-none [&_svg]:shrink-0",
					"[&_svg:not([class*='size-'])]:size-3.5",
					"[&_svg:not([class*='stroke-'])]:stroke-[1.5]"
				],
				itemIndicator: ["text-foreground [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:stroke-[1.5] [&>svg_*]:stroke-[1.5]"],
				label: ["text-[11px] leading-none tracking-[-0.005em] text-foreground-strong/45"],
				clear: ["text-[11px] font-medium tracking-[-0.005em] text-foreground-muted hover:text-foreground", "[&>svg]:stroke-[1.5] [&>svg_*]:stroke-[1.5]"],
				triggerIndicator: ["text-foreground-muted opacity-100", "[&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5]"],
				control: [
					"rounded-md border border-line-muted bg-layer-panel px-2.5 py-1.5",
					"dark:border-transparent dark:bg-layer-card",
					"text-sm font-normal text-foreground-strong shadow-[0_1px_1px_color-mix(in_oklch,var(--ink)_5%,transparent)]",
					"dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
					"dark:hover:border-ink-8",
					"focus-within:ring-1 focus-within:ring-primary-400",
					"dark:focus-within:ring-2 dark:focus-within:ring-primary-400/60",
					"[&>svg:not([class*='stroke-'])]:stroke-[1.5]"
				],
				empty: ["text-foreground-muted"],
				groupLabel: ["text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45"],
				chips: [
					"rounded-md border border-line-muted bg-layer-panel px-2 py-1",
					"dark:border-transparent dark:bg-layer-card",
					"dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
					"dark:hover:border-ink-8",
					"focus-within:ring-1 focus-within:ring-primary-400",
					"dark:focus-within:ring-2 dark:focus-within:ring-primary-400/60"
				],
				chip: ["rounded-sm bg-fill-muted px-1.5 py-0.5 text-xs font-medium text-foreground-strong"],
				chipRemove: ["text-foreground-muted hover:text-foreground"]
			}
		},
		inputOwner: {
			group: {},
			control: { input: ["min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 shadow-none", "outline-none ring-0 focus:border-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"] }
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			inputOwner: "group",
			class: { input: ["border-2 border-line-strong bg-layer-panel px-2 py-1 font-mono text-xs", "shadow-raft-sm focus:shadow-raft-md"] }
		},
		{
			theme: "brutal",
			inputOwner: "control",
			class: { input: ["font-sans text-sm font-semibold text-foreground-strong", "placeholder:text-foreground-strong/40"] }
		},
		{
			theme: "elegant",
			inputOwner: "group",
			class: { input: [
				"rounded-sm border border-line-muted bg-layer-panel px-2 py-1 text-sm",
				"text-foreground-strong outline-none transition duration-150",
				"placeholder:text-foreground-placeholder/70",
				"focus-visible:ring-1 focus-visible:ring-primary-400"
			] }
		},
		{
			theme: "elegant",
			inputOwner: "control",
			class: { input: ["text-sm font-normal text-foreground-strong", "placeholder:text-foreground-placeholder/70"] }
		}
	]
});
const ComboboxContext = createContext({
	hasValue: false,
	visible: false
});
const ComboboxInputOwnerContext = createContext("group");
function hasClearableValue(value) {
	if (Array.isArray(value)) return value.length > 0;
	return value != null;
}
function hasClearableInputValue(value) {
	if (Array.isArray(value)) return value.length > 0;
	if (typeof value === "string") return value.length > 0;
	if (typeof value === "number") return true;
	return value != null;
}
function Combobox({ defaultInputValue, defaultValue, inputValue, onInputValueChange, onValueChange, value, ...props }) {
	const [uncontrolledInputValue, setUncontrolledInputValue] = useState(defaultInputValue ?? "");
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
	const resolvedInputValue = inputValue === void 0 ? uncontrolledInputValue : inputValue;
	const hasValue = hasClearableValue(value === void 0 ? uncontrolledValue : value);
	const visible = hasValue || hasClearableInputValue(resolvedInputValue);
	const contextValue = useMemo(() => ({
		hasValue,
		visible
	}), [hasValue, visible]);
	return /* @__PURE__ */ jsx(ComboboxContext.Provider, {
		value: contextValue,
		children: /* @__PURE__ */ jsx(Combobox$1.Root, {
			"data-slot": "combobox",
			defaultInputValue,
			defaultValue,
			inputValue,
			value,
			onInputValueChange: (nextInputValue, eventDetails) => {
				if (inputValue === void 0) setUncontrolledInputValue(nextInputValue);
				onInputValueChange?.(nextInputValue, eventDetails);
			},
			onValueChange: (nextValue, eventDetails) => {
				if (value === void 0) setUncontrolledValue(nextValue);
				onValueChange?.(nextValue, eventDetails);
			},
			...props
		})
	});
}
function ComboboxLabel({ className, ...props }) {
	const theme = useThemeFamily();
	const { label } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.Label, {
		"data-slot": "combobox-label",
		className: label({ className }),
		...props
	});
}
function ComboboxValue(props) {
	return /* @__PURE__ */ jsx(Combobox$1.Value, {
		"data-slot": "combobox-value",
		...props
	});
}
function ComboboxTrigger({ className, children, render, ...props }) {
	const theme = useThemeFamily();
	const { hasValue } = use(ComboboxContext);
	const { trigger } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.Trigger, {
		"data-slot": "combobox-trigger",
		"data-has-value": hasValue ? "" : void 0,
		render: render ?? /* @__PURE__ */ jsx(Button, {
			variant: "outline",
			size: "md",
			className: trigger({ className })
		}),
		...props,
		children: /* @__PURE__ */ jsx("span", {
			"data-slot": "combobox-trigger-content",
			"data-picker-trigger-content": "combobox",
			className: "flex min-w-0 flex-1 items-center gap-1.5",
			children
		})
	});
}
function ComboboxTriggerCount({ className, ...props }) {
	const theme = useThemeFamily();
	const { triggerCount } = combobox({ theme });
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "combobox-trigger-count",
		className: triggerCount({ className }),
		...props
	});
}
function ComboboxTriggerIndicator({ className, ...props }) {
	const theme = useThemeFamily();
	const { triggerIndicator } = combobox({ theme });
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "combobox-trigger-indicator",
		"data-picker-trigger-indicator": "",
		className: triggerIndicator({ className }),
		...props
	});
}
function ComboboxInputGroup({ className, ...props }) {
	const theme = useThemeFamily();
	const { inputGroup } = combobox({ theme });
	return /* @__PURE__ */ jsx(ComboboxInputOwnerContext, {
		value: "group",
		children: /* @__PURE__ */ jsx(Combobox$1.InputGroup, {
			"data-slot": "combobox-input-group",
			className: inputGroup({ className }),
			...props
		})
	});
}
function ComboboxControl({ className, ...props }) {
	const theme = useThemeFamily();
	const { control } = combobox({ theme });
	return /* @__PURE__ */ jsx(ComboboxInputOwnerContext, {
		value: "control",
		children: /* @__PURE__ */ jsx(Combobox$1.InputGroup, {
			"data-slot": "combobox-control",
			className: control({ className }),
			...props
		})
	});
}
function ComboboxInput({ suppressPasswordManager, className, ...props }) {
	const theme = useThemeFamily();
	const inputOwner = use(ComboboxInputOwnerContext);
	const { input } = combobox({
		theme,
		inputOwner
	});
	return /* @__PURE__ */ jsx(Combobox$1.Input, {
		"data-slot": "combobox-input",
		className: input({ className: [suppressPasswordManager && "keeper-ignore", className] }),
		"data-1p-ignore": suppressPasswordManager ? "true" : void 0,
		"data-bwignore": suppressPasswordManager ? "true" : void 0,
		"data-form-type": suppressPasswordManager ? "other" : void 0,
		"data-lpignore": suppressPasswordManager ? "true" : void 0,
		...props
	});
}
function ComboboxPortal(props) {
	return /* @__PURE__ */ jsx(Combobox$1.Portal, {
		"data-slot": "combobox-portal",
		...useThemeScopeProps(props)
	});
}
function ComboboxPopup({ className, ...props }) {
	const theme = useThemeFamily();
	const { content } = combobox({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "combobox-content",
		className: content({ className }),
		...props
	});
}
function ComboboxHeader({ className, ...props }) {
	const theme = useThemeFamily();
	const { header } = combobox({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "combobox-header",
		className: header({ className }),
		...props
	});
}
function ComboboxSeparator({ className, ...props }) {
	const theme = useThemeFamily();
	const { separator } = combobox({ theme });
	return /* @__PURE__ */ jsx("div", {
		role: "separator",
		"aria-orientation": "horizontal",
		"data-slot": "combobox-separator",
		className: separator({ className }),
		...props
	});
}
function ComboboxContent({ align = "start", alignOffset = 0, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking = true, positionMethod = "fixed", side = "bottom", sideOffset = 4, sticky, portalProps, className, initialFocus = false, finalFocus = false, ...props }) {
	const theme = useThemeFamily();
	const { positioner, content } = combobox({ theme });
	return /* @__PURE__ */ jsx(ComboboxPortal, {
		...portalProps,
		children: /* @__PURE__ */ jsx(Combobox$1.Positioner, {
			align,
			alignOffset,
			anchor,
			arrowPadding,
			collisionAvoidance,
			collisionBoundary,
			collisionPadding,
			disableAnchorTracking,
			positionMethod,
			side,
			sideOffset,
			sticky,
			className: positioner(),
			children: /* @__PURE__ */ jsx(Combobox$1.Popup, {
				"data-slot": "combobox-content",
				className: content({ className }),
				initialFocus,
				finalFocus,
				...props
			})
		})
	});
}
function ComboboxList({ className, ...props }) {
	const theme = useThemeFamily();
	const { list } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.List, {
		"data-slot": "combobox-list",
		className: list({ className }),
		...props
	});
}
function ComboboxItem({ className, ...props }) {
	const theme = useThemeFamily();
	const { item } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.Item, {
		"data-slot": "combobox-item",
		className: item({ className }),
		...props
	});
}
function ComboboxItemIndicator({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { itemIndicator } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.ItemIndicator, {
		"data-slot": "combobox-item-indicator",
		className: itemIndicator({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(Check, {
			"aria-hidden": true,
			className: "size-3.5 shrink-0 stroke-[1.5]"
		})
	});
}
function ComboboxClear({ className, children, keepMounted = true, ...props }) {
	const theme = useThemeFamily();
	const { visible } = use(ComboboxContext);
	const { clear } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.Clear, {
		"data-slot": "combobox-clear",
		"data-visible": visible ? "" : void 0,
		"aria-hidden": visible ? props["aria-hidden"] : true,
		keepMounted,
		className: clear({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(X, {
			"aria-hidden": true,
			className: "size-3.5 shrink-0"
		})
	});
}
function ComboboxEmpty({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { empty } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.Empty, {
		"data-slot": "combobox-empty",
		...props,
		children: children == null ? null : /* @__PURE__ */ jsx("div", {
			"data-slot": "combobox-empty-content",
			className: empty({ className }),
			children
		})
	});
}
function ComboboxGroup({ className, ...props }) {
	return /* @__PURE__ */ jsx(Combobox$1.Group, {
		"data-slot": "combobox-group",
		className,
		...props
	});
}
function ComboboxGroupLabel({ className, ...props }) {
	const theme = useThemeFamily();
	const { groupLabel } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.GroupLabel, {
		"data-slot": "combobox-group-label",
		className: groupLabel({ className }),
		...props
	});
}
function ComboboxRow({ className, ...props }) {
	return /* @__PURE__ */ jsx(Combobox$1.Row, {
		"data-slot": "combobox-row",
		className,
		...props
	});
}
function ComboboxCollection(props) {
	return /* @__PURE__ */ jsx(Combobox$1.Collection, {
		"data-slot": "combobox-collection",
		...props
	});
}
function ComboboxChips({ className, ...props }) {
	const theme = useThemeFamily();
	const { chips } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.Chips, {
		"data-slot": "combobox-chips",
		className: chips({ className }),
		...props
	});
}
function ComboboxChip({ className, ...props }) {
	const theme = useThemeFamily();
	const { chip } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.Chip, {
		"data-slot": "combobox-chip",
		className: chip({ className }),
		...props
	});
}
function ComboboxChipRemove({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { chipRemove } = combobox({ theme });
	return /* @__PURE__ */ jsx(Combobox$1.ChipRemove, {
		"data-slot": "combobox-chip-remove",
		className: chipRemove({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(X, {
			"aria-hidden": true,
			className: "size-3 shrink-0"
		})
	});
}
//#endregion
//#region src/components/picker-trigger-button/picker-trigger-button.tsx
const pickerTriggerButton = tv$1({
	base: [
		"relative inline-flex h-8 shrink-0 items-center justify-center gap-2 px-3 py-1.5",
		"text-xs whitespace-nowrap select-none",
		"rounded-none",
		"outline-[1px] outline-offset-2 outline-transparent transition-colors duration-100 focus-visible:outline-transparent",
		"disabled:pointer-events-none disabled:transform-none disabled:opacity-40",
		"has-data-[icon=inline-start]:pl-2.5 has-data-[icon=inline-end]:pr-2.5",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 **:data-icon:size-[1em]"
	],
	variants: { theme: {
		brutal: [
			"border-2 border-[oklch(0_0_0/0.3)] bg-white shadow-none",
			"font-sans font-bold text-[oklch(0_0_0/0.7)]",
			"hover:translate-y-0 hover:border-black hover:bg-white hover:shadow-none",
			"active:translate-x-0 active:translate-y-0 active:shadow-none",
			"data-popup-open:translate-y-0 data-popup-open:shadow-none",
			"[&_[data-picker-trigger-content]>svg:not([class*='size-'])]:size-3.5",
			"**:data-picker-trigger-indicator:text-inherit **:data-picker-trigger-indicator:opacity-100",
			"[&_[data-picker-trigger-indicator]>svg]:size-3 [&_[data-picker-trigger-indicator]>svg]:stroke-2 [&_[data-picker-trigger-indicator]>svg_*]:stroke-2"
		],
		elegant: [
			"h-7 overflow-clip rounded-md border-0 bg-layer-panel px-2.5 py-0",
			"font-sans text-xs font-medium tracking-[-0.005em] text-foreground-placeholder antialiased",
			"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)] dark:shadow-raft-xs",
			"before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-[inherit] before:bg-[linear-gradient(in_oklab_180deg,oklab(0%_0_0/0%)_30%,oklab(0%_0_0/1%)_100%)]",
			"hover:bg-ink-2 active:scale-100 dark:bg-fill-muted dark:hover:bg-fill-strong",
			"focus-visible:ring-1 focus-visible:ring-primary-400 focus-visible:ring-offset-1 focus-visible:ring-offset-layer-canvas-muted",
			"data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75",
			"data-invalid:focus-visible:ring-2 data-invalid:focus-visible:ring-[color-mix(in_oklch,var(--danger)_60%,transparent)]",
			"[&_[data-slot='select-value']]:font-medium",
			"[&_[data-picker-trigger-content='combobox']>svg]:shrink-0",
			"[&_[data-picker-trigger-content='combobox']>svg:not([class*='size-'])]:size-3",
			"[&_[data-picker-trigger-content='combobox']>svg:not([class*='stroke-'])]:stroke-[1.5]",
			"[&_[data-picker-trigger-content='select']_svg]:shrink-0",
			"[&_[data-picker-trigger-content='select']_svg:not([class*='size-'])]:size-3.5",
			"[&_[data-picker-trigger-content='select']_svg:not([class*='stroke-'])]:stroke-[1.5]"
		]
	} }
});
function PickerTriggerButton({ className, render, nativeButton, ...props }) {
	const theme = useThemeFamily();
	return /* @__PURE__ */ jsx(Button$1, {
		...props,
		render,
		nativeButton: nativeButton ?? defaultNativeButton(render),
		"data-slot": "picker-trigger-button",
		className: pickerTriggerButton({
			theme,
			className
		})
	});
}
//#endregion
//#region src/components/select/select.tsx
const select = tv$1({
	slots: {
		trigger: [
			"inline-flex select-none items-center justify-between gap-2",
			"outline-none transition-colors",
			"data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75 data-invalid:focus-visible:ring-2 data-invalid:focus-visible:ring-[color-mix(in_oklch,var(--danger)_60%,transparent)]",
			"**:data-[slot='button-content']:w-full **:data-[slot='button-content']:justify-between",
			"[&>span[data-slot='select-trigger-content']]:min-w-0 [&>span[data-slot='select-trigger-content']]:flex-1",
			"[&_[data-slot='select-trigger-content']_svg]:shrink-0",
			"[&_[data-slot='select-trigger-content']_svg:not([class*='size-'])]:size-3.5",
			"[&_[data-slot='select-trigger-content']_svg:not([class*='stroke-'])]:stroke-[1.5]"
		],
		icon: ["ml-auto flex shrink-0 items-center justify-center opacity-80 transition-transform", "[&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:stroke-[1.5] [&>svg_*]:stroke-[1.5]"],
		value: ["flex min-w-0 flex-1 truncate text-left"],
		positioner: ["isolate z-50 outline-none"],
		content: ["relative max-h-(--available-height) min-w-[max(var(--anchor-width),220px)] overflow-hidden bg-layer-panel", "outline-none"],
		list: ["max-h-64 overflow-y-auto overscroll-contain scroll-py-6"],
		item: ["flex w-full shrink-0 cursor-default select-none items-center justify-between gap-2 overflow-hidden px-3", "text-left outline-none transition-colors"],
		itemLeading: ["flex shrink-0 items-center justify-center", "[&_svg]:pointer-events-none [&_svg]:shrink-0"],
		itemIndicator: ["pointer-events-none ml-auto flex shrink-0 items-center justify-center"],
		itemText: ["min-w-0 flex-1 truncate"],
		label: ["m-0 font-medium"],
		group: ["flex flex-col"],
		groupLabel: ["px-3 py-2"],
		separator: ["h-px shrink-0 border-0"],
		scrollArrow: [
			"absolute inset-x-0 z-10 flex h-6 w-full cursor-default items-center justify-center",
			"outline-none transition-colors",
			"data-[direction=up]:top-0 data-[direction=down]:bottom-0",
			"[&_svg]:pointer-events-none [&_svg]:shrink-0"
		],
		empty: ["px-3 py-4 text-center text-sm"]
	},
	variants: { theme: {
		brutal: {
			trigger: [
				"w-full",
				"data-popup-open:-translate-y-px data-popup-open:shadow-raft-md",
				"active:translate-x-0 active:-translate-y-px active:shadow-raft-md",
				"[&_[data-slot='select-value']_svg:not([class*='stroke-'])]:stroke-2",
				"[&[data-popup-open]_[data-slot='select-icon']]:rotate-180"
			],
			content: ["w-(--anchor-width) min-w-(--anchor-width) border-2 border-line-strong bg-layer-popover shadow-raft-md"],
			item: [
				"border-b border-ink-10 bg-layer-popover py-1.5 text-xs font-bold leading-6 text-foreground-strong last:border-b-0",
				"[&_[data-slot='select-item-text']]:font-bold",
				"hover:bg-primary/30 data-highlighted:bg-primary/30",
				"data-selected:bg-layer-popover data-selected:hover:bg-primary/30 data-[selected][data-highlighted]:bg-primary/30",
				"data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
				"[&>svg]:pointer-events-none [&>svg]:shrink-0",
				"[&>svg:not([class*='size-'])]:size-3",
				"[&>svg:not([class*='stroke-'])]:stroke-2"
			],
			itemLeading: [
				"size-5 text-foreground-strong",
				"[&>svg]:pointer-events-none [&>svg]:shrink-0",
				"[&>svg:not([class*='size-'])]:size-3.5",
				"[&>svg:not([class*='stroke-'])]:stroke-2"
			],
			itemIndicator: ["text-foreground-strong [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:stroke-[2.25] [&>svg_*]:stroke-[2.25]"],
			label: ["font-sans text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground-strong"],
			groupLabel: ["font-sans text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground-strong/60"],
			separator: ["bg-line-strong"],
			scrollArrow: ["border-line-strong bg-layer-popover text-foreground-strong", "data-[direction=up]:border-b data-[direction=down]:border-t"],
			empty: ["font-sans text-sm font-semibold text-foreground-strong/50"]
		},
		elegant: {
			trigger: [
				"text-sm font-medium tracking-[-0.005em] text-foreground-muted",
				"hover:bg-ink-2 active:scale-100",
				"focus-visible:ring-1 focus-visible:ring-primary-400",
				"[&_[data-slot='button-content']]:font-medium [&_[data-slot='select-value']]:font-medium"
			],
			content: ["rounded-md bg-layer-popover", "shadow-raft-lg"],
			list: ["flex flex-col gap-0.5 px-1 py-1"],
			item: [
				"rounded-sm bg-transparent px-2 py-1.5 text-[13px] font-normal leading-5 tracking-[-0.005em] text-foreground-muted",
				"transition-[background-color,color] duration-150",
				"hover:bg-ink-4 hover:text-foreground",
				"data-highlighted:bg-ink-4 data-highlighted:text-foreground",
				"data-selected:bg-ink-4 data-selected:text-foreground",
				"data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
				"[&>svg]:pointer-events-none [&>svg]:shrink-0",
				"[&>svg:not([class*='size-'])]:size-3.5",
				"[&>svg:not([class*='stroke-'])]:stroke-[1.5]"
			],
			itemLeading: [
				"size-4 text-foreground-muted",
				"[&>svg]:pointer-events-none [&>svg]:shrink-0",
				"[&>svg:not([class*='size-'])]:size-3.5",
				"[&>svg:not([class*='stroke-'])]:stroke-[1.5]"
			],
			itemIndicator: ["text-foreground [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:stroke-[1.5] [&>svg_*]:stroke-[1.5]"],
			label: ["text-[11px] leading-none tracking-[-0.005em] text-foreground"],
			group: ["gap-0.5"],
			groupLabel: ["px-2 text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45"],
			separator: ["hidden bg-line-hairline"],
			scrollArrow: ["bg-layer-popover text-foreground-placeholder hover:text-foreground-muted"],
			empty: ["text-foreground-muted"]
		}
	} }
});
function Select(props) {
	return /* @__PURE__ */ jsx(Select$1.Root, {
		"data-slot": "select",
		...props
	});
}
function SelectTrigger({ className, children, render, "data-invalid": dataInvalid, ...props }) {
	const theme = useThemeFamily();
	const { trigger } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.Trigger, {
		"data-slot": "select-trigger",
		render: render ?? /* @__PURE__ */ jsx(Button, {
			variant: "outline",
			size: "md",
			className: trigger({ className })
		}),
		...props,
		"data-invalid": dataInvalid || void 0,
		"aria-invalid": dataInvalid ? "true" : void 0,
		children: /* @__PURE__ */ jsx("span", {
			"data-slot": "select-trigger-content",
			"data-picker-trigger-content": "select",
			className: "flex min-w-0 flex-1 items-center gap-1.5",
			children
		})
	});
}
function SelectValue({ className, ...props }) {
	const theme = useThemeFamily();
	const { value } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.Value, {
		"data-slot": "select-value",
		className: value({ className }),
		...props
	});
}
function SelectIcon({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { icon } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.Icon, {
		"data-slot": "select-icon",
		"data-picker-trigger-indicator": "",
		className: icon({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(ChevronDown, {
			"aria-hidden": true,
			className: "size-3.5 shrink-0"
		})
	});
}
function SelectPortal(props) {
	return /* @__PURE__ */ jsx(Select$1.Portal, {
		"data-slot": "select-portal",
		...useThemeScopeProps(props)
	});
}
function SelectPopup({ className, ...props }) {
	const theme = useThemeFamily();
	const { content } = select({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "select-content",
		className: content({ className }),
		...props
	});
}
function SelectContent({ align = "start", alignItemWithTrigger = false, alignOffset = 0, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking = true, positionMethod = "fixed", side = "bottom", sideOffset = 4, sticky, portalProps, className, ...props }) {
	const theme = useThemeFamily();
	const { positioner, content } = select({ theme });
	const positionerNode = /* @__PURE__ */ jsx(Select$1.Positioner, {
		align,
		alignItemWithTrigger,
		alignOffset,
		anchor,
		arrowPadding,
		collisionAvoidance,
		collisionBoundary,
		collisionPadding,
		disableAnchorTracking,
		positionMethod,
		side,
		sideOffset,
		sticky,
		className: positioner(),
		children: /* @__PURE__ */ jsx(Select$1.Popup, {
			"data-slot": "select-content",
			className: content({ className }),
			...props
		})
	});
	return /* @__PURE__ */ jsx(SelectPortal, {
		...portalProps,
		children: positionerNode
	});
}
function SelectList({ className, ...props }) {
	const theme = useThemeFamily();
	const { list } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.List, {
		"data-slot": "select-list",
		className: list({ className }),
		...props
	});
}
function SelectItem({ className, ...props }) {
	const theme = useThemeFamily();
	const { item } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.Item, {
		"data-slot": "select-item",
		className: item({ className }),
		...props
	});
}
function SelectItemLeading({ className, ...props }) {
	const theme = useThemeFamily();
	const { itemLeading } = select({ theme });
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "select-item-leading",
		className: itemLeading({ className }),
		...props
	});
}
function SelectItemIndicator({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { itemIndicator } = select({ theme });
	const defaultIndicator = theme === "brutal" ? /* @__PURE__ */ jsx(Check, {
		"aria-hidden": true,
		size: 12,
		className: "shrink-0"
	}) : /* @__PURE__ */ jsx(Check, {
		"aria-hidden": true,
		className: "size-3 shrink-0"
	});
	return /* @__PURE__ */ jsx(Select$1.ItemIndicator, {
		"data-slot": "select-item-indicator",
		className: itemIndicator({ className }),
		...props,
		children: children ?? defaultIndicator
	});
}
function SelectItemText({ className, ...props }) {
	const theme = useThemeFamily();
	const { itemText } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.ItemText, {
		"data-slot": "select-item-text",
		className: itemText({ className }),
		...props
	});
}
function SelectLabel({ className, ...props }) {
	const theme = useThemeFamily();
	const { label } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.Label, {
		"data-slot": "select-label",
		className: label({ className }),
		...props
	});
}
function SelectGroup({ className, ...props }) {
	const theme = useThemeFamily();
	const { group } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.Group, {
		"data-slot": "select-group",
		className: group({ className }),
		...props
	});
}
function SelectGroupLabel({ className, ...props }) {
	const theme = useThemeFamily();
	const { groupLabel } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.GroupLabel, {
		"data-slot": "select-group-label",
		className: groupLabel({ className }),
		...props
	});
}
function SelectSeparator({ className, ...props }) {
	const theme = useThemeFamily();
	const { separator } = select({ theme });
	return /* @__PURE__ */ jsx("div", {
		role: "separator",
		"aria-orientation": "horizontal",
		"data-slot": "select-separator",
		className: separator({ className }),
		...props
	});
}
function SelectScrollUpArrow({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { scrollArrow } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.ScrollUpArrow, {
		"data-slot": "select-scroll-up-arrow",
		"data-direction": "up",
		className: scrollArrow({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(ChevronDown, {
			"aria-hidden": true,
			className: "size-3.5 shrink-0 rotate-180"
		})
	});
}
function SelectScrollDownArrow({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { scrollArrow } = select({ theme });
	return /* @__PURE__ */ jsx(Select$1.ScrollDownArrow, {
		"data-slot": "select-scroll-down-arrow",
		"data-direction": "down",
		className: scrollArrow({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(ChevronDown, {
			"aria-hidden": true,
			className: "size-3.5 shrink-0"
		})
	});
}
function SelectArrow({ className, ...props }) {
	return /* @__PURE__ */ jsx(Select$1.Arrow, {
		"data-slot": "select-arrow",
		className,
		...props
	});
}
//#endregion
//#region src/components/radio-group/radio-group.tsx
const radioGroup = tv$1({
	slots: {
		root: [
			"grid w-full gap-2",
			"data-disabled:[&>label]:cursor-not-allowed data-disabled:[&>label]:text-foreground-disabled",
			"data-disabled:[&>label_*]:text-foreground-disabled"
		],
		item: [
			"relative inline-flex shrink-0 touch-manipulation items-center justify-center rounded-full outline-none",
			"data-disabled:cursor-not-allowed",
			"after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']"
		],
		indicator: ["pointer-events-none flex size-full items-center justify-center"],
		dot: ["block rounded-full bg-current"]
	},
	variants: { theme: {
		brutal: {
			root: ["font-sans [&>label]:font-medium"],
			item: [
				"size-4 border-2 border-line-strong bg-layer-panel text-foreground",
				"hover:bg-primary-400/30 data-checked:bg-primary-400",
				"data-disabled:border-line-hairline data-disabled:bg-fill-muted data-disabled:text-line data-disabled:hover:bg-fill-muted",
				"data-checked:data-disabled:bg-fill-muted",
				"focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted"
			],
			dot: "size-1.5"
		},
		elegant: {
			root: "gap-2.5",
			item: [
				"size-3.5 bg-layer-panel text-foreground-inverse",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_1px_1.5px_-1px_oklch(0_0_0/0.035),0_1px_2.5px_-0.5px_oklch(0_0_0/0.12),0_0_0_1px_var(--line-muted)]",
				"dark:not-data-checked:not-data-disabled:bg-layer-inset",
				"dark:not-data-checked:not-data-disabled:shadow-[inset_0_1px_1.5px_oklch(0_0_0/0.3),0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
				"hover:bg-ink-4 data-checked:bg-[color-mix(in_srgb-linear,var(--primary-400)_94%,var(--ink))] data-checked:text-white dark:data-checked:bg-primary-400 dark:data-checked:text-foreground-inverse",
				"data-checked:shadow-[0_1px_1.5px_-1px_oklch(0_0_0/0.06),0_0_0_0.5px_color-mix(in_srgb,var(--primary-400)_20%,transparent)]",
				"dark:data-checked:shadow-[0_1px_1.5px_-1px_oklch(0_0_0/0.4),0_0_0_0.5px_color-mix(in_srgb,var(--primary-500)_35%,transparent)]",
				"data-disabled:bg-fill-muted data-disabled:text-line data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)] data-disabled:hover:bg-fill-muted",
				"data-checked:data-disabled:bg-fill-muted data-checked:data-disabled:text-line data-checked:data-disabled:shadow-[0_1px_1px_-1px_oklch(0_0_0/0.02),0_0_0_1px_var(--line-muted)]",
				"active:scale-[0.96] data-disabled:active:scale-100 motion-reduce:active:scale-100",
				"focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted"
			],
			dot: "size-1.5"
		}
	} }
});
function RadioGroup({ className, ...props }) {
	const theme = useThemeFamily();
	const { root } = radioGroup({ theme });
	return /* @__PURE__ */ jsx(RadioGroup$1, {
		"data-slot": "radio-group",
		className: root({ className }),
		...props
	});
}
function RadioGroupIndicator({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { indicator, dot } = radioGroup({ theme });
	return /* @__PURE__ */ jsx(Radio.Indicator, {
		"data-slot": "radio-group-indicator",
		className: indicator({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx("span", {
			"data-slot": "radio-group-dot",
			className: dot()
		})
	});
}
function RadioGroupItem({ appearance = "default", className, children, ...props }) {
	const theme = useThemeFamily();
	const { item } = radioGroup({ theme });
	const itemClassName = appearance === "none" ? cn("sr-only", "data-disabled:cursor-not-allowed", className) : item({ className });
	return /* @__PURE__ */ jsx(Radio.Root, {
		"data-slot": "radio-group-item",
		className: itemClassName,
		...props,
		children: children ?? (appearance === "default" ? /* @__PURE__ */ jsx(RadioGroupIndicator, {}) : null)
	});
}
//#endregion
//#region src/components/switch/switch.tsx
const switchRecipe = tv$1({
	slots: {
		root: [
			"relative inline-flex shrink-0 touch-manipulation items-center outline-none",
			"transition-[background-color,box-shadow,transform] duration-180 ease-out",
			"motion-reduce:transition-none",
			"not-data-disabled:cursor-pointer",
			"data-disabled:cursor-not-allowed",
			"after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
			"data-checked:bg-primary-400",
			"focus-visible:ring-2 focus-visible:ring-line-strong focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted"
		],
		thumb: [
			"pointer-events-none block",
			"transition-transform duration-180 ease-out",
			"motion-reduce:transition-none"
		]
	},
	variants: {
		theme: {
			brutal: {
				root: [
					"border-2 border-line-strong bg-layer-panel",
					"not-data-disabled:hover:bg-primary-400/30 data-checked:not-data-disabled:hover:bg-primary-400",
					"data-disabled:border-line-hairline data-disabled:bg-fill-muted",
					"data-checked:data-disabled:bg-fill-muted"
				],
				thumb: ["bg-line-strong", "data-disabled:bg-line"]
			},
			elegant: {
				root: [
					"rounded-full bg-foreground-strong/12",
					"dark:not-data-checked:not-data-disabled:bg-layer-card",
					"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_1px_1.5px_-1px_oklch(0_0_0/0.08)]",
					"dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.35),inset_0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
					"not-data-disabled:hover:bg-foreground-strong/16",
					"dark:not-data-checked:not-data-disabled:hover:bg-layer-panel",
					"data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_1px_1.5px_-1px_oklch(0_0_0/0.12)]",
					"dark:data-checked:shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.12),0_1px_1.5px_-1px_oklch(0_0_0/0.4)]",
					"data-checked:not-data-disabled:hover:bg-primary-hover",
					"data-disabled:bg-layer-panel data-disabled:shadow-[inset_0_0_0_1px_var(--line-muted)]",
					"dark:data-disabled:bg-layer-inset dark:data-disabled:shadow-[inset_0_0_0_1px_oklch(0_0_0/0.5)]",
					"data-checked:data-disabled:bg-layer-panel data-checked:data-disabled:shadow-[inset_0_0_0_1px_var(--line-muted)]",
					"dark:data-checked:data-disabled:bg-layer-inset dark:data-checked:data-disabled:shadow-[inset_0_0_0_1px_oklch(0_0_0/0.5)]",
					"not-data-disabled:active:scale-[0.96] motion-reduce:active:scale-100"
				],
				thumb: [
					"rounded-full bg-layer-popover",
					"dark:bg-[oklch(0.45_0.006_106.42)] dark:data-checked:bg-[oklch(0.205_0.004_106.42)]",
					"shadow-[0_1px_1.5px_-0.5px_oklch(0_0_0/0.18),0_0_0_1px_oklch(0_0_0/0.04)]",
					"data-disabled:bg-[oklch(0.88_0.004_106.42)] data-disabled:shadow-none",
					"dark:data-disabled:bg-[oklch(0.38_0.002_106.42)]",
					"dark:data-checked:data-disabled:bg-[oklch(0.28_0.002_106.42)]"
				]
			}
		},
		size: {
			sm: {
				root: "h-4 w-7 p-0.5",
				thumb: "size-3 data-[checked]:translate-x-3"
			},
			md: {
				root: "h-5 w-9 p-0.5",
				thumb: "size-4 data-[checked]:translate-x-4"
			}
		}
	},
	compoundVariants: [{
		theme: "brutal",
		size: "sm",
		class: {
			root: "p-px",
			thumb: "size-2.5"
		}
	}, {
		theme: "brutal",
		size: "md",
		class: {
			root: "p-px",
			thumb: "size-3.5"
		}
	}],
	defaultVariants: { size: "sm" }
});
function Switch({ size, className, children, ...props }) {
	const theme = useThemeFamily();
	const { root } = switchRecipe({
		theme,
		size
	});
	return /* @__PURE__ */ jsx(Switch$1.Root, {
		"data-slot": "switch",
		className: root({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(SwitchThumb, { size })
	});
}
function SwitchThumb({ size, className, ...props }) {
	const theme = useThemeFamily();
	const { thumb } = switchRecipe({
		theme,
		size
	});
	return /* @__PURE__ */ jsx(Switch$1.Thumb, {
		"data-slot": "switch-thumb",
		className: thumb({ className }),
		...props
	});
}
//#endregion
//#region src/components/segmented-control/segmented-control.tsx
const segmentedControl = tv$1({
	slots: {
		root: ["inline-flex max-w-full flex-wrap items-center gap-1"],
		item: [
			"inline-flex min-w-0 shrink-0 items-center gap-1.5",
			"text-xs leading-4",
			"outline-none disabled:pointer-events-none",
			"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"
		],
		label: ["truncate"],
		count: ["font-mono text-xs leading-4"]
	},
	variants: {
		theme: {
			brutal: {
				item: [
					"border-2 border-line-strong bg-layer-panel px-2 py-1.5 font-semibold text-foreground",
					"has-[svg]:pl-1.5 has-[[data-slot=segmented-control-count]]:pr-1.5",
					"[&_svg]:stroke-[2.5] [&_svg_*]:stroke-[2.5]",
					"hover:bg-primary-400/30 data-checked:bg-primary-400 data-checked:text-foreground",
					"data-disabled:cursor-not-allowed"
				],
				count: ["font-bold text-foreground-strong/65", "group-data-checked/segmented-control-item:text-foreground-strong/70"]
			},
			elegant: {
				root: ["gap-1.5"],
				item: [
					"rounded-sm bg-layer-panel px-2.5 py-2 font-medium text-foreground antialiased",
					"has-[svg]:pl-2 has-[[data-slot=segmented-control-count]]:pr-2",
					"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_1px_1.5px_-1px_oklch(0_0_0/0.035),0_0_0_1px_var(--line-muted)]",
					"dark:data-unchecked:bg-fill-muted dark:data-unchecked:shadow-raft-sm",
					"data-unchecked:hover:bg-[color-mix(in_oklch,var(--fill-muted)_55%,var(--layer-panel))]",
					"dark:data-unchecked:hover:bg-fill-strong",
					"data-checked:bg-primary-400 data-checked:text-primary-950 data-checked:hover:bg-primary-hover",
					"data-checked:shadow-[0_1px_1.5px_-1px_color-mix(in_srgb,var(--primary-glow)_8%,transparent),0_0_0_1px_var(--primary-edge)]",
					"dark:data-checked:shadow-raft-sm",
					"dark:data-checked:hover:bg-primary-500",
					"focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--primary-400)_85%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-layer-canvas-muted",
					"data-disabled:cursor-not-allowed"
				],
				count: ["text-foreground-placeholder", "group-data-checked/segmented-control-item:text-primary-950/60"]
			}
		},
		disabled: {
			true: { root: "opacity-50" },
			false: { root: "" }
		}
	},
	defaultVariants: { disabled: false }
});
function SegmentedControl({ disabled = false, className, ...props }) {
	const theme = useThemeFamily();
	const { root } = segmentedControl({
		disabled,
		theme
	});
	return /* @__PURE__ */ jsx(RadioGroup$1, {
		disabled,
		"data-slot": "segmented-control",
		className: root({ className }),
		...props
	});
}
function SegmentedControlItem({ className, ...props }) {
	const theme = useThemeFamily();
	const { item } = segmentedControl({ theme });
	return /* @__PURE__ */ jsx(Radio.Root, {
		render: /* @__PURE__ */ jsx("button", { type: "button" }),
		nativeButton: true,
		"data-slot": "segmented-control-item",
		className: item({ className: `group/segmented-control-item ${className ?? ""}`.trim() }),
		...props
	});
}
function SegmentedControlLabel({ className, ...props }) {
	const { label } = segmentedControl();
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "segmented-control-label",
		className: label({ className }),
		...props
	});
}
function SegmentedControlCount({ className, ...props }) {
	const theme = useThemeFamily();
	const { count } = segmentedControl({ theme });
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "segmented-control-count",
		className: count({ className }),
		...props
	});
}
//#endregion
//#region src/components/toggle-group/toggle-group.tsx
const toggleGroup = tv$1({
	slots: {
		root: [
			"inline-flex max-w-full items-center",
			"data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap",
			"data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"
		],
		item: [
			"inline-flex h-8 min-w-0 shrink-0 items-center justify-center gap-1.5 px-2.5",
			"text-xs leading-4 font-medium whitespace-nowrap",
			"bg-layer-panel text-foreground",
			"outline-2 outline-offset-2 outline-transparent transition-[background-color,color,box-shadow,transform] duration-100",
			"disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-40",
			"data-pressed:bg-primary-400 data-pressed:text-primary-950",
			"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"
		],
		label: ["truncate"]
	},
	variants: { theme: {
		brutal: {
			root: "gap-1",
			item: [
				"border-2 border-line-strong font-bold",
				"hover:bg-primary-400/30",
				"focus-visible:outline-line-strong",
				"active:translate-px  data-pressed:shadow-raft-sm"
			]
		},
		elegant: {
			root: "gap-1.5",
			item: [
				"rounded-sm antialiased",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_1px_1.5px_-1px_oklch(0_0_0/0.035),0_0_0_1px_var(--line-muted)]",
				"dark:not-data-pressed:bg-fill-muted dark:not-data-pressed:shadow-raft-sm",
				"not-data-pressed:hover:bg-[color-mix(in_oklch,var(--fill-muted)_55%,var(--layer-panel))]",
				"dark:not-data-pressed:hover:bg-fill-strong",
				"data-pressed:hover:bg-primary-hover",
				"data-pressed:shadow-[0_1px_1.5px_-1px_color-mix(in_srgb,var(--primary-glow)_8%,transparent),0_0_0_1px_var(--primary-edge)]",
				"dark:data-pressed:shadow-raft-sm dark:data-pressed:hover:bg-primary-500",
				"focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklch,var(--primary-400)_85%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-layer-canvas-muted",
				"active:scale-[0.985]"
			]
		}
	} }
});
function ToggleGroup({ className, ...props }) {
	const theme = useThemeFamily();
	const { root } = toggleGroup({ theme });
	return /* @__PURE__ */ jsx(ToggleGroup$1, {
		"data-slot": "toggle-group",
		className: root({ className }),
		...props
	});
}
function ToggleGroupItem({ className, nativeButton, render, ...props }) {
	const theme = useThemeFamily();
	const { item } = toggleGroup({ theme });
	return /* @__PURE__ */ jsx(Toggle, {
		render,
		nativeButton: nativeButton ?? defaultNativeButton(render),
		type: "button",
		"data-slot": "toggle-group-item",
		className: item({ className }),
		...props
	});
}
function ToggleGroupLabel({ className, ...props }) {
	const { label } = toggleGroup();
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "toggle-group-label",
		className: label({ className }),
		...props
	});
}
//#endregion
//#region src/components/textarea/textarea.tsx
const textarea = tv$1({
	slots: { root: ["block w-full min-h-24 resize-y px-3 py-2 outline-none"] },
	variants: { theme: {
		brutal: { root: [
			"border-2 border-line-strong bg-layer-panel font-heading",
			"shadow-raft-sm focus:shadow-raft-md",
			"data-invalid:border-brutal-red data-invalid:bg-brutal-red/5 data-invalid:shadow-none data-invalid:ring-2 data-invalid:ring-brutal-red/60",
			"disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
		] },
		elegant: { root: [
			"rounded-md border border-line-field bg-layer-panel shadow-none",
			"dark:bg-layer-card dark:not-data-invalid:border-transparent",
			"dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.3),inset_0_0_0_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.04)]",
			"dark:hover:not-data-invalid:border-ink-8",
			"text-sm text-foreground transition duration-200 ease-out dark:text-foreground-strong",
			"placeholder:text-foreground-placeholder/70",
			"hover:not-data-invalid:border-line-field-hover",
			"focus:bg-layer-panel dark:focus:bg-layer-card",
			"focus-visible:ring-1 focus-visible:ring-primary-400",
			"dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60",
			"data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75 data-invalid:focus-visible:ring-3 data-invalid:focus-visible:ring-danger/12",
			"disabled:cursor-not-allowed disabled:border-line-muted/60 disabled:bg-fill-muted/50 disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
			"disabled:hover:border-line-muted/60",
			"data-invalid:disabled:border-line-muted/60 data-invalid:disabled:ring-0"
		] }
	} }
});
const textareaGroup = tv$1({
	slots: { root: ["w-full"] },
	variants: { theme: {
		brutal: { root: "flex flex-col items-end gap-1" },
		elegant: { root: [
			"relative",
			"has-[>[data-slot=textarea-counter]]:[&>[data-slot=textarea]]:scroll-pb-6",
			"has-[>[data-slot=textarea-counter]]:[&>[data-slot=textarea]]:pr-16",
			"*:data-[slot=textarea-counter]:pointer-events-none *:data-[slot=textarea-counter]:absolute",
			"[&>[data-slot=textarea-counter]]:right-3 [&>[data-slot=textarea-counter]]:bottom-2.5 *:data-[slot=textarea-counter]:z-10"
		] }
	} }
});
const textareaCounter = tv$1({
	slots: { root: ["font-mono text-xs tabular-nums"] },
	variants: {
		theme: {
			brutal: { root: ["text-foreground-strong/50", "group-data-[invalid]/field:font-bold group-data-invalid/field:text-danger"] },
			elegant: { root: ["text-[11px] leading-none text-foreground-placeholder/80 transition duration-200 ease-out", "group-data-[invalid]/field:font-medium group-data-invalid/field:text-danger"] }
		},
		overLimit: {
			true: { root: "text-danger" },
			false: { root: "" }
		}
	},
	defaultVariants: { overLimit: false }
});
function TextareaGroup({ className, ...props }) {
	const theme = useThemeFamily();
	const { root } = textareaGroup({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "textarea-group",
		className: root({ className }),
		...props
	});
}
function Textarea({ className, "data-invalid": dataInvalid, ...props }) {
	const theme = useThemeFamily();
	const { root } = textarea({ theme });
	return /* @__PURE__ */ jsx("textarea", {
		"data-slot": "textarea",
		className: root({ className }),
		...props,
		"data-invalid": dataInvalid || void 0,
		"aria-invalid": dataInvalid ? "true" : void 0
	});
}
function TextareaCounter({ value, count, limit, getLength, className, ...props }) {
	const theme = useThemeFamily();
	const text = value ?? "";
	const length = count ?? getLength?.(text) ?? text.length;
	const { root } = textareaCounter({
		theme,
		overLimit: length > limit
	});
	return /* @__PURE__ */ jsxs("span", {
		"data-slot": "textarea-counter",
		className: root({ className }),
		...props,
		children: [
			length,
			"/",
			limit
		]
	});
}
//#endregion
//#region src/components/description-list/description-list.tsx
const descriptionList = tv$1({
	slots: {
		root: ["m-0"],
		item: [""],
		term: ["mb-1 flex items-center gap-2 text-xs", "*:data-[slot=button]:ml-[-5px]"],
		details: ["m-0 text-sm"]
	},
	variants: {
		direction: {
			vertical: {},
			horizontal: { root: [
				"grid grid-cols-[max-content_minmax(0,1fr)] items-baseline",
				"max-sm:grid-cols-1 max-sm:gap-y-0.5",
				"*:data-[slot=description-item]:contents",
				"[&>[data-slot=description-item]>[data-slot=description-term]]:mb-0",
				"[&>[data-slot=description-item]>[data-slot=description-term]]:max-w-40",
				"[&>[data-slot=description-item]>[data-slot=description-term]]:min-w-0",
				"[&>[data-slot=description-item]>[data-slot=description-term]]:wrap-break-word",
				"[&>[data-slot=description-item]>[data-slot=description-details]]:min-w-0",
				"[&>[data-slot=description-item]>[data-slot=description-details]]:wrap-break-word"
			] }
		},
		theme: {
			brutal: {
				term: "text-foreground-strong/50",
				details: "text-foreground"
			},
			elegant: {
				term: ["mb-1.5 gap-1.5", "font-sans text-[11px] font-medium leading-none text-foreground-placeholder"],
				details: "font-sans leading-5 text-foreground-muted"
			}
		}
	},
	compoundVariants: [{
		direction: "horizontal",
		theme: "brutal",
		class: { root: "gap-x-3 gap-y-1" }
	}, {
		direction: "horizontal",
		theme: "elegant",
		class: { root: "gap-x-6 gap-y-2" }
	}],
	defaultVariants: { direction: "vertical" }
});
function DescriptionList({ direction = "vertical", className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = descriptionList({
		direction,
		theme
	});
	return useRender({
		defaultTagName: "dl",
		render,
		props: mergeProps({ className: root({ className }) }, props),
		state: { slot: "description-list" }
	});
}
function DescriptionItem({ className, render, ...props }) {
	const { item } = descriptionList();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: item({ className }) }, props),
		state: { slot: "description-item" }
	});
}
function DescriptionTerm({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { term } = descriptionList({ theme });
	return useRender({
		defaultTagName: "dt",
		render,
		props: mergeProps({ className: term({ className }) }, props),
		state: { slot: "description-term" }
	});
}
function DescriptionDetails({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { details } = descriptionList({ theme });
	return useRender({
		defaultTagName: "dd",
		render,
		props: mergeProps({ className: details({ className }) }, props),
		state: { slot: "description-details" }
	});
}
//#endregion
//#region src/components/avatar/avatar.tsx
const avatar = tv$1({
	slots: {
		root: ["group/avatar relative flex shrink-0 items-center justify-center select-none"],
		image: ["size-full object-cover"],
		fallback: [
			"flex size-full items-center justify-center",
			"[&>svg]:size-4",
			"group-data-[size=xl]/avatar:[&>svg]:size-6",
			"group-data-[size=lg]/avatar:[&>svg]:size-6",
			"group-data-[size=md]/avatar:[&>svg]:size-4.5",
			"group-data-[size=sm]/avatar:[&>svg]:size-4",
			"group-data-[size=xs]/avatar:[&>svg]:size-3",
			"group-data-[size=2xs]/avatar:[&>svg]:size-2.5",
			"group-data-[size=3xs]/avatar:[&>svg]:size-2.5"
		],
		badge: [
			"absolute z-10 size-2 select-none",
			"group-data-[size=xl]/avatar:size-3.5",
			"group-data-[size=lg]/avatar:size-3",
			"group-data-[size=md]/avatar:size-2.5",
			"group-data-[size=sm]/avatar:size-2",
			"group-data-[size=xs]/avatar:size-1.5",
			"group-data-[size=2xs]/avatar:size-1.5",
			"group-data-[size=3xs]/avatar:size-1.5"
		],
		dot: [
			"inline-flex items-center justify-center rounded-full outline-2 outline-white",
			"[&>svg]:hidden",
			"group-data-[size=xl]/avatar:[&>svg]:size-2 group-data-[size=xl]/avatar:[&>svg]:block",
			"group-data-[size=lg]/avatar:[&>svg]:size-2 group-data-[size=lg]/avatar:[&>svg]:block",
			"group-data-[size=md]/avatar:[&>svg]:size-1.5 group-data-[size=md]/avatar:[&>svg]:block",
			"group-data-[size=xs]/avatar:outline group-data-[size=2xs]/avatar:outline group-data-[size=3xs]/avatar:outline"
		],
		group: ["group/avatar-group flex items-center"]
	},
	variants: {
		theme: {
			brutal: {
				root: "border-black text-black",
				fallback: "text-black",
				badge: [
					"right-0 bottom-0 translate-1/4 ",
					"group-data-[size=xl]/avatar:translate-[5px] ",
					"group-data-[size=lg]/avatar:translate-[calc(25%+2px)] ",
					"group-data-[size=md]/avatar:translate-[4.75px] ",
					"group-data-[size=sm]/avatar:translate-x-1 group-data-[size=sm]/avatar:translate-y-1",
					"group-data-[size=xs]/avatar:translate-[2.75px] ",
					"group-data-[size=2xs]/avatar:translate-[2.875px] ",
					"group-data-[size=3xs]/avatar:translate-[3.125px] "
				],
				dot: ["bg-success text-foreground"],
				group: [
					"-space-x-1.5",
					"*:data-[slot=avatar]:outline *:data-[slot=avatar]:outline-2 *:data-[slot=avatar]:outline-primary-50",
					"*:data-[slot=avatar-group-count]:outline *:data-[slot=avatar-group-count]:outline-2 *:data-[slot=avatar-group-count]:outline-primary-50"
				]
			},
			elegant: {
				root: ["bg-fill-muted"],
				image: ["rounded-full"],
				fallback: [
					"overflow-hidden bg-fill-muted text-foreground-placeholder/70 text-sm",
					"rounded-full",
					"group-data-[size=xs]/avatar:text-xs",
					"group-data-[size=2xs]/avatar:text-[10px]",
					"group-data-[size=3xs]/avatar:text-[10px]"
				],
				badge: [
					"outline-2 outline-layer-panel",
					"group-data-[size=xl]/avatar:right-[3.667px] group-data-[size=xl]/avatar:bottom-[3.667px]",
					"group-data-[size=lg]/avatar:right-0.5 group-data-[size=lg]/avatar:bottom-0.5",
					"group-data-[size=md]/avatar:right-px group-data-[size=md]/avatar:bottom-px",
					"group-data-[size=sm]/avatar:right-[1.333px] group-data-[size=sm]/avatar:bottom-[1.333px]",
					"group-data-[size=xs]/avatar:right-[0.333px] group-data-[size=xs]/avatar:bottom-[0.333px]",
					"group-data-[size=2xs]/avatar:right-0 group-data-[size=2xs]/avatar:bottom-0",
					"group-data-[size=3xs]/avatar:right-[-0.667px] group-data-[size=3xs]/avatar:bottom-[-0.667px]"
				],
				dot: ["bg-success text-success-foreground outline-layer-panel"],
				group: [
					"-space-x-2",
					"*:data-[slot=avatar]:border-layer-canvas-muted",
					"*:data-[slot=avatar]:outline *:data-[slot=avatar]:outline-2 *:data-[slot=avatar]:outline-layer-canvas-muted",
					"*:data-[slot=avatar-group-count]:border-layer-canvas-muted",
					"*:data-[slot=avatar-group-count]:outline *:data-[slot=avatar-group-count]:outline-2 *:data-[slot=avatar-group-count]:outline-layer-canvas-muted"
				]
			}
		},
		type: {
			agent: {},
			human: {}
		},
		size: {
			xl: { root: "size-16" },
			lg: { root: "size-12" },
			md: { root: "size-9" },
			sm: { root: "size-8" },
			xs: { root: "size-5" },
			"2xs": { root: "size-4.5" },
			"3xs": { root: "size-3.5" }
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			size: [
				"xl",
				"lg",
				"md",
				"sm"
			],
			class: { root: "border-2" }
		},
		{
			theme: "brutal",
			size: [
				"xs",
				"2xs",
				"3xs"
			],
			class: { root: "border" }
		},
		{
			theme: "elegant",
			size: [
				"xl",
				"lg",
				"md",
				"sm"
			],
			class: { root: "border-2 border-transparent bg-clip-padding" }
		},
		{
			theme: "elegant",
			size: [
				"xs",
				"2xs",
				"3xs"
			],
			class: { root: "border border-transparent bg-clip-padding" }
		},
		{
			theme: "brutal",
			type: "agent",
			class: { root: "bg-brutal-cyan" }
		},
		{
			theme: "brutal",
			type: "human",
			class: { root: "bg-brutal-lavender text-black" }
		},
		{
			theme: "elegant",
			size: "xl",
			class: { root: "rounded-full" }
		},
		{
			theme: "elegant",
			size: "lg",
			class: { root: "rounded-full" }
		},
		{
			theme: "elegant",
			size: ["md", "sm"],
			class: { root: "rounded-full" }
		},
		{
			theme: "elegant",
			size: "xs",
			class: { root: "rounded-full" }
		},
		{
			theme: "elegant",
			size: ["2xs", "3xs"],
			class: { root: "rounded-full" }
		},
		{
			theme: "elegant",
			type: "agent",
			class: { root: "text-foreground-muted" }
		},
		{
			theme: "elegant",
			type: "human",
			class: { root: "text-foreground-muted" }
		}
	]
});
function Avatar({ size, type, className, children, ...props }) {
	const theme = useThemeFamily();
	const { root } = avatar({
		theme,
		type,
		size
	});
	return /* @__PURE__ */ jsx(Avatar$1.Root, {
		"data-slot": "avatar",
		"data-size": size,
		className: root({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(AvatarFallback, {})
	});
}
function AvatarImage({ className, ...props }) {
	const theme = useThemeFamily();
	const { image } = avatar({ theme });
	return /* @__PURE__ */ jsx(Avatar$1.Image, {
		"data-slot": "avatar-image",
		className: image({ className }),
		...props
	});
}
function AvatarFallbackIcon() {
	return /* @__PURE__ */ jsx("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "18",
		height: "18",
		viewBox: "0 0 18 18",
		"aria-hidden": "true",
		focusable: "false",
		children: /* @__PURE__ */ jsxs("g", {
			fill: "none",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			strokeWidth: "1",
			stroke: "currentColor",
			children: [
				/* @__PURE__ */ jsx("circle", {
					cx: "9",
					cy: "7.75",
					r: "2"
				}),
				/* @__PURE__ */ jsx("path", { d: "M9,16.25c1.407,0,2.716-.407,3.827-1.101-.481-1.67-2.003-2.899-3.827-2.899s-3.347,1.229-3.827,2.899c1.112,.694,2.42,1.101,3.827,1.101Z" }),
				/* @__PURE__ */ jsx("circle", {
					cx: "1.889",
					cy: "10.414",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "2.971",
					cy: "4.972",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "2.972",
					cy: "13.027",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "1.89",
					cy: "7.586",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "4.973",
					cy: "2.972",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "7.586",
					cy: "1.889",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "15.029",
					cy: "13.028",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "16.111",
					cy: "7.586",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "13.028",
					cy: "2.971",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "16.11",
					cy: "10.414",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "15.028",
					cy: "4.973",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				}),
				/* @__PURE__ */ jsx("circle", {
					cx: "10.414",
					cy: "1.89",
					r: ".75",
					fill: "currentColor",
					"data-stroke": "none",
					stroke: "none"
				})
			]
		})
	});
}
function AvatarFallback({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { fallback } = avatar({ theme });
	return /* @__PURE__ */ jsx(Avatar$1.Fallback, {
		"data-slot": "avatar-fallback",
		className: fallback({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(AvatarFallbackIcon, {})
	});
}
function AvatarBadge({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { badge, dot } = avatar({ theme });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: badge({ className: render ? className : dot({ className }) }) }, props),
		state: { slot: "avatar-badge" }
	});
}
function AvatarGroup({ className, ...props }) {
	const theme = useThemeFamily();
	const { group } = avatar({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "avatar-group",
		className: group({ className }),
		...props
	});
}
function AvatarGroupCount({ size, className, ...props }) {
	const theme = useThemeFamily();
	const { root } = avatar({
		theme,
		size
	});
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "avatar-group-count",
		className: root({ class: [theme === "elegant" ? "bg-fill-muted font-medium text-xs leading-none tabular-nums text-foreground-muted" : "bg-secondary-400 font-bold text-xs leading-none tabular-nums text-foreground", className] }),
		...props
	});
}
//#endregion
//#region src/components/code-block/code-block.recipe.ts
const codeBlock = tv$1({
	slots: {
		root: ["group/code-block relative my-2 min-w-0 px-1 pb-1"],
		header: ["flex h-(--code-block-header-height) items-center gap-3"],
		title: ["min-w-0 flex-1 truncate font-mono"],
		actions: [
			"ml-auto flex items-center gap-2",
			"[[data-slot=code-block-body]>&]:absolute [[data-slot=code-block-body]>&]:top-2",
			"[[data-slot=code-block-body]>&]:right-2 [[data-slot=code-block-body]>&]:z-10"
		],
		corner: [
			"pointer-events-none absolute z-20 size-1",
			"data-[y=top]:top-0 data-[y=bottom]:bottom-0",
			"data-[x=left]:left-0 data-[x=right]:right-0"
		],
		body: ["relative min-w-0 overflow-x-auto p-4 font-mono text-sm"],
		action: [
			"inline-flex shrink-0 items-center justify-center",
			"transition-[color,background-color,opacity]",
			"focus-visible:outline-none focus-visible:ring-2"
		]
	},
	variants: { theme: {
		brutal: {
			root: [
				"[--code-block-header-height:--spacing(9)]",
				"px-0 pb-0",
				"border-2 border-line-strong bg-black shadow-raft-sm"
			],
			header: ["px-3", "text-sm font-bold tracking-wide text-foreground-inverse uppercase"],
			title: ["text-xs before:mr-1.5 before:text-foreground-inverse/45 before:content-['»']"],
			corner: [
				"border-foreground-inverse",
				"data-[y=top]:border-t-2 data-[y=bottom]:border-b-2",
				"data-[x=left]:border-l-2 data-[x=right]:border-r-2"
			],
			action: [
				"size-6",
				"bg-foreground-inverse/10 text-foreground-inverse/70",
				"hover:bg-foreground-inverse/20 hover:text-foreground-inverse",
				"focus-visible:ring-foreground-inverse/60"
			],
			body: [
				"bg-black text-[oklch(0.88_0.18_132)]",
				"outline-1 -outline-offset-1 outline-[oklch(0.32_0_0)]",
				"[&_pre_span]:text-(--shiki-dark,currentColor)"
			]
		},
		elegant: {
			root: [
				"[--code-block-header-height:--spacing(8)]",
				"overflow-clip rounded-none px-3 pb-0",
				"bg-layer-inset ring-[0.5px] ring-ink-20 dark:ring-ink-10"
			],
			header: [
				"px-2.5",
				"border-x border-b border-dashed border-ink-10 dark:border-ink-16",
				"bg-layer-panel text-sm/5 font-medium text-foreground-muted",
				"dark:bg-transparent"
			],
			corner: ["hidden"],
			title: ["text-xs"],
			body: [
				"py-3 pr-6 pl-2.5 leading-relaxed",
				"bg-layer-panel text-foreground",
				"dark:bg-[oklch(0.15_0.004_106.42)]",
				"border-x border-dashed border-ink-10 dark:border-ink-16",
				"[&_pre_span]:text-(--shiki-light,currentColor)",
				"dark:[&_pre_span]:text-(--shiki-dark,currentColor)"
			]
		}
	} }
});
//#endregion
//#region src/components/code-block/code-block.tsx
const CORNERS = [
	{
		x: "left",
		y: "top"
	},
	{
		x: "right",
		y: "top"
	},
	{
		x: "left",
		y: "bottom"
	},
	{
		x: "right",
		y: "bottom"
	}
];
/** Framed code surface. Compose a header and a body inside it. */
function CodeBlock({ className, render, ...props }) {
	const { root } = codeBlock({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: root({ className }) }, props),
		state: { slot: "code-block" }
	});
}
function CodeBlockHeader({ className, render, ...props }) {
	const { header } = codeBlock({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: header({ className }) }, props),
		state: { slot: "code-block-header" }
	});
}
function CodeBlockTitle({ className, render, ...props }) {
	const { title } = codeBlock({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: title({ className }) }, props),
		state: { slot: "code-block-title" }
	});
}
/** Trailing action region. Placed inside the body it floats over the code panel. */
function CodeBlockActions({ className, render, ...props }) {
	const { actions } = codeBlock({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: actions({ className }) }, props),
		state: { slot: "code-block-actions" }
	});
}
/** Styled action shell. The consumer owns the icon and the behavior. */
function CodeBlockAction({ className, render, ...props }) {
	const { action } = codeBlock({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: action({ className })
		}, props),
		state: { slot: "code-block-action" }
	});
}
/** Inner code panel. Render the complete pre and code as children. */
function CodeBlockBody({ children, className, render, ...props }) {
	const { body, corner } = codeBlock({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			className: body({ className }),
			children: /* @__PURE__ */ jsxs(Fragment$1, { children: [CORNERS.map(({ x, y }) => /* @__PURE__ */ jsx("span", {
				"data-slot": "code-block-corner",
				"data-x": x,
				"data-y": y,
				className: corner(),
				"aria-hidden": true
			}, `${y}-${x}`)), children] })
		}, props),
		state: { slot: "code-block-body" }
	});
}
//#endregion
//#region src/components/inline-code/inline-code.tsx
const inlineCode = tv$1({
	slots: { root: [] },
	variants: { theme: {
		brutal: { root: ["border border-line-strong bg-brutal-yellow/50 px-1.5", "font-mono text-sm font-medium text-foreground-strong wrap-anywhere"] },
		elegant: { root: [
			"inline-flex items-center rounded-md px-2.5 py-[1.5px]",
			"font-mono text-sm font-medium",
			"bg-[oklch(0.955_0_0)] text-[oklch(0.44_0_0)]",
			"dark:bg-fill-muted dark:text-foreground dark:shadow-raft-xs"
		] }
	} }
});
function InlineCode({ className, ...props }) {
	const theme = useThemeFamily();
	const { root } = inlineCode({ theme });
	return /* @__PURE__ */ jsx("code", {
		"data-slot": "inline-code",
		className: root({ className }),
		...props
	});
}
//#endregion
//#region src/components/markdown/markdown.recipe.ts
const markdown = tv$1({
	slots: {
		heading: ["leading-tight font-bold"],
		paragraph: ["mb-1 last:mb-0"],
		link: ["select-text underline decoration-2 underline-offset-2", "text-[oklch(0.81_0.19_88.08)]"],
		mark: ["bg-primary/70 text-inherit [font:inherit]"],
		list: ["mb-1 pl-5"],
		listItem: ["mb-0.5"],
		blockquote: [],
		rule: [],
		tableScroll: ["overflow-x-auto"],
		table: ["border-collapse"],
		tableRow: [],
		headerCell: [],
		cell: [],
		checkbox: ["mr-1.5 align-middle"],
		image: ["image-transparency-bg max-w-full"],
		inlineCode: []
	},
	variants: {
		level: {
			1: { heading: "mt-3 mb-1 text-[1.286em]" },
			2: { heading: "mt-2 mb-1 text-[1.143em]" },
			3: { heading: "mt-2 mb-1 text-[1.071em]" },
			4: { heading: "mt-1 mb-0.5 text-[1em]" },
			5: { heading: "mt-1 mb-0.5 text-[1em]" },
			6: { heading: "mt-1 mb-0.5 text-[1em]" }
		},
		ordered: {
			false: { list: "list-disc" },
			true: { list: "list-decimal" }
		},
		theme: {
			brutal: {
				link: ["hover:text-brutal-pink"],
				blockquote: ["my-1 border-l-2 border-black/40 pl-3 italic", "text-black/70"],
				rule: ["my-2 border-t-2 border-black"],
				tableScroll: ["my-2"],
				table: ["border-2 border-black text-sm"],
				headerCell: [
					"border-2 border-black px-3 py-1.5",
					"bg-brutal-cyan",
					"text-left font-bold whitespace-nowrap"
				],
				cell: ["border border-black px-3 py-1.5"],
				image: ["my-2 border-2 border-black"]
			},
			elegant: {
				heading: ["font-medium text-foreground"],
				paragraph: ["max-w-[72ch]"],
				list: ["max-w-[72ch]"],
				link: ["decoration-1 decoration-[oklch(0.81_0.19_88.08)]", "hover:text-primary-active hover:decoration-primary-active"],
				blockquote: [
					"my-1 max-w-[72ch] rounded-r-sm px-4 py-2",
					"border-l-2 border-line-muted bg-fill-muted/70",
					"text-foreground-muted not-italic"
				],
				rule: ["my-2 border-t border-line-muted"],
				tableScroll: ["my-2 w-fit max-w-full", "rounded-md border border-ink-6 bg-layer-panel"],
				table: ["border-0 text-sm"],
				tableRow: ["last:[&>td]:border-b-0"],
				headerCell: [
					"px-3 py-1.5",
					"border-0 border-b border-ink-6 not-last:border-r not-last:border-ink-6",
					"bg-fill-muted/50",
					"text-left font-medium whitespace-nowrap text-foreground"
				],
				cell: ["px-3 py-1.5", "border-0 border-b border-ink-6 not-last:border-r"],
				image: ["my-2 rounded-md border border-line-muted"],
				inlineCode: ["inline leading-[inherit] wrap-anywhere"]
			}
		}
	},
	compoundVariants: [{
		theme: "brutal",
		level: 6,
		class: { heading: "text-black/70" }
	}, {
		theme: "elegant",
		level: 1,
		class: { heading: "mt-2" }
	}],
	defaultVariants: { ordered: false }
});
//#endregion
//#region src/components/markdown/markdown-parts.tsx
const HEADING_TAGS = {
	1: "h1",
	2: "h2",
	3: "h3",
	4: "h4",
	5: "h5",
	6: "h6"
};
function MarkdownHeading({ className, level, ...props }) {
	const { heading } = markdown({
		level,
		theme: useThemeFamily()
	});
	const Tag = HEADING_TAGS[level];
	return /* @__PURE__ */ jsx(Tag, {
		"data-slot": "markdown-heading",
		className: heading({ className }),
		...props
	});
}
function MarkdownParagraph({ className, ...props }) {
	const { paragraph } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("p", {
		"data-slot": "markdown-paragraph",
		className: paragraph({ className }),
		...props
	});
}
function MarkdownLink({ className, ...props }) {
	const { link } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("a", {
		"data-slot": "markdown-link",
		className: link({ className }),
		...props
	});
}
function MarkdownMark({ className, ...props }) {
	const { mark } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("mark", {
		"data-slot": "markdown-mark",
		className: mark({ className }),
		...props
	});
}
function MarkdownList({ className, ...props }) {
	const { list } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("ul", {
		"data-slot": "markdown-list",
		className: list({ className }),
		...props
	});
}
function MarkdownOrderedList({ className, ...props }) {
	const { list } = markdown({
		ordered: true,
		theme: useThemeFamily()
	});
	return /* @__PURE__ */ jsx("ol", {
		"data-slot": "markdown-list",
		className: list({ className }),
		...props
	});
}
function MarkdownListItem({ className, ...props }) {
	const { listItem } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("li", {
		"data-slot": "markdown-list-item",
		className: listItem({ className }),
		...props
	});
}
function MarkdownBlockquote({ className, ...props }) {
	const { blockquote } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("blockquote", {
		"data-slot": "markdown-blockquote",
		className: blockquote({ className }),
		...props
	});
}
function MarkdownRule({ className, ...props }) {
	const { rule } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("hr", {
		"data-slot": "markdown-rule",
		className: rule({ className }),
		...props
	});
}
/** Horizontal scroll container for wide tables. */
function MarkdownTableScroll({ className, ...props }) {
	const { tableScroll } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "markdown-table-scroll",
		className: tableScroll({ className }),
		...props
	});
}
function MarkdownTable({ className, ...props }) {
	const { table } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("table", {
		"data-slot": "markdown-table",
		className: table({ className }),
		...props
	});
}
function MarkdownTableRow({ className, ...props }) {
	const { tableRow } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("tr", {
		"data-slot": "markdown-table-row",
		className: tableRow({ className }),
		...props
	});
}
function MarkdownHeaderCell({ className, ...props }) {
	const { headerCell } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("th", {
		"data-slot": "markdown-header-cell",
		className: headerCell({ className }),
		...props
	});
}
function MarkdownCell({ className, ...props }) {
	const { cell } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("td", {
		"data-slot": "markdown-cell",
		className: cell({ className }),
		...props
	});
}
function MarkdownImage({ className, ...props }) {
	const { image } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("img", {
		"data-slot": "markdown-image",
		className: image({ className }),
		...props
	});
}
function MarkdownInlineCode({ className, ...props }) {
	const { inlineCode } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(InlineCode, {
		className: inlineCode({ className }),
		...props
	});
}
/** Task-list checkbox. Markdown task items are display-only, so it defaults to read-only. */
function MarkdownCheckbox({ className, ...props }) {
	const { checkbox } = markdown({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Checkbox, {
		variant: "primary",
		readOnly: true,
		className: checkbox({ className }),
		...props
	});
}
//#endregion
//#region src/components/message-item/message-item.recipe.ts
const messageItem = tv$1({
	slots: {
		root: ["group/message relative flex h-fit min-h-[3rem] gap-3"],
		gutter: ["relative w-9 shrink-0 self-stretch"],
		avatarSlot: ["relative mt-0.5 w-9 shrink-0 self-start"],
		continuationTime: ["absolute right-0 top-1 select-none tabular-nums"],
		content: ["min-w-0 flex-1"],
		header: ["flex min-w-0 overflow-hidden pr-24"],
		sender: ["min-w-0 shrink-0 truncate", "data-[slot=message-item-sender-button]:cursor-pointer"],
		senderBadges: ["inline-flex shrink-0 items-center gap-1"],
		meta: ["min-w-0 truncate"],
		time: ["shrink-0 whitespace-nowrap"],
		inlineStatus: ["shrink-0"],
		body: ["wrap-break-word select-text", "**:select-text"],
		searchMatch: ["bg-primary/70 text-inherit [font:inherit]", "dark:bg-primary/30"],
		embedded: ["mt-1.5 min-w-0"],
		attachments: ["mt-1 space-y-2"],
		footer: ["mt-1.5 flex flex-wrap items-center gap-1.5"],
		toolbar: [
			"pointer-events-none absolute z-20 flex items-center overflow-hidden opacity-0",
			"group-hover/message:pointer-events-auto group-hover/message:opacity-100",
			"group-focus-within/message:pointer-events-auto group-focus-within/message:opacity-100",
			"group-has-data-popup-open/message:pointer-events-auto group-has-data-popup-open/message:opacity-100"
		],
		toolbarButton: ["inline-flex shrink-0 items-center justify-center", "[&_svg]:shrink-0"]
	},
	variants: {
		theme: {
			brutal: {
				root: [
					"mx-3 mb-1 mt-1.5 border-2 border-transparent px-1.5 py-1",
					"hover:border-line-strong hover:bg-layer-panel",
					"data-popup-open:border-line-strong data-popup-open:bg-layer-panel",
					"has-data-popup-open:border-line-strong has-data-popup-open:bg-layer-panel",
					"has-data-[slot=message-item-search-match]:border-line-strong",
					"has-data-[slot=message-item-search-match]:bg-brutal-cyan/25",
					"has-data-[slot=message-item-search-match]:shadow-raft-md",
					"has-data-[slot=message-item-search-match]:hover:bg-brutal-cyan/25"
				],
				continuationTime: "font-mono text-[10px] leading-none text-black/0 group-hover/message:text-black/40 group-has-data-popup-open/message:text-black/40",
				content: "text-sm",
				header: "items-center gap-2",
				sender: ["text-sm font-bold text-black", "data-[slot=message-item-sender-button]:hover:underline data-[slot=message-item-sender-button]:hover:decoration-2 data-[slot=message-item-sender-button]:hover:underline-offset-2"],
				meta: "font-mono text-xs text-black/40",
				time: "font-mono text-xs text-black/40",
				inlineStatus: "text-[10px] font-bold text-black/40",
				body: "text-sm text-black",
				toolbar: ["-top-3.5 right-2", "border-2 border-line-strong bg-white shadow-raft-sm"],
				toolbarButton: [
					"size-6",
					"text-black/50 hover:bg-primary/30 hover:text-black",
					"data-popup-open:bg-primary/30 data-popup-open:text-black",
					"data-active:text-brutal-orange data-active:hover:text-brutal-orange",
					"[&_svg]:size-[13px]"
				]
			},
			elegant: {
				root: [
					"border border-transparent max-md:gap-2 px-7 pt-3.5 pb-3 max-md:px-4 max-md:pt-2 max-md:pb-1.5",
					"has-[+[data-compact=true]]:pb-0.5 max-md:has-[+[data-compact=true]]:pb-0",
					"hover:bg-ink-2 data-popup-open:bg-ink-2 has-data-popup-open:bg-ink-2",
					"has-data-[slot=message-item-search-match]:border-transparent",
					"has-data-[slot=message-item-search-match]:bg-info/10",
					"has-data-[slot=message-item-search-match]:shadow-none",
					"has-data-[slot=message-item-search-match]:hover:bg-info/10",
					"has-data-[slot=message-item-search-match]:ring-[0.5px]",
					"has-data-[slot=message-item-search-match]:ring-inset",
					"has-data-[slot=message-item-search-match]:ring-info/50"
				],
				gutter: "max-md:w-8",
				avatarSlot: [
					"[&_[data-slot=avatar][data-size=md]]:ml-0.5 [&_[data-slot=avatar][data-size=md]]:size-8 [&_[data-slot=avatar][data-size=md]]:border-0",
					"[&_[data-slot=avatar][data-size=md]>[data-slot=avatar-badge]]:-right-px [&_[data-slot=avatar][data-size=md]>[data-slot=avatar-badge]]:-bottom-px",
					"max-md:w-8 max-md:[&_[data-slot=avatar][data-size=md]]:size-6"
				],
				continuationTime: [
					"top-0 pt-1.5",
					"font-sans text-xs leading-none",
					"text-transparent group-hover/message:text-foreground-muted/60 group-has-data-popup-open/message:text-foreground-muted/60"
				],
				content: "text-sm leading-5.25 tracking-[-0.01em]",
				header: "items-baseline gap-1.5",
				sender: ["text-sm font-medium leading-none text-foreground-muted", "data-[slot=message-item-sender-button]:hover:underline data-[slot=message-item-sender-button]:hover:decoration-2 data-[slot=message-item-sender-button]:hover:underline-offset-2"],
				meta: "font-sans text-xs leading-none text-foreground-muted/70",
				time: "font-sans text-xs leading-none tabular-nums text-foreground-muted/70",
				inlineStatus: "font-sans text-[11px] font-medium leading-none text-foreground-muted",
				body: [
					"mt-1.5 mb-1.5 max-md:mt-1 max-md:mb-1",
					"text-sm leading-5.25 tracking-[-0.01em] text-foreground-muted",
					"group-data-[compact=true]/message:mt-0 group-data-[compact=true]/message:mb-0"
				],
				toolbar: [
					"top-1 right-[26px]",
					"gap-0.5 rounded-lg px-1 py-0.5",
					"border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
					"dark:border-transparent"
				],
				toolbarButton: [
					"size-7 rounded-md border border-transparent bg-transparent p-0",
					"text-foreground-icon hover:bg-fill-muted hover:text-foreground-strong",
					"data-popup-open:bg-fill-muted data-popup-open:text-foreground-strong",
					"focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
					"data-active:text-primary-400 data-active:hover:text-primary-400",
					"[&_svg]:size-3.5"
				],
				footer: "mt-2.5 max-md:mt-1.5"
			}
		},
		compact: { true: {} }
	},
	compoundVariants: [{
		theme: "brutal",
		compact: true,
		class: { root: "mt-0 min-h-0 py-1" }
	}, {
		theme: "elegant",
		compact: true,
		class: { root: "mt-0 min-h-0 pt-1.5 pb-1.5 max-md:pt-1.5 max-md:pb-1.5" }
	}]
});
//#endregion
//#region src/components/message-item/message-item-root.tsx
function MessageItem({ className, compact, render, ...props }) {
	const { root } = messageItem({
		compact,
		theme: useThemeFamily()
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-message-item": "",
			"data-compact": compact ? "true" : void 0,
			className: root({ className })
		}, props),
		state: { slot: "message-item" }
	});
}
//#endregion
//#region src/components/message-item/message-item-gutter.tsx
function MessageItemGutter({ className, render, ...props }) {
	const { gutter } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: gutter({ className }) }, props),
		state: { slot: "message-item-gutter" }
	});
}
function MessageItemAvatarSlot({ className, render, ...props }) {
	const { avatarSlot } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: avatarSlot({ className }) }, props),
		state: { slot: "message-item-avatar-slot" }
	});
}
/** Left-gutter hover clock for continuation rows. Pass 24h `HH:MM` (no AM/PM). */
function MessageItemContinuationTime({ className, render, ...props }) {
	const { continuationTime } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: continuationTime({ className }) }, props),
		state: { slot: "message-item-continuation-time" }
	});
}
//#endregion
//#region src/components/message-item/message-item-content.tsx
function MessageItemContent({ className, render, ...props }) {
	const { content } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: content({ className }) }, props),
		state: { slot: "message-item-content" }
	});
}
function MessageItemBody({ className, render, ...props }) {
	const { body } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: body({ className }) }, props),
		state: { slot: "message-item-body" }
	});
}
function MessageItemSearchMatch({ className, render, ...props }) {
	const { searchMatch } = messageItem();
	return useRender({
		defaultTagName: "mark",
		render,
		props: mergeProps({ className: searchMatch({ className }) }, props),
		state: { slot: "message-item-search-match" }
	});
}
function MessageItemEmbedded({ className, render, ...props }) {
	const { embedded } = messageItem();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: embedded({ className }) }, props),
		state: { slot: "message-item-embedded" }
	});
}
function MessageItemAttachments({ className, render, ...props }) {
	const { attachments } = messageItem();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: attachments({ className }) }, props),
		state: { slot: "message-item-attachments" }
	});
}
function MessageItemFooter({ className, render, ...props }) {
	const { footer } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: footer({ className }) }, props),
		state: { slot: "message-item-footer" }
	});
}
//#endregion
//#region src/components/message-item/message-item-header.tsx
function MessageItemHeader({ className, render, ...props }) {
	const { header } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: header({ className }) }, props),
		state: { slot: "message-item-header" }
	});
}
function MessageItemSender({ className, render, ...props }) {
	const { sender } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: sender({ className }) }, props),
		state: { slot: "message-item-sender" }
	});
}
function MessageItemSenderButton({ className, render, ...props }) {
	const { sender } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: sender({ className })
		}, props),
		state: { slot: "message-item-sender-button" }
	});
}
function MessageItemSenderBadges({ className, render, ...props }) {
	const { senderBadges } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: senderBadges({ className }) }, props),
		state: { slot: "message-item-sender-badges" }
	});
}
function MessageItemMeta({ className, render, ...props }) {
	const { meta } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: meta({ className }) }, props),
		state: { slot: "message-item-meta" }
	});
}
function MessageItemTime({ className, render, ...props }) {
	const { time } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: time({ className }) }, props),
		state: { slot: "message-item-time" }
	});
}
function MessageItemInlineStatus({ className, render, ...props }) {
	const { inlineStatus } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: inlineStatus({ className }) }, props),
		state: { slot: "message-item-inline-status" }
	});
}
//#endregion
//#region src/components/message-item/message-item-toolbar.tsx
function MessageItemToolbar({ className, render, ...props }) {
	const { toolbar } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: toolbar({ className }) }, props),
		state: { slot: "message-item-toolbar" }
	});
}
function MessageItemToolbarButton({ active = false, className, render, ...props }) {
	const { toolbarButton } = messageItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			"data-active": active ? "true" : void 0,
			className: toolbarButton({ className })
		}, props),
		state: { slot: "message-item-toolbar-button" }
	});
}
//#endregion
//#region src/components/message-item/message-footer.recipe.ts
const messageFooter = tv$1({
	slots: {
		savedIndicator: [
			"inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap select-none",
			"[&_svg]:shrink-0",
			"data-[icon-only]:size-7 data-icon-only:justify-center data-[icon-only]:p-0"
		],
		readReceipt: ["ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap", "[&_svg]:shrink-0"],
		badge: ["inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap select-none", "transition-colors [&_svg]:shrink-0"],
		badgeSeparator: ["text-foreground-strong/45"]
	},
	variants: {
		badgeStatus: {
			read: {},
			unread: {}
		},
		theme: {
			brutal: {
				savedIndicator: [
					"h-5 border border-line-strong px-1.5 text-[10px] font-bold leading-none",
					"bg-brutal-orange/15 text-black transition-[filter] duration-100 hover:brightness-90",
					"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black",
					"[&_svg]:size-2.5 [&_svg]:text-brutal-orange",
					"data-icon-only:border-2 data-icon-only:border-black data-icon-only:shadow-raft-sm",
					"data-icon-only:transition-all data-icon-only:hover:-translate-y-px data-icon-only:hover:shadow-raft-md",
					"data-icon-only:active:translate-px data-icon-only:active:shadow-raft-xs data-[icon-only]:[&_svg]:size-3.5"
				],
				readReceipt: "h-5 text-[10px] font-bold leading-none text-black/45 [&_svg]:size-2.5",
				badge: [
					"h-5 border border-line-strong px-1.5 text-[10px] font-bold leading-none text-black",
					"hover:bg-brutal-cyan/40",
					"[&_svg]:size-3"
				]
			},
			elegant: {
				savedIndicator: [
					"h-5 gap-1.5 rounded-full bg-primary-soft px-1.5 py-0.5",
					"text-[11px] font-medium leading-3 tracking-[0.22px] text-primary-600 dark:text-primary-strong",
					"transition-[filter,opacity] duration-100 hover:brightness-95",
					"focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
					"[&_svg]:size-[11px]",
					"data-[icon-only]:rounded-md data-[icon-only]:[&_svg]:size-4"
				],
				readReceipt: "h-5 text-[11px] font-medium text-foreground-muted [&_svg]:size-2.5",
				badge: ["h-5 rounded-md px-1.5", "text-[12px] font-[420] tracking-[-0.01em] hover:bg-fill-strong/80 [&_svg]:size-[11px]"]
			}
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			badgeStatus: "read",
			class: { badge: "bg-white" }
		},
		{
			theme: "brutal",
			badgeStatus: "unread",
			class: { badge: "bg-brutal-cyan/20" }
		},
		{
			theme: "elegant",
			badgeStatus: "read",
			class: { badge: "text-foreground-muted" }
		},
		{
			theme: "elegant",
			badgeStatus: "unread",
			class: { badge: ["bg-info-soft/50 text-[12px] tracking-[-0.01em]"] }
		}
	]
});
//#endregion
//#region src/components/message-item/message-footer.tsx
function MessageItemBadge({ className, status = "read", ...props }) {
	const theme = useThemeFamily();
	const { badge } = messageFooter({
		badgeStatus: status,
		theme
	});
	return /* @__PURE__ */ jsx(Badge, {
		appearance: theme === "elegant" ? "outline" : "solid",
		"data-slot": "message-item-badge",
		uppercase: false,
		variant: theme === "elegant" && status === "unread" ? "information" : "default",
		className: badge({ className }),
		...props
	});
}
function MessageItemBadgeSeparator({ className, render, ...props }) {
	const { badgeSeparator } = messageFooter();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"aria-hidden": true,
			className: badgeSeparator({ className })
		}, props),
		state: { slot: "message-item-badge-separator" }
	});
}
function MessageItemSavedIndicator({ className, render, ...props }) {
	const { savedIndicator } = messageFooter({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: savedIndicator({ className }) }, props),
		state: { slot: "message-item-saved-indicator" }
	});
}
function MessageItemReadReceipt({ className, render, ...props }) {
	const { readReceipt } = messageFooter({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: readReceipt({ className }) }, props),
		state: { slot: "message-item-read-receipt" }
	});
}
//#endregion
//#region src/components/message-item/message-reaction.recipe.ts
const messageReaction = tv$1({
	slots: {
		chip: ["inline-flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap", "transition-colors"],
		errorIndicator: ["sr-only"],
		glyph: ["inline-flex items-center justify-center leading-none", "[&>svg]:size-[13px] [&>svg]:shrink-0"],
		count: ["font-mono tabular-nums"],
		addButton: [
			"inline-flex min-w-0 items-center justify-center",
			"transition-colors",
			"[&_svg]:shrink-0"
		],
		quickRow: ["flex shrink-0 items-center"],
		quickButton: ["flex items-center justify-center", "bg-transparent transition-colors"],
		pickerContent: ["inline-flex items-center"],
		pickerStatic: ["inline-flex items-center"],
		tooltip: ["inline-block max-w-[280px]"],
		tooltipNames: ["flex max-w-60 flex-wrap items-center gap-y-0.5"],
		tooltipName: ["inline-flex min-w-0 items-baseline leading-5"],
		tooltipNameText: ["max-w-28 truncate"],
		tooltipSeparator: ["shrink-0 text-foreground-strong/45"],
		tooltipMeta: ["leading-5 text-foreground-strong/50"]
	},
	variants: { theme: {
		brutal: {
			chip: [
				"h-5 gap-1 rounded-sm px-1.5 text-xs font-bold leading-none",
				"bg-black/3 text-black",
				"hover:bg-black/8",
				"data-pressed:bg-brutal-pink/20 data-pressed:hover:bg-brutal-pink/30",
				"has-data-[slot=message-reaction-error-indicator]:bg-brutal-orange/30 has-data-[slot=message-reaction-error-indicator]:hover:bg-brutal-orange/30"
			],
			addButton: ["h-5 rounded-sm px-1.5 [&_svg]:size-[13px]", "bg-black/3 text-black hover:bg-black/8 active:bg-black/8"],
			quickRow: ["h-9 gap-1 bg-white px-2", "[&>[role=menuitem]]:size-7 [&>[role=menuitem]]:p-0"],
			quickButton: "size-7 rounded-sm p-0 hover:bg-brutal-pink/20 active:bg-brutal-pink/20",
			pickerContent: [
				"gap-0.5 px-1.5 py-1",
				"[&>[role=menuitem]]:size-7 [&>[role=menuitem]]:p-0",
				"rounded-none border-2 border-black bg-white",
				"shadow-[0_4px_12px_oklch(0_0_0/0.08)]"
			],
			pickerStatic: [
				"gap-0.5 px-1.5 py-1",
				"rounded-none border-2 border-black bg-white",
				"shadow-[0_4px_12px_oklch(0_0_0/0.08)]"
			],
			tooltip: "border-2 border-line-strong bg-white px-2 py-1.5 text-xs font-bold text-black"
		},
		elegant: {
			chip: [
				"h-5 rounded-full gap-1.5 px-2 text-[11px] font-medium leading-3 tracking-[0.22px]",
				"bg-fill-strong text-foreground-muted",
				"hover:bg-ink-10",
				"dark:bg-fill-muted dark:hover:bg-fill-strong",
				"data-pressed:bg-accent-200/50 data-pressed:text-accent-700 data-pressed:hover:bg-accent-200/70",
				"dark:data-pressed:bg-accent-soft dark:data-pressed:text-accent-strong dark:data-pressed:hover:bg-accent-soft",
				"has-data-[slot=message-reaction-error-indicator]:bg-danger-soft has-data-[slot=message-reaction-error-indicator]:text-danger"
			],
			addButton: ["h-5 rounded-full px-1.5 bg-fill-muted text-foreground-icon [&_svg]:size-[13px]", "hover:bg-fill-strong active:bg-fill-strong"],
			quickRow: ["h-9 gap-1 bg-layer-popover px-2", "[&>[role=menuitem]]:size-7 [&>[role=menuitem]]:p-0"],
			quickButton: "size-7 rounded-sm p-0 hover:bg-ink-10 data-highlighted:bg-ink-10 active:bg-ink-16",
			pickerContent: ["min-w-0 flex-row gap-0.5 px-1.5 py-1", "[&>[role=menuitem]]:size-7 [&>[role=menuitem]]:p-0"],
			pickerStatic: ["min-w-0 flex-row rounded-md bg-layer-popover p-1", "shadow-raft-lg outline-none"],
			tooltip: "px-2 py-1.5 text-xs"
		}
	} }
});
//#endregion
//#region src/components/message-item/message-reaction.tsx
function MessageReactionChip({ className, ...props }) {
	const { chip } = messageReaction({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Toggle, {
		...props,
		type: "button",
		"data-slot": "message-reaction-chip",
		className: chip({ className })
	});
}
function MessageReactionErrorIndicator({ className, render, ...props }) {
	const { errorIndicator } = messageReaction();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			className: errorIndicator({ className }),
			role: "status"
		}, props),
		state: { slot: "message-reaction-error-indicator" }
	});
}
function MessageReactionGlyph({ className, render, ...props }) {
	const { glyph: glyphSlot } = messageReaction();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: glyphSlot({ className }) }, props),
		state: { slot: "message-reaction-glyph" }
	});
}
function MessageReactionCount({ className, render, ...props }) {
	const { count } = messageReaction();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: count({ className }) }, props),
		state: { slot: "message-reaction-count" }
	});
}
function MessageReactionAddButton({ className, render, ...props }) {
	const { addButton } = messageReaction({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: addButton({ className })
		}, props),
		state: { slot: "message-reaction-add-button" }
	});
}
function MessageReactionQuickRow({ className, render, ...props }) {
	const { quickRow } = messageReaction({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: quickRow({ className }) }, props),
		state: { slot: "message-reaction-quick-row" }
	});
}
function MessageReactionQuickButton({ className, render, ...props }) {
	const { quickButton } = messageReaction({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: quickButton({ className })
		}, props),
		state: { slot: "message-reaction-quick-button" }
	});
}
function MessageReactionPickerStatic({ className, render, ...props }) {
	const { pickerStatic } = messageReaction({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: pickerStatic({ className }) }, props),
		state: { slot: "message-reaction-picker-static" }
	});
}
function MessageReactionPickerContent({ className, ...props }) {
	const { pickerContent } = messageReaction({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(DropdownMenuContent, {
		"data-slot": "message-reaction-picker",
		className: pickerContent({ className }),
		...props
	});
}
function MessageReactionTooltipContent({ className, ...props }) {
	const { tooltip } = messageReaction({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(TooltipContent, {
		className: tooltip({ className }),
		...props
	});
}
function MessageReactionTooltipNames({ className, render, ...props }) {
	const { tooltipNames } = messageReaction();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: tooltipNames({ className }) }, props),
		state: { slot: "message-reaction-tooltip-names" }
	});
}
function MessageReactionTooltipName({ className, render, ...props }) {
	const { tooltipName } = messageReaction();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: tooltipName({ className }) }, props),
		state: { slot: "message-reaction-tooltip-name" }
	});
}
function MessageReactionTooltipNameText({ className, render, ...props }) {
	const { tooltipNameText } = messageReaction();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: tooltipNameText({ className }) }, props),
		state: { slot: "message-reaction-tooltip-name-text" }
	});
}
function MessageReactionTooltipSeparator({ className, render, ...props }) {
	const { tooltipSeparator } = messageReaction();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: tooltipSeparator({ className }) }, props),
		state: { slot: "message-reaction-tooltip-separator" }
	});
}
function MessageReactionTooltipMeta({ className, render, ...props }) {
	const { tooltipMeta } = messageReaction();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: tooltipMeta({ className }) }, props),
		state: { slot: "message-reaction-tooltip-meta" }
	});
}
//#endregion
//#region src/components/message-item/message-reference.recipe.ts
const messageReference = tv$1({
	slots: {
		root: [
			"max-w-full truncate   select-text no-underline",
			"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
			"[&_svg]:size-3 [&_svg]:shrink-0",
			"has-[>[data-slot=message-reference-indicator]]:relative has-[>[data-slot=message-reference-indicator]]:mr-2",
			"has-[>[data-slot=message-reference-indicator]]:inline-block",
			"has-[>[data-slot=message-reference-indicator]]:overflow-visible"
		],
		chipLabel: ["min-w-0 truncate"],
		badge: ["inline-flex items-center whitespace-nowrap"],
		indicator: ["pointer-events-none absolute -right-1.5 top-0 inline-flex size-2 shrink-0 items-center justify-center", "*:data-[slot=status]:size-full"]
	},
	variants: {
		theme: {
			brutal: {
				root: "focus-visible:outline-black",
				badge: "hidden"
			},
			elegant: { badge: [
				"pointer-events-none absolute -top-px right-[calc(100%-10px)] z-0",
				"h-[19px] items-center rounded-l-full rounded-r-none pr-2.5 pl-2",
				"font-normal leading-none tracking-normal",
				"bg-(--reference-badge,transparent) text-(--reference-badge-ink,currentColor)",
				"[clip-path:inset(0_0_0_100%_round_9999px_0_0_9999px)]",
				"transition-[clip-path] duration-200 ease-out motion-reduce:transition-none",
				"group-hover:[clip-path:inset(0_round_9999px_0_0_9999px)]",
				"group-focus-visible:[clip-path:inset(0_round_9999px_0_0_9999px)]"
			] }
		},
		variant: {
			primary: {},
			secondary: {},
			accent: {},
			muted: {},
			info: {},
			link: {},
			pending: {},
			unavailable: {}
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			variant: "primary",
			class: { root: [
				"inline-flex cursor-default items-center gap-1 align-bottom border border-black bg-primary px-1",
				"[font-size:inherit] font-medium leading-tight text-black",
				"has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
				"hover:bg-primary/80 hover:text-black"
			] }
		},
		{
			theme: "brutal",
			variant: "secondary",
			class: { root: ["inline cursor-default font-bold text-black underline decoration-black/30 decoration-2 underline-offset-2", "hover:text-brutal-pink hover:decoration-brutal-pink"] }
		},
		{
			theme: "brutal",
			variant: [
				"accent",
				"muted",
				"info",
				"link"
			],
			class: { root: [
				"inline-flex max-w-full cursor-default items-center gap-1 align-bottom border border-black px-1",
				"[font-size:inherit] font-medium leading-tight text-black",
				"has-[>svg]:relative has-[>svg]:isolate has-[>svg]:h-[19px] has-[>svg]:py-0 has-[>svg]:pr-1 has-[>svg]:pl-0",
				"has-[>svg]:before:pointer-events-none has-[>svg]:before:absolute has-[>svg]:before:inset-y-0 has-[>svg]:before:left-0 has-[>svg]:before:z-0",
				"has-[>svg]:before:w-[18px] has-[>svg]:before:border-r has-[>svg]:before:border-black has-[>svg]:before:bg-(--reference-icon) has-[>svg]:before:content-['']",
				"has-[>svg]:[&>svg]:relative has-[>svg]:[&>svg]:z-10 has-[>svg]:[&>svg]:mx-[3px] has-[>svg]:[&>svg]:text-black"
			] }
		},
		{
			theme: "brutal",
			variant: "accent",
			class: { root: "[--reference-icon:var(--color-brutal-pink)] bg-brutal-pink/30 hover:bg-brutal-pink/60" }
		},
		{
			theme: "brutal",
			variant: "muted",
			class: { root: "[--reference-icon:var(--color-brutal-stone)] bg-brutal-stone/25 hover:bg-brutal-stone/40" }
		},
		{
			theme: "brutal",
			variant: "info",
			class: { root: "[--reference-icon:var(--color-brutal-cyan)] bg-brutal-cyan/30 hover:bg-brutal-cyan/60" }
		},
		{
			theme: "brutal",
			variant: "link",
			class: { root: "[--reference-icon:var(--color-brutal-cyan)] bg-brutal-cyan/30 text-black hover:bg-brutal-cyan/60" }
		},
		{
			theme: "brutal",
			variant: "pending",
			class: { root: [
				"inline-flex cursor-wait items-center gap-1 align-bottom border border-black bg-brutal-stone/30 px-1 font-medium text-black opacity-80",
				"[font-size:inherit] leading-tight",
				"has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1"
			] }
		},
		{
			theme: "brutal",
			variant: "unavailable",
			class: { root: [
				"inline-block align-bottom border border-black bg-brutal-stone/30 px-1 font-medium text-black opacity-60",
				"[font-size:inherit] leading-tight",
				"has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1"
			] }
		},
		{
			theme: "elegant",
			variant: "primary",
			class: { root: [
				"inline-flex h-[19px] items-center gap-0.5 align-middle -mt-px rounded-full border border-transparent bg-primary-400 px-2 py-0",
				"[font-size:inherit] cursor-pointer font-normal leading-none tracking-normal text-[oklch(0.431_0.088_86.67)]",
				"transition-[filter,opacity] duration-100 hover:bg-primary-400 hover:text-[oklch(0.431_0.088_86.67)]"
			] }
		},
		{
			theme: "elegant",
			variant: "secondary",
			class: { root: "inline cursor-pointer font-medium underline underline-offset-2" }
		},
		{
			theme: "elegant",
			variant: [
				"accent",
				"muted",
				"info",
				"link"
			],
			class: { root: [
				"[--reference-badge-ink:var(--color-foreground-inverse)]",
				"group relative inline-flex h-[19px] max-w-full items-center gap-1 align-middle -mt-px rounded-full border border-transparent py-0 pr-2 pl-2",
				"[font-size:inherit] cursor-pointer font-normal leading-none tracking-normal text-foreground",
				"transition-[filter,opacity] duration-100",
				"has-[>[data-slot=message-reference-label]]:gap-1",
				"has-[>[data-slot=message-reference-label]]:pr-2",
				"has-[>[data-slot=message-reference-label]]:pl-0",
				"has-[>[data-slot=message-reference-label]]:isolate",
				"has-[>[data-slot=message-reference-label]]:overflow-visible",
				"has-[>[data-message-reference-badge]]:overflow-visible",
				"has-[>[data-slot=message-reference-label]]:before:pointer-events-none",
				"has-[>[data-slot=message-reference-label]]:before:absolute",
				"has-[>[data-slot=message-reference-label]]:before:-top-px",
				"has-[>[data-slot=message-reference-label]]:before:left-0",
				"has-[>[data-slot=message-reference-label]]:before:z-1",
				"has-[>[data-slot=message-reference-label]]:before:size-[19px]",
				"has-[>[data-slot=message-reference-label]]:before:rounded-full",
				"has-[>[data-slot=message-reference-label]]:before:bg-(--reference-badge,transparent)",
				"has-[>[data-slot=message-reference-label]]:before:content-['']",
				"has-[>[data-slot=message-reference-label]]:[&>svg]:relative",
				"has-[>[data-slot=message-reference-label]]:[&>svg]:z-10",
				"has-[>[data-slot=message-reference-label]]:[&>svg]:mx-[3.5px]",
				"has-[>[data-slot=message-reference-label]]:[&>svg]:overflow-visible",
				"has-[>[data-slot=message-reference-label]]:[&>svg]:shrink-0",
				"has-[>[data-slot=message-reference-label]]:[&>svg]:text-(--reference-badge-ink,currentColor)",
				"not-has-[>[data-slot=message-reference-label]]:pt-0",
				"not-has-[>[data-slot=message-reference-label]]:pb-[3px]"
			] }
		},
		{
			theme: "elegant",
			variant: ["accent", "info"],
			class: { root: [
				"[--reference-badge:var(--accent-strong)]",
				"bg-[oklch(0.965_0.019_358.59)] text-[oklch(0.543_0.215_359.77)]",
				"hover:bg-[oklch(0.965_0.019_358.59)] hover:text-[oklch(0.543_0.215_359.77)]",
				"dark:bg-accent-soft dark:text-accent-strong",
				"dark:hover:bg-accent-soft dark:hover:text-accent-strong"
			] }
		},
		{
			theme: "elegant",
			variant: "muted",
			class: { root: ["[--reference-badge:var(--color-foreground-muted)]", "border-line-muted bg-fill-muted text-foreground hover:bg-fill-strong"] }
		},
		{
			theme: "elegant",
			variant: "link",
			class: { root: [
				"[--reference-badge:var(--info-strong)]",
				"bg-[oklch(0.966_0.022_224.02)] text-info-strong",
				"hover:bg-[oklch(0.966_0.022_224.02)] hover:text-info-strong",
				"dark:bg-info-soft dark:hover:bg-info-soft"
			] }
		},
		{
			theme: "elegant",
			variant: "pending",
			class: { root: ["inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent bg-fill-muted px-2 py-0", "cursor-wait font-normal leading-none tracking-normal text-foreground-muted"] }
		},
		{
			theme: "elegant",
			variant: "unavailable",
			class: { root: ["inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent bg-fill-muted px-2 py-0", "cursor-default font-normal leading-none tracking-normal text-foreground-muted"] }
		}
	],
	defaultVariants: { variant: "muted" }
});
//#endregion
//#region src/components/message-item/message-reference.tsx
function useReferenceRender(className, render, props) {
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className }, props),
		state: { slot: "message-reference" }
	});
}
function MessageReferenceText({ className, render, variant = "secondary", ...props }) {
	const { root } = messageReference({
		theme: useThemeFamily(),
		variant
	});
	return useReferenceRender(root({ className }), render, props);
}
function MessageReferenceIndicator({ className, render, ...props }) {
	const { indicator } = messageReference({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: indicator({ className }) }, props),
		state: { slot: "message-reference-indicator" }
	});
}
function MessageReferenceChip({ className, render, variant = "muted", ...props }) {
	const { root } = messageReference({
		theme: useThemeFamily(),
		variant
	});
	return useReferenceRender(root({ className }), render, props);
}
function MessageReferenceLabel({ className, render, ...props }) {
	const { chipLabel } = messageReference({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: chipLabel({ className }) }, props),
		state: { slot: "message-reference-label" }
	});
}
function MessageReferenceBadge({ className, render, ...props }) {
	const { badge } = messageReference({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-message-reference-badge": "",
			className: badge({ className })
		}, props),
		state: { slot: "message-reference-badge" }
	});
}
function MessageReferencePending({ className, render, ...props }) {
	const { root } = messageReference({
		theme: useThemeFamily(),
		variant: "pending"
	});
	return useReferenceRender(root({ className }), render, props);
}
function MessageReferenceUnavailable({ className, render, ...props }) {
	const { root } = messageReference({
		theme: useThemeFamily(),
		variant: "unavailable"
	});
	return useReferenceRender(root({ className }), render, props);
}
//#endregion
//#region src/components/message-item/message-multi-select.recipe.ts
const messageMultiSelect = tv$1({
	slots: {
		root: ["flex min-h-0 min-w-0 flex-1 flex-col"],
		checkbox: [
			"mt-1.5 self-start rounded-full",
			"data-checked:shadow-none data-indeterminate:shadow-none",
			"hover:data-checked:shadow-none hover:data-indeterminate:shadow-none"
		],
		toolbar: ["flex items-center gap-1.5"]
	},
	variants: { theme: {
		brutal: { toolbar: "border-t-2 border-line-strong bg-primary px-2 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom,0px))]" },
		elegant: { toolbar: ["rounded-lg border-[0.5px] border-line-muted bg-layer-panel px-2.5 py-2.5 shadow-raft-xs", "dark:border-transparent"] }
	} }
});
//#endregion
//#region src/components/message-item/message-multi-select.tsx
function MessageMultiSelect({ className, render, ...props }) {
	const { root } = messageMultiSelect();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: root({ className }) }, props),
		state: { slot: "message-multi-select" }
	});
}
/** Shared select-mode toolbar shell. Consumers compose the count and actions as children. */
function MessageMultiSelectToolbar({ className, render, ...props }) {
	const { toolbar } = messageMultiSelect({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: toolbar({ className }) }, props),
		state: { slot: "message-multi-select-toolbar" }
	});
}
function MessageMultiSelectCheckbox({ className, ...props }) {
	const { checkbox } = messageMultiSelect();
	return /* @__PURE__ */ jsx(Checkbox, {
		"data-slot": "message-multi-select-checkbox",
		className: checkbox({ className }),
		shape: "circle",
		size: "lg",
		variant: "primary",
		...props
	});
}
//#endregion
//#region src/components/message-item/message-text-selection-toolbar.recipe.ts
const messageTextSelectionToolbar = tv$1({
	slots: {
		toolbar: ["flex min-w-0 items-center select-none overflow-hidden text-xs"],
		button: ["flex h-7 items-center gap-1.5 px-2 outline-none transition-colors"],
		separator: ["w-px"]
	},
	variants: { theme: {
		brutal: {
			toolbar: "border-2 border-black bg-white font-semibold shadow-raft-sm",
			button: "text-black hover:bg-primary/30 focus-visible:bg-primary/30",
			separator: "bg-black/20"
		},
		elegant: {
			toolbar: ["gap-1 rounded-lg border-[0.5px] border-line-muted bg-layer-panel p-1 font-medium shadow-raft-xs", "dark:border-transparent"],
			button: [
				"rounded-sm text-foreground-muted",
				"hover:bg-fill-muted hover:text-foreground",
				"focus-visible:bg-fill-muted focus-visible:text-foreground"
			],
			separator: "hidden"
		}
	} }
});
//#endregion
//#region src/components/message-item/message-text-selection-toolbar.tsx
function MessageTextSelectionToolbar({ className, ...props }) {
	const { toolbar } = messageTextSelectionToolbar({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Toolbar.Root, {
		"data-slot": "message-text-selection-toolbar",
		className: toolbar({ className }),
		...props
	});
}
function MessageTextSelectionToolbarButton({ className, ...props }) {
	const { button } = messageTextSelectionToolbar({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Toolbar.Button, {
		"data-slot": "message-text-selection-toolbar-button",
		type: "button",
		className: button({ className }),
		...props
	});
}
function MessageTextSelectionToolbarSeparator({ className, ...props }) {
	const { separator } = messageTextSelectionToolbar({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Toolbar.Separator, {
		"data-slot": "message-text-selection-toolbar-separator",
		className: separator({ className }),
		...props
	});
}
//#endregion
//#region src/components/system-message/system-message.recipe.ts
const messageSystem = tv$1({
	slots: {
		systemRoot: ["flex min-w-0 items-center justify-center", "mb-1 gap-2 px-2 py-1.5"],
		systemTime: ["shrink-0 whitespace-nowrap", "text-black/40"],
		systemContent: ["min-w-0 truncate", "text-black/50"],
		systemGroup: ["mb-1"],
		systemGroupHeader: ["flex justify-center", "py-1.5"],
		systemGroupDisclosure: [
			"group flex max-w-full items-center",
			"gap-1.5 px-2 py-1 text-black/50 hover:text-black/75",
			"[&[data-panel-open]_[data-slot=system-message-group-chevron]]:-rotate-90"
		],
		systemGroupSummary: ["truncate"],
		systemGroupChevron: ["size-3 shrink-0 rotate-90 text-black/35 transition-transform"]
	},
	variants: { theme: {
		brutal: {
			systemTime: ["font-mono text-xs"],
			systemContent: ["text-xs"],
			systemGroupDisclosure: ["text-xs"]
		},
		elegant: {
			systemTime: ["font-sans text-[11px] font-medium tabular-nums", "dark:text-foreground-strong/40"],
			systemContent: ["font-sans text-[12px]", "dark:text-foreground-strong/50"],
			systemGroupDisclosure: [
				"rounded-md font-sans text-[12px]",
				"transition-colors",
				"dark:text-foreground-strong/50 dark:hover:text-foreground-strong/75"
			],
			systemGroupChevron: ["dark:text-foreground-strong/35"]
		}
	} }
});
//#endregion
//#region src/components/system-message/system-message.tsx
function SystemMessage({ className, render, ...props }) {
	const { systemRoot } = messageSystem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: systemRoot({ className }) }, props),
		state: { slot: "system-message-item" }
	});
}
function SystemMessageTime({ className, render, ...props }) {
	const { systemTime } = messageSystem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: systemTime({ className }) }, props),
		state: { slot: "system-message-item-time" }
	});
}
function SystemMessageContent({ children, className, render, title, ...props }) {
	const { systemContent } = messageSystem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			className: systemContent({ className }),
			children,
			title: title ?? (typeof children === "string" ? children : void 0)
		}, props),
		state: { slot: "system-message-item-content" }
	});
}
function SystemMessageGroup({ className, render, ...props }) {
	const { systemGroup } = messageSystem({ theme: useThemeFamily() });
	const defaultProps = {
		"data-slot": "system-message-group",
		className: systemGroup({ className })
	};
	return /* @__PURE__ */ jsx(Collapsible.Root, {
		render,
		...mergeProps(defaultProps, props)
	});
}
function SystemMessageGroupHeader({ className, render, ...props }) {
	const { systemGroupHeader } = messageSystem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "system-message-group-header",
			className: systemGroupHeader({ className })
		}, props)
	});
}
function SystemMessageGroupDisclosure({ className, render, ...props }) {
	const { systemGroupDisclosure } = messageSystem({ theme: useThemeFamily() });
	const defaultProps = {
		type: "button",
		"data-slot": "system-message-group-disclosure",
		className: systemGroupDisclosure({ className })
	};
	return useRender({
		render: render ?? /* @__PURE__ */ jsx(Collapsible.Trigger, {}),
		props: mergeProps(defaultProps, props)
	});
}
function SystemMessageGroupSummary({ className, render, ...props }) {
	const { systemGroupSummary } = messageSystem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "system-message-group-summary",
			className: systemGroupSummary({ className })
		}, props)
	});
}
function SystemMessageGroupChevron({ className, render, ...props }) {
	const { systemGroupChevron } = messageSystem({ theme: useThemeFamily() });
	const defaultProps = {
		"data-slot": "system-message-group-chevron",
		"aria-hidden": true,
		className: systemGroupChevron({ className })
	};
	return useRender({
		render: render ?? /* @__PURE__ */ jsx(ChevronRight, {}),
		props: mergeProps(defaultProps, props)
	});
}
function SystemMessageGroupPanel({ className, render, ...props }) {
	const defaultProps = {
		"data-slot": "system-message-group-panel",
		className: cn(className)
	};
	return /* @__PURE__ */ jsx(Collapsible.Panel, {
		render,
		...mergeProps(defaultProps, props)
	});
}
//#endregion
//#region src/components/message-embed/message-embed.recipe.ts
const messageBlock = tv$1({
	slots: { root: "" },
	variants: { theme: {
		brutal: { root: "" },
		elegant: { root: [
			"bg-layer-card shadow-raft-xs",
			"transition-[background-color,box-shadow] duration-150",
			"hover:bg-[color-mix(in_oklch,var(--ink)_2%,var(--layer-card))] hover:shadow-raft-sm"
		] }
	} }
});
const messageEmbed = tv$1({
	extend: messageBlock,
	slots: {
		root: ["group block min-w-0 text-left"],
		header: ["min-w-0"],
		content: ["min-w-0"],
		footer: ["min-w-0"]
	},
	variants: { theme: {
		brutal: {
			root: "border border-black/20 bg-white",
			header: "border-b border-black/10 bg-white px-2.5 py-1.5",
			content: "bg-white",
			footer: "border-t border-black/10 bg-white px-3 py-1.5"
		},
		elegant: {
			root: [
				"rounded-lg border-[0.5px] border-line-muted p-[2px]",
				"dark:border-transparent",
				"focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-[oklch(0.507_0.185_257.731)]"
			],
			header: "px-3 py-1.5 sm:px-3.5",
			content: [
				"overflow-clip rounded-[5.5px] border-[0.5px] border-line-muted bg-layer-panel",
				"transition-colors duration-150 group-hover:bg-[color-mix(in_oklch,var(--ink)_2%,var(--layer-panel))]",
				"dark:border-transparent dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.04),0_0_0_1px_oklch(0_0_0/0.35)]"
			],
			footer: "px-3 py-1.5 sm:px-3.5"
		}
	} }
});
//#endregion
//#region src/components/message-embed/message-embed.tsx
function MessageEmbed({ className, render, ...props }) {
	const { root } = messageEmbed({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: root({ className }) }, props),
		state: { slot: "message-embed" }
	});
}
function MessageEmbedHeader({ className, render, ...props }) {
	const { header } = messageEmbed({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: header({ className }) }, props),
		state: { slot: "message-embed-header" }
	});
}
function MessageEmbedContent({ className, render, ...props }) {
	const { content } = messageEmbed({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: content({ className }) }, props),
		state: { slot: "message-embed-content" }
	});
}
function MessageEmbedFooter({ className, render, ...props }) {
	const { footer } = messageEmbed({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: footer({ className }) }, props),
		state: { slot: "message-embed-footer" }
	});
}
//#endregion
//#region src/components/message-quoted-preview/message-quoted-preview.recipe.ts
const messageQuotedPreview = tv$1({
	slots: {
		root: ["w-full"],
		content: ["min-w-0"],
		header: ["flex min-w-0 items-center"],
		channel: ["inline-flex items-center"],
		thread: ["inline-flex items-center"],
		author: ["inline-flex min-w-0 items-center"],
		authorName: ["truncate"],
		authorMeta: ["truncate"],
		timestamp: ["ml-auto shrink-0"],
		text: ["line-clamp-2"],
		attachments: ["mt-2 flex flex-wrap gap-1.5"],
		attachment: ["inline-flex items-center"],
		loading: ["w-full animate-pulse"],
		unavailable: ["block w-full text-left"]
	},
	variants: { theme: {
		brutal: {
			root: "border-black/15 hover:border-black/20 hover:bg-[color-mix(in_oklch,black_2%,white)]",
			content: "px-2.5 py-2.5 sm:px-3 sm:py-3",
			header: "gap-2 border-black/15 px-2.5 py-2 sm:px-3 sm:py-2.5",
			channel: "gap-1 text-[11px] leading-4 font-bold text-black/70",
			author: "gap-1.5",
			authorName: "font-bold text-black/70",
			authorMeta: "font-mono text-[10px] text-black/40",
			timestamp: "font-mono text-[11px] leading-4 text-black/40",
			text: "text-xs leading-snug text-black sm:text-[13px]",
			attachment: "gap-1 border-[1.5px] border-black bg-brutal-lavender px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-black",
			thread: "gap-1 text-[11px] leading-4 font-bold text-brutal-pink",
			loading: "border border-black/15 bg-white",
			unavailable: "border border-black/15 bg-white px-2.5 py-2.5 text-[13px] leading-snug italic text-black/40 hover:border-black/20 hover:bg-[color-mix(in_oklch,black_2%,white)] hover:shadow-raft-sm sm:px-3 sm:py-3"
		},
		elegant: {
			content: "px-3 py-3 sm:px-3.5 sm:py-3.5",
			header: "gap-2",
			channel: "gap-1 text-[11px] leading-4 font-medium text-foreground-placeholder",
			author: "gap-1.5",
			authorName: "font-medium text-foreground",
			authorMeta: "font-mono text-[11px] leading-4 text-foreground-muted",
			timestamp: "text-[11px] leading-4 text-foreground-placeholder tabular-nums",
			text: "text-[13px] leading-5 text-foreground-muted",
			attachment: "gap-1 rounded-sm border border-line-muted bg-layer-panel px-2 py-1 text-[11px] leading-4 font-medium text-foreground-muted dark:bg-fill-muted",
			thread: "gap-1 text-[11px] leading-4 font-medium text-foreground-placeholder",
			unavailable: [
				"rounded-lg border-[0.5px] border-line-muted bg-layer-card px-3 py-3 shadow-raft-xs sm:px-3.5 sm:py-3.5",
				"dark:border-transparent",
				"text-[13px] leading-5 text-foreground-muted transition-[background-color,box-shadow] duration-150",
				"hover:bg-[color-mix(in_oklch,var(--ink)_2%,var(--layer-card))] hover:shadow-raft-sm",
				"focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-[oklch(0.507_0.185_257.731)]"
			]
		}
	} }
});
//#endregion
//#region src/components/message-quoted-preview/message-quoted-preview.tsx
function MessageQuotedPreview({ className, render, ...props }) {
	const { root } = messageQuotedPreview({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbed, {
		className: root({ className }),
		render,
		...props
	});
}
function MessageQuotedPreviewContent({ className, render, ...props }) {
	const { content } = messageQuotedPreview({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbedContent, {
		className: content({ className }),
		render,
		...props
	});
}
function MessageQuotedPreviewHeader({ className, render, ...props }) {
	const { header } = messageQuotedPreview({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbedHeader, {
		className: header({ className }),
		render,
		...props
	});
}
function MessageQuotedPreviewChannel({ className, render, ...props }) {
	const { channel } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: channel({ className }) }, props),
		state: { slot: "message-quoted-preview-channel" }
	});
}
function MessageQuotedPreviewThread({ className, render, ...props }) {
	const { thread } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: thread({ className }) }, props),
		state: { slot: "message-quoted-preview-thread" }
	});
}
function MessageQuotedPreviewAuthor({ className, render, ...props }) {
	const { author } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: author({ className }) }, props),
		state: { slot: "message-quoted-preview-author" }
	});
}
function MessageQuotedPreviewAuthorName({ className, render, ...props }) {
	const { authorName } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: authorName({ className }) }, props),
		state: { slot: "message-quoted-preview-author-name" }
	});
}
function MessageQuotedPreviewAuthorMeta({ className, render, ...props }) {
	const { authorMeta } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: authorMeta({ className }) }, props),
		state: { slot: "message-quoted-preview-author-meta" }
	});
}
function MessageQuotedPreviewTimestamp({ className, render, ...props }) {
	const { timestamp } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: timestamp({ className }) }, props),
		state: { slot: "message-quoted-preview-timestamp" }
	});
}
function MessageQuotedPreviewText({ className, render, ...props }) {
	const { text } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: text({ className }) }, props),
		state: { slot: "message-quoted-preview-text" }
	});
}
function MessageQuotedPreviewAttachments({ className, render, ...props }) {
	const { attachments } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: attachments({ className }) }, props),
		state: { slot: "message-quoted-preview-attachments" }
	});
}
function MessageQuotedPreviewAttachment({ className, render, ...props }) {
	const { attachment } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: attachment({ className }) }, props),
		state: { slot: "message-quoted-preview-attachment" }
	});
}
function MessageQuotedPreviewLoading({ className, render, ...props }) {
	const { loading } = messageQuotedPreview({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbed, {
		className: loading({ className }),
		render,
		...props
	});
}
function MessageQuotedPreviewUnavailable({ className, render, ...props }) {
	const { unavailable } = messageQuotedPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: unavailable({ className }) }, props),
		state: { slot: "message-quoted-preview-unavailable" }
	});
}
//#endregion
//#region src/components/message-replies/message-replies.recipe.ts
const messageReplies = tv$1({
	extend: messageBlock,
	slots: {
		root: ["group/message-replies mt-1.5 flex min-w-0 w-full flex-col gap-1 px-2.5 py-2 text-left", "transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-line-strong"],
		summary: ["flex shrink-0 flex-wrap items-center gap-1 text-xs font-medium transition-colors", "[&_strong]:font-semibold"],
		summaryItem: ["inline-flex items-center gap-0.5 align-middle", "[&_svg]:size-2.5"],
		reply: ["flex min-w-0 items-center gap-1.5 text-xs leading-tight"],
		sender: ["min-w-0 shrink truncate font-semibold"],
		content: ["min-w-0 flex-1 truncate"],
		time: ["ml-auto shrink-0"]
	},
	variants: { theme: {
		brutal: {
			root: "border-0 bg-black/3 hover:bg-black/8",
			summary: "text-[12.5px] font-bold text-black/55 group-hover/message-replies:text-black [&_strong]:font-bold",
			reply: "text-[12.5px]",
			sender: "text-black/70",
			content: "text-black/60",
			time: "font-sans text-[11.5px] tabular-nums text-black/40"
		},
		elegant: {
			root: ["rounded-md"],
			summary: "mb-1.5 text-foreground-muted",
			sender: "text-foreground-muted",
			content: "text-foreground-muted/80",
			time: "font-mono text-[10px] text-foreground-placeholder"
		}
	} }
});
//#endregion
//#region src/components/message-replies/message-replies.tsx
function MessageReplies({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = messageReplies({ theme });
	const { root: embedRoot } = messageEmbed({ theme });
	const defaultProps = { className: embedRoot({ className: root({ className }) }) };
	return useRender({
		defaultTagName: "button",
		render: render ?? /* @__PURE__ */ jsx("button", { type: "button" }),
		props: mergeProps(defaultProps, props),
		state: { slot: "message-embed" }
	});
}
function MessageRepliesSummary({ className, render, ...props }) {
	const { summary } = messageReplies({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: summary({ className }) }, props),
		state: { slot: "message-replies-summary" }
	});
}
function MessageRepliesSummaryItem({ className, render, ...props }) {
	const { summaryItem } = messageReplies({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: summaryItem({ className }) }, props),
		state: { slot: "message-replies-summary-item" }
	});
}
function MessageRepliesItem({ className, render, ...props }) {
	const { reply } = messageReplies({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: reply({ className }) }, props),
		state: { slot: "message-replies-item" }
	});
}
function MessageRepliesItemSender({ className, render, ...props }) {
	const { sender } = messageReplies({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: sender({ className }) }, props),
		state: { slot: "message-replies-item-sender" }
	});
}
function MessageRepliesItemContent({ className, render, ...props }) {
	const { content } = messageReplies({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: content({ className }) }, props),
		state: { slot: "message-replies-item-content" }
	});
}
function MessageRepliesItemTime({ className, render, ...props }) {
	const { time } = messageReplies({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "time",
		render,
		props: mergeProps({ className: time({ className }) }, props),
		state: { slot: "message-replies-item-time" }
	});
}
//#endregion
//#region src/components/message-action-card/message-action-card.recipe.ts
const messageActionCard = tv$1({
	slots: {
		root: ["mt-1 w-full"],
		header: ["flex flex-wrap items-center gap-2 leading-snug"],
		headerStatus: ["ml-auto"]
	},
	variants: { theme: {
		brutal: { header: "border-b-0 text-sm font-bold" },
		elegant: { header: "py-2 text-[13px] font-[550]" }
	} }
});
//#endregion
//#region src/components/message-action-card/message-action-card-content.recipe.ts
const messageActionCardContent = tv$1({
	slots: {
		root: ["p-3"],
		properties: ["m-0 grid grid-cols-[max-content_minmax(0,1fr)] items-baseline", "max-sm:grid-cols-1 max-sm:gap-y-0.5"],
		property: ["contents"],
		propertyLabel: ["max-w-40 min-w-0 wrap-break-word"],
		propertyValue: ["m-0 min-w-0 wrap-break-word"],
		scopeList: ["mt-3 space-y-1.5"],
		scopeListLabel: [],
		scope: ["min-w-0 border p-1.5"],
		scopeName: ["break-all font-mono text-[11px] font-bold"],
		scopeDescription: ["text-xs leading-snug"],
		hint: [],
		completion: [],
		actions: ["flex flex-wrap items-center"]
	},
	variants: { theme: {
		brutal: {
			root: "pt-0",
			properties: "mt-1 gap-x-3 gap-y-1",
			propertyLabel: "text-xs text-black/55",
			propertyValue: "text-xs text-black/75",
			scopeListLabel: "text-xs leading-4 font-normal text-black/55",
			scope: "border-black/15 bg-white",
			scopeName: "text-black/55",
			scopeDescription: "text-black/60",
			hint: "mt-1 border-l-2 border-black/20 pl-2 text-xs italic text-black/55",
			completion: "mt-1 text-xs text-black/55",
			actions: "mt-2.5 gap-3"
		},
		elegant: {
			root: "px-3.5 pt-2.5 pb-3.5 sm:px-4",
			properties: "mt-2 gap-x-6 gap-y-2",
			propertyLabel: "text-[13px] leading-5 text-foreground-muted/80",
			propertyValue: "text-[13px] leading-5 text-foreground-strong",
			scopeList: "space-y-2",
			scopeListLabel: "text-[13px] leading-5 font-medium text-foreground-strong",
			scope: "rounded-md border-line-muted bg-layer-panel/70 px-2.5 py-2 shadow-raft-xs dark:border-transparent dark:bg-fill-muted",
			scopeName: "font-sans text-xs leading-4 font-medium text-foreground-muted",
			scopeDescription: "mt-0.5 text-[13px] leading-5 text-pretty text-foreground-muted/80",
			hint: "mt-2.5 border-l border-line-muted pl-2.5 text-xs leading-4 italic text-foreground-muted/80",
			completion: "mt-2.5 text-[13px] leading-5 text-foreground-muted",
			actions: "mt-3 gap-2"
		}
	} }
});
//#endregion
//#region src/components/message-action-card/message-action-card.tsx
function MessageActionCard({ className, render, ...props }) {
	const { root } = messageActionCard({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbed, {
		className: root({ className }),
		render,
		...props
	});
}
function MessageActionCardContent({ className, render, ...props }) {
	const { root } = messageActionCardContent({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbedContent, {
		className: root({ className }),
		render,
		...props
	});
}
function MessageActionCardHeader({ className, render, ...props }) {
	const { header } = messageActionCard({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbedHeader, {
		className: header({ className }),
		render,
		...props
	});
}
function MessageActionCardHeaderStatus({ className, render, ...props }) {
	const { headerStatus } = messageActionCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: headerStatus({ className }) }, props),
		state: { slot: "message-action-card-header-status" }
	});
}
function MessageActionCardProperties({ className, render, ...props }) {
	const { properties } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "dl",
		render,
		props: mergeProps({ className: properties({ className }) }, props),
		state: { slot: "message-action-card-properties" }
	});
}
function MessageActionCardProperty({ className, render, ...props }) {
	const { property } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: property({ className }) }, props),
		state: { slot: "message-action-card-property" }
	});
}
function MessageActionCardPropertyLabel({ className, render, ...props }) {
	const { propertyLabel } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "dt",
		render,
		props: mergeProps({ className: propertyLabel({ className }) }, props),
		state: { slot: "message-action-card-property-label" }
	});
}
function MessageActionCardPropertyValue({ className, render, ...props }) {
	const { propertyValue } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "dd",
		render,
		props: mergeProps({ className: propertyValue({ className }) }, props),
		state: { slot: "message-action-card-property-value" }
	});
}
function MessageActionCardScopeList({ className, render, ...props }) {
	const { scopeList } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: scopeList({ className }) }, props),
		state: { slot: "message-action-card-scope-list" }
	});
}
function MessageActionCardScopeListLabel({ className, render, ...props }) {
	const { scopeListLabel } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: scopeListLabel({ className }) }, props),
		state: { slot: "message-action-card-scope-list-label" }
	});
}
function MessageActionCardScope({ className, render, ...props }) {
	const { scope } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: scope({ className }) }, props),
		state: { slot: "message-action-card-scope" }
	});
}
function MessageActionCardScopeName({ className, render, ...props }) {
	const { scopeName } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: scopeName({ className }) }, props),
		state: { slot: "message-action-card-scope-name" }
	});
}
function MessageActionCardScopeDescription({ className, render, ...props }) {
	const { scopeDescription } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: scopeDescription({ className }) }, props),
		state: { slot: "message-action-card-scope-description" }
	});
}
function MessageActionCardHint({ className, render, ...props }) {
	const { hint } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: hint({ className }) }, props),
		state: { slot: "message-action-card-hint" }
	});
}
function MessageActionCardCompletion({ className, render, ...props }) {
	const { completion } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: completion({ className }) }, props),
		state: { slot: "message-action-card-completion" }
	});
}
function MessageActionCardActions({ className, render, ...props }) {
	const { actions } = messageActionCardContent({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: actions({ className }) }, props),
		state: { slot: "message-action-card-actions" }
	});
}
//#endregion
//#region src/components/message-attachment/message-attachment.recipe.ts
const messageAttachment = tv$1({
	slots: {
		group: "flex max-w-[360px] flex-wrap items-start gap-2",
		card: ["group/attachment relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col overflow-hidden", "text-left"],
		title: "block w-full max-w-full shrink-0 truncate",
		meta: "mt-auto flex w-full min-w-0 max-w-full items-center justify-between",
		metaStart: "min-w-0 flex-1 truncate",
		metaEnd: ["ml-auto inline-flex shrink-0 items-center gap-1", "[&_svg]:size-[10px] [&_svg]:shrink-0"],
		summary: [
			"mt-0.5 inline-flex shrink-0 items-center whitespace-nowrap",
			"text-[10px]",
			"[&_svg]:size-3 [&_svg]:shrink-0"
		],
		commentSummary: "gap-[2.5px]",
		diffSummary: "gap-1.5",
		diffAddition: [],
		diffDeletion: [],
		action: [
			"relative flex size-3 items-center justify-center",
			"before:absolute before:-inset-1 before:content-['']",
			"[&_svg]:size-3 [&_svg]:shrink-0"
		]
	},
	variants: { theme: {
		brutal: {
			card: ["border border-black/15 bg-white px-2.5 py-1.5 text-black transition-colors", "hover:border-black/30 hover:bg-ink-2"],
			title: "text-xs font-medium text-black",
			meta: "gap-1.5 text-[10px] text-black/45",
			summary: "font-medium text-black/45",
			diffAddition: "text-success",
			diffDeletion: "text-danger",
			action: "text-black/60 group-hover/attachment:text-black"
		},
		elegant: {
			card: [
				"h-18 rounded-[5px] border-[0.5px] border-line-muted/70 bg-layer-panel px-2.5 py-1.5 text-foreground-strong shadow-raft-xs",
				"transition-[background-color,border-color] duration-150",
				"hover:border-line-muted hover:bg-ink-2 active:bg-ink-8",
				"dark:border-transparent dark:hover:border-transparent",
				"dark:hover:bg-[color-mix(in_oklch,var(--ink)_5%,var(--layer-panel))]",
				"dark:active:bg-[color-mix(in_oklch,var(--ink)_8%,var(--layer-panel))]"
			],
			title: "text-xs font-medium text-foreground",
			meta: "gap-1.5 text-[10px] text-foreground-placeholder",
			summary: "font-medium text-foreground-placeholder",
			diffAddition: "text-success",
			diffDeletion: "text-danger",
			action: "text-foreground-icon transition-colors group-hover/attachment:text-foreground-strong"
		}
	} }
});
//#endregion
//#region src/components/message-attachment/message-attachment.tsx
function MessageAttachmentGroup({ className, render, ...props }) {
	const { group } = messageAttachment();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: group({ className }) }, props),
		state: { slot: "message-attachment-group" }
	});
}
function MessageAttachmentCard({ className, render, ...props }) {
	const { card } = messageAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: card({ className }) }, props),
		state: { slot: "message-attachment-card" }
	});
}
function MessageAttachmentTitle({ className, render, ...props }) {
	const { title } = messageAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: title({ className }) }, props),
		state: { slot: "message-attachment-title" }
	});
}
function MessageAttachmentMeta({ className, render, ...props }) {
	const { meta } = messageAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: meta({ className }) }, props),
		state: { slot: "message-attachment-meta" }
	});
}
function MessageAttachmentMetaStart({ className, render, ...props }) {
	const { metaStart } = messageAttachment();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: metaStart({ className }) }, props),
		state: { slot: "message-attachment-meta-start" }
	});
}
function MessageAttachmentMetaEnd({ className, render, ...props }) {
	const { metaEnd } = messageAttachment();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: metaEnd({ className }) }, props),
		state: { slot: "message-attachment-meta-end" }
	});
}
function MessageAttachmentSummary({ className, render, ...props }) {
	const { summary } = messageAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: summary({ className }) }, props),
		state: { slot: "message-attachment-summary" }
	});
}
function MessageAttachmentCommentSummary({ className, render, ...props }) {
	const { commentSummary } = messageAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: commentSummary({ className }) }, props),
		state: { slot: "message-attachment-comment-summary" }
	});
}
function MessageAttachmentDiffSummary({ className, render, ...props }) {
	const { diffSummary } = messageAttachment();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: diffSummary({ className }) }, props),
		state: { slot: "message-attachment-diff-summary" }
	});
}
function MessageAttachmentDiffAddition({ className, render, ...props }) {
	const { diffAddition } = messageAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: diffAddition({ className }) }, props),
		state: { slot: "message-attachment-diff-addition" }
	});
}
function MessageAttachmentDiffDeletion({ className, render, ...props }) {
	const { diffDeletion } = messageAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: diffDeletion({ className }) }, props),
		state: { slot: "message-attachment-diff-deletion" }
	});
}
function MessageAttachmentAction({ className, render, ...props }) {
	const { action } = messageAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: action({ className })
		}, props),
		state: { slot: "message-attachment-action" }
	});
}
//#endregion
//#region src/components/message-attachment/message-image-gallery.recipe.ts
const messageImageGallery = tv$1({
	slots: {
		root: "max-w-[min(352px,calc(100vw-112px))] md:max-w-[448px]",
		item: "group/img relative overflow-hidden text-left",
		media: "block size-full ",
		overlay: "absolute inset-0 flex items-center justify-center",
		preview: "absolute inset-0",
		action: [
			"absolute right-1 bottom-1 z-10 hidden size-6 items-center justify-center",
			"focus:flex",
			"group-hover/img:flex",
			"[&_svg]:size-3"
		]
	},
	variants: { theme: {
		brutal: {
			root: "space-y-2",
			item: ["border-2 border-black bg-brutal-cream/60 hover:brightness-95", "has-data-[slot=message-image-gallery-overlay]:opacity-70 has-data-[slot=message-image-gallery-overlay]:hover:brightness-100"],
			preview: "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black",
			action: "border border-black bg-white/80 text-black/50 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
		},
		elegant: {
			root: "space-y-2",
			item: [
				"rounded-md bg-fill-muted shadow-raft-xs",
				"transition-shadow duration-150 hover:shadow-raft-sm",
				"has-data-[slot=message-image-gallery-overlay]:opacity-70"
			],
			preview: "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-line-strong",
			action: [
				"rounded-full border-0 bg-white/75 text-foreground-muted shadow-none backdrop-blur-md",
				"dark:text-[oklch(0.36_0.006_106.42)] dark:hover:text-[oklch(0.21_0.006_106.42)]",
				"transition-[background-color,color,opacity,box-shadow,transform] duration-150",
				"hover:bg-white/85 hover:text-foreground active:scale-[0.97]",
				"outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground"
			]
		}
	} }
});
//#endregion
//#region src/components/message-attachment/message-image-gallery.tsx
function MessageImageGallery({ className, render, ...props }) {
	const { root } = messageImageGallery({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: root({ className }) }, props),
		state: { slot: "message-image-gallery" }
	});
}
function MessageImageGalleryItem({ className, render, ...props }) {
	const { item } = messageImageGallery({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: item({ className }) }, props),
		state: { slot: "message-image-gallery-item" }
	});
}
function MessageImageGalleryMedia({ className, render, ...props }) {
	const { media } = messageImageGallery();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: media({ className }) }, props),
		state: { slot: "message-image-gallery-media" }
	});
}
function MessageImageGalleryOverlay({ className, render, ...props }) {
	const { overlay } = messageImageGallery();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: overlay({ className }) }, props),
		state: { slot: "message-image-gallery-overlay" }
	});
}
function MessageImageGalleryPreview({ className, render, ...props }) {
	const { preview } = messageImageGallery({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: preview({ className })
		}, props),
		state: { slot: "message-image-gallery-preview" }
	});
}
function MessageImageGalleryAction({ className, render, ...props }) {
	const { action } = messageImageGallery({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: action({ className })
		}, props),
		state: { slot: "message-image-gallery-action" }
	});
}
//#endregion
//#region src/components/message-attachment/message-video-preview.recipe.ts
const messageVideoPreview = tv$1({
	slots: {
		root: ["group/video relative aspect-video w-full max-w-[min(448px,calc(100vw-112px))] overflow-hidden", "bg-black text-left"],
		media: "block size-full  bg-black object-contain",
		fallback: "flex size-full  items-center justify-center bg-black text-white",
		failureContent: "flex max-w-[256px] flex-col items-center px-4 text-center text-xs",
		failureIcon: "[&_svg]:size-6",
		failureTitle: [],
		failureAction: [
			"inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-white/75 [font:inherit]",
			"hover:text-white",
			"outline outline-1 outline-offset-2 outline-transparent focus-visible:outline-white",
			"[&_svg]:size-[13px]"
		],
		action: [
			"absolute right-1.5 top-1.5 flex size-6 items-center justify-center",
			"border border-black bg-white/80 text-black/60 hover:bg-white hover:text-black",
			"transition-colors duration-150",
			"outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground",
			"disabled:cursor-default [&_svg]:size-3 [&_svg]:shrink-0"
		]
	},
	variants: { theme: {
		brutal: {
			root: "border-2 border-black",
			action: "rounded-none",
			failureContent: "gap-2 font-bold",
			failureIcon: "[&_svg]:stroke-2"
		},
		elegant: {
			root: "rounded-lg border border-line-muted shadow-raft-xs dark:border-transparent",
			action: [
				"rounded-full border-0 bg-white/75 text-foreground-muted shadow-none backdrop-blur-md",
				"dark:text-[oklch(0.36_0.006_106.42)] dark:hover:text-[oklch(0.21_0.006_106.42)]",
				"transition-[background-color,color,opacity,box-shadow,transform] duration-150",
				"hover:bg-white/85 hover:text-foreground active:scale-[0.97]",
				"outline outline-[1px] outline-offset-2 outline-transparent focus-visible:outline-foreground"
			],
			failureContent: "gap-3",
			failureIcon: "[&_svg]:stroke-[1.5]",
			failureTitle: "font-medium"
		}
	} }
});
//#endregion
//#region src/components/message-attachment/message-video-preview.tsx
function MessageVideoPreview({ className, render, ...props }) {
	const { root } = messageVideoPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: root({ className }) }, props),
		state: { slot: "message-video-preview" }
	});
}
function MessageVideoPreviewMedia({ className, render, ...props }) {
	const { media } = messageVideoPreview();
	return useRender({
		defaultTagName: "video",
		render,
		props: mergeProps({ className: media({ className }) }, props),
		state: { slot: "message-video-preview-media" }
	});
}
function MessageVideoPreviewFallback({ className, render, ...props }) {
	const { fallback } = messageVideoPreview();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: fallback({ className }) }, props),
		state: { slot: "message-video-preview-fallback" }
	});
}
function MessageVideoPreviewFailureContent({ className, render, ...props }) {
	const { failureContent } = messageVideoPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: failureContent({ className }) }, props),
		state: { slot: "message-video-preview-failure-content" }
	});
}
function MessageVideoPreviewFailureIcon({ className, render, ...props }) {
	const { failureIcon } = messageVideoPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: failureIcon({ className }) }, props),
		state: { slot: "message-video-preview-failure-icon" }
	});
}
function MessageVideoPreviewFailureTitle({ className, render, ...props }) {
	const { failureTitle } = messageVideoPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: failureTitle({ className }) }, props),
		state: { slot: "message-video-preview-failure-title" }
	});
}
function MessageVideoPreviewFailureAction({ className, render, ...props }) {
	const { failureAction } = messageVideoPreview();
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: failureAction({ className })
		}, props),
		state: { slot: "message-video-preview-failure-action" }
	});
}
function MessageVideoPreviewAction({ className, render, ...props }) {
	const { action } = messageVideoPreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: action({ className })
		}, props),
		state: { slot: "message-video-preview-action" }
	});
}
//#endregion
//#region src/components/message-forwarded-bundle/message-forwarded-bundle.recipe.ts
const messageForwardedBundle = tv$1({
	slots: {
		root: ["mt-1 max-w-[min(34rem,100%)]"],
		header: ["flex flex-wrap items-center justify-between"],
		headerContent: ["flex min-w-0 items-center"],
		headerLabel: ["inline-flex shrink-0 items-center"],
		headerCount: ["shrink-0"],
		source: ["min-w-0 truncate"],
		sourceLabel: ["min-w-0 truncate"],
		items: ["relative"],
		footerAction: []
	},
	variants: {
		theme: {
			brutal: {
				header: "gap-2",
				headerContent: "gap-2",
				headerLabel: "gap-1 text-[11px] font-black uppercase leading-none text-black/70",
				headerCount: "text-[11px] font-bold text-black/55",
				source: "inline-flex items-center gap-1 text-[11px] font-bold underline-offset-2 transition-colors text-black/50 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
				sourceLabel: "inline-flex items-center gap-1 text-[11px] font-bold text-black/45",
				items: "divide-y divide-black/10",
				footerAction: "inline-flex items-center gap-1 text-[11px] font-black underline underline-offset-2 text-black/60 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
			},
			elegant: {
				header: "gap-2",
				headerContent: "gap-2",
				headerLabel: "gap-1 text-[11px] font-medium leading-none text-foreground-muted",
				headerCount: "text-[11px] font-medium text-foreground-placeholder",
				source: "inline-flex items-center gap-1 text-[11px] font-medium transition-colors text-foreground-placeholder hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
				sourceLabel: "inline-flex items-center gap-1 text-[11px] font-medium text-foreground-placeholder",
				items: "divide-y-[0.5px] divide-line-muted/75",
				footerAction: "inline-flex items-center gap-1 text-[11px] font-medium text-foreground-placeholder hover:text-foreground-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
			}
		},
		collapsed: { true: { items: ["max-h-36 overflow-hidden sm:max-h-45", "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-10 after:bg-linear-to-t"] } }
	},
	compoundVariants: [{
		theme: "brutal",
		collapsed: true,
		class: { items: "after:from-white after:via-white/80 after:to-white/0" }
	}, {
		theme: "elegant",
		collapsed: true,
		class: { items: "after:from-layer-panel after:via-layer-panel/80 after:to-layer-panel/0" }
	}]
});
const messageForwardedBundleItem = tv$1({
	slots: {
		root: [],
		meta: ["flex min-w-0 flex-wrap items-center"],
		author: [],
		attachments: ["flex flex-wrap"],
		attachment: ["inline-flex max-w-full items-center"],
		attachmentName: ["min-w-0 truncate"],
		attachmentMeta: ["shrink-0"]
	},
	variants: { theme: {
		brutal: {
			root: "bg-white px-3 py-2 text-sm text-black",
			meta: "mb-1 gap-1.5 text-[11px] font-mono text-black/55",
			author: "font-bold text-black/75",
			attachments: "mt-1.5 gap-1.5",
			attachment: "gap-1 border border-black/20 bg-white px-1.5 py-1 text-[11px] font-bold text-black/80",
			attachmentMeta: "text-black/50"
		},
		elegant: {
			root: "px-3 py-3.5 text-[13px] leading-5 text-foreground-muted",
			meta: "mb-1 gap-1.5 text-[11px] font-sans tabular-nums text-foreground-placeholder",
			author: "font-normal text-foreground-placeholder",
			attachments: "mt-1.5 gap-1.5",
			attachment: "gap-1 rounded-sm border border-line-muted bg-layer-panel px-2 py-1 text-[11px] leading-4 font-medium text-foreground-muted dark:bg-fill-muted",
			attachmentMeta: "text-foreground-placeholder"
		}
	} }
});
//#endregion
//#region src/components/message-forwarded-bundle/message-forwarded-bundle.tsx
function MessageForwardedBundle({ className, render, ...props }) {
	const { root } = messageForwardedBundle({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbed, {
		className: root({ className }),
		render,
		...props
	});
}
function MessageForwardedBundleHeader({ className, render, ...props }) {
	const { header } = messageForwardedBundle({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MessageEmbedHeader, {
		className: header({ className }),
		render,
		...props
	});
}
function MessageForwardedBundleHeaderContent({ className, render, ...props }) {
	const { headerContent } = messageForwardedBundle({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: headerContent({ className }) }, props),
		state: { slot: "message-forwarded-bundle-header-content" }
	});
}
function MessageForwardedBundleHeaderLabel({ className, render, ...props }) {
	const { headerLabel } = messageForwardedBundle({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: headerLabel({ className }) }, props),
		state: { slot: "message-forwarded-bundle-header-label" }
	});
}
function MessageForwardedBundleHeaderCount({ className, render, ...props }) {
	const { headerCount } = messageForwardedBundle({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: headerCount({ className }) }, props),
		state: { slot: "message-forwarded-bundle-header-count" }
	});
}
function MessageForwardedBundleItems({ className, collapsed = false, render, ...props }) {
	const { items } = messageForwardedBundle({
		theme: useThemeFamily(),
		collapsed
	});
	return /* @__PURE__ */ jsx(MessageEmbedContent, {
		className: items({ className }),
		"data-collapsed": collapsed || void 0,
		render,
		...props
	});
}
function MessageForwardedBundleItem({ className, render, ...props }) {
	const { root } = messageForwardedBundleItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "article",
		render,
		props: mergeProps({ className: root({ className }) }, props),
		state: { slot: "message-forwarded-bundle-item" }
	});
}
function MessageForwardedBundleItemMeta({ className, render, ...props }) {
	const { meta } = messageForwardedBundleItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: meta({ className }) }, props),
		state: { slot: "message-forwarded-bundle-item-meta" }
	});
}
function MessageForwardedBundleItemAuthor({ className, render, ...props }) {
	const { author } = messageForwardedBundleItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: author({ className }) }, props),
		state: { slot: "message-forwarded-bundle-item-author" }
	});
}
function MessageForwardedBundleAttachments({ className, render, ...props }) {
	const { attachments } = messageForwardedBundleItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: attachments({ className }) }, props),
		state: { slot: "message-forwarded-bundle-attachments" }
	});
}
function MessageForwardedBundleAttachment({ className, render, ...props }) {
	const { attachment } = messageForwardedBundleItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: attachment({ className }) }, props),
		state: { slot: "message-forwarded-bundle-attachment" }
	});
}
function MessageForwardedBundleAttachmentName({ className, render, ...props }) {
	const { attachmentName } = messageForwardedBundleItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: attachmentName({ className }) }, props),
		state: { slot: "message-forwarded-bundle-attachment-name" }
	});
}
function MessageForwardedBundleAttachmentMeta({ className, render, ...props }) {
	const { attachmentMeta } = messageForwardedBundleItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: attachmentMeta({ className }) }, props),
		state: { slot: "message-forwarded-bundle-attachment-meta" }
	});
}
function MessageForwardedBundleFooter({ className, render, ...props }) {
	return /* @__PURE__ */ jsx(MessageEmbedFooter, {
		className,
		render,
		...props
	});
}
function MessageForwardedBundleSource({ className, render, ...props }) {
	const { source } = messageForwardedBundle({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: source({ className })
		}, props),
		state: { slot: "message-forwarded-bundle-source" }
	});
}
function MessageForwardedBundleSourceLabel({ className, render, ...props }) {
	const { sourceLabel } = messageForwardedBundle({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: sourceLabel({ className }) }, props),
		state: { slot: "message-forwarded-bundle-source-label" }
	});
}
function MessageForwardedBundleFooterAction({ className, render, ...props }) {
	const { footerAction } = messageForwardedBundle({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			className: footerAction({ className })
		}, props),
		state: { slot: "message-forwarded-bundle-footer-action" }
	});
}
//#endregion
//#region src/components/progress/progress.tsx
const PROGRESS_STYLE = `
@keyframes raft-progress-indeterminate {
  0% {
    transform: translateX(-65%) scaleX(0.35);
  }
  50% {
    transform: translateX(70%) scaleX(0.6);
  }
  100% {
    transform: translateX(185%) scaleX(0.35);
  }
}

@keyframes raft-progress-sweep {
  0% {
    transform: translateX(-110%);
  }
  100% {
    transform: translateX(360%);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-slot="progress-indicator"][data-indeterminate] {
    animation-duration: 2400ms;
  }
}
`;
const progress = tv$1({
	slots: {
		root: [
			"group/progress grid w-full min-w-0 gap-1.5",
			"[--progress-color:var(--foreground)]",
			"[--progress-light:var(--fill-muted)]",
			"[--progress-indicator:var(--progress-color)]",
			"[--progress-track:var(--fill-muted)]"
		],
		header: ["flex min-w-0 items-center justify-between gap-3"],
		label: ["min-w-0 truncate"],
		value: ["shrink-0 tabular-nums"],
		track: ["relative w-full overflow-hidden bg-(--progress-track)"],
		indicator: [
			"block h-full bg-(--progress-indicator)",
			"transition-[width,background-color] duration-200 ease-out",
			"data-indeterminate:absolute data-[indeterminate]:inset-y-0 data-indeterminate:w-1/2",
			"data-indeterminate:origin-left data-indeterminate:animate-[raft-progress-indeterminate_1.4s_ease-in-out_infinite]"
		]
	},
	variants: {
		theme: {
			brutal: {
				root: ["font-heading"],
				label: ["text-xs font-bold text-foreground"],
				value: ["font-mono text-xs font-bold text-foreground-strong/70"],
				track: [
					"h-4 group-data-[size=sm]/progress:h-3 group-data-[size=lg]/progress:h-5",
					"border-2 border-line-strong bg-layer-panel",
					"shadow-raft-xs",
					"group-data-complete/progress:shadow-none"
				]
			},
			elegant: {
				root: [
					"font-sans",
					"[--progress-indicator:color-mix(in_oklab,var(--progress-color)_90%,transparent)]",
					"[--progress-track:color-mix(in_oklab,var(--line-muted)_35%,var(--layer-panel))]",
					"data-indeterminate:[--progress-track:color-mix(in_oklab,var(--line-muted)_65%,var(--layer-panel))]",
					"dark:[--progress-indicator:var(--progress-color)]",
					"[--progress-sweep:color-mix(in_oklab,var(--progress-color)_40%,transparent)]",
					"dark:[--progress-sweep:color-mix(in_oklab,var(--progress-color)_55%,transparent)]",
					"dark:[--progress-track:var(--layer-inset)]",
					"dark:data-indeterminate:[--progress-track:oklch(0.21_0.004_106.42)]"
				],
				label: ["text-[13px] font-medium leading-5 text-foreground-strong"],
				value: ["font-mono text-[11px] font-medium leading-5 text-foreground-placeholder"],
				track: [
					"h-2 group-data-[size=sm]/progress:h-1.5 group-data-[size=lg]/progress:h-2.5",
					"rounded-full",
					"dark:shadow-[inset_0_1px_1px_oklch(0_0_0/0.35),0_1px_0_oklch(0.985_0.004_106.42/0.03)]",
					"dark:not-has-data-indeterminate:overflow-visible"
				],
				indicator: [
					"rounded-full",
					"data-indeterminate:w-2/5",
					"data-indeterminate:bg-[linear-gradient(90deg,transparent,var(--progress-sweep),transparent)]",
					"data-indeterminate:animate-[raft-progress-sweep_1.6s_ease-in-out_infinite]",
					"dark:data-indeterminate:shadow-none",
					"dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.08),0_1px_1px_color-mix(in_oklab,var(--progress-color)_14%,transparent),0_2px_3px_color-mix(in_oklab,var(--progress-color)_7%,transparent)]"
				]
			}
		},
		variant: {
			primary: { root: ["[--progress-color:var(--color-primary-400)]", "[--progress-light:var(--color-primary-200)]"] },
			information: { root: ["[--progress-color:var(--color-info)]", "[--progress-light:var(--color-info-muted)]"] },
			accent: { root: ["[--progress-color:var(--color-accent-400)]", "[--progress-light:var(--color-accent-200)]"] },
			success: { root: ["[--progress-color:var(--color-success)]", "[--progress-light:var(--color-success-muted)]"] },
			warning: { root: ["[--progress-color:var(--color-warning)]", "[--progress-light:var(--color-warning-muted)]"] },
			danger: { root: ["[--progress-color:var(--color-danger)]", "[--progress-light:var(--color-danger-muted)]"] }
		},
		size: {
			sm: {},
			md: {},
			lg: {}
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	},
	compoundVariants: []
});
const progressStyle = /* @__PURE__ */ jsx("style", {
	href: "raft-ui-progress",
	precedence: "default",
	children: PROGRESS_STYLE
});
function Progress({ size = "md", variant = "primary", className, ...props }) {
	const theme = useThemeFamily();
	const { root } = progress({
		theme,
		size,
		variant
	});
	return /* @__PURE__ */ jsx(Progress$1.Root, {
		"data-slot": "progress",
		"data-size": size,
		"data-variant": variant,
		className: root({ className }),
		...props
	});
}
function ProgressHeader({ className, ...props }) {
	const theme = useThemeFamily();
	const { header } = progress({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "progress-header",
		className: header({ className }),
		...props
	});
}
function ProgressLabel({ className, ...props }) {
	const theme = useThemeFamily();
	const { label } = progress({ theme });
	return /* @__PURE__ */ jsx(Progress$1.Label, {
		"data-slot": "progress-label",
		className: label({ className }),
		...props
	});
}
function ProgressValue({ className, ...props }) {
	const theme = useThemeFamily();
	const { value } = progress({ theme });
	return /* @__PURE__ */ jsx(Progress$1.Value, {
		"data-slot": "progress-value",
		className: value({ className }),
		...props
	});
}
function ProgressTrack({ className, ...props }) {
	const theme = useThemeFamily();
	const { track } = progress({ theme });
	return /* @__PURE__ */ jsx(Progress$1.Track, {
		"data-slot": "progress-track",
		className: track({ className }),
		...props
	});
}
function ProgressIndicator({ className, ...props }) {
	const theme = useThemeFamily();
	const { indicator } = progress({ theme });
	return /* @__PURE__ */ jsx(Progress$1.Indicator, {
		"data-slot": "progress-indicator",
		className: indicator({ className }),
		...props,
		children: progressStyle
	});
}
//#endregion
//#region src/components/message-translation/message-translation.recipe.ts
const messageTranslation = tv$1({
	slots: {
		translationOriginal: ["not-italic"],
		translationOriginalLabel: [],
		translationStatus: ["inline-flex items-center gap-1.5"],
		translationFailedStatus: ["inline-flex items-center gap-1.5"],
		translationProgressTrack: [],
		translationAction: ["inline-flex items-center gap-1", "font-medium underline underline-offset-2"],
		translationRetryAction: ["inline-flex items-center gap-1", "font-medium underline underline-offset-2"]
	},
	variants: { theme: {
		brutal: {
			translationOriginalLabel: "mb-0.5 text-[10px] font-bold uppercase tracking-normal text-black/40",
			translationStatus: "font-mono text-[11px] text-black/45",
			translationFailedStatus: ["font-mono text-[11px] text-black/45", "text-brutal-orange"],
			translationAction: "decoration-black/40 hover:decoration-black",
			translationRetryAction: "font-bold text-brutal-orange decoration-black/40 hover:decoration-black"
		},
		elegant: {
			translationOriginalLabel: "mb-0.5 text-[10px] font-medium tracking-normal text-foreground-muted/70",
			translationStatus: "text-[11px] leading-none text-foreground-muted",
			translationFailedStatus: "text-[11px] leading-none text-warning",
			translationProgressTrack: "h-1.5",
			translationAction: "text-foreground-muted/70 no-underline hover:text-foreground-muted",
			translationRetryAction: [
				"rounded-sm px-1 py-0.5",
				"text-warning no-underline",
				"transition-colors hover:bg-warning-soft hover:text-warning"
			]
		}
	} }
});
//#endregion
//#region src/components/message-translation/message-translation.tsx
function MessageItemTranslationOriginal({ className, ...props }) {
	const { translationOriginal } = messageTranslation({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(MarkdownBlockquote, {
		"data-slot": "message-item-translation-original",
		className: translationOriginal({ className }),
		...props
	});
}
function MessageItemTranslationOriginalLabel({ className, ...props }) {
	const { translationOriginalLabel } = messageTranslation({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "message-item-translation-original-label",
		className: translationOriginalLabel({ className }),
		...props
	});
}
function MessageItemTranslationStatus({ className, ...props }) {
	const { translationStatus } = messageTranslation({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "message-item-translation-status",
		className: translationStatus({ className }),
		...props
	});
}
function MessageItemTranslationProgressTrack({ className, ...props }) {
	const { translationProgressTrack } = messageTranslation({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ProgressTrack, {
		className: translationProgressTrack({ className }),
		...props
	});
}
function MessageItemTranslationFailedStatus({ className, ...props }) {
	const { translationFailedStatus } = messageTranslation({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "message-item-translation-status",
		className: translationFailedStatus({ className }),
		...props
	});
}
function MessageItemTranslationAction({ className, ...props }) {
	const { translationAction } = messageTranslation({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		"data-slot": "message-item-translation-action",
		className: translationAction({ className }),
		...props
	});
}
function MessageItemTranslationRetryAction({ className, ...props }) {
	const { translationRetryAction } = messageTranslation({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		"data-slot": "message-item-translation-retry-action",
		className: translationRetryAction({ className }),
		...props
	});
}
//#endregion
//#region src/components/message-list/message-list.recipe.ts
const messageList = tv$1({
	slots: {
		root: ["relative h-full min-h-0"],
		viewport: ["min-w-0 overscroll-none"],
		content: ["flex min-h-full w-full min-w-0 flex-col"],
		dateDividerRoot: ["flex select-none items-center px-3 py-2"],
		dateDividerRule: ["flex-1"],
		dateDividerChip: ["inline-flex items-center"],
		notice: ["text-center"],
		historyLimited: ["inline-flex items-center gap-1.5"]
	},
	variants: {
		theme: {
			brutal: {
				dateDividerRule: "translate-y-px border-t-2 border-black/15",
				dateDividerChip: "px-2 text-[10px] font-bold uppercase tracking-widest text-black/50",
				notice: "pb-2 font-mono text-xs",
				historyLimited: "border border-black/20 bg-white/70 px-2 py-1 [&_svg]:size-3"
			},
			elegant: {
				content: "md:pb-[var(--panel-footer-clearance)]",
				dateDividerRoot: "opacity-70",
				dateDividerRule: "border-t border-line-hairline dark:border-ink-4",
				dateDividerChip: "px-2 font-mono text-[11px] font-normal uppercase tracking-widest text-foreground-muted",
				notice: "pb-2 font-sans text-xs",
				historyLimited: "rounded-sm border border-line-muted bg-layer-panel/70 px-2 py-1 [&_svg]:size-3"
			}
		},
		tone: {
			faint: { notice: "text-foreground-strong/40" },
			muted: { notice: "text-foreground-strong/50" }
		}
	},
	defaultVariants: { tone: "faint" }
});
//#endregion
//#region src/components/message-list/message-list.tsx
function MessageList({ children, className, render, rootClassName, ...props }) {
	const theme = useThemeFamily();
	const isMobile = useMobileViewport();
	const { content, root, viewport } = messageList({ theme });
	if (isMobile) return /* @__PURE__ */ jsx("div", {
		"data-slot": "message-list",
		className: root({ className: rootClassName }),
		children: /* @__PURE__ */ jsx(PanelScrollViewport, {
			...props,
			render,
			"data-slot": "message-list-viewport",
			className: viewport({ className }),
			style: {
				...props.style,
				overflowX: "hidden"
			},
			children: /* @__PURE__ */ jsx("div", {
				className: content(),
				children
			})
		})
	});
	return /* @__PURE__ */ jsxs(ScrollArea, {
		"data-slot": "message-list",
		className: root({ className: rootClassName }),
		children: [/* @__PURE__ */ jsx(ScrollAreaViewport, {
			...props,
			render,
			"data-slot": "message-list-viewport",
			className: viewport({ className }),
			style: {
				...props.style,
				overflowX: "hidden"
			},
			children: /* @__PURE__ */ jsx(ScrollAreaContent, {
				className: content(),
				children
			})
		}), /* @__PURE__ */ jsx(ScrollAreaScrollbar, {
			className: "me-1.5 px-0 py-1",
			children: /* @__PURE__ */ jsx(ScrollAreaThumb, {})
		})]
	});
}
//#endregion
//#region src/components/message-list/message-list-markers.tsx
function MessageListDateDivider({ children, className, render, ...props }) {
	const { dateDividerRoot, dateDividerRule, dateDividerChip } = messageList({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "message-list-date-divider",
			className: dateDividerRoot({ className }),
			children: /* @__PURE__ */ jsxs(Fragment$1, { children: [
				/* @__PURE__ */ jsx("div", {
					"aria-hidden": true,
					className: dateDividerRule()
				}),
				/* @__PURE__ */ jsx("span", {
					className: dateDividerChip(),
					children
				}),
				/* @__PURE__ */ jsx("div", {
					"aria-hidden": true,
					className: dateDividerRule()
				})
			] })
		}, props)
	});
}
function MessageListNotice({ className, render, tone = "faint", ...props }) {
	const { notice } = messageList({
		theme: useThemeFamily(),
		tone
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "message-list-notice",
			className: notice({ className })
		}, props)
	});
}
function MessageListHistoryLimited({ className, render, ...props }) {
	const { historyLimited } = messageList({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "message-list-history-limited",
			className: historyLimited({ className })
		}, props)
	});
}
//#endregion
//#region src/components/text/text.tsx
const textColorVariants = {
	default: ["text-foreground"],
	primary: ["text-primary-700"],
	information: ["text-info-strong"],
	muted: ["text-foreground-muted"],
	placeholder: ["text-foreground-placeholder"],
	accent: ["text-accent-700"],
	success: ["text-success"],
	warning: ["text-warning"],
	danger: ["text-danger"]
};
const heading = tv$1({
	base: ["m-0 font-heading font-medium text-foreground"],
	variants: {
		level: {
			1: ["text-[56px] tracking-[-0.01em] leading-16"],
			2: ["text-5xl tracking-[-0.01em] leading-14"],
			3: ["text-[40px] tracking-[-0.01em] leading-12"],
			4: ["text-[32px] tracking-[-0.005em] leading-10"],
			5: ["text-2xl leading-8"],
			6: ["text-xl leading-7"]
		},
		variant: textColorVariants
	},
	defaultVariants: { level: 1 }
});
const sans = tv$1({
	base: ["m-0 font-sans font-normal"],
	variants: {
		size: {
			large: ["text-lg leading-7 text-foreground-strong"],
			body: ["text-base leading-6 text-foreground-strong"],
			small: ["text-sm leading-5 text-foreground-muted"],
			caption: ["text-xs leading-4 text-foreground-muted"]
		},
		variant: textColorVariants
	},
	defaultVariants: { size: "body" }
});
const mono = tv$1({
	base: ["m-0 font-mono font-normal"],
	variants: {
		size: {
			code: ["text-sm leading-5 text-foreground-strong"],
			meta: ["text-xs leading-4 text-foreground-muted"],
			eyebrow: ["text-[10px] font-medium uppercase tracking-wide leading-none", "text-foreground-placeholder"],
			tabular: ["text-sm tabular-nums leading-5 text-foreground-strong"]
		},
		variant: textColorVariants
	},
	defaultVariants: { size: "code" }
});
function TextHeading({ level = 1, variant, className, render, ...props }) {
	const defaultProps = { className: heading({
		level,
		variant,
		className
	}) };
	return useRender({
		defaultTagName: `h${level}`,
		render,
		props: mergeProps(defaultProps, props),
		state: {
			slot: "text-heading",
			level,
			variant
		}
	});
}
function TextSans({ size = "body", variant, className, render, ...props }) {
	return useRender({
		defaultTagName: "p",
		render,
		props: mergeProps({ className: sans({
			size,
			variant,
			className
		}) }, props),
		state: {
			slot: "text-sans",
			size,
			variant
		}
	});
}
function TextMono({ size = "code", variant, className, render, ...props }) {
	return useRender({
		defaultTagName: "p",
		render,
		props: mergeProps({ className: mono({
			size,
			variant,
			className
		}) }, props),
		state: {
			slot: "text-mono",
			size,
			variant
		}
	});
}
const Text = {
	Heading: TextHeading,
	Sans: TextSans,
	Mono: TextMono
};
//#endregion
//#region src/components/file-preview/file-preview.recipe.ts
const filePreview = tv$1({
	slots: {
		root: ["relative flex h-10 w-10 shrink-0 items-center justify-center"],
		document: ["relative h-10 w-8 space-y-1.5 rounded-md rounded-tr-[15%] bg-layer-panel p-1.5 shadow-raft-sm ring-1 ring-line-muted", "dark:ring-transparent"],
		file: ["relative flex h-10 w-8 items-center justify-center rounded-md rounded-tr-[15%] bg-layer-panel shadow-raft-sm ring-1 ring-line-muted", "dark:ring-transparent"],
		code: ["relative flex h-10 w-8 items-center justify-center rounded-md rounded-tr-[15%] bg-layer-panel shadow-raft-sm ring-1 ring-line-muted", "dark:ring-transparent"],
		fileZip: ["flex h-7 items-center justify-center"],
		fileZipStack: ["relative -translate-y-0.5 flex flex-col items-center"],
		fileZipTeeth: ["space-y-px"],
		fileZipRow: ["flex overflow-hidden rounded-full"],
		fileZipDark: ["size-0.5 bg-primary-400/60"],
		fileZipLight: ["size-0.5 bg-accent-400/35"],
		fileZipPull: ["mt-0.5 h-1 w-2.5 rounded-sm border border-primary-400/40 bg-accent-400/20"],
		codeStack: ["-translate-y-0.5 space-y-px"],
		codeRow: ["flex items-center gap-0.5 leading-none"],
		codeRowIndent: ["flex items-center gap-0.5 pl-1.5 leading-none"],
		codeTextRow: ["block pl-3"],
		codeGlyph: ["font-mono text-[4px] leading-none text-foreground-strong/30"],
		codeTagLine: ["h-0.5 w-3 rounded-full bg-primary-400/60"],
		codeAttributeLine: ["h-0.5 w-2.5 rounded-full bg-accent-400/60"],
		codeTextLine: ["h-0.5 w-6 rounded-full bg-foreground-strong/10"],
		codeSelfClosingLine: ["h-0.5 w-2 rounded-full bg-primary-400/60"],
		badge: [
			"absolute -right-1.5 bottom-0.5 z-10 w-fit whitespace-nowrap rounded-sm px-1.5 py-0.5",
			"font-mono text-[10px] leading-none font-semibold text-white",
			"shadow-[0_3px_6px_oklch(0.42_0.12_20/0.25)] [text-shadow:0_1px_1px_oklch(0.25_0.08_20/0.45)]",
			"after:pointer-events-none after:absolute after:inset-0 after:rounded-sm after:border after:border-[oklch(1_0_0/0.2)] after:content-['']",
			"dark:shadow-none dark:text-shadow-none dark:after:border-[oklch(1_0_0/0.08)]"
		],
		media: ["relative h-10 w-8 overflow-hidden rounded-md bg-layer-panel shadow-raft-sm ring-1 ring-line-muted", "dark:ring-transparent"]
	},
	variants: {
		badgeColor: {
			rose: { badge: "bg-[oklch(0.63_0.21_20)] dark:bg-[oklch(0.42_0.14_20)] dark:text-[oklch(0.88_0.06_18)]" },
			blue: { badge: "bg-[oklch(0.56_0.16_250)] dark:bg-[oklch(0.4_0.12_250)] dark:text-[oklch(0.87_0.06_250)]" },
			amber: { badge: "bg-[oklch(0.52_0.13_75)] dark:bg-[oklch(0.42_0.1_75)] dark:text-[oklch(0.89_0.08_80)]" },
			emerald: { badge: "bg-[oklch(0.54_0.14_160)] dark:bg-[oklch(0.4_0.11_160)] dark:text-[oklch(0.86_0.09_160)]" },
			violet: { badge: "bg-[oklch(0.52_0.16_300)] dark:bg-[oklch(0.4_0.13_300)] dark:text-[oklch(0.87_0.06_300)]" },
			neutral: { badge: "bg-foreground dark:bg-fill-strong dark:text-foreground-strong" }
		},
		theme: {
			brutal: {
				document: "rounded-none border-2 border-black bg-white shadow-raft-sm ring-0",
				file: "rounded-none border-2 border-black bg-white shadow-raft-sm ring-0",
				code: "rounded-none border-2 border-black bg-white shadow-raft-sm ring-0",
				media: "rounded-none border-2 border-black bg-white shadow-raft-sm ring-0",
				badge: ["-right-0.5 bottom-0.5 rounded-none border-2 border-black px-1 py-0.5", "font-bold text-foreground-inverse shadow-raft-sm text-shadow-none after:hidden"]
			},
			elegant: { badge: "px-1" }
		}
	},
	defaultVariants: { badgeColor: "rose" }
});
//#endregion
//#region src/components/file-preview/file-preview.tsx
function FilePreview({ className, render, ...props }) {
	const { root } = filePreview();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "file-preview",
			className: root({ className })
		}, props)
	});
}
function FilePreviewDocument({ children, className, render, ...props }) {
	const { document } = filePreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"aria-hidden": true,
			"data-slot": "file-preview-document",
			className: document({ className }),
			children: /* @__PURE__ */ jsxs(Fragment$1, { children: [
				/* @__PURE__ */ jsx("span", { className: "block h-0.5 w-full rounded-full bg-ink-10" }),
				/* @__PURE__ */ jsxs("span", {
					className: "flex gap-0.5",
					children: [/* @__PURE__ */ jsx("span", { className: "h-0.5 w-1/3 rounded-full bg-ink-10" }), /* @__PURE__ */ jsx("span", { className: "h-0.5 w-2/3 rounded-full bg-ink-10" })]
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "flex gap-0.5",
					children: [/* @__PURE__ */ jsx("span", { className: "h-0.5 w-1/2 rounded-full bg-ink-10" }), /* @__PURE__ */ jsx("span", { className: "h-0.5 w-1/2 rounded-full bg-ink-10" })]
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "flex gap-0.5",
					children: [/* @__PURE__ */ jsx("span", { className: "h-0.5 w-1/3 rounded-full bg-ink-10" }), /* @__PURE__ */ jsx("span", { className: "h-0.5 w-2/3 rounded-full bg-ink-10" })]
				}),
				children
			] })
		}, props)
	});
}
function FilePreviewFile({ children, className, render, ...props }) {
	const { file, fileZip, fileZipDark, fileZipLight, fileZipPull, fileZipRow, fileZipStack, fileZipTeeth } = filePreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"aria-hidden": true,
			"data-slot": "file-preview-file",
			className: file({ className }),
			children: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx("span", {
				className: fileZip(),
				children: /* @__PURE__ */ jsxs("span", {
					className: fileZipStack(),
					children: [/* @__PURE__ */ jsxs("span", {
						className: fileZipTeeth(),
						children: [
							/* @__PURE__ */ jsxs("span", {
								className: fileZipRow(),
								children: [/* @__PURE__ */ jsx("span", { className: fileZipDark() }), /* @__PURE__ */ jsx("span", { className: fileZipLight() })]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: fileZipRow(),
								children: [/* @__PURE__ */ jsx("span", { className: fileZipLight() }), /* @__PURE__ */ jsx("span", { className: fileZipDark() })]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: fileZipRow(),
								children: [/* @__PURE__ */ jsx("span", { className: fileZipDark() }), /* @__PURE__ */ jsx("span", { className: fileZipLight() })]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: fileZipRow(),
								children: [/* @__PURE__ */ jsx("span", { className: fileZipLight() }), /* @__PURE__ */ jsx("span", { className: fileZipDark() })]
							}),
							/* @__PURE__ */ jsxs("span", {
								className: fileZipRow(),
								children: [/* @__PURE__ */ jsx("span", { className: fileZipDark() }), /* @__PURE__ */ jsx("span", { className: fileZipLight() })]
							})
						]
					}), /* @__PURE__ */ jsx("span", { className: fileZipPull() })]
				})
			}), children] })
		}, props)
	});
}
function FilePreviewCode({ children, className, render, ...props }) {
	const { code, codeAttributeLine, codeGlyph, codeRow, codeRowIndent, codeSelfClosingLine, codeStack, codeTagLine, codeTextLine, codeTextRow } = filePreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"aria-hidden": true,
			"data-slot": "file-preview-code",
			className: code({ className }),
			children: /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("span", {
				className: codeStack(),
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: codeRow(),
						children: [
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: "<"
							}),
							/* @__PURE__ */ jsx("span", { className: codeTagLine() }),
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: ">"
							})
						]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: codeRowIndent(),
						children: [
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: "<"
							}),
							/* @__PURE__ */ jsx("span", { className: codeAttributeLine() }),
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: ">"
							})
						]
					}),
					/* @__PURE__ */ jsx("span", {
						className: codeTextRow(),
						children: /* @__PURE__ */ jsx("span", { className: codeTextLine() })
					}),
					/* @__PURE__ */ jsxs("span", {
						className: codeRowIndent(),
						children: [
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: "</"
							}),
							/* @__PURE__ */ jsx("span", { className: codeAttributeLine() }),
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: ">"
							})
						]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: codeRowIndent(),
						children: [
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: "<"
							}),
							/* @__PURE__ */ jsx("span", { className: codeSelfClosingLine() }),
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: "/>"
							})
						]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: codeRow(),
						children: [
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: "</"
							}),
							/* @__PURE__ */ jsx("span", { className: codeTagLine() }),
							/* @__PURE__ */ jsx("span", {
								className: codeGlyph(),
								children: ">"
							})
						]
					})
				]
			}), children] })
		}, props)
	});
}
const FILE_PREVIEW_BADGE_TYPE_COLOR = {
	pdf: "rose",
	doc: "blue",
	docx: "blue",
	txt: "neutral",
	md: "neutral",
	csv: "neutral",
	json: "neutral",
	zip: "amber",
	html: "violet",
	code: "violet",
	img: "emerald",
	png: "emerald",
	jpg: "emerald",
	jpeg: "emerald",
	gif: "emerald",
	webp: "emerald",
	svg: "emerald",
	mp4: "blue",
	mov: "blue"
};
function FilePreviewBadge({ className, render, color, type, ...props }) {
	const { badge } = filePreview({
		theme: useThemeFamily(),
		badgeColor: type ? FILE_PREVIEW_BADGE_TYPE_COLOR[type] : color ?? "rose"
	});
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "file-preview-badge",
			className: badge({ className })
		}, props)
	});
}
function FilePreviewMedia({ children, className, render, ...props }) {
	const { media } = filePreview({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"aria-hidden": true,
			"data-slot": "file-preview-media",
			className: media({ className }),
			children
		}, props)
	});
}
//#endregion
//#region src/components/files/files.recipe.ts
const files = tv$1({
	slots: {
		panel: ["flex min-h-0 flex-1 flex-col"],
		viewport: ["min-h-0 flex-1 overflow-y-auto"],
		list: ["flex flex-col gap-2 px-5 py-3"],
		row: ["group/file-row flex w-full min-w-0 items-start gap-3 border-2 px-3 py-3", "transition-colors"],
		rowOpen: ["flex min-w-0 flex-1 items-stretch gap-3 text-left", "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2"],
		thumbnail: [
			"flex size-14 shrink-0 items-center justify-center overflow-hidden border-2",
			"[&_svg]:size-4.5 [&_svg]:shrink-0",
			"has-[[data-slot=file-preview]]:size-10",
			"has-data-[slot=file-preview]:overflow-visible has-data-[slot=file-preview]:border-0 has-data-[slot=file-preview]:bg-transparent"
		],
		image: ["block size-full  bg-white", "data-[fit=contain]:object-contain data-[fit=cover]:object-cover"],
		content: ["flex min-w-0 flex-1 flex-col"],
		name: ["block truncate text-sm font-bold"],
		meta: ["mt-auto flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs"],
		metaItem: ["inline-flex items-center gap-1 [&_svg]:size-3 [&_svg]:shrink-0"],
		actions: ["flex shrink-0 self-center items-center gap-1.5"]
	},
	variants: { theme: {
		brutal: {
			panel: "bg-white",
			row: ["border-black/30 bg-white", "hover:border-black hover:shadow-raft-sm"],
			rowOpen: "focus-visible:outline-black",
			thumbnail: "border-black bg-white text-black",
			name: "text-black",
			meta: "text-black/50"
		},
		elegant: {
			panel: ["bg-layer-panel", "dark:bg-transparent"],
			list: ["gap-2.5 px-5 py-4"],
			row: [
				"rounded-lg border-[0.5px] border-line-muted bg-layer-panel px-3 py-3 shadow-raft-xs",
				"hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
				"dark:hover:bg-[color-mix(in_oklch,var(--ink)_5%,var(--layer-panel))]",
				"dark:border-transparent"
			],
			rowOpen: ["focus-visible:outline-transparent", "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-panel"],
			thumbnail: ["rounded-md border border-line-muted bg-fill-muted", "text-foreground-icon"],
			image: "bg-layer-panel",
			name: ["font-sans font-medium text-foreground"],
			meta: ["font-sans text-foreground-placeholder"]
		}
	} }
});
//#endregion
//#region src/components/files/files.tsx
function useFileSlot(slotName, dataSlot, defaultTagName, props) {
	const slot = files({ theme: useThemeFamily() })[slotName];
	const { className, render, ...otherProps } = props;
	return useRender({
		defaultTagName,
		render,
		props: {
			"data-slot": dataSlot,
			className: slot({ className }),
			...otherProps
		}
	});
}
function FilesPanel(props) {
	return useFileSlot("panel", "files-panel", "section", props);
}
function FilesViewport(props) {
	return useFileSlot("viewport", "files-viewport", "div", props);
}
function FilesList(props) {
	return useFileSlot("list", "files-list", "div", props);
}
function FileRow(props) {
	return useFileSlot("row", "file-row", "div", props);
}
function FileRowOpen(props) {
	return useFileSlot("rowOpen", "file-row-open", "button", {
		type: "button",
		...props
	});
}
function FileThumbnail(props) {
	return useFileSlot("thumbnail", "file-thumbnail", "span", props);
}
function FileImage({ fit = "cover", ...props }) {
	return useFileSlot("image", "file-image", "img", {
		"data-fit": fit,
		...props
	});
}
function FileContent(props) {
	return useFileSlot("content", "file-content", "span", props);
}
function FileName(props) {
	return useFileSlot("name", "file-name", "span", props);
}
function FileMeta(props) {
	return useFileSlot("meta", "file-meta", "span", props);
}
function FileMetaItem(props) {
	return useFileSlot("metaItem", "file-meta-item", "span", props);
}
function FileActions(props) {
	return useFileSlot("actions", "file-actions", "span", props);
}
function FileAction({ variant, size = "icon-sm", ...props }) {
	const theme = useThemeFamily();
	return /* @__PURE__ */ jsx(Button, {
		variant: variant ?? (theme === "brutal" ? "outline" : "ghost"),
		size,
		...props
	});
}
//#endregion
//#region src/components/composer/composer.recipe.ts
const composer = tv$1({
	slots: {
		root: ["flex w-full flex-col gap-2 border-2 p-2"],
		input: ["min-h-5 max-h-32 w-full resize-none bg-transparent text-base leading-5 outline-none md:text-sm"],
		toolbar: ["flex items-center justify-between gap-3"],
		actions: ["flex items-center gap-2"],
		meta: ["flex items-center gap-4"],
		iconButton: []
	},
	variants: { theme: {
		brutal: {
			root: "border-black bg-white shadow-raft-sm focus-within:shadow-raft-md",
			input: "font-sans text-black placeholder:text-black/35",
			meta: "gap-3",
			iconButton: [
				"size-[26px] p-1 border-black bg-white text-black shadow-raft-sm",
				"hover:-translate-y-px hover:border-black hover:bg-white hover:shadow-raft-md",
				"active:translate-px  active:shadow-raft-xs"
			]
		},
		elegant: {
			root: [
				"overflow-hidden rounded-lg border-0 p-0",
				"bg-layer-panel",
				"shadow-raft-sm ring-1 ring-ink-6 dark:shadow-none dark:ring-transparent",
				"dark:focus-within:ring-[0.5px] dark:focus-within:ring-accent-400/70"
			],
			input: [
				"min-h-16 px-3 pt-3",
				"font-sans text-foreground-strong",
				"placeholder:text-foreground-placeholder"
			],
			toolbar: "translate-y-1 gap-2 px-2.5 pt-1 pb-2.5",
			actions: "gap-1.5",
			iconButton: [
				"p-[7px]",
				"text-foreground-icon",
				"hover:bg-fill-strong/80 hover:text-foreground-strong",
				"active:bg-fill-strong/80 active:text-foreground-strong"
			]
		}
	} }
});
//#endregion
//#region src/components/composer/composer.tsx
function Composer({ className, render, ...props }) {
	const { root } = composer({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer",
			className: root({ className })
		}, props)
	});
}
function ComposerInput({ className, render, ...props }) {
	const { input } = composer({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "textarea",
		render,
		props: mergeProps({
			rows: 1,
			"data-slot": "composer-input",
			className: input({ className })
		}, props)
	});
}
function ComposerToolbar({ className, render, ...props }) {
	const { toolbar } = composer({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-toolbar",
			className: toolbar({ className })
		}, props)
	});
}
function ComposerActions({ className, render, ...props }) {
	const { actions } = composer({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-actions",
			className: actions({ className })
		}, props)
	});
}
function ComposerMeta({ className, render, ...props }) {
	const { meta } = composer({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-meta",
			className: meta({ className })
		}, props)
	});
}
function ComposerIconButton({ className, ...props }) {
	const { iconButton } = composer({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Button, {
		type: "button",
		size: "icon-sm",
		variant: "ghost",
		className: iconButton({ className }),
		...props
	});
}
function ComposerSubmit({ type = "submit", ...props }) {
	return /* @__PURE__ */ jsx(Button, {
		...props,
		type,
		variant: "accent"
	});
}
//#endregion
//#region src/components/composer/composer-attachment.recipe.ts
const composerAttachment = tv$1({
	slots: {
		attachments: [
			"flex flex-wrap gap-2",
			"has-data-[slot=composer-attachments-scroll-area]:relative",
			"has-data-[slot=composer-attachments-scroll-area]:block",
			"has-[[data-slot=composer-attachments-scroll-area]]:min-w-0",
			"has-data-[slot=sortable-composer-attachments-list]:block",
			"has-[[data-slot=sortable-composer-attachments-list]]:min-w-0"
		],
		attachmentsScrollArea: ["relative w-full min-w-0"],
		attachmentsViewport: [
			"flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain py-1.5",
			"scrollbar-none [&::-webkit-scrollbar]:hidden",
			"**:data-[slot=composer-attachment]:shrink-0"
		],
		attachmentsNav: ["absolute top-1/2 z-30 -translate-y-1/2"],
		attachment: ["group/composer-attachment relative"],
		attachmentFile: ["relative flex h-16 w-44 gap-2 border-2 px-2", "[&_svg]:size-4 [&_svg]:shrink-0"],
		attachmentImage: [
			"relative block size-16 shrink-0 overflow-hidden",
			"**:data-[slot=file-preview]:size-full **:data-[slot=file-preview-media]:size-full",
			"**:data-[slot=file-preview-media]:border-0 **:data-[slot=file-preview-media]:bg-transparent",
			"**:data-[slot=file-preview-media]:shadow-none **:data-[slot=file-preview-media]:ring-0"
		],
		attachmentBody: ["block min-w-0 flex-1"],
		attachmentTitle: ["block truncate text-xs font-bold"],
		attachmentMeta: ["block w-full truncate text-right text-[10px]"],
		attachmentUploadingOverlay: ["absolute inset-0 z-10 flex flex-col items-center justify-center px-1", "text-center text-[10px] font-bold leading-3"],
		attachmentUploadProgressBar: ["absolute bottom-0 left-0 z-20 h-1 w-full overflow-hidden bg-black/15 dark:bg-ink-16"],
		attachmentUploadProgressBarIndicator: ["block h-full"],
		attachmentFailedOverlay: ["absolute inset-0 z-10 flex flex-col items-center justify-center border-2 px-1", "text-center text-[10px] font-bold leading-3"],
		attachmentRemove: [
			"absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full",
			"opacity-0 transition-opacity group-hover/composer-attachment:opacity-100",
			"[@media(hover:none)]:h-6 [@media(hover:none)]:w-6 [@media(hover:none)]:opacity-100",
			"[&_svg]:size-2.5 [&_svg]:shrink-0"
		]
	},
	variants: {
		side: {
			prev: { attachmentsNav: "left-1.5" },
			next: { attachmentsNav: "right-1.5" }
		},
		theme: {
			brutal: {
				attachmentsViewport: "pe-1.5",
				attachmentsNav: [
					"shadow-raft-sm",
					"hover:-translate-y-1/2 hover:shadow-raft-sm",
					"active:not-data-[haspopup]:translate-x-0 active:not-data-haspopup:-translate-y-1/2 active:shadow-raft-sm"
				],
				attachment: [
					"has-[[data-slot=composer-attachment-image]]:size-16",
					"has-data-[slot=composer-attachment-image]:border-2",
					"has-data-[slot=composer-attachment-image]:border-black",
					"has-data-[slot=composer-attachment-image]:**:data-[slot=composer-attachment-failed-overlay]:border-0"
				],
				attachmentFile: "items-center border-black bg-white [&_svg]:text-black/70",
				attachmentImage: "size-full image-transparency-bg",
				attachmentBody: "flex h-[46px] flex-col justify-between",
				attachmentTitle: "mt-1 leading-none text-black",
				attachmentMeta: "leading-none text-black/50",
				attachmentUploadingOverlay: "bg-white/85 text-black",
				attachmentUploadProgressBarIndicator: "bg-brutal-pink",
				attachmentFailedOverlay: "border-black bg-brutal-orange/90 text-black",
				attachmentRemove: "bg-black text-white outline-2 outline-solid outline-white"
			},
			elegant: {
				attachments: ["pt-0.5", "has-[[data-slot=composer-attachments-scroll-area]]:-mx-1"],
				attachmentsViewport: "px-1",
				attachmentsNav: "rounded-full shadow-raft-md",
				attachmentFile: [
					"items-start gap-3 overflow-hidden rounded-md border-0 bg-layer-panel pt-1.5 pr-2.5 pl-1.5",
					"ring-1 ring-ink-10 [&_svg]:text-foreground-icon",
					"*:data-[slot=file-preview]:self-center *:data-[slot=file-preview]:translate-y-[-3px]"
				],
				attachmentImage: "rounded-md ring-1 ring-ink-10",
				attachmentTitle: "translate-y-0.5 font-medium text-foreground",
				attachmentMeta: "absolute right-2.5 bottom-1.5 text-foreground-placeholder",
				attachmentUploadProgressBar: "rounded-b-md",
				attachmentUploadProgressBarIndicator: "bg-accent-400",
				attachmentUploadingOverlay: "rounded-md bg-white/85 text-foreground-strong dark:bg-layer-canvas-muted/80",
				attachmentFailedOverlay: "rounded-md border-0 bg-white/85 text-danger dark:bg-layer-canvas-muted/80 dark:text-danger-strong",
				attachmentRemove: "bg-foreground text-foreground-inverse outline-2 outline-solid outline-layer-panel"
			}
		}
	}
});
//#endregion
//#region src/components/composer/composer-attachments.tsx
function ComposerAttachments({ className, render, ...props }) {
	const { attachments } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-attachments",
			className: attachments({ className })
		}, props)
	});
}
function ComposerAttachment({ className, render, ...props }) {
	const { attachment } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-attachment",
			className: attachment({ className })
		}, props)
	});
}
function ComposerAttachmentFile({ className, render, ...props }) {
	const { attachmentFile } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-attachment-file",
			className: attachmentFile({ className })
		}, props)
	});
}
function ComposerAttachmentImage({ className, render, ...props }) {
	const { attachmentImage } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-attachment-image",
			className: attachmentImage({ className })
		}, props)
	});
}
function ComposerAttachmentBody({ className, render, ...props }) {
	const { attachmentBody } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-attachment-body",
			className: attachmentBody({ className })
		}, props)
	});
}
function ComposerAttachmentTitle({ className, render, ...props }) {
	const { attachmentTitle } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-attachment-title",
			className: attachmentTitle({ className })
		}, props)
	});
}
function ComposerAttachmentMeta({ className, render, ...props }) {
	const { attachmentMeta } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-attachment-meta",
			className: attachmentMeta({ className })
		}, props)
	});
}
function ComposerAttachmentUploadingOverlay({ className, render, ...props }) {
	const { attachmentUploadingOverlay } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-attachment-uploading-overlay",
			className: attachmentUploadingOverlay({ className })
		}, props)
	});
}
function ComposerAttachmentUploadProgressBar({ className, render, value, ...props }) {
	const { attachmentUploadProgressBar, attachmentUploadProgressBarIndicator } = composerAttachment({ theme: useThemeFamily() });
	const progress = Math.max(4, Math.min(value, 100));
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"aria-hidden": true,
			"data-slot": "composer-attachment-upload-progress-bar",
			className: attachmentUploadProgressBar({ className }),
			children: /* @__PURE__ */ jsx("span", {
				"data-slot": "composer-attachment-upload-progress-bar-indicator",
				className: attachmentUploadProgressBarIndicator(),
				style: { width: `${progress}%` }
			})
		}, props)
	});
}
function ComposerAttachmentFailedOverlay({ className, render, ...props }) {
	const { attachmentFailedOverlay } = composerAttachment({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-attachment-failed-overlay",
			className: attachmentFailedOverlay({ className })
		}, props)
	});
}
function ComposerAttachmentRemove({ className, render, ...props }) {
	const { attachmentRemove } = composerAttachment({ theme: useThemeFamily() });
	const defaultProps = {
		type: "button",
		"data-slot": "composer-attachment-remove",
		className: attachmentRemove({ className })
	};
	return useRender({
		render: render ?? /* @__PURE__ */ jsx(Button$1, {}),
		props: mergeProps(defaultProps, props)
	});
}
//#endregion
//#region src/components/composer/composer-attachments-scroll-area.tsx
function ComposerAttachmentsScrollArea({ children, className, onMouseEnter, onMouseLeave, ...props }) {
	const theme = useThemeFamily();
	const { attachmentsScrollArea, attachmentsViewport } = composerAttachment({ theme });
	const prevNavClassName = composerAttachment({
		theme,
		side: "prev"
	}).attachmentsNav();
	const nextNavClassName = composerAttachment({
		theme,
		side: "next"
	}).attachmentsNav();
	const viewportRef = useRef(null);
	const [canPrev, setCanPrev] = useState(false);
	const [canNext, setCanNext] = useState(false);
	const updateScrollState = () => {
		const viewport = viewportRef.current;
		if (!viewport) return;
		const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;
		setCanPrev(viewport.scrollLeft > 1);
		setCanNext(maxScrollLeft - viewport.scrollLeft > 1);
	};
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport) return;
		updateScrollState();
		const resizeObserver = new ResizeObserver(updateScrollState);
		resizeObserver.observe(viewport);
		for (const child of viewport.children) resizeObserver.observe(child);
		const mutationObserver = new MutationObserver(() => {
			for (const child of viewport.children) resizeObserver.observe(child);
			updateScrollState();
		});
		mutationObserver.observe(viewport, { childList: true });
		viewport.addEventListener("scroll", updateScrollState, { passive: true });
		window.addEventListener("resize", updateScrollState);
		return () => {
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			viewport.removeEventListener("scroll", updateScrollState);
			window.removeEventListener("resize", updateScrollState);
		};
	}, []);
	const scrollByPage = (direction) => {
		const viewport = viewportRef.current;
		if (!viewport) return;
		const page = viewport.clientWidth;
		if (page <= 0) return;
		const target = Math.round(viewport.scrollLeft / page) * page + direction * page;
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		viewport.scrollTo({
			left: target,
			behavior: prefersReducedMotion ? "auto" : "smooth"
		});
	};
	const showPrev = canPrev;
	const showNext = canNext;
	const navVariant = theme === "brutal" ? "accent" : "default";
	return /* @__PURE__ */ jsxs("div", {
		"data-slot": "composer-attachments-scroll-area",
		className: attachmentsScrollArea({ className }),
		onMouseEnter,
		onMouseLeave,
		...props,
		children: [
			showPrev ? /* @__PURE__ */ jsx(Button, {
				type: "button",
				size: "icon-sm",
				variant: navVariant,
				"aria-label": "Scroll attachments left",
				className: prevNavClassName,
				onClick: () => scrollByPage(-1),
				children: /* @__PURE__ */ jsx(ChevronLeft, {})
			}) : null,
			/* @__PURE__ */ jsx("div", {
				ref: viewportRef,
				"data-slot": "composer-attachments-viewport",
				className: attachmentsViewport(),
				children
			}),
			showNext ? /* @__PURE__ */ jsx(Button, {
				type: "button",
				size: "icon-sm",
				variant: navVariant,
				"aria-label": "Scroll attachments right",
				className: nextNavClassName,
				onClick: () => scrollByPage(1),
				children: /* @__PURE__ */ jsx(ChevronRight, {})
			}) : null
		]
	});
}
//#endregion
//#region src/components/composer/sortable-composer-attachments.tsx
const SORTABLE_TRANSITION = {
	duration: 160,
	easing: "cubic-bezier(0.25, 1, 0.5, 1)"
};
/**
* Mixed-width flex-wrap cannot be predicted by rectSortingStrategy. Preview
* position by live DOM reorder on dragOver instead; strategy returns null so
* siblings are not shifted by incorrect transforms on top of that reflow.
* @see https://github.com/clauderic/dnd-kit/issues/44
*/
const liveReorderStrategy = () => null;
const restrictToHorizontalAxis = ({ transform }) => ({
	...transform,
	y: 0
});
/**
* Prefer pointer hits; if the active droppable is still under the pointer /
* closest center, keep it so layout reflow alone cannot claim a neighbor.
*/
const sortableCollisionDetection = (args) => {
	const pointerCollisions = pointerWithin(args);
	const collisions = pointerCollisions.length > 0 ? pointerCollisions : closestCenter(args);
	const self = collisions.find((collision) => collision.id === args.active.id);
	return self ? [self] : collisions;
};
function reorderItems(items, activeId, overId) {
	const oldIndex = items.indexOf(String(activeId));
	const newIndex = items.indexOf(String(overId));
	if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;
	return arrayMove([...items], oldIndex, newIndex);
}
function pointerFromDragEvent(event) {
	const { activatorEvent, delta } = event;
	if (!activatorEvent || !("clientX" in activatorEvent) || !("clientY" in activatorEvent) || typeof activatorEvent.clientX !== "number" || typeof activatorEvent.clientY !== "number") return null;
	return {
		x: activatorEvent.clientX + delta.x,
		y: activatorEvent.clientY + delta.y
	};
}
function samePointer(a, b, tolerance = .5) {
	return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}
/** Attachment tiles keyed by id; also the source of the DragOverlay ghost content. */
function attachmentsById(children) {
	const byId = /* @__PURE__ */ new Map();
	Children.forEach(children, (child) => {
		if (!isValidElement(child) || child.props.id == null) return;
		byId.set(String(child.props.id), child);
	});
	return byId;
}
function SortableComposerAttachmentsRoot({ items, onReorder, children, axis, strategy }) {
	const dndContextId = useId();
	const listRef = useRef(null);
	const [activeId, setActiveId] = useState(null);
	const [draftIds, setDraftIds] = useState([]);
	const [overlay, setOverlay] = useState(null);
	const [listMinHeight, setListMinHeight] = useState();
	const draftIdsRef = useRef([]);
	const lastReorderPointerRef = useRef(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 350,
		tolerance: 8
	} }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const attachments = useMemo(() => attachmentsById(children), [children]);
	const itemIds = useMemo(() => items.map(String), [items]);
	const horizontal = axis === "x";
	const displayIds = activeId !== null ? draftIds : itemIds;
	const orderedChildren = useMemo(() => displayIds.flatMap((id) => {
		const child = attachments.get(id);
		return child ? [child] : [];
	}), [attachments, displayIds]);
	const listClassName = horizontal ? "contents" : "flex w-full min-w-0 flex-wrap content-start items-start gap-2 py-1.5";
	const handleDragStart = useCallback(({ active }) => {
		const id = String(active.id);
		lastReorderPointerRef.current = null;
		const nextDraft = [...itemIds];
		draftIdsRef.current = nextDraft;
		setDraftIds(nextDraft);
		if (!horizontal && listRef.current) setListMinHeight(listRef.current.getBoundingClientRect().height);
		setActiveId(id);
		setOverlay(attachments.get(id)?.props.children ?? null);
	}, [
		attachments,
		horizontal,
		itemIds
	]);
	const handleDragOver = useCallback(({ active, over, activatorEvent, delta }) => {
		if (!over || active.id === over.id) return;
		const next = reorderItems(draftIdsRef.current, active.id, over.id);
		if (!next) return;
		const pointer = pointerFromDragEvent({
			activatorEvent,
			delta
		});
		if (pointer && lastReorderPointerRef.current && samePointer(pointer, lastReorderPointerRef.current)) return;
		if (pointer) lastReorderPointerRef.current = pointer;
		draftIdsRef.current = next;
		setDraftIds(next);
	}, []);
	const clearDrag = useCallback(() => {
		lastReorderPointerRef.current = null;
		draftIdsRef.current = [];
		setActiveId(null);
		setDraftIds([]);
		setOverlay(null);
		setListMinHeight(void 0);
	}, []);
	const handleDragCancel = useCallback(() => {
		clearDrag();
	}, [clearDrag]);
	const handleDragEnd = useCallback(() => {
		onReorder(draftIdsRef.current);
		clearDrag();
	}, [clearDrag, onReorder]);
	const modifiers = horizontal ? [restrictToHorizontalAxis] : void 0;
	return /* @__PURE__ */ jsxs(DndContext, {
		id: dndContextId,
		sensors,
		collisionDetection: sortableCollisionDetection,
		modifiers,
		autoScroll: horizontal ? {
			threshold: {
				x: .15,
				y: 0
			},
			canScroll: (element) => element.scrollWidth > element.clientWidth + 1
		} : false,
		onDragStart: handleDragStart,
		onDragOver: handleDragOver,
		onDragCancel: handleDragCancel,
		onDragEnd: handleDragEnd,
		children: [/* @__PURE__ */ jsx("div", {
			ref: listRef,
			"data-slot": "sortable-composer-attachments-list",
			className: listClassName,
			style: listMinHeight != null ? { minHeight: listMinHeight } : void 0,
			children: /* @__PURE__ */ jsx(SortableContext, {
				items: displayIds,
				strategy,
				children: orderedChildren
			})
		}), /* @__PURE__ */ jsx(DragOverlay, {
			dropAnimation: null,
			modifiers,
			children: activeId && overlay ? /* @__PURE__ */ jsx("div", {
				className: "w-max max-w-full shrink-0 cursor-grabbing",
				children: overlay
			}) : null
		})]
	});
}
/** Wrap / flex-pack attachment reorder (mixed widths). */
function SortableComposerAttachments(props) {
	return /* @__PURE__ */ jsx(SortableComposerAttachmentsRoot, {
		...props,
		axis: "xy",
		strategy: liveReorderStrategy
	});
}
/** Horizontal scroll strip reorder — wraps `ComposerAttachmentsScrollArea`. */
function SortableComposerAttachmentsScroll(props) {
	return /* @__PURE__ */ jsx(ComposerAttachmentsScrollArea, { children: /* @__PURE__ */ jsx(SortableComposerAttachmentsRoot, {
		...props,
		axis: "x",
		strategy: horizontalListSortingStrategy
	}) });
}
/**
* Sized placeholder stays in the flex flow (opacity 0). DragOverlay is the
* pointer ghost — the root reads these `children` for it. Live draft reorder
* moves this slot to the drop index; wrap skips strategy transforms so siblings
* FLIP via layout instead of wrong gaps.
*/
function SortableComposerAttachment({ id, label, children }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
		animateLayoutChanges: defaultAnimateLayoutChanges,
		transition: SORTABLE_TRANSITION
	});
	const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;
	const style = {
		transform: isDragging ? void 0 : CSS.Translate.toString(transform),
		transition: isDragging ? void 0 : transition,
		opacity: isDragging ? 0 : void 0,
		zIndex: isDragging ? 0 : void 0
	};
	return /* @__PURE__ */ jsx("div", {
		ref: setNodeRef,
		"aria-label": `Reorder ${label}`,
		className: "w-max max-w-full shrink-0 cursor-grab touch-none active:cursor-grabbing",
		"data-dragging": isDragging ? "true" : void 0,
		"data-slot": "sortable-composer-attachment",
		style,
		...sortableAttributes,
		...listeners,
		children
	});
}
//#endregion
//#region src/components/composer/composer-drop-overlay.recipe.ts
const composerDropOverlay = tv$1({
	slots: {
		dropOverlay: ["absolute inset-0 z-30 flex items-center justify-center border-2"],
		dropOverlayLabel: ["flex flex-col items-center gap-4 border-0 p-0", "text-center font-medium text-foreground-inverse dark:text-foreground-strong"],
		dropOverlayIconCluster: ["relative flex items-center justify-center"],
		dropOverlayIcon: ["bg-layer-panel shadow-raft-md ring-1 ring-line-muted dark:ring-transparent"]
	},
	variants: { theme: {
		brutal: {
			dropOverlay: "border-dashed border-black bg-layer-backdrop",
			dropOverlayLabel: "text-sm",
			dropOverlayIconCluster: "h-9 w-18",
			dropOverlayIcon: ["rounded-none p-1.5", "[&_svg]:size-3.5"]
		},
		elegant: {
			dropOverlay: ["-inset-1 rounded-xl border-0 bg-[oklch(0_0_0/0.4)]"],
			dropOverlayLabel: "text-base",
			dropOverlayIconCluster: "h-10 w-22",
			dropOverlayIcon: ["rounded-md p-2", "[&_svg]:size-4"]
		}
	} }
});
//#endregion
//#region src/components/composer/composer-drop-overlay.tsx
function ComposerDropOverlay({ className, render, ...props }) {
	const { dropOverlay } = composerDropOverlay({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-drop-overlay",
			className: dropOverlay({ className })
		}, props)
	});
}
function ComposerDropOverlayLabel({ className, render, ...props }) {
	const { dropOverlayLabel } = composerDropOverlay({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-drop-overlay-label",
			className: dropOverlayLabel({ className })
		}, props)
	});
}
function ComposerDropOverlayPrompt({ children, ...props }) {
	const { dropOverlayIcon, dropOverlayIconCluster } = composerDropOverlay({ theme: useThemeFamily() });
	if (children) return /* @__PURE__ */ jsx(ComposerDropOverlayLabel, {
		...props,
		children
	});
	return /* @__PURE__ */ jsxs(ComposerDropOverlayLabel, {
		...props,
		children: [/* @__PURE__ */ jsxs("span", {
			"aria-hidden": true,
			className: dropOverlayIconCluster(),
			children: [
				/* @__PURE__ */ jsx("span", {
					className: dropOverlayIcon({ className: "absolute -translate-x-6 translate-y-1 -rotate-12" }),
					children: /* @__PURE__ */ jsx(FileText, { className: "text-foreground-icon" })
				}),
				/* @__PURE__ */ jsx("span", {
					className: dropOverlayIcon({ className: "absolute z-10" }),
					children: /* @__PURE__ */ jsx(Upload, { className: "text-foreground-icon" })
				}),
				/* @__PURE__ */ jsx("span", {
					className: dropOverlayIcon({ className: "absolute z-20 translate-x-7 translate-y-1 rotate-12" }),
					children: /* @__PURE__ */ jsx(Image, { className: "text-foreground-icon" })
				})
			]
		}), /* @__PURE__ */ jsx("span", { children: "Drop files to attach" })]
	});
}
//#endregion
//#region src/components/composer/composer-suggestion-list.tsx
const composerSuggestionList = tv$1({
	slots: {
		root: "absolute inset-x-0 bottom-full w-auto overflow-y-auto",
		group: [],
		groupLabel: ["px-3 py-1.5"],
		item: ["flex w-full items-center gap-2 px-3 py-2 text-left"],
		content: ["flex min-w-0 flex-1 items-center gap-1.5 text-left", "[&>[data-slot=composer-suggestion-title]]:min-w-0"],
		icon: ["shrink-0"],
		title: ["truncate"],
		aside: ["ml-auto flex shrink-0 items-center"],
		meta: []
	},
	variants: {
		theme: {
			brutal: {
				root: "mb-2 max-h-48 border-2 border-black bg-white shadow-raft-md",
				groupLabel: "text-xs font-bold tracking-widest uppercase text-black/60",
				item: [
					"cursor-pointer text-sm font-medium text-black transition-colors",
					"data-[disabled=true]:cursor-not-allowed",
					"data-[highlighted=true]:bg-primary data-[highlighted=true]:font-bold",
					"hover:bg-primary/50",
					"data-[disabled=true]:text-black/50 data-[disabled=true]:hover:bg-black/5"
				],
				meta: "text-xs text-black/50"
			},
			elegant: {
				root: ["mb-1 max-h-[204px] overflow-x-hidden rounded-lg p-1 bg-layer-popover", "shadow-raft-sm ring-1 ring-ink-6 dark:ring-transparent"],
				group: "flex flex-col gap-0.5",
				groupLabel: ["mb-0.5 px-3 py-2", "text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45"],
				item: [
					"cursor-default gap-2.5 rounded-sm text-[13px] font-medium tracking-[-0.005em] text-foreground-muted",
					"transition-[background-color,color] duration-150",
					"hover:bg-ink-2 hover:text-foreground",
					"data-[highlighted=true]:bg-ink-4 data-[highlighted=true]:text-foreground",
					"data-[disabled=true]:pointer-events-none data-[disabled=true]:text-foreground-disabled"
				],
				meta: "text-xs text-foreground-placeholder"
			}
		},
		separated: {
			true: { group: "mt-1 pt-1" },
			false: {}
		},
		iconVariant: {
			avatar: {},
			framed: {},
			auxiliary: { icon: "-ml-1 size-3" }
		},
		metaVariant: {
			text: { meta: "truncate" },
			code: { meta: "shrink-0 font-mono" }
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			iconVariant: "framed",
			class: { icon: [
				"flex size-5 items-center justify-center border",
				"[&_svg]:size-3",
				"border-black bg-primary text-black"
			] }
		},
		{
			theme: "elegant",
			iconVariant: "framed",
			class: { icon: ["-mr-1 flex size-3.5 items-center justify-center", "text-foreground-icon [&_svg]:size-3.5"] }
		},
		{
			theme: "brutal",
			iconVariant: "auxiliary",
			class: { icon: "text-black/40" }
		},
		{
			theme: "brutal",
			metaVariant: "code",
			class: { meta: "text-black/40" }
		},
		{
			theme: "elegant",
			iconVariant: "auxiliary",
			class: { icon: "text-foreground-placeholder" }
		}
	],
	defaultVariants: {
		separated: false,
		iconVariant: "avatar",
		metaVariant: "text"
	}
});
function ComposerSuggestionList({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = composerSuggestionList({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-list",
			className: root({ className })
		}, props)
	});
}
function ComposerSuggestionGroup({ separated, className, render, ...props }) {
	const theme = useThemeFamily();
	const { group } = composerSuggestionList({
		theme,
		separated
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-group",
			className: group({ className })
		}, props)
	});
}
function ComposerSuggestionGroupLabel({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { groupLabel } = composerSuggestionList({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-group-label",
			className: groupLabel({ className })
		}, props)
	});
}
function ComposerSuggestionOption({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { item } = composerSuggestionList({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-option",
			className: item({ className }),
			role: "option"
		}, props)
	});
}
function ComposerSuggestionContent({ className, render, ...props }) {
	const { content } = composerSuggestionList();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-content",
			className: content({ className })
		}, props)
	});
}
function ComposerSuggestionIcon({ variant = "avatar", className, render, ...props }) {
	const theme = useThemeFamily();
	const { icon } = composerSuggestionList({
		theme,
		iconVariant: variant
	});
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-icon",
			className: icon({ className })
		}, props)
	});
}
function ComposerSuggestionTitle({ className, render, ...props }) {
	const { title } = composerSuggestionList();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-title",
			className: title({ className })
		}, props)
	});
}
function ComposerSuggestionAside({ className, render, ...props }) {
	const { aside } = composerSuggestionList();
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-aside",
			className: aside({ className })
		}, props)
	});
}
function ComposerSuggestionMeta({ variant = "text", className, render, ...props }) {
	const theme = useThemeFamily();
	const { meta } = composerSuggestionList({
		theme,
		metaVariant: variant
	});
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "composer-suggestion-meta",
			className: meta({ className })
		}, props)
	});
}
//#endregion
//#region src/components/composer/composer-root.tsx
const composerRoot = tv$1({
	base: ["relative flex w-full flex-col"],
	variants: { theme: {
		brutal: "gap-2",
		elegant: [
			"gap-1.5",
			"has-[>[data-slot=composer-attachments]]:relative",
			"has-[>[data-slot=composer-attachments]]:isolate",
			"has-[>[data-slot=composer-attachments]]:before:pointer-events-none",
			"has-[>[data-slot=composer-attachments]]:before:absolute",
			"has-[>[data-slot=composer-attachments]]:before:-inset-1",
			"has-[>[data-slot=composer-attachments]]:before:-z-10",
			"has-[>[data-slot=composer-attachments]]:before:rounded-xl",
			"has-[>[data-slot=composer-attachments]]:before:bg-layer-inset",
			"has-[>[data-slot=composer-attachments]]:before:ring-1",
			"has-[>[data-slot=composer-attachments]]:before:ring-line-muted/60"
		]
	} }
});
function ComposerRoot({ className, render, ...props }) {
	const theme = useThemeFamily();
	return useRender({
		defaultTagName: "form",
		render,
		props: mergeProps({
			"data-slot": "composer-root",
			className: composerRoot({
				theme,
				className
			})
		}, props)
	});
}
//#endregion
//#region src/components/composer/composer-toolbar-label.tsx
const composerToolbarLabel = tv$1({
	slots: { root: ["inline-flex cursor-pointer select-none items-center gap-1.5 text-xs"] },
	variants: { theme: {
		brutal: { root: "font-bold text-foreground-strong/60" },
		elegant: { root: ["min-h-8 rounded-md border-0 bg-transparent px-2.5 py-1.5 font-medium text-foreground-muted", "transition-colors hover:bg-fill-muted"] }
	} }
});
function ComposerToolbarLabel({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = composerToolbarLabel({ theme });
	return useRender({
		defaultTagName: "label",
		render,
		props: mergeProps({
			"data-slot": "composer-toolbar-label",
			className: root({ className })
		}, props)
	});
}
//#endregion
//#region src/components/composer/use-composer-suggestions.ts
function findNextEnabledIndex(items, current, direction, isItemDisabled) {
	if (items.length === 0) return -1;
	const start = current >= 0 ? current : direction === 1 ? -1 : 0;
	for (let offset = 1; offset <= items.length; offset += 1) {
		const index = (start + direction * offset + items.length) % items.length;
		if (!isItemDisabled(items[index])) return index;
	}
	return -1;
}
function normalizeHighlightedIndex(items, highlightedIndex, isItemDisabled) {
	const highlightedItem = items[highlightedIndex];
	if (highlightedItem !== void 0 && !isItemDisabled(highlightedItem)) return highlightedIndex;
	return findNextEnabledIndex(items, -1, 1, isItemDisabled);
}
/**
* Headless behavior for an inline trigger-driven suggestion popup (@mention, #channel)
* layered over a composer textarea. Owns open state, highlighted option, keyboard
* navigation, IME guarding, and caret-preserving insertion. The consumer supplies
* trigger detection, item data, insertion text, and textarea/listbox option semantics.
*/
function useComposerSuggestions({ value, onValueChange, detectTrigger, getItems, getItemText, isItemDisabled = () => false }) {
	const listId = `composer-suggestions-${useId()}`;
	const inputRef = useRef(null);
	const listRef = useRef(null);
	const composingRef = useRef(false);
	const frameRef = useRef(null);
	const caretRef = useRef(value.length);
	const [interaction, setInteraction] = useState(() => {
		const initialMatch = detectTrigger(value);
		return {
			highlightedIndex: initialMatch ? findNextEnabledIndex(getItems(initialMatch), -1, 1, isItemDisabled) : -1,
			match: initialMatch,
			value
		};
	});
	const match = interaction.value === value ? interaction.match : null;
	const items = match ? getItems(match) : [];
	const highlightedIndex = normalizeHighlightedIndex(items, interaction.highlightedIndex, isItemDisabled);
	const hasActiveItem = highlightedIndex >= 0 && highlightedIndex < items.length;
	const activeItem = hasActiveItem ? items[highlightedIndex] : void 0;
	const open = Boolean(match && items.length > 0);
	const syncTrigger = (nextValue, caret) => {
		const nextMatch = detectTrigger(nextValue.slice(0, caret));
		setInteraction({
			highlightedIndex: nextMatch ? findNextEnabledIndex(getItems(nextMatch), -1, 1, isItemDisabled) : -1,
			match: nextMatch,
			value: nextValue
		});
	};
	const commit = (nextValue, caret) => {
		onValueChange(nextValue);
		setInteraction({
			highlightedIndex: -1,
			match: null,
			value: nextValue
		});
		caretRef.current = caret;
		if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
		frameRef.current = requestAnimationFrame(() => {
			inputRef.current?.focus({ preventScroll: true });
			inputRef.current?.setSelectionRange(caret, caret);
			frameRef.current = null;
		});
	};
	const select = (item) => {
		if (!match || isItemDisabled(item)) return;
		const caret = interaction.value === value ? caretRef.current : value.length;
		const insertion = getItemText(item);
		const nextValue = `${value.slice(0, match.start)}${insertion}${value.slice(caret)}`;
		commit(nextValue, match.start + insertion.length);
	};
	const insert = (text) => {
		const caret = interaction.value === value ? caretRef.current : value.length;
		const nextValue = `${value.slice(0, caret)}${text}${value.slice(caret)}`;
		commit(nextValue, caret + text.length);
	};
	const clear = () => {
		onValueChange("");
		setInteraction({
			highlightedIndex: -1,
			match: null,
			value: ""
		});
		caretRef.current = 0;
	};
	const handleChange = (event) => {
		caretRef.current = event.currentTarget.selectionStart ?? 0;
		onValueChange(event.currentTarget.value);
		syncTrigger(event.currentTarget.value, caretRef.current);
	};
	const handleSelect = (event) => {
		caretRef.current = event.currentTarget.selectionStart ?? 0;
		syncTrigger(event.currentTarget.value, caretRef.current);
	};
	const handleCompositionEnd = (event) => {
		composingRef.current = false;
		caretRef.current = event.currentTarget.selectionStart ?? 0;
		syncTrigger(event.currentTarget.value, caretRef.current);
	};
	const handleBlur = (event) => {
		const nextTarget = event.relatedTarget;
		if (nextTarget instanceof Node && listRef.current?.contains(nextTarget)) return;
		setInteraction({
			highlightedIndex: -1,
			match: null,
			value
		});
	};
	const handleKeyDown = (event) => {
		if (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
		if (event.key === "Escape" && open) {
			event.preventDefault();
			setInteraction({
				highlightedIndex: -1,
				match: null,
				value
			});
			return;
		}
		if (!open) return;
		if (event.key === "Enter" && !event.shiftKey && !hasActiveItem) {
			event.preventDefault();
			return;
		}
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			setInteraction({
				highlightedIndex: findNextEnabledIndex(items, highlightedIndex, event.key === "ArrowDown" ? 1 : -1, isItemDisabled),
				match,
				value
			});
			return;
		}
		if ((event.key === "Tab" || event.key === "Enter" && !event.shiftKey) && hasActiveItem && activeItem !== void 0 && !isItemDisabled(activeItem)) {
			event.preventDefault();
			select(activeItem);
		}
	};
	useEffect(() => {
		if (!open || highlightedIndex < 0) return;
		const list = listRef.current;
		const option = list?.querySelector(`[data-composer-suggestion-index="${highlightedIndex}"]`);
		if (!list || !option) return;
		const listRect = list.getBoundingClientRect();
		const optionRect = option.getBoundingClientRect();
		if (optionRect.top < listRect.top || optionRect.bottom > listRect.bottom) option.scrollIntoView({ block: "nearest" });
	}, [highlightedIndex, open]);
	useEffect(() => () => {
		if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
	}, []);
	const getInputProps = (props = {}) => mergeProps(props, {
		"aria-activedescendant": open && highlightedIndex >= 0 ? `${listId}-option-${highlightedIndex}` : void 0,
		"aria-autocomplete": "list",
		"aria-controls": open ? listId : void 0,
		ref: inputRef,
		value,
		onBlur: handleBlur,
		onChange: handleChange,
		onCompositionEnd: handleCompositionEnd,
		onCompositionStart: () => {
			composingRef.current = true;
		},
		onKeyDown: handleKeyDown,
		onSelect: handleSelect
	});
	const getListProps = (props) => mergeProps(props, {
		id: listId,
		ref: listRef,
		role: "listbox"
	});
	const getOptionProps = (item, index, props = {}) => {
		const highlighted = index === highlightedIndex;
		return mergeProps(props, {
			"aria-disabled": isItemDisabled(item),
			"aria-selected": highlighted,
			"data-disabled": isItemDisabled(item),
			"data-composer-suggestion-index": index,
			"data-highlighted": highlighted,
			id: `${listId}-option-${index}`,
			role: "option",
			onClick: () => select(item),
			onPointerDown: (event) => {
				event.preventDefault();
			}
		});
	};
	return {
		open,
		items,
		highlightedIndex,
		activeItem,
		inputRef,
		listRef,
		getInputProps,
		getListProps,
		getOptionProps,
		select,
		insert,
		clear
	};
}
//#endregion
//#region src/components/skeleton/skeleton.tsx
const skeleton = tv$1({
	slots: { root: ["animate-pulse", "pointer-events-none"] },
	variants: {
		theme: {
			brutal: { root: ["data-[variant=line]:bg-ink-10", "data-[variant=block]:bg-ink-10"] },
			elegant: { root: ["data-[variant=line]:rounded-full data-[variant=line]:bg-foreground-strong/8", "data-[variant=block]:rounded-md data-[variant=block]:bg-foreground-strong/8"] }
		},
		variant: {
			line: { root: "h-3" },
			block: { root: "" },
			circle: { root: "rounded-full" }
		}
	},
	compoundVariants: [{
		theme: "brutal",
		variant: "circle",
		class: { root: "bg-ink-10" }
	}, {
		theme: "elegant",
		variant: "circle",
		class: { root: "bg-foreground-strong/8" }
	}],
	defaultVariants: { variant: "block" }
});
function Skeleton({ variant = "block", className, ...props }) {
	const theme = useThemeFamily();
	const { root } = skeleton({
		theme,
		variant
	});
	return /* @__PURE__ */ jsx("div", {
		"aria-hidden": "true",
		"data-slot": "skeleton",
		"data-variant": variant,
		className: root({ className }),
		...props
	});
}
//#endregion
//#region src/components/banner/banner.tsx
const banner = tv$1({
	slots: {
		root: [
			"group/banner grid gap-y-0",
			"[&>svg]:col-start-1 [&>svg]:shrink-0",
			"*:data-[slot=status]:col-start-1 *:data-[slot=status]:row-start-1 *:data-[slot=status]:self-center"
		],
		title: ["min-w-0 text-foreground"],
		description: ["min-w-0 font-normal"],
		action: ["shrink-0 self-start"]
	},
	variants: {
		theme: {
			brutal: {
				root: [
					"grid-cols-[0_minmax(0,1fr)] items-center border-2 border-line-strong",
					"has-[>[data-slot=banner-action]]:grid-cols-[0_minmax(0,1fr)_auto]",
					"has-[>svg]:grid-cols-[18px_minmax(0,1fr)]",
					"has-[>[data-slot=status]]:grid-cols-[auto_minmax(0,1fr)]",
					"[&:has(>svg):has(>[data-slot=banner-action])]:grid-cols-[18px_minmax(0,1fr)_auto]",
					"[&:has(>[data-slot=status]):has(>[data-slot=banner-action])]:grid-cols-[auto_minmax(0,1fr)_auto]",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:items-start",
					"[&>svg]:size-4.5 [&>svg]:self-center [&>svg]:text-foreground",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:[&>svg]:row-span-2",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:[&>svg]:mt-0.5",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:[&>svg]:self-start",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:*:data-[slot=status]:row-span-2",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:*:data-[slot=banner-action]:row-span-2"
				],
				title: ["col-start-2 row-start-1 mb-0.5 text-sm font-bold", "group-data-[size=sm]/banner:text-xs"],
				description: [
					"col-start-2 row-start-1 text-sm leading-5 text-foreground",
					"group-has-[>[data-slot=banner-title]]/banner:row-start-2",
					"group-data-[size=sm]/banner:text-xs group-data-[size=sm]/banner:leading-4"
				],
				action: ["col-start-3 row-start-1 flex items-center"]
			},
			elegant: {
				root: [
					"w-full grid-cols-[minmax(0,1fr)] items-center gap-x-2 rounded-sm border-0",
					"text-[13px] leading-5 tracking-[-0.005em] text-foreground",
					"has-[>svg]:grid-cols-[auto_minmax(0,1fr)]",
					"has-[>[data-slot=status]]:grid-cols-[auto_minmax(0,1fr)]",
					"has-[>[data-slot=banner-action]]:grid-cols-[minmax(0,1fr)_auto]",
					"has-[>svg]:has-[>[data-slot=banner-action]]:grid-cols-[auto_minmax(0,1fr)_auto]",
					"has-[>[data-slot=status]]:has-[>[data-slot=banner-action]]:grid-cols-[auto_minmax(0,1fr)_auto]",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:items-start",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:grid-rows-[auto_auto]",
					"has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:gap-y-1",
					"[&>svg]:row-start-1 [&>svg]:size-4 [&>svg]:self-center"
				],
				title: [
					"col-start-1 row-start-1 flex min-h-5 items-center text-[13.5px] font-medium leading-5",
					"group-has-[>svg]/banner:col-start-2",
					"group-has-[>[data-slot=status]]/banner:col-start-2",
					"group-data-[size=sm]/banner:min-h-4 group-data-[size=sm]/banner:text-[13px] group-data-[size=sm]/banner:leading-4",
					"group-data-[size=lg]/banner:min-h-6 group-data-[size=lg]/banner:text-[14.5px] group-data-[size=lg]/banner:leading-6",
					"group-data-[status=warning]/banner:text-[oklch(0.476_0.114_61.907)] dark:group-data-[status=warning]/banner:text-[oklch(0.82_0.12_61.907)]"
				],
				description: [
					"col-start-1 row-start-1 leading-4 text-foreground-muted",
					"group-has-[>svg]/banner:col-start-2",
					"group-has-[>[data-slot=status]]/banner:col-start-2",
					"group-has-[>[data-slot=banner-title]]/banner:row-start-2",
					"group-data-[size=sm]/banner:text-xs group-data-[size=sm]/banner:leading-4",
					"group-data-[size=lg]/banner:text-sm group-data-[size=lg]/banner:leading-5",
					"group-data-[status=warning]/banner:text-[oklch(0.476_0.114_61.907)] dark:group-data-[status=warning]/banner:text-[oklch(0.82_0.12_61.907)]"
				],
				action: [
					"col-start-2 row-start-1 flex min-h-5 items-center gap-2",
					"group-has-[>svg]/banner:col-start-3",
					"group-has-[>[data-slot=status]]/banner:col-start-3",
					"group-has-[>[data-slot=banner-title]+[data-slot=banner-description]]/banner:row-span-2",
					"[&>button:has(svg):last-child]:size-5 [&>button:has(svg):last-child]:min-h-5 [&>button:has(svg):last-child]:min-w-5",
					"[&>button:has(svg):last-child]:rounded-sm",
					"[&>button:has(svg):last-child]:border-transparent [&>button:has(svg):last-child]:bg-transparent [&>button:has(svg):last-child]:shadow-none",
					"[&>button:has(svg):last-child]:before:bg-transparent",
					"[&>button:has(svg):last-child]:text-current/45",
					"[&>button:has(svg):last-child]:transition-colors [&>button:has(svg):last-child]:duration-200",
					"[&>button:has(svg):last-child]:hover:border-transparent [&>button:has(svg):last-child]:hover:bg-foreground-strong/5",
					"[&>button:has(svg):last-child]:hover:text-current/70",
					"[&>button:has(svg):last-child>svg]:size-4",
					"group-data-[size=sm]/banner:min-h-4 group-data-[size=sm]/banner:[&>button:has(svg):last-child]:size-4",
					"group-data-[size=sm]/banner:[&>button:has(svg):last-child]:min-h-4 group-data-[size=sm]/banner:[&>button:has(svg):last-child]:min-w-4",
					"group-data-[size=sm]/banner:[&>button:has(svg):last-child>svg]:size-3",
					"group-data-[size=lg]/banner:min-h-6 group-data-[size=lg]/banner:[&>button:has(svg):last-child]:size-6",
					"group-data-[size=lg]/banner:[&>button:has(svg):last-child]:min-h-6 group-data-[size=lg]/banner:[&>button:has(svg):last-child]:min-w-6"
				]
			}
		},
		status: {
			default: {},
			destructive: {},
			warning: {},
			info: {},
			success: {}
		},
		size: {
			sm: {},
			md: {},
			lg: {}
		}
	},
	defaultVariants: { size: "md" },
	compoundVariants: [
		{
			theme: "brutal",
			status: "default",
			class: { root: "bg-layer-panel" }
		},
		{
			theme: "brutal",
			status: "destructive",
			class: { root: "bg-danger-soft" }
		},
		{
			theme: "brutal",
			status: "warning",
			class: { root: "bg-(--color-brutal-yellow-100)" }
		},
		{
			theme: "brutal",
			status: "info",
			class: { root: "bg-info-soft" }
		},
		{
			theme: "brutal",
			status: "success",
			class: { root: "bg-(--color-brutal-lime-100)" }
		},
		{
			theme: "brutal",
			size: "sm",
			class: { root: "p-2 has-[>svg]:gap-x-2 has-[>[data-slot=banner-action]]:gap-x-2 has-[>[data-slot=status]]:gap-x-1.5" }
		},
		{
			theme: "brutal",
			size: "md",
			class: { root: "p-3 has-[>svg]:gap-x-3 has-[>[data-slot=banner-action]]:gap-x-3 has-[>[data-slot=status]]:gap-x-2" }
		},
		{
			theme: "brutal",
			size: "lg",
			class: { root: "p-4 shadow-raft-sm has-[>svg]:gap-x-3 has-[>[data-slot=banner-action]]:gap-x-3 has-[>[data-slot=status]]:gap-x-2" }
		},
		{
			theme: "elegant",
			status: "default",
			class: { root: "bg-fill-muted [&>svg]:text-foreground-muted" }
		},
		{
			theme: "elegant",
			status: "success",
			class: { root: "bg-[oklch(0.94_0.035_153.079)] dark:bg-[oklch(0.5_0.12_153/0.18)] [&>svg]:text-success" }
		},
		{
			theme: "elegant",
			status: "warning",
			class: { root: "bg-[oklch(0.973_0.071_103.193)] text-[oklch(0.476_0.114_61.907)] [&>svg]:text-[oklch(0.476_0.114_61.907)] dark:bg-[oklch(0.52_0.09_103.193/0.18)] dark:text-[oklch(0.82_0.12_61.907)] dark:[&>svg]:text-[oklch(0.82_0.12_61.907)]" }
		},
		{
			theme: "elegant",
			status: "info",
			class: { root: "bg-info-soft [&>svg]:text-[oklch(0.55_0.11_220)] dark:[&>svg]:text-[oklch(0.8_0.1_220)]" }
		},
		{
			theme: "elegant",
			status: "destructive",
			class: { root: "bg-danger-soft [&>svg]:text-danger" }
		},
		{
			theme: "elegant",
			size: "sm",
			class: { root: "py-2.5 pl-2.5 pr-2 text-xs leading-4 [&>svg]:size-3.5" }
		},
		{
			theme: "elegant",
			size: "md",
			class: { root: "px-3 py-3" }
		},
		{
			theme: "elegant",
			size: "lg",
			class: { root: "gap-x-2 px-3.5 py-3 text-sm leading-5 [&>svg]:size-4.5" }
		}
	]
});
function Banner({ status, size = "md", className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = banner({
		theme,
		status,
		size
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			className: root({ className }),
			role: "alert"
		}, props),
		state: {
			slot: "banner",
			size,
			status
		}
	});
}
function BannerTitle({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { title } = banner({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: title({ className }) }, props),
		state: { slot: "banner-title" }
	});
}
function BannerDescription({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { description } = banner({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: description({ className }) }, props),
		state: { slot: "banner-description" }
	});
}
function BannerAction({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { action } = banner({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: action({ className }) }, props),
		state: { slot: "banner-action" }
	});
}
//#endregion
//#region src/components/empty-state/empty-state.tsx
const emptyState = tv$1({
	slots: {
		root: ["flex w-full min-w-0 flex-col items-center justify-center px-6 py-12 text-center"],
		content: [
			"flex w-full max-w-sm min-w-0 flex-col items-center gap-2 text-center",
			"[&>[data-slot=empty-state-icon]]:mb-0",
			"[&>[data-slot=empty-state-title]]:mb-0"
		],
		icon: ["mb-4 inline-flex items-center justify-center [&_svg]:shrink-0"],
		title: ["mb-2 w-full max-w-full text-center text-balance font-heading text-lg font-semibold"],
		description: ["mx-auto w-full max-w-[32ch] text-center text-sm leading-relaxed text-pretty", "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground"],
		actions: ["mt-5"]
	},
	variants: { theme: {
		brutal: {
			icon: "text-foreground-muted [&_svg]:size-9",
			title: "text-foreground-strong/60",
			description: "text-foreground-strong/60"
		},
		elegant: {
			icon: [
				"rounded-md bg-fill-muted p-2 text-foreground-placeholder [&_svg]:size-4.5",
				"dark:bg-layer-inset",
				"dark:shadow-[inset_0_1px_1.5px_oklch(0_0_0/0.3),0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(0.985_0.004_106.42/0.04)]"
			],
			title: "text-sm font-medium text-foreground dark:text-foreground-muted",
			description: "text-foreground-muted"
		}
	} }
});
function EmptyState({ render, className, ...props }) {
	const { root } = emptyState();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "empty-state",
			className: root({ className })
		}, props),
		state: { slot: "empty-state" }
	});
}
function EmptyStateContent({ render, className, ...props }) {
	const { content } = emptyState();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "empty-state-content",
			className: content({ className })
		}, props),
		state: { slot: "empty-state-content" }
	});
}
function EmptyStateIcon({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { icon } = emptyState({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "empty-state-icon",
			className: icon({ className })
		}, props),
		state: { slot: "empty-state-icon" }
	});
}
function EmptyStateTitle({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { title } = emptyState({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "empty-state-title",
			className: title({ className })
		}, props),
		state: { slot: "empty-state-title" }
	});
}
function EmptyStateDescription({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { description } = emptyState({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "empty-state-description",
			className: description({ className })
		}, props),
		state: { slot: "empty-state-description" }
	});
}
function EmptyStateActions({ render, className, ...props }) {
	const { actions } = emptyState();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "empty-state-actions",
			className: actions({ className })
		}, props),
		state: { slot: "empty-state-actions" }
	});
}
//#endregion
//#region src/components/notification-center/notification-center.tsx
const notificationCenter = tv$1({
	slots: {
		trigger: [],
		triggerIcon: [],
		triggerBell: [],
		triggerBellGlow: [],
		triggerDot: [],
		popup: ["flex flex-col overflow-hidden bg-layer-panel"],
		header: ["flex items-center gap-2 px-4 py-2"],
		title: ["text-xs"],
		count: ["ml-auto text-xs"],
		scroller: ["min-h-0 flex-1 overflow-y-auto overscroll-contain"],
		list: ["divide-y"],
		item: ["px-4 py-4"],
		itemRow: ["flex items-start"],
		itemIcon: ["mt-0.5 flex size-6 shrink-0 items-center justify-center", "[&_svg]:size-4"],
		itemContent: ["min-w-0 flex-1"],
		itemTitle: ["wrap-break-word text-sm text-foreground"],
		itemBody: ["mt-0.5 wrap-break-word text-sm"],
		itemActions: ["mt-3 ml-auto flex items-center justify-end gap-2"],
		actionButton: []
	},
	variants: {
		theme: {
			brutal: {
				trigger: [
					"relative inline-flex size-9 items-center justify-center overflow-visible rounded-none border-2 border-line-strong bg-brutal-orange p-0 text-foreground",
					"select-none shadow-raft-sm transition-all duration-100 hover:bg-brutal-orange hover:shadow-raft-md",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-strong",
					"[&>svg]:size-4.5 [&>svg]:shrink-0"
				],
				popup: ["border-2 border-line-strong bg-layer-panel shadow-raft-lg"],
				header: ["border-b-2 border-line-strong bg-brutal-cream"],
				title: ["font-bold uppercase tracking-widest text-foreground-strong/60"],
				count: ["font-mono text-foreground-strong/40"],
				list: ["divide-y-2 divide-line-strong"],
				itemRow: ["gap-2"],
				itemIcon: ["border-2 border-line-strong [&_svg]:text-foreground"],
				itemTitle: ["font-bold"],
				actionButton: []
			},
			elegant: {
				trigger: [
					"relative inline-flex size-auto min-w-9 items-center justify-center overflow-visible rounded-md border border-transparent p-3",
					"text-[13px] text-foreground-icon [&_svg]:size-4 [&_svg]:shrink-0",
					"select-none transition-colors",
					"hover:bg-fill-strong/80 hover:text-foreground-strong",
					"active:bg-fill-strong/80 active:text-foreground-strong",
					"focus-visible:outline-none focus-visible:ring-[0.5px] focus-visible:ring-primary-500"
				],
				triggerIcon: ["relative inline-flex size-4 items-center justify-center"],
				triggerBell: ["size-4 shrink-0 text-current"],
				triggerBellGlow: [
					"pointer-events-none absolute inset-0 size-4 shrink-0",
					"text-[oklch(73.4%_0.149_89.2)]",
					"drop-shadow-[0_0_1px_oklch(0.87_0.16_92/0.82)]",
					"mask-[radial-gradient(circle_at_96%_12%,black_0%,black_24%,oklch(0_0_0/0.82)_38%,oklch(0_0_0/0.38)_58%,transparent_74%)]"
				],
				triggerDot: ["pointer-events-none absolute top-2.5 right-2.5"],
				popup: ["rounded-md bg-layer-popover", "shadow-raft-lg"],
				header: ["border-b border-line-hairline bg-layer-panel pt-2.5", "dark:bg-transparent"],
				scroller: ["bg-layer-panel", "dark:bg-transparent"],
				title: ["text-sm font-medium normal-case tracking-normal text-foreground"],
				count: ["font-sans text-[11px] font-medium text-foreground-placeholder"],
				list: ["divide-line-hairline"],
				itemRow: ["gap-2.5"],
				itemIcon: ["rounded-sm border border-transparent"],
				itemTitle: ["font-medium"],
				itemBody: ["text-foreground-muted"],
				actionButton: ["py-0.5"]
			}
		},
		viewport: {
			desktop: { popup: "w-[380px]" },
			mobile: { popup: "w-[min(92vw,360px)]" }
		},
		size: {
			sm: { popup: "h-56" },
			md: { popup: "h-72" },
			lg: { popup: "h-96" }
		},
		read: {
			true: { item: "opacity-70" },
			false: { item: "" }
		},
		status: {
			error: {},
			warning: {},
			info: {},
			success: {}
		},
		actionVariant: {
			primary: {},
			secondary: {}
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			actionVariant: "primary",
			class: { actionButton: "bg-brutal-pink hover:bg-brutal-pink" }
		},
		{
			theme: "brutal",
			status: "error",
			class: { itemIcon: "bg-brutal-orange" }
		},
		{
			theme: "brutal",
			status: "warning",
			class: { itemIcon: "bg-brutal-orange" }
		},
		{
			theme: "brutal",
			status: "info",
			class: { itemIcon: "bg-brutal-yellow" }
		},
		{
			theme: "brutal",
			status: "success",
			class: { itemIcon: "bg-brutal-lime" }
		},
		{
			theme: "elegant",
			status: "error",
			class: { itemIcon: "bg-danger/80 text-danger-strong dark:bg-danger-muted" }
		},
		{
			theme: "elegant",
			status: "warning",
			class: { itemIcon: "bg-warning/80 text-warning-strong dark:bg-warning-muted" }
		},
		{
			theme: "elegant",
			status: "info",
			class: { itemIcon: "bg-info/80 text-info-strong dark:bg-info-muted" }
		},
		{
			theme: "elegant",
			status: "success",
			class: { itemIcon: "bg-success/80 text-success-strong dark:bg-success-muted" }
		}
	],
	defaultVariants: {
		viewport: "desktop",
		size: "md",
		read: false,
		status: "info",
		actionVariant: "secondary"
	}
});
function NotificationCenter({ modal = false, ...props }) {
	return /* @__PURE__ */ jsx(Popover$1.Root, {
		modal,
		...props
	});
}
function NotificationCenterTriggerContent() {
	const theme = useThemeFamily();
	const { triggerIcon, triggerBell, triggerBellGlow, triggerDot } = notificationCenter({ theme });
	if (theme === "brutal") return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(AlertTriangle, {
		"aria-hidden": true,
		className: "size-4.5"
	}), /* @__PURE__ */ jsx(Status, {
		"aria-hidden": true,
		variant: "warning",
		size: "md",
		className: "pointer-events-none absolute -top-1 -right-1 [--status-color:var(--color-brutal-orange)]"
	})] });
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsxs("span", {
		"aria-hidden": true,
		className: triggerIcon(),
		children: [/* @__PURE__ */ jsx(Bell, {
			className: triggerBell(),
			strokeWidth: 2
		}), /* @__PURE__ */ jsx(Bell, {
			className: triggerBellGlow(),
			strokeWidth: 2
		})]
	}), /* @__PURE__ */ jsx(Status, {
		"aria-hidden": true,
		variant: "primary",
		size: "sm",
		attention: true,
		className: triggerDot()
	})] });
}
function NotificationCenterTrigger({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { trigger } = notificationCenter({ theme });
	return /* @__PURE__ */ jsx(Popover$1.Trigger, {
		"data-slot": "notification-center-trigger",
		className: trigger({ className }),
		...props,
		children: children ?? /* @__PURE__ */ jsx(NotificationCenterTriggerContent, {})
	});
}
function NotificationCenterPortal(props) {
	return /* @__PURE__ */ jsx(Popover$1.Portal, { ...useThemeScopeProps(props) });
}
function NotificationCenterPopup({ viewport = "desktop", size = "md", className, initialFocus = false, align = "center", alignOffset = 0, anchor, arrowPadding, collisionAvoidance, collisionBoundary, collisionPadding, disableAnchorTracking = true, positionMethod = "fixed", side = "bottom", sideOffset = 4, sticky, portalProps, ...props }) {
	const theme = useThemeFamily();
	const { popup } = notificationCenter({
		theme,
		viewport,
		size
	});
	return /* @__PURE__ */ jsx(NotificationCenterPortal, {
		...portalProps,
		children: /* @__PURE__ */ jsx(Popover$1.Positioner, {
			align,
			alignOffset,
			anchor,
			arrowPadding,
			collisionAvoidance,
			collisionBoundary,
			collisionPadding,
			disableAnchorTracking,
			positionMethod,
			side,
			sideOffset,
			sticky,
			className: "isolate z-50 outline-none",
			children: /* @__PURE__ */ jsx(Popover$1.Popup, {
				"aria-label": props["aria-label"] ?? "Notification center",
				"data-slot": "notification-center-popup",
				"data-size": size,
				"data-viewport": viewport,
				initialFocus,
				className: popup({ className }),
				...props
			})
		})
	});
}
function NotificationCenterHeader({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { header } = notificationCenter({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: header({ className }) }, props),
		state: { slot: "notification-center-header" }
	});
}
function NotificationCenterTitle({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { title } = notificationCenter({ theme });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: title({ className }) }, props),
		state: { slot: "notification-center-title" }
	});
}
function NotificationCenterCount({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { count } = notificationCenter({ theme });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({ className: count({ className }) }, props),
		state: { slot: "notification-center-count" }
	});
}
function NotificationCenterScroller({ render, className, ...props }) {
	const { scroller } = notificationCenter();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: scroller({ className }) }, props),
		state: { slot: "notification-center-scroller" }
	});
}
function NotificationCenterList({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { list } = notificationCenter({ theme });
	return useRender({
		defaultTagName: "ul",
		render,
		props: mergeProps({
			"aria-label": "Notifications",
			className: list({ className })
		}, props),
		state: { slot: "notification-center-list" }
	});
}
function NotificationCenterItem({ read = false, render, className, ...props }) {
	const theme = useThemeFamily();
	const { item } = notificationCenter({
		theme,
		read
	});
	return useRender({
		defaultTagName: "li",
		render,
		props: mergeProps({ className: item({ className }) }, props),
		state: {
			slot: "notification-center-item",
			read
		}
	});
}
function NotificationCenterItemRow({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { itemRow } = notificationCenter({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: itemRow({ className }) }, props),
		state: { slot: "notification-center-item-row" }
	});
}
const STATUS_LABEL = {
	error: "Error",
	warning: "Warning",
	info: "Info",
	success: "Success"
};
const DEFAULT_STATUS_ICON = {
	error: /* @__PURE__ */ jsx(AlertTriangle, {}),
	warning: /* @__PURE__ */ jsx(AlertTriangle, {}),
	info: /* @__PURE__ */ jsx(Info, {}),
	success: /* @__PURE__ */ jsx(CheckCircle2, {})
};
function NotificationCenterItemIcon({ status = "info", render, className, children, ...props }) {
	const theme = useThemeFamily();
	const { itemIcon } = notificationCenter({
		theme,
		status
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"aria-label": STATUS_LABEL[status],
			className: itemIcon({ className }),
			children: children ?? DEFAULT_STATUS_ICON[status]
		}, props),
		state: {
			slot: "notification-center-item-icon",
			status
		}
	});
}
function NotificationCenterItemContent({ render, className, ...props }) {
	const { itemContent } = notificationCenter();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: itemContent({ className }) }, props),
		state: { slot: "notification-center-item-content" }
	});
}
function NotificationCenterItemTitle({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { itemTitle } = notificationCenter({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: itemTitle({ className }) }, props),
		state: { slot: "notification-center-item-title" }
	});
}
function NotificationCenterItemBody({ render, className, ...props }) {
	const theme = useThemeFamily();
	const { itemBody } = notificationCenter({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: itemBody({ className }) }, props),
		state: { slot: "notification-center-item-body" }
	});
}
function NotificationCenterItemActions({ render, className, ...props }) {
	const { itemActions } = notificationCenter();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({ className: itemActions({ className }) }, props),
		state: { slot: "notification-center-item-actions" }
	});
}
function NotificationCenterActionButton({ variant = "secondary", className, ...props }) {
	const theme = useThemeFamily();
	const { actionButton } = notificationCenter({
		theme,
		actionVariant: variant
	});
	return /* @__PURE__ */ jsx(Button, {
		type: "button",
		size: "xs",
		variant: variant === "primary" ? "primary" : "outline",
		className: actionButton({ className }),
		...props
	});
}
function NotificationCenterEmptyState(props) {
	return /* @__PURE__ */ jsx(EmptyState, {
		"data-slot": "notification-center-empty-state",
		...props
	});
}
//#endregion
//#region src/components/toast/toast.tsx
const toastStyles = tv$1({
	slots: {
		viewport: ["pointer-events-none isolate z-70 w-[min(24rem,calc(100vw-2rem))]", "outline-none"],
		positioner: ["isolate z-[calc(70-var(--toast-index))] outline-none"],
		root: [
			"group/toast pointer-events-auto",
			"select-text text-foreground",
			"outline outline-1 outline-offset-2 outline-transparent",
			"[--toast-scale:calc(max(0.84,1-(var(--toast-index)*0.04)))]",
			"[--toast-peek:0.5rem]",
			"[--toast-gap:0.5rem]",
			"[--toast-stack-height:var(--toast-frontmost-height,var(--toast-height))]",
			"[--toast-y:calc((var(--toast-offset-y)*-1)-(var(--toast-index)*var(--toast-gap))+var(--toast-swipe-movement-y))]",
			"transition-[transform,opacity,height] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]",
			"data-limited:opacity-0",
			"data-starting-style:opacity-0",
			"data-ending-style:opacity-0",
			"motion-reduce:transition-none"
		],
		content: [
			"relative grid grid-cols-[minmax(0,1fr)] items-center gap-x-3 overflow-hidden",
			"[&:has([data-slot=toast-description])_[data-slot=toast-body]]:self-start [&:has([data-slot=toast-description])_[data-slot=toast-icon]]:self-start",
			"[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-h-(--toast-title-only-min-h,2.25rem)",
			"[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-w-(--toast-title-only-min-w,7rem)",
			"[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:px-(--toast-title-only-px,0.75rem)",
			"[&:not(:has([data-slot=toast-icon])):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:py-(--toast-title-only-py,0.5rem)",
			"[&:not(:has([data-slot=toast-description]))>[data-slot=toast-body]:only-child]:justify-self-center [&:not(:has([data-slot=toast-description]))>[data-slot=toast-body]:only-child]:text-center",
			"transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
			"motion-reduce:transition-none"
		],
		icon: ["flex size-5 shrink-0 items-center justify-center", "[&_svg]:size-3.5 [&_svg]:shrink-0"],
		body: ["min-w-0"],
		title: ["m-0 truncate text-sm leading-5"],
		description: ["m-0 text-sm leading-5"],
		actions: ["flex items-center justify-end gap-1.5"],
		close: [
			"absolute top-1.5 right-1.5 inline-flex size-7 shrink-0 items-center justify-center",
			"outline outline-1 outline-offset-2 outline-transparent",
			"transition-[background-color,color,border-color,box-shadow,transform] duration-150",
			"disabled:pointer-events-none disabled:opacity-40",
			"focus-visible:outline-line-strong",
			"[&_svg]:size-3.5"
		],
		arrow: [
			"pointer-events-none flex",
			"data-[side=top]:bottom-[-5px]",
			"data-[side=bottom]:top-[-5px] data-[side=bottom]:rotate-180",
			"data-[side=left]:right-[-7px] data-[side=left]:-rotate-90",
			"data-[side=right]:left-[-7px] data-[side=right]:rotate-90",
			"data-[side=inline-start]:right-[-7px] data-[side=inline-start]:-rotate-90",
			"data-[side=inline-end]:left-[-7px] data-[side=inline-end]:rotate-90"
		]
	},
	variants: {
		theme: {
			brutal: {
				root: ["border-2 border-line-strong bg-primary text-foreground-strong shadow-raft-md", "focus-visible:outline-transparent"],
				content: [
					"min-h-0 min-w-0 grid-cols-1 px-3 py-2 font-sans",
					"gap-y-1.5",
					"has-data-[slot=toast-icon]:grid-cols-[auto_minmax(0,1fr)]"
				],
				icon: ["size-7 border-2 border-line-strong bg-layer-panel p-1.5 text-foreground-strong shadow-[2px_2px_0_0_black]", "[&_svg]:size-4 [&_svg]:stroke-[2.5]"],
				title: ["font-bold text-foreground-strong"],
				description: ["font-semibold text-foreground-strong/75"],
				actions: ["col-start-1 row-start-2 col-span-full w-full justify-self-stretch justify-end gap-1"],
				close: [
					"static order-1 size-auto min-h-7 shrink-0 whitespace-nowrap border-2 border-line-strong bg-layer-panel px-2 text-xs font-bold text-foreground-strong shadow-raft-xs",
					"hover:bg-layer-panel hover:text-foreground-strong hover:-translate-y-px hover:shadow-raft-sm",
					"active:translate-px  active:shadow-none"
				],
				arrow: ["hidden"]
			},
			elegant: {
				root: [
					"relative rounded-xl bg-layer-hud/50 text-layer-hud-foreground backdrop-blur-2xl saturate-150",
					"shadow-[0_18px_42px_-18px_oklch(0_0_0/0.54)]",
					"data-expanded:bg-layer-hud/54 data-expanded:shadow-[0_18px_40px_-18px_oklch(0_0_0/0.54)]",
					"after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/35 after:mix-blend-overlay after:content-['']",
					"dark:bg-layer-popover dark:text-foreground dark:backdrop-blur-none dark:saturate-100 dark:shadow-raft-xl dark:after:hidden",
					"dark:data-expanded:bg-layer-popover dark:data-expanded:shadow-raft-xl"
				],
				content: [
					"gap-x-3.5 font-sans",
					"has-data-[slot=toast-icon]:grid-cols-[auto_minmax(0,1fr)]",
					"has-data-[slot=toast-actions]:min-w-[18rem]",
					"[&:has([data-slot=toast-actions])]:min-h-14",
					"[&:has([data-slot=toast-actions])]:py-3",
					"[&:has([data-slot=toast-actions])]:pl-3.5",
					"[&:has([data-slot=toast-actions])]:pr-3",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-title])]:min-h-14",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-title])]:min-w-[18rem]",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-title])]:py-3",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-title])]:pl-3.5",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-icon])]:min-h-14",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-icon])]:min-w-[18rem]",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-icon])]:py-3",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-icon])]:pl-3.5",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-close])]:min-h-14",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-close])]:min-w-[18rem]",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-close])]:py-3",
					"[&:has([data-slot=toast-description]):has([data-slot=toast-close])]:pl-3.5",
					"[&:has([data-slot=toast-close])]:pr-3",
					"[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-w-0",
					"[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:min-h-10",
					"[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:pl-3.5",
					"[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:py-2",
					"[&:has([data-slot=toast-icon]):not(:has([data-slot=toast-actions])):not(:has([data-slot=toast-description]))]:pr-3.5",
					"has-data-[slot=toast-actions]:grid-cols-[minmax(0,1fr)]",
					"[&:has([data-slot=toast-actions])]:gap-y-2",
					"[&:has([data-slot=toast-icon]):has([data-slot=toast-actions])]:grid-cols-[auto_minmax(0,1fr)]"
				],
				icon: ["text-white/85 dark:text-foreground-muted", "[&_svg]:size-[1.125rem] [&_svg]:stroke-[1.5]"],
				title: ["font-medium text-[oklch(0.985_0.001_286)] dark:text-foreground"],
				description: ["text-white/62 dark:text-foreground-muted"],
				actions: ["col-start-1 row-start-2 col-span-full w-full justify-self-stretch justify-end"],
				close: [
					"static order-1 size-auto min-h-7 shrink-0 whitespace-nowrap rounded-full border-0 bg-transparent px-2 text-xs font-medium text-white/52 shadow-none",
					"dark:text-foreground-muted",
					"hover:bg-white/5 hover:text-white/72 dark:hover:bg-ink-4 dark:hover:text-foreground active:scale-[0.985]"
				],
				arrow: []
			}
		},
		placement: {
			"bottom-center": { viewport: "bottom-4 left-1/2 -translate-x-1/2" },
			"bottom-right": { viewport: "right-4 bottom-4" },
			"top-center": { viewport: "top-4 left-1/2 -translate-x-1/2" },
			"top-right": { viewport: "top-4 right-4" },
			none: { viewport: "contents" }
		},
		strategy: {
			fixed: { viewport: "fixed" },
			absolute: { viewport: "absolute" }
		},
		layout: {
			stacked: { root: [
				"absolute right-0 bottom-0 left-0 mx-auto h-(--toast-stack-height) w-full origin-bottom",
				"z-[calc(70-var(--toast-index))]",
				"before:pointer-events-auto before:absolute before:inset-x-0 before:top-full before:h-[calc(var(--toast-gap)+3px)] before:content-['']",
				"[--toast-peek-dir:-1]",
				"transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--toast-peek)*var(--toast-peek-dir))))_scale(var(--toast-scale))]",
				"data-expanded:h-(--toast-height)",
				"data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--toast-y))_scale(1)]",
				"data-starting-style:transform-[translateY(120%)_scale(0.98)]",
				"[&[data-ending-style]:not([data-swipe-direction])]:transform-[translateY(120%)_scale(0.98)]",
				"data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+120%))_translateY(var(--toast-y))]",
				"data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-120%))_translateY(var(--toast-y))]",
				"data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+120%))]",
				"data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-120%))]",
				"[&_[data-slot=toast-content][data-behind]]:opacity-0 [&_[data-slot=toast-content][data-expanded]]:opacity-100",
				"in-data-[toast-placement$=right]:left-auto [[data-toast-placement$=right]_&]:mx-0",
				"[[data-toast-placement^=top]_&]:top-0 in-data-[toast-placement^=top]:bottom-auto in-data-[toast-placement^=top]:origin-top",
				"in-data-[toast-placement^=top]:before:top-auto in-data-[toast-placement^=top]:before:bottom-full",
				"in-data-[toast-placement^=top]:[--toast-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--toast-gap))+var(--toast-swipe-movement-y))]",
				"in-data-[toast-placement^=top]:[--toast-peek-dir:1]",
				"[[data-toast-placement^=top]_&[data-starting-style]]:transform-[translateY(-120%)_scale(0.98)]",
				"[[data-toast-placement^=top]_&[data-ending-style]:not([data-swipe-direction])]:transform-[translateY(-120%)_scale(0.98)]"
			] },
			inline: { root: [
				"relative mx-auto w-max max-w-[min(24rem,var(--available-width,calc(100vw-2rem)))] overflow-visible",
				"origin-(--transform-origin)",
				"data-starting-style:transform-[scale(0.97)]",
				"data-ending-style:transform-[scale(0.99)]",
				"**:data-[slot=toast-content]:opacity-100"
			] }
		},
		tone: {
			info: {},
			success: {},
			warning: {},
			error: {}
		}
	},
	defaultVariants: {
		placement: "bottom-center",
		layout: "stacked",
		strategy: "fixed"
	},
	compoundVariants: [
		{
			theme: "brutal",
			tone: "success",
			class: { root: "bg-brutal-lime" }
		},
		{
			theme: "brutal",
			tone: "warning",
			class: { root: "bg-brutal-orange" }
		},
		{
			theme: "brutal",
			tone: "error",
			class: { root: "bg-brutal-orange shadow-raft-sm" }
		},
		{
			theme: "brutal",
			layout: "stacked",
			class: { root: "w-max max-w-full" }
		},
		{
			theme: "elegant",
			layout: "stacked",
			class: { root: "w-max max-w-full" }
		},
		{
			theme: "elegant",
			layout: "inline",
			class: { root: "bg-layer-hud/62 after:hidden dark:bg-layer-popover" }
		}
	]
});
const toastAction = tv$1({
	extend: buttonVariants,
	slots: { root: [
		"inline-flex min-h-7 shrink-0 items-center justify-center whitespace-nowrap px-2 text-xs leading-none",
		"font-sans shadow-none",
		"outline outline-1 outline-offset-2 outline-transparent",
		"transition-[background-color,color,border-color,box-shadow,transform] duration-150",
		"disabled:pointer-events-none disabled:opacity-40 data-[loading=true]:opacity-100",
		"focus-visible:outline-line-strong",
		"**:data-icon:size-[1em] [&_svg:not([class*='size-'])]:size-3"
	] },
	variants: { toastTheme: {
		brutal: { root: [
			"order-2 border-2 border-line-strong bg-foreground-strong font-bold text-white shadow-raft-xs",
			"hover:bg-foreground-strong/85 hover:-translate-y-px hover:shadow-raft-sm",
			"active:translate-px  active:shadow-none"
		] },
		elegant: { root: [
			"relative order-2 min-h-7 rounded-full bg-white/6 px-3 font-medium text-white/74",
			"[&::before]:pointer-events-none [&::before]:absolute [&::before]:inset-0 [&::before]:rounded-[inherit] [&::before]:p-(--toast-gradient-border-width,1px)",
			"[&::before]:[content:''] [&::before]:[background:var(--toast-gradient-border,linear-gradient(var(--toast-gradient-border-angle,to_bottom),var(--toast-gradient-border-from,oklch(1_0_0/0.24)),var(--toast-gradient-border-via,oklch(1_0_0/0.1)),var(--toast-gradient-border-to,transparent)))]",
			"[&::before]:[-webkit-mask-image:linear-gradient(oklch(1_0_0)_0_0),linear-gradient(oklch(1_0_0)_0_0)] [&::before]:[-webkit-mask-origin:content-box,border-box] [&::before]:[-webkit-mask-clip:content-box,border-box] [&::before]:[-webkit-mask-composite:xor]",
			"[&::before]:mask-[linear-gradient(oklch(1_0_0)_0_0),linear-gradient(oklch(1_0_0)_0_0)] [&::before]:[mask-origin:content-box,border-box] [&::before]:[mask-clip:content-box,border-box] [&::before]:mask-exclude",
			"[--toast-gradient-border-angle:to_bottom] [--toast-gradient-border-from:oklch(1_0_0/0.1)] [--toast-gradient-border-to:oklch(1_0_0/0)] [--toast-gradient-border-via:oklch(1_0_0/0.05)]",
			"dark:bg-fill-muted dark:text-foreground-muted",
			"dark:[--toast-gradient-border-from:oklch(0.985_0.004_106.42/0.14)] dark:[--toast-gradient-border-via:oklch(0.985_0.004_106.42/0.07)]",
			"dark:hover:bg-fill-strong dark:hover:text-foreground dark:hover:[--toast-gradient-border-from:oklch(0.985_0.004_106.42/0.22)] dark:hover:[--toast-gradient-border-via:oklch(0.985_0.004_106.42/0.11)]",
			"hover:bg-white/7.5 hover:text-white/88 hover:[--toast-gradient-border-from:oklch(1_0_0/0.24)] hover:[--toast-gradient-border-via:oklch(1_0_0/0.08)] active:scale-[0.985]"
		] }
	} },
	defaultVariants: {
		variant: void 0,
		size: void 0
	}
});
const createToastManager = Toast.createToastManager;
const useToastManager = Toast.useToastManager;
const defaultToastManager = createToastManager();
function addDefaultToast(intent, title, options = {}) {
	const { action, dismissible, icon, priority, ...toastOptions } = options;
	return defaultToastManager.add({
		...toastOptions,
		actionProps: action ? {
			children: action.label,
			onClick: action.onClick
		} : void 0,
		title,
		type: intent,
		priority: priority ?? (intent === "error" ? "high" : void 0),
		data: {
			intent,
			hasClose: dismissible,
			hasIcon: icon
		}
	});
}
const toast = {
	add(options) {
		const { title, type = "info", ...toastOptions } = options;
		return addDefaultToast(type, title, toastOptions);
	},
	info(title, options) {
		return addDefaultToast("info", title, options);
	},
	success(title, options) {
		return addDefaultToast("success", title, options);
	},
	warning(title, options) {
		return addDefaultToast("warning", title, options);
	},
	error(title, options) {
		return addDefaultToast("error", title, options);
	},
	dismiss(id) {
		return defaultToastManager.close(id);
	}
};
function getToastTone(type) {
	if (type === "success" || type === "warning" || type === "error") return type;
	return "info";
}
function ToastProvider({ children, portalContainer, renderViewport = true, toastManager = defaultToastManager, viewportClassName, viewportPlacement = "bottom-center", viewportStrategy = "fixed", ...props }) {
	return /* @__PURE__ */ jsxs(Toast.Provider, {
		toastManager,
		...props,
		children: [children, renderViewport ? /* @__PURE__ */ jsx(DefaultToastLayer, {
			placement: viewportPlacement,
			portalContainer,
			strategy: viewportStrategy,
			viewportClassName
		}) : null]
	});
}
function ToastPortal(props) {
	return /* @__PURE__ */ jsx(Toast.Portal, {
		"data-slot": "toast-portal",
		...useThemeScopeProps(props)
	});
}
function ToastViewport({ placement = "bottom-center", strategy = "fixed", className, ...props }) {
	const theme = useThemeFamily();
	const { viewport } = toastStyles({
		theme,
		placement,
		strategy
	});
	return /* @__PURE__ */ jsx(Toast.Viewport, {
		"data-slot": "toast-viewport",
		"data-toast-placement": placement,
		className: viewport({ className }),
		...props
	});
}
function ToastPositioner({ className, ...props }) {
	const theme = useThemeFamily();
	const { positioner } = toastStyles({ theme });
	return /* @__PURE__ */ jsx(Toast.Positioner, {
		"data-slot": "toast-positioner",
		className: positioner({ className }),
		...props
	});
}
function ToastRoot({ layout = "stacked", className, toast: toastObject, ...props }) {
	const theme = useThemeFamily();
	const tone = getToastTone(toastObject.type);
	const { root } = toastStyles({
		theme,
		layout,
		tone
	});
	return /* @__PURE__ */ jsx(Toast.Root, {
		"data-slot": "toast",
		"data-toast-type": toastObject.type ?? "info",
		toast: toastObject,
		className: root({ className }),
		...props
	});
}
function ToastContent({ children, className, ...props }) {
	const theme = useThemeFamily();
	const { content } = toastStyles({ theme });
	return /* @__PURE__ */ jsx(Toast.Content, {
		"data-slot": "toast-content",
		className: content({ className }),
		...props,
		children
	});
}
function ToastIcon({ className, ...props }) {
	const theme = useThemeFamily();
	const { icon } = toastStyles({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "toast-icon",
		className: icon({ className }),
		...props
	});
}
function ToastBody({ className, ...props }) {
	const theme = useThemeFamily();
	const { body } = toastStyles({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "toast-body",
		className: body({ className }),
		...props
	});
}
function ToastActions({ className, ...props }) {
	const theme = useThemeFamily();
	const { actions } = toastStyles({ theme });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "toast-actions",
		className: actions({ className }),
		...props
	});
}
function ToastTitle({ className, ...props }) {
	const theme = useThemeFamily();
	const { title } = toastStyles({ theme });
	return /* @__PURE__ */ jsx(Toast.Title, {
		"data-slot": "toast-title",
		className: title({ className }),
		...props
	});
}
function ToastDescription({ className, ...props }) {
	const theme = useThemeFamily();
	const { description } = toastStyles({ theme });
	return /* @__PURE__ */ jsx(Toast.Description, {
		"data-slot": "toast-description",
		className: description({ className }),
		...props
	});
}
function ToastAction({ className, children, disabled, loading = false, loadingLabel = "Loading", render, ...props }) {
	const theme = useThemeFamily();
	const { root, content, loadingIndicator } = toastAction({ toastTheme: theme });
	const renderActionContent = (actionChildren) => /* @__PURE__ */ jsxs(Fragment$1, { children: [loading ? /* @__PURE__ */ jsx("span", {
		"data-slot": "toast-action-loading-indicator",
		className: loadingIndicator(),
		children: /* @__PURE__ */ jsx(Spinner, {
			"aria-label": loadingLabel,
			variant: theme === "brutal" ? "inverse" : "default"
		})
	}) : null, /* @__PURE__ */ jsx("span", {
		"data-slot": "toast-action-content",
		"data-loading": loading ? "true" : void 0,
		className: content(),
		children: actionChildren
	})] });
	const renderAction = (renderProps, state) => {
		const actionChildren = renderActionContent(renderProps.children);
		const nextRenderProps = {
			...renderProps,
			children: actionChildren
		};
		if (typeof render === "function") return render(nextRenderProps, state);
		if (isValidElement(render)) {
			const renderElement = render;
			return cloneElement(renderElement, {
				...nextRenderProps,
				className: cn(renderProps.className, renderElement.props.className),
				children: actionChildren
			});
		}
		return /* @__PURE__ */ jsx("button", { ...nextRenderProps });
	};
	return /* @__PURE__ */ jsx(Toast.Action, {
		"data-slot": "toast-action",
		"data-loading": loading ? "true" : void 0,
		className: root({ className }),
		disabled: disabled || loading,
		"aria-disabled": loading || void 0,
		render: renderAction,
		...props,
		children
	});
}
function ToastClose({ className, children, ...props }) {
	const theme = useThemeFamily();
	const { close } = toastStyles({ theme });
	const usesDefaultText = children == null;
	return /* @__PURE__ */ jsx(Toast.Close, {
		"aria-label": usesDefaultText ? void 0 : "Dismiss toast",
		"data-slot": "toast-close",
		className: close({ className }),
		...props,
		children: children ?? "Dismiss"
	});
}
function ToastArrow({ className, ...props }) {
	const theme = useThemeFamily();
	const { arrow } = toastStyles({ theme });
	if (theme === "elegant") return null;
	return /* @__PURE__ */ jsx(Toast.Arrow, {
		"data-slot": "toast-arrow",
		className: arrow({ className }),
		...props,
		children: /* @__PURE__ */ jsx(ToastArrowSvg, { theme })
	});
}
function DefaultToastLayer({ placement, portalContainer, strategy, viewportClassName }) {
	return /* @__PURE__ */ jsx(ToastPortal, {
		container: portalContainer,
		children: /* @__PURE__ */ jsx(ToastViewport, {
			placement,
			strategy,
			className: viewportClassName,
			children: /* @__PURE__ */ jsx(DefaultToastList, { placement })
		})
	});
}
function DefaultToastList({ placement }) {
	const { toasts } = useToastManager();
	return toasts.map((toastObject) => /* @__PURE__ */ jsx(DefaultToastItem, {
		placement,
		toast: toastObject
	}, toastObject.id));
}
function DefaultToastItem({ placement, toast: toastObject }) {
	const showDescription = Boolean(toastObject.description);
	const showAction = Boolean(toastObject.actionProps?.children);
	const showClose = toastObject.data?.hasClose !== false;
	const showIcon = toastObject.data?.hasIcon !== false;
	return /* @__PURE__ */ jsx(ToastRoot, {
		toast: toastObject,
		swipeDirection: placement.startsWith("top-") ? ["up", "right"] : void 0,
		children: /* @__PURE__ */ jsxs(ToastContent, {
			className: toastObject.data?.contentClassName,
			children: [
				showIcon ? /* @__PURE__ */ jsx(DefaultToastIcon, { toast: toastObject }) : null,
				/* @__PURE__ */ jsxs(ToastBody, { children: [/* @__PURE__ */ jsx(ToastTitle, {}), showDescription ? /* @__PURE__ */ jsx(ToastDescription, {}) : null] }),
				showAction || showClose ? /* @__PURE__ */ jsxs(ToastActions, { children: [showClose ? /* @__PURE__ */ jsx(ToastClose, {}) : null, showAction ? /* @__PURE__ */ jsx(ToastAction, {}) : null] }) : null
			]
		})
	});
}
function DefaultToastIcon({ toast: toastObject }) {
	const intent = toastObject.data?.intent ?? getToastTone(toastObject.type);
	return /* @__PURE__ */ jsx(ToastIcon, { children: /* @__PURE__ */ jsx(intent === "success" ? CheckCircle2 : intent === "warning" || intent === "error" ? AlertTriangle : Info, { "aria-hidden": true }) });
}
function ToastArrowSvg({ theme, ...props }) {
	return /* @__PURE__ */ jsxs("svg", {
		width: "12",
		height: "6",
		viewBox: "0 0 12 6",
		fill: "none",
		...props,
		children: [/* @__PURE__ */ jsx("path", {
			d: "M1 0H11L6 5.25Z",
			className: theme === "elegant" ? "fill-layer-hud/50" : "fill-primary"
		}), theme === "elegant" ? null : /* @__PURE__ */ jsx("path", {
			d: "M1 0.5L6 5.25L11 0.5",
			className: "stroke-line-strong",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			vectorEffect: "non-scaling-stroke"
		})]
	});
}
//#endregion
//#region src/components/tabs/tabs.tsx
const tabs = tv$1({
	slots: {
		root: ["w-full"],
		list: [""],
		background: [""],
		tab: ["relative z-10 flex shrink-0 cursor-pointer touch-manipulation items-center gap-1.5 whitespace-nowrap outline-none", "data-[reorderable=true]:cursor-pointer data-[dragging-source=true]:cursor-grabbing"],
		content: ["relative z-10 inline-flex items-center gap-[inherit]"],
		label: [""],
		panel: ["outline-none"],
		indicator: [""]
	},
	variants: {
		theme: {
			brutal: {
				list: [
					"flex w-max max-w-full overflow-x-auto border-2 border-line-strong bg-layer-panel",
					"data-[sorting=true]:overflow-x-hidden",
					"scrollbar-none [&::-webkit-scrollbar]:hidden"
				],
				background: "hidden",
				tab: [
					"bg-layer-panel px-4 py-1.5 text-xs font-semibold transition-colors",
					"hover:bg-[color-mix(in_oklch,var(--line-strong)_6%,var(--layer-panel))]",
					"[&+&]:before:absolute [&+&]:before:inset-y-0 [&+&]:before:left-0 [&+&]:before:w-0.5 [&+&]:before:bg-line-strong",
					"data-[dragging-source=true]:before:hidden",
					"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[2.5] [&_svg_*]:stroke-[2.5] [&_svg:not([class*='size-'])]:size-3.5",
					"data-active:bg-primary-400 data-active:hover:bg-primary-400",
					"data-disabled:pointer-events-none data-disabled:opacity-40"
				]
			},
			elegant: {}
		},
		variant: {
			default: {},
			underline: {}
		}
	},
	defaultVariants: { variant: "default" },
	compoundVariants: [{
		theme: "elegant",
		variant: "underline",
		class: {
			list: [
				"group/tabs-list relative flex h-12 w-max max-w-full items-center gap-1 px-4",
				"overflow-x-auto overflow-y-hidden overscroll-contain whitespace-nowrap",
				"border-b border-line-hairline",
				"data-[sorting=true]:overflow-x-hidden",
				"data-[sorting=true]:**:data-[slot=tabs-indicator]:opacity-0 data-[sorting=true]:**:data-[slot=tabs-indicator]:transition-none",
				"scrollbar-none [&::-webkit-scrollbar]:hidden"
			],
			background: ["pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-line-hairline"],
			tab: [
				"group/tabs-tab h-12 justify-center px-3 pb-3 pt-3.5",
				"text-[13px] font-medium tracking-[-0.005em] text-foreground-placeholder",
				"transition-colors duration-200 ease-out",
				"hover:text-foreground-muted",
				"data-active:text-foreground",
				"data-active:hover:text-foreground",
				"[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
				"[&_svg]:text-foreground-placeholder [&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-out",
				"hover:[&_svg]:text-foreground-muted",
				"data-active:[&_svg]:text-foreground",
				"data-active:hover:[&_svg]:text-foreground",
				"data-disabled:pointer-events-none data-disabled:opacity-40"
			],
			indicator: [
				"absolute bottom-0 left-(--active-tab-left) z-10 h-0.5",
				"w-(--active-tab-width) bg-foreground",
				"transition-[left,width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]"
			]
		}
	}, {
		theme: "elegant",
		variant: "default",
		class: {
			list: [
				"group/tabs-list relative isolate flex h-auto w-max max-w-full items-center gap-1",
				"overflow-x-auto overflow-y-visible overscroll-contain whitespace-nowrap",
				"p-px",
				"data-[sorting=true]:overflow-x-hidden",
				"data-[sorting=true]:**:data-[slot=tabs-indicator]:opacity-0 data-[sorting=true]:**:data-[slot=tabs-indicator]:transition-none",
				"scrollbar-none [&::-webkit-scrollbar]:hidden"
			],
			background: ["pointer-events-none absolute inset-0 z-0 rounded-[7px] bg-fill-muted", "dark:bg-layer-inset dark:shadow-[inset_0_1px_2px_oklch(0_0_0/0.35),inset_0_0_0_1px_oklch(0_0_0/0.4),0_1px_0_oklch(0.985_0.004_106.42/0.04)]"],
			tab: [
				"group/tabs-tab h-9 justify-center gap-1.5 rounded-md px-3.5 py-2",
				"text-[13px] font-medium tracking-[-0.005em] text-foreground-placeholder",
				"transition-[background-color,box-shadow,color] duration-150 ease-out",
				"hover:text-foreground-hover",
				"data-active:text-foreground-active",
				"data-active:hover:text-foreground-active",
				"data-active:**:data-[slot=tabs-label]:text-[13px]",
				"ring-ink-10 group-has-[>[data-slot=tabs-background]]/tabs-list:ring-ink-4",
				"dark:ring-transparent",
				"data-[reorderable=true]:data-active:bg-layer-panel",
				"dark:data-[reorderable=true]:data-active:bg-fill-muted",
				"data-[reorderable=true]:data-active:shadow-raft-sm data-[reorderable=true]:data-active:ring-1",
				"data-[dragging-active=true]:bg-layer-panel",
				"dark:data-[dragging-active=true]:bg-fill-muted",
				"data-[dragging-active=true]:shadow-raft-sm data-[dragging-active=true]:ring-1",
				"[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
				"[&_svg]:text-foreground-placeholder [&_svg]:transition-colors [&_svg]:duration-150 [&_svg]:ease-out",
				"hover:[&_svg]:text-foreground-hover",
				"data-active:[&_svg]:text-foreground-active",
				"data-disabled:pointer-events-none data-disabled:opacity-40"
			],
			indicator: [
				"absolute z-0 rounded-md bg-layer-panel",
				"left-[calc(var(--active-tab-left)+1px)] top-[calc(var(--active-tab-top)+1.671875px)]",
				"h-[calc(var(--active-tab-height)-3.34375px)] w-[calc(var(--active-tab-width)-2px)]",
				"shadow-raft-sm ring-1 ring-ink-10",
				"dark:bg-fill-muted",
				"group-has-[>[data-slot=tabs-background]]/tabs-list:ring-ink-4",
				"dark:ring-transparent",
				"transition-[left,width] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]"
			]
		}
	}]
});
const TabsReorderContext = createContext({ enabled: false });
const TabsValueContext = createContext(void 0);
const TabsListVariantContext = createContext("default");
function Tabs({ value, defaultValue, onValueChange, className, ...props }) {
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
	const resolvedValue = value ?? uncontrolledValue;
	const { root } = tabs();
	return /* @__PURE__ */ jsx(TabsValueContext.Provider, {
		value: resolvedValue == null ? void 0 : String(resolvedValue),
		children: /* @__PURE__ */ jsx(Tabs$1.Root, {
			value,
			defaultValue,
			onValueChange: (nextValue, eventDetails) => {
				if (nextValue == null) return;
				const typedValue = String(nextValue);
				if (value === void 0) setUncontrolledValue(typedValue);
				onValueChange?.(typedValue, eventDetails);
			},
			"data-slot": "tabs",
			className: root({ className }),
			...props
		})
	});
}
function TabsList({ className, children, variant = "default", ...props }) {
	const theme = useThemeFamily();
	const reorder = use(TabsReorderContext);
	const resolvedVariant = theme === "elegant" ? variant : "underline";
	const { list } = tabs({
		theme,
		variant: resolvedVariant
	});
	return /* @__PURE__ */ jsx(TabsListVariantContext.Provider, {
		value: resolvedVariant,
		children: /* @__PURE__ */ jsxs(Tabs$1.List, {
			"data-slot": "tabs-list",
			"data-variant": resolvedVariant,
			className: list({ className }),
			...props,
			children: [children, theme === "elegant" && !reorder.enabled ? /* @__PURE__ */ jsx(TabsIndicator, {}) : null]
		})
	});
}
function SortableTabsList({ value, onReorder, children, variant = "default", ...props }) {
	const [activeId, setActiveId] = useState(void 0);
	const dndContextId = useId();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 350,
		tolerance: 8
	} }));
	const tabIds = useMemo(() => value.map(String), [value]);
	const reorderContext = useMemo(() => ({
		enabled: true,
		activeId
	}), [activeId]);
	return /* @__PURE__ */ jsx(DndContext, {
		id: dndContextId,
		autoScroll: false,
		sensors,
		collisionDetection: closestCenter,
		onDragStart: useCallback(({ active }) => {
			setActiveId(String(active.id));
		}, []),
		onDragCancel: useCallback(() => {
			setActiveId(void 0);
		}, []),
		onDragEnd: useCallback(({ active, over }) => {
			setActiveId(void 0);
			if (!over || active.id === over.id) return;
			const oldIndex = tabIds.indexOf(String(active.id));
			const newIndex = tabIds.indexOf(String(over.id));
			if (oldIndex === -1 || newIndex === -1) return;
			onReorder(arrayMove([...value], oldIndex, newIndex));
		}, [
			onReorder,
			tabIds,
			value
		]),
		children: /* @__PURE__ */ jsx(SortableContext, {
			items: tabIds,
			strategy: horizontalListSortingStrategy,
			children: /* @__PURE__ */ jsx(TabsReorderContext.Provider, {
				value: reorderContext,
				children: /* @__PURE__ */ jsx(TabsList, {
					variant,
					...props,
					"data-sorting": activeId ? "true" : void 0,
					children
				})
			})
		})
	});
}
function TabsTab({ value, ...props }) {
	return /* @__PURE__ */ jsx(TabsTabButton, {
		value,
		...props
	});
}
function SortableTabsTab({ value, ...props }) {
	const reorder = use(TabsReorderContext);
	const activeValue = use(TabsValueContext);
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: value,
		disabled: !reorder.enabled
	});
	const isDraggingActive = isDragging && activeValue === String(value);
	if (!reorder.enabled) return /* @__PURE__ */ jsx(TabsTabButton, {
		value,
		...props
	});
	const { role: _sortableRole, tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;
	const baseStyle = typeof props.style === "function" ? void 0 : props.style;
	const style = {
		...baseStyle,
		transform: transform ? `translate3d(${transform.x}px, 0, 0)` : void 0,
		transition,
		zIndex: isDragging ? 20 : baseStyle?.zIndex,
		cursor: isDragging ? "grabbing" : "pointer"
	};
	return /* @__PURE__ */ jsx(TabsTabButton, {
		value,
		sortableRef: setNodeRef,
		...props,
		"data-dragging-active": isDraggingActive ? "true" : void 0,
		"data-dragging-source": isDragging ? "true" : void 0,
		"data-reorderable": "true",
		style,
		...sortableAttributes,
		...listeners
	});
}
function TabsTabButton({ value, sortableRef, className, children, ...props }) {
	const theme = useThemeFamily();
	const variant = use(TabsListVariantContext);
	const { content, tab } = tabs({
		theme,
		variant: theme === "elegant" ? variant : "underline"
	});
	return /* @__PURE__ */ jsx(Tabs$1.Tab, {
		ref: (node) => {
			sortableRef?.(node);
		},
		value,
		"data-slot": "tabs-tab",
		className: tab({ className }),
		...props,
		children: /* @__PURE__ */ jsx("span", {
			"data-slot": "tabs-tab-content",
			className: content(),
			children
		})
	});
}
function TabsLabel({ className, ...props }) {
	const { label } = tabs();
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "tabs-label",
		className: label({ className }),
		...props
	});
}
function TabsPanel({ className, ...props }) {
	const { panel } = tabs();
	return /* @__PURE__ */ jsx(Tabs$1.Panel, {
		"data-slot": "tabs-panel",
		className: panel({ className }),
		...props
	});
}
function TabsBackground({ className, ...props }) {
	const theme = useThemeFamily();
	const variant = use(TabsListVariantContext);
	const { background } = tabs({
		theme,
		variant: theme === "elegant" ? variant : "underline"
	});
	return /* @__PURE__ */ jsx("span", {
		"aria-hidden": "true",
		"data-slot": "tabs-background",
		className: background({ className }),
		...props
	});
}
function TabsIndicator({ className, ...props }) {
	const theme = useThemeFamily();
	const variant = use(TabsListVariantContext);
	const { indicator } = tabs({
		theme,
		variant: theme === "elegant" ? variant : "underline"
	});
	return /* @__PURE__ */ jsx(Tabs$1.Indicator, {
		"data-slot": "tabs-indicator",
		className: indicator({ className }),
		...props
	});
}
function useOrderedTabs(items, storedOrder) {
	return useMemo(() => reconcileTabOrder(items, storedOrder), [items, storedOrder]);
}
function reconcileTabOrder(items, order) {
	const byId = new Map(items.map((item) => [item.id, item]));
	const next = [];
	const seen = /* @__PURE__ */ new Set();
	for (const id of order) {
		const item = byId.get(id);
		if (!item || seen.has(item.id)) continue;
		next.push(item);
		seen.add(item.id);
	}
	for (const item of items) {
		if (seen.has(item.id)) continue;
		next.push(item);
		seen.add(item.id);
	}
	return next;
}
//#endregion
//#region src/components/separator/separator.tsx
const separator = tv$1({
	slots: {
		root: [
			"shrink-0",
			"data-[orientation=horizontal]:w-full",
			"data-[orientation=vertical]:self-stretch"
		],
		labeledRoot: ["grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3"],
		labeledLine: ["w-full shrink-0"],
		labeledContent: ["min-w-0 font-mono text-xs font-medium"]
	},
	variants: { theme: {
		brutal: {
			root: ["data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:border-t-2 data-[orientation=horizontal]:border-line-strong", "data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-l-2 data-[orientation=vertical]:border-line-strong"],
			labeledLine: ["h-0 border-t-2 border-line-strong"],
			labeledContent: ["font-medium text-foreground-strong/70"]
		},
		elegant: {
			root: [
				"bg-line-hairline",
				"data-[orientation=horizontal]:h-px",
				"data-[orientation=vertical]:w-px"
			],
			labeledLine: ["h-px bg-line-hairline"],
			labeledContent: ["text-foreground-placeholder"]
		}
	} }
});
function Separator({ children, className, orientation = "horizontal", ...props }) {
	const theme = useThemeFamily();
	const { labeledContent, labeledLine, labeledRoot, root } = separator({ theme });
	if (children != null && orientation === "horizontal") return /* @__PURE__ */ jsxs(Separator$1, {
		"data-slot": "separator",
		orientation,
		className: labeledRoot({ className }),
		...props,
		children: [
			/* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				className: labeledLine()
			}),
			/* @__PURE__ */ jsx("span", {
				"data-slot": "separator-content",
				className: labeledContent(),
				children
			}),
			/* @__PURE__ */ jsx("span", {
				"aria-hidden": "true",
				className: labeledLine()
			})
		]
	});
	return /* @__PURE__ */ jsx(Separator$1, {
		"data-slot": "separator",
		orientation,
		className: root({ className }),
		...props
	});
}
//#endregion
//#region src/components/panel/panel-action.recipe.ts
const panelActionBase = tv$1({
	base: [
		"relative inline-flex w-auto shrink-0 items-center justify-center",
		"overflow-visible font-sans leading-none tabular-nums select-none outline-none",
		"transition-all duration-100",
		"[&>svg]:pointer-events-none [&>svg]:shrink-0"
	],
	variants: { theme: {
		brutal: [
			"rounded-none border-2 border-black bg-white px-1 py-[5px] text-black",
			"shadow-raft-sm",
			"hover:-translate-y-px hover:bg-white hover:shadow-raft-md",
			"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
			"[&>svg]:size-3.5"
		],
		elegant: [
			"rounded-md border-0 bg-transparent px-2 py-2",
			"hover:bg-fill-strong/80 hover:text-foreground-strong",
			"focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
			"[&>svg]:size-4"
		]
	} }
});
const panelAction = tv$1({
	extend: panelActionBase,
	base: ["gap-1.5 text-xs/[1] whitespace-nowrap", "disabled:pointer-events-none disabled:opacity-40 disabled:transform-none"],
	variants: { theme: {
		brutal: ["active:not-data-haspopup:scale-100 active:translate-px  active:shadow-raft-xs", "disabled:shadow-raft-sm"],
		elegant: ["text-foreground-icon shadow-none", "active:bg-fill-strong/80 active:text-foreground-strong"]
	} }
});
const panelToggleAction = tv$1({
	extend: panelActionBase,
	base: ["data-disabled:pointer-events-none data-disabled:opacity-40 data-disabled:transform-none"],
	variants: { theme: {
		brutal: [
			"active:translate-px  active:shadow-raft-xs",
			"data-pressed:bg-brutal-orange data-pressed:text-black",
			"data-pressed:hover:bg-brutal-orange",
			"data-disabled:shadow-raft-sm"
		],
		elegant: [
			"text-foreground-icon shadow-none",
			"active:bg-fill-strong/80 active:text-foreground-strong",
			"data-pressed:bg-fill-strong data-pressed:text-foreground-strong",
			"data-pressed:hover:bg-fill-strong"
		]
	} }
});
//#endregion
//#region src/components/panel/panel-action.tsx
function PanelAction({ className, render, nativeButton, ...props }) {
	const theme = useThemeFamily();
	return /* @__PURE__ */ jsx(Button$1, {
		...props,
		render,
		nativeButton: nativeButton ?? defaultNativeButton(render),
		type: "button",
		"data-slot": "panel-action",
		className: panelAction({
			theme,
			className
		})
	});
}
//#endregion
//#region src/components/app-shell/app-shell.tsx
const appShell = tv$1({
	slots: {
		root: [
			"flex min-h-0 w-full overflow-visible md:overflow-hidden",
			"max-md:flex-col max-md:pt-[env(safe-area-inset-top,0px)]",
			"font-sans text-foreground-strong"
		],
		railSlot: ["hidden h-full shrink-0 flex-col md:flex"],
		sidebarSlot: ["hidden min-h-0 shrink-0 flex-col md:flex"],
		mainSlot: ["flex min-h-0 min-w-0 flex-1 flex-col"],
		panelSlot: ["hidden min-h-0 min-w-0 flex-col md:flex"],
		overlaySlot: ["absolute inset-0 z-20 flex min-h-0 min-w-0"]
	},
	variants: {
		theme: {
			brutal: { root: ["[--shell-header-height:62px]", "bg-brutal-cream text-black max-md:bg-white"] },
			elegant: { root: ["[--shell-header-height:56px]", "bg-layer-canvas-muted"] }
		},
		overlay: {
			false: {},
			true: { mainSlot: "relative" }
		}
	},
	defaultVariants: { overlay: false }
});
const AppShellSidebarContext = createContext(null);
function useOptionalAppShellSidebar() {
	return useContext(AppShellSidebarContext);
}
function AppShellRoot({ className, defaultSidebarOpen = true, onSidebarOpenChange, render, sidebarCollapsible = false, sidebarOpen: sidebarOpenProp, style, ...props }) {
	const theme = useThemeFamily();
	const { root } = appShell({ theme });
	const [uncontrolledSidebarOpen, setUncontrolledSidebarOpen] = useState(defaultSidebarOpen);
	const [sidebarWidth, setSidebarWidth] = useState(0);
	const sidebarOpen = sidebarOpenProp ?? uncontrolledSidebarOpen;
	const setSidebarOpen = useCallback((open) => {
		if (sidebarOpenProp === void 0) setUncontrolledSidebarOpen(open);
		onSidebarOpenChange?.(open);
	}, [onSidebarOpenChange, sidebarOpenProp]);
	const toggleSidebar = useCallback(() => {
		setSidebarOpen(!sidebarOpen);
	}, [setSidebarOpen, sidebarOpen]);
	const setMeasuredSidebarWidth = useCallback((width) => {
		if (width <= 0) return;
		setSidebarWidth((currentWidth) => Math.abs(currentWidth - width) < 1 ? currentWidth : width);
	}, []);
	const sidebarContext = useMemo(() => ({
		collapsible: sidebarCollapsible,
		open: sidebarOpen,
		setOpen: setSidebarOpen,
		sidebarWidth,
		setSidebarWidth: setMeasuredSidebarWidth,
		toggle: toggleSidebar
	}), [
		setMeasuredSidebarWidth,
		setSidebarOpen,
		sidebarCollapsible,
		sidebarOpen,
		sidebarWidth,
		toggleSidebar
	]);
	const rootStyle = sidebarCollapsible ? {
		...style,
		"--app-shell-sidebar-width": `${sidebarWidth}px`
	} : style;
	const rootElement = useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-state": sidebarCollapsible ? sidebarOpen ? "expanded" : "collapsed" : void 0,
			"data-slot": "app-shell-root",
			className: root({ className: cn("group/app-shell", className) }),
			style: rootStyle
		}, props)
	});
	return /* @__PURE__ */ jsx(AppShellSidebarContext, {
		value: sidebarContext,
		children: rootElement
	});
}
function AppShellRailSlot({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { railSlot } = appShell({ theme });
	return useRender({
		defaultTagName: "aside",
		render,
		props: mergeProps({
			"data-slot": "app-shell-rail-slot",
			className: railSlot({ className })
		}, props)
	});
}
function AppShellSidebarSlot({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { sidebarSlot } = appShell({ theme });
	const sidebar = useOptionalAppShellSidebar();
	const elementRef = useRef(null);
	const isCollapsible = sidebar?.collapsible ?? false;
	const setSidebarWidth = sidebar?.setSidebarWidth;
	const setElementRef = useCallback((element) => {
		elementRef.current = element;
	}, []);
	useLayoutEffect(() => {
		if (!isCollapsible || !setSidebarWidth || !elementRef.current) return;
		const sidebarElement = elementRef.current;
		const observe = () => setSidebarWidth(sidebarElement.getBoundingClientRect().width);
		const observer = new ResizeObserver(observe);
		observe();
		observer.observe(sidebarElement);
		return () => observer.disconnect();
	}, [isCollapsible, setSidebarWidth]);
	return useRender({
		defaultTagName: "aside",
		render,
		props: mergeProps({
			"aria-hidden": sidebar?.collapsible && !sidebar.open ? true : void 0,
			"data-slot": "app-shell-sidebar-slot",
			className: sidebarSlot({ className: cn(className, sidebar?.collapsible && [
				"will-change-[opacity]",
				"transition-opacity duration-160 ease-slide",
				"motion-reduce:transition-none",
				"group-data-[state=collapsed]/app-shell:pointer-events-none",
				"group-data-[state=collapsed]/app-shell:opacity-0",
				"group-data-[state=collapsed]/app-shell:duration-120"
			]) }),
			ref: setElementRef
		}, props)
	});
}
function AppShellPanelSlot({ className, render, ...props }) {
	const { panelSlot } = appShell();
	return useRender({
		defaultTagName: "aside",
		render,
		props: mergeProps({
			"data-slot": "app-shell-panel-slot",
			className: panelSlot({ className })
		}, props)
	});
}
function AppShellOverlaySlot({ className, render, ...props }) {
	const { overlaySlot } = appShell();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "app-shell-overlay-slot",
			className: overlaySlot({ className })
		}, props)
	});
}
function AppShellMainSlot({ className, overlay = false, render, ...props }) {
	const { mainSlot } = appShell({ overlay });
	return useRender({
		defaultTagName: "main",
		render,
		props: mergeProps({
			"data-slot": "app-shell-main-slot",
			className: mainSlot({ className: cn(className, useOptionalAppShellSidebar()?.collapsible && [
				"absolute inset-y-0 right-0 left-0 z-45",
				"transition-[left] duration-220 ease-slide",
				"motion-reduce:transition-none",
				"group-data-[state=collapsed]/app-shell:-left-(--app-shell-sidebar-width)"
			]) })
		}, props)
	});
}
function AppShellSidebarTrigger(props) {
	const sidebar = useOptionalAppShellSidebar();
	if (!sidebar?.collapsible) return null;
	return /* @__PURE__ */ jsx(AppShellSidebarTriggerButton, {
		sidebar,
		...props
	});
}
function AppShellSidebarTriggerButton({ sidebar, className, children, onClick, render, ...props }) {
	const label = sidebar.open ? "Collapse sidebar" : "Expand sidebar";
	const defaultProps = {
		className: cn("group/app-shell-sidebar-trigger max-md:hidden", className),
		"aria-label": label,
		"aria-pressed": sidebar.open,
		"data-state": sidebar.open ? "expanded" : "collapsed",
		title: label,
		children,
		onClick: (event) => {
			onClick?.(event);
			if (!event.defaultPrevented) sidebar.toggle();
		}
	};
	return useRender({
		defaultTagName: "button",
		render: render ?? /* @__PURE__ */ jsx(PanelAction, {}),
		props: mergeProps(defaultProps, props)
	});
}
//#endregion
//#region src/components/resizable/resizable.recipe.ts
const resizable = tv$1({
	slots: {
		group: ["flex size-full  min-h-0 min-w-0", "data-[orientation=vertical]:flex-col"],
		panel: ["min-h-0 min-w-0"],
		handle: [
			"right-0 z-10 cursor-ew-resize touch-none select-none",
			"relative -ml-1.5 -mr-1.5 flex w-3 shrink-0 items-center justify-center",
			"before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:h-6 before:w-1 before:-translate-1/2  before:rounded-full before:transition-colors before:content-['']",
			"focus-visible:outline-none focus-visible:before:outline-2 focus-visible:before:outline-offset-2 focus-visible:before:outline-foreground-strong",
			"data-[orientation=horizontal]:-mt-1.5 data-[orientation=horizontal]:-mb-1.5 data-[orientation=horizontal]:ml-0 data-[orientation=horizontal]:mr-0 data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:cursor-ns-resize",
			"data-[orientation=horizontal]:before:top-1/2 data-[orientation=horizontal]:before:left-1/2 data-[orientation=horizontal]:before:h-1 data-[orientation=horizontal]:before:w-6"
		]
	},
	variants: { theme: {
		brutal: { handle: [
			"bg-transparent before:bg-black/10",
			"hover:before:bg-black/20",
			"data-[separator=active]:before:bg-black/20",
			"focus-visible:before:bg-black/20"
		] },
		elegant: { handle: [
			"bg-transparent before:bg-ink-10",
			"hover:before:bg-ink-20",
			"data-[separator=active]:before:bg-ink-20",
			"focus-visible:before:bg-ink-20"
		] }
	} }
});
//#endregion
//#region src/components/resizable/resizable.tsx
const ResizableOrientationContext = createContext("horizontal");
function ResizableGroup({ className, orientation = "horizontal", ...props }) {
	const { group } = resizable();
	return /* @__PURE__ */ jsx(ResizableOrientationContext.Provider, {
		value: orientation,
		children: /* @__PURE__ */ jsx(Group, {
			"data-slot": "resizable-group",
			"data-orientation": orientation,
			orientation,
			className: group({ className }),
			...props
		})
	});
}
function ResizablePanel({ className, ...props }) {
	const { panel } = resizable();
	return /* @__PURE__ */ jsx(Panel$1, {
		"data-slot": "resizable-panel",
		className: panel({ className }),
		...props
	});
}
function ResizableHandle({ className, ...props }) {
	const { handle } = resizable({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Separator$2, {
		"data-slot": "resizable-handle",
		"data-orientation": useContext(ResizableOrientationContext) === "horizontal" ? "vertical" : "horizontal",
		className: handle({ className }),
		...props
	});
}
//#endregion
//#region src/components/panel/panel-header.recipe.ts
/**
* `header` and `sectionHeader` share one bar treatment, expressed through
* `compoundSlots`. The elegant mobile grid is the shared default header layout,
* not a conversation-only one: columns are [leading control][icon][content][actions],
* and `headerContent`, `headerIcon`, and `actions` place themselves into it.
* Conversation headers, the tasks section header, and the browse rail all rely on it;
* `profile-panel` opts out with `max-md:flex`.
*/
const panelHeader = tv$1({
	slots: {
		header: [],
		sectionHeader: [],
		headerIcon: ["flex size-9 shrink-0 items-center justify-center", "border-2"],
		headerContent: ["min-w-0 flex-1"],
		heading: ["flex min-w-0 items-center gap-2"],
		title: ["truncate text-base font-bold leading-tight"],
		meta: ["min-w-0 truncate font-mono text-xs"],
		status: [
			"inline-flex shrink-0 items-center gap-1",
			"px-1.5 py-1 text-[11px] font-bold uppercase leading-none",
			"[&_svg]:size-[11px] [&_svg]:shrink-0"
		],
		activity: [
			"inline-flex shrink-0 items-center gap-1.5",
			"text-xs leading-none",
			"[&_svg]:size-[11px] [&_svg]:shrink-0"
		],
		actions: ["flex shrink-0 items-center gap-1.5 max-md:gap-0.5"]
	},
	variants: {
		theme: {
			brutal: {
				headerIcon: "border-black bg-primary text-black",
				headerContent: [
					"flex flex-col",
					"has-[>[data-slot=panel-header-icon]]:grid has-[>[data-slot=panel-header-icon]]:grid-cols-[auto_minmax(0,1fr)]",
					"has-[>[data-slot=panel-header-icon]]:items-center has-[>[data-slot=panel-header-icon]]:gap-x-3",
					"has-[>[data-slot=panel-meta]]:*:data-[slot=panel-header-icon]:row-span-2",
					"has-[>[data-slot=panel-header-icon]]:*:data-[slot=panel-heading]:col-start-2",
					"has-[>[data-slot=panel-header-icon]]:*:data-[slot=panel-title]:col-start-2",
					"has-[>[data-slot=panel-header-icon]]:*:data-[slot=panel-meta]:col-start-2"
				],
				title: "text-black",
				meta: "text-black/50",
				status: "border-2 border-black bg-brutal-orange/25 text-black",
				activity: "text-black",
				actions: ["max-md:gap-1.5", "[&_[data-slot=tabs-list]]:gap-0"]
			},
			elegant: {
				actions: ["max-md:col-start-4 max-md:row-start-1 max-md:self-center", "[&_[data-slot=tabs-list]]:gap-2"],
				headerIcon: [
					"size-9 rounded-md border-0 bg-fill-muted",
					"text-foreground-icon",
					"max-md:col-start-2 max-md:row-start-1 max-md:self-center"
				],
				headerContent: [
					"flex flex-col md:flex-row md:items-center md:gap-2",
					"md:has-[>[data-slot=panel-meta]]:items-baseline",
					"max-md:col-start-1 max-md:row-start-1 max-md:min-w-0 max-md:gap-1 max-md:self-center",
					"max-md:has-[>[data-slot=panel-header-icon]]:grid max-md:has-[>[data-slot=panel-header-icon]]:grid-cols-[auto_minmax(0,1fr)]",
					"max-md:has-[>[data-slot=panel-header-icon]]:items-center max-md:has-[>[data-slot=panel-header-icon]]:gap-x-2",
					"max-md:has-[>[data-slot=panel-meta]]:[&>[data-slot=panel-header-icon]]:row-span-2",
					"max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-heading]]:col-start-2",
					"max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-title]]:col-start-2",
					"max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-meta]]:col-span-2",
					"max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-meta]]:col-start-1",
					"max-md:has-[>[data-slot=panel-header-icon]]:col-start-2 max-md:has-[>[data-slot=panel-header-icon]]:col-span-2",
					"max-md:has-[>[data-slot=panel-header-icon]]:self-center",
					"max-md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-header-icon]]:col-start-1",
					"md:has-[>[data-slot=panel-header-icon]]:[&>[data-slot=panel-header-icon]]:self-center"
				],
				title: ["font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums", "text-foreground-muted"],
				meta: "font-sans leading-none text-foreground-placeholder max-md:leading-tight",
				status: [
					"border-0 bg-transparent p-0",
					"text-foreground-placeholder",
					"[&_svg]:size-[13px]"
				],
				activity: ["text-foreground-placeholder", "[&_svg]:size-[13px]"]
			}
		},
		size: {
			sm: {},
			md: { meta: "text-sm" }
		}
	},
	compoundSlots: [
		{
			slots: ["header", "sectionHeader"],
			class: "max-md:sticky max-md:top-0 max-md:z-30"
		},
		{
			slots: ["header", "sectionHeader"],
			class: "flex h-(--shell-header-height,62px) shrink-0 items-center gap-2"
		},
		{
			slots: ["header", "sectionHeader"],
			theme: "brutal",
			class: "gap-3 border-b-2 border-black bg-white px-5"
		},
		{
			slots: ["header", "sectionHeader"],
			theme: "elegant",
			class: [
				"relative isolate h-auto min-h-(--shell-header-height,56px) max-md:z-10 [@media(max-height:600px)]:h-auto",
				"border-b-0 bg-transparent max-md:bg-layer-canvas-muted",
				"max-md:grid max-md:grid-cols-[auto_auto_minmax(0,1fr)_auto]",
				"max-md:h-[var(--shell-header-height,56px)] max-md:items-center",
				"px-0 max-md:pl-5 max-md:pr-3.5 md:pl-9 md:pr-5",
				"max-md:[&>button+[data-slot=panel-header-content]]:col-start-2",
				"max-md:[&>a+[data-slot=panel-header-content]]:col-start-2"
			]
		},
		{
			slots: ["sectionHeader"],
			theme: "brutal",
			class: [
				"max-md:before:hidden",
				"max-md:bg-primary-400",
				"[@media(max-height:600px)]:h-(--shell-header-height,62px)",
				"max-md:[&>[data-slot=panel-header-icon]]:hidden",
				"md:[&>[data-slot=panel-header-icon]]:size-10",
				"md:[&>[data-slot=panel-header-icon]]:bg-primary-400",
				"max-md:[&>[data-slot=panel-actions]]:gap-2.5"
			]
		},
		{
			slots: ["sectionHeader"],
			theme: "elegant",
			class: "max-md:before:hidden"
		}
	]
});
//#endregion
//#region src/components/panel/panel-header.tsx
function PanelHeader({ children, className, render, ...props }) {
	const { header } = panelHeader({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelHeaderRoot, {
		...props,
		render,
		"data-panel-frame-header": "",
		"data-slot": "panel-header",
		className: header({ className }),
		children
	});
}
function PanelSectionHeader({ children, className, render, ...props }) {
	const { sectionHeader } = panelHeader({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelHeaderRoot, {
		...props,
		render,
		"data-slot": "panel-section-header",
		className: sectionHeader({ className }),
		children
	});
}
function PanelHeaderIcon({ className, render, ...props }) {
	const { headerIcon } = panelHeader({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-header-icon",
			className: headerIcon({ className })
		}, props)
	});
}
function PanelHeaderContent({ className, render, ...props }) {
	const { headerContent } = panelHeader({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-header-content",
			className: headerContent({ className })
		}, props)
	});
}
function PanelHeading({ className, render, ...props }) {
	const { heading } = panelHeader();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-heading",
			className: heading({ className })
		}, props)
	});
}
function PanelTitle({ className, render, ...props }) {
	const { title } = panelHeader({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-title",
			className: title({ className })
		}, props)
	});
}
function PanelMeta({ className, render, size = "sm", ...props }) {
	const { meta } = panelHeader({
		theme: useThemeFamily(),
		size
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-meta",
			className: meta({ className })
		}, props)
	});
}
/**
* Attribute badge in a panel header, such as a muted or archived marker.
* Use `PanelActivity` for a live status readout wrapping a `Status`.
*/
function PanelStatus({ className, render, ...props }) {
	const { status } = panelHeader({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "panel-status",
			className: status({ className })
		}, props)
	});
}
/**
* Live status readout in a panel header, such as agent activity or presence.
* Wraps a `Status` and supplies header-appropriate spacing and typography;
* use `PanelStatus` for a standalone attribute badge.
*/
function PanelActivity({ className, render, ...props }) {
	const { activity } = panelHeader({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "panel-activity",
			className: activity({ className })
		}, props)
	});
}
function PanelActions({ className, render, ...props }) {
	const { actions } = panelHeader({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "panel-actions",
			className: actions({ className })
		}, props)
	});
}
//#endregion
//#region src/components/panel/panel-toggle-action.tsx
function PanelToggleAction({ className, ...props }) {
	const theme = useThemeFamily();
	return /* @__PURE__ */ jsx(Toggle, {
		...props,
		type: "button",
		"data-slot": "panel-toggle-action",
		className: panelToggleAction({
			theme,
			className
		})
	});
}
//#endregion
//#region src/components/profile-panel/profile-panel.recipe.ts
const profilePanel = tv$1({
	slots: {
		root: ["flex h-full min-h-0 min-w-0 flex-1 flex-col", "[--panel-footer-clearance:0rem]"],
		header: [],
		headerContent: [],
		section: []
	},
	variants: { theme: {
		brutal: { root: "bg-layer-panel" },
		elegant: {
			root: "relative bg-layer-canvas-muted font-sans text-foreground-strong",
			header: "max-md:flex max-md:px-6 md:px-6",
			headerContent: "md:flex-col md:items-stretch md:gap-0",
			section: "border-line-muted px-6 py-5"
		}
	} }
});
//#endregion
//#region src/components/profile-panel/profile-panel.tsx
function ProfilePanel({ className, edge = "inset", ...props }) {
	const { root } = profilePanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Panel, {
		...props,
		edge,
		"data-slot": "profile-panel",
		className: root({ className })
	});
}
function ProfilePanelHeader({ className, ...props }) {
	const { header } = profilePanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelHeader, {
		...props,
		className: header({ className })
	});
}
function ProfilePanelHeaderContent({ className, ...props }) {
	const { headerContent } = profilePanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelHeaderContent, {
		...props,
		className: headerContent({ className })
	});
}
function ProfilePanelBody({ className, ...props }) {
	const { content } = conversationPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelBody, {
		...props,
		"data-slot": "profile-panel-body",
		className: content({ className })
	});
}
function ProfilePanelSection({ className, ...props }) {
	const { section } = profilePanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelSection, {
		...props,
		className: section({ className })
	});
}
//#endregion
//#region src/components/thread-panel/thread-panel.recipe.ts
const threadPanel = tv$1({
	slots: {
		root: ["isolate flex size-full min-h-0  flex-col", "dark:bg-layer-card"],
		header: ["flex h-(--shell-header-height,62px) shrink-0 items-center gap-3 px-5"],
		content: ["flex min-h-0 min-w-0 flex-1 flex-col"],
		title: ["m-0 min-w-0 flex-1 truncate", "text-base font-bold"],
		titleMeta: ["font-normal"],
		actions: ["flex shrink-0 items-center gap-1.5"],
		search: ["relative z-20 flex shrink-0 items-center gap-1.5 px-5 py-2", "[&>[data-slot=input-group]]:min-w-0 *:data-[slot=input-group]:flex-1"],
		searchTrailing: ["ml-auto flex shrink-0 items-center gap-1.5"],
		searchCount: ["shrink-0 whitespace-nowrap font-mono text-xs tabular-nums"],
		originalMessage: ["relative shrink-0"],
		replySummary: ["px-3 pt-2"],
		replyCount: ["mb-1 border-b pb-2 text-center font-mono text-xs"],
		footer: ["text-xs"]
	},
	variants: { theme: {
		brutal: {
			root: "bg-white font-sans text-black",
			header: "border-b-2 border-black bg-white",
			content: "bg-white",
			title: "text-black",
			titleMeta: "text-black/50",
			search: "border-b-2 border-black bg-white",
			searchCount: "text-black/50",
			originalMessage: ["bg-white px-2.5 border-b-2 border-black", "**:data-message-item:bg-white"],
			replyCount: "border-black/10 text-black/40",
			footer: "border-t-2 border-black bg-white text-black/50"
		},
		elegant: {
			root: ["relative bg-transparent font-sans text-foreground-strong", "dark:md:shadow-[-4px_0_8px_-5px_oklch(0_0_0_/_0.55),0_16px_32px_-8px_oklch(0_0_0_/_0.45)]"],
			header: [
				"relative isolate h-auto min-h-(--shell-header-height,56px) max-lg:z-10 [@media(max-height:600px)]:h-auto",
				"bg-layer-canvas-muted",
				"max-lg:gap-2 max-lg:pl-5 max-lg:pr-3.5 max-md:h-[var(--shell-header-height,56px)]",
				"max-lg:before:pointer-events-none max-lg:before:absolute max-lg:before:inset-x-0 max-lg:before:top-0 max-lg:before:-bottom-3 max-lg:before:z-0",
				"max-lg:before:bg-[linear-gradient(to_bottom,var(--layer-canvas-muted),transparent)] max-lg:before:backdrop-blur-sm",
				"max-lg:before:[mask-image:linear-gradient(to_bottom,black_50%,transparent)] max-lg:before:[-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent)]",
				"max-lg:before:content-[''] max-lg:[&>*]:relative max-lg:[&>*]:z-10"
			],
			content: [
				"relative overflow-clip",
				"bg-layer-panel",
				"dark:bg-transparent",
				"**:data-message-item:px-[18px] [&_[data-message-item]]:max-lg:px-3"
			],
			title: ["font-heading text-[17px] font-medium leading-tight tracking-tight tabular-nums", "text-foreground-muted"],
			titleMeta: "text-foreground-muted",
			search: ["max-lg:pl-5 max-lg:pr-3.5", "border-b border-line-muted bg-layer-canvas-muted"],
			searchTrailing: [
				"[&>[data-slot=thread-panel-actions]]:gap-0.5",
				"[&_[data-slot=panel-action]]:px-1.5 [&_[data-slot=panel-action]]:py-1.5",
				"[&_[data-slot=panel-action]>svg]:size-3.5"
			],
			searchCount: "text-foreground-muted",
			originalMessage: [
				"bg-transparent",
				"border-b border-line-muted",
				"**:data-message-item:bg-transparent"
			],
			replySummary: "px-5 max-lg:px-3.5",
			replyCount: "border-line-hairline text-foreground-muted",
			footer: ["px-5 max-lg:px-3.5 md:px-5 max-md:px-3.5", "text-foreground-muted"]
		}
	} }
});
//#endregion
//#region src/components/thread-panel/thread-panel.tsx
function ThreadPanelRoot({ className, render, ...props }) {
	const { root } = threadPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Panel, {
		...props,
		render,
		edge: "attached",
		"data-slot": "thread-panel-root",
		className: root({ className })
	});
}
function ThreadPanelHeader({ className, render, ...props }) {
	const { header } = threadPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelHeaderRoot, {
		...props,
		render,
		"data-panel-frame-header": "",
		"data-slot": "thread-panel-header",
		className: header({ className })
	});
}
function ThreadPanelContent({ className, render, ...props }) {
	const { content } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-content",
			className: content({ className })
		}, props)
	});
}
function ThreadPanelTitle({ className, render, ...props }) {
	const { title } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "h2",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-title",
			className: title({ className })
		}, props)
	});
}
function ThreadPanelTitleMeta({ className, render, ...props }) {
	const { titleMeta } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-title-meta",
			className: titleMeta({ className })
		}, props)
	});
}
function ThreadPanelActions({ className, render, ...props }) {
	const { actions } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-actions",
			className: actions({ className })
		}, props)
	});
}
function ThreadPanelBody({ className, render, ...props }) {
	return /* @__PURE__ */ jsx(PanelBody, {
		...props,
		render,
		"data-slot": "thread-panel-body",
		className
	});
}
function ThreadPanelOriginalMessage({ className, ...props }) {
	const { originalMessage } = threadPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		...props,
		"data-slot": "thread-panel-original-message",
		className: originalMessage({ className })
	});
}
function ThreadPanelReplySummary({ className, render, ...props }) {
	const { replySummary } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-reply-summary",
			className: replySummary({ className })
		}, props)
	});
}
function ThreadPanelReplyCount({ className, render, ...props }) {
	const { replyCount } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-reply-count",
			className: replyCount({ className })
		}, props)
	});
}
function ThreadPanelFooter({ className, render, ...props }) {
	const { footer } = threadPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(PanelFooter, {
		...props,
		render,
		"data-slot": "thread-panel-footer",
		className: footer({ className })
	});
}
function ThreadPanelSearch({ className, render, ...props }) {
	const { search } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-search",
			className: search({ className })
		}, props)
	});
}
function ThreadPanelSearchTrailing({ className, render, ...props }) {
	const { searchTrailing } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-search-trailing",
			className: searchTrailing({ className })
		}, props)
	});
}
function ThreadPanelSearchCount({ className, render, ...props }) {
	const { searchCount } = threadPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "thread-panel-search-count",
			className: searchCount({ className })
		}, props)
	});
}
//#endregion
//#region src/components/live-agent-activity-bar/live-agent-activity-beam.tsx
const OUTER_CORE = [
	{
		color: "var(--accent-500)",
		region: 1,
		quad: "tl",
		width: 80,
		height: 19,
		x: "27%",
		y: "0%"
	},
	{
		color: "var(--primary-400)",
		region: 2,
		quad: "tr",
		width: 74,
		height: 11,
		x: "73%",
		y: "-1%"
	},
	{
		color: "var(--accent-500)",
		region: 3,
		quad: "tr",
		width: 15,
		height: 44,
		x: "100%",
		y: "33%"
	},
	{
		color: "var(--accent-500)",
		region: 1,
		quad: "br",
		width: 19,
		height: 38,
		x: "101%",
		y: "72%"
	},
	{
		color: "var(--primary-400)",
		region: 2,
		quad: "br",
		width: 84,
		height: 13,
		x: "67%",
		y: "100%"
	},
	{
		color: "var(--primary-400)",
		region: 3,
		quad: "bl",
		width: 60,
		height: 21,
		x: "24%",
		y: "101%"
	},
	{
		color: "var(--accent-500)",
		region: 1,
		quad: "bl",
		width: 17,
		height: 40,
		x: "0%",
		y: "60%"
	},
	{
		color: "var(--primary-400)",
		region: 2,
		quad: "tl",
		width: 13,
		height: 32,
		x: "-1%",
		y: "28%"
	}
];
const OUTER_BLOOM = [
	{
		...OUTER_CORE[0],
		width: 110,
		height: 30,
		y: "3%"
	},
	{
		...OUTER_CORE[1],
		width: 100,
		height: 20,
		y: "1%"
	},
	{
		...OUTER_CORE[2],
		width: 26,
		height: 62
	},
	{
		...OUTER_CORE[3],
		width: 30,
		height: 56
	},
	{
		...OUTER_CORE[4],
		width: 120,
		height: 22,
		y: "99%"
	},
	{
		...OUTER_CORE[5],
		width: 88,
		height: 32,
		y: "99%"
	},
	{
		...OUTER_CORE[6],
		width: 28,
		height: 58
	}
];
const activityMotionClass = [
	"motion-safe:transition-[transform,opacity,filter] motion-safe:duration-220 motion-safe:ease-slide motion-safe:will-change-[transform,opacity,filter]",
	"data-[motion=entering]:translate-y-2 data-[motion=entering]:opacity-0 data-[motion=entering]:blur-[2px]",
	"data-[motion=exiting]:translate-y-2 data-[motion=exiting]:opacity-0 data-[motion=exiting]:blur-[2px]",
	"motion-reduce:!translate-y-0 motion-reduce:!blur-none motion-reduce:transition-opacity"
].join(" ");
const pulseInstances = /* @__PURE__ */ new Set();
let pulseFrame = null;
let lastPulseFrame = 0;
function drivePulse(timestamp) {
	pulseFrame = requestAnimationFrame(drivePulse);
	if (timestamp - lastPulseFrame < 1e3 / 30 - 2) return;
	lastPulseFrame = timestamp;
	const seconds = timestamp / 1e3;
	for (const { element, config } of pulseInstances) for (const oscillator of config.oscillators) {
		const phase = (seconds - oscillator.delay) / oscillator.period;
		const value = oscillator.a + (oscillator.b - oscillator.a) * ((1 - Math.cos(Math.PI * 2 * phase)) / 2);
		element.style.setProperty(oscillator.prop, oscillator.unit === "px" ? `${value.toFixed(2)}px` : value.toFixed(4));
	}
}
function registerPulseInstance(element, config) {
	const instance = {
		element,
		config
	};
	pulseInstances.add(instance);
	if (pulseFrame === null) {
		lastPulseFrame = 0;
		pulseFrame = requestAnimationFrame(drivePulse);
	}
	return () => {
		pulseInstances.delete(instance);
		if (pulseInstances.size === 0 && pulseFrame !== null) {
			cancelAnimationFrame(pulseFrame);
			pulseFrame = null;
		}
	};
}
function pulseGradient(gradient, id) {
	return `radial-gradient(ellipse calc(${gradient.width}px * var(--bw${gradient.region}-${id}) * var(--pulse-glow-sx, 1)) calc(${gradient.height}px * var(--bh${gradient.region}-${id}) * var(--bgh-${id}) * var(--pulse-glow-sy, 1)) at calc(${gradient.x} + var(--bx${gradient.region}-${id})) calc(${gradient.y} + var(--by${gradient.region}-${id})), color-mix(in srgb, ${gradient.color} calc(var(--bop-${gradient.quad}-${id}) * 100%), transparent), transparent)`;
}
function staticPulseGradient(gradient) {
	return `radial-gradient(ellipse calc(${gradient.width}px * var(--pulse-glow-sx, 1)) calc(${gradient.height}px * var(--pulse-glow-sy, 1)) at ${gradient.x} ${gradient.y}, color-mix(in srgb, ${gradient.color} 82%, transparent), transparent)`;
}
function pulseProperties(id) {
	const numbers = [
		"bw1",
		"bh1",
		"bw2",
		"bh2",
		"bw3",
		"bh3",
		"bgh",
		"bop-tl",
		"bop-tr",
		"bop-bl",
		"bop-br"
	];
	const lengths = [
		"bx1",
		"by1",
		"bx2",
		"by2",
		"bx3",
		"by3"
	];
	const properties = (names, syntax, initial) => names.map((name) => `@property --${name}-${id} { syntax: "${syntax}"; initial-value: ${initial}; inherits: true; }`).join("\n");
	return `${properties(numbers, "<number>", "1")}\n${properties(lengths, "<length>", "0px")}\n@property --beam-opacity-${id} { syntax: "<number>"; initial-value: 0; inherits: true; }`;
}
function pulseDriverConfig(id) {
	const spread = .28;
	const drift = 14;
	const opacity = .46;
	const height = .16;
	const breathe = 2.3;
	const size = 6.4;
	return { oscillators: [
		{
			prop: `--bw1-${id}`,
			a: 1 - spread,
			b: 1.308,
			period: size * .9,
			delay: 0,
			unit: ""
		},
		{
			prop: `--bh1-${id}`,
			a: 1.252,
			b: 1 - spread * .85,
			period: size * 1.26,
			delay: 0,
			unit: ""
		},
		{
			prop: `--bx1-${id}`,
			a: -14,
			b: drift * .9,
			period: breathe * 1.6,
			delay: 0,
			unit: "px"
		},
		{
			prop: `--by1-${id}`,
			a: drift * .55,
			b: -14 * .7,
			period: breathe * 1.6,
			delay: 0,
			unit: "px"
		},
		{
			prop: `--bw2-${id}`,
			a: 1.28,
			b: 1 - spread * .85,
			period: size * 1.1,
			delay: 0,
			unit: ""
		},
		{
			prop: `--bh2-${id}`,
			a: 1 - spread * .8,
			b: 1.294,
			period: size * .81,
			delay: 0,
			unit: ""
		},
		{
			prop: `--bx2-${id}`,
			a: drift * .8,
			b: -14 * .9,
			period: breathe * 1.88,
			delay: 0,
			unit: "px"
		},
		{
			prop: `--by2-${id}`,
			a: -14,
			b: drift * .65,
			period: breathe * 1.88,
			delay: 0,
			unit: "px"
		},
		{
			prop: `--bw3-${id}`,
			a: 1 - spread * .6,
			b: 1.322,
			period: size * .98,
			delay: 0,
			unit: ""
		},
		{
			prop: `--bh3-${id}`,
			a: 1.21,
			b: 1 - spread,
			period: size * 1.4,
			delay: 0,
			unit: ""
		},
		{
			prop: `--bx3-${id}`,
			a: -14 * .6,
			b: drift,
			period: breathe * 1.45,
			delay: 0,
			unit: "px"
		},
		{
			prop: `--by3-${id}`,
			a: -14 * .85,
			b: drift * .45,
			period: breathe * 1.45,
			delay: 0,
			unit: "px"
		},
		{
			prop: `--bgh-${id}`,
			a: 1 - height,
			b: 1.16,
			period: 2.4,
			delay: 0,
			unit: ""
		},
		{
			prop: `--bop-tl-${id}`,
			a: 1 - opacity,
			b: 1,
			period: breathe,
			delay: 0,
			unit: ""
		},
		{
			prop: `--bop-tr-${id}`,
			a: 1 - opacity,
			b: 1,
			period: breathe * 1.32,
			delay: breathe * .28,
			unit: ""
		},
		{
			prop: `--bop-bl-${id}`,
			a: 1 - opacity,
			b: 1,
			period: breathe * .84,
			delay: breathe * .55,
			unit: ""
		},
		{
			prop: `--bop-br-${id}`,
			a: 1 - opacity,
			b: 1,
			period: breathe * 1.58,
			delay: breathe * .83,
			unit: ""
		}
	] };
}
function beamStyles(id, borderRadius) {
	const core = OUTER_CORE.map((gradient) => pulseGradient(gradient, id)).join(",\n");
	const bloom = OUTER_BLOOM.map(staticPulseGradient).join(",\n");
	return `${pulseProperties(id)}
[data-beam="${id}"] { position: relative; border-radius: ${borderRadius}px; overflow: visible; isolation: isolate; }
[data-beam="${id}"] { animation: beam-fade-in-${id} 0.6s ease forwards; }
[data-beam="${id}"]::after { content: ""; position: absolute; inset: 0; border-radius: ${borderRadius}px; padding: 1px; clip-path: inset(0 round ${borderRadius}px); background: ${core}; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude; pointer-events: none; z-index: 2; opacity: calc(var(--beam-opacity-${id}) * 0.94 * var(--beam-strength, 1)); filter: brightness(1.90) saturate(0.85); }
[data-beam="${id}"]::before { content: ""; position: absolute; inset: -10px; z-index: -1; border-radius: ${borderRadius + 10}px; background: ${core}; transform: scale(0.95, 0.9); pointer-events: none; opacity: calc(var(--beam-opacity-${id}) * 0.34 * var(--beam-strength, 1)); filter: blur(3px) brightness(1.90) saturate(0.85); }
[data-beam="${id}"] [data-beam-bloom] { position: absolute; inset: -30px; z-index: -1; border-radius: ${borderRadius + 30}px; background: ${bloom}; transform: scale(0.95, 0.9); pointer-events: none; opacity: calc(var(--beam-opacity-${id}) * 0.30 * var(--beam-strength, 1)); filter: blur(22.5px) brightness(1.90) saturate(0.85); }
@keyframes beam-fade-in-${id} { to { --beam-opacity-${id}: 1; } }
@media (prefers-reduced-motion: reduce) { [data-beam="${id}"] { --beam-opacity-${id}: 1; animation: none; } }`;
}
function LiveAgentActivityBeam({ children, enabled = true, motion }) {
	const id = useId().replace(/:/g, "-");
	const rootRef = useRef(null);
	const [visible, setVisible] = useState(true);
	const [borderRadius, setBorderRadius] = useState(16);
	const [glowScale, setGlowScale] = useState({
		x: 1,
		y: 1
	});
	useEffect(() => {
		if (!enabled) return;
		const root = rootRef.current;
		if (!root) return;
		const child = root.firstElementChild;
		if (!child) return;
		const measure = () => {
			const styles = getComputedStyle(child);
			const radius = parseFloat(styles.borderTopLeftRadius);
			if (!Number.isNaN(radius) && radius > 0) setBorderRadius(radius);
			const bounds = child.getBoundingClientRect();
			if (!bounds.width || !bounds.height) return;
			const clamp = (value) => Math.max(.35, Math.min(4, value));
			const x = +clamp(bounds.width / 350).toFixed(3);
			const y = +clamp(bounds.height / 140).toFixed(3);
			setGlowScale((previous) => previous.x === x && previous.y === y ? previous : {
				x,
				y
			});
		};
		measure();
		const resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(child);
		return () => resizeObserver.disconnect();
	}, [children, enabled]);
	useEffect(() => {
		if (!enabled) return;
		const root = rootRef.current;
		if (!root || typeof IntersectionObserver === "undefined") return;
		const observer = new IntersectionObserver((entries) => setVisible(entries[0]?.isIntersecting ?? true), { rootMargin: "256px" });
		observer.observe(root);
		return () => observer.disconnect();
	}, [enabled]);
	useEffect(() => {
		if (!enabled) return;
		const root = rootRef.current;
		if (!root || !visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		return registerPulseInstance(root, pulseDriverConfig(id));
	}, [
		enabled,
		id,
		visible
	]);
	const styles = useMemo(() => beamStyles(id, borderRadius), [borderRadius, id]);
	const style = {
		"--beam-strength": .82,
		"--pulse-glow-sx": glowScale.x,
		"--pulse-glow-sy": glowScale.y
	};
	return /* @__PURE__ */ jsxs(Fragment$1, { children: [enabled ? /* @__PURE__ */ jsx("style", { children: styles }) : null, /* @__PURE__ */ jsxs("div", {
		ref: rootRef,
		"data-beam": enabled ? id : void 0,
		"data-motion": motion,
		className: activityMotionClass,
		style: enabled ? style : void 0,
		children: [children, enabled ? /* @__PURE__ */ jsx("div", {
			"aria-hidden": true,
			"data-beam-bloom": ""
		}) : null]
	})] });
}
//#endregion
//#region src/components/live-agent-activity-bar/live-agent-activity-bar.tsx
const liveAgentActivityBar = tv$1({
	slots: {
		root: ["shrink-0 px-3 py-2"],
		row: ["flex min-h-8 items-center gap-2"],
		avatar: ["overflow-hidden"],
		content: ["flex min-w-0 flex-1 items-center gap-1.5"],
		status: [],
		text: ["min-w-0 truncate text-sm"]
	},
	variants: { theme: {
		brutal: {
			root: "border-t-2 border-black bg-white px-4 md:bg-brutal-cream",
			status: "border-black",
			text: "font-mono text-black/60"
		},
		elegant: {
			root: "rounded-lg border border-line-muted bg-layer-panel shadow-raft-md dark:border-transparent",
			content: "contents",
			status: "order-first",
			text: "flex-1 font-sans text-[13px] font-normal text-foreground-muted"
		}
	} }
});
const EXIT_DURATION = 220;
function LiveAgentActivityBarRoot({ children, className, render, ...props }) {
	const theme = useThemeFamily();
	const { root } = liveAgentActivityBar({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"aria-live": "polite",
			"data-slot": "live-agent-activity-bar",
			"data-testid": "live-agent-activity-bar",
			className: root({ className }),
			children
		}, props)
	});
}
function ElegantLiveAgentActivityMotion({ beam = true, children, ...activityBarProps }) {
	const [transition, setTransition] = useState({
		children,
		motion: "entered"
	});
	const [renderedChildren, setRenderedChildren] = useState(children);
	if (children !== renderedChildren) {
		setRenderedChildren(children);
		setTransition((previous) => {
			if (children != null) {
				const motion = previous.children == null || previous.motion === "exiting" ? "entering" : previous.motion;
				return previous.children === children && previous.motion === motion ? previous : {
					children,
					motion
				};
			}
			return previous.children == null ? previous : {
				...previous,
				motion: "exiting"
			};
		});
	}
	useEffect(() => {
		if (transition.motion !== "entering") return;
		const frame = requestAnimationFrame(() => setTransition((previous) => previous.motion === "entering" ? {
			...previous,
			motion: "entered"
		} : previous));
		return () => cancelAnimationFrame(frame);
	}, [transition.motion]);
	useEffect(() => {
		if (transition.motion !== "exiting") return;
		const timeout = window.setTimeout(() => setTransition((previous) => ({
			...previous,
			children: null
		})), EXIT_DURATION);
		return () => window.clearTimeout(timeout);
	}, [transition.motion]);
	if (transition.children == null) return null;
	return /* @__PURE__ */ jsx(LiveAgentActivityBeam, {
		enabled: beam,
		motion: transition.motion,
		children: /* @__PURE__ */ jsx(LiveAgentActivityBarRoot, {
			...activityBarProps,
			children: transition.children
		})
	});
}
function LiveAgentActivityBar({ beam = true, children, className, render, ...props }) {
	if (useThemeFamily() === "elegant") return /* @__PURE__ */ jsx(ElegantLiveAgentActivityMotion, {
		beam,
		className,
		render,
		...props,
		children
	});
	return children == null ? null : /* @__PURE__ */ jsx(LiveAgentActivityBarRoot, {
		className,
		render,
		...props,
		children
	});
}
function LiveAgentActivityBarRow({ className, render, ...props }) {
	const { row } = liveAgentActivityBar();
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "live-agent-activity-bar-row",
			className: row({ className })
		}, props)
	});
}
function LiveAgentActivityBarAvatar({ children, className, render, ...props }) {
	const { avatar } = liveAgentActivityBar();
	return /* @__PURE__ */ jsxs(Avatar, {
		render: render ?? /* @__PURE__ */ jsx("div", {}),
		size: "xs",
		type: "agent",
		className: avatar({ className }),
		...props,
		children: [children, /* @__PURE__ */ jsx(AvatarFallback, {})]
	});
}
function LiveAgentActivityBarContent({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { content } = liveAgentActivityBar({ theme });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "live-agent-activity-bar-content",
			className: content({ className })
		}, props)
	});
}
function LiveAgentActivityBarStatus({ className, ...props }) {
	const theme = useThemeFamily();
	const { status } = liveAgentActivityBar({ theme });
	return /* @__PURE__ */ jsx(Status, {
		"aria-hidden": true,
		size: "md",
		variant: "primary",
		pulse: true,
		className: status({ className }),
		...props
	});
}
function LiveAgentActivityBarText({ className, render, ...props }) {
	const theme = useThemeFamily();
	const { text } = liveAgentActivityBar({ theme });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "live-agent-activity-bar-text",
			className: text({ className })
		}, props)
	});
}
//#endregion
//#region src/components/tasks/task-status.recipe.ts
const taskStatus = tv$1({
	variants: {
		theme: {
			brutal: "",
			elegant: ""
		},
		status: {
			todo: "",
			"in-progress": "",
			"in-review": "",
			done: "",
			closed: ""
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			status: "todo",
			class: "bg-brutal-orange"
		},
		{
			theme: "brutal",
			status: "in-progress",
			class: "bg-brutal-cyan"
		},
		{
			theme: "brutal",
			status: "in-review",
			class: "bg-brutal-lavender"
		},
		{
			theme: "brutal",
			status: "done",
			class: "bg-brutal-lime"
		},
		{
			theme: "brutal",
			status: "closed",
			class: "bg-brutal-stone"
		},
		{
			theme: "elegant",
			status: "todo",
			class: "bg-ink-8 text-foreground-muted"
		},
		{
			theme: "elegant",
			status: "in-progress",
			class: "bg-primary-400 text-primary-950"
		},
		{
			theme: "elegant",
			status: "in-review",
			class: "bg-warning text-warning-foreground"
		},
		{
			theme: "elegant",
			status: "done",
			class: "bg-success text-success-foreground"
		},
		{
			theme: "elegant",
			status: "closed",
			class: "bg-inactive text-inactive-foreground"
		}
	]
});
//#endregion
//#region src/components/tasks/task-status-icon.tsx
const TASK_STATUS_ICON_COLORS = {
	todo: "var(--foreground-placeholder)",
	"in-progress": "oklch(0.8 0.19 88.97)",
	"in-review": "oklch(0.72 0.16 58)",
	done: "var(--success)",
	closed: "var(--inactive)"
};
function TodoIcon(props) {
	return /* @__PURE__ */ jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "1.2 1.2 21.6 21.6",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		...props,
		children: [/* @__PURE__ */ jsx("path", {
			stroke: "none",
			d: "M0 0h24v24H0z",
			fill: "none"
		}), /* @__PURE__ */ jsx("path", { d: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" })]
	});
}
function InProgressIcon(props) {
	return /* @__PURE__ */ jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "1.2 1.2 21.6 21.6",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		...props,
		children: [
			/* @__PURE__ */ jsx("path", {
				stroke: "none",
				d: "M0 0h24v24H0z",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("path", { d: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }),
			/* @__PURE__ */ jsx("path", { d: "M12 3v18" }),
			/* @__PURE__ */ jsx("path", { d: "M12 14l7 -7" }),
			/* @__PURE__ */ jsx("path", { d: "M12 19l8.5 -8.5" }),
			/* @__PURE__ */ jsx("path", { d: "M12 9l4.5 -4.5" })
		]
	});
}
function InReviewIcon(props) {
	return /* @__PURE__ */ jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "1.2 1.2 21.6 21.6",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		...props,
		children: [
			/* @__PURE__ */ jsx("path", {
				stroke: "none",
				d: "M0 0h24v24H0z",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("path", { d: "M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" }),
			/* @__PURE__ */ jsx("path", { d: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" })
		]
	});
}
function DoneIcon(props) {
	return /* @__PURE__ */ jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "1.2 1.2 21.6 21.6",
		fill: "currentColor",
		...props,
		children: [
			/* @__PURE__ */ jsx("path", {
				stroke: "none",
				d: "M0 0h24v24H0z",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("path", { d: "M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336z" }),
			/* @__PURE__ */ jsx("path", {
				d: "m8.5 12 2.5 2.5 4.5 -5",
				fill: "none",
				stroke: "var(--foreground-inverse)",
				strokeWidth: 2.25,
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		]
	});
}
function ClosedIcon(props) {
	return /* @__PURE__ */ jsxs("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "1.2 1.2 21.6 21.6",
		fill: "currentColor",
		...props,
		children: [
			/* @__PURE__ */ jsx("path", {
				stroke: "none",
				d: "M0 0h24v24H0z",
				fill: "none"
			}),
			/* @__PURE__ */ jsx("path", { d: "M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336z" }),
			/* @__PURE__ */ jsx("path", {
				d: "m8.5 8.5 7 7m0 -7 -7 7",
				fill: "none",
				stroke: "var(--foreground-inverse)",
				strokeWidth: 2.25,
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})
		]
	});
}
const TASK_STATUS_ICONS = {
	todo: TodoIcon,
	"in-progress": InProgressIcon,
	"in-review": InReviewIcon,
	done: DoneIcon,
	closed: ClosedIcon
};
function TaskStatusIconRoot({ status, className }) {
	const theme = useThemeFamily();
	const Icon = TASK_STATUS_ICONS[status];
	return /* @__PURE__ */ jsx(Icon, {
		"aria-hidden": true,
		"data-slot": "task-status-icon",
		className,
		color: theme === "brutal" ? "currentColor" : TASK_STATUS_ICON_COLORS[status]
	});
}
function TaskTodoIcon(props) {
	return /* @__PURE__ */ jsx(TaskStatusIconRoot, {
		status: "todo",
		...props
	});
}
function TaskInProgressIcon(props) {
	return /* @__PURE__ */ jsx(TaskStatusIconRoot, {
		status: "in-progress",
		...props
	});
}
function TaskInReviewIcon(props) {
	return /* @__PURE__ */ jsx(TaskStatusIconRoot, {
		status: "in-review",
		...props
	});
}
function TaskDoneIcon(props) {
	return /* @__PURE__ */ jsx(TaskStatusIconRoot, {
		status: "done",
		...props
	});
}
function TaskClosedIcon(props) {
	return /* @__PURE__ */ jsx(TaskStatusIconRoot, {
		status: "closed",
		...props
	});
}
function TaskStatusIcon({ status, className }) {
	return /* @__PURE__ */ jsx(TaskStatusIconRoot, {
		status,
		className
	});
}
//#endregion
//#region src/components/task-board/task-board-column.recipe.ts
const taskBoardColumn = tv$1({
	slots: {
		root: "group flex w-80 shrink-0 self-start flex-col p-3",
		trigger: ["group flex w-full touch-manipulation items-center justify-between gap-3 text-left outline-none", "data-[panel-open]:mb-3"],
		heading: ["flex min-w-0 items-center gap-2"],
		badge: ["px-2 py-0.5", "text-[10px]"],
		count: ["text-xs leading-4"],
		chevron: [
			"inline-flex shrink-0 -rotate-90 items-center transition-transform",
			"[&_svg]:size-3.5",
			"group-data-panel-open:rotate-0",
			"motion-reduce:transition-none"
		],
		panel: ["data-ending-style:hidden"],
		items: ["flex flex-col gap-2.5"],
		empty: ["px-3 py-5", "group-data-[drop-state=allowed]:hidden"],
		emptyIdle: ["group-data-[drop-state=allowed]:hidden group-data-[drop-state=blocked]:hidden"],
		emptyAllowed: ["hidden group-data-[drop-state=allowed]:block"],
		emptyBlocked: ["hidden group-data-[drop-state=blocked]:block"]
	},
	variants: { theme: {
		brutal: {
			root: [
				"border-2 border-line-strong/20 bg-layer-panel/30 transition-colors",
				"data-[drop-state=allowed]:border-line-strong data-[drop-state=allowed]:bg-primary/20 data-[drop-state=allowed]:shadow-raft-sm",
				"data-[drop-state=blocked]:border-danger data-[drop-state=blocked]:bg-danger-soft",
				"has-[[data-slot=task-drop-placeholder][data-drop-state=allowed]]:border-line-strong has-[[data-slot=task-drop-placeholder][data-drop-state=allowed]]:bg-primary/20 has-[[data-slot=task-drop-placeholder][data-drop-state=allowed]]:shadow-raft-sm",
				"has-[[data-slot=task-drop-placeholder][data-drop-state=blocked]]:border-danger has-[[data-slot=task-drop-placeholder][data-drop-state=blocked]]:bg-danger-soft"
			],
			trigger: ["focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black"],
			badge: [
				"inline-flex items-center gap-1 border border-line-strong",
				"font-heading font-bold uppercase text-foreground-strong",
				"[&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:text-foreground-strong"
			],
			count: ["font-mono text-foreground-strong/50"],
			chevron: ["text-foreground-strong/50", "group-hover:text-foreground-strong"],
			empty: [
				"border-2 border-dashed border-line-strong/20",
				"text-sm leading-5 text-foreground-strong/40",
				"group-data-[drop-state=allowed]:border-line-strong group-data-[drop-state=allowed]:text-foreground-strong/60",
				"group-data-[drop-state=blocked]:border-danger group-data-[drop-state=blocked]:text-danger-strong"
			]
		},
		elegant: {
			root: [
				"rounded-[10px] bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))]",
				"dark:bg-layer-card",
				"data-[drop-collapsed=true]:data-[drop-state=allowed]:[outline:1px_dashed_var(--line-muted)]"
			],
			heading: ["gap-1.5"],
			trigger: [
				"rounded-md pl-3 pr-0",
				"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
				"focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-panel",
				"dark:focus-visible:ring-offset-layer-card",
				"forced-colors:focus-visible:outline-[CanvasText]"
			],
			badge: [
				"inline-flex items-center gap-1.5 px-0 py-0",
				"font-sans text-xs leading-4 font-medium text-foreground-muted",
				"[&_svg]:size-3.5 [&_svg]:shrink-0"
			],
			count: ["font-sans font-medium tabular-nums text-foreground-placeholder"],
			chevron: ["text-foreground-icon", "group-hover:text-foreground-strong"],
			empty: [
				"rounded-lg border border-dashed border-line-muted bg-layer-panel",
				"text-[13px] leading-4.5 text-foreground-placeholder",
				"group-data-[drop-state=blocked]:border-danger/40 group-data-[drop-state=blocked]:text-danger-strong"
			]
		}
	} }
});
//#endregion
//#region src/components/task-board/task-board.tsx
function TaskBoardRoot({ className, render, ...props }) {
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-board-root",
			className: cn("flex min-w-max items-start gap-4 pr-4", className)
		}, props)
	});
}
function TaskBoardColumn({ className, render, ...props }) {
	const { root } = taskBoardColumn({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Collapsible.Root, {
		"data-slot": "task-board-column",
		className: root({ className }),
		render: render ?? /* @__PURE__ */ jsx("section", {}),
		...props
	});
}
function TaskBoardColumnTrigger({ className, ...props }) {
	const { trigger } = taskBoardColumn({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Collapsible.Trigger, {
		"data-slot": "task-board-column-trigger",
		className: trigger({ className }),
		...props
	});
}
function TaskBoardColumnHeading({ className, render, ...props }) {
	const { heading } = taskBoardColumn({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-heading",
			className: heading({ className })
		}, props)
	});
}
function TaskBoardColumnBadge({ status, children, className, render, ...props }) {
	const theme = useThemeFamily();
	const { badge } = taskBoardColumn({ theme });
	const resolvedChildren = /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(TaskStatusIcon, { status }), children] });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-badge",
			className: cn(badge(), theme === "brutal" && taskStatus({
				theme,
				status
			}), className)
		}, props, { children: resolvedChildren })
	});
}
function TaskBoardColumnCount({ className, render, ...props }) {
	const { count } = taskBoardColumn({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-count",
			className: count({ className })
		}, props)
	});
}
function TaskBoardColumnChevron({ className, render, ...props }) {
	const { chevron } = taskBoardColumn({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-chevron",
			className: chevron({ className })
		}, props)
	});
}
function TaskBoardColumnPanel({ className, ...props }) {
	const { panel } = taskBoardColumn({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Collapsible.Panel, {
		"data-slot": "task-board-column-panel",
		className: panel({ className }),
		...props
	});
}
function TaskBoardColumnItems({ className, render, ...props }) {
	const { items } = taskBoardColumn({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-items",
			className: items({ className })
		}, props)
	});
}
function TaskBoardColumnEmpty({ className, render, ...props }) {
	const { empty } = taskBoardColumn({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-empty",
			className: empty({ className })
		}, props)
	});
}
function TaskBoardColumnEmptyIdle({ className, render, ...props }) {
	const { emptyIdle } = taskBoardColumn({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-empty-idle",
			className: emptyIdle({ className })
		}, props)
	});
}
function TaskBoardColumnEmptyAllowed({ className, render, ...props }) {
	const { emptyAllowed } = taskBoardColumn({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-empty-allowed",
			className: emptyAllowed({ className })
		}, props)
	});
}
function TaskBoardColumnEmptyBlocked({ className, render, ...props }) {
	const { emptyBlocked } = taskBoardColumn({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-board-column-empty-blocked",
			className: emptyBlocked({ className })
		}, props)
	});
}
//#endregion
//#region src/components/task-card/task-card-status.recipe.ts
const taskCardStatus = tv$1({
	base: [
		"inline-flex min-w-0 shrink-0 touch-manipulation items-center gap-1",
		"transition-[filter,opacity] duration-100 outline-none",
		"disabled:cursor-not-allowed disabled:opacity-60",
		"data-[busy=true]:pointer-events-none data-[busy=true]:cursor-wait data-[busy=true]:opacity-60 data-[busy=true]:disabled:opacity-100"
	],
	variants: { theme: {
		brutal: [
			"ml-auto border-2 border-line-strong px-2 py-px",
			"text-[10px] leading-4 font-semibold text-foreground-strong",
			"[&:not(:has([data-slot=task-card-status-label]))]:hidden",
			"[&_svg]:pointer-events-none [&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:text-foreground-strong",
			"**:data-[slot=task-card-status-label]:inline-flex **:data-[slot=task-card-status-label]:items-center [&_[data-slot=task-card-status-label]]:gap-1",
			"hover:brightness-90",
			"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black"
		],
		elegant: [
			"flex h-3.5 items-center rounded-sm border border-transparent p-0 leading-none",
			"has-data-[slot=task-card-status-label]:hidden",
			"[&>svg]:pointer-events-none [&>svg]:shrink-0",
			"[&>svg[data-slot=task-status-icon]]:size-3.5",
			"transition-[filter,opacity]",
			"hover:brightness-[0.96] active:scale-[0.985]",
			"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
			"focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-1 focus-visible:ring-offset-layer-panel",
			"forced-colors:focus-visible:outline-[CanvasText]"
		]
	} }
});
//#endregion
//#region src/components/task-card/task-card.recipe.ts
const taskCard = tv$1({
	slots: {
		root: [
			"relative w-full px-3 py-2.5 text-left",
			"transition-all duration-100",
			"data-[interactive=true]:cursor-pointer",
			"data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[disabled=true]:transform-none",
			"group-data-[dragging=true]/task-draggable:transform-none group-data-[dragging=true]/task-draggable:shadow-raft-sm",
			"motion-reduce:transform-none motion-reduce:transition-none"
		],
		row: ["flex min-w-0 items-start gap-2"],
		body: ["min-w-0 flex-1"],
		meta: ["mb-1.5 flex min-w-0 flex-nowrap items-center gap-2"],
		channel: ["text-xs leading-4"],
		number: ["shrink-0 text-[11px]"],
		legacy: ["shrink-0 px-1.5 py-0.5 text-[10px]"],
		title: ["line-clamp-3 wrap-break-word"],
		description: ["mt-2 line-clamp-2 wrap-break-word"]
	},
	variants: { theme: {
		brutal: {
			root: ["border-2 border-line-strong bg-layer-panel shadow-raft-sm", "hover:-translate-y-px hover:shadow-raft-md"],
			meta: ["flex-nowrap"],
			channel: ["min-w-0 truncate", "font-bold text-foreground-strong/60"],
			number: ["font-mono text-foreground-strong/35"],
			legacy: ["border border-line-muted", "font-heading font-bold text-foreground-strong/50"],
			title: ["text-sm leading-5 font-bold text-foreground-strong"],
			description: ["text-xs leading-4 text-foreground-strong/70"]
		},
		elegant: {
			root: [
				"rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
				"hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))] group-data-[drop-over=true]/task-draggable:hover:bg-layer-panel data-[interactive=true]:active:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
				"dark:border-transparent"
			],
			channel: ["min-w-0 truncate font-medium text-foreground-muted"],
			meta: ["gap-1.5"],
			number: ["font-sans leading-3.5 font-medium tabular-nums text-foreground-placeholder"],
			legacy: ["rounded-sm border border-line-muted bg-fill-muted", "font-sans leading-3 font-medium tracking-[0.2px] text-foreground-muted"],
			title: ["text-sm leading-5 font-medium text-foreground"],
			description: ["text-[13px] leading-4.5 text-foreground-muted"]
		}
	} }
});
//#endregion
//#region src/components/task-card/task-card.tsx
function TaskCard({ busy = false, disabled = false, className, render, ...props }) {
	const { root } = taskCard({ theme: useThemeFamily() });
	const interactive = props.onClick != null;
	return useRender({
		defaultTagName: "article",
		render,
		props: mergeProps({
			"data-slot": "task-card",
			"aria-busy": busy || void 0,
			"aria-disabled": disabled || void 0,
			"data-busy": busy ? "true" : void 0,
			"data-disabled": disabled ? "true" : void 0,
			"data-interactive": interactive ? "true" : void 0,
			className: root({ className })
		}, props)
	});
}
function TaskCardRow({ className, render, ...props }) {
	const { row } = taskCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-card-row",
			className: row({ className })
		}, props)
	});
}
function TaskCardBody({ className, render, ...props }) {
	const { body } = taskCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-card-body",
			className: body({ className })
		}, props)
	});
}
function TaskCardMeta({ className, render, ...props }) {
	const { meta } = taskCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-card-meta",
			className: meta({ className })
		}, props)
	});
}
function TaskCardChannel({ className, render, ...props }) {
	const { channel } = taskCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-card-channel",
			className: channel({ className })
		}, props)
	});
}
function TaskCardNumber({ className, render, ...props }) {
	const { number } = taskCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-card-number",
			className: number({ className })
		}, props)
	});
}
function TaskCardLegacy({ className, render, ...props }) {
	const { legacy } = taskCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-card-legacy",
			className: legacy({ className })
		}, props)
	});
}
function TaskCardTitle({ className, render, ...props }) {
	const { title } = taskCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "p",
		render,
		props: mergeProps({
			"data-slot": "task-card-title",
			className: title({ className })
		}, props)
	});
}
function TaskCardDescription({ className, render, ...props }) {
	const { description } = taskCard({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "p",
		render,
		props: mergeProps({
			"data-slot": "task-card-description",
			className: description({ className })
		}, props)
	});
}
function TaskCardStatus({ busy = false, status, className, render, children, ...props }) {
	const theme = useThemeFamily();
	const styles = taskCardStatus({ theme });
	const resolvedChildren = children ?? /* @__PURE__ */ jsx(TaskStatusIcon, { status });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: "button",
			"data-slot": "task-card-status",
			"data-busy": busy ? "true" : void 0,
			"aria-busy": busy || void 0,
			className: cn(styles, theme === "brutal" && taskStatus({
				theme,
				status
			}), className)
		}, props, { children: resolvedChildren })
	});
}
//#endregion
//#region src/components/task-dnd/task-dnd.recipe.ts
const taskDnd = tv$1({
	slots: {
		draggable: [
			"group/task-draggable relative cursor-grab touch-none active:cursor-grabbing",
			"outline-none",
			"data-[dragging=true]:z-20 data-[dragging=true]:will-change-transform",
			"data-[disabled=true]:cursor-default data-[disabled=true]:touch-auto"
		],
		overlay: "group/task-drag-overlay pointer-events-none",
		placeholder: "hidden w-full shrink-0"
	},
	variants: { theme: {
		brutal: {
			draggable: ["focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black", "data-[dragging=true]:opacity-90"],
			overlay: ["z-20 opacity-90", "**:data-[slot=task-card]:shadow-raft-md"],
			placeholder: [
				"h-(--task-dnd-placeholder-height,72px) border-2 border-dashed border-line-strong",
				"bg-primary/20",
				"data-[drop-state=allowed]:block"
			]
		},
		elegant: {
			draggable: [
				"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
				"focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted",
				"dark:focus-visible:ring-offset-layer-card",
				"forced-colors:focus-visible:outline-[CanvasText]"
			],
			placeholder: [
				"h-(--task-dnd-placeholder-height,72px) rounded-lg border border-dashed border-line-muted",
				"bg-[color-mix(in_oklch,var(--ink)_4%,var(--layer-panel))]",
				"data-[drop-state=allowed]:block"
			]
		}
	} }
});
//#endregion
//#region src/components/task-dnd/task-dnd.tsx
const TaskDndContext = createContext(null);
const EMPTY_OVER_SNAPSHOT = {
	overId: null,
	overPlacement: null,
	overData: void 0
};
const EMPTY_OVER_STORE = createTaskDndOverStore();
const TaskDndOverContext = createContext(null);
const allowTaskDrop = () => true;
function TaskDndProvider({ children, disabled = false, isDropAllowed = allowTaskDrop, onMove, onMoveError, onDragStart, onDragMove, onDragOver, onDragCancel, onDragEnd }) {
	const id = useId();
	const [activeId, setActiveId] = useState(null);
	const [activeHeight, setActiveHeight] = useState(null);
	const overStoreRef = useRef(null);
	if (overStoreRef.current == null) overStoreRef.current = createTaskDndOverStore();
	const overStore = overStoreRef.current;
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 200,
		tolerance: 5
	} }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const context = useMemo(() => ({
		activeId,
		activeHeight,
		isDropAllowed
	}), [
		activeHeight,
		activeId,
		isDropAllowed
	]);
	const reset = useCallback(() => {
		setActiveId(null);
		setActiveHeight(null);
		overStore.update(EMPTY_OVER_SNAPSHOT);
	}, [overStore]);
	return /* @__PURE__ */ jsx(DndContext, {
		id,
		sensors: disabled ? [] : sensors,
		onDragStart: (event) => {
			overStore.update(EMPTY_OVER_SNAPSHOT);
			setActiveId(event.active.id);
			setActiveHeight(event.active.rect.current.initial?.height ?? null);
			onDragStart?.(event);
		},
		onDragMove: (event) => {
			const current = overStore.getSnapshot();
			overStore.update({
				...current,
				overPlacement: getDropPlacement(event)
			});
			onDragMove?.(event);
		},
		onDragOver: (event) => {
			overStore.update({
				overId: event.over?.id ?? null,
				overPlacement: getDropPlacement(event),
				overData: event.over?.data.current
			});
			onDragOver?.(event);
		},
		onDragCancel: (event) => {
			reset();
			onDragCancel?.(event);
		},
		onDragEnd: (event) => {
			const nextActiveId = event.active.id;
			const nextOverId = event.over?.id;
			const nextOverData = event.over?.data.current;
			if (nextOverId != null && isDropAllowed(nextActiveId, nextOverId, nextOverData)) {
				const details = {
					activeId: nextActiveId,
					overId: nextOverId,
					overData: nextOverData,
					placement: getDropPlacement(event)
				};
				Promise.resolve(onMove?.(details)).catch((error) => {
					onMoveError?.(error, details);
				});
			}
			reset();
			onDragEnd?.(event);
		},
		children: /* @__PURE__ */ jsx(TaskDndContext, {
			value: context,
			children: /* @__PURE__ */ jsx(TaskDndOverContext, {
				value: overStore,
				children
			})
		})
	});
}
function TaskDraggable({ id, disabled = false, dropId, dropData, dropDisabled = false, className, ref: consumerRef, style, ...props }) {
	const { draggable } = taskDnd({ theme: useThemeFamily() });
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id,
		disabled
	});
	const { setNodeRef: setDropNodeRef, isOver: isDropOver } = useDroppable({
		id: dropId ?? id,
		data: dropData,
		disabled: dropId == null || dropDisabled
	});
	const dragStyle = {
		transform: CSS.Translate.toString(transform),
		...style
	};
	const mergedRef = useCallback((node) => {
		setNodeRef(node);
		setDropNodeRef(node);
		assignRef(consumerRef, node);
	}, [
		consumerRef,
		setDropNodeRef,
		setNodeRef
	]);
	return /* @__PURE__ */ jsx("div", {
		...mergeProps(attributes, listeners, props),
		ref: mergedRef,
		"data-slot": "task-draggable",
		"data-dragging": isDragging ? "true" : void 0,
		"data-drop-over": isDropOver ? "true" : void 0,
		"data-disabled": disabled ? "true" : void 0,
		className: draggable({ className }),
		style: dragStyle
	});
}
function assignRef(ref, value) {
	if (typeof ref === "function") ref(value);
	else if (ref) ref.current = value;
}
function TaskDropZone({ id, data, disabled = false, render, ...props }) {
	const context = use(TaskDndContext);
	const { setNodeRef, isOver } = useDroppable({
		id,
		data,
		disabled
	});
	const dropState = getDropState(context, id, isOver, data);
	return useRender({
		defaultTagName: "div",
		render,
		ref: setNodeRef,
		state: { dropState },
		props: {
			"data-slot": "task-drop-zone",
			"data-drop-state": dropState,
			...props
		}
	});
}
function TaskDropPlaceholder({ id, placement, className, render, style, ...props }) {
	const theme = useThemeFamily();
	const context = use(TaskDndContext);
	const overStore = use(TaskDndOverContext) ?? EMPTY_OVER_STORE;
	const { placeholder } = taskDnd({ theme });
	const dropState = useSyncExternalStore(overStore.subscribe, () => getPlaceholderDropState(context, overStore.getSnapshot(), id, placement), () => "idle");
	const placeholderStyle = {
		...style,
		...context?.activeHeight == null ? {} : { "--task-dnd-placeholder-height": `${context.activeHeight}px` }
	};
	return useRender({
		defaultTagName: "div",
		render,
		state: { dropState },
		props: {
			"aria-hidden": true,
			"data-slot": "task-drop-placeholder",
			"data-drop-state": dropState,
			className: placeholder({ className }),
			style: placeholderStyle,
			...props
		}
	});
}
function TaskDragOverlay({ children, className }) {
	const { overlay } = taskDnd({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(DragOverlay, {
		dropAnimation: null,
		children: children == null ? null : /* @__PURE__ */ jsx("div", {
			"data-slot": "task-drag-overlay",
			"data-dragging": "true",
			className: overlay({ className }),
			children
		})
	});
}
function getDropPlacement(event) {
	const activeRect = event.active.rect.current.translated ?? event.active.rect.current.initial;
	const overRect = event.over?.rect;
	if (activeRect == null || overRect == null) return null;
	return activeRect.top + activeRect.height / 2 < overRect.top + overRect.height / 2 ? "before" : "after";
}
function getDropState(context, id, isOver, overData) {
	const activeId = context?.activeId ?? null;
	if (!isOver || activeId == null) return "idle";
	return context?.isDropAllowed(activeId, id, overData) ? "allowed" : "blocked";
}
function getPlaceholderDropState(context, over, id, placement) {
	return getDropState(context, id, over.overId === id && (placement == null || over.overPlacement === placement), over.overData);
}
function createTaskDndOverStore() {
	let snapshot = EMPTY_OVER_SNAPSHOT;
	const listeners = /* @__PURE__ */ new Set();
	return {
		getSnapshot: () => snapshot,
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		update: (nextSnapshot) => {
			if (snapshot.overId === nextSnapshot.overId && snapshot.overPlacement === nextSnapshot.overPlacement && snapshot.overData === nextSnapshot.overData) return;
			snapshot = nextSnapshot;
			listeners.forEach((listener) => listener());
		}
	};
}
//#endregion
//#region src/components/task-list/task-list-section.recipe.ts
const taskListSection = tv$1({
	slots: {
		root: ["space-y-3.5"],
		trigger: ["group flex w-full touch-manipulation items-center justify-between gap-3 text-left outline-none", "disabled:cursor-default"],
		heading: ["flex min-w-0 items-center gap-2"],
		badge: ["px-2 py-0.5", "text-[10px]"],
		count: ["text-xs leading-4"],
		chevron: [
			"inline-flex shrink-0 -rotate-90 items-center transition-transform",
			"[&_svg]:size-3.5",
			"group-data-panel-open:rotate-0",
			"motion-reduce:transition-none"
		],
		panel: ["data-ending-style:hidden"],
		items: ["space-y-2.5"],
		empty: ["px-3 py-5"]
	},
	variants: { theme: {
		brutal: {
			trigger: ["focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black"],
			badge: [
				"inline-flex items-center gap-1 border border-line-strong",
				"font-heading font-bold uppercase text-foreground-strong",
				"[&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:text-foreground-strong"
			],
			count: ["font-mono text-foreground-strong/50"],
			chevron: ["text-foreground-strong/50", "group-hover:text-foreground-strong"],
			empty: ["border-2 border-dashed border-line-strong/20", "text-sm leading-5 text-foreground-strong/40"]
		},
		elegant: {
			root: ["rounded-[10px] bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))] p-3 shadow-raft-xs", "dark:bg-layer-card"],
			items: ["[&_[data-slot=task-card]:hover]:bg-ink-2/3"],
			heading: ["gap-1.5"],
			trigger: [
				"rounded-md pl-0.5 pr-[5px]",
				"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
				"focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted",
				"dark:focus-visible:ring-offset-layer-card",
				"forced-colors:focus-visible:outline-[CanvasText]"
			],
			badge: [
				"inline-flex items-center gap-1.5 px-0 py-0",
				"font-sans text-xs leading-4 font-medium text-foreground-muted",
				"[&_svg]:size-3.5 [&_svg]:shrink-0"
			],
			count: ["font-sans font-medium tabular-nums text-foreground-placeholder"],
			chevron: ["text-foreground-icon", "group-hover:text-foreground-strong"],
			empty: ["rounded-lg border border-dashed border-line-muted bg-fill-muted", "text-[13px] leading-4.5 text-foreground-placeholder"]
		}
	} }
});
//#endregion
//#region src/components/task-list/task-list.tsx
function TaskListRoot({ className, render, ...props }) {
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-list-root",
			className: cn("space-y-6", className)
		}, props)
	});
}
function TaskSection({ className, render, ...props }) {
	const { root } = taskListSection({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Collapsible.Root, {
		"data-slot": "task-section",
		className: root({ className }),
		render: render ?? /* @__PURE__ */ jsx("section", {}),
		...props
	});
}
function TaskSectionTrigger({ className, ...props }) {
	const { trigger } = taskListSection({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Collapsible.Trigger, {
		"data-slot": "task-section-trigger",
		className: trigger({ className }),
		...props
	});
}
function TaskSectionHeading({ className, render, ...props }) {
	const { heading } = taskListSection({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-section-heading",
			className: heading({ className })
		}, props)
	});
}
function TaskSectionBadge({ status, children, className, render, ...props }) {
	const theme = useThemeFamily();
	const { badge } = taskListSection({ theme });
	const resolvedChildren = /* @__PURE__ */ jsxs(Fragment$1, { children: [/* @__PURE__ */ jsx(TaskStatusIcon, { status }), children] });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-section-badge",
			className: cn(badge(), theme === "brutal" && taskStatus({
				theme,
				status
			}), className)
		}, props, { children: resolvedChildren })
	});
}
function TaskSectionCount({ className, render, ...props }) {
	const { count } = taskListSection({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-section-count",
			className: count({ className })
		}, props)
	});
}
function TaskSectionChevron({ className, render, ...props }) {
	const { chevron } = taskListSection({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-section-chevron",
			className: chevron({ className })
		}, props)
	});
}
function TaskSectionPanel({ className, ...props }) {
	const { panel } = taskListSection({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Collapsible.Panel, {
		"data-slot": "task-section-panel",
		className: panel({ className }),
		...props
	});
}
function TaskSectionItems({ className, render, ...props }) {
	const { items } = taskListSection({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-section-items",
			className: items({ className })
		}, props)
	});
}
function TaskSectionEmpty({ className, render, ...props }) {
	const { empty } = taskListSection({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-section-empty",
			className: empty({ className })
		}, props)
	});
}
//#endregion
//#region src/components/tasks/tasks-panel.recipe.ts
const tasksPanel = tv$1({
	slots: {
		root: ["flex min-h-0 min-w-0 flex-1 flex-col bg-layer-panel", "dark:bg-transparent"],
		toolbar: [
			"grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2",
			"px-4 py-3",
			"md:flex md:flex-wrap md:items-center md:justify-between"
		],
		toolbarGroup: ["flex flex-wrap items-center gap-2"],
		toolbarNewTask: ["col-start-1 row-start-1 justify-self-start", "flex flex-wrap items-center gap-2"],
		toolbarFilters: [
			"col-span-2 row-start-2 min-w-0",
			"only:col-auto only:row-auto",
			"md:mr-auto",
			"flex flex-wrap items-center gap-2"
		],
		toolbarView: ["col-start-2 row-start-1 justify-self-end", "flex flex-wrap items-center gap-2"],
		toolbarLabel: ["inline-flex items-center text-xs leading-4", "[&_svg]:size-3.5 [&_svg]:shrink-0 [&>svg:last-child]:size-3"],
		viewport: ["min-h-0 flex-1 overflow-auto overscroll-contain p-4", "pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"],
		empty: ["flex h-full flex-col items-center justify-center"]
	},
	variants: { theme: {
		brutal: {
			toolbar: ["border-b-2 border-line-strong bg-layer-panel"],
			toolbarLabel: ["gap-2 border-2 border-line-muted bg-layer-panel px-3 py-1.5", "font-heading font-bold text-foreground-strong/70"],
			viewport: ["bg-layer-panel"]
		},
		elegant: {
			toolbar: [
				"border-b border-line-muted bg-layer-panel px-7",
				"max-md:pl-5 max-md:pr-3.5",
				"dark:bg-transparent"
			],
			toolbarLabel: [
				"gap-1.5 rounded-sm border border-transparent bg-transparent px-2.5 py-[7px]",
				"shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)]",
				"font-sans font-medium text-foreground-muted"
			],
			toolbarView: ["[&_[data-slot=tabs-list]]:gap-2"],
			viewport: [
				"bg-layer-panel px-7",
				"max-md:pl-5 max-md:pr-3.5",
				"dark:bg-transparent"
			]
		}
	} }
});
//#endregion
//#region src/components/tasks/tasks-panel.tsx
function TasksPanelRoot({ className, render, ...props }) {
	const { root } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "section",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-root",
			className: root({ className })
		}, props)
	});
}
function TasksPanelToolbar({ className, render, ...props }) {
	const { toolbar } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-toolbar",
			className: toolbar({ className })
		}, props)
	});
}
function TasksPanelToolbarGroup({ className, render, ...props }) {
	const { toolbarGroup } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-toolbar-group",
			className: toolbarGroup({ className })
		}, props)
	});
}
function TasksPanelToolbarNewTask({ className, render, ...props }) {
	const { toolbarNewTask } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-toolbar-new-task",
			className: toolbarNewTask({ className })
		}, props)
	});
}
function TasksPanelToolbarFilters({ className, render, ...props }) {
	const { toolbarFilters } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-toolbar-filters",
			className: toolbarFilters({ className })
		}, props)
	});
}
function TasksPanelToolbarView({ className, render, ...props }) {
	const { toolbarView } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-toolbar-view",
			className: toolbarView({ className })
		}, props)
	});
}
function TasksPanelToolbarLabel({ className, render, ...props }) {
	const { toolbarLabel } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-toolbar-label",
			className: toolbarLabel({ className })
		}, props)
	});
}
function TasksPanelViewport({ className, render, ...props }) {
	const { viewport } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-viewport",
			className: viewport({ className })
		}, props)
	});
}
function TasksPanelEmpty({ className, render, ...props }) {
	const { empty } = tasksPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "tasks-panel-empty",
			className: empty({ className })
		}, props)
	});
}
//#endregion
//#region src/components/tasks/task-loading.recipe.ts
const taskLoading = tv$1({
	slots: {
		list: ["flex flex-col gap-2"],
		row: ["flex min-w-0 flex-col gap-1.5 p-3"]
	},
	variants: { theme: {
		brutal: { row: ["rounded-sm border-2 border-line-strong/30"] },
		elegant: { row: ["rounded-lg border border-line-muted bg-layer-panel shadow-raft-sm", "dark:border-transparent"] }
	} }
});
//#endregion
//#region src/components/tasks/task-loading.tsx
function TaskLoadingList({ className, render, ...props }) {
	const { list } = taskLoading({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-loading-list",
			"aria-busy": true,
			className: list({ className })
		}, props)
	});
}
function TaskLoadingRow({ className, render, ...props }) {
	const { row } = taskLoading({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "task-loading-row",
			"aria-hidden": true,
			className: row({ className })
		}, props)
	});
}
//#endregion
//#region src/components/tasks/task-chip.tsx
const taskChip = tv$1({
	slots: { root: [
		"inline-flex max-w-full items-center gap-1.5 align-baseline overflow-hidden rounded-full border px-2 py-0 font-medium [font-size:inherit] leading-[1.4] tracking-normal whitespace-nowrap",
		"[&>svg]:shrink-0 [&>svg]:size-3",
		"text-foreground no-underline select-text",
		"transition-[filter,opacity] duration-100 hover:brightness-[0.96]",
		"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong"
	] },
	variants: {
		theme: {
			brutal: {},
			elegant: {}
		},
		status: {
			todo: {},
			"in-progress": {},
			"in-review": {},
			done: {},
			closed: {}
		},
		variant: {
			default: {},
			inline: {}
		}
	},
	compoundVariants: [
		{
			theme: "brutal",
			status: [
				"todo",
				"in-progress",
				"in-review",
				"done",
				"closed"
			],
			class: { root: "gap-1 align-bottom rounded-none border-black px-1 py-0 text-[13px] font-medium leading-tight text-black hover:brightness-90" }
		},
		{
			theme: "elegant",
			status: "todo",
			class: { root: "border-[color-mix(in_oklch,var(--line-muted)_75%,transparent)] bg-ink-4 text-foreground" }
		},
		{
			theme: "elegant",
			status: "in-progress",
			class: { root: "border-primary-500/75 bg-primary-500/10 text-primary-800 dark:text-primary-strong" }
		},
		{
			theme: "elegant",
			status: "in-review",
			class: { root: "border-warning/75 bg-warning/10 text-warning-strong" }
		},
		{
			theme: "elegant",
			status: "done",
			class: { root: "border-success/75 bg-success/10 text-success-strong" }
		},
		{
			theme: "elegant",
			status: "closed",
			class: { root: "border-[color-mix(in_oklch,var(--line-muted)_75%,transparent)] bg-ink-4 text-foreground" }
		},
		{
			theme: "elegant",
			status: [
				"todo",
				"in-progress",
				"in-review",
				"done",
				"closed"
			],
			class: { root: ["h-[19px] align-middle -mt-px gap-1.5 text-[13px] font-normal leading-none"] }
		},
		{
			theme: "elegant",
			variant: "default",
			status: [
				"todo",
				"in-progress",
				"in-review",
				"done",
				"closed"
			],
			class: { root: "border-[0.5px]" }
		},
		{
			variant: "inline",
			status: [
				"todo",
				"in-progress",
				"in-review",
				"done",
				"closed"
			],
			class: { root: ["h-[19px] align-middle -mt-px gap-1.5 rounded-full border-0 bg-fill-muted py-0 pr-2 pl-1", "text-[12px] font-[450] leading-none text-foreground-muted hover:brightness-100 [&>svg]:size-3"] }
		},
		{
			theme: "brutal",
			variant: "inline",
			status: [
				"todo",
				"in-progress",
				"in-review",
				"done",
				"closed"
			],
			class: { root: ["gap-1 align-bottom rounded-none border border-black px-1 py-0", "text-[13px] font-medium leading-tight text-black hover:brightness-90 [&>svg]:size-3"] }
		}
	],
	defaultVariants: { variant: "default" }
});
function TaskChip({ status, loading = false, variant = "default", className, render, children, ...props }) {
	const theme = useThemeFamily();
	const { root } = taskChip({
		theme,
		status,
		variant
	});
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "task-chip",
			"data-inline-reference": "",
			"data-loading": loading ? "true" : void 0,
			className: cn(root({ className }), theme === "brutal" && taskStatus({
				theme,
				status
			}), loading && "pointer-events-none opacity-60"),
			children
		}, props),
		state: {
			slot: "task-chip",
			status
		}
	});
}
//#endregion
//#region src/components/legacy-task-panel/legacy-task-panel.recipe.ts
const legacyTaskPanel = tv$1({
	slots: {
		frame: ["size-full min-h-[512px]  max-w-md overflow-hidden"],
		icon: ["flex size-9 shrink-0 items-center justify-center"],
		title: ["flex flex-col items-start gap-0.5 overflow-visible whitespace-normal"],
		body: ["space-y-4 overflow-y-auto px-5 py-4"],
		status: ["flex flex-wrap items-center gap-2"],
		section: ["p-4"],
		field: [],
		fieldLabel: ["mb-1 font-mono text-xs"],
		fieldTitle: ["m-0 text-lg wrap-break-word"],
		fieldText: ["m-0 text-sm whitespace-pre-wrap wrap-break-word"],
		meta: ["space-y-2 p-4 text-sm"],
		metaRow: ["flex items-start justify-between gap-3"],
		metaLabel: ["font-mono"],
		metaValue: ["text-right"]
	},
	variants: {
		theme: {
			brutal: {
				frame: ["border-2 border-black shadow-raft-md"],
				icon: ["border-2 border-black bg-primary text-black"],
				section: ["space-y-3 border-2 border-black bg-white shadow-raft-md"],
				fieldLabel: ["text-black/40"],
				fieldTitle: ["font-bold text-black"],
				fieldText: ["text-black/80"],
				meta: ["border-2 border-black bg-white shadow-raft-md"],
				metaLabel: ["text-black/50"],
				metaValue: ["text-black"]
			},
			elegant: {
				frame: ["rounded-xl border border-line-muted shadow-raft-sm", "dark:border-transparent"],
				icon: ["rounded-md border-[0.5px] border-line-muted bg-layer-panel text-foreground-icon"],
				section: ["space-y-3 rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs", "dark:border-transparent"],
				fieldLabel: ["text-foreground-muted"],
				fieldTitle: ["font-heading font-medium text-foreground"],
				fieldText: ["text-foreground/80"],
				meta: ["rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs", "dark:border-transparent"],
				metaLabel: ["text-xs text-foreground-placeholder"],
				metaValue: ["text-foreground"]
			}
		},
		framed: {
			true: {},
			false: {}
		}
	}
});
//#endregion
//#region src/components/legacy-task-panel/legacy-task-panel.tsx
function LegacyTaskPanelRoot({ className, framed = false, render, children, ...props }) {
	if (!framed) return /* @__PURE__ */ jsx(ThreadPanelRoot, {
		"data-slot": "legacy-task-panel-root",
		className,
		render,
		...props,
		children
	});
	return /* @__PURE__ */ jsx(LegacyTaskPanelFrame, {
		className,
		render,
		...props,
		children
	});
}
function LegacyTaskPanelFrame({ className, render, children, ...props }) {
	const { frame } = legacyTaskPanel({
		theme: useThemeFamily(),
		framed: true
	});
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-frame",
			className: frame({ className }),
			children: /* @__PURE__ */ jsx(ThreadPanelRoot, {
				"data-slot": "legacy-task-panel-root",
				children
			})
		}, props)
	});
}
function LegacyTaskPanelHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx(ThreadPanelHeader, {
		"data-slot": "legacy-task-panel-header",
		className,
		...props
	});
}
function LegacyTaskPanelIcon({ className, render, children, ...props }) {
	const { icon } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-icon",
			className: icon({ className }),
			children: children ?? /* @__PURE__ */ jsx(FileText, {
				"aria-hidden": true,
				size: 18
			})
		}, props)
	});
}
function LegacyTaskPanelTitle({ className, ...props }) {
	const { title } = legacyTaskPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ThreadPanelTitle, {
		"data-slot": "legacy-task-panel-title",
		className: title({ className }),
		...props
	});
}
function LegacyTaskPanelTitleMeta({ className, ...props }) {
	return /* @__PURE__ */ jsx(ThreadPanelTitleMeta, {
		"data-slot": "legacy-task-panel-title-meta",
		className,
		...props
	});
}
function LegacyTaskPanelActions({ className, ...props }) {
	return /* @__PURE__ */ jsx(ThreadPanelActions, {
		"data-slot": "legacy-task-panel-actions",
		className,
		...props
	});
}
function LegacyTaskPanelBody({ className, children, ...props }) {
	const { body } = legacyTaskPanel({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(ThreadPanelContent, {
		"data-slot": "legacy-task-panel-content",
		...props,
		children: /* @__PURE__ */ jsx(ThreadPanelBody, {
			"data-slot": "legacy-task-panel-body",
			className: body({ className }),
			children
		})
	});
}
function LegacyTaskPanelStatus({ className, render, ...props }) {
	const { status } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-status",
			className: status({ className })
		}, props)
	});
}
function LegacyTaskPanelSection({ className, render, ...props }) {
	const { section } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "section",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-section",
			className: section({ className })
		}, props)
	});
}
function LegacyTaskPanelField({ className, render, ...props }) {
	const { field } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-field",
			className: field({ className })
		}, props)
	});
}
function LegacyTaskPanelFieldLabel({ className, render, ...props }) {
	const { fieldLabel } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "p",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-field-label",
			className: fieldLabel({ className })
		}, props)
	});
}
function LegacyTaskPanelFieldTitle({ className, render, ...props }) {
	const { fieldTitle } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "h3",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-field-title",
			className: fieldTitle({ className })
		}, props)
	});
}
function LegacyTaskPanelFieldText({ className, render, ...props }) {
	const { fieldText } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "p",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-field-text",
			className: fieldText({ className })
		}, props)
	});
}
function LegacyTaskPanelMeta({ className, render, ...props }) {
	const { meta } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "section",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-meta",
			className: meta({ className })
		}, props)
	});
}
function LegacyTaskPanelMetaRow({ className, render, ...props }) {
	const { metaRow } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-meta-row",
			className: metaRow({ className })
		}, props)
	});
}
function LegacyTaskPanelMetaLabel({ className, render, ...props }) {
	const { metaLabel } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-meta-label",
			className: metaLabel({ className })
		}, props)
	});
}
function LegacyTaskPanelMetaValue({ className, render, ...props }) {
	const { metaValue } = legacyTaskPanel({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "legacy-task-panel-meta-value",
			className: metaValue({ className })
		}, props)
	});
}
//#endregion
//#region src/components/activity-inbox/activity-inbox-shell.recipe.ts
const activityInboxShell = tv$1({
	slots: {
		panel: ["flex h-full min-h-0 flex-1 flex-col overflow-hidden"],
		viewport: ["relative flex-1 overflow-y-auto"],
		loadingMore: ["py-3 text-center text-xs"]
	},
	variants: { theme: {
		brutal: {
			panel: ["bg-white text-black"],
			viewport: ["bg-white p-3", "pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"],
			loadingMore: ["font-bold text-black/40"]
		},
		elegant: {
			panel: ["bg-layer-canvas-muted text-foreground", "md:[&>[data-panel-frame-header]]:pl-3"],
			viewport: ["bg-layer-panel dark:bg-transparent", "px-7 pb-[env(safe-area-inset-bottom,0px)] max-md:pl-5 max-md:pr-3.5"],
			loadingMore: ["font-medium text-foreground-placeholder"]
		}
	} }
});
//#endregion
//#region src/components/activity-inbox/activity-inbox-shell.tsx
function ActivityInboxPanel({ className, ...props }) {
	const { panel } = activityInboxShell({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Panel, {
		render: /* @__PURE__ */ jsx("div", {}),
		edge: "inset",
		"data-slot": "activity-inbox-root",
		className: panel({ className }),
		...props
	});
}
function ActivityInboxViewport({ className, ...props }) {
	const { viewport } = activityInboxShell({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "activity-inbox-viewport",
		className: viewport({ className }),
		...props
	});
}
function ActivityInboxLoadingMore({ className, ...props }) {
	const { loadingMore } = activityInboxShell({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "activity-inbox-loading-more",
		className: loadingMore({ className }),
		...props
	});
}
//#endregion
//#region src/components/activity-inbox/activity-inbox-sidebar.recipe.ts
const activityInboxSidebar = tv$1({
	slots: {
		sidebar: [
			"w-48 shrink-0",
			"max-md:hidden",
			"md:flex"
		],
		sidebarBody: [],
		sidebarContent: ["p-3"]
	},
	variants: { theme: {
		brutal: {
			sidebar: ["border-r-2 border-black"],
			sidebarBody: ["bg-white"],
			sidebarContent: [
				"[&_[data-slot=sidebar-group-label]]:mt-5 [&_[data-slot=sidebar-group-label]]:mb-1",
				"**:data-[slot=sidebar-group-label]:flex **:data-[slot=sidebar-group-label]:items-center [&_[data-slot=sidebar-group-label]]:gap-2",
				"[&_[data-slot=sidebar-group-label]]:px-2 [&_[data-slot=sidebar-group-label]]:py-0",
				"**:data-[slot=sidebar-group-label]:font-sans [&_[data-slot=sidebar-group-label]]:font-black [&_[data-slot=sidebar-group-label]]:tracking-widest **:data-[slot=sidebar-group-label]:text-black/40 **:data-[slot=sidebar-group-label]:uppercase",
				"**:data-activity-inbox-show-all:font-sans **:data-activity-inbox-show-all:text-[10px] [&_[data-activity-inbox-show-all]]:font-black",
				"[&_[data-activity-inbox-show-all]]:tracking-normal **:data-activity-inbox-show-all:whitespace-nowrap **:data-activity-inbox-show-all:normal-case",
				"**:data-activity-inbox-show-all:text-black/50 **:data-activity-inbox-show-all:underline **:data-activity-inbox-show-all:decoration-2 **:data-activity-inbox-show-all:underline-offset-2",
				"[&_[data-activity-inbox-show-all]:hover]:text-black"
			]
		},
		elegant: {
			sidebar: ["w-56", "dark:bg-layer-canvas-muted"],
			sidebarContent: [
				"[&_[data-slot=sidebar-group-label]]:mt-5 [&_[data-slot=sidebar-group-label]]:mb-1",
				"**:data-[slot=sidebar-group-label]:flex **:data-[slot=sidebar-group-label]:items-center [&_[data-slot=sidebar-group-label]]:gap-2",
				"[&_[data-slot=sidebar-group-label]]:px-2 [&_[data-slot=sidebar-group-label]]:py-0",
				"**:data-[slot=sidebar-group-label]:font-sans [&_[data-slot=sidebar-group-label]]:font-medium **:data-[slot=sidebar-group-label]:text-foreground-placeholder **:data-[slot=sidebar-group-label]:normal-case",
				"**:data-activity-inbox-show-all:font-sans **:data-activity-inbox-show-all:text-[10px] [&_[data-activity-inbox-show-all]]:font-medium",
				"[&_[data-activity-inbox-show-all]]:tracking-normal **:data-activity-inbox-show-all:whitespace-nowrap **:data-activity-inbox-show-all:normal-case",
				"**:data-activity-inbox-show-all:text-foreground-placeholder **:data-activity-inbox-show-all:underline-offset-2 **:data-activity-inbox-show-all:outline-none",
				"[&_[data-activity-inbox-show-all]:hover]:text-foreground-muted [&_[data-activity-inbox-show-all]:hover]:underline",
				"[&_[data-activity-inbox-show-all]:focus-visible]:text-foreground-muted [&_[data-activity-inbox-show-all]:focus-visible]:underline"
			]
		}
	} }
});
//#endregion
//#region src/components/activity-inbox/activity-inbox-sidebar.tsx
function ActivityInboxSidebar({ className, children, ...props }) {
	const { sidebar, sidebarBody, sidebarContent } = activityInboxSidebar({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(SidebarRoot, {
		render: /* @__PURE__ */ jsx("aside", {}),
		"data-slot": "activity-inbox-sidebar",
		className: sidebar({ className }),
		...props,
		children: /* @__PURE__ */ jsx(SidebarBody, {
			className: sidebarBody(),
			children: /* @__PURE__ */ jsx(SidebarContent, {
				className: sidebarContent(),
				children
			})
		})
	});
}
//#endregion
//#region src/components/activity-inbox/activity-inbox-toolbar.recipe.ts
const activityInboxToolbar = tv$1({
	slots: {
		controls: ["flex shrink-0 flex-nowrap items-center gap-2 px-3 py-2.5"],
		selectionToolbar: [
			"flex min-h-11 shrink-0 items-center gap-2 px-3",
			"max-md:flex-wrap max-md:py-2",
			"md:h-11 md:flex-nowrap md:py-0"
		],
		selectionCount: ["mr-1 text-xs"]
	},
	variants: { theme: {
		brutal: {
			controls: ["border-b-2 border-black bg-white"],
			selectionToolbar: [
				"border-b-2 border-black bg-black/3",
				"pl-[26px]",
				"**:data-[activity-inbox-action=primary]:bg-brutal-cyan **:data-[activity-inbox-action=primary]:text-foreground-strong [&_[data-activity-inbox-action=primary]:hover]:bg-brutal-cyan",
				"**:data-[activity-inbox-action=sort]:font-mono [&_[data-activity-inbox-action=sort]]:font-bold **:data-[activity-inbox-action=sort]:text-black/60",
				"[&_[data-activity-inbox-action=sort]:hover]:border-transparent [&_[data-activity-inbox-action=sort]:hover]:bg-transparent [&_[data-activity-inbox-action=sort]:hover]:text-black"
			],
			selectionCount: ["font-black text-black"]
		},
		elegant: {
			controls: [
				"border-b border-line-hairline bg-layer-panel",
				"dark:border-line-hairline dark:bg-transparent",
				"px-7 max-md:pl-5 max-md:pr-3.5 md:py-3",
				"md:[&_[data-slot=tabs-list]]:h-[34px] md:[&_[data-slot=tabs-tab]]:h-8 md:[&_[data-slot=tabs-tab]]:py-1.5",
				"md:[&_[data-slot=input-group]]:h-[34px] md:[&_[data-slot=input-group-control]]:py-1.5"
			],
			selectionToolbar: [
				"pr-7 pl-[52.5px] max-md:pr-3.5 max-md:pl-[44.5px]",
				"[&_[data-activity-inbox-action=sort]]:font-medium",
				"[&_[data-activity-inbox-action=sort]:hover]:bg-transparent [&_[data-activity-inbox-action=sort]:hover]:text-foreground-strong"
			],
			selectionCount: ["font-medium text-foreground-strong"]
		}
	} }
});
//#endregion
//#region src/components/activity-inbox/activity-inbox-toolbar.tsx
function ActivityInboxControls({ className, ...props }) {
	const { controls } = activityInboxToolbar({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "activity-inbox-controls",
		className: controls({ className }),
		...props
	});
}
function ActivityInboxSelectionToolbar({ className, ...props }) {
	const { selectionToolbar } = activityInboxToolbar({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "activity-inbox-selection-toolbar",
		className: selectionToolbar({ className }),
		...props
	});
}
function ActivityInboxSelectionCount({ className, ...props }) {
	const { selectionCount } = activityInboxToolbar({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("span", {
		"data-slot": "activity-inbox-selection-count",
		className: selectionCount({ className }),
		...props
	});
}
//#endregion
//#region src/components/inbox-item/inbox-item.recipe.ts
const inboxItem = tv$1({
	slots: {
		item: [
			"relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-3 text-left",
			"has-data-[slot=inbox-item-selection]:grid-cols-[auto_minmax(0,1fr)_auto]",
			"transition-colors"
		],
		itemTrigger: ["absolute inset-0 z-0 outline-none"],
		itemSelection: ["relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center"],
		itemContent: ["pointer-events-none relative z-10 min-w-0 flex-1 text-left"],
		itemContext: ["flex min-w-0 items-center gap-2 py-0.5"],
		itemSubtitle: ["mb-0.5 min-w-0 py-0.5 text-[11px] leading-3"],
		itemHeading: ["mb-0.5 flex min-w-0 items-start gap-2"],
		itemTitle: ["relative line-clamp-2 min-w-0 flex-1 pl-[18px] text-sm leading-5", "[&>svg]:absolute [&>svg]:top-[3px] [&>svg]:left-0 [&>svg]:size-3.5"],
		itemTrailing: [
			"pointer-events-none relative z-10 -mt-1.5",
			"flex shrink-0 items-center gap-3",
			"max-md:flex-col-reverse max-md:items-end max-md:gap-0.5"
		],
		itemTimestamp: ["shrink-0 whitespace-nowrap text-right text-xs leading-5 tabular-nums"],
		itemBody: ["line-clamp-2 text-xs leading-4"],
		itemMessage: ["min-w-0"],
		itemSender: [],
		itemMetadata: ["mt-1 flex min-h-5 flex-wrap items-center gap-1.5"],
		itemActions: ["pointer-events-auto flex shrink-0 items-center gap-1.5"]
	},
	variants: { theme: {
		brutal: {
			item: [
				"border-2 border-black/30 bg-white",
				"hover:border-black hover:shadow-raft-sm",
				"active:border-black active:shadow-raft-sm",
				"data-disabled:pointer-events-none data-disabled:hover:border-black/30 data-disabled:hover:shadow-none",
				"data-[active=true]:border-black data-[active=true]:shadow-raft-sm",
				"data-[active=true]:hover:border-black data-[active=true]:hover:shadow-raft-sm",
				"has-[[data-slot=inbox-item-open]:focus-visible]:border-black has-[[data-slot=inbox-item-open]:focus-visible]:shadow-raft-sm"
			],
			itemContext: ["mb-1 py-0 text-xs leading-4 font-bold text-black/45"],
			itemSubtitle: ["font-bold text-black/45"],
			itemTitle: [
				"font-semibold text-black/55",
				"group-data-[unread=true]/inbox-item:font-bold",
				"group-data-[unread=true]/inbox-item:text-black",
				"[&>svg]:text-black/45"
			],
			itemTimestamp: ["font-mono text-black/40"],
			itemTrailing: ["-mt-1"],
			itemBody: ["text-black/55", "group-data-[unread=true]/inbox-item:text-black"],
			itemMessage: ["line-clamp-3 text-sm leading-5 text-black"],
			itemSender: ["font-bold text-black/70"],
			itemActions: [
				"[&>[data-slot=panel-toggle-action][data-pressed]]:bg-white",
				"[&>[data-slot=panel-toggle-action][data-pressed]]:text-brutal-orange",
				"[&>[data-slot=panel-toggle-action][data-pressed]:hover]:bg-white",
				"[&>[data-slot=panel-toggle-action][data-pressed]:hover]:text-brutal-orange"
			]
		},
		elegant: {
			item: [
				"p-3",
				"rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
				"transition-[background-color,border-color] duration-150",
				"hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
				"dark:border-transparent",
				"data-disabled:pointer-events-none",
				"data-[active=true]:border-transparent data-[active=true]:ring-1 data-[active=true]:ring-primary-400 data-[active=true]:ring-offset-2 data-[active=true]:ring-offset-layer-canvas-muted",
				"dark:data-[active=true]:ring-2",
				"has-[[data-slot=inbox-item-open]:focus-visible]:ring-1 has-[[data-slot=inbox-item-open]:focus-visible]:ring-primary-400",
				"dark:has-[[data-slot=inbox-item-open]:focus-visible]:ring-2 dark:has-[[data-slot=inbox-item-open]:focus-visible]:ring-primary-400/60"
			],
			itemContext: ["mb-1 text-xs leading-4 tracking-[-0.01em]", "font-medium text-foreground-placeholder"],
			itemSubtitle: ["mb-1 text-xs leading-4 tracking-[-0.01em]", "font-medium text-foreground-placeholder"],
			itemHeading: ["mb-1"],
			itemTitle: [
				"text-sm leading-5 font-medium tracking-[-0.01em] text-foreground",
				"group-data-[unread=true]/inbox-item:text-foreground-strong",
				"[&>svg]:text-foreground-icon"
			],
			itemTimestamp: ["text-[11px] leading-5 font-medium tabular-nums", "text-foreground-placeholder"],
			itemBody: [
				"text-[13px] leading-4.5",
				"tracking-[-0.01em] text-foreground-muted",
				"group-data-[unread=true]/inbox-item:text-foreground"
			],
			itemMessage: ["line-clamp-2 text-[13px] leading-4.5", "tracking-[-0.01em] text-foreground-muted"],
			itemMetadata: ["mt-2"],
			itemSender: ["font-medium text-foreground"],
			itemActions: [
				"gap-0.5",
				"[&>[data-slot=panel-toggle-action][data-pressed]]:bg-transparent",
				"[&>[data-slot=panel-toggle-action][data-pressed]]:text-primary-400",
				"[&>[data-slot=panel-toggle-action][data-pressed]:hover]:bg-fill-strong/80",
				"[&>[data-slot=panel-toggle-action][data-pressed]:hover]:text-primary-400",
				"dark:[&>[data-slot=panel-toggle-action][data-pressed]]:bg-fill-muted",
				"dark:[&>[data-slot=panel-toggle-action][data-pressed]:hover]:bg-fill-strong"
			]
		}
	} }
});
//#endregion
//#region src/components/inbox-item/inbox-item.tsx
const InboxItemDisabledContext = createContext(false);
function InboxItem({ active = false, className, disabled = false, render, ...props }) {
	const { item } = inboxItem({ theme: useThemeFamily() });
	const element = useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"aria-disabled": disabled || void 0,
			"data-active": active ? "true" : void 0,
			"data-disabled": disabled ? "true" : void 0,
			"data-slot": "inbox-item",
			className: item({ className: `group/inbox-item ${className ?? ""}`.trim() })
		}, props)
	});
	return /* @__PURE__ */ jsx(InboxItemDisabledContext.Provider, {
		value: disabled,
		children: element
	});
}
function InboxItemTrigger({ className, onClick, render, ...props }) {
	const disabled = useContext(InboxItemDisabledContext);
	const { itemTrigger } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			type: render ? void 0 : "button",
			"aria-disabled": disabled || void 0,
			"data-disabled": disabled ? "true" : void 0,
			"data-slot": "inbox-item-open",
			disabled: render ? void 0 : disabled,
			tabIndex: disabled && render ? -1 : void 0,
			className: itemTrigger({ className }),
			onClick: (event) => {
				if (disabled) {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				onClick?.(event);
			}
		}, props)
	});
}
function InboxItemSelection({ className, render, ...props }) {
	const { itemSelection } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-selection",
			className: itemSelection({ className })
		}, props)
	});
}
function InboxItemContent({ className, render, ...props }) {
	const { itemContent } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-content",
			className: itemContent({ className })
		}, props)
	});
}
function InboxItemContext({ className, render, ...props }) {
	const { itemContext } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-context",
			className: itemContext({ className })
		}, props)
	});
}
function InboxItemSubtitle({ className, render, ...props }) {
	const { itemSubtitle } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-subtitle",
			className: itemSubtitle({ className })
		}, props)
	});
}
function InboxItemHeading({ className, render, ...props }) {
	const { itemHeading } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-heading",
			className: itemHeading({ className })
		}, props)
	});
}
function InboxItemTitle({ className, render, ...props }) {
	const { itemTitle } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-title",
			className: itemTitle({ className })
		}, props)
	});
}
function InboxItemTrailing({ className, render, ...props }) {
	const { itemTrailing } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-trailing",
			className: itemTrailing({ className })
		}, props)
	});
}
function InboxItemTimestamp({ className, render, ...props }) {
	const { itemTimestamp } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-timestamp",
			className: itemTimestamp({ className })
		}, props)
	});
}
function InboxItemBody({ className, render, ...props }) {
	const { itemBody } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "p",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-body",
			className: itemBody({ className })
		}, props)
	});
}
function InboxItemMessage({ className, render, ...props }) {
	const { itemMessage } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "p",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-message",
			className: itemMessage({ className })
		}, props)
	});
}
function InboxItemSender({ className, render, ...props }) {
	const { itemSender } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-sender",
			className: itemSender({ className })
		}, props)
	});
}
function InboxItemMetadata({ className, render, ...props }) {
	const { itemMetadata } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-metadata",
			className: itemMetadata({ className })
		}, props)
	});
}
function InboxItemActions({ className, render, ...props }) {
	const { itemActions } = inboxItem({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "inbox-item-actions",
			className: itemActions({ className })
		}, props)
	});
}
//#endregion
//#region src/components/search/search.recipe.ts
const search = tv$1({
	slots: {
		frame: "flex h-full min-h-0 flex-1 flex-col",
		filtersRow: "shrink-0 px-4 py-3",
		viewport: ["min-h-0 flex-1 overflow-y-auto p-4"],
		summary: ["mb-3 block px-1 text-xs"],
		section: ["mb-3"],
		sectionHeading: ["px-1 py-2"],
		list: ["flex flex-col gap-2"]
	},
	variants: { theme: {
		brutal: {
			frame: "bg-white",
			filtersRow: "border-b-2 border-black bg-white",
			viewport: "bg-white",
			summary: ["font-bold uppercase tracking-widest text-black/60"],
			sectionHeading: ["font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/50"]
		},
		elegant: {
			frame: "bg-layer-canvas-muted dark:bg-layer-canvas-muted",
			filtersRow: [
				"border-b border-line-muted bg-layer-panel",
				"px-7 max-md:pl-5 max-md:pr-3.5",
				"dark:bg-transparent"
			],
			viewport: ["bg-layer-panel dark:bg-transparent", "px-7 max-md:pl-5 max-md:pr-3.5"],
			summary: ["font-medium", "text-foreground-muted"],
			section: ["rounded-[10px] bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))] p-3 shadow-raft-xs", "dark:bg-layer-card"],
			sectionHeading: ["px-0 pt-0 pb-2.5 text-xs font-medium", "text-foreground-muted"],
			list: ["gap-2.5"]
		}
	} }
});
//#endregion
//#region src/components/search/search.tsx
function SearchShellRoot({ className, edge = "inset", render, ...props }) {
	const { frame } = search({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx(Panel, {
		...props,
		render: render ?? /* @__PURE__ */ jsx("div", {}),
		edge,
		className: frame({ className })
	});
}
function SearchShellFilters({ className, ...props }) {
	const { filtersRow } = search({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "search-shell-filters",
		className: filtersRow({ className }),
		...props
	});
}
function SearchShellViewport({ className, ...props }) {
	const { viewport } = search({ theme: useThemeFamily() });
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "search-shell-viewport",
		className: viewport({ className }),
		...props
	});
}
function SearchResultsSummary({ className, render, ...props }) {
	const { summary } = search({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-results-summary",
			className: summary({ className })
		}, props)
	});
}
function SearchResultsSection({ className, render, ...props }) {
	const { section } = search({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-results-section",
			className: section({ className })
		}, props)
	});
}
function SearchResultsSectionHeading({ className, render, ...props }) {
	const { sectionHeading } = search({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-results-section-heading",
			className: sectionHeading({ className })
		}, props)
	});
}
function SearchResultsList({ className, render, ...props }) {
	const { list } = search({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-results-list",
			className: list({ className })
		}, props)
	});
}
//#endregion
//#region src/components/search/search-entity.recipe.ts
const searchEntity = tv$1({
	slots: {
		entity: ["flex min-w-0 w-full items-center gap-3 p-3 text-left transition-colors"],
		entityLeading: ["relative flex shrink-0"],
		entityIcon: ["flex size-8 items-center justify-center overflow-hidden"],
		entityActivity: ["absolute -right-0.5 -bottom-0.5 inline-block size-2.5 shrink-0 rounded-full"],
		entityContent: ["min-w-0 flex-1"],
		entityHeader: ["flex min-w-0 items-center gap-2"],
		entityTitle: ["truncate text-sm"],
		entityDescription: ["block truncate text-xs"]
	},
	variants: { theme: {
		brutal: {
			entity: [
				"border-2 border-black/30 bg-white",
				"hover:border-black hover:shadow-raft-sm active:border-black active:shadow-raft-sm",
				"data-[selected=true]:border-black data-[selected=true]:shadow-raft-sm",
				"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black"
			],
			entityIcon: ["border-2 border-black bg-white text-black"],
			entityActivity: ["border border-black bg-brutal-lime"],
			entityTitle: ["font-bold text-black data-muted:text-black/45"],
			entityDescription: ["text-black/50 data-muted:text-black/30"]
		},
		elegant: {
			entity: [
				"rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
				"transition-[background-color,border-color] duration-150",
				"hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
				"data-[selected=true]:border-transparent data-[selected=true]:ring-1 data-[selected=true]:ring-primary-400 data-[selected=true]:ring-offset-2 data-[selected=true]:ring-offset-layer-canvas-muted",
				"dark:data-[selected=true]:ring-2",
				"outline-none focus-visible:ring-1 focus-visible:ring-primary-400",
				"dark:border-transparent",
				"dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0"
			],
			entityIcon: ["rounded-md bg-fill-muted text-foreground-icon"],
			entityActivity: ["border border-layer-panel bg-brutal-lime dark:bg-success"],
			entityTitle: ["font-medium text-foreground-strong data-muted:text-foreground-disabled"],
			entityDescription: ["text-foreground-muted/70 data-muted:text-foreground-disabled"]
		}
	} }
});
//#endregion
//#region src/components/search/search-entity.tsx
function SearchEntityResult({ selected = false, className, render, ...props }) {
	const { entity } = searchEntity({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			"data-slot": "search-entity-result",
			"data-selected": selected ? "true" : void 0,
			className: entity({ className }),
			type: render ? void 0 : "button"
		}, props)
	});
}
function SearchEntityResultContent({ className, render, ...props }) {
	const { entityContent } = searchEntity({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-entity-result-content",
			className: entityContent({ className })
		}, props)
	});
}
function SearchEntityResultHeader({ className, render, ...props }) {
	const { entityHeader } = searchEntity({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-entity-result-header",
			className: entityHeader({ className })
		}, props)
	});
}
function SearchEntityResultLeading({ className, render, ...props }) {
	const { entityLeading } = searchEntity({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-entity-result-leading",
			className: entityLeading({ className })
		}, props)
	});
}
function SearchEntityResultIcon({ className, render, ...props }) {
	const { entityIcon } = searchEntity({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-entity-result-icon",
			className: entityIcon({ className })
		}, props)
	});
}
function SearchEntityResultActivity({ className, render, ...props }) {
	const { entityActivity } = searchEntity({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-entity-result-activity",
			className: entityActivity({ className })
		}, props)
	});
}
function SearchEntityResultTitle({ muted = false, className, render, ...props }) {
	const { entityTitle } = searchEntity({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-entity-result-title",
			"data-muted": muted ? "" : void 0,
			className: entityTitle({ className })
		}, props)
	});
}
function SearchEntityResultDescription({ muted = false, className, render, ...props }) {
	const { entityDescription } = searchEntity({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-entity-result-description",
			"data-muted": muted ? "" : void 0,
			className: entityDescription({ className })
		}, props)
	});
}
//#endregion
//#region src/components/search/search-message.recipe.ts
const searchMessage = tv$1({
	slots: {
		message: ["w-full text-left transition-colors"],
		messageHeader: ["flex flex-wrap items-center gap-2 text-xs"],
		messageBody: ["min-w-0 line-clamp-2 text-sm"],
		messageMeta: [],
		messageThreadMeta: ["inline-flex items-center gap-1"],
		messageSender: ["inline-flex items-center gap-1"],
		messageTimestamp: [],
		messageMatch: ["px-0.5"]
	},
	variants: {
		theme: {
			brutal: {
				message: [
					"border-2 border-black/30 bg-white p-3",
					"hover:border-black hover:shadow-raft-sm active:border-black active:shadow-raft-sm",
					"data-[selected=true]:border-black data-[selected=true]:shadow-raft-sm",
					"data-[nested=true]:border-x-0 data-[nested=true]:border-b-0 data-[nested=true]:border-t-2 data-[nested=true]:px-3 data-[nested=true]:py-3",
					"data-[nested=true]:border-black/10 data-[nested=true]:hover:border-black/10 data-[nested=true]:hover:bg-black/3 data-[nested=true]:hover:shadow-none",
					"data-[nested=true][data-selected=true]:border-black data-[nested=true][data-selected=true]:bg-[oklch(0.96299649_0.06890535_97.696701)] data-[nested=true][data-selected=true]:shadow-none data-[nested=true][data-selected=true]:ring-0",
					"focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black"
				],
				messageHeader: ["mb-1"],
				messageMeta: ["font-bold text-black/50"],
				messageThreadMeta: ["font-bold text-black/40"],
				messageSender: ["font-bold text-black"],
				messageTimestamp: ["font-mono text-black/40"],
				messageMatch: ["bg-primary-400 font-bold text-black"],
				messageBody: ["leading-relaxed text-black/70"]
			},
			elegant: {
				message: [
					"group/search-message rounded-lg border-[0.5px] border-line-muted bg-layer-panel p-0 shadow-raft-xs",
					"transition-[background-color,border-color] duration-150",
					"hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
					"data-[selected=true]:border-transparent",
					"data-[nested=true]:rounded-none data-[nested=true]:border-0 data-[nested=true]:border-t-[0.5px] data-[nested=true]:border-line-hairline data-[nested=true]:bg-transparent data-[nested=true]:p-3 data-[nested=true]:shadow-none",
					"data-[nested=true]:hover:bg-ink-2 data-[nested=true]:hover:shadow-none",
					"data-[nested=true][data-selected=true]:border-line-hairline data-[nested=true][data-selected=true]:bg-fill-muted",
					"outline-none",
					"dark:border-transparent",
					"dark:data-[nested=true]:border-ink-10 dark:data-[nested=true]:bg-transparent",
					"dark:data-[nested=true]:hover:bg-[color-mix(in_oklch,var(--layer-canvas-muted)_20%,var(--layer-inset))] dark:data-[nested=true]:hover:shadow-none",
					"dark:data-[nested=true][data-selected=true]:border-ink-10 dark:data-[nested=true][data-selected=true]:bg-fill-muted",
					"dark:data-[nested=true][data-selected=true]:hover:bg-fill-muted"
				],
				messageHeader: ["px-3 pt-2.5 pb-1", "group-data-[nested=true]/search-message:mb-1 group-data-[nested=true]/search-message:p-0"],
				messageBody: [
					"border-0 bg-transparent px-3 pt-0 pb-2.5",
					"transition-colors duration-150",
					"group-data-[nested=true]/search-message:rounded-none group-data-[nested=true]/search-message:border-0 group-data-[nested=true]/search-message:bg-transparent group-data-[nested=true]/search-message:p-0",
					"group-data-[nested=true]/search-message:group-hover/search-message:bg-transparent",
					"leading-5.25 tracking-[-0.01em] text-foreground-muted"
				],
				messageMeta: ["font-medium text-foreground-muted/70"],
				messageThreadMeta: ["font-medium text-foreground-muted/70"],
				messageSender: ["font-medium text-foreground-muted"],
				messageTimestamp: ["font-sans tabular-nums text-foreground-muted/70"],
				messageMatch: ["bg-primary-400/70 text-primary-950 [font:inherit]", "dark:bg-primary-400"]
			}
		},
		nested: {
			false: {},
			true: {}
		},
		selected: {
			false: {},
			true: {}
		}
	},
	defaultVariants: {
		nested: false,
		selected: false
	},
	compoundVariants: [
		{
			theme: "elegant",
			nested: false,
			class: { message: ["focus-visible:ring-1 focus-visible:ring-primary-400", "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60 dark:focus-visible:ring-offset-0"] }
		},
		{
			theme: "elegant",
			nested: true,
			class: { message: ["focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary-400", "dark:focus-visible:ring-2 dark:focus-visible:ring-primary-400/60"] }
		},
		{
			theme: "elegant",
			nested: false,
			selected: true,
			class: { message: ["ring-1 ring-primary-400 ring-offset-2 ring-offset-layer-canvas-muted", "dark:ring-2"] }
		}
	]
});
//#endregion
//#region src/components/search/search-message.tsx
function SearchMessageResultBase({ nested = false, selected = false, className, render, ...props }) {
	const { message } = searchMessage({
		nested,
		selected,
		theme: useThemeFamily()
	});
	return useRender({
		defaultTagName: "button",
		render,
		props: mergeProps({
			"data-slot": "search-message-result",
			"data-nested": nested ? "true" : void 0,
			"data-selected": selected ? "true" : void 0,
			className: message({ className }),
			type: render ? void 0 : "button"
		}, props)
	});
}
function SearchMessageResult(props) {
	return /* @__PURE__ */ jsx(SearchMessageResultBase, { ...props });
}
function SearchThreadMessageResult(props) {
	return /* @__PURE__ */ jsx(SearchMessageResultBase, {
		...props,
		nested: true
	});
}
function SearchMessageResultHeader({ className, render, ...props }) {
	const { messageHeader } = searchMessage({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-message-result-header",
			className: messageHeader({ className })
		}, props)
	});
}
function SearchMessageResultBody({ className, render, ...props }) {
	const { messageBody } = searchMessage({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-message-result-body",
			className: messageBody({ className })
		}, props)
	});
}
function SearchMessageResultMeta({ className, render, ...props }) {
	const { messageMeta } = searchMessage({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-message-result-meta",
			className: messageMeta({ className })
		}, props)
	});
}
function SearchMessageResultThreadMeta({ className, render, ...props }) {
	const { messageThreadMeta } = searchMessage({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-message-result-thread-meta",
			className: messageThreadMeta({ className })
		}, props)
	});
}
function SearchMessageResultSender({ className, render, ...props }) {
	const { messageSender } = searchMessage({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-message-result-sender",
			className: messageSender({ className })
		}, props)
	});
}
function SearchMessageResultTimestamp({ className, render, ...props }) {
	const { messageTimestamp } = searchMessage({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-message-result-timestamp",
			className: messageTimestamp({ className })
		}, props)
	});
}
function SearchMessageResultMatch({ className, render, ...props }) {
	const { messageMatch } = searchMessage({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "mark",
		render,
		props: mergeProps({
			"data-slot": "search-message-result-match",
			className: messageMatch({ className })
		}, props)
	});
}
//#endregion
//#region src/components/search/search-thread.recipe.ts
const searchThread = tv$1({
	slots: {
		thread: ["overflow-hidden transition-colors"],
		threadHeader: ["px-3 py-2"],
		threadMeta: ["mb-1 flex flex-wrap items-center gap-2 text-[11px]"],
		threadTimestamp: ["normal-case"],
		threadTitle: ["text-sm"],
		threadMessages: ["flex flex-col [&>*:first-child]:border-t-0"]
	},
	variants: { theme: {
		brutal: {
			thread: [
				"border-2 border-black/30 bg-white",
				"hover:border-black hover:shadow-raft-sm",
				"data-[selected=true]:border-black data-[selected=true]:shadow-raft-sm"
			],
			threadHeader: ["border-b-2 border-black bg-[oklch(0.96625109_0.02494438_333.728876)]"],
			threadMeta: ["font-bold uppercase tracking-wide text-black/70"],
			threadTimestamp: ["font-mono text-black/50"],
			threadTitle: ["font-bold text-black"]
		},
		elegant: {
			thread: [
				"rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
				"transition-[background-color,border-color] duration-150",
				"hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
				"data-[selected=true]:border-transparent data-[selected=true]:ring-1 data-[selected=true]:ring-primary-400 data-[selected=true]:ring-offset-2 data-[selected=true]:ring-offset-layer-canvas-muted",
				"dark:data-[selected=true]:ring-2",
				"dark:border-transparent"
			],
			threadHeader: ["px-3 pt-2.5 pb-2"],
			threadMeta: ["font-medium text-foreground-muted"],
			threadTimestamp: ["font-sans tabular-nums text-foreground-muted/70"],
			threadTitle: ["font-medium text-foreground-strong"],
			threadMessages: [
				"overflow-clip border-t-[0.5px] border-line-hairline bg-transparent",
				"transition-colors duration-150",
				"dark:border-ink-10"
			]
		}
	} }
});
//#endregion
//#region src/components/search/search-thread.tsx
function SearchThreadResult({ selected = false, className, render, ...props }) {
	const { thread } = searchThread({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-thread-result",
			"data-selected": selected ? "true" : void 0,
			className: thread({ className })
		}, props)
	});
}
function SearchThreadResultHeader({ className, render, ...props }) {
	const { threadHeader } = searchThread({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-thread-result-header",
			className: threadHeader({ className })
		}, props)
	});
}
function SearchThreadResultMeta({ className, render, ...props }) {
	const { threadMeta } = searchThread({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-thread-result-meta",
			className: threadMeta({ className })
		}, props)
	});
}
function SearchThreadResultTimestamp({ className, render, ...props }) {
	const { threadTimestamp } = searchThread({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "span",
		render,
		props: mergeProps({
			"data-slot": "search-thread-result-timestamp",
			className: threadTimestamp({ className })
		}, props)
	});
}
function SearchThreadResultTitle({ className, render, ...props }) {
	const { threadTitle } = searchThread({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-thread-result-title",
			className: threadTitle({ className })
		}, props)
	});
}
function SearchThreadResultMessages({ className, render, ...props }) {
	const { threadMessages } = searchThread({ theme: useThemeFamily() });
	return useRender({
		defaultTagName: "div",
		render,
		props: mergeProps({
			"data-slot": "search-thread-result-messages",
			className: threadMessages({ className })
		}, props)
	});
}
//#endregion
//#region src/components/theme-only/theme-only.tsx
/** Render children only while the elegant theme family is active. */
function ElegantOnly({ children }) {
	return useThemeFamily() === "elegant" ? children : null;
}
/** Render children only while the brutal theme family is active. */
function BrutalOnly({ children }) {
	return useThemeFamily() === "brutal" ? children : null;
}
//#endregion
//#region src/lib/theme/theme-preset.ts
const THEME_PRESETS = [
	"brutal",
	"elegant-light",
	"elegant-dark",
	"elegant-system"
];
function isThemePreset(value) {
	return value === "brutal" || value === "elegant-light" || value === "elegant-dark" || value === "elegant-system";
}
/** Map the single product-facing preset onto RUI's existing family and mode axes. */
function resolveThemePreset(preset, systemMode = "light") {
	switch (preset) {
		case "brutal": return {
			theme: "brutal",
			mode: "light",
			resolvedMode: "light"
		};
		case "elegant-light": return {
			theme: "elegant",
			mode: "light",
			resolvedMode: "light"
		};
		case "elegant-dark": return {
			theme: "elegant",
			mode: "dark",
			resolvedMode: "dark"
		};
		case "elegant-system": return {
			theme: "elegant",
			mode: "system",
			resolvedMode: systemMode
		};
	}
}
/** Apply the same root attributes/classes used by `ThemeProvider`. */
function applyThemeToRoot(root, { theme, resolvedMode }) {
	root.dataset.theme = theme;
	root.classList.toggle("light", theme === "elegant" && resolvedMode === "light");
	root.classList.toggle("dark", theme === "elegant" && resolvedMode === "dark");
	root.style.colorScheme = theme === "elegant" ? resolvedMode : "light";
}
function applyThemePresetToRoot(root, preset, systemMode = "light") {
	const resolved = resolveThemePreset(preset, systemMode);
	applyThemeToRoot(root, resolved);
	return resolved;
}
function serializeInlineScriptValue(value) {
	return JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");
}
/**
* Create a dependency-free classic script for `<head>`, before app JavaScript
* and styles paint. The consumer owns the storage key and writes the effective
* account/gate-aware preset into it; invalid or inaccessible storage falls back
* deterministically.
*/
function createThemeBootstrapScript(options) {
	return `(()=>{const c=${serializeInlineScriptValue({
		defaultPreset: "brutal",
		...options
	})};let p=c.defaultPreset,k=c.storageKey;try{if(c.account){const t=localStorage.getItem(c.account.tokenStorageKey),b=t&&t.split(".")[1];if(b){const n=b.replace(/-/g,"+").replace(/_/g,"/"),j=JSON.parse(atob(n+"=".repeat((4-n.length%4)%4)));if(j.type==="access"&&typeof j.sub==="string"&&j.sub)k=c.storageKeyPrefix+j.sub}}if(k){const s=localStorage.getItem(k);if(s==="brutal"||s==="elegant-light"||s==="elegant-dark"||s==="elegant-system")p=s}}catch{}let m="light";if(p==="elegant-dark")m="dark";else if(p==="elegant-system")try{m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{}const e=p!=="brutal",r=document.documentElement;r.dataset.theme=e?"elegant":"brutal";r.classList.toggle("light",e&&m==="light");r.classList.toggle("dark",e&&m==="dark");r.style.colorScheme=e?m:"light"})()`;
}
//#endregion
//#region src/lib/theme/theme-provider.tsx
const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;
function readStoredTheme(storageKey, fallback) {
	if (typeof window === "undefined" || !storageKey) return fallback;
	const stored = window.localStorage.getItem(storageKey);
	return stored === "brutal" || stored === "elegant" ? stored : fallback;
}
function readStoredMode(storageKey, fallback) {
	if (typeof window === "undefined" || !storageKey) return fallback;
	const stored = window.localStorage.getItem(storageKey);
	return stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
}
function writeStorage(key, value) {
	if (typeof window !== "undefined" && key) window.localStorage.setItem(key, value);
}
function subscribeSystemMode(onStoreChange) {
	if (typeof window === "undefined") return () => void 0;
	const media = window.matchMedia("(prefers-color-scheme: dark)");
	media.addEventListener("change", onStoreChange);
	return () => media.removeEventListener("change", onStoreChange);
}
function getSystemMode() {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function ThemeProvider({ theme, defaultTheme = "brutal", onThemeChange, mode, defaultMode = "light", onModeChange, storageKey, modeStorageKey = storageKey ? `${storageKey}-mode` : void 0, syncDom = true, children }) {
	const [uncontrolledTheme, setUncontrolledTheme] = useState(() => readStoredTheme(storageKey, defaultTheme));
	const [uncontrolledMode, setUncontrolledMode] = useState(() => readStoredMode(modeStorageKey, defaultMode));
	const activeTheme = theme ?? uncontrolledTheme;
	const activeMode = mode ?? uncontrolledMode;
	const systemMode = useSyncExternalStore(subscribeSystemMode, getSystemMode, () => "light");
	const resolvedMode = activeMode === "system" ? systemMode : activeMode;
	const commitTheme = useCallback((nextTheme) => {
		if (theme === void 0) {
			setUncontrolledTheme(nextTheme);
			writeStorage(storageKey, nextTheme);
		}
		onThemeChange?.(nextTheme);
	}, [
		onThemeChange,
		storageKey,
		theme
	]);
	const commitMode = useCallback((nextMode) => {
		if (mode === void 0) {
			setUncontrolledMode(nextMode);
			writeStorage(modeStorageKey, nextMode);
		}
		onModeChange?.(nextMode);
	}, [
		mode,
		modeStorageKey,
		onModeChange
	]);
	const setTheme = useCallback((nextTheme, options) => {
		commitTheme(nextTheme);
		if (nextTheme === "brutal") {
			commitMode("light");
			return;
		}
		if (options?.mode) commitMode(options.mode);
	}, [commitMode, commitTheme]);
	const themeState = useMemo(() => ({
		theme: activeTheme,
		setTheme,
		mode: activeMode,
		resolvedMode
	}), [
		activeMode,
		activeTheme,
		resolvedMode,
		setTheme
	]);
	useIsomorphicLayoutEffect(() => {
		if (!syncDom) return;
		const root = document.documentElement;
		applyThemeToRoot(root, {
			theme: activeTheme,
			resolvedMode
		});
	}, [
		activeMode,
		activeTheme,
		resolvedMode,
		syncDom
	]);
	return /* @__PURE__ */ jsx(ThemeStateContext.Provider, {
		value: themeState,
		children: /* @__PURE__ */ jsx(ThemeContext.Provider, {
			value: activeTheme,
			children
		})
	});
}
//#endregion
export { ActivityInboxControls, ActivityInboxLoadingMore, ActivityInboxPanel, ActivityInboxSelectionCount, ActivityInboxSelectionToolbar, ActivityInboxSidebar, ActivityInboxViewport, AlertDialog, AlertDialogAction, AlertDialogBody, AlertDialogCancel, AlertDialogClose, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger, AppRailFooter, AppRailHeader, AppRailItem, AppRailItemAttention, AppRailItemAttentionMask, AppRailItemBadge, AppRailItemIcon, AppRailItemIndicator, AppRailItemLabel, AppRailNav, AppRailRoot, AppShellMainSlot, AppShellOverlaySlot, AppShellPanelSlot, AppShellRailSlot, AppShellRoot, AppShellSidebarSlot, AppShellSidebarTrigger, Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage, Badge, Banner, BannerAction, BannerDescription, BannerTitle, BrutalOnly, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardLeading, CardTitle, CardTrailing, Checkbox, CodeBlock, CodeBlockAction, CodeBlockActions, CodeBlockBody, CodeBlockHeader, CodeBlockTitle, Combobox, ComboboxChip, ComboboxChipRemove, ComboboxChips, ComboboxClear, ComboboxCollection, ComboboxContent, ComboboxControl, ComboboxEmpty, ComboboxGroup, ComboboxGroupLabel, ComboboxHeader, ComboboxInput, ComboboxInputGroup, ComboboxItem, ComboboxItemIndicator, ComboboxLabel, ComboboxList, ComboboxPopup, ComboboxPortal, ComboboxRow, ComboboxSeparator, ComboboxTrigger, ComboboxTriggerCount, ComboboxTriggerIndicator, ComboboxValue, Composer, ComposerActions, ComposerAttachment, ComposerAttachmentBody, ComposerAttachmentFailedOverlay, ComposerAttachmentFile, ComposerAttachmentImage, ComposerAttachmentMeta, ComposerAttachmentRemove, ComposerAttachmentTitle, ComposerAttachmentUploadProgressBar, ComposerAttachmentUploadingOverlay, ComposerAttachments, ComposerAttachmentsScrollArea, ComposerDropOverlay, ComposerDropOverlayLabel, ComposerDropOverlayPrompt, ComposerIconButton, ComposerInput, ComposerMeta, ComposerRoot, ComposerSubmit, ComposerSuggestionAside, ComposerSuggestionContent, ComposerSuggestionGroup, ComposerSuggestionGroupLabel, ComposerSuggestionIcon, ComposerSuggestionList, ComposerSuggestionMeta, ComposerSuggestionOption, ComposerSuggestionTitle, ComposerToolbar, ComposerToolbarLabel, ContextMenu, ContextMenuCheckboxItem, ContextMenuCheckboxItemIndicator, ContextMenuContent, ContextMenuFooter, ContextMenuItem, ContextMenuItemLabel, ContextMenuLabel, ContextMenuPopup, ContextMenuPortal, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuRadioItemIndicator, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSubmenu, ContextMenuSubmenuTrigger, ContextMenuTrigger, ConversationPanelBody, ConversationPanelContent, ConversationPanelEmptyState, ConversationPanelEmptyStateBrand, ConversationPanelEmptyStateBrandMark, ConversationPanelFooter, ConversationPanelRoot, ConversationPanelTabs, CopyableCode, CopyableCodeAction, CopyableCodeRoot, DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, Drawer, DrawerActions, DrawerBody, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuCheckboxItemIndicator, DropdownMenuContent, DropdownMenuFooter, DropdownMenuItem, DropdownMenuItemCount, DropdownMenuItemLabel, DropdownMenuLabel, DropdownMenuPopup, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuRadioItemIndicator, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSubmenu, DropdownMenuSubmenuTrigger, DropdownMenuTrigger, ElegantOnly, EmptyState, EmptyStateActions, EmptyStateContent, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle, Field, FieldControl, FieldDescription, FieldError, FieldItem, FieldLabel, FieldValidity, FileAction, FileActions, FileContent, FileImage, FileMeta, FileMetaItem, FileName, FilePreview, FilePreviewBadge, FilePreviewCode, FilePreviewDocument, FilePreviewFile, FilePreviewMedia, FileRow, FileRowOpen, FileThumbnail, FilesList, FilesPanel, FilesViewport, InboxItem, InboxItemActions, InboxItemBody, InboxItemContent, InboxItemContext, InboxItemHeading, InboxItemMessage, InboxItemMetadata, InboxItemSelection, InboxItemSender, InboxItemSubtitle, InboxItemTimestamp, InboxItemTitle, InboxItemTrailing, InboxItemTrigger, InlineCode, Input, InputGroup, InputGroupAddon, InputGroupInput, Kbd, KbdGroup, Label, LabelAsterisk, LabelOptional, LabelSub, LegacyTaskPanelActions, LegacyTaskPanelBody, LegacyTaskPanelField, LegacyTaskPanelFieldLabel, LegacyTaskPanelFieldText, LegacyTaskPanelFieldTitle, LegacyTaskPanelHeader, LegacyTaskPanelIcon, LegacyTaskPanelMeta, LegacyTaskPanelMetaLabel, LegacyTaskPanelMetaRow, LegacyTaskPanelMetaValue, LegacyTaskPanelRoot, LegacyTaskPanelSection, LegacyTaskPanelStatus, LegacyTaskPanelTitle, LegacyTaskPanelTitleMeta, Lightbox, LightboxActions, LightboxClose, LightboxContent, LightboxHeader, LightboxHeaderLabel, LightboxHeaderMeta, LightboxInfoActions, LightboxInfoBar, LightboxInfoDock, LightboxInfoTitle, LightboxMedia, LightboxNavigationButton, LightboxPortal, LightboxStage, LightboxThumbnail, LightboxThumbnailStrip, LightboxTitle, LightboxToolbar, LightboxTrigger, LiveAgentActivityBar, LiveAgentActivityBarAvatar, LiveAgentActivityBarContent, LiveAgentActivityBarRow, LiveAgentActivityBarStatus, LiveAgentActivityBarText, MarkdownBlockquote, MarkdownCell, MarkdownCheckbox, MarkdownHeaderCell, MarkdownHeading, MarkdownImage, MarkdownInlineCode, MarkdownLink, MarkdownList, MarkdownListItem, MarkdownMark, MarkdownOrderedList, MarkdownParagraph, MarkdownRule, MarkdownTable, MarkdownTableRow, MarkdownTableScroll, MessageActionCard, MessageActionCardActions, MessageActionCardCompletion, MessageActionCardContent, MessageActionCardHeader, MessageActionCardHeaderStatus, MessageActionCardHint, MessageActionCardProperties, MessageActionCardProperty, MessageActionCardPropertyLabel, MessageActionCardPropertyValue, MessageActionCardScope, MessageActionCardScopeDescription, MessageActionCardScopeList, MessageActionCardScopeListLabel, MessageActionCardScopeName, MessageAttachmentAction, MessageAttachmentCard, MessageAttachmentCommentSummary, MessageAttachmentDiffAddition, MessageAttachmentDiffDeletion, MessageAttachmentDiffSummary, MessageAttachmentGroup, MessageAttachmentMeta, MessageAttachmentMetaEnd, MessageAttachmentMetaStart, MessageAttachmentSummary, MessageAttachmentTitle, MessageEmbed, MessageEmbedContent, MessageEmbedFooter, MessageEmbedHeader, MessageForwardedBundle, MessageForwardedBundleAttachment, MessageForwardedBundleAttachmentMeta, MessageForwardedBundleAttachmentName, MessageForwardedBundleAttachments, MessageForwardedBundleFooter, MessageForwardedBundleFooterAction, MessageForwardedBundleHeader, MessageForwardedBundleHeaderContent, MessageForwardedBundleHeaderCount, MessageForwardedBundleHeaderLabel, MessageForwardedBundleItem, MessageForwardedBundleItemAuthor, MessageForwardedBundleItemMeta, MessageForwardedBundleItems, MessageForwardedBundleSource, MessageForwardedBundleSourceLabel, MessageImageGallery, MessageImageGalleryAction, MessageImageGalleryItem, MessageImageGalleryMedia, MessageImageGalleryOverlay, MessageImageGalleryPreview, MessageItem, MessageItemAttachments, MessageItemAvatarSlot, MessageItemBadge, MessageItemBadgeSeparator, MessageItemBody, MessageItemContent, MessageItemContinuationTime, MessageItemEmbedded, MessageItemFooter, MessageItemGutter, MessageItemHeader, MessageItemInlineStatus, MessageItemMeta, MessageItemReadReceipt, MessageItemSavedIndicator, MessageItemSearchMatch, MessageItemSender, MessageItemSenderBadges, MessageItemSenderButton, MessageItemTime, MessageItemToolbar, MessageItemToolbarButton, MessageItemTranslationAction, MessageItemTranslationFailedStatus, MessageItemTranslationOriginal, MessageItemTranslationOriginalLabel, MessageItemTranslationProgressTrack, MessageItemTranslationRetryAction, MessageItemTranslationStatus, MessageList, MessageListDateDivider, MessageListHistoryLimited, MessageListNotice, MessageMultiSelect, MessageMultiSelectCheckbox, MessageMultiSelectToolbar, MessageQuotedPreview, MessageQuotedPreviewAttachment, MessageQuotedPreviewAttachments, MessageQuotedPreviewAuthor, MessageQuotedPreviewAuthorMeta, MessageQuotedPreviewAuthorName, MessageQuotedPreviewChannel, MessageQuotedPreviewContent, MessageQuotedPreviewHeader, MessageQuotedPreviewLoading, MessageQuotedPreviewText, MessageQuotedPreviewThread, MessageQuotedPreviewTimestamp, MessageQuotedPreviewUnavailable, MessageReactionAddButton, MessageReactionChip, MessageReactionCount, MessageReactionErrorIndicator, MessageReactionGlyph, MessageReactionPickerContent, MessageReactionPickerStatic, MessageReactionQuickButton, MessageReactionQuickRow, MessageReactionTooltipContent, MessageReactionTooltipMeta, MessageReactionTooltipName, MessageReactionTooltipNameText, MessageReactionTooltipNames, MessageReactionTooltipSeparator, MessageReferenceBadge, MessageReferenceChip, MessageReferenceIndicator, MessageReferenceLabel, MessageReferencePending, MessageReferenceText, MessageReferenceUnavailable, MessageReplies, MessageRepliesItem, MessageRepliesItemContent, MessageRepliesItemSender, MessageRepliesItemTime, MessageRepliesSummary, MessageRepliesSummaryItem, MessageTextSelectionToolbar, MessageTextSelectionToolbarButton, MessageTextSelectionToolbarSeparator, MessageVideoPreview, MessageVideoPreviewAction, MessageVideoPreviewFailureAction, MessageVideoPreviewFailureContent, MessageVideoPreviewFailureIcon, MessageVideoPreviewFailureTitle, MessageVideoPreviewFallback, MessageVideoPreviewMedia, MobileNavItem, MobileNavLabel, MobileNavRoot, NotificationCenter, NotificationCenterActionButton, NotificationCenterCount, NotificationCenterEmptyState, NotificationCenterHeader, NotificationCenterItem, NotificationCenterItemActions, NotificationCenterItemBody, NotificationCenterItemContent, NotificationCenterItemIcon, NotificationCenterItemRow, NotificationCenterItemTitle, NotificationCenterList, NotificationCenterPopup, NotificationCenterScroller, NotificationCenterTitle, NotificationCenterTrigger, Panel, PanelAction, PanelActions, PanelActivity, PanelBody, PanelFooter, PanelHeader, PanelHeaderContent, PanelHeaderIcon, PanelHeaderRoot, PanelHeading, PanelMeta, PanelScrollContent, PanelScrollViewport, PanelSection, PanelSectionHeader, PanelStatus, PanelTitle, PanelToggleAction, PickerTriggerButton, Popover, PopoverArrow, PopoverBackdrop, PopoverClose, PopoverContent, PopoverDescription, PopoverHeader, PopoverPopup, PopoverPortal, PopoverSeparator, PopoverTitle, PopoverTrigger, PopoverViewport, PreviewCard, PreviewCardArrow, PreviewCardContent, PreviewCardDescription, PreviewCardHeader, PreviewCardPopup, PreviewCardPortal, PreviewCardSeparator, PreviewCardTitle, PreviewCardTrigger, ProfilePanel, ProfilePanelBody, ProfilePanelHeader, ProfilePanelHeaderContent, ProfilePanelSection, Progress, ProgressHeader, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue, RadioGroup, RadioGroupIndicator, RadioGroupItem, RaftLogo, RaftLogoLockup, RaftWordmark, ResizableGroup, ResizableHandle, ResizablePanel, ScrollArea, ScrollAreaContent, ScrollAreaCorner, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport, SearchEntityResult, SearchEntityResultActivity, SearchEntityResultContent, SearchEntityResultDescription, SearchEntityResultHeader, SearchEntityResultIcon, SearchEntityResultLeading, SearchEntityResultTitle, SearchMessageResult, SearchMessageResultBody, SearchMessageResultHeader, SearchMessageResultMatch, SearchMessageResultMeta, SearchMessageResultSender, SearchMessageResultThreadMeta, SearchMessageResultTimestamp, SearchResultsList, SearchResultsSection, SearchResultsSectionHeading, SearchResultsSummary, SearchShellFilters, SearchShellRoot, SearchShellViewport, SearchThreadMessageResult, SearchThreadResult, SearchThreadResultHeader, SearchThreadResultMessages, SearchThreadResultMeta, SearchThreadResultTimestamp, SearchThreadResultTitle, SegmentedControl, SegmentedControlCount, SegmentedControlItem, SegmentedControlLabel, Select, SelectArrow, SelectContent, SelectGroup, SelectGroupLabel, SelectIcon, SelectItem, SelectItemIndicator, SelectItemLeading, SelectItemText, SelectLabel, SelectList, SelectPopup, SelectPortal, SelectScrollDownArrow, SelectScrollUpArrow, SelectSeparator, SelectTrigger, SelectValue, Separator, SidebarBody, SidebarContent, SidebarControl, SidebarGroupLabel, SidebarHeader, SidebarHeaderTitle, SidebarItem, SidebarItemAside, SidebarItemChannelIcon, SidebarItemContent, SidebarItemCount, SidebarItemIcon, SidebarItemIndicator, SidebarItemMeta, SidebarItemMetaIcon, SidebarItemStatus, SidebarItemSubtitle, SidebarItemTitle, SidebarList, SidebarLiveActivity, SidebarMenu, SidebarMenuAside, SidebarMenuCount, SidebarMenuIcon, SidebarMenuTitle, SidebarRoot, SidebarSection, SidebarSectionAttention, SidebarSectionChevron, SidebarSectionControl, SidebarSectionControls, SidebarSectionCount, SidebarSectionDisclosure, SidebarSectionEmpty, SidebarSectionHeader, SidebarSectionTitle, SidebarSectionTrailing, Skeleton, SortableComposerAttachment, SortableComposerAttachments, SortableComposerAttachmentsScroll, SortableTabsList, SortableTabsTab, Spinner, Status, Switch, SwitchThumb, SystemMessage, SystemMessageContent, SystemMessageGroup, SystemMessageGroupChevron, SystemMessageGroupDisclosure, SystemMessageGroupHeader, SystemMessageGroupPanel, SystemMessageGroupSummary, SystemMessageTime, THEME_PRESETS, Tabs, TabsBackground, TabsIndicator, TabsLabel, TabsList, TabsPanel, TabsTab, TaskBoardColumn, TaskBoardColumnBadge, TaskBoardColumnChevron, TaskBoardColumnCount, TaskBoardColumnEmpty, TaskBoardColumnEmptyAllowed, TaskBoardColumnEmptyBlocked, TaskBoardColumnEmptyIdle, TaskBoardColumnHeading, TaskBoardColumnItems, TaskBoardColumnPanel, TaskBoardColumnTrigger, TaskBoardRoot, TaskCard, TaskCardBody, TaskCardChannel, TaskCardDescription, TaskCardLegacy, TaskCardMeta, TaskCardNumber, TaskCardRow, TaskCardStatus, TaskCardTitle, TaskChip, TaskClosedIcon, TaskDndProvider, TaskDoneIcon, TaskDragOverlay, TaskDraggable, TaskDropPlaceholder, TaskDropZone, TaskInProgressIcon, TaskInReviewIcon, TaskListRoot, TaskLoadingList, TaskLoadingRow, TaskSection, TaskSectionBadge, TaskSectionChevron, TaskSectionCount, TaskSectionEmpty, TaskSectionHeading, TaskSectionItems, TaskSectionPanel, TaskSectionTrigger, TaskStatusIcon, TaskTodoIcon, TasksPanelEmpty, TasksPanelRoot, TasksPanelToolbar, TasksPanelToolbarFilters, TasksPanelToolbarGroup, TasksPanelToolbarLabel, TasksPanelToolbarNewTask, TasksPanelToolbarView, TasksPanelViewport, Text, TextHeading, TextMono, TextSans, Textarea, TextareaCounter, TextareaGroup, ThemeProvider, ThreadPanelActions, ThreadPanelBody, ThreadPanelContent, ThreadPanelFooter, ThreadPanelHeader, ThreadPanelOriginalMessage, ThreadPanelReplyCount, ThreadPanelReplySummary, ThreadPanelRoot, ThreadPanelSearch, ThreadPanelSearchCount, ThreadPanelSearchTrailing, ThreadPanelTitle, ThreadPanelTitleMeta, ToastAction, ToastActions, ToastArrow, ToastBody, ToastClose, ToastContent, ToastDescription, ToastIcon, ToastPortal, ToastPositioner, ToastProvider, ToastRoot, ToastTitle, ToastViewport, ToggleGroup, ToggleGroupItem, ToggleGroupLabel, Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger, applyThemePresetToRoot, applyThemeToRoot, buttonVariants, cn, createThemeBootstrapScript, createToastManager, isThemePreset, resolveThemePreset, taskStatus, toast, useComposerSuggestions, useOrderedTabs, useTheme, useThemeFamily, useToastManager };
