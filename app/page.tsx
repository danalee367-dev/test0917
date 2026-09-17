import Link from "next/link";
import { AppHeader } from "@/components/wizard/app-header";

export default function StartPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16">
      <AppHeader />

      <h1 className="mb-2 text-2xl font-bold tracking-tight">어떤 문서를 만드시겠어요?</h1>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        서비스에 필요한 개인정보 수집·이용 동의서와 개인정보 처리방침을 함께 만듭니다. 항목을 고르면 필요한
        동의서가 자동으로 정해지고, 두 문서의 내용이 서로 어긋나지 않게 맞춰집니다.
      </p>

      <div className="mb-4.5 grid gap-3.5 sm:grid-cols-2">
        <Link
          href="/service-info"
          className="flex flex-col rounded-xl border bg-card p-5.5 text-left hover:border-primary"
        >
          <span className="mb-1.75 text-[15px] font-semibold">신규 서비스 문서 만들기</span>
          <span className="mb-5 text-sm leading-relaxed text-muted-foreground">
            처음 준비하는 서비스입니다. 수집할 항목과 협력업체를 고르면 동의서와 처리방침 초안을 새로 만듭니다.
          </span>
          <span className="mt-auto text-sm font-semibold text-primary">시작하기 →</span>
        </Link>

        <div className="flex flex-col rounded-xl border border-dashed bg-muted p-5.5 text-left" aria-disabled="true">
          <span className="mb-1.75 flex items-center gap-2 text-[15px] font-semibold">
            기존 문서 개정하기
            <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              준비 중
            </span>
          </span>
          <span className="mb-5 text-sm leading-relaxed text-muted-foreground">
            이미 만들어 둔 문서의 내용을 고쳐 새 버전을 만듭니다. 지금은 이 도구로 만든 문서만 열 수 있도록 준비하고
            있습니다.
          </span>
          <span className="mt-auto text-sm font-semibold text-muted-foreground">곧 열립니다</span>
        </div>
      </div>

      <div className="rounded-lg border bg-info/7 p-3.5 text-sm leading-relaxed">
        만들어진 문서는 법무 검토를 받은 뒤 사이트에 등록하세요. 이 도구는 검토에 보낼 수 있는 상태까지 문서를
        완성합니다.
      </div>
    </main>
  );
}
