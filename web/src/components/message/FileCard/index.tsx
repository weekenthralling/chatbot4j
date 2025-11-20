import { memo } from "react";

import { FileMeta } from "@/request/types";

import ImageCard from "./ImageCard";

const FileCard = ({ file, fromMe = false }: { file: FileMeta; fromMe?: boolean }) => {
  switch (file.mimetype) {
    case "image/png":
    case "image/jpeg":
    case "image/gif":
      return <ImageCard file={file} />;
    default:
      // TODO: we need a card for unknown file types
      console.warn("Unknown file type: ", file.mimetype);
  }
};

export default memo(FileCard);
