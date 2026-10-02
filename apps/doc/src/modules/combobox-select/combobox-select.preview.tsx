import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import type { ComboboxSelectValue } from "raft-ui/wip";

import { Preview } from "#/components/preview.tsx";
import { ComboboxPreviewComposition } from "./compositions/preview.composition.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;
type SelectSize = "sm" | "md" | "lg";
type SelectStatus = "default" | "error" | "warning";
type SelectWidth = "auto" | "sm" | "md" | "lg" | "full";
type Selection = ComboboxSelectValue | ComboboxSelectValue[] | null;

const widthClassByValue: Record<SelectWidth, string | undefined> = {
  auto: undefined,
  sm: "w-56",
  md: "w-72",
  lg: "w-96",
  full: "w-full",
};

const SIZE_OPTIONS = ["sm", "md", "lg"] as const;
const STATUS_OPTIONS = ["default", "error", "warning"] as const;
const WIDTH_OPTIONS = ["auto", "sm", "md", "lg", "full"] as const;

type ComboboxSelectPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function ComboboxSelectPreview({ code, collapsedCode }: ComboboxSelectPreviewProps) {
  const [size, setSize] = useState<SelectSize>("md");
  const [width, setWidth] = useState<SelectWidth>("md");
  const [status, setStatus] = useState<SelectStatus>("default");
  const [multiple, setMultiple] = useState(false);
  const [clearable, setClearable] = useState(true);
  const [filterable, setFilterable] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const [value, setValue] = useState<Selection>("raft-fast");

  const selectStatus = status === "default" ? undefined : status;
  const widthClassName = widthClassByValue[width];

  const handleSizeChange = useCallback((nextSize: string) => {
    setSize(nextSize as SelectSize);
  }, []);

  const handleWidthChange = useCallback((nextWidth: string) => {
    setWidth(nextWidth as SelectWidth);
  }, []);

  const handleMultipleChange = useCallback((nextMultiple: boolean) => {
    setMultiple(nextMultiple);
    setValue((previous) => {
      if (nextMultiple) {
        return Array.isArray(previous) ? previous : previous == null ? [] : [previous];
      }
      return Array.isArray(previous) ? (previous[0] ?? null) : previous;
    });
  }, []);

  const handleStatusChange = useCallback((nextStatus: string) => {
    setStatus(nextStatus as SelectStatus);
  }, []);

  return (
    <Preview previewClassName="min-h-[22rem] items-start pt-20">
      <Preview.Canvas>
        <div className="w-full">
          <ComboboxPreviewComposition
            size={size}
            className={widthClassName}
            status={selectStatus}
            multiple={multiple}
            clearable={clearable}
            filterable={filterable}
            disabled={disabled}
            loading={loading}
            showArrow={showArrow}
            maxTagCount={3}
            value={value}
            onValueChange={setValue}
          />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Size" htmlFor="combobox-select-preview-size">
          <Preview.Select
            id="combobox-select-preview-size"
            label="Size"
            options={SIZE_OPTIONS}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="Status" htmlFor="combobox-select-preview-status">
          <Preview.Select
            id="combobox-select-preview-status"
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onValueChange={handleStatusChange}
          />
        </Preview.Control>
        <Preview.Control label="Width" htmlFor="combobox-select-preview-width">
          <Preview.Select
            id="combobox-select-preview-width"
            label="Width"
            options={WIDTH_OPTIONS}
            value={width}
            onValueChange={handleWidthChange}
          />
        </Preview.Control>
        <Preview.Control label="Multiple" htmlFor="combobox-select-preview-multiple">
          <Preview.Checkbox
            id="combobox-select-preview-multiple"
            label="Multiple"
            checked={multiple}
            onCheckedChange={handleMultipleChange}
          />
        </Preview.Control>
        <Preview.Control label="Clearable" htmlFor="combobox-select-preview-clearable">
          <Preview.Checkbox
            id="combobox-select-preview-clearable"
            label="Clearable"
            checked={clearable}
            onCheckedChange={setClearable}
          />
        </Preview.Control>
        <Preview.Control label="Filterable" htmlFor="combobox-select-preview-filterable">
          <Preview.Checkbox
            id="combobox-select-preview-filterable"
            label="Filterable"
            checked={filterable}
            onCheckedChange={setFilterable}
          />
        </Preview.Control>
        <Preview.Control label="Disabled" htmlFor="combobox-select-preview-disabled">
          <Preview.Checkbox
            id="combobox-select-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
        <Preview.Control label="Loading" htmlFor="combobox-select-preview-loading">
          <Preview.Checkbox
            id="combobox-select-preview-loading"
            label="Loading"
            checked={loading}
            onCheckedChange={setLoading}
          />
        </Preview.Control>
        <Preview.Control label="Show arrow" htmlFor="combobox-select-preview-arrow">
          <Preview.Checkbox
            id="combobox-select-preview-arrow"
            label="Show arrow"
            checked={showArrow}
            onCheckedChange={setShowArrow}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
