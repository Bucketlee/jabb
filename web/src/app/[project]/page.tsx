import { Suspense } from 'react';
import Link from 'next/link';
import { fetchOverview, fetchEvents } from '@/lib/api';
import { periodToRange, isPeriod, type Period } from '@/lib/date';
import { BarChart } from '@/components/BarChart';
import { DailyChart } from '@/components/DailyChart';
import { PercentBar } from '@/components/PercentBar';
import { PeriodTabs } from '@/components/PeriodTabs';
import { InstallGuide } from '@/components/InstallGuide';

interface PageProps {
  params: Promise<{ project: string }>;
  searchParams: Promise<{ period?: string }>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold tabular-nums tracking-tight">
        {value.toLocaleString('en-US')}
      </p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
      {children}
    </h2>
  );
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const { project } = await params;
  const { period: periodParam } = await searchParams;

  const period: Period = isPeriod(periodParam ?? '') ? (periodParam as Period) : '7d';
  const { from, to } = periodToRange(period);

  let overview = null;
  let eventsData = null;
  let fetchError = false;

  try {
    [overview, eventsData] = await Promise.all([
      fetchOverview(project, from, to),
      fetchEvents(project, from, to),
    ]);
  } catch {
    fetchError = true;
  }

  const hasData = overview && overview.total_views > 0;

  const deviceItems = overview
    ? Object.entries(overview.devices)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  const countryItems = overview
    ? Object.entries(overview.countries)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    : [];

  const browserItems = overview
    ? Object.entries(overview.browsers)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex-shrink-0">
              jabb
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="font-medium truncate">{project}</span>
          </div>
          <Suspense fallback={null}>
            <PeriodTabs current={period} project={project} />
          </Suspense>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {fetchError ? (
          <div className="py-16 text-center text-zinc-500 dark:text-zinc-400">
            데이터를 불러오는 중 오류가 발생했습니다
          </div>
        ) : !hasData ? (
          <InstallGuide project={project} />
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="페이지뷰" value={overview!.total_views} />
              <StatCard label="방문자" value={overview!.unique_visitors} />
            </div>

            {overview!.daily.length > 0 && (
              <section>
                <SectionTitle>일별 추이</SectionTitle>
                <DailyChart data={overview!.daily} from={from} to={to} />
              </section>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {overview!.top_pages.length > 0 && (
                <section>
                  <SectionTitle>상위 페이지</SectionTitle>
                  <BarChart
                    items={overview!.top_pages.map((p) => ({ label: p.url, value: p.views }))}
                  />
                </section>
              )}

              {overview!.top_referrers.length > 0 && (
                <section>
                  <SectionTitle>상위 리퍼러</SectionTitle>
                  <BarChart
                    items={overview!.top_referrers.map((r) => ({
                      label: r.referrer || '(direct)',
                      value: r.views,
                    }))}
                  />
                </section>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {deviceItems.length > 0 && (
                <section>
                  <SectionTitle>디바이스</SectionTitle>
                  <PercentBar items={deviceItems} />
                </section>
              )}

              {browserItems.length > 0 && (
                <section>
                  <SectionTitle>브라우저</SectionTitle>
                  <PercentBar items={browserItems} />
                </section>
              )}

              {countryItems.length > 0 && (
                <section>
                  <SectionTitle>국가</SectionTitle>
                  <PercentBar items={countryItems} />
                </section>
              )}
            </div>

            {eventsData && eventsData.events.length > 0 && (
              <section>
                <SectionTitle>이벤트</SectionTitle>
                <BarChart
                  items={eventsData.events.map((e) => ({ label: e.name, value: e.count }))}
                />
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
