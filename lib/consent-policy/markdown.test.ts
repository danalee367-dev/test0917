import { describe, expect, test } from "vitest";
import {
  consentDocumentToMarkdown,
  consentFileName,
  policyDocumentToMarkdown,
  policyFileName,
  thirdPartyDocumentToMarkdown,
} from "./markdown";
import type { ConsentDocument, PolicyDocument, ThirdPartyDocument } from "./documents";

describe("consentDocumentToMarkdown", () => {
  test("목적·항목·보유기간 표와 동의 체크박스를 만든다", () => {
    const doc: ConsentDocument = {
      kind: "required",
      title: "개인정보 수집 및 이용 동의서",
      rows: [{ purpose: "회원 가입 및 본인 확인", items: ["이름", "이메일"], retention: "회원 탈퇴 시까지" }],
    };

    const md = consentDocumentToMarkdown(doc, "LG 홈케어 멤버십");

    expect(md).toContain("# 개인정보 수집 및 이용 동의서");
    expect(md).toContain("| 회원 가입 및 본인 확인 | 이름, 이메일 | 회원 탈퇴 시까지 |");
    expect(md).toContain("- [ ] 동의함");
    expect(md).toContain("- [ ] 동의하지 않음");
  });

  test("고유식별정보 문서는 근거 법령이 있는 행에만 근거를 보여준다", () => {
    const doc: ConsentDocument = {
      kind: "unique",
      title: "고유식별정보 수집 및 이용 동의서",
      rows: [
        {
          purpose: "제세공과금 신고",
          items: ["주민등록번호"],
          retention: "신고 완료 시까지",
          rrnBasis: "「소득세법」 제145조",
        },
      ],
    };

    const md = consentDocumentToMarkdown(doc, "LG 홈케어 멤버십");

    expect(md).toContain("주민등록번호 수집의 근거 법령");
    expect(md).toContain("「소득세법」 제145조");
  });

  test("만 14세 미만 문서는 법정대리인 정보를 보여준다", () => {
    const doc: ConsentDocument = {
      kind: "child",
      title: "개인정보 수집 및 이용 동의서(만 14세 미만)",
      rows: [
        {
          purpose: "회원 가입",
          items: ["생년월일"],
          retention: "탈퇴 시까지",
          guardianName: "김보호",
          guardianContact: "010-1234-5678",
        },
      ],
    };

    const md = consentDocumentToMarkdown(doc, "LG 홈케어 멤버십");

    expect(md).toContain("김보호");
    expect(md).toContain("010-1234-5678");
  });
});

describe("thirdPartyDocumentToMarkdown", () => {
  test("제공받는자/목적/항목/보유기간 네 칸을 모두 채운다", () => {
    const doc: ThirdPartyDocument = {
      title: "개인정보 제3자 제공 동의서",
      rows: [{ recipient: "㈜카카오", purpose: "알림톡 발송", items: "이름, 휴대전화번호", retention: "발송 완료 시까지" }],
    };

    const md = thirdPartyDocumentToMarkdown(doc, "LG 홈케어 멤버십");

    expect(md).toContain("| 제공받는 자 | 제공 목적 | 제공 항목 | 보유 및 이용기간 |");
    expect(md).toContain("| ㈜카카오 | 알림톡 발송 | 이름, 휴대전화번호 | 발송 완료 시까지 |");
  });
});

describe("policyDocumentToMarkdown", () => {
  const basePolicy: PolicyDocument = {
    serviceName: "LG 홈케어 멤버십",
    effectiveDateLabel: "2026년 10월 1일",
    purposeRows: [{ tier: "필수", purpose: "회원 가입 및 본인 확인", items: ["이름"], retention: "탈퇴 시까지" }],
    lawRows: [],
    thirdPartyRows: [],
    processorRows: [],
    department: "홈케어서비스담당",
    ownerName: "김서연",
    ownerPhone: "02-6915-2384",
    ownerEmail: "homecare.privacy@lge.com",
    usesCookies: false,
    usesLocation: false,
  };

  test("처리목적·항목·보유기간 표가 필수/선택 | 목적 | 항목 | 보유기간 구조다", () => {
    const md = policyDocumentToMarkdown(basePolicy);

    expect(md).toContain("| 필수/선택 | 목적 | 수집하는 개인정보 항목 | 보유 및 이용기간 |");
    expect(md).toContain("| 필수 | 회원 가입 및 본인 확인 | 이름 | 탈퇴 시까지 |");
  });

  test("위탁이 없으면 없다는 문구만, 있으면 표까지 나온다", () => {
    const withoutProcessors = policyDocumentToMarkdown(basePolicy);
    expect(withoutProcessors).toContain("위탁 사항이 없습니다");

    const withProcessors = policyDocumentToMarkdown({
      ...basePolicy,
      processorRows: [{ name: "Amazon Web Services Inc.", work: "인프라 제공" }],
    });
    expect(withProcessors).toContain("| Amazon Web Services Inc. | 인프라 제공 |");
  });

  test("시행일이 머리말과 12번 조항에 모두 반영된다", () => {
    const md = policyDocumentToMarkdown(basePolicy);
    const occurrences = md.split("2026년 10월 1일").length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });

  test("쿠키를 쓰지 않으면 미사용 문구만, 쓰면 웹 브라우저 허용/차단 안내까지 나온다", () => {
    const without = policyDocumentToMarkdown(basePolicy);
    expect(without).toContain("쿠키(cookie)'를 사용하지 않습니다");

    const withCookies = policyDocumentToMarkdown({ ...basePolicy, usesCookies: true });
    expect(withCookies).toContain("크롬(Chrome)");
    expect(withCookies).toContain("엣지(Edge)");
    expect(withCookies).not.toContain("사용하지 않습니다");
  });

  test("위치정보를 쓰면 목차에 조항이 추가되고, 변경에 관한 사항은 항상 마지막 번호로 밀린다", () => {
    const without = policyDocumentToMarkdown(basePolicy);
    expect(without).not.toContain("위치정보의 처리에 관한 사항");
    expect(without).toContain("12. 개인정보 처리방침의 변경에 관한 사항");

    const withLocation = policyDocumentToMarkdown({ ...basePolicy, usesLocation: true });
    expect(withLocation).toContain("12. 위치정보의 처리에 관한 사항");
    expect(withLocation).toContain("위치정보의 보호 및 이용 등에 관한 법률");
    expect(withLocation).toContain("13. 개인정보 처리방침의 변경에 관한 사항");
  });

  test("개인정보 보호책임자 옆에 담당자 이름이 붙는다", () => {
    const md = policyDocumentToMarkdown(basePolicy);
    expect(md).toContain("개인정보 보호책임자: LG전자 정보보호담당 조상현");
  });
});

describe("파일명", () => {
  test("서비스명이 파일명 앞에 들어가고 공백이 빠진다", () => {
    const doc: ConsentDocument = { kind: "required", title: "", rows: [] };
    expect(consentFileName(doc, "LG 홈케어 멤버십")).toBe(
      "LG홈케어멤버십_개인정보_수집이용_동의서_필수.md",
    );
    expect(policyFileName("LG 홈케어 멤버십")).toBe("LG홈케어멤버십_개인정보_처리방침.md");
  });
});
