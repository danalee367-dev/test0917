"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/wizard/app-header";
import { WizardStepper } from "@/components/wizard/wizard-stepper";
import { VendorPicker } from "@/components/wizard/vendor-picker";
import { ProcessorTable } from "@/components/wizard/processor-table";
import { ThirdPartyTable } from "@/components/wizard/third-party-table";
import { useWizard } from "@/components/wizard/wizard-context";
import { PROCESSORS } from "@/lib/consent-policy/processors";
import { THIRD_PARTIES } from "@/lib/consent-policy/third-parties";
import { cn } from "@/lib/utils";

function InlineProcessorForm({ onAdd }: { onAdd: (name: string, work: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [work, setWork] = useState("");
  const { showToast } = useWizard();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
      >
        ＋ 목록에 없는 수탁사 직접 입력
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-primary bg-primary/4 p-5">
      <p className="mb-4.5 text-[15px] font-bold">수탁사 직접 입력</p>
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium">
          위탁받는 자 (수탁사) <span className="text-primary">필수</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: ㈜하이프라자"
          className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          법인명을 그대로 적으세요. &quot;협력업체 등&quot;처럼 줄여 쓸 수 없습니다.
        </p>
      </div>
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium">
          위탁하는 업무의 내용 <span className="text-primary">필수</span>
        </label>
        <input
          value={work}
          onChange={(e) => setWork(e.target.value)}
          placeholder="예: 예약 알림 문자 및 알림톡 발송"
          className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (!name.trim() || !work.trim()) {
              showToast("수탁사와 위탁 업무를 모두 적어주세요");
              return;
            }
            onAdd(name.trim(), work.trim());
            setName("");
            setWork("");
            setOpen(false);
          }}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          추가
        </button>
        <button
          type="button"
          onClick={() => {
            setName("");
            setWork("");
            setOpen(false);
          }}
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
        >
          취소
        </button>
      </div>
    </div>
  );
}

