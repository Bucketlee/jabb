import { Suspense } from 'react';
import Link from 'next/link';
import { fetchOverview, fetchEvents } from '@/lib/api';
import { periodToRange, isPeriod, type Period } from '@/lib/date';
import { BarChart } from '@/components/BarChart';
import { DailyChart } from '@/components/DailyChart';
import { PercentBar } from '@/components/PercentBar';
import { PeriodTabs } from '@/components/PeriodTabs';
import { InstallGuide } from '@/components/InstallGuide';
import { InfoTooltip } from '@/components/InfoTooltip';
import type { OverviewResponse, EventsResponse } from '@/lib/api';

interface PageProps {
  params: Promise<{ project: string }>;
  searchParams: Promise<{ period?: string }>;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatReferrers(
  referrers: { referrer: string; views: number }[],
): { label: string; value: number }[] {
  return referrers.map((r) => ({
    label: r.referrer ? extractDomain(r.referrer) : '(direct)',
    value: r.views,
  }));
}

function StatCard({ label, value, tooltip }: { label: string; value: number; tooltip?: string }) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
      <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </p>
      <p className="text-4xl font-semibold tabular-nums tracking-tight">
        {value.toLocaleString('en-US')}
      </p>
    </div>
  );
}

function SectionTitle({ children, tooltip }: { children: React.ReactNode; tooltip?: string }) {
  return (
    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-1.5">
      {children}
      {tooltip && <InfoTooltip text={tooltip} />}
    </h2>
  );
}

function Header({ project }: { project: string }) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm z-10">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 h-12 flex items-center gap-2 min-w-0">
        <Link
          href="/"
          className="text-sm text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors flex-shrink-0"
        >
          jabb
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700 select-none">/</span>
        <span className="text-sm font-medium truncate">{project}</span>
      </div>
    </header>
  );
}

function HeaderWithPeriod({ project, period }: { project: string; period: Period }) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm z-10">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/"
            className="text-sm text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors flex-shrink-0"
          >
            jabb
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700 select-none">/</span>
          <span className="text-sm font-medium truncate">{project}</span>
        </div>
        <Suspense fallback={null}>
          <PeriodTabs current={period} project={project} />
        </Suspense>
      </div>
    </header>
  );
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const { project } = await params;
  const { period: periodParam } = await searchParams;

  const period: Period = isPeriod(periodParam ?? '') ? (periodParam as Period) : '7d';
  const { from, to } = periodToRange(period);

  let overview: OverviewResponse | null = null;
  let eventsData: EventsResponse | null = null;
  let fetchError = false;

  try {
    [overview, eventsData] = await Promise.all([
      fetchOverview(project, from, to),
      fetchEvents(project, from, to),
    ]);
  } catch (err) {
    console.error(err);
    fetchError = true;
  }

  if (fetchError) {
    return (
      <div className="min-h-screen">
        <Header project={project} />
        <main className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
          <div className="py-20 text-center text-sm text-zinc-400 dark:text-zinc-500">
            데이터를 불러오는 중 오류가 발생했습니다
          </div>
        </main>
      </div>
    );
  }

  if (!overview || overview.total_views === 0) {
    return (
      <div className="min-h-screen">
        <HeaderWithPeriod project={project} period={period} />
        <main className="max-w-4xl mx-auto px-5 sm:px-8 py-12">
          <InstallGuide project={project} />
        </main>
      </div>
    );
  }

  const deviceItems = Object.entries(overview.devices)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const countryItems = Object.entries(overview.countries)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const browserItems = Object.entries(overview.browsers)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const referrerItems = formatReferrers(overview.top_referrers);

  const topPageItems = overview.top_pages.map((p) => ({
    label: p.url,
    value: p.views,
  }));

  return (
    <div className="min-h-screen">
      <HeaderWithPeriod project={project} period={period} />

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="space-y-12">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="페이지뷰"
              value={overview.total_views}
              tooltip="페이지가 로드된 총 횟수. 한 방문자가 여러 페이지를 보면 각각 1로 집계됨."
            />
            <StatCard
              label="방문자"
              value={overview.unique_visitors}
              tooltip="IP + 브라우저 조합 해시로 구분되는 고유 사용자 수. 쿠키는 사용하지 않음."
            />
          </div>

          {overview.daily.length > 0 && (
            <section>
              <SectionTitle tooltip="선택한 기간의 날짜별 페이지뷰 수.">일별 추이</SectionTitle>
              <DailyChart data={overview.daily} from={from} to={to} />
            </section>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {topPageItems.length > 0 && (
              <section>
                <SectionTitle tooltip="가장 많이 조회된 페이지 경로. 페이지뷰 기준.">상위 페이지</SectionTitle>
                <BarChart items={topPageItems} />
              </section>
            )}

            {referrerItems.length > 0 && (
              <section>
                <SectionTitle tooltip="외부에서 이 사이트로 들어온 출처. 방문자 기준으로 집계하며, 같은 사이트 내 이동은 제외됨.">유입 경로</SectionTitle>
                <BarChart items={referrerItems} />
              </section>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {deviceItems.length > 0 && (
              <section>
                <SectionTitle tooltip="방문자의 기기 종류 (데스크톱/모바일/태블릿). User-Agent 기반.">디바이스</SectionTitle>
                <PercentBar items={deviceItems} />
              </section>
            )}

            {browserItems.length > 0 && (
              <section>
                <SectionTitle tooltip="방문자가 사용한 웹 브라우저 종류. User-Agent 기반.">브라우저</SectionTitle>
                <PercentBar items={browserItems} />
              </section>
            )}

            {countryItems.length > 0 && (
              <section>
                <SectionTitle tooltip="방문자의 IP 기반 추정 국가. VPN 사용 시 부정확할 수 있음.">국가</SectionTitle>
                <PercentBar items={countryItems} />
              </section>
            )}
          </div>

          {eventsData && eventsData.events.length > 0 && (
            <section>
              <SectionTitle tooltip="페이지뷰와 별도로 jabb('name', {...}) 로 추적한 커스텀 이벤트 발생 횟수.">이벤트</SectionTitle>
              <BarChart
                items={eventsData.events.map((e) => ({ label: e.name, value: e.count }))}
              />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
