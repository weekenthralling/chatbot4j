import { useState } from "react";
import { ChevronDown, ChevronUp } from 'lucide-react';

import { AIMessageDTO } from "@/request/types";
import { createKeyboardHandler } from "@/utils/accessibility";
import DeepThink from "@/assets/icons/deep_think.svg?react";

import MarkdownContent from "./MarkdownContent";
// import ToolCall from "./ToolCall";


type OpenConfig = {
  toolCalls?: boolean;
  thinking?: boolean;
  // future: image, chart, reference...
};

const AIMessage = ({ message, defaultOpenConfig = {} }: {
  message: AIMessageDTO;
  defaultOpenConfig?: OpenConfig;  // Whether the tool calls are opened by default.
}) => {
  const [openState, setOpenState] = useState<OpenConfig>(defaultOpenConfig);

  const toggle = (key: keyof OpenConfig) => {
    setOpenState(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-full text-base leading-5 break-all">
      {/* Display reasoning/thinking if available */}
      {message.reasoning && (
        <div className="text-[var(--color-text-muted)] mb-2">
          <div
            className="
              inline-flex items-center
              py-1 px-2
              text-[12px] font-semibold
              bg-bg-secondary
              rounded-xl
              cursor-pointer
              hover:opacity-80 transition-opacity
              focus:outline-none focus:ring-2 focus:ring-text-button focus:ring-offset-1
            "
            onClick={() => toggle("thinking")}
            onKeyDown={createKeyboardHandler(() => toggle("thinking"))}
            role="button"
            tabIndex={0}
            aria-expanded={!!openState.thinking}
            aria-label={`${!!openState.thinking ? '收起' : '展开'}思考内容`}
          >
            <DeepThink className="text-[18px] mr-1" />
            <span>思考内容</span>
            {!!openState.thinking ? (
              <ChevronUp className={`w-[16px] mr-1 ml-[2px] transition-all`} />
            ) : (
              <ChevronDown className={`w-[16px] mr-1 ml-[2px] transition-all`} />
            )}
          </div>
          {!!openState.thinking && (
            <div className="relative pl-4 mt-2">
              <div className="w-[2px] bg-[#4e4e56] absolute h-full left-0 top-0"></div>
              <MarkdownContent text={message.reasoning} />
            </div>
          )}
        </div>
      )}

      {/* Display message content */}
      {message.content && <MarkdownContent text={message.content} />}
    </div>
  );
};

export default AIMessage;
