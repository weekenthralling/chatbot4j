import { useEffect, useState } from "react";
import { read, Sheet, utils, WorkSheet } from "xlsx";
import { ConfigProvider, Modal, Spin, Tabs } from "antd";
import { X } from "lucide-react";

import VirtualTable from "./VirtualTable";


const TabularDataPreview = ({ open, filename, previewUrl, onClose }: {
  filename: string;
  previewUrl: string;
  open: boolean;
  onClose: () => void;
}) => {
  const [sheets, setSheets] = useState<{
    sheetName: string;
    dataSource: any[];
    merges?: WorkSheet["!merges"];
    columnCount: number;
  }[]>([]);
  const [fileLoading, setFileLoading] = useState(false);

  const getColumnCountFromRef = (sheet: Sheet) => {
    if (!sheet["!ref"]) return 0;
    const range = utils.decode_range(sheet["!ref"]!); // 获取表格范围
    return range.e.c - range.s.c + 1; // 结束列数 - 起始列数 + 1
  };

  const getColumnRowOffset = (sheet: Sheet) => {
    if (!sheet["!ref"]) {
      return { r: 0, c: 0 };
    }
    const range = utils.decode_range(sheet["!ref"]!); // 获取表格范围
    return { c: range.s.c, r: range.s.r };
  };

  useEffect(() => {
    const fetchData = async (dataUrl: string) => {
      setFileLoading(true);
      const response = await fetch(dataUrl);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = read(arrayBuffer, { type: "array", codepage: 65001 });
      const sheetData: any = [];
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const dataSource = utils.sheet_to_json(sheet, {
          header: 1,
        });
        const offset = getColumnRowOffset(sheet);
        // 合并位置修正，实际excel内容可能不是从A1开始
        const adjustedMerges = (sheet["!merges"] ?? [])!.map((merge) => ({
          s: { r: merge.s.r - offset.r, c: merge.s.c - offset.c },
          e: { r: merge.e.r - offset.r, c: merge.e.c - offset.c },
        }));
        sheetData.push({
          sheetName,
          dataSource,
          merges: adjustedMerges,
          columnCount: getColumnCountFromRef(sheet),
        });
      });
      setSheets(sheetData);
      setFileLoading(false);
    };

    if (previewUrl && open) {
      fetchData(previewUrl);
    }
  }, [previewUrl, open]);

  return (
    <Modal
      zIndex={9999}
      width={900}
      closable={true}
      closeIcon={<X />}
      footer={null}
      centered
      open={open}
      onCancel={onClose}
      onOk={onClose}
      forceRender
      okButtonProps={{
        style: {
          color: "#000",
          fontWeight: 600,
          background: "#30d158",
        },
      }}
      okText="确认"
      cancelButtonProps={{
        style: {
          color: "#fff",
          background: "#424242",
          borderColor: "#424242",
        },
      }}
      cancelText="取消"
    >
      <div
        className="mb-5 text-base leading-[23px]"
      >
        {filename}
      </div>
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              itemColor: "#dddddd",
              cardBg: "unset",
            },
          },
        }}
      >
        <Spin spinning={fileLoading}>
          <Tabs
            items={sheets.map((sheet) => ({
              label: sheet.sheetName,
              key: sheet.sheetName,
              children: (
                <VirtualTable
                  merges={sheet.merges}
                  data={sheet.dataSource}
                  columnCount={sheet.columnCount}
                />
              ),
            }))}
          />
        </Spin>
      </ConfigProvider>
    </Modal>
  );
};

export default TabularDataPreview;
