import { Spin } from "antd";

// TODO: maybe rewrite without antd
const LoadingPage = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
};

export default LoadingPage;
