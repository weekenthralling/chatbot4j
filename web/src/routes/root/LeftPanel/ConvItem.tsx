import { useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router";
import { Popover } from "antd";
import {
  ArrowUpToLine,
  Check,
  EllipsisVertical,
  ExternalLink,
  LoaderCircle,
  MessageSquareMore,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { updateConvOnServer } from "@/request/conv";
import { ConversationDTO } from "@/request/types";
import { updateConv, removeConv } from "@/store/convsStore";
import { useGlobalMessage } from "@/contexts/MessageProvider";

import { useDeleteConv } from "./hooks/useDeleteConv";
import { useShareConv } from "./hooks/useShareConv";

const ConvItem = ({
  item,
  titleEditing,
  onStartEdit,
  onStopEdit,
}: {
  item: ConversationDTO;
  titleEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
}) => {
  const { id: convId } = useParams();
  const active = convId === item.id;
  const navigate = useNavigate();
  const messageApi = useGlobalMessage();

  const [titleText, setTitleText] = useState(item.title);

  const [titleUpdating, setTitleUpdating] = useState(false);

  const { shareConv } = useShareConv({
    onError: (err, source) => {
      console.error(`Error sharing conv ${source}`, err);
      messageApi.error("分享创建失败");
    },
  });
  const { deleteConv } = useDeleteConv({
    onSuccess: (item) => {
      messageApi.success("删除成功");
      removeConv(item.id);
      // TODO: why we need to fetch next page?
      // if (pagination.next_page) {
      //   runFetchConvsData({
      //     size: 1,
      //     cursor: pagination.next_page,
      //   });
      // }
      if (convId === item.id) {
        navigate("/");
      }
    },
    onError: (err, item) => {
      console.error(`Error deleting conv ${item.id}`, err);
      messageApi.error("删除失败");
    },
  });

  const handleUpdateClick = () => {
    onStartEdit();
  };

  const handleRename = async (e: React.FormEvent) => {
    // IMPORTANT: form defaults to refresh the page. We need to prevent that.
    e.preventDefault();

    if (!titleText.trim()) {
      messageApi.warning("名称不能为空");
      return;
    }

    setTitleUpdating(true);
    try {
      const updating = { ...item, title: titleText };
      await updateConvOnServer(updating);
      updateConv(updating);
    } catch {
      messageApi.error("更新失败");
    } finally {
      setTitleUpdating(false);
    }
    messageApi.success("更新成功");
    onStopEdit();
  };

  const handlePin = async () => {
    const newItem = { ...item, pinned: true };
    try {
      await updateConvOnServer(newItem);
      updateConv(newItem);
    } catch {
      messageApi.error("更新失败");
    }
  };

  const handleUnpin = async () => {
    const newItem = { ...item, pinned: false };
    try {
      await updateConvOnServer(newItem);
      updateConv(newItem);
    } catch {
      messageApi.error("更新失败");
    }
  };

  // Action menu items
  const actions = useMemo(
    () => [
      item.pinned
        ? {
            name: "取消置顶",
            icon: <X className="size-4" />,
            onClick: handleUnpin,
          }
        : {
            name: "置顶",
            icon: <ArrowUpToLine className="size-4" />,
            onClick: handlePin,
          },
      {
        name: "重命名",
        icon: <Pencil className="size-4" />,
        onClick: handleUpdateClick,
      },
      {
        name: "分享",
        icon: <ExternalLink className="size-4" />,
        onClick: shareConv,
      },
      {
        name: "删除",
        icon: <Trash2 className="size-4" />,
        onClick: deleteConv,
      },
    ],
    [
      item.pinned,
      handlePin,
      handleUnpin,
      handleUpdateClick,
      shareConv,
      deleteConv,
    ],
  );

  return (
    <div
      className={`
        flex items-center
        w-52 h-10
        decoration-0
        rounded-lg
        cursor-pointer transition-all duration-200
        ${!titleEditing && "hover:font-medium hover:bg-bg-highlight"}
        ${active && "font-medium bg-bg-highlight"}
      `}
    >
      {titleEditing ? (
        <form
          className="flex items-center w-full h-full"
          onSubmit={handleRename}
        >
          <input
            id="title-input"
            // IMPORTANT: need to set `min-w-0` or it will squash the space for buttons on the right.
            className="flex-1 min-w-0 h-10 px-2 text-[#303133] border border-[#E4E7ED] rounded-md outline-none focus:border-[#25b1ed]"
            autoFocus
            value={titleText}
            maxLength={40}
            onChange={(e) => setTitleText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setTitleText(item.title);
                onStopEdit();
              }
            }}
          />
          <div className="flex flex-nowrap gap-2 ml-2">
            {titleUpdating ? (
              <LoaderCircle className="ml-4 text-[16px] animate-spin" />
            ) : (
              <button
                className="
                  text-[#787a7d] bg-transparent hover:text-[#00A0E9]
                "
                type="submit"
                tabIndex={0}
                aria-label="确认修改对话标题"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              className="
                text-[#787a7d] bg-transparent hover:text-[#00A0E9]
              "
              type="button"
              onClick={() => {
                setTitleText(item.title);
                onStopEdit();
              }}
              tabIndex={0}
              aria-label="取消修改对话标题"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <NavLink
          to={`/chat/${item.id}`}
          className={`
            flex items-center justify-between
            w-full h-full
            ${active ? "text-text-button" : "text-text-primary"}
            hover:text-text-button
            group/item
          `}
        >
          <MessageSquareMore
            // Note the colors!
            className={`
            w-5 h-5
            ml-3
            ${active ? "fill-text-button text-bg-highlight" : "fill-text-muted text-bg-secondary"}
            group-hover/item:fill-text-button group-hover/item:text-bg-highlight
            transition-colors
          `}
          />
          <span className="flex-1 ml-2 text-sm truncate">{item.title}</span>
          <Popover
            placement="rightTop"
            content={
              <div role="menu">
                {actions.map((action) => (
                  <button
                    key={action.name}
                    className="
                      flex items-center
                      h-8
                      min-w-30
                      px-1 py-1
                      text-text-primary hover:text-text-highlight
                      hover:bg-bg-highlight
                      rounded-md
                      transition-colors
                      focus:outline-none focus:bg-bg-highlight
                    "
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick?.(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        action.onClick?.(item);
                      }
                    }}
                    role="menuitem"
                    tabIndex={0}
                    aria-label={action.name}
                  >
                    {action.icon}
                    <span className="ml-3">{action.name}</span>
                  </button>
                ))}
              </div>
            }
            arrow={false}
            classNames={{
              body: "rounded-md",
            }}
          >
            <button
              className="
                flex items-center justify-center
                w-4 h-4
                ml-auto mr-2
                text-[16px] text-[var(--color-text-muted)] hover:text-text-button
                bg-transparent
                rounded-md
                group-hover/item:opacity-100
              "
              onClick={(e) => e.preventDefault()}
            >
              <EllipsisVertical />
            </button>
          </Popover>
        </NavLink>
      )}
    </div>
  );
};

export default ConvItem;
