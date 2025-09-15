import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SettingsDTO {
  ragEnabled?: boolean;
}
// 定义 store 的类型
interface SettingState {
  settings: SettingsDTO;
  setSettings: (settings: SettingsDTO) => void;
}

export const useSettingStore = create<SettingState>()(
  devtools(
    persist(
      (set) => ({
        settings: {},
        setSettings: (settings) => set(() => ({ settings })),
      }),
      {
        name: "setting-storage", // localStorage 的 key
      },
    ),
  ),
);

export const { setSettings } = useSettingStore.getState();
