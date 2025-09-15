import { App } from "antd";
import { Copy } from "lucide-react";

import { createShareOnServer } from "@/request/share";
import { ConversationDTO, ShareDTO } from "@/request/types";
import { useGlobalMessage } from "@/contexts/MessageProvider";

// TODO: This hook now creates share before confirm
export const useShareConv = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (shareData: ShareDTO) => void;
  onError?: (error: unknown, source: string) => void;
} = {}): {
  shareConv: (source: ConversationDTO) => void;
} => {
  const { modal } = App.useApp();
  const messageApi = useGlobalMessage();

  const onCopyClick = (content: string) => {
    navigator.clipboard.writeText(content);
    messageApi.success("复制成功");
  };

  const showShareModal = (shareData: ShareDTO) => {
    modal.confirm({
      title: <div className="h-12 py-2 text-lg">分享</div>,
      icon: null,
      content: (
        <div className="text-[var(--color-text-muted)]">
          <div>
            <div className="flex items-center justify-between h-10 rounded border border-[#DCDFE6] pl-4 overflow-hidden">
              <input
                type="text"
                readOnly
                className="w-full text-sm bg-[unset] rounded border-0"
                value={shareData.url}
              />
              <button
                style={{
                  background:
                    "linear-gradient( 136deg, #D8FF7D 0%, #7DD6FF 100%)",
                }}
                className="flex relative items-center gap-2 px-4 py-3 ml-4
                           text-sm font-bold text-[#606266] bg-white rounded
                           hover:bg-gray-100 transition-colors
                           min-w-fit"
                onClick={() => onCopyClick(shareData.url || "")}
              >
                <Copy className="size-4" />
                <span>复制链接</span>
              </button>
            </div>
            <div className="mb-8 text-[14px] mt-4">
              您的姓名、自定义指令以及您在共享后添加的任何消息都将予以保密处理。
            </div>
          </div>
        </div>
      ),
      width: 550,
      centered: true,
      open: true,
      footer: null,
      closable: true,
      type: "success",
    });
  };

  const shareConv = async (source: ConversationDTO) => {
    try {
      const shareData = await createShareOnServer(source.id, source.title);
      showShareModal(shareData);
      onSuccess?.(shareData);
    } catch (error) {
      onError?.(error, source.id);
    }
  };

  return { shareConv } as const;
};
