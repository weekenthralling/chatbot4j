import { Modal, Switch, Tooltip } from "antd";
import { Info } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  ragEnabled: boolean;
  onRagToggle: (checked: boolean) => void;
}

const SettingsModal = ({ open, onClose, ragEnabled, onRagToggle }: SettingsModalProps) => {
  return (
    <Modal
      title="设置"
      open={open}
      centered
      onCancel={onClose}
      footer={null}
      width={480}
      className="settings-modal"
    >
      <div className="space-y-6 pt-4">
        {/* RAG Setting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-text-primary">创建增强对话</label>
            <Tooltip
              title='开启"创建增强对话"后，在新创建的对话内上传数据集时，数海闻涛会尝试对数据集的内容进行召回，以提升模型效果。但同时也会大幅增加数据上传的耗时。'
              placement="top"
              classNames={{ root: "max-w-xs" }}
            >
              <Info className="text-text-muted hover:text-text-primary cursor-help" />
            </Tooltip>
          </div>
          <Switch checked={ragEnabled} onChange={onRagToggle} className="flex-shrink-0" />
        </div>

        {/* Placeholder for future settings */}
        <div className="text-sm text-text-muted">更多设置选项即将推出...</div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
