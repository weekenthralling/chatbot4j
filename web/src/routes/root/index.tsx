import { useState, useEffect, useMemo } from "react";
import { Outlet, useLoaderData, useParams } from "react-router";
import { App } from "antd";
import BgImage from "@/assets/icons/bg.png?url";

import { setCheckedModel, setModels, useModelsStore } from "@/store/modelsStore";
import { setUserInfo } from "@/store/userStore";
import { setSettings, useSettingStore } from "@/store/settingStore";
import MyShares from "@/components/MyShares";
import { ModelDTO, UserInfo } from "@/request/types";

import Header from "./Header";
import LeftPanel from "./LeftPanel";
import SettingsModal from "./SettingsModal";

interface LoaderData {
  user: UserInfo;
  models: ModelDTO[];
}

export async function loader(): Promise<LoaderData> {
  const user_resp = await fetch("/api/users/current");
  if (!user_resp.ok) {
    throw new Error(`Failed to fetch current user: ${user_resp.statusText}`);
  }
  const user = await user_resp.json();
  // const model_resp = await fetch("/api/models");
  // if (!model_resp.ok) {
  //   throw new Error(`Failed to fetch models: ${model_resp.statusText}`);
  // }
  // const models = await model_resp.json();
  return { user, models: [] };
}

function Root() {
  const { user, models } = useLoaderData() as LoaderData;

  const { modal } = App.useApp();
  const currentModel = useModelsStore((state) => state.checkedModel ?? {});

  // Modal states
  const [showMyShare, setShowMyShare] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const settings = useSettingStore((state) => state.settings);
  const { id: convId } = useParams();
  // Initialize user and models data from loader
  useEffect(() => {
    setUserInfo(user);
    setModels(models);

    // Set default model if none selected or current model not in list
    if (!currentModel?.name || !models.find((item: ModelDTO) => item.name === currentModel.name)) {
      if (models.length > 0) {
        setCheckedModel(models[0]);
      }
    }
  }, [user, models, currentModel]);

  const onRagToggle = (checked: boolean) => {
    if (checked) {
      modal.confirm({
        title: '开启"创建增强对话"会显著增加数据上传的时间，确认开启？',
        okText: "确认",
        cancelText: "取消",
        centered: true,
        onOk: () => setSettings({ ragEnabled: true }),
      });
      return;
    }
    setSettings({ ragEnabled: checked });
  };

  const handleLogout = () => {
    // TODO: dex does not have end_session_endpoint now.
    // See <https://github.com/dexidp/dex/issues/1697>
    // Note: If you want to debug this behaviour in your local environment,
    // you need to setup an oauth2-proxy instance
    window.location.href = "/oauth2/sign_out?rd=/";
  };

  return (
    <div
      className="flex w-screen h-screen flex-col p-2"
      style={{
        background: !convId ? `url("${BgImage}") center/cover no-repeat` : "#F6F6F6",
      }}
    >
      <div className="flex-1 flex relative overflow-hidden">
        <LeftPanel />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 relative overflow-hidden pb-10">
            <Outlet />
          </main>
        </div>
      </div>
      {/* Modals */}
      <SettingsModal
        open={settingsDialogOpen}
        onClose={() => setSettingsDialogOpen(false)}
        ragEnabled={settings?.ragEnabled || false}
        onRagToggle={onRagToggle}
      />
      <MyShares open={showMyShare} onCLose={() => setShowMyShare(false)} />
    </div>
  );
}

export default Root;
