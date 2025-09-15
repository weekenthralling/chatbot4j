export function isMobile() {
  const userAgent = navigator.userAgent;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );
  const isTablet = /(iPad|Tablet|PlayBook|Xoom|Tab)/i.test(userAgent);

  // 检测设备是否支持触摸
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // 检测设备是否支持鼠标（不支持鼠标更可能是移动设备）
  const hasMouse = matchMedia("(pointer:fine)").matches;

  return (isMobile || isTablet || hasTouch) && !hasMouse;
}

export function getTimePeriod() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) {
    return "早上";
  } else if (hour >= 9 && hour < 12) {
    return "上午";
  } else if (hour >= 12 && hour < 14) {
    return "中午";
  } else if (hour >= 14 && hour < 18) {
    return "下午";
  } else if (hour >= 18 && hour < 24) {
    return "晚上";
  } else {
    return "凌晨";
  }
}
