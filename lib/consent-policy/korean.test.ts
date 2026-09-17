import { describe, expect, test } from "vitest";
import { topicParticle } from "./korean";

describe("topicParticle", () => {
  test("받침이 없으면 는", () => {
    expect(topicParticle("건강 상태 및 병력")).toBe("은"); // '력' 받침 있음 -> 은
    expect(topicParticle("진료 및 처방 기록")).toBe("은"); // '록' 받침 있음
    expect(topicParticle("정보")).toBe("는"); // '보' 받침 없음
  });
});
