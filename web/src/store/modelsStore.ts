import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ModelDTO } from "@/request/types";

// 定义 store 的类型
interface ModelsState {
  models: ModelDTO[];
  checkedModel: Partial<ModelDTO>;
  setModels: (models: ModelDTO[]) => void;
  setCheckedModel: (models: ModelDTO) => void;
}

export const useModelsStore = create<ModelsState>()(
  devtools(
    persist(
      (set) => ({
        models: [],
        checkedModel: {},
        setModels: (models) => {
          set(() => ({ models }));
          const checkedModel = useModelsStore.getState().checkedModel;
          // set default checkedModel
          if (!checkedModel?.name && models.length > 0) {
            set(() => ({ checkedModel: models[0] }));
          }
        },
        setCheckedModel: (model) => set(() => ({ checkedModel: model })),
      }),
      {
        name: "models-storage", // localStorage 的 key
      },
    ),
  ),
);

export const { setModels, setCheckedModel } = useModelsStore.getState();
