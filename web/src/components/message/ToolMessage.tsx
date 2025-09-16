import { useState } from "react";
import { Image } from "antd";
import { ChevronRight, LoaderCircle, SquareTerminal } from "lucide-react";

import { ToolMessageDTO } from "@/request/types";

import MarkdownContent from "./MarkdownContent";
import FileCard from "./FileCard";

const ToolMessage = ({
  message,
  convId,
  defaultOpen = false,
}: {
  message: ToolMessageDTO;
  convId: string;
  defaultOpen?: boolean;
}) => {
  if (
    message.type === "ToolMessageChunk" &&
    (message.content === undefined ||
      message.content === null ||
      message.content === "" ||
      (Array.isArray(message.content) && message.content.length === 0))
  ) {
    return (
      <div className="flex items-center mt-2">
        <ChevronRight className="mr-[6px] text-[#8a8a8a]" />
        <div
          className="flex items-center justify-center w-5 h-5 mr-[6px] rounded-[5px]"
          style={{
            background: "linear-gradient(90deg, #565656 0%, #424242 100%)",
          }}
        >
          <LoaderCircle className="text-[11px] dark:text-[#1df252] animate-spin" />
        </div>
        <span className="text-[13px] font-semibold dark:text-[#1df252]">
          运行中...
        </span>
      </div>
    );
  }

  const [openCode, setOpenCode] = useState(defaultOpen);

  const combinedText = Array.isArray(message.content)
    ? message.content
        .filter(
          (item: any) =>
            typeof item === "string" ||
            (typeof item === "object" && item !== null && item.type === "text"),
        )
        .map((item: any) => (typeof item === "string" ? item : item.text))
        .join("\n")
    : typeof message.content === "string"
      ? message.content
      : "";

  return (
    <div className="max-w-full my-3 break-all">
      <div
        className="
          flex items-center cursor-pointer
          p-1 rounded
          transition-colors
          hover:bg-bg-highlight
          hover:text-text-button
        "
        onClick={() => setOpenCode(!openCode)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpenCode(!openCode);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={openCode}
        aria-label={`${openCode ? "收起" : "展开"}工具执行结果`}
      >
        <ChevronRight
          className={`mr-[6px] size-4 text-[var(--color-text-muted)] ${openCode ? "rotate-90" : ""} transition-transform`}
        />
        <SquareTerminal className="mr-[6px] size-4" />
        <span className="text-[13px] font-semibold">结果</span>
      </div>
      {combinedText && (
        <div
          className={`
            ${openCode ? "block" : "hidden"}
            mt-2
            border-[1px] border-solid border-border-secondary rounded-[8px]
          `}
        >
          <div
            className="
            flex items-center
            px-[26px] py-2
            font-semibold text-sm
            border-b-[1px] border-solid border-border-secondary
          "
          >
            pycon
          </div>
          <div className="px-[26px] py-3">
            <MarkdownContent text={combinedText} />
          </div>
        </div>
      )}
      {/* 图片内容不受 openCode 控制 */}
      {Array.isArray(message.content) &&
        message.content.map((item: any, index: number) => {
          if (
            typeof item === "object" &&
            item !== null &&
            item.type === "image_url"
          ) {
            return (
              <div className="max-w-full mt-3" key={index}>
                <Image
                  width={200}
                  src={item.image_url.url}
                  preview={{
                    title: "预览",
                  }}
                />
              </div>
            );
          }
          return null;
        })}
      {message.artifacts &&
        message.artifacts.length > 0 &&
        message.artifacts.map((artifact, index) => {
          return (
            <FileCard
              file={{
                ...artifact,
                url: `/api/convs/${convId}/artifacts/${artifact.filename}`,
              }}
              key={index}
            />
          );
        })}
    </div>
  );
};

export default ToolMessage;
