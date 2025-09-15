import { useCallback, useMemo } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import { WorkSheet } from "xlsx";
import { Tooltip } from "antd";

const VirtualTable = ({ data, merges, columnCount }: {
  data: string[][];
  merges: WorkSheet["!merges"];
  columnCount: number;
}) => {
  // 获取每行的高度
  const getRowHeight = useCallback(() => 38, []);

  // 获取每列的宽度
  const getColumnWidth = useCallback(() => 160, []);

  const RenderCell = ({
    columnIndex,
    rowIndex,
    style,
  }: {
    columnIndex: number;
    rowIndex: number;
    style: any;
  }) => {
    const cellData = data[rowIndex]?.[columnIndex];
    // 计算合并单元格偏移
    const merge = merges!.find(
      (m) => m.s.r === rowIndex && m.s.c === columnIndex,
    );
    if (merge) {
      const rowSpan = merge.e.r - merge.s.r + 1;
      const colSpan = merge.e.c - merge.s.c + 1;
      const width = colSpan * getColumnWidth(); // 每列宽度
      const height = rowSpan * getRowHeight(); // 每行高度
      return (
        <div
          style={{
            ...style,
            fontSize: "14px",
            color:
              rowIndex === 0
                ? "#dddddd"
                : "#a8a8a8",
            alignItems: "center",
            display: "grid",
            gridRow: `span ${rowSpan}`,
            gridColumn: `span ${colSpan}`,
            width: `${width}px`,
            height: `${height}px`,
            padding: "0 12px",
            borderBottom:
              rowIndex !== data.length - 1
                ? "1px solid #636363"
                : "none",
            background:
              rowIndex === 0 ? "#424242" : "#383838",
            borderRight: "1px solid solid #636363",
            // borderTop: rowIndex === 0 ? "1px solid #ddd" : "none",
            borderLeft:
              columnIndex !== 0 ? "1px solid #636363" : "none",
          }}
        >
          <Tooltip placement="top" title={cellData}>
            <span className="ellipsis--l1">{cellData || ""}</span>
          </Tooltip>
        </div>
      );
    }
    // 如果单元格属于某个合并区域内，不进行渲染
    const inMergedRange = merges!.some(
      (m) =>
        rowIndex >= m.s.r &&
        rowIndex <= m.e.r &&
        columnIndex >= m.s.c &&
        columnIndex <= m.e.c,
    );
    if (inMergedRange) {
      return null;
    }

    return (
      <div
        style={{
          ...style,
          fontSize: "14px",
          color:
            rowIndex === 0
              ? "#dddddd"
              : "#a8a8a8",
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          boxSizing: "border-box",
          borderBottom:
            rowIndex !== data.length - 1
              ? "1px solid #636363"
              : "none",
          background:
            rowIndex === 0 ? "#424242" : "#383838",
          borderRight: "1px solid solid #636363",
          // borderTop: rowIndex === 0 ? "1px solid #ddd" : "none",
          borderLeft:
            columnIndex !== 0 ? "1px solid #636363" : "none",
        }}
      >
        <Tooltip placement="top" title={cellData}>
          <span className="ellipsis--l1">{cellData || ""}</span>
        </Tooltip>
      </div>
    );
  };

  const height = useMemo(
    () =>
      data.length * getRowHeight() > 560 ? 560 : data.length * getRowHeight(),
    [data.length, getRowHeight],
  );
  return (
    <div className="pb-1 rounded-sm overflow-x-auto">
      {data.length > 0 && (
        <Grid
          style={{
            borderRadius: "4px",
          }}
          columnCount={columnCount}
          columnWidth={getColumnWidth}
          height={height}
          rowCount={data.length}
          rowHeight={getRowHeight}
          width={columnCount * getColumnWidth() + (height === 560 ? 6 : 0)}
        >
          {RenderCell}
        </Grid>
      )}
    </div>
  );
};

export default VirtualTable;
