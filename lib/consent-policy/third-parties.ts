import type { ThirdParty } from "./types";
import { byName } from "./sort";
import { UNTIL_PURPOSE_DONE } from "./purposes";

/** 회사 대표 사이트 처리방침에서 가져온 실제 제3자 제공 사례 */
const RAW_THIRD_PARTIES: ThirdParty[] = [
  {
    name: "㈜LG유플러스",
    purpose: "신용카드 결제, 현금영수증 발행",
    items: "주문자명, 휴대폰번호, 현금영수증 카드번호",
    retention: UNTIL_PURPOSE_DONE,
  },
  {
    name: "네이버 주식회사",
    purpose: "홈 IoT 기기 모니터링 및 기기 원격 제어 서비스 이용",
    items: "기기식별정보, 사용자 인증키, 위치정보, 음성 정보",
    retention: "서비스 이용 시까지",
  },
  {
    name: "Google",
    purpose: "홈 IoT 기기 모니터링 및 기기 원격 제어 서비스 이용",
    items: "이용자 인증키, 기기식별정보, 기기 닉네임, 기기 상태 정보",
    retention: UNTIL_PURPOSE_DONE,
  },
  {
    name: "신한카드, BC카드, 우리카드, 하나카드",
    purpose: "구독 제휴카드 발급/변경 등록 처리",
    items: "성명, 휴대폰번호, 생년월일",
    retention: "카드 발급 및 청약 처리 완료 시까지",
  },
  {
    name: "㈜SK텔레콤, ㈜KT, ㈜LG유플러스",
    purpose: "앱에 등록된 가전의 제어 서비스 이용",
    items: "사용자 인증키, 이용자 번호, 기기 ID, 모델명",
    retention: UNTIL_PURPOSE_DONE,
  },
  {
    name: "코콤㈜, 경동나비엔㈜, ㈜코맥스",
    purpose: "홈 네트워크 서비스의 연동",
    items: "세대 단지, 세대 동/호수, 홈 네트워크 기기 ID",
    retention: UNTIL_PURPOSE_DONE,
  },
];

export const THIRD_PARTIES: ThirdParty[] = [...RAW_THIRD_PARTIES].sort(byName);
