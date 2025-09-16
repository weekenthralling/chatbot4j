import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { throttle } from "lodash";

import ChatInput from "@/components/ChatInput";
import { addConv } from "@/store/convsStore";
import { setPreSendMessage } from "@/store/messageStore";
import { createConvOnServer } from "@/request/conv";
import { HumanMessageDTO } from "@/request/types";
import { useChatLayout } from "@/hooks/useChatLayout";
import { useGlobalMessage } from "@/contexts/MessageProvider";
import SmileImage from "@/assets/icons/smile.png";
import { useUserStore } from "@/store/userStore";
import { getTimePeriod } from "@/utils/datetime";

// TODO: Check if we can use react-router's action in this component
const Index = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { contentContainerClasses } = useChatLayout();
  const [dragOver, setDragOver] = useState(false);
  const messageApi = useGlobalMessage();
  const { id: convId } = useParams();
  const userInfo = useUserStore((state) => state.userInfo);

  const handleSend = throttle(async (message) => {
    setLoading(true);
    try {
      const newConv = await createConvOnServer({ title: "New Chat" });
      const toSend: HumanMessageDTO = {
        ...message,
        additional_kwargs: {
          ...message.additional_kwargs,
          // The first message in a new conversation always requires title summarization
          require_summarization: true,
        },
      };
      setPreSendMessage(toSend);
      addConv(newConv);
      navigate(`/chat/${newConv.id}`, { replace: true });
    } catch {
      messageApi.error("创建对话失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, 200) as any;

  const handleDrop = async (event: any) => {
    event.preventDefault();
    // setDragOver(false);
    // const droppedFiles = Array.from(event.dataTransfer.files);
    // await runCreateConv(droppedFiles);
  };

  return (
    <div
      className="
        flex justify-center items-center relative
        h-full w-full
      "
      // onDragEnter={(e) => {
        // e.preventDefault();
        // setDragOver(true);
      // }}
    >
      <div
        className={`absolute w-full left-1/2 -translate-x-1/2 z-10 px-4 ${!convId ? "top-1/2 -translate-y-1/2 -mt-20" : "bottom-10"}`}
      >
        <div className="flex mb-9 items-center justify-center">
          <img src={SmileImage} className="size-12" alt="" />
          <div className="font-semibold text-3xl ml-2 text-nowrap">
            {getTimePeriod()}好，{userInfo?.username}
          </div>
        </div>
        <div
          className={`
            w-[760px]
            ${!convId ? "h-[160px]" : "h-[100px]"}
            ${contentContainerClasses}
          `}
        >
          <ChatInput onSend={handleSend} />
        </div>
      </div>
      {dragOver && (
        <div
          className="
            absolute left-0 top-0 flex items-center justify-center
            w-full h-full
            text-[18px]
            bg-[var(--color-bg-overlay)]
            z-1000
          "
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
        >
          拖拽文件到此区域上传
        </div>
      )}
    </div>
  );
};

export default Index;
