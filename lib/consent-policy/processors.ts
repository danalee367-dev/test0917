import type { Processor } from "./types";
import { byName } from "./sort";

/** 회사 대표 사이트 처리방침에서 가져온 실제 수탁사 목록 */
const RAW_PROCESSORS: Processor[] = [
  { name: "Amazon Web Services Inc.", work: "인프라 제공" },
  {
    name: "Google Inc.",
    work: "인프라 제공, 광고·타겟 마케팅, 광고 이용 행태 분석",
  },
  { name: "베스핀글로벌", work: "인프라 및 시스템 운영" },
  {
    name: "㈜LG CNS",
    work: "서비스 운영, 시스템 운영, 결제 및 정산, 챗봇 시스템 관리",
  },
  {
    name: "㈜하이텔레서비스",
    work: "LG전자 고객 상담 센터 운영, 고객 응대 및 상담 업무",
  },
  {
    name: "㈜하이케어솔루션",
    work: "구매 제품 설치, 구독 제품 유지보수 및 방문서비스",
  },
  {
    name: "하이엠솔루텍㈜",
    work: "구매 제품 설치, 시스템 에어컨 서비스 및 세척, 멤버십 회원 관리",
  },
  { name: "LX판토스", work: "제품 배송/설치, 이전 설치" },
  { name: "CJ대한통운㈜", work: "소모품 풀필먼트 운영 및 배송" },
  {
    name: "굿스플로",
    work: "배송정보 출력 서비스, 배송과 반품 정보 전송 서비스",
  },
  { name: "인포빕", work: "메시지 발송" },
  { name: "NICE평가정보㈜", work: "본인확인이 필요한 서비스 이용 시 본인 확인" },
  { name: "㈜다날", work: "본인인증" },
  {
    name: "Appsflyer Ltd.",
    work: "서비스 이용 분석, 광고·타겟 마케팅, 광고 이용 행태 분석",
  },
  { name: "Mixpanel, Inc.", work: "서비스 이용 분석" },
  {
    name: "한국마이크로소프트(유)",
    work: "제품·서비스 개선, 개발을 위한 서비스 이용 분석",
  },
];

export const PROCESSORS: Processor[] = [...RAW_PROCESSORS].sort(byName);
