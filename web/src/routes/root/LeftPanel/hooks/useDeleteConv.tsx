import { useCallback, useMemo } from "react";
import { App } from "antd";
import RemoveDialogIcon from "@/assets/icons/remove_dialog_icon.svg?react";

import { deleteConvOnServer } from "@/request/conv";
import { ConversationDTO } from "@/request/types";
import { isMobile } from "@/utils/utils";

export const useDeleteConv = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (item: ConversationDTO) => void;
  onError?: (error: unknown, item: ConversationDTO) => void;
} = {}): {
  deleteConv: (item: ConversationDTO) => void;
} => {
  const { modal } = App.useApp();
  const isMobileEnv = useMemo(() => {
    return isMobile();
  }, []);

  const onSubmit = async (conv: ConversationDTO) => {
    try {
      await deleteConvOnServer(conv.id);
      onSuccess?.(conv);
    } catch (err) {
      onError?.(err, conv);
    }
  };

  const deleteConv = useCallback(
    (item: ConversationDTO) => {
      if (isMobileEnv) {
        modal.confirm({
          width: 328,
          title: <div className="mt-3 text-center">温馨提示</div>,
          wrapClassName: "mobile-dialog",
          content: (
            <div className="mb-2 text-[#606266] text-center">{`是否确认删除对话"${item.title}"?`}</div>
          ),
          icon: null,
          okText: "确定",
          cancelText: "取消",
          centered: true,
          okButtonProps: {
            style: {
              background: "linear-gradient( 136deg, #D8FF7D 0%, #7DD6FF 100%)",
              border: "none",
              width: "136px",
            },
            className: "h-10 bg-[var(--color-accent-delete)]! text-[#606266]",
          },
          cancelButtonProps: {
            className: "h-10",
            style: {
              width: "136px",
            },
          },
          onOk: () => onSubmit(item),
        });
      } else {
        modal.confirm({
          title: <div className="mt-3">删除对话</div>,
          content: (
            <div className="mb-2 text-white">{`是否确认删除对话"${item.title}"?`}</div>
          ),
          icon: <RemoveDialogIcon className="mr-4" />,
          okText: "确定",
          cancelText: "取消",
          centered: true,
          okButtonProps: {
            style: {
              background: "linear-gradient( 136deg, #D8FF7D 0%, #7DD6FF 100%)",
              border: "none",
            },
            className: "h-10 bg-[var(--color-accent-delete)]! text-[#606266]",
          },
          cancelButtonProps: {
            className: "h-10",
          },
          onOk: () => onSubmit(item),
        });
      }
    },
    [modal, onSuccess, onError],
  );

  return { deleteConv };
};
