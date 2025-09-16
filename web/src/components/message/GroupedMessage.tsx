import React, { useMemo } from "react";
import { useParams } from "react-router";

import { useModelsStore } from "@/store/modelsStore";
import { useUserStore } from "@/store/userStore";

import AIMessage from "./AIMessage";
import HumanMessage from "./HumanMessage";
import ToolMessage from "./ToolMessage";
import MessageToolBar from "./MessageToolBar";

// TODO: It's not ideal to pass conv id to message.
// But the ToolMessage component needs it now.
export const Message = ({
  message,
  fromMe,
  convId,
}: {
  message: any;
  fromMe: boolean;
  convId: string;
}) => {
  switch (message.type) {
    case "human":
      return <HumanMessage message={message} convId={convId} fromMe={fromMe} />;
    case "ai":
    case "AIMessageChunk":
      return <AIMessage message={message} />;
    case "tool":
    case "ToolMessageChunk":
      return <ToolMessage message={message} convId={convId} />;
  }
};

/**
 *
 */
const GroupedMessage = ({
  children,
  frozen = false,
}: {
  children: any[];
  frozen?: boolean;
}) => {
  const { id: convId } = useParams();
  const models = useModelsStore((state) => state.models);
  const userInfo = useUserStore((state) => state.userInfo);

   return (
    <div className="flex flex-col px-4">
      {children && children.length && (
        children.map((message, index) => {
          const fromMe = message.type === "human";
          return (
            <div
              key={index}
              className={`
                max-w-full p-2 text-justify
                ${
                  fromMe
                    ? "ml-auto mr-0 rounded-l-xl rounded-tr-xl"
                    : "mr-auto rounded-r-xl rounded-tl-xl"
                }
              `}
            >
              <Message
                message={message}
                fromMe={fromMe}
                convId={convId!}
              />
              {/* actions */}
              {!frozen && !fromMe && index === children.length - 1 && (
                <div>
                  {/* We don't display model name unless we deployed more than one model */}
                  {models.length > 1 &&
                    message.additional_kwargs?.model && (
                      <span className="text-[#8a8a8a] text-[13px]">
                        {message.additional_kwargs.model}
                      </span>
                    )}
                  <MessageToolBar
                    message={message}
                    conv_id={convId ?? ""}
                  />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GroupedMessage;

