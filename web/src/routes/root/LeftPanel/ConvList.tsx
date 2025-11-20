import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Skeleton } from "antd";

import { ConversationDTO } from "@/request/types";
import EmptyChatListIcon from "@/assets/icons/empty_chat_list.svg?react";
import ConvItem from "./ConvItem";

const ConvList = ({
  groupedConversations,
  hasMore,
  onLoadMore,
}: {
  groupedConversations: Record<string, ConversationDTO[]>;
  hasMore: boolean;
  onLoadMore: () => void;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const conversationCount = Object.values(groupedConversations).flat().length;

  if (conversationCount === 0) {
    return (
      <div className="mt-[50%]">
        <EmptyChatListIcon className="w-[125px] h-[112px]" />
        <div className="text-sm text-[#909399] mt-4 text-center">暂无历史对话</div>
      </div>
    );
  }

  return (
    <div id="scrollableDiv" className="h-full overflow-y-auto relative">
      <div className="sticky bg-white text-xs font-semibold pb-3 top-0 left-0 w-full pt-7">
        历史会话
      </div>
      <InfiniteScroll
        dataLength={conversationCount}
        next={onLoadMore}
        hasMore={hasMore}
        loader={<Skeleton paragraph={{ rows: 1 }} active style={{ padding: "10px" }} />}
        endMessage={null}
        scrollableTarget="scrollableDiv"
        scrollThreshold={0.9}
      >
        {Object.keys(groupedConversations).map((key) => (
          <div key={key}>
            <div
              className="
                w-52
                leading-7 text-text-muted
              "
            >
              {key}
            </div>
            {groupedConversations[key].map((item) => (
              <ConvItem
                key={item.id}
                item={item}
                titleEditing={editingId === item.id}
                onStartEdit={() => setEditingId(item.id)}
                onStopEdit={() => setEditingId(null)}
              />
            ))}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ConvList;
