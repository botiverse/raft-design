import { Input, type InputProps } from "../input/input.tsx";

// The bare control inside an InputGroup — the group owns the border/shadow/invalid
// look, so the input renders `unstyled` and just fills the row.
export type InputGroupInputProps = Omit<InputProps, "unstyled">;

export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      unstyled
      data-slot="input-group-control"
      className={["flex-1", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
