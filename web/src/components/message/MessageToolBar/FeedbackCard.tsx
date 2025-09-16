import { useEffect, useState } from "react";
import { Input } from "antd";

import { updateOrAddMessage } from "@/store/messageStore";
import { feedbackToServer } from "@/request/conv";
import { AIMessageDTO, FeedbackDTO } from "@/request/types";
import { useGlobalMessage } from "@/contexts/MessageProvider";
import {
  getToggleAriaProps,
  createKeyboardHandler,
  AccessibilityLabels,
  generateAriaLabel,
} from "@/utils/accessibility";

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
  const [tableDiffLevel, setTableDiffLevel] = useState<string | undefined>();
  const [questionDiffLevel, setQuestionDiffLevel] = useState<
    string | undefined
  >();
  const [questionType, setQuestionType] = useState<string | undefined>();
  const [otherFeedback, setOtherFeedback] = useState("");
  const tagList = [
    "问题理解错误",
    "问题理解了但没找对字段",
    "问题理解了并找到了字段，代码错了",
    "问题、找字段、代码都对但总结错了",
    "都对但总结得不够好",
    "回答速度太慢",
  ];

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
      labels: {
        data_difficulty: tableDiffLevel ?? undefined,
        input_difficulty: questionDiffLevel ?? undefined,
        input_type: questionType ?? undefined,
      },
    };

    try {
      await feedbackToServer(conv_id, message.parent_id!, feedback);
      updateOrAddMessage({
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
      const InputValueArr = commentArr.filter(
        (item: string) => !tagList.includes(item),
      );
      const checkTags = tagList.filter((tag) => commentArr.includes(tag));
      if (InputValueArr.length && !checkTags.includes("其他")) {
        checkTags.push("其他");
      }
      setOtherFeedback(InputValueArr.join(","));
      setActiveTags(checkTags);
    }
    if (message?.additional_kwargs?.feedback?.labels) {
      const labels = message.additional_kwargs.feedback.labels;
      setTableDiffLevel(labels.data_difficulty);
      setQuestionDiffLevel(labels.input_difficulty);
      setQuestionType(labels.input_type);
    }
  }, [message?.additional_kwargs?.feedback]);

  return (
    <div className="mt-3 p-3 text-text-secondary rounded-[8px] border-solid border-[0.5px] bg-white">
      <div className="mb-5">
        <div className="flex items-center text-[14px] leading-5 font-semibold text-[var(--color-text-muted)] mb-4">
          <div className="w-[6px] h-[6px] mr-[7.5px] bg-[var(--color-text-muted)] transform rotate-45" />
          请与我们分享更多信息：
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <span className="w-[84px] text-[#303133]">表格难易度：</span>
            {[
              { value: "easy", label: "简单" },
              { value: "moderate", label: "中等" },
              { value: "hard", label: "复杂" },
            ].map((item) => (
              <div
                key={item.value}
                className={`
                  mr-2 px-3 py-[6px] text-[14px] leading-5 border-[0.5px] rounded-[4px] cursor-pointer
                  ${tableDiffLevel === item.value ? "bg-[#EFFAFF] text-[#00A0E9] border-[#C2ECFF]" : "bg-[#F6F6F6] border-[#DCDFE6] hover:bg-[#EFFAFF] hover:text-[#00A0E9]"}
                `}
                onClick={() =>
                  setTableDiffLevel(
                    tableDiffLevel !== item.value ? item.value : undefined,
                  )
                }
                onKeyDown={createKeyboardHandler(() =>
                  setTableDiffLevel(
                    tableDiffLevel !== item.value ? item.value : undefined,
                  ),
                )}
                {...getToggleAriaProps(
                  tableDiffLevel === item.value,
                  generateAriaLabel({
                    context: AccessibilityLabels.feedback.difficulty.table,
                    baseLabel: item.label,
                  }),
                )}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <span className="w-[84px] text-[#303133]">提问难易度：</span>
            {[
              { value: "easy", label: "简单" },
              { value: "moderate", label: "中等" },
              { value: "hard", label: "复杂" },
            ].map((item) => (
              <div
                key={item.value}
                className={`
                  mr-2 px-3 py-[6px] text-[14px] leading-5 border-[0.5px] rounded-[4px] cursor-pointer
                  ${questionDiffLevel === item.value ? "bg-[#EFFAFF] text-[#00A0E9] border-[#C2ECFF]" : "bg-[#F6F6F6] border-[#DCDFE6] hover:bg-[#EFFAFF] hover:text-[#00A0E9]"}
                `}
                onClick={() =>
                  setQuestionDiffLevel(
                    questionDiffLevel !== item.value ? item.value : undefined,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setQuestionDiffLevel(
                      questionDiffLevel !== item.value ? item.value : undefined,
                    );
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={questionDiffLevel === item.value}
                aria-label={`提问难易度：${item.label}${questionDiffLevel === item.value ? "，已选择" : ""}`}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <span className="w-[84px] text-[#303133]">提问类型：</span>
            {[
              { value: "table_qa", label: "表格QA" },
              { value: "general_chat", label: "通用QA-闲聊" },
              {
                value: "general_instruction_following",
                label: "通用QA-指令遵循",
              },
              { value: "general_security_sensitive", label: "通用QA-安全敏感" },
            ].map((item) => (
              <div
                key={item.value}
                className={`
                  mr-2 px-3 py-[6px] text-[14px] leading-5 border-[0.5px] rounded-[4px] cursor-pointer
                  ${questionType === item.value ? "bg-[#EFFAFF] text-[#00A0E9] border-[#C2ECFF]" : "bg-[#F6F6F6] border-[#DCDFE6] hover:bg-[#EFFAFF] hover:text-[#00A0E9]"}
                `}
                onClick={() =>
                  setQuestionType(
                    questionType !== item.value ? item.value : undefined,
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setQuestionType(
                      questionType !== item.value ? item.value : undefined,
                    );
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={questionType === item.value}
                aria-label={`提问类型：${item.label}${questionType === item.value ? "，已选择" : ""}`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center mb-2 text-[14px] leading-5 font-semibold text-[var(--color-text-muted)]">
          <div className="w-[6px] h-[6px] mr-[7.5px] bg-[var(--color-text-muted)] transform rotate-45" />
          提问反馈：
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
          disabled={
            !activeTags.length ||
            (activeTags.includes("其他") && !otherFeedback)
          }
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
            !activeTags.length ||
            (activeTags.includes("其他") && !otherFeedback)
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
