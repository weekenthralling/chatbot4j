import { createContext, useContext } from "react";
import { notification } from "antd";


const NotificationContext = createContext<ReturnType<typeof notification.useNotification>[0] | null>(null);

export const useGlobalNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useGlobalNotification must be used inside <NotificationProvider>");
    return ctx;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [api, contextHolder] = notification.useNotification();

    return (
        <NotificationContext.Provider value={api}>
            {children}
            {contextHolder}
        </NotificationContext.Provider>
    );
};
