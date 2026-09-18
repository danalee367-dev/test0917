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
];

export const THIRD_PARTIES: ThirdParty[] = [...RAW_THIRD_PARTIES].sort(byName);
