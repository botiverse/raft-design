import { clsx } from "cnfast";
import { extendTailwindMerge } from "tailwind-merge";
//#region src/lib/cn.ts
const twMerge = extendTailwindMerge({ extend: { classGroups: { shadow: [{ shadow: [{ raft: [
	"xs",
	"sm",
	"md",
	"lg",
	"xl"
] }] }] } } });
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
export { cn };
