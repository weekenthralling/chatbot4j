import { memo } from "react";

import { FileMeta } from "@/request/types";

import CsvCard from "./CsvCard";
import ImageCard from "./ImageCard";

const FileCard = ({ file, fromMe = false }: { file: FileMeta; fromMe?: boolean }) => {
  switch (file.mimetype) {
    case "image/png":
    case "image/jpeg":
    case "image/gif":
      return <ImageCard file={file} />;
    case "text/csv":
    case "application/vnd.ms-excel": // xls
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": // xlsx
    case "application/vnd.oasis.opendocument.spreadsheet": // ods
      return <CsvCard file={file} fromMe={fromMe} />;
    default:
      // TODO: we need a card for unknown file types
      console.warn("Unknown file type: ", file.mimetype);
  }
};

export default memo(FileCard);
