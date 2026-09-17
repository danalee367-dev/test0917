/** 마지막 글자의 받침 유무로 은/는 조사를 고른다. 한글이 아니면 "은(는)"으로 둔다. */
export function topicParticle(word: string): string {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return "은(는)";
  return (code - 0xac00) % 28 !== 0 ? "은" : "는";
}

export const RETENTION_SAMPLES = [
  "회원 탈퇴 시까지",
  "서비스 이용 종료 후 3년까지",
  "수집일로부터 1년까지",
  "목적 달성 후 지체 없이 파기",
];
