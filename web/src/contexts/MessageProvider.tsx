import { createContext, useContext } from "react";
import { message } from "antd";


const MessageContext = createContext<ReturnType<typeof message.useMessage>[0] | null>(null);

export const useGlobalMessage = () => {
    const ctx = useContext(MessageContext);
    if (!ctx) throw new Error("useGlobalMessage must be used inside <MessageProvider>");
    return ctx;
};

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <MessageContext.Provider value={messageApi}>
            {children}
            {contextHolder}
        </MessageContext.Provider>
    );
};
