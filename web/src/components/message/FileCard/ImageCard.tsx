import { memo } from "react";
import { Image } from "antd";

import { FileMeta } from "@/request/types";

const ImageCard = ({ file }: { file: FileMeta }) => {
  return (
    <div className="max-w-full mt-1">
      <Image
        width={200}
        src={file.url}
        preview={{
          title: "预览",
        }}
      />
    </div>
  );
};

export default memo(ImageCard);
