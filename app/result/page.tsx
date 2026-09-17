"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/wizard/app-header";
import { WizardStepper } from "@/components/wizard/wizard-stepper";
import { ConsentDocumentView, ThirdPartyDocumentView } from "@/components/wizard/consent-document-view";
import { PolicyDocumentView } from "@/components/wizard/policy-document-view";
import { useWizard } from "@/components/wizard/wizard-context";
import { buildDocuments, type ConsentDocument } from "@/lib/consent-policy/documents";
import {
  consentDocumentToMarkdown,
  consentFileName,
  policyDocumentToMarkdown,
  policyFileName,
  thirdPartyDocumentToMarkdown,
  thirdPartyFileName,
} from "@/lib/consent-policy/markdown";
import { DOWNLOAD_FORMAT_LABEL, downloadDocument, type DownloadFormat } from "@/lib/consent-policy/download";
import { cn } from "@/lib/utils";

const DOWNLOAD_FORMATS: DownloadFormat[] = ["md", "html", "doc"];

function baseFileName(fileName: string): string {
  return fileName.replace(/\.md$/, "");
}

const CONSENT_TAB_LABEL: Record<ConsentDocument["kind"], string> = {
  required: "동의서 (필수)",
  optional: "동의서 (선택)",
  sensitive: "민감정보 동의서 (선택)",
  unique: "고유식별정보 동의서 (선택)",
  child: "만 14세 미만 동의서 (선택)",
};

const CONSENT_BADGE: Record<ConsentDocument["kind"], { label: string; className: string }> = {
  required: { label: "필수", className: "bg-primary text-primary-foreground" },
  optional: { label: "선택", className: "bg-optional text-optional-foreground" },
  sensitive: { label: "민감정보", className: "bg-warning/14 text-warning" },
  unique: { label: "고유식별정보", className: "bg-warning/14 text-warning" },
  child: { label: "만 14세 미만", className: "bg-warning/14 text-warning" },
};

export default function ResultPage() {
  const { state } = useWizard();
  const serviceName = state.serviceInfo.name || "서비스";
  const docs = useMemo(() => buildDocuments(state), [state]);

  interface Tab {
    key: string;
    label: string;
    badge: { label: string; className: string };
    meta: string;
    render: () => React.ReactNode;
    download: (format: DownloadFormat) => void;
  }

  const tabs: Tab[] = useMemo(() => {
    const consentTabs: Tab[] = docs.consents.map((doc) => ({
      key: doc.kind,
      label: CONSENT_TAB_LABEL[doc.kind],
      badge: CONSENT_BADGE[doc.kind],
      meta: `목적 ${doc.rows.length}개 · 항목 ${doc.rows.reduce((n, r) => n + r.items.length, 0)}개`,
      render: () => <ConsentDocumentView doc={doc} serviceName={serviceName} />,
      download: (format) =>
        downloadDocument(
          format,
          baseFileName(consentFileName(doc, serviceName)),
          doc.title,
          consentDocumentToMarkdown(doc, serviceName),
        ),
    }));

    const thirdPartyTab: Tab[] = docs.thirdParty
      ? [
          {
            key: "thirdParty",
            label: "제3자 제공 동의서 (선택)",
            badge: { label: "제3자 제공", className: "bg-warning/14 text-warning" },
            meta: `제공처 ${docs.thirdParty.rows.length}곳`,
            render: () => <ThirdPartyDocumentView doc={docs.thirdParty!} serviceName={serviceName} />,
            download: (format) =>
              downloadDocument(
                format,
                baseFileName(thirdPartyFileName(serviceName)),
                docs.thirdParty!.title,
                thirdPartyDocumentToMarkdown(docs.thirdParty!, serviceName),
              ),
          },
        ]
      : [];

    const policyTab: Tab = {
      key: "policy",
      label: "개인정보 처리방침",
      badge: { label: "게시용", className: "bg-info/14 text-info" },
      meta: "12개 항목 작성",
      render: () => <PolicyDocumentView doc={docs.policy} />,
      download: (format) =>
        downloadDocument(format, baseFileName(policyFileName(serviceName)), "개인정보 처리방침", policyDocumentToMarkdown(docs.policy)),
    };

    return [...consentTabs, ...thirdPartyTab, policyTab];
  }, [docs, serviceName]);

  const [activeKey, setActiveKey] = useState(tabs[0]?.key ?? "policy");
  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[tabs.length - 1];
  const [format, setFormat] = useState<DownloadFormat>("md");

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16">
      <AppHeader />
      <WizardStepper />

      <h1 className="text-2xl font-bold tracking-tight">만들어진 문서</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        입력한 내용으로 문서가 만들어졌습니다. 확인하고 내려받아 법무 검토를 받으세요.
      </p>

      <section className="mb-6 rounded-xl border bg-card p-5">
        <h2 className="mb-1 text-[17px] font-bold tracking-tight">문서 목록</h2>
        <p className="mb-4 text-xs text-muted-foreground">선택한 항목에 따라 필요한 문서가 정해졌습니다.</p>
        {tabs.map((tab) => (
          <div key={tab.key} className="flex flex-wrap items-center gap-3 border-b py-3 text-sm last:border-b-0">
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", tab.badge.className)}>
              {tab.badge.label}
            </span>
            <span className="font-medium">{tab.label}</span>
            <span className="ml-auto text-xs text-muted-foreground">{tab.meta}</span>
          </div>
        ))}
      </section>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={tab.key === activeKey}
              onClick={() => setActiveKey(tab.key)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 border-transparent px-3.5 pb-2.5 text-sm text-muted-foreground",
                tab.key === activeKey && "border-primary font-semibold text-primary",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 pb-2.5">
          <label className="sr-only" htmlFor="download-format">
            내려받기 형식
          </label>
          <select
            id="download-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as DownloadFormat)}
            className="rounded-lg border bg-background px-2 py-1.25 text-xs font-medium"
          >
            {DOWNLOAD_FORMATS.map((f) => (
              <option key={f} value={f}>
                {DOWNLOAD_FORMAT_LABEL[f]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => active?.download(format)}
            className="rounded-lg border px-2.5 py-1.25 text-xs font-medium hover:bg-muted"
          >
            이 문서만 내려받기
          </button>
          <button
            type="button"
            onClick={() => tabs.forEach((tab, i) => setTimeout(() => tab.download(format), i * 200))}
            className="rounded-lg bg-primary px-2.5 py-1.25 text-xs font-medium text-primary-foreground"
          >
            모두 내려받기
          </button>
        </div>
      </div>

      {active ? active.render() : null}

      <div className="mt-6 flex items-center gap-2.5 border-t pt-5">
        <Link href="/sharing" className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted">
          ← 위탁과 제3자 제공
        </Link>
      </div>

      <div className="mt-4 rounded-lg border bg-card p-3.5 text-xs leading-relaxed">
        <p className="mb-0.5 font-semibold">워드(.doc) 파일은 HTML 기반으로 변환됩니다</p>
        내려받은 .doc 파일은 실제 워드 형식(OOXML)이 아니라 워드가 열 수 있는 HTML 문서입니다. 워드로 열어 편집한
        뒤 법무 검토를 받으세요. 사내 공용 저장소에 버전을 쌓는 기능은 다음 단계에서 열립니다.
      </div>
    </main>
  );
}
