import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { UserInfo } from "@/request/types";

// 定义 store 的类型
interface UserState {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        userInfo: null,
        setUserInfo: (userInfo) => set(() => ({ userInfo })),
      }),
      {
        name: "user-storage", // localStorage 的 key
      },
    ),
  ),
);

export const { setUserInfo } = useUserStore.getState();
