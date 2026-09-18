import { describe, expect, test } from "vitest";
import { createInitialWizardState } from "./factories";
import { wizardReducer } from "./state";
import { buildDocuments } from "./documents";
import { PURPOSES } from "./purposes";
import type { WizardState } from "./types";

function firstGroupId(state: WizardState): string {
  return state.purposeGroups[0]!.id;
}

function withServiceName(state: WizardState, name: string): WizardState {
  return wizardReducer(state, { type: "service-info/update", patch: { name } });
}

describe("buildDocuments", () => {
  test("일반 항목만 고르면 필수 동의서 한 건과 처리방침만 만들어진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    const purpose = PURPOSES.find((p) => p.label === "회원 가입 및 본인 확인")!;
    state = wizardReducer(state, { type: "group/select-purpose", id, purpose });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "이름" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "이메일" });
    state = withServiceName(state, "LG 홈케어 멤버십");

    const docs = buildDocuments(state);

    expect(docs.consents).toHaveLength(1);
    expect(docs.consents[0]).toMatchObject({
      kind: "required",
      rows: [{ purpose: "회원 가입 및 본인 확인", items: ["이름", "이메일"], retention: "회원 탈퇴 시까지" }],
    });
    expect(docs.thirdParty).toBeNull();
    expect(docs.policy.serviceName).toBe("LG 홈케어 멤버십");
    expect(docs.policy.purposeRows).toEqual([
      { tier: "필수", purpose: "회원 가입 및 본인 확인", items: ["이름", "이메일"], retention: "회원 탈퇴 시까지" },
    ]);
  });

  test("민감정보를 고르면 별도 문서가 생기고 일반 동의서에는 남지 않는다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "이름" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "건강 상태 및 병력" });
    state = wizardReducer(state, { type: "group/set-custom-purpose-label", id, label: "건강 상담" });
    state = wizardReducer(state, { type: "group/select-custom-purpose", id });
    state = wizardReducer(state, { type: "group/set-retention", id, value: "상담 종료 시까지" });

    const docs = buildDocuments(state);
    const kinds = docs.consents.map((d) => d.kind);

    expect(kinds).toContain("required");
    expect(kinds).toContain("sensitive");
    const required = docs.consents.find((d) => d.kind === "required")!;
    const sensitive = docs.consents.find((d) => d.kind === "sensitive")!;
    expect(required.rows[0]!.items).toEqual(["이름"]);
    expect(sensitive.rows[0]!.items).toEqual(["건강 상태 및 병력"]);

    // 처리방침에는 나누지 않고 전체 항목이 함께 들어간다
    expect(docs.policy.purposeRows[0]!.items).toEqual(["이름", "건강 상태 및 병력"]);
  });

  test("생체정보는 기술적 처리 답이 '예'일 때만 민감정보 문서에 들어간다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    state = wizardReducer(state, { type: "group/set-custom-purpose-label", id, label: "본인 확인" });
    state = wizardReducer(state, { type: "group/select-custom-purpose", id });
    state = wizardReducer(state, { type: "group/set-retention", id, value: "탈퇴 시까지" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "얼굴 이미지" });

    const withoutAnswer = buildDocuments(state);
    expect(withoutAnswer.consents.some((d) => d.kind === "sensitive")).toBe(false);
    expect(withoutAnswer.consents.find((d) => d.kind === "required")!.rows[0]!.items).toEqual(["얼굴 이미지"]);

    state = wizardReducer(state, { type: "group/set-biometric-answer", id, answer: "yes" });
    const withYes = buildDocuments(state);
    expect(withYes.consents.some((d) => d.kind === "sensitive")).toBe(true);
    expect(withYes.consents.find((d) => d.kind === "required")).toBeUndefined();
  });

  test("만 14세 미만 답을 예로 하면 아동용 동의서가 생긴다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    state = wizardReducer(state, { type: "group/set-custom-purpose-label", id, label: "회원 가입" });
    state = wizardReducer(state, { type: "group/select-custom-purpose", id });
    state = wizardReducer(state, { type: "group/set-retention", id, value: "탈퇴 시까지" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "생년월일" });
    state = wizardReducer(state, { type: "group/set-age-answer", id, answer: "yes" });

    const docs = buildDocuments(state);
    const child = docs.consents.find((d) => d.kind === "child");

    expect(child).toBeDefined();
    expect(child!.rows[0]).toMatchObject({ items: ["생년월일"] });
  });

  test("보유 기간에 법정 근거가 있는 목적을 고르면 처리방침에 근거가 중복 없이 모인다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    const purpose = PURPOSES.find((p) => p.label === "서비스 제공 및 계약 이행")!;
    state = wizardReducer(state, { type: "group/select-purpose", id, purpose });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "이름" });
    state = wizardReducer(state, { type: "group/add" });
    const secondId = state.purposeGroups[1]!.id;
    state = wizardReducer(state, { type: "group/select-purpose", id: secondId, purpose });
    state = wizardReducer(state, { type: "group/toggle-item", id: secondId, name: "주소" });

    const docs = buildDocuments(state);

    expect(docs.policy.lawRows).toHaveLength(1);
    expect(docs.policy.lawRows[0]!.law).toContain("전자상거래");
  });

  test("주민등록번호의 근거 법령이 고유식별정보 문서 행에 들어간다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    state = wizardReducer(state, { type: "group/set-custom-purpose-label", id, label: "제세공과금 신고" });
    state = wizardReducer(state, { type: "group/select-custom-purpose", id });
    state = wizardReducer(state, { type: "group/set-retention", id, value: "신고 완료 시까지" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "주민등록번호" });
    state = wizardReducer(state, {
      type: "group/set-rrn-basis",
      id,
      value: "「소득세법」 제145조에 따른 원천징수영수증 발급",
    });

    const docs = buildDocuments(state);
    const unique = docs.consents.find((d) => d.kind === "unique")!;

    expect(unique.rows[0]!.rrnBasis).toBe("「소득세법」 제145조에 따른 원천징수영수증 발급");
  });

  test("제3자 제공이 없다고 체크하면 문서와 처리방침 모두 비어 있다", () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, {
      type: "sharing/add-third-party",
      thirdParty: { name: "㈜카카오", purpose: "알림", items: "이름", retention: "발송 시까지" },
    });
    state = wizardReducer(state, { type: "sharing/set-no-third-parties", value: true });

    const docs = buildDocuments(state);

    expect(docs.thirdParty).toBeNull();
    expect(docs.policy.thirdPartyRows).toEqual([]);
  });

  test("쿠키를 고르면 처리방침에 쿠키 사용 표시가 켜진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    state = wizardReducer(state, { type: "group/set-custom-purpose-label", id, label: "서비스 이용 분석" });
    state = wizardReducer(state, { type: "group/select-custom-purpose", id });
    state = wizardReducer(state, { type: "group/set-retention", id, value: "1년까지" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "쿠키" });

    const docs = buildDocuments(state);

    expect(docs.policy.usesCookies).toBe(true);
    expect(docs.policy.usesLocation).toBe(false);
  });

  test("위치정보 항목을 고르면 처리방침에 위치정보 사용 표시가 켜진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    state = wizardReducer(state, { type: "group/set-custom-purpose-label", id, label: "배송 위치 확인" });
    state = wizardReducer(state, { type: "group/select-custom-purpose", id });
    state = wizardReducer(state, { type: "group/set-retention", id, value: "배송 완료 시까지" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "GPS 좌표(위도·경도)" });

    const docs = buildDocuments(state);

    expect(docs.policy.usesLocation).toBe(true);
    expect(docs.policy.usesCookies).toBe(false);
  });

  test("만 14세 미만 답을 예로 하면 처리방침에 아동 데이터 처리 표시가 켜진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    state = wizardReducer(state, { type: "group/set-custom-purpose-label", id, label: "회원 가입" });
    state = wizardReducer(state, { type: "group/select-custom-purpose", id });
    state = wizardReducer(state, { type: "group/set-retention", id, value: "탈퇴 시까지" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "생년월일" });

    const withoutAnswer = buildDocuments(state);
    expect(withoutAnswer.policy.hasChildData).toBe(false);

    state = wizardReducer(state, { type: "group/set-age-answer", id, answer: "yes" });
    const withYes = buildDocuments(state);
    expect(withYes.policy.hasChildData).toBe(true);
  });

  test("서비스명을 비우면 문서 전체가 같은 대체 문구를 쓴다", () => {
    const state = createInitialWizardState();
    const docs = buildDocuments(state);

    expect(docs.serviceName).toBe("(서비스명 미입력)");
    expect(docs.policy.serviceName).toBe("(서비스명 미입력)");
  });

  test("담당자 전화번호를 비우면 회사 대표 번호가 들어간다", () => {
    const state = createInitialWizardState();
    const docs = buildDocuments(state);
    expect(docs.policy.ownerPhone).toBe("02-6915-1774");
  });

  test("시행일을 비우면 오늘부터 2주 뒤가 들어간다", () => {
    const state = createInitialWizardState();
    const today = new Date("2026-09-17T00:00:00");
    const docs = buildDocuments(state, today);
    expect(docs.policy.effectiveDateLabel).toBe("2026년 10월 1일");
  });

  test("시행일을 입력하면 그 값이 그대로 들어간다", () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, {
      type: "service-info/update",
      patch: { effectiveDate: "2026-12-01" },
    });
    const docs = buildDocuments(state, new Date("2026-09-17T00:00:00"));
    expect(docs.policy.effectiveDateLabel).toBe("2026년 12월 1일");
  });
});
