import { describe, expect, test } from "vitest";
import { buildPolicySections } from "./policy-sections";
import type { PolicyDocument } from "./documents";

const basePolicy: PolicyDocument = {
  serviceName: "테스트 서비스",
  effectiveDateLabel: "2026년 10월 1일",
  purposeRows: [],
  lawRows: [],
  thirdPartyRows: [],
  processorRows: [],
  department: "IT팀",
  ownerName: "홍길동",
  ownerPhone: "02-0000-0000",
  ownerEmail: "owner@example.com",
  usesCookies: false,
  usesLocation: false,
  hasChildData: false,
};

describe("buildPolicySections", () => {
  test("조건부 조항이 없으면 12개 조항이고 변경 조항이 마지막이다", () => {
    const sections = buildPolicySections(basePolicy);
    expect(sections).toHaveLength(12);
    expect(sections.at(-1)!.title).toBe("개인정보 처리방침의 변경에 관한 사항");
  });

  test("위치정보·아동 조항이 조건부로 끼어들어도 변경 조항은 항상 마지막이다", () => {
    const sections = buildPolicySections({ ...basePolicy, usesLocation: true, hasChildData: true });
    expect(sections).toHaveLength(14);
    expect(sections.at(-1)!.title).toBe("개인정보 처리방침의 변경에 관한 사항");
    expect(sections.some((s) => s.title === "위치정보의 처리에 관한 사항")).toBe(true);
    expect(sections.some((s) => s.title === "14세 미만 아동의 개인정보 처리에 관한 사항")).toBe(true);
  });

  test("연락처 필드가 비어 있으면 (미입력)으로 채운다", () => {
    const sections = buildPolicySections({ ...basePolicy, department: "", ownerEmail: "" });
    const contactSection = sections.find((s) => s.title === "개인정보 보호책임자 및 열람 청구 접수·처리 부서")!;
    const fields = contactSection.body.find((b) => b.kind === "fields");
    expect(fields).toBeDefined();
    expect((fields as { items: string[] }).items).toContain("개인정보 운영책임자: (미입력)");
    expect((fields as { items: string[] }).items).toContain("이메일 주소: (미입력)");
  });
});
