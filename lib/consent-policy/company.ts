/** 모든 문서에 고정으로 들어가는 회사 값. PRODUCT.md의 "회사 정보는 고정" 결정에 따른다. */
export const COMPANY = {
  name: "LG전자 주식회사",
  address: "서울특별시 영등포구 여의대로 128 LG트윈타워",
  registrationNumber: "107-86-14075",
  privacyOfficer: "LG전자 정보보호담당",
  privacyOfficerName: "조상현",
  /** 서비스 담당자 전화번호를 비워둔 경우에만 쓰는 회사 대표 번호 */
  defaultPhone: "02-6915-1774",
} as const;

export const REDRESS_CONTACTS = [
  { name: "개인정보분쟁조정위원회", phone: "(국번없이) 1833-6972", url: "www.kopico.go.kr" },
  { name: "개인정보침해신고센터", phone: "(국번없이) 118", url: "privacy.kisa.or.kr" },
  { name: "대검찰청", phone: "(국번없이) 1301", url: "www.spo.go.kr" },
  { name: "경찰청", phone: "(국번없이) 182", url: "ecrm.police.go.kr" },
] as const;
