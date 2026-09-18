import { hasBiometricItem, hasBirthDate, hasRrnItem } from "./selectors";
import { purposeLabel } from "./types";
import type { PurposeGroup, ServiceInfo } from "./types";

/** 서비스 정보 단계에서 "필수" 표시가 붙은 값 중 비어 있는 것의 안내 문구. */
export function serviceInfoErrors(info: ServiceInfo): string[] {
  const errors: string[] = [];
  if (!info.name.trim()) errors.push("서비스명을 입력하세요");
  if (!info.department.trim()) errors.push("운영 부서를 입력하세요");
  if (!info.ownerName.trim()) errors.push("담당자 이름을 입력하세요");
  if (!info.ownerEmail.trim()) errors.push("대표 이메일을 입력하세요");
  return errors;
}

/** 처리 목적 묶음 하나에서 "필수" 표시가 붙은 값 중 비어 있는 것의 안내 문구. */
export function purposeGroupErrors(group: PurposeGroup): string[] {
  const errors: string[] = [];
  if (!purposeLabel(group).trim()) errors.push("처리 목적을 고르거나 직접 입력하세요");
  if (group.selectedItems.length === 0) errors.push("수집 항목을 하나 이상 고르세요");
  if (!group.retention.trim()) errors.push("보유 및 이용 기간을 입력하세요");
  if (hasRrnItem(group) && !group.rrnBasis.trim()) {
    errors.push("주민등록번호 수집의 근거 법령을 입력하세요");
  }
  if (hasBiometricItem(group) && group.biometricAnswer === null) {
    errors.push("생체정보를 특정 개인을 알아보기 위해 처리하는지 답하세요");
  }
  if (hasBirthDate(group) && group.ageAnswer === null) {
    errors.push("만 14세 미만 아동 이용 여부에 답하세요");
  }
  return errors;
}
