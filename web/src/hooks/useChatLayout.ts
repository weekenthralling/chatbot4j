/**
 * Unified chat layout styles Hook
 * Ensures ChatLog and ChatInput use the same width control
 */
export const useChatLayout = () => {
  // Unified width control styles
  const widthClasses =
    "w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[70%] 2xl:w-[60%] max-w-[760px] min-w-[320px] mx-auto";

  // Unified padding styles
  const paddingClasses = "";
  // "px-2 sm:px-4 md:px-6 lg:px-8";

  // Combined content container styles
  const contentContainerClasses = `${widthClasses} ${paddingClasses}`;

  return {
    widthClasses,
    paddingClasses,
    contentContainerClasses,
  };
};
