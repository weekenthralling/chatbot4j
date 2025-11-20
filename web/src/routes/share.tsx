import { useEffect, useMemo, useRef } from "react";
import { useLoaderData } from "react-router";
import { Info } from "lucide-react";

import { getShareOnServer } from "@/request/share";
import { ShareDTO } from "@/request/types";
import { useChatLayout } from "@/hooks/useChatLayout";
import GroupedMessage from "@/components/message/GroupedMessage";
import { groupMessages } from "@/utils/messages";

import LogoIcon from "@/assets/logo.svg?react";

export async function loader({ params }: any): Promise<ShareDTO> {
  return await getShareOnServer(params.id);
}

const Share = () => {
  const share = useLoaderData();
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const { contentContainerClasses } = useChatLayout();

  const sharedMessages = useMemo(() => {
    return groupMessages(share?.messages ?? []);
  }, [share]);

  useEffect(() => {
    if (sharedMessages.length && shareContainerRef.current) {
      shareContainerRef.current.scrollTo({ top: 0 });
    }
  }, [sharedMessages, shareContainerRef.current]);

  return (
    <div id="share-container" ref={shareContainerRef} className="flex flex-col h-screen">
      <header className="flex h-[92px] p-5">
        <LogoIcon className="h-12 w-auto" />
        <div className="ml-68">
          <h1 className="min-h-7 text-xl leading-[30px] font-semibold text-[#303133]">
            {share.title}
          </h1>
          <div className="text-sm leading-[22px] text-[#909399]">
            {new Date(share.created_at).toLocaleString()}
          </div>
        </div>
      </header>
      <main id="chat-log" className="flex-1 overflow-auto">
        <div className={`${contentContainerClasses}`}>
          {sharedMessages.map((group: any, index: number) => {
            return <GroupedMessage key={index} children={group.messages} frozen={true} />;
          })}
        </div>
      </main>
      <button
        className="
          fixed left-1/2 bottom-8 -translate-x-1/2
          h-9 px-4
          text-[13px] font-semibold
          bg-bg-button text-text-button
          rounded-full
          hover:opacity-80 transition-opacity
        "
        onClick={() => {
          // We need to refresh the page to trigger login for anonymous users.
          // So we use window.location.assign instead of navigate.
          window.location.assign("/");
        }}
      >
        与ChatBot开始聊天
      </button>
    </div>
  );
};

export default Share;
