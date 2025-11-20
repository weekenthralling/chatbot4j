/**
 * Get ISO 8601 string of the input date in local timezone.
 */
export const toLocalISOString = (date: Date) => {
  const offset = -date.getTimezoneOffset(); // offset in minutes
  if (offset === 0) {
    return date.toISOString();
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  // Calculate the timezone offset in hours and minutes
  const offsetSign = offset >= 0 ? "+" : "-";
  const offsetHours = Math.abs(Math.floor(offset / 60))
    .toString()
    .padStart(2, "0");
  const offsetMinutes = Math.abs(offset % 60)
    .toString()
    .padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
};

/**
 * Date period types for conversation grouping
 */
export type DatePeriod =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "thisMonth"
  | { type: "monthInYear"; monthName: string }
  | { type: "year"; year: number };

/**
 * Optimized date utility function that calculates all time periods at once
 * Converts UTC dates to user's local timezone and groups them appropriately
 *
 * @param date - The date to categorize (UTC string or Date object)
 * @param now - Current date in user's local timezone
 * @returns The period category for grouping conversations
 */
export const getDatePeriod = (date: string | Date | undefined, now: Date): DatePeriod | null => {
  if (!date) return null;

  const targetDate = new Date(date);

  // Calculate all needed values once
  const targetDay = targetDate.getDate();
  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  const nowDay = now.getDate();
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();

  // Check if it's today
  if (targetDay === nowDay && targetMonth === nowMonth && targetYear === nowYear) {
    return "today";
  }

  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    targetDay === yesterday.getDate() &&
    targetMonth === yesterday.getMonth() &&
    targetYear === yesterday.getFullYear()
  ) {
    return "yesterday";
  }

  // Check if it's same year
  if (targetYear === nowYear) {
    // Check if it's same month
    if (targetMonth === nowMonth) {
      return "thisMonth";
    }

    // Check if it's same week
    const getWeekStart = (d: Date, weekStartDay: number = 1) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day < weekStartDay ? -7 : 0) + weekStartDay;
      date.setDate(diff);
      return date;
    };

    const targetWeekStart = getWeekStart(new Date(targetDate), 1); // Default to Monday
    const nowWeekStart = getWeekStart(new Date(now), 1); // Default to Monday

    if (targetWeekStart.getTime() === nowWeekStart.getTime()) {
      return "thisWeek";
    }

    // Same year, different month - return month name
    return {
      type: "monthInYear",
      monthName: new Intl.DateTimeFormat(navigator.language || "en-US", { month: "long" }).format(
        targetDate,
      ),
    };
  }

  // Different year
  return {
    type: "year",
    year: targetYear,
  };
};

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
