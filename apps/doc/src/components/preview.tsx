import {
  Children,
  isValidElement,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { Collapsible } from "@base-ui/react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { ChevronDown } from "lucide-react";
import {
  Button,
  Checkbox,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
  type Theme,
} from "raft-ui";

import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope, type PreviewMode } from "#/components/preview-theme.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type PreviewProps = {
  children: ReactNode;
  previewClassName?: string;
  previewInset?: "default" | "flush";
  previewTheme?: Theme;
  previewMode?: PreviewMode;
};

type PreviewCanvasProps = {
  children: ReactNode;
};

type PreviewControlsProps = {
  children: ReactNode;
  title?: string;
};

type PreviewControlGroupProps = {
  children: ReactNode;
  label?: string;
};

type PreviewControlProps = {
  children: ReactNode;
  label: string;
  htmlFor?: string;
};

type PreviewCodeProps = {
  html?: CodeContent;
  collapsedHtml?: CodeContent;
  codeBlock?: ReactNode;
};

type PreviewSelectProps = {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
};

type PreviewRadioProps = {
  label: string;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
};

type PreviewCheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

type PreviewTextProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
};

const frameClass =
  "min-w-0 overflow-clip rounded-lg bg-white shadow-[0_1px_1px_-0.5px_oklch(0_0_0_/_0.03),0_2px_5px_-2px_oklch(0_0_0_/_0.04),0_8px_18px_-10px_oklch(0_0_0_/_0.06),0_0_0_0.5px_oklch(0_0_0_/_0.20)]";

function getPreviewPart(
  children: ReactNode,
  part: typeof PreviewCanvas | typeof PreviewControls | typeof PreviewCode,
) {
  return Children.toArray(children).find(
    (child): child is ReactElement<{ children?: ReactNode }> =>
      isValidElement(child) && child.type === part,
  );
}

function PreviewCanvas({ children }: PreviewCanvasProps) {
  return <>{children}</>;
}

function PreviewControls({ children, title = "Controls" }: PreviewControlsProps) {
  return (
    <div className="grid gap-y-4">
      <div className="font-mono text-[10px] leading-none font-medium text-foreground-placeholder uppercase">
        {title}
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  );
}

function PreviewControlGroup({ children, label }: PreviewControlGroupProps) {
  return (
    <div className="grid gap-y-3">
      {label ? (
        <div className="font-mono text-[10px] leading-none font-medium text-foreground-placeholder uppercase">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function PreviewControl({ children, label, htmlFor }: PreviewControlProps) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium text-foreground-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function PreviewSelect({ id, label, options, value, onValueChange }: PreviewSelectProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const items = options.map((option) => ({ value: option, label: option }));

  return (
    <div ref={portalRef} className="relative min-w-0">
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue);
          }
        }}
        items={items}
        modal={false}
      >
        <SelectTrigger id={id} aria-label={label} className="h-7 w-full px-2 font-mono text-xs">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-full min-w-[var(--anchor-width)]"
        >
          <SelectList>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                <SelectItemText>{option}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}

function PreviewRadio({ label, options, value, onValueChange }: PreviewRadioProps) {
  return (
    <RadioGroup
      ariaLabel={label}
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) {
          onValueChange(nextValue);
        }
      }}
      className="flex flex-wrap items-center gap-x-3 gap-y-2"
    >
      {options.map((option) => (
        <label
          key={option}
          className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted"
        >
          <RadioGroupItem value={option} />
          {option}
        </label>
      ))}
    </RadioGroup>
  );
}

function PreviewCheckbox({ id, label, checked, onCheckedChange }: PreviewCheckboxProps) {
  return (
    <Checkbox
      id={id}
      aria-label={label}
      checked={checked}
      onCheckedChange={onCheckedChange}
      size="sm"
    />
  );
}

function PreviewText({ id, label, value, onValueChange }: PreviewTextProps) {
  return (
    <Input
      id={id}
      aria-label={label}
      type="text"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      className="h-7 w-full px-2 py-1 text-sm"
      suppressPasswordManager
    />
  );
}

function PreviewCode({ html, collapsedHtml, codeBlock }: PreviewCodeProps) {
  return (
    <Collapsible.Root className="min-w-0">
      <div className="flex h-10 items-center justify-end px-6">
        <Button
          render={<Collapsible.Trigger />}
          variant="ghost"
          size="xs"
          className="text-foreground-placeholder hover:text-foreground-muted [&[data-panel-open]_svg]:rotate-180"
        >
          <span className="order-1">Code</span>
          <ChevronDown
            aria-hidden
            className="order-2 size-3 transition duration-200 ease-out"
            strokeWidth={1.5}
          />
        </Button>
      </div>
      <Collapsible.Panel className="min-w-0 border-t border-[oklch(0_0_0_/_0.06)]">
        {codeBlock ?? (
          <DocsCodeBlock>
            <DocsCodeBlock.Body showLineNumbers={false}>
              <DocsCodeBlock.Content html={html} collapsedHtml={collapsedHtml} />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        )}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

/** Compound docs preview: canvas, optional controls, and code via composition parts. */
function PreviewRoot({
  children,
  previewClassName = "",
  previewInset = "default",
  previewTheme,
  previewMode,
}: PreviewProps) {
  const canvas = getPreviewPart(children, PreviewCanvas);
  const controls = getPreviewPart(children, PreviewControls);
  const code = getPreviewPart(children, PreviewCode);
  const previewInsetClass =
    previewInset === "flush" ? "items-stretch gap-0 p-0" : "items-center gap-4 px-6 py-4";
  const hasControls = controls != null;

  return (
    <div data-component-demo-frame className="relative min-w-0">
      <div className={frameClass}>
        <div className={hasControls ? "grid md:grid-cols-[minmax(0,1fr)_20rem]" : undefined}>
          <PreviewThemeScope
            family={previewTheme}
            mode={previewMode}
            className="bg-white text-foreground"
          >
            <div
              className={`flex min-h-84 w-full flex-wrap justify-center ${previewInsetClass} ${previewClassName}`}
            >
              {canvas?.props.children ?? null}
            </div>
          </PreviewThemeScope>
          {hasControls ? (
            <div className="border-t border-[oklch(0_0_0_/_0.10)] bg-[oklch(0.988_0.002_106.42)] px-8 pt-6 pb-8 md:border-t-0 md:border-l">
              {controls}
            </div>
          ) : null}
        </div>
        {code ? <div className="border-t border-[oklch(0_0_0_/_0.10)] bg-white">{code}</div> : null}
      </div>
    </div>
  );
}

export const Preview = Object.assign(PreviewRoot, {
  Canvas: PreviewCanvas,
  Controls: PreviewControls,
  ControlGroup: PreviewControlGroup,
  Control: PreviewControl,
  Select: PreviewSelect,
  Radio: PreviewRadio,
  Checkbox: PreviewCheckbox,
  Text: PreviewText,
  Code: PreviewCode,
});
