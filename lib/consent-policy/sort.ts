/**
 * 정렬용 키. 회사 표기 앞머리(㈜, (주))와 공백을 제거해 회사 이름 본문 기준으로 줄을 세운다.
 * 제거하지 않으면 "㈜"로 시작하는 모든 회사가 실제 순서와 무관하게 먼저 몰린다.
 */
export function sortKey(name: string): string {
  return name.replace(/[㈜\s]|^\(주\)/g, "");
}

/** 가나다 순 다음 A–Z 순. 'ko' locale의 localeCompare가 한글을 영문보다 앞에 둔다. */
export function byName<T extends { name: string }>(a: T, b: T): number {
  return sortKey(a.name).localeCompare(sortKey(b.name), "ko");
}
