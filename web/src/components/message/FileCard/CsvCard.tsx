import { useState } from "react";
import { CloudDownload, Eye } from "lucide-react";

import TabularDataPreview from "@/components/TabularDataPreview";
import { FileMeta } from "@/request/types";
import { ellipsisInMiddle } from "@/utils/strings";
import CsvIcon from "@/assets/icons/csv_icon.svg?react";


const CsvCard = ({ file, fromMe = false }: { file: FileMeta, fromMe?: boolean }) => {

  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDownload = async () => {
    window.open(file.url, "__blank");
  };

  return (
    <div className="max-w-full flex p-2 rounded-[8px]">
      <div className="w-10 text-[40px]">
        <CsvIcon />
      </div>
      <div className="flex flex-col items-start justify-center ml-3">
        <div
          className={`
            w-full mb-1 text-xs ellipsis--l1
            ${fromMe ? "text-black" : "text-white"}
          `}
        >
          {ellipsisInMiddle(file.filename, 40)}
        </div>
      </div>
      <div className="flex items-center ml-3">
        <Eye
          className={`
            m-1 p-[6px] text-[14px] border-[1px] rounded-full cursor-pointer
            ${fromMe ? "text-black border-[#000]" : "text-white border-[#fff]"}
          `}
          onClick={() => setPreviewOpen(true)}
        />
        <CloudDownload
          className={`
            m-1 p-[6px] text-[14px] border-[1px] rounded-full  cursor-pointer
            ${fromMe ? "text-black border-[#000]" : "text-white border-[#fff]"}
          `}
          onClick={handleDownload}
        />
      </div>
      <TabularDataPreview
        filename={file.filename}
        previewUrl={file.url}
        open={previewOpen}
        onClose={() => { setPreviewOpen(false) }}
      />
    </div>
  );
};

export default CsvCard;
