import { consentIntro, consentRefusal } from "@/lib/consent-policy/markdown";
import type { ConsentDocument, ThirdPartyDocument } from "@/lib/consent-policy/documents";
import { COMPANY } from "@/lib/consent-policy/company";

export function ConsentDocumentView({ doc, serviceName }: { doc: ConsentDocument; serviceName: string }) {
  return (
    <div className="rounded-xl border bg-card p-10 text-sm leading-[1.8]">
      <p className="mb-5.5 text-center text-[17px] font-bold">{doc.title}</p>
      <p className="mb-3">{consentIntro(doc.kind, serviceName)}</p>

      <h4 className="mt-6.5 mb-2 text-sm font-bold">개인정보 수집 및 이용 내역</h4>
      <table className="mb-3.5 w-full border border-foreground text-xs">
        <thead>
          <tr className="bg-muted">
            <th className="border border-foreground p-2 text-left">수집 및 이용 목적</th>
            <th className="border border-foreground p-2 text-left">수집 항목</th>
            <th className="border border-foreground p-2 text-left">보유 및 이용 기간</th>
          </tr>
        </thead>
        <tbody>
          {doc.rows.map((row, i) => (
            <tr key={i}>
              <td className="border border-foreground p-2">{row.purpose}</td>
              <td className="border border-foreground p-2">{row.items.join(", ")}</td>
              <td className="border border-foreground p-2">{row.retention}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {doc.kind === "unique" && doc.rows.some((row) => row.rrnBasis) ? (
        <p className="mb-3 text-xs text-muted-foreground">
          주민등록번호 수집의 근거 법령:{" "}
          {doc.rows
            .filter((row) => row.rrnBasis)
            .map((row) => `${row.purpose} - ${row.rrnBasis}`)
            .join(" / ")}
        </p>
      ) : null}

      {doc.kind === "child" ? (
        <p className="mb-3 text-xs text-muted-foreground">
          법정대리인:{" "}
          {doc.rows
            .map((row) => `${row.guardianName || "(미입력)"} (${row.guardianContact || "(미입력)"})`)
            .join(", ")}
        </p>
      ) : null}

      <p className="mb-3">{consentRefusal(doc.kind, serviceName)}</p>

      <div className="mt-4 flex flex-wrap items-center gap-5.5 border-t border-dashed pt-3.5">
        <span className="font-semibold">위와 같이 개인정보를 수집 및 이용하는데 동의하십니까?</span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block size-3.25 border border-foreground" /> 동의함
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block size-3.25 border border-foreground" /> 동의하지 않음
        </span>
      </div>
    </div>
  );
}

export function ThirdPartyDocumentView({ doc, serviceName }: { doc: ThirdPartyDocument; serviceName: string }) {
  return (
    <div className="rounded-xl border bg-card p-10 text-sm leading-[1.8]">
      <p className="mb-5.5 text-center text-[17px] font-bold">{doc.title}</p>
      <p className="mb-3">
        {COMPANY.name}(이하 &quot;당사&quot;)는 {serviceName} 서비스를 이용하는 경우 아래와 같이 개인정보를 제3자에게
        제공하고자 합니다.
      </p>

      <h4 className="mt-6.5 mb-2 text-sm font-bold">개인정보 제3자 제공 내역</h4>
      <table className="mb-3.5 w-full border border-foreground text-xs">
        <thead>
          <tr className="bg-muted">
            <th className="border border-foreground p-2 text-left">제공받는 자</th>
            <th className="border border-foreground p-2 text-left">제공 목적</th>
            <th className="border border-foreground p-2 text-left">제공 항목</th>
            <th className="border border-foreground p-2 text-left">보유 및 이용기간</th>
          </tr>
        </thead>
        <tbody>
          {doc.rows.map((row, i) => (
            <tr key={i}>
              <td className="border border-foreground p-2">{row.recipient}</td>
              <td className="border border-foreground p-2">{row.purpose}</td>
              <td className="border border-foreground p-2">{row.items}</td>
              <td className="border border-foreground p-2">{row.retention}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-3">
        위와 같이 개인정보를 제공하는 데 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 {serviceName} 서비스
        이용에 제한을 받을 수 있습니다.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-5.5 border-t border-dashed pt-3.5">
        <span className="font-semibold">위와 같이 개인정보를 제공하는데 동의하십니까?</span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block size-3.25 border border-foreground" /> 동의함
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="inline-block size-3.25 border border-foreground" /> 동의하지 않음
        </span>
      </div>
    </div>
  );
}
