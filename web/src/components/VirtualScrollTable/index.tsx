import { useEffect, useRef, useState } from "react";
import { VariableSizeGrid as Grid, GridOnItemsRenderedProps } from "react-window";
import ResizeObserver from "rc-resize-observer";
import { Table } from "antd";
import type { TableProps } from "antd";

const VirtualTable = <RecordType extends object>(
  props: TableProps<RecordType> & {
    loadNextPage?: () => void;
    hasNextPage?: boolean;
    selectedRowKeys?: number[];
    selectedColumns?: string[];
    handleRowSelect?: (index: number) => void;
    fixedTableWidth?: number;
    columnsData: string[];
  },
) => {
  const {
    columns,
    columnsData,
    scroll,
    dataSource,
    loadNextPage,
    hasNextPage,
    loading,
    selectedRowKeys,
    selectedColumns,
    handleRowSelect,
    fixedTableWidth,
  } = props;
  const [tableWidth, setTableWidth] = useState(0);
  const cellHeight = props.size === "small" ? 38 : 43;
  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? (dataSource ?? []).length + 1 : (dataSource ?? []).length;

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = loadNextPage;

  const widthColumnCount = columns!.filter(({ width }) => !width).length;
  const mergedColumns = columns!.map((column) => {
    const width = Math.floor(tableWidth / widthColumnCount);
    return {
      ...column,
      width: width < 150 ? 150 : width,
    };
  });
  const gridRef = useRef<any>(null);
  const [connectObject] = useState<any>(() => {
    const obj = {};
    Object.defineProperty(obj, "scrollLeft", {
      get: () => {
        if (gridRef.current) {
          return gridRef.current?.state?.scrollLeft;
        }
        return null;
      },
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });

    return obj;
  });

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: true,
    });
  };

  const onItemsRendered = (data: GridOnItemsRenderedProps) => {
    if (data.visibleRowStopIndex + 1 === itemCount) {
      hasNextPage && !loading && loadMoreItems && loadMoreItems();
    }
  };
  useEffect(() => resetVirtualGrid, [tableWidth, mergedColumns]);

  useEffect(() => {
    if (mergedColumns.length) {
      gridRef.current?.scrollToItem({
        rowIndex: 0,
      });
    }
    // setTableWidth(fixedTableWidth ?? 800);
  }, [columns]);

  const renderVirtualList: any = (
    rawData: {
      Index: string;
      [key: string]: string;
    }[],
    { scrollbarSize, ref, onScroll }: any,
  ) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * cellHeight;
    return (
      <Grid
        ref={gridRef}
        onItemsRendered={onItemsRendered}
        className="virtual-grid"
        columnCount={mergedColumns.length}
        columnWidth={(index: number) => {
          const { width } = mergedColumns[index];
          return totalHeight > Number(scroll!.y!) && index === mergedColumns.length - 1
            ? (width as number) - scrollbarSize - 1
            : (width as number);
        }}
        height={scroll!.y as number}
        rowCount={itemCount}
        rowHeight={() => cellHeight}
        width={fixedTableWidth ?? tableWidth}
        onScroll={({ scrollLeft }: { scrollLeft: number }) => {
          onScroll({ scrollLeft });
        }}
      >
        {(gridProps) => {
          const { columnIndex, rowIndex, style } = gridProps;
          return (
            <div
              className={`
                px-5 py-3
                text-sm leading-[19px] text-ellipsis whitespace-nowrap text-[#a8a8a8]
                overflow-hidden
                bg-[#424242]
                border-b-[0.5px] border-b-[#565656]
                ${props.size === "small" && "py-2.5 px-3"}
                ${
                  (selectedRowKeys?.includes(Number(rawData[rowIndex]?.Index)) ||
                    selectedColumns?.includes(columnsData[columnIndex])) &&
                  "text-[#6858d1] bg-[#e5e1ff]"
                }
                ${columnsData[columnIndex] === "Index" && "bg-[#f5f8fa] border-r-[0.5px] border-r-[#dde2e6]"}
              `}
              onClick={() => handleRowSelect && handleRowSelect(Number(rawData[rowIndex].Index))}
              style={style as React.CSSProperties}
            >
              {rowIndex < rawData.length &&
                (rawData[rowIndex] as any)[(mergedColumns as any)[columnIndex].dataIndex]}
            </div>
          );
        }}
      </Grid>
    );
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        if (fixedTableWidth) {
          setTableWidth(fixedTableWidth);
        } else {
          setTableWidth(width);
        }
      }}
    >
      <div>
        <Table
          {...props}
          dataSource={dataSource}
          scroll={scroll}
          loading={!!loading}
          columns={mergedColumns}
          pagination={false}
          components={{
            body: renderVirtualList,
          }}
        />
      </div>
    </ResizeObserver>
  );
};

export default VirtualTable;
