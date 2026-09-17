import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { WizardProvider } from "@/components/wizard/wizard-context";
import Home from "@/app/page";

test("시작 화면은 신규 서비스 시작 링크와 준비 중인 개정 카드를 보여준다", () => {
  render(
    <WizardProvider>
      <Home />
    </WizardProvider>,
  );

  const startLink = screen.getByRole("link", { name: /신규 서비스 문서 만들기/ });
  expect(startLink).toHaveAttribute("href", "/service-info");
  expect(screen.getByText("준비 중")).toBeInTheDocument();
});
