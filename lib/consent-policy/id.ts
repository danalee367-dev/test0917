/** 브라우저와 vitest(jsdom, Node) 양쪽에서 동작하는 고유 id 생성자 */
export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}
