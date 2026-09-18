import { describe, expect, test } from "vitest";
import { createEmptyPurposeGroup, createInitialServiceInfo } from "./factories";
import { purposeGroupErrors, serviceInfoErrors } from "./validation";

describe("serviceInfoErrors", () => {
  test("빈 서비스 정보는 필수 필드마다 하나씩 에러를 낸다", () => {
    const info = createInitialServiceInfo();
    expect(serviceInfoErrors(info)).toEqual([
      "서비스명을 입력하세요",
      "운영 부서를 입력하세요",
      "담당자 이름을 입력하세요",
      "대표 이메일을 입력하세요",
    ]);
  });

  test("필수 필드를 모두 채우면 에러가 없다", () => {
    const info = {
      ...createInitialServiceInfo(),
      name: "테스트 서비스",
      department: "IT팀",
      ownerName: "홍길동",
      ownerEmail: "owner@example.com",
    };
    expect(serviceInfoErrors(info)).toEqual([]);
  });

  test("공백만 있는 값은 비어 있는 것으로 본다", () => {
    const info = { ...createInitialServiceInfo(), name: "   " };
    expect(serviceInfoErrors(info)).toContain("서비스명을 입력하세요");
  });
});

describe("purposeGroupErrors", () => {
  test("빈 묶음은 목적·항목·보유기간 에러를 모두 낸다", () => {
    const group = createEmptyPurposeGroup();
    expect(purposeGroupErrors(group)).toEqual([
      "처리 목적을 고르거나 직접 입력하세요",
      "수집 항목을 하나 이상 고르세요",
      "보유 및 이용 기간을 입력하세요",
    ]);
  });

  test("주민등록번호를 골랐는데 근거 법령이 비어 있으면 에러가 추가된다", () => {
    const group = {
      ...createEmptyPurposeGroup(),
      customPurpose: "본인 확인",
      isCustomPurpose: true,
      selectedItems: [{ name: "주민등록번호", kind: "rrn" as const }],
      retention: "회원 탈퇴 시까지",
    };
    expect(purposeGroupErrors(group)).toEqual(["주민등록번호 수집의 근거 법령을 입력하세요"]);
  });

  test("근거 법령까지 채우면 에러가 없다", () => {
    const group = {
      ...createEmptyPurposeGroup(),
      customPurpose: "본인 확인",
      isCustomPurpose: true,
      selectedItems: [{ name: "주민등록번호", kind: "rrn" as const }],
      retention: "회원 탈퇴 시까지",
      rrnBasis: "「소득세법」 제145조",
    };
    expect(purposeGroupErrors(group)).toEqual([]);
  });

  test("생체정보를 골랐는데 판별 질문에 답하지 않으면 에러가 추가된다", () => {
    const group = {
      ...createEmptyPurposeGroup(),
      customPurpose: "본인 확인",
      isCustomPurpose: true,
      selectedItems: [{ name: "얼굴 이미지", kind: "biometric" as const }],
      retention: "회원 탈퇴 시까지",
    };
    expect(purposeGroupErrors(group)).toEqual(["생체정보를 특정 개인을 알아보기 위해 처리하는지 답하세요"]);
  });

  test("생년월일을 골랐는데 만 14세 미만 이용 여부에 답하지 않으면 에러가 추가된다", () => {
    const group = {
      ...createEmptyPurposeGroup(),
      customPurpose: "회원 가입",
      isCustomPurpose: true,
      selectedItems: [{ name: "생년월일", kind: "normal" as const }],
      retention: "회원 탈퇴 시까지",
    };
    expect(purposeGroupErrors(group)).toEqual(["만 14세 미만 아동 이용 여부에 답하세요"]);
  });

  test("생체정보·생년월일 질문에 답하면 에러가 없다", () => {
    const group = {
      ...createEmptyPurposeGroup(),
      customPurpose: "본인 확인",
      isCustomPurpose: true,
      selectedItems: [
        { name: "얼굴 이미지", kind: "biometric" as const },
        { name: "생년월일", kind: "normal" as const },
      ],
      retention: "회원 탈퇴 시까지",
      biometricAnswer: "no" as const,
      ageAnswer: "no" as const,
    };
    expect(purposeGroupErrors(group)).toEqual([]);
  });
});
