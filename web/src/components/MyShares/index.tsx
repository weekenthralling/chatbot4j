import { useEffect, useState } from "react";
import { Modal, Table, Popconfirm } from "antd";
import { Link, Trash2, X } from "lucide-react";

import { getSharesOnServer, deleteShareOnServer } from "@/request/share";
import { Page, ShareDTO } from "@/request/types";
import { useGlobalMessage } from "@/contexts/MessageProvider";

// TODO: I want to totally rewrite this component, do not use table, and use infinite scroll instead
const MyShares = ({
  open,
  onCLose,
}: {
  open: boolean;
  onCLose: () => void;
}) => {
  const messageApi = useGlobalMessage();
  const [sharePage, setSharePage] = useState<Page<ShareDTO>>({
    items: [],
    total: 0,
    page: 0,
    size: 0,
    pages: 0,
  });

  useEffect(() => {
    if (open) {
      getSharesOnServer({ page: 0, size: 100 }).then((shares) => {
        setSharePage(shares);
      });
    }
  }, [open]);

  const handleDelete = async (id: string) => {
    try {
      await deleteShareOnServer(id);
      messageApi.success("删除成功");
    } catch {
      messageApi.error("删除失败");
    }
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "title",
      className: `
        px-3 py-2
        border-b-[0.5px] border-b-[#565656]
        before:content-[unset]
      `,
      render: (text: string, record: ShareDTO) => (
        <div
          className="flex items-center text-[#00A0E9] cursor-pointer"
          onClick={() => window.open(record.url, "__blank")}
        >
          <Link className="mr-1.5 size-5" />
          <div className="flex-1">{text}</div>
        </div>
      ),
    },
    {
      title: "共享日期",
      dataIndex: "created_at",
      className: `
        px-3 py-2
        text-[#303133]
        border-b-[0.5px] border-b-[#565656]
        before:content-[unset]
      `,
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: "操作",
      className: `
        px-3 py-2
        border-b-[0.5px] border-b-[#565656]
        before:content-[unset]
      `,
      width: 100,
      render: (_: string, record: ShareDTO) => (
        <Popconfirm
          title="删除分享"
          description="确定要删除这条分享链接吗?"
          onConfirm={() => handleDelete(record.id!)}
          okText="是"
          cancelText="否"
        >
          <Trash2 className="text-red-600 size-5 cursor-pointer" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCLose}
      width={840}
      closeIcon={<X />}
      closable={true}
      footer={null}
      centered
      title="共享链接"
    >
      <Table
        className="w-full virtual-table"
        columns={columns}
        dataSource={sharePage.items}
        pagination={false}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};

export default MyShares;
