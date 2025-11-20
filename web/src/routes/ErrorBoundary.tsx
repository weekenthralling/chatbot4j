import { useEffect } from "react";
import { useRouteError, useNavigate, useLocation, isRouteErrorResponse } from "react-router";
import { Result } from "antd";
import { CircleAlert, History, House, RotateCw } from "lucide-react";

interface ErrorInfo {
  status?: number;
  statusText?: string;
  message?: string;
  stack?: string;
}

// Error messages - ready for i18n extraction
const ERROR_MESSAGES = {
  titles: {
    404: "页面未找到",
    403: "访问被拒绝",
    500: "服务器错误",
    default: "发生错误",
  },
  subtitles: {
    404: "抱歉，您访问的页面不存在或已被移除。",
    403: "您没有权限访问此页面。",
    500: "服务器遇到错误，请稍后重试。",
    default: "页面加载时发生了意外错误。",
  },
  buttons: {
    home: "返回首页",
    back: "返回上页",
    refresh: "刷新页面",
  },
  labels: {
    statusCode: "状态码",
    requestPath: "请求路径",
    errorInfo: "错误信息",
    devInfo: "开发者信息 (点击展开)",
    disclaimer:
      "此对话可能会反应链接创建者的个性化数据，这些数据并未共享，并且可能会显著改变模型的回复方式。",
    copyright: "Copyright © 浙江大学计算机创新技术研究院 浙ICP备2021008517号",
  },
} as const;

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();

  // Log error for debugging
  useEffect(() => {
    console.error("Route Error:", error);
  }, [error]);

  const getErrorInfo = (): ErrorInfo => {
    if (isRouteErrorResponse(error)) {
      return {
        status: error.status,
        statusText: error.statusText,
        message: error.data?.message || error.statusText,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
      };
    }

    return {
      message: String(error) || "发生未知错误",
    };
  };

  const errorInfo = getErrorInfo();

  const goHome = () => {
    navigate("/", { replace: true });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      goHome();
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const getResultStatus = () => {
    if (errorInfo.status === 404) return "404";
    if (errorInfo.status && errorInfo.status >= 500) return "500";
    if (errorInfo.status && errorInfo.status >= 400) return "403";
    return "error";
  };

  const getTitle = () => {
    switch (errorInfo.status) {
      case 404:
        return ERROR_MESSAGES.titles[404];
      case 403:
        return ERROR_MESSAGES.titles[403];
      case 500:
        return ERROR_MESSAGES.titles[500];
      default:
        return ERROR_MESSAGES.titles.default;
    }
  };

  const getSubTitle = () => {
    if (errorInfo.status === 404) {
      return ERROR_MESSAGES.subtitles[404];
    }
    if (errorInfo.status && errorInfo.status >= 500) {
      return ERROR_MESSAGES.subtitles[500];
    }
    if (errorInfo.status && errorInfo.status >= 400) {
      return ERROR_MESSAGES.subtitles[403];
    }
    if (errorInfo.message) {
      return errorInfo.message;
    }
    return ERROR_MESSAGES.subtitles.default;
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      {/* Main content container */}
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <Result
            status={getResultStatus()}
            title={getTitle()}
            subTitle={getSubTitle()}
            extra={
              <div className="space-y-6">
                {/* Error details for debugging */}
                {(errorInfo.status || location.pathname !== "/") && (
                  <div className="rounded-lg border border-border-secondary p-4 text-sm">
                    {errorInfo.status && (
                      <div className="mb-2">
                        <span className="text-text-secondary">
                          {ERROR_MESSAGES.labels.statusCode}:
                        </span>{" "}
                        <code className="rounded bg-bg-tertiary px-2 py-1 text-text-primary">
                          {errorInfo.status}
                        </code>
                      </div>
                    )}
                    {location.pathname !== "/" && (
                      <div className="mb-2">
                        <span className="text-text-secondary">
                          {ERROR_MESSAGES.labels.requestPath}:
                        </span>{" "}
                        <code className="rounded bg-bg-tertiary px-2 py-1 text-text-primary">
                          {location.pathname}
                        </code>
                      </div>
                    )}
                    {errorInfo.statusText && (
                      <div>
                        <span className="text-text-secondary">
                          {ERROR_MESSAGES.labels.errorInfo}:
                        </span>{" "}
                        <code className="rounded bg-bg-tertiary px-2 py-1 text-text-primary">
                          {errorInfo.statusText}
                        </code>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={goHome}
                    className="
                      inline-flex items-center justify-center gap-2 min-w-[120px]
                      px-6 py-3 text-sm font-medium text-white
                      bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                      rounded-lg border border-transparent
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <House className="text-base" />
                    {ERROR_MESSAGES.buttons.home}
                  </button>
                  <button
                    onClick={goBack}
                    className="
                      inline-flex items-center justify-center gap-2 min-w-[120px]
                      px-6 py-3 text-sm font-medium text-text-primary
                      hover:bg-bg-highlight active:bg-bg-tertiary
                      rounded-lg border border-border-secondary
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <History className="text-base" />
                    {ERROR_MESSAGES.buttons.back}
                  </button>
                  <button
                    onClick={refreshPage}
                    className="
                      inline-flex items-center justify-center gap-2 min-w-[120px]
                      px-6 py-3 text-sm font-medium text-text-primary
                      hover:bg-bg-highlight active:bg-bg-tertiary
                      rounded-lg border border-border-secondary
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <RotateCw className="text-base" />
                    {ERROR_MESSAGES.buttons.refresh}
                  </button>
                </div>

                {/* Development error details */}
                {process.env.NODE_ENV === "development" && errorInfo.stack && (
                  <details className="rounded-lg border border-border-secondary p-4 text-sm">
                    <summary className="mb-3 cursor-pointer font-medium text-text-primary hover:text-text-highlight">
                      <CircleAlert className="mr-2" />
                      {ERROR_MESSAGES.labels.devInfo}
                    </summary>
                    <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-bg-tertiary p-3 text-xs text-text-muted">
                      {errorInfo.stack}
                    </pre>
                  </details>
                )}
              </div>
            }
          />
        </div>
      </div>

      {/* Footer - now responsive and not fixed */}
      <footer className="border-t border-border-secondary py-4">
        <div className="px-4 text-center">
          <p className="text-xs text-text-muted">{ERROR_MESSAGES.labels.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default ErrorBoundary;
