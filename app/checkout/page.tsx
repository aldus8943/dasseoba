import type { Metadata } from "next";
import CheckoutPage from "@/components/checkout-page";

export const metadata: Metadata = {
  title: "주문·결제 | 다써바",
  description: "배송 정보를 입력하고 주문 상품과 결제 예정 금액을 확인하세요.",
};

export default function Page() { return <CheckoutPage />; }
