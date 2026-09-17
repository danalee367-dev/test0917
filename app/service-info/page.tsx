"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/wizard/app-header";
import { WizardStepper } from "@/components/wizard/wizard-stepper";
import { useWizard } from "@/components/wizard/wizard-context";
import { COMPANY } from "@/lib/consent-policy/company";
import { defaultEffectiveDate, formatKoreanDate } from "@/lib/consent-policy/date";

export default function ServiceInfoPage() {
  const { state, dispatch, showToast } = useWizard();
  const router = useRouter();
  const info = state.serviceInfo;
  const defaultDateLabel = formatKoreanDate(defaultEffectiveDate());

  const update = (patch: Partial<typeof info>) => dispatch({ type: "service-info/update", patch });

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16">
      <AppHeader />
      <WizardStepper />

      <h1 className="text-2xl font-bold tracking-tight">서비스 정보</h1>
      <p className="mb-6 text-sm text-muted-foreground">문서의 앞머리와 문의처에 들어가는 내용입니다.</p>

      <section className="mb-3.5 rounded-xl border bg-card p-5">
        <h2 className="mb-1 text-[17px] font-bold tracking-tight">서비스</h2>
        <p className="mb-4 text-xs text-muted-foreground">문서 전체에서 이 서비스의 이름으로 쓰입니다.</p>

        <div className="mb-7.5">
          <label htmlFor="svc-name" className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
            서비스명 <span className="text-xs font-semibold text-primary">필수</span>
          </label>
          <input
            id="svc-name"
            type="text"
            value={info.name}
            onChange={(e) => update({ name: e.target.value })}
            className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            이용자에게 보이는 정식 이름을 적으세요. 사내 과제명이나 코드명은 쓰지 않습니다.
          </p>
        </div>

        <div className="mb-7.5">
          <label htmlFor="svc-desc" className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
            서비스 한 줄 설명 <span className="text-xs font-normal text-muted-foreground">선택</span>
          </label>
          <input
            id="svc-desc"
            type="text"
            value={info.description}
            onChange={(e) => update({ description: e.target.value })}
            className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div>
          <label htmlFor="svc-effective" className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
            개인정보 처리방침 시행일 <span className="text-xs font-normal text-muted-foreground">선택</span>
          </label>
          <input
            id="svc-effective"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={info.effectiveDate}
            onChange={(e) => update({ effectiveDate: e.target.value })}
            className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            처리방침 맨 끝에 &quot;본 개인정보 처리방침은 ○○○○년 ○월 ○일부터 시행합니다&quot;로 들어갑니다. 비우면{" "}
            <b>{defaultDateLabel}</b>로 잡힙니다. 오늘부터 2주 뒤이며, 이용자에게 미리 알릴 시간을 두기 위한
            기본값입니다.
          </p>
        </div>
      </section>

      <section className="mb-3.5 rounded-xl border bg-card p-5">
        <h2 className="mb-1 text-[17px] font-bold tracking-tight">운영 부서와 담당자</h2>
        <p className="mb-4 text-xs text-muted-foreground">처리방침의 문의처와 열람 청구 접수 부서로 들어갑니다.</p>

        <div className="mb-7.5">
          <label htmlFor="svc-dept" className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
            운영 부서 <span className="text-xs font-semibold text-primary">필수</span>
          </label>
          <input
            id="svc-dept"
            type="text"
            value={info.department}
            onChange={(e) => update({ department: e.target.value })}
            className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="mb-7.5 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label htmlFor="svc-owner" className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
              담당자 이름 <span className="text-xs font-semibold text-primary">필수</span>
            </label>
            <input
              id="svc-owner"
              type="text"
              value={info.ownerName}
              onChange={(e) => update({ ownerName: e.target.value })}
              className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div>
            <label htmlFor="svc-tel" className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
              대표 전화번호 <span className="text-xs font-normal text-muted-foreground">선택</span>
            </label>
            <input
              id="svc-tel"
              type="text"
              value={info.ownerPhone}
              onChange={(e) => update({ ownerPhone: e.target.value })}
              className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">비워두면 회사 대표 번호가 들어갑니다.</p>
          </div>
        </div>

        <div>
          <label htmlFor="svc-mail" className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
            대표 이메일 <span className="text-xs font-semibold text-primary">필수</span>
          </label>
          <input
            id="svc-mail"
            type="email"
            value={info.ownerEmail}
            onChange={(e) => update({ ownerEmail: e.target.value })}
            className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            개인 이메일이 아니라 부서에서 함께 받는 대표 주소를 적으세요. 담당자가 바뀌어도 문의가 끊기지 않습니다.
          </p>
        </div>
      </section>

      <section className="mb-3.5 rounded-xl border border-dashed bg-muted p-5">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-[17px] font-bold tracking-tight">회사 정보</h2>
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">고정</span>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">모든 문서에 같은 값이 들어갑니다. 입력할 필요가 없습니다.</p>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-2.75 block text-[15px] font-bold">법인명</label>
            <input
              readOnly
              value={COMPANY.name}
              className="h-8 w-full rounded-lg border bg-muted px-2.5 text-sm text-muted-foreground outline-none"
            />
          </div>
          <div>
            <label className="mb-2.75 block text-[15px] font-bold">사업자등록번호</label>
            <input
              readOnly
              value={COMPANY.registrationNumber}
              className="h-8 w-full rounded-lg border bg-muted px-2.5 text-sm text-muted-foreground outline-none"
            />
          </div>
        </div>
        <div className="mt-7.5">
          <label className="mb-2.75 block text-[15px] font-bold">주소</label>
          <input
            readOnly
            value={COMPANY.address}
            className="h-8 w-full rounded-lg border bg-muted px-2.5 text-sm text-muted-foreground outline-none"
          />
        </div>
        <div className="mt-7.5">
          <label className="mb-2.75 block text-[15px] font-bold">개인정보 보호책임자</label>
          <input
            readOnly
            value={COMPANY.privacyOfficer}
            className="h-8 w-full rounded-lg border bg-muted px-2.5 text-sm text-muted-foreground outline-none"
          />
        </div>
        <p className="mt-3.5 text-xs text-muted-foreground">
          이 값을 바꿔야 한다면 개인정보보호 담당 부서에 문의하세요.
        </p>
      </section>

      <div className="mt-6 flex items-center gap-2.5 border-t pt-5">
        <Link href="/" className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted">
          ← 처음으로
        </Link>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "step/mark-saved", step: "service-info" });
            showToast("서비스 정보를 저장했습니다");
            router.push("/purpose-groups");
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/85"
        >
          저장하고 다음으로 →
        </button>
      </div>
    </main>
  );
}
