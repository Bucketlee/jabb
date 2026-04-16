'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Period } from '@/lib/date';

const TABS: { value: Period; label: string }[] = [
  { value: 'today', label: '오늘' },
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
];

interface PeriodTabsProps {
  current: Period;
  project: string;
}

export function PeriodTabs({ current, project }: PeriodTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(period: Period) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    router.push(`/${project}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleChange(tab.value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            current === tab.value
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-medium'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
