import { Spin } from "antd";
import { LoaderCircle } from "lucide-react";

import { HumanMessageDTO } from "@/request/types";
import FileCard from "./FileCard";

const HumanMessage = ({
  message,
  convId,
  fromMe,
}: {
  message: HumanMessageDTO;
  convId: string;
  fromMe: boolean;
}) => {
  return (
    <>
      <div className="max-w-full text-base leading-5 break-all text-[#303133] bg-white py-3 pl-3 pr-4 rounded-lg whitespace-break-spaces">
        {/* TODO: We only supports text content for HumanMessage now. */}
        {typeof message.content === "string" ? message.content : ""}
      </div>
      {message.attachments &&
        message.attachments.length > 0 &&
        message.attachments.map((attachment, index) => {
          return (
            <Spin
              indicator={<LoaderCircle className="text-2xl animate-spin" />}
              spinning={attachment.status === "uploading"}
              key={index}
            >
              <FileCard
                file={{
                  ...attachment,
                  url: `/api/convs/${convId}/artifacts/${attachment.filename}`,
                }}
                fromMe={fromMe}
              />
            </Spin>
          );
        })}
    </>
  );
};

export default HumanMessage;
