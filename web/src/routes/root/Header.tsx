import { Dropdown } from "antd";
import { ChevronDown } from "lucide-react";

import { setCheckedModel, useModelsStore } from "@/store/modelsStore";

const Header = () => {
  const models = useModelsStore((state) => state.models ?? []);
  const currentModel = useModelsStore((state) => state.checkedModel ?? {});

  return (
    <header
      className="
        flex items-center justify-between
        w-full h-11
      "
    >
      {/* Model Selector */}
      <div className="flex-1 flex justify-center">
        {models.length > 1 && (
          <Dropdown
            overlayClassName=""
            menu={{
              items: models.map((model) => ({
                label: model.name,
                key: model.name,
              })),
              selectedKeys: currentModel.name ? [currentModel.name] : [],
              onClick: ({ key }) =>
                setCheckedModel(models.find((item) => item.name === key)!),
            }}
          >
            <button
              className="
                flex items-center gap-2 px-3 py-2 rounded-lg
                text-text-primary bg-transparent
                hover:bg-bg-highlight transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              <span>{currentModel?.name}</span>
              <ChevronDown className="text-xs" />
            </button>
          </Dropdown>
        )}
      </div>
    </header>
  );
};

export default Header;
