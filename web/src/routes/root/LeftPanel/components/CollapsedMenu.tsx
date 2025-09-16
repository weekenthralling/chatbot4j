import { Popover } from "antd";
import { History } from "lucide-react";
import { ConversationDTO } from "@/request/types";
import { NavLink, useParams } from "react-router";

interface IProps {
  groupedConversations: Record<string, ConversationDTO[]>;
}
const CollapsedMenu: React.FC<IProps> = ({ groupedConversations }) => {
  const { id: convId } = useParams();
  const conversationCount = Object.values(groupedConversations).flat().length;
  return conversationCount ? (
    <Popover
      placement="right"
      content={
        <div className="max-h-[50vh] overflow-y-auto overflow-x-hidden">
          {Object.keys(groupedConversations).map((key) => (
            <div key={key}>
              <div className="p-2 text-[#909399]">{key}</div>
              {groupedConversations[key].map((item) => (
                <NavLink to={`/chat/${item.id}`}>
                  <div
                    className={`ml-2 w-[240px]! truncate p-2 leading-4 line-clamp-1 h-8 rounded-lg hover:bg-[#EFFAFF] hover:text-[#00A0E9] cursor-pointer text-black ${convId === item.id ? "bg-[#EFFAFF] text-[#00A0E9]" : ""}`}
                  >
                    {item.title}
                  </div>
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      }
    >
      <button
        className={`
          flex items-center justify-center gap-2
          w-full h-10
          mt-4
          bg-transparent
          hover:bg-opacity-80 transition-colors
        `}
      >
        <History className={`w-4 h-4 text-[#606266] hover:text-text-button`} />
      </button>
    </Popover>
  ) : null;
};

export default CollapsedMenu;
