import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { omit } from "lodash";
import {
  PanelLeftClose,
  PanelLeftOpen,
  MessageCirclePlus,
  ExternalLink,
  ChevronUp,
  LogOut,
} from "lucide-react";

import { getConvsOnServer } from "@/request/conv";
import { ConversationDTO } from "@/request/types";
import { useConvsStore, setConvs, setPagination } from "@/store/convsStore";
import { getDatePeriod } from "@/utils/datetime";
import Logo from "@/assets/logo.svg?react";
import UserIcon from "@/assets/icons/icon_user.svg?react";

import ConvList from "./ConvList";
import { Avatar, Popover } from "antd";
import { useUserStore } from "@/store/userStore";
import MyShares from "@/components/MyShares";
import CollapsedMenu from "@/routes/root/LeftPanel/components/CollapsedMenu";

const LeftPanel = () => {
  const navigate = useNavigate();
  const userInfo = useUserStore((state) => state.userInfo);
  const { id: convId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [showMyShare, setShowMyShare] = useState(false);

  const convs = useConvsStore((state) => state.convs);
  const pagination = useConvsStore((state) => state.pagination);

  useEffect(() => {
    const loadConvs = async () => {
      try {
        const convs = await getConvsOnServer();
        setConvs(convs.items);
        setPagination({
          ...pagination,
          ...omit(convs, ["items"]),
        });
      } catch {}
    };

    loadConvs();
  }, []);

  const loadMoreData = async () => {
    try {
      const newConvs = await getConvsOnServer({
        cursor: pagination.next_page,
      });
      setConvs([...convs, ...newConvs.items]);
      setPagination({
        ...pagination,
        ...omit(newConvs, ["items"]),
      });
    } catch {}
  };

  // Group conversations by time and pinned status
  const groupedMenuByTimeAndPinned = useMemo(() => {
    const result: Record<string, ConversationDTO[]> = {};
    const now = new Date();

    convs.forEach((conv) => {
      if (conv.pinned) {
        !result["置顶"] ? (result["置顶"] = [conv]) : result["置顶"].push(conv);
      } else {
        const period = getDatePeriod(conv.last_message_at, now);

        if (!period) {
          const fallbackKey = "其他";
          !result[fallbackKey]
            ? (result[fallbackKey] = [conv])
            : result[fallbackKey].push(conv);
          return;
        }

        let key: string;
        switch (period) {
          case "today":
            key = "今天";
            break;
          case "yesterday":
            key = "昨天";
            break;
          case "thisWeek":
            key = "本周";
            break;
          case "thisMonth":
            key = "本月";
            break;
          default:
            if (typeof period === "object") {
              if (period.type === "monthInYear") {
                key = period.monthName || "其他";
              } else if (period.type === "year") {
                key = period.year + "年";
              } else {
                key = "其他";
              }
            } else {
              key = "其他";
            }
        }

        !result[key] ? (result[key] = [conv]) : result[key].push(conv);
      }
    });
    return result;
  }, [convs]);

  const handleLogout = () => {
    // TODO: dex does not have end_session_endpoint now.
    // See <https://github.com/dexidp/dex/issues/1697>
    // Note: If you want to debug this behaviour in your local environment,
    // you need to setup an oauth2-proxy instance
    window.location.href = "/oauth2/sign_out?rd=/";
  };

  const handleShowShare = () => {
    setShowMyShare(true);
  };

  useEffect(() => {
    setCollapsed(false);
  }, [convId]);
  return (
    <>
      <aside
        className={`
        flex flex-col items-center h-full relative z-50
        bg-white
        ${collapsed ? "w-16 min-w-16" : "w-60"} max-w-sm p-4
        rounded-sm
        transition-all duration-300 ease-in-out
      `}
      >
        <header
          className={`flex items-center ${collapsed ? "flex-col" : "flex-row"} gap-4 w-full`}
        >
          <div
            className={`flex-1 flex items-center ${collapsed && "order-2"}`}
          >
            <Logo className="h-8 w-auto" />
            {!collapsed && (
              <span className="font-bold text-lg text-[#00a0e9]">ChatBot4J</span>
            )}
          </div>
          <button
            className={`
          flex items-center justify-center
          bg-transparent
          ${collapsed ? "order-1" : "ml-auto"}
        `}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "展开菜单" : "收起菜单"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#606266] hover:text-text-button" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-[#606266] hover:text-text-button" />
            )}
          </button>
        </header>
        <button
          className={`
          flex items-center justify-center gap-2
          w-full h-10
          mt-4
          ${collapsed ? "bg-transparent" : "bg-[#effaff] border-[1px] border-[#C2ECFF] rounded-md"}
          hover:bg-opacity-80 transition-colors
        `}
          onClick={() => navigate("/")}
        >
          <MessageCirclePlus
            className={`w-4 h-4 hover:text-text-button ${collapsed ? "text-[#606266]" : "text-[#00a0e9]"}`}
          />
          {!collapsed && (
            <span className="text-sm text-[#00a0e9]">新建会话</span>
          )}
        </button>
        {collapsed && (
          <CollapsedMenu groupedConversations={groupedMenuByTimeAndPinned} />
        )}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto">
            <ConvList
              groupedConversations={groupedMenuByTimeAndPinned}
              hasMore={!!pagination.next_page}
              onLoadMore={loadMoreData}
            />
          </div>
        )}
        <div className="mt-auto w-full pt-3">
          <Popover
            placement="bottomRight"
            content={
              <div className="w-[290px] rounded-xl">
                <div className="flex items-center border-b border-solid border-[#5B6B79]/20 py-3 px-2">
                  <Avatar
                    icon={<UserIcon />}
                    className="text-xl cursor-pointer"
                  />
                  <div className="ml-2.5 text-xs">
                    <div className="font-semibold leading-[22px]">
                      {userInfo?.username}
                    </div>
                    <div className="leading-5 text-gray-500">
                      {userInfo?.email}
                    </div>
                  </div>
                </div>
                <div className="pt-3 flex flex-col gap-2">
                  <div
                    onClick={handleLogout}
                    className="flex h-[46px] cursor-pointer items-center rounded-lg bg-black/4 pb-[8px] pl-4 pr-4 pt-2 text-[#5B6B79] hover:bg-[#4680FF]/8 hover:text-[#4680FF]"
                  >
                    <LogOut className="pr-3.5 w-8 size-8" />
                    退出登录
                  </div>
                  <div
                    onClick={handleShowShare}
                    className="flex h-[46px] cursor-pointer items-center rounded-lg bg-black/4 pb-[8px] pl-4 pr-4 pt-2 text-[#5B6B79] hover:bg-[#4680FF]/8 hover:text-[#4680FF]"
                  >
                    <ExternalLink className="pr-3.5 w-8" />
                    我的分享
                  </div>
                </div>
              </div>
            }
            arrow={false}
            trigger="click"
          >
            <div className="flex items-center cursor-pointer">
              <Avatar icon={<UserIcon />} className="h-6 w-6 cursor-pointer" />
              {!collapsed ? (
                <>
                  <div className="ml-3 w-[70%] truncate">
                    {userInfo?.username}
                  </div>
                  <ChevronUp className="ml-auto text-[#303133] size-4 rotate-180" />
                </>
              ) : null}
            </div>
          </Popover>
        </div>
        <MyShares open={showMyShare} onCLose={() => setShowMyShare(false)} />
      </aside>
    </>
  );
};

export default LeftPanel;
