import type { CatalogCategory, ItemKind } from "./types";

/**
 * 수집 항목 카탈로그. 순서가 화면에 보이는 카테고리 순서다.
 * basic/usage/auto는 목적별 추천에 쓰이고, login/location/sensitive/biometric/unique는
 * 목적과 무관하게 항상 노출된다 (프로토타입 buildPicker와 동일한 구성).
 */
export const CATALOG: Record<string, CatalogCategory> = {
  basic: {
    key: "basic",
    label: "기본 정보",
    items: [
      "이름",
      "휴대전화번호",
      "이메일",
      "주소",
      "생년월일",
      "성별",
      "아이디",
      "비밀번호",
      "직업",
    ],
  },
  usage: {
    key: "usage",
    label: "서비스 이용 정보",
    items: [
      "보유 제품 모델명",
      "방문 희망 일시",
      "배송 요청사항",
      "구매 이력",
      "거래 내역",
      "결제 수단 정보",
      "문의 및 상담 내용",
      "상담 녹취",
      "설문 응답 내용",
    ],
  },
  auto: {
    key: "auto",
    label: "자동 수집 정보",
    items: [
      "쿠키",
      "IP 주소",
      "접속 로그",
      "기기 식별정보",
      "광고 식별자",
      "서비스 이용 기록",
    ],
  },
  login: {
    key: "login",
    label: "간편인증 연동",
    note: "연동 사업자로부터 받는 정보 확인",
    kind: "login",
    items: [
      "네이버 로그인",
      "카카오 로그인",
      "Google 계정(Gmail)",
      "Apple 로그인",
      "PASS 인증",
    ],
  },
  location: {
    key: "location",
    label: "위치정보",
    note: "위치정보법도 함께 적용",
    kind: "location",
    items: [
      "GPS 좌표(위도·경도)",
      "기지국 기반 위치",
      "Wi-Fi 기반 위치",
      "이동 경로",
      "방문 장소 기록",
      "접속 지역 정보",
    ],
  },
  sensitive: {
    key: "sensitive",
    label: "민감정보",
    note: "별도 동의서 필요",
    kind: "sensitive",
    items: [
      "건강 상태 및 병력",
      "진료 및 처방 기록",
      "노동조합·정당 가입 여부",
      "사상·신념",
      "유전정보",
    ],
  },
  biometric: {
    key: "biometric",
    label: "생체정보",
    note: "처리 방식에 따라 민감정보",
    kind: "biometric",
    items: ["지문", "얼굴 이미지", "홍채", "음성"],
  },
  unique: {
    key: "unique",
    label: "고유식별정보",
    note: "별도 동의서 필요",
    kind: "unique",
    items: ["여권번호", "운전면허번호", "외국인등록번호", "주민등록번호"],
  },
};

/** 목적과 무관하게 항상 보이는 카테고리 순서 */
export const ALWAYS_SHOWN_CATEGORY_KEYS = [
  "login",
  "location",
  "sensitive",
  "biometric",
  "unique",
] as const;

/** 목적별 추천 대상이 되는 카테고리 순서 */
export const SUGGESTIBLE_CATEGORY_KEYS = ["basic", "auto", "usage"] as const;

const RRN_NAME = "주민등록번호";

/**
 * 항목 이름으로 성격(kind)을 판별한다.
 * 주민등록번호는 고유식별정보 카테고리에 속하지만 법령상 취급이 더 엄격해 별도 kind를 둔다.
 */
export function kindOf(name: string): ItemKind {
  if (name === RRN_NAME) return "rrn";
  for (const category of Object.values(CATALOG)) {
    if (category.items.includes(name)) return category.kind ?? "normal";
  }
  return "normal";
}
