import { ComponentProps, ReactNode, useRef, useState } from "react";

import { useGlobalMessage } from "@/contexts/MessageProvider";
import { HumanMessageDTO } from "@/request/types";
import { AccessibilityLabels } from "@/utils/accessibility";
import SendIcon from "@/assets/icons/send.svg?react";
import SendDisabledIcon from "@/assets/icons/send-disabled.svg?react";
import StopIcon from "@/assets/icons/stop.svg?react";

type IconButtonProps = ComponentProps<"button"> & {
  icon: ReactNode;
  label: string;
  title?: string;
};
const IconButton = ({
  icon,
  label,
  title,
  className,
  ...rest
}: IconButtonProps) => {
  return (
    <button
      {...rest}
      className={`
                ${className ?? ""}
                flex items-center justify-center
                w-8 h-8
            `}
      aria-label={label}
      title={title ?? label}
    >
      {icon}
    </button>
  );
};

const ChatInput = ({
  receiving = false,
  onSend,
  onInterrupt,
}: {
  receiving?: boolean;
  onSend: (message: HumanMessageDTO) => void;
  onInterrupt?: () => void;
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");

  const messageApi = useGlobalMessage();

  /**
   * Automatically adjust the height if the input area
   */
  const adjustHeight = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    adjustHeight();
  };

  const handleSend = () => {
    const inputValueTrimmed = value.trim();
    if (!inputValueTrimmed) {
      messageApi.info("请先输入你想说的话");
      return;
    }

    const toSend: HumanMessageDTO = {
      id: crypto.randomUUID(),
      sent_at: new Date().toISOString(),
      content: inputValueTrimmed,
      type: "human",
    };
    onSend(toSend);
    setValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    // IMPORTANT: form defaults to refresh the page. We need to prevent that.
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // <https://developer.mozilla.org/zh-CN/docs/Web/API/Element/keydown_event>
    const event = e as React.KeyboardEvent<HTMLTextAreaElement> & {
      isComposing?: boolean;
    };
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    if (event.key === "Enter") {
      if (event.ctrlKey || event.shiftKey || event.altKey) {
        // won't trigger submit here, but only shift key will add a new line
        return true;
      }
      handleSend();
    }
  };

  return (
    <form className="flex relative p-[10px] rounded-xl shadow-md bg-white h-full">
      <div id="chat-input-help" className="sr-only">
        按 Enter 键发送消息，按 Shift+Enter 换行
      </div>
      <textarea
        id="input-text"
        ref={inputRef}
        value={value}
        onChange={handleChange}
        disabled={receiving}
        autoFocus
        className={`
                    flex-1
                    min-h-17 max-h-128
                    m-[6px] pr-16
                    text-sm sm:text-base
                    resize-none
                    focus:outline-none
                    overflow-auto
                `}
        placeholder={
          receiving
            ? "ChatBot正在运行…"
            : "请在此输入你想说的话，点击 Enter 键发送"
        }
        aria-label="消息输入框"
        aria-describedby="chat-input-help"
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center absolute bottom-[10px] right-[10px]">
        {receiving ? (
          <IconButton
            className="bg-transparent"
            onClick={(e) => {
							e.preventDefault();
							onInterrupt?.();
						}}
            icon={<StopIcon />}
            label={AccessibilityLabels.buttons.interrupt}
            title={AccessibilityLabels.buttons.interrupt}
          />
        ) : (
          <IconButton
            onClick={handleSubmit}
            className={`
                            ${value.trim() === "" ? "bg-[#e4e7ed]" : "bg-transparent"}
                            ${value.trim() === "" ? "cursor-not-allowed" : ""}
                            rounded
                        `}
            icon={value.trim() === "" ? <SendDisabledIcon /> : <SendIcon />}
            label={AccessibilityLabels.buttons.send}
            title={`${AccessibilityLabels.buttons.send} (Enter)`}
          />
        )}
      </div>
    </form>
  );
};

export default ChatInput;
