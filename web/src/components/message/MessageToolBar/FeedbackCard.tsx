import { useEffect, useState } from "react";
import { Input } from "antd";

import { updateOrAddMessage } from "@/store/messageStore";
import { feedbackToServer } from "@/request/conv";
import { AIMessageDTO, FeedbackDTO } from "@/request/types";
import { useGlobalMessage } from "@/contexts/MessageProvider";

const FeedbackCard = ({
  message,
  conv_id,
  feedbackSuccess,
}: {
  message: AIMessageDTO;
  conv_id: string;
  feedbackSuccess?: () => void;
}) => {
  const messageApi = useGlobalMessage();

  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [otherFeedback, setOtherFeedback] = useState("");
  const tagList = ["回答不准确", "理解错误", "内容不完整", "回答速度太慢", "格式不友好"];

  const handleCheckTag = (item: string) => {
    if (activeTags.includes(item)) {
      if (item === "其他") {
        setOtherFeedback("");
      }
      // remove tag
      setActiveTags(activeTags.filter((tag) => tag !== item));
    } else {
      // add tag
      setActiveTags([...activeTags, item]);
    }
  };

  const handleSubmit = async () => {
    const comments = activeTags.filter((tag) => tag !== "其他");
    if (otherFeedback) {
      comments.push(otherFeedback);
    }
    const feedback: FeedbackDTO = {
      rating: "thumbsDown",
      comment: comments.join(","),
    };

    try {
      await feedbackToServer(conv_id, message.parent_id!, feedback);
      updateOrAddMessage(conv_id, {
        ...message,
        additional_kwargs: {
          ...message.additional_kwargs,
          feedback: feedback,
        },
      });
      feedbackSuccess?.();
    } catch {
      messageApi.error("Error feedback");
    }
  };

  useEffect(() => {
    if (message?.additional_kwargs?.feedback?.comment) {
      const commentArr = message.additional_kwargs.feedback.comment.split(",");
      const InputValueArr = commentArr.filter((item: string) => !tagList.includes(item));
      const checkTags = tagList.filter((tag) => commentArr.includes(tag));
      if (InputValueArr.length && !checkTags.includes("其他")) {
        checkTags.push("其他");
      }
      setOtherFeedback(InputValueArr.join(","));
      setActiveTags(checkTags);
    }
  }, [message?.additional_kwargs?.feedback]);

  return (
    <div className="mt-3 p-3 text-text-secondary rounded-[8px] border-solid border-[0.5px] bg-white">
      <div>
        <div className="flex items-center mb-2 text-[14px] leading-5 font-semibold text-[var(--color-text-muted)]">
          <div className="w-[6px] h-[6px] mr-[7.5px] bg-[var(--color-text-muted)] transform rotate-45" />
          请告诉我们哪里不好：
        </div>
        <div className="flex flex-wrap">
          {[...tagList, "其他"].map((item) => (
            <div
              key={item}
              className={`
                mt-2 mr-2 px-3 py-[6px] text-[14px] leading-5 border-[0.5px] rounded-[4px] cursor-pointer
                ${activeTags.includes(item) ? "bg-[#EFFAFF] text-[#00A0E9] border-[#C2ECFF]" : "bg-[#F6F6F6] border-[#DCDFE6] hover:bg-[#EFFAFF] hover:text-[#00A0E9]"}
              `}
              onClick={() => handleCheckTag(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCheckTag(item);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={activeTags.includes(item)}
              aria-label={`反馈标签：${item}${activeTags.includes(item) ? "，已选择" : ""}`}
            >
              {item}
            </div>
          ))}
        </div>
        {activeTags.includes("其他") && (
          <Input
            className="w-full mt-2 bg-transparent border-[1px] border-border-secondary"
            placeholder="请在此输入你想说的话，点击提交"
            value={otherFeedback}
            size="large"
            onChange={(e) => setOtherFeedback(e.target.value)}
            aria-label="其他反馈详细说明"
          />
        )}
      </div>
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={!activeTags.length || (activeTags.includes("其他") && !otherFeedback)}
          className="
            h-8 flex items-center justify-center px-4
            text-[#606266] border-[#DCDFE6] border text-[14px] font-semibold
            rounded
            transition-colors
            disabled:bg-[var(--color-text-muted)]
            disabled:text-white
            disabled:cursor-not-allowed
          "
          aria-label={
            !activeTags.length || (activeTags.includes("其他") && !otherFeedback)
              ? "请选择反馈标签或填写其他反馈"
              : "提交反馈"
          }
        >
          提交
        </button>
      </div>
    </div>
  );
};

export default FeedbackCard;
