import { getLen } from "./strings";


describe("getLen", () => {
  test("returns 0 for an empty string", () => {
    expect(getLen("")).toBe(0);
  });

  test("returns the correct length for an ASCII string", () => {
    expect(getLen("hello")).toBe(5);
  });

  test("counts non-ASCII characters as 2", () => {
    expect(getLen("你好")).toBe(4); // Each Chinese character is counted as 2
  });

  test("handles mixed ASCII and non-ASCII characters", () => {
    expect(getLen("hello你好")).toBe(9); // 5 ASCII + 2*2 non-ASCII
  });

  test("handles special characters correctly", () => {
    expect(getLen("h€llo")).toBe(6); // € is non-ASCII and counted as 2
  });

  test("handles strings with spaces", () => {
    expect(getLen("hello world")).toBe(11); // Spaces are ASCII
    expect(getLen("你好 世界")).toBe(9); // Chinese characters and space
  });

  test("handles null input", () => {
    expect(getLen(null as any)).toBe(0);
  });

  test("handles undefined input", () => {
    expect(getLen(undefined as any)).toBe(0);
  });
});
