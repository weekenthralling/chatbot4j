
/**
 * Get the length of a string. Non-ASCII characters are counted as 2.
 */
export const getLen = (value: string): number => {
  return value ? value.replace(/[^\x00-\xff]/g, "rr").length : 0;
};

export const ellipsisInMiddle = (text: string, threshold: number): string => {
  if (getLen(text) <= threshold) {
    return text;
  }
  let leftIdx = 0;
  for (let i = 0; i <= threshold / 2 - 2; i += getLen(text.at(leftIdx)!)) {
    leftIdx++;
  }
  let rightIdx = text.length;
  for (let j = 0; j <= threshold / 2 - 2; j += getLen(text.at(rightIdx)!)) {
    rightIdx--;
  }
  return `${text.slice(0, leftIdx)}...${text.slice(rightIdx, text.length)}`;
};
