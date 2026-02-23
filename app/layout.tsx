import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '한국 고등학생 대입 입시 정보 허브',
  description: '요약, 질문 생성, 전략 수립을 도와주는 대입 준비 허브',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
