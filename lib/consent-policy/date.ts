/** 시행일 기본값: 오늘부터 2주 뒤. 이용자에게 미리 알릴 시간을 두기 위한 기본값이다. */
export function defaultEffectiveDate(today: Date = new Date()): Date {
  const date = new Date(today);
  date.setDate(date.getDate() + 14);
  return date;
}

export function formatKoreanDate(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** YYYY-MM-DD 입력을 시행일로 확정한다. 비어 있거나 형식이 잘못되면 기본값을 쓴다. */
export function resolveEffectiveDate(input: string, today: Date = new Date()): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const parsed = new Date(`${input}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return defaultEffectiveDate(today);
}