function InlineThirdPartyForm({
  onAdd,
}: {
  onAdd: (name: string, purpose: string, items: string, retention: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [items, setItems] = useState("");
  const [retention, setRetention] = useState("");
  const { showToast } = useWizard();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
      >
        ＋ 목록에 없는 제공처 직접 입력
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-primary bg-primary/4 p-5">
      <p className="mb-4.5 text-[15px] font-bold">제3자 제공 직접 입력</p>
      {[
        { label: "제공받는 자", value: name, onChange: setName, placeholder: "예: ㈜카카오" },
        { label: "제공 목적", value: purpose, onChange: setPurpose, placeholder: "예: 알림톡 발송을 위한 회원 식별" },
        { label: "제공 항목", value: items, onChange: setItems, placeholder: "예: 이름, 휴대전화번호" },
        { label: "보유 및 이용기간", value: retention, onChange: setRetention, placeholder: "예: 제공 목적 달성 시까지" },
      ].map((field) => (
        <div key={field.label} className="mb-5">
          <label className="mb-1.5 block text-sm font-medium">
            {field.label} <span className="text-primary">필수</span>
          </label>
          <input
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            className="h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (!name.trim() || !purpose.trim() || !items.trim() || !retention.trim()) {
              showToast("제공받는 자, 목적, 항목, 보유기간을 모두 적어주세요");
              return;
            }
            onAdd(name.trim(), purpose.trim(), items.trim(), retention.trim());
            setName("");
            setPurpose("");
            setItems("");
            setRetention("");
            setOpen(false);
          }}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          추가
        </button>
        <button
          type="button"
          onClick={() => {
            setName("");
            setPurpose("");
            setItems("");
            setRetention("");
            setOpen(false);
          }}
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
        >
          취소
        </button>
      </div>
    </div>
  );
}

export default function SharingPage() {
  const { state, dispatch, showToast } = useWizard();
  const router = useRouter();
  const { sharing } = state;
  const processorNames = new Set(sharing.processors.map((p) => p.name));
  const thirdPartyNames = new Set(sharing.thirdParties.map((p) => p.name));

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16">
      <AppHeader />
      <WizardStepper />

      <h1 className="text-2xl font-bold tracking-tight">위탁과 제3자 제공</h1>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        개인정보가 우리 회사 밖으로 나가는 경우는 두 가지입니다. 둘은 문서에서 다르게 다뤄지고 동의서가 필요한지도
        다르므로, 먼저 차이를 확인하세요.
      </p>

      <div className="mb-6 grid gap-3.5 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4.5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
            위탁 <span className="rounded-full bg-info/14 px-2 py-0.5 text-[11px] font-semibold text-info">동의서 불필요</span>
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">우리 일을 대신 시키는 것</strong>입니다. 받는 회사는 우리가 시킨 일만
            하고, 그 정보를 자기 사업에 쓰지 못합니다.
          </p>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            문서에서는 처리방침의 위탁 표에 회사명과 맡긴 업무를 적습니다. 별도 동의서는 만들지 않습니다.
          </p>
          <div className="rounded-lg bg-muted p-2.5 text-xs leading-relaxed">
            <b className="mb-1 block text-[11px] font-semibold text-muted-foreground">대표적인 예</b>
            클라우드를 데이터베이스로 쓰는 경우입니다. AWS나 Google Cloud에 이용자 정보가 저장되면 그 사업자가
            수탁사입니다. 콜센터 운영, 배송·설치, 알림 문자 발송도 모두 위탁입니다.
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4.5">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold">
            제3자 제공{" "}
            <span className="rounded-full bg-warning/14 px-2 py-0.5 text-[11px] font-semibold text-warning">동의서 필요</span>
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">상대 회사가 자기 목적으로 쓰도록 정보를 넘기는 것</strong>입니다. 넘긴
            뒤에는 그 회사가 자기 책임으로 정보를 다룹니다.
          </p>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            문서에서는 처리방침에 제공받는 자·목적·항목·기간을 적고, 별도 동의서를 따로 만듭니다.
          </p>
          <div className="rounded-lg bg-muted p-2.5 text-xs leading-relaxed">
            <b className="mb-1 block text-[11px] font-semibold text-muted-foreground">회사 대표 처리방침의 실제 예</b>
            결제를 위해 카드사에 주문자명과 휴대폰번호를 넘기는 경우, 네이버·Google의 음성 비서로 가전을 제어하려고
            기기 정보를 넘기는 경우가 제3자 제공입니다.
          </div>
        </div>
      </div>

      {/* 위탁 */}
      <section className="mb-3.5 rounded-xl border bg-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-[17px] font-bold tracking-tight">위탁하는 업무</h2>
          <span className="rounded-full bg-info/14 px-2 py-0.5 text-[11px] font-semibold text-info">동의서 불필요</span>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          회사가 이미 계약한 수탁사 목록에서 고르면 업무 내용까지 함께 들어갑니다.
        </p>

        <label className="mb-4 flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={sharing.noProcessors}
            onChange={(e) => dispatch({ type: "sharing/set-no-processors", value: e.target.checked })}
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <strong>위탁하는 업무가 없습니다</strong>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              클라우드도 쓰지 않고 외부 업체에 맡기는 일이 전혀 없는 경우에만 선택하세요.
            </span>
          </span>
        </label>

        <div className={cn(sharing.noProcessors && "pointer-events-none opacity-40")}>
          <ProcessorTable
            processors={sharing.processors}
            onRemove={(name) => dispatch({ type: "sharing/remove-processor", name })}
            onUpdate={(index, processor) => dispatch({ type: "sharing/update-processor", index, processor })}
          />

          <h3 className="mt-4.5 mb-2 text-[13px] font-bold">회사가 계약한 수탁사에서 고르기</h3>
          <VendorPicker
            vendors={PROCESSORS}
            selectedNames={processorNames}
            renderWork={(v) => v.work}
            onToggle={(vendor) => {
              if (processorNames.has(vendor.name)) {
                dispatch({ type: "sharing/remove-processor", name: vendor.name });
              } else {
                dispatch({ type: "sharing/add-processor", processor: vendor });
              }
            }}
          />

          <InlineProcessorForm
            onAdd={(name, work) => {
              dispatch({ type: "sharing/add-processor", processor: { name, work } });
              showToast("수탁사를 추가했습니다");
            }}
          />
        </div>
      </section>

      {/* 제3자 제공 */}
      <section className="mb-3.5 rounded-xl border bg-card p-5">
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-[17px] font-bold tracking-tight">제3자 제공</h2>
          <span className="rounded-full bg-warning/14 px-2 py-0.5 text-[11px] font-semibold text-warning">동의서 필요</span>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          여기에 하나라도 추가하면 개인정보 제3자 제공 동의서가 따로 만들어집니다.
        </p>

        <label className="mb-4 flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={sharing.noThirdParties}
            onChange={(e) => dispatch({ type: "sharing/set-no-third-parties", value: e.target.checked })}
            className="mt-1 size-4 accent-primary"
          />
          <span>
            <strong>제3자에게 제공하는 개인정보가 없습니다</strong>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              외부 회사가 우리 정보를 자기 목적으로 쓰는 경우가 없다면 이대로 두세요.
            </span>
          </span>
        </label>

        <div className={cn(sharing.noThirdParties && "pointer-events-none opacity-40")}>
          <ThirdPartyTable
            thirdParties={sharing.thirdParties}
            onRemove={(name) => dispatch({ type: "sharing/remove-third-party", name })}
            onUpdate={(index, thirdParty) => dispatch({ type: "sharing/update-third-party", index, thirdParty })}
          />

          {!sharing.noThirdParties && sharing.thirdParties.length > 0 ? (
            <div className="mt-3.5 rounded-lg border border-warning bg-warning/8 p-3">
              <p className="mb-0.5 text-sm font-semibold text-warning">네 가지를 모두 적어야 합니다</p>
              <p className="text-xs leading-relaxed">
                제3자 제공은 제공받는 자, 제공 목적, 제공 항목, 보유 및 이용기간을 빠짐없이 적어야 합니다. 하나라도
                비면 동의서와 처리방침이 법에서 요구하는 형식을 채우지 못합니다.
              </p>
            </div>
          ) : null}

          <h3 className="mt-4.5 mb-2 text-[13px] font-bold">회사 대표 처리방침의 사례에서 고르기</h3>
          <VendorPicker
            vendors={THIRD_PARTIES}
            selectedNames={thirdPartyNames}
            renderWork={(v) => `${v.purpose} · ${v.items}`}
            onToggle={(vendor) => {
              if (thirdPartyNames.has(vendor.name)) {
                dispatch({ type: "sharing/remove-third-party", name: vendor.name });
              } else {
                dispatch({ type: "sharing/add-third-party", thirdParty: vendor });
              }
            }}
          />

          <InlineThirdPartyForm
            onAdd={(name, purpose, items, retention) => {
              dispatch({ type: "sharing/add-third-party", thirdParty: { name, purpose, items, retention } });
              showToast("제3자 제공을 추가했습니다");
            }}
          />
        </div>
      </section>

      <div className="mb-3.5 rounded-lg border bg-card p-3.5 text-xs leading-relaxed">
        <p className="mb-0.5 font-semibold">회사 이름은 줄여 쓸 수 없습니다</p>
        &quot;협력업체 등&quot;처럼 뭉뚱그리면 안 되고 법인명을 그대로 모두 적어야 합니다. 이용자가 어느 회사가 자기
        정보를 다루는지 알 수 있어야 하기 때문입니다.
      </div>

      <div className="mt-6 flex items-center gap-2.5 border-t pt-5">
        <Link href="/purpose-groups" className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted">
          ← 수집 항목과 목적
        </Link>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => {
            dispatch({ type: "step/mark-saved", step: "sharing" });
            showToast("위탁과 제3자 제공을 저장했습니다");
            router.push("/result");
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/85"
        >
          저장하고 문서 만들기 →
        </button>
      </div>
    </main>
  );
}
