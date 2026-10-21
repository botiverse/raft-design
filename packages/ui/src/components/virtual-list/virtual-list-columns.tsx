/*
 * The columns of an item, for lists with `columns`.
 */
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { Column, RenderColInfo, RenderItemWithColsInfo } from "./virtual-list-types";

export interface ColumnsContextValue {
  startIndex: number;
  endIndex: number;
  columns: readonly Column[];
  renderCol: ((info: RenderColInfo) => ReactNode) | undefined;
  renderItemWithCols: ((info: RenderItemWithColsInfo) => ReactNode) | undefined;
  getLeft: (index: number) => number;
}

export const ColumnsContext = createContext<ColumnsContextValue | null>(null);

/**
 * Renders the item's columns in the current column range: `renderItemWithCols` once, else
 * `renderCol` for each column.
 */
export function ItemColumns(props: { index: number | undefined; item: unknown }) {
  const { index, item } = props;
  const context = useContext(ColumnsContext);
  if (!context) {
    return null;
  }
  const { startIndex, endIndex, columns, renderCol, renderItemWithCols, getLeft } = context;
  if (renderItemWithCols != null) {
    return renderItemWithCols({
      itemIndex: index,
      startColIndex: startIndex,
      endColIndex: endIndex,
      allColumns: columns,
      item,
      getLeft,
    });
  }
  if (renderCol != null) {
    const cols: ReactNode[] = [];
    for (let i = startIndex; i <= endIndex; ++i) {
      const column = columns[i];
      cols.push(
        renderCol({
          column,
          left: getLeft(i),
          item,
          key: i,
        }),
      );
    }
    return cols;
  }
  return null;
}
