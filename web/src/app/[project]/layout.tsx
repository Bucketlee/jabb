import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string }>;
}): Promise<Metadata> {
  const { project } = await params;
  return {
    title: `${project} — jabb`,
  };
}

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
