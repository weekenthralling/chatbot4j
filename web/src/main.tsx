import "./index.css";

import ReactDOM from "react-dom/client";
import { ConfigProvider, App as AntdApp } from "antd";
import zhCN from "antd/locale/zh_CN";

import "@ant-design/v5-patch-for-react-19";

import App from "@/App";
import { MessageProvider } from "@/contexts/MessageProvider";
import { NotificationProvider } from "@/contexts/NotificationProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      components: {
        /*  Modal: {
          colorBgMask: "#000000cc",
          contentBg: "#2e2e2e",
          colorTextHeading: "#ffffff",
          colorIcon: "#ffffff",
          headerBg: "#2e2e2e",
        },*/
      },
    }}
  >
    {/* NOTE: Must specify `text-inherit`, or antd will add a weird `color: rgba(0, 0, 0, 0.88);` */}
    <AntdApp className="h-full">
      <MessageProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </MessageProvider>
    </AntdApp>
  </ConfigProvider>,
);
