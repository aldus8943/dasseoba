import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "다써바 | 매일 쓰고 싶은 모자",
  description: "볼캡부터 단체 자수 제작까지, 모자 전문 커머스 다써바",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
