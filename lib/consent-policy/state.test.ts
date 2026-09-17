import { describe, expect, test } from "vitest";
import { createInitialWizardState } from "./factories";
import { wizardReducer } from "./state";
import { PURPOSES } from "./purposes";
import type { WizardState } from "./types";

function firstGroupId(state: WizardState): string {
  return state.purposeGroups[0]!.id;
}

describe("group/select-purpose", () => {
  test("목적을 고르면 보유 기간이 자동으로 채워진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    const purpose = PURPOSES.find((p) => p.label === "회원 가입 및 본인 확인")!;

    state = wizardReducer(state, { type: "group/select-purpose", id, purpose });

    expect(state.purposeGroups[0]!.retention).toBe("회원 탈퇴 시까지");
    expect(state.purposeGroups[0]!.retentionAuto).toBe(true);
  });

  test("사용자가 직접 고친 보유 기간은 목적을 바꿔도 유지된다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);
    const signup = PURPOSES.find((p) => p.label === "회원 가입 및 본인 확인")!;
    const payment = PURPOSES.find((p) => p.label === "요금 결제 및 정산")!;

    state = wizardReducer(state, { type: "group/select-purpose", id, purpose: signup });
    state = wizardReducer(state, { type: "group/set-retention", id, value: "직접 적은 기간", auto: false });
    state = wizardReducer(state, { type: "group/select-purpose", id, purpose: payment });

    expect(state.purposeGroups[0]!.retention).toBe("직접 적은 기간");
    expect(state.purposeGroups[0]!.retentionAuto).toBe(false);
  });
});

describe("group/toggle-item", () => {
  test("항목을 고르면 종류가 분류되고, 다시 누르면 빠진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);

    state = wizardReducer(state, { type: "group/toggle-item", id, name: "건강 상태 및 병력" });
    expect(state.purposeGroups[0]!.selectedItems).toEqual([
      { name: "건강 상태 및 병력", kind: "sensitive" },
    ]);

    state = wizardReducer(state, { type: "group/toggle-item", id, name: "건강 상태 및 병력" });
    expect(state.purposeGroups[0]!.selectedItems).toEqual([]);
  });

  test("생체정보를 빼면 답변이 함께 지워진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);

    state = wizardReducer(state, { type: "group/toggle-item", id, name: "얼굴 이미지" });
    state = wizardReducer(state, { type: "group/set-biometric-answer", id, answer: "yes" });
    expect(state.purposeGroups[0]!.biometricAnswer).toBe("yes");

    state = wizardReducer(state, { type: "group/toggle-item", id, name: "얼굴 이미지" });
    expect(state.purposeGroups[0]!.biometricAnswer).toBeNull();
  });

  test("생년월일을 빼면 만14세 답변이 함께 지워진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);

    state = wizardReducer(state, { type: "group/toggle-item", id, name: "생년월일" });
    state = wizardReducer(state, { type: "group/set-age-answer", id, answer: "yes" });

    state = wizardReducer(state, { type: "group/toggle-item", id, name: "생년월일" });

    expect(state.purposeGroups[0]!.ageAnswer).toBeNull();
  });

  test("주민등록번호를 빼면 근거 법령 입력이 지워진다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);

    state = wizardReducer(state, { type: "group/toggle-item", id, name: "주민등록번호" });
    state = wizardReducer(state, { type: "group/set-rrn-basis", id, value: "「소득세법」 제145조" });
    state = wizardReducer(state, { type: "group/toggle-item", id, name: "주민등록번호" });

    expect(state.purposeGroups[0]!.rrnBasis).toBe("");
  });
});

describe("group/remove", () => {
  test("묶음이 하나만 남으면 삭제되지 않는다", () => {
    let state = createInitialWizardState();
    const id = firstGroupId(state);

    state = wizardReducer(state, { type: "group/remove", id });

    expect(state.purposeGroups).toHaveLength(1);
  });

  test("묶음이 여러 개면 지정한 것만 삭제된다", () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, { type: "group/add" });
    const [first, second] = state.purposeGroups;

    state = wizardReducer(state, { type: "group/remove", id: first!.id });

    expect(state.purposeGroups).toEqual([second]);
  });
});

describe("sharing", () => {
  test("같은 이름의 수탁사는 중복 추가되지 않는다", () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, {
      type: "sharing/add-processor",
      processor: { name: "Amazon Web Services Inc.", work: "인프라 제공" },
    });
    state = wizardReducer(state, {
      type: "sharing/add-processor",
      processor: { name: "Amazon Web Services Inc.", work: "다른 설명" },
    });

    expect(state.sharing.processors).toHaveLength(1);
    expect(state.sharing.processors[0]!.work).toBe("인프라 제공");
  });

  test("수탁사를 이름으로 제거할 수 있다", () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, {
      type: "sharing/add-processor",
      processor: { name: "인포빕", work: "메시지 발송" },
    });
    state = wizardReducer(state, { type: "sharing/remove-processor", name: "인포빕" });

    expect(state.sharing.processors).toHaveLength(0);
  });
});

describe("step/mark-saved", () => {
  test("저장한 단계는 한 번만 기록된다", () => {
    let state = createInitialWizardState();
    state = wizardReducer(state, { type: "step/mark-saved", step: "service-info" });
    state = wizardReducer(state, { type: "step/mark-saved", step: "service-info" });

    expect(state.savedSteps).toEqual(["service-info"]);
  });
});
