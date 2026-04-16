import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'jabb — 경량 웹 분석',
  description: '스크립트 한 줄로 시작하는 초경량 웹 분석 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
