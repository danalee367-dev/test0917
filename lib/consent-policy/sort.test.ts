import { describe, expect, test } from "vitest";
import { byName, sortKey } from "./sort";

describe("sortKey", () => {
  test("㈜ 앞머리를 제거해 정렬 기준에서 뺀다", () => {
    expect(sortKey("㈜다날")).toBe("다날");
    expect(sortKey("하이엠솔루텍㈜")).toBe("하이엠솔루텍");
    expect(sortKey("(주)이지코어솔루션즈")).toBe("이지코어솔루션즈");
  });
});

describe("byName", () => {
  test("가나다 순 다음 A-Z 순으로 정렬한다", () => {
    const names = [
      { name: "Google Inc." },
      { name: "㈜다날" },
      { name: "굿스플로" },
      { name: "Amazon Web Services Inc." },
      { name: "베스핀글로벌" },
    ];
    const sorted = names.map((n) => n.name).sort((a, b) => byName({ name: a }, { name: b }));
    expect(sorted).toEqual([
      "굿스플로",
      "㈜다날",
      "베스핀글로벌",
      "Amazon Web Services Inc.",
      "Google Inc.",
    ]);
  });
});
