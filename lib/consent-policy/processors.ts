import type { Processor } from "./types";
import { byName } from "./sort";

/** 회사 대표 사이트 처리방침에서 가져온 실제 수탁사 목록 */
const RAW_PROCESSORS: Processor[] = [
  { name: "Amazon Web Services Inc.", work: "인프라 제공" },
];

export const PROCESSORS: Processor[] = [...RAW_PROCESSORS].sort(byName);
