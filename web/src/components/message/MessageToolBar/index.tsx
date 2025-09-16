import { memo, useState } from "react";
import { Tooltip } from "antd";
import { ThumbsUp, ThumbsDown } from "lucide-react";

import { feedbackToServer } from "@/request/conv";
import { AIMessageDTO, FeedbackRating } from "@/request/types";
import { useGlobalMessage } from "@/contexts/MessageProvider";
import {
  getToggleAriaProps,
  createKeyboardHandler,
  AccessibilityLabels,
} from "@/utils/accessibility";

import FeedbackCard from "./FeedbackCard";

const MessageToolBar = ({
  message,
  conv_id,
}: {
  message: AIMessageDTO;
  conv_id: string;
}) => {
  const [feeback, setFeedback] = useState<FeedbackRating>(
    message.additional_kwargs?.feedback?.rating,
  );
  const [feedbackOptionsOpen, setFeedbackOptionsOpen] = useState(false);
  const messageApi = useGlobalMessage();

  const handleThumbsUp = async () => {
    if (feeback === "thumbsUp") {
      return;
    }
    try {
      await feedbackToServer(conv_id, message.parent_id!, {
        rating: "thumbsUp",
      });
      setFeedback("thumbsUp");
    } catch {
      messageApi.error("Error feedback");
    }
  };

  const handleThumbsDown = () => {
    setFeedback("thumbsDown");
    setFeedbackOptionsOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-muted)]">
        <Tooltip
          placement="top"
          title="点赞"
          arrow={false}
          color="#222222e6"
          styles={{
            root: {
              border: "1px solid #ffffff40",
              borderRadius: "4px",
            },
          }}
        >
          <div
            className="
              flex items-center justify-center
              cursor-pointer transition duration-400 ease-in-out
              hover:text-[var(--color-text-success)]"
            onClick={handleThumbsUp}
            onKeyDown={createKeyboardHandler(handleThumbsUp)}
            {...getToggleAriaProps(
              feeback === "thumbsUp",
              AccessibilityLabels.buttons.like,
            )}
          >
            {feeback === "thumbsUp" ? (
              <ThumbsUp
                className="w-4 h-4"
                fill="var(--color-confirm)"
                strokeWidth={0}
              />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
          </div>
        </Tooltip>
        <Tooltip
          placement="top"
          title="点踩"
          arrow={false}
          color="#222222e6"
          styles={{
            root: {
              border: "1px solid #ffffff40",
              borderRadius: "4px",
            },
          }}
        >
          <div
            className="
              flex items-center justify-center
              cursor-pointer transition duration-400 ease-in-out
              hover:text-[var(--color-text-success)]"
            onClick={handleThumbsDown}
            onKeyDown={createKeyboardHandler(handleThumbsDown)}
            {...getToggleAriaProps(
              feeback === "thumbsDown",
              AccessibilityLabels.buttons.dislike,
            )}
          >
            {feeback === "thumbsDown" ? (
              <ThumbsDown
                className="w-4 h-4"
                fill="var(--color-confirm)"
                strokeWidth={0}
              />
            ) : (
              <ThumbsDown className="w-4 h-4" />
            )}
          </div>
        </Tooltip>
      </div>
      {feedbackOptionsOpen && (
        <FeedbackCard
          message={message}
          conv_id={conv_id}
          feedbackSuccess={() => setFeedbackOptionsOpen(false)}
        />
      )}
    </>
  );
};
export default memo(MessageToolBar);
