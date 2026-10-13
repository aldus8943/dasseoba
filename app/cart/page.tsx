import type { Metadata } from "next";
import CartPage from "@/components/cart-page";

export const metadata: Metadata = {
  title: "장바구니 | 다써바",
  description: "다써바 장바구니에서 선택한 상품과 결제 예정 금액을 확인하세요.",
};

export default function Page() {
  return <CartPage />;
}
