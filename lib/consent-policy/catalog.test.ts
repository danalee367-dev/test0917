import { describe, expect, test } from "vitest";
import { kindOf } from "./catalog";

describe("kindOf", () => {
  test("주민등록번호는 고유식별정보 카테고리에 있지만 별도 kind를 받는다", () => {
    expect(kindOf("주민등록번호")).toBe("rrn");
  });

  test("생체정보 카테고리 항목은 biometric이다", () => {
    expect(kindOf("얼굴 이미지")).toBe("biometric");
  });

  test("민감정보 카테고리 항목은 sensitive다", () => {
    expect(kindOf("건강 상태 및 병력")).toBe("sensitive");
  });

  test("일반 항목은 normal이다", () => {
    expect(kindOf("이름")).toBe("normal");
  });

  test("목록에 없는 이름도 normal로 처리한다(직접 입력)", () => {
    expect(kindOf("사내 임시 코드")).toBe("normal");
  });
});
