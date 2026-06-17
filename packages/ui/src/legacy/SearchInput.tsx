import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
  inputClassName?: string;
};

export default function SearchInput({
  className = "",
  inputClassName = "",
  ...props
}: SearchInputProps) {
  return (
    <div className={`input-brutal flex w-full items-center gap-2 ${className}`.trim()}>
      <Search size={15} className="shrink-0 text-black/50" />
      <input
        {...props}
        className={`min-w-0 flex-1 bg-transparent font-heading outline-none ${inputClassName}`.trim()}
      />
    </div>
  );
}
