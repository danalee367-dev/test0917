const STORAGE_KEY = "consent-policy:recent-custom-purposes";
const MAX_ITEMS = 8;

/**
 * 목적을 직접 입력할 때, 이 브라우저에서 예전에 적었던 목적명을 자동완성으로 보여준다.
 * 사내 공용 저장소가 없는 지금 범위에서는 팀 간 공유가 아니라 이 브라우저 안에서만 재사용된다.
 * localStorage 접근이 막혀 있어도(프라이빗 모드 등) 자동완성이 없을 뿐 입력 자체는 그대로 동작해야 한다.
 */
export function loadRecentPurposes(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function saveRecentPurpose(label: string): void {
  const trimmed = label.trim();
  if (!trimmed) return;
  try {
    const next = [trimmed, ...loadRecentPurposes().filter((p) => p !== trimmed)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 저장이 안 되어도 자동완성만 못 뜨는 것뿐이라 조용히 넘어간다.
  }
}
