import { sparkline } from "./sparkline.js";
import type { OverviewResponse, EventsResponse } from "./api.js";

const BAR_WIDTH = 20;

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function bar(ratio: number): string {
  const filled = Math.round(ratio * BAR_WIDTH);
  const empty = BAR_WIDTH - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function periodLabel(period: "today" | "week" | "month"): string {
  const today = new Date().toISOString().slice(0, 10);
  if (period === "today") return `오늘 (${today})`;
  if (period === "week") return "최근 7일";
  return "최근 30일";
}

export function formatOverview(
  project: string,
  period: "today" | "week" | "month",
  data: OverviewResponse
): void {
  const indent = "  ";

  console.log("");
  console.log(`${indent}jabb · ${project} · ${periodLabel(period)}`);
  console.log("");
  console.log(`${indent}페이지뷰   ${fmt(data.total_views).padStart(8)}`);
  console.log(`${indent}방문자     ${fmt(data.unique_visitors).padStart(8)}`);

  if (period !== "today" && data.daily.length > 0) {
    const values = data.daily.map((d) => d.views);
    console.log("");
    console.log(`${indent}일별 추이`);
    console.log(`${indent}${sparkline(values)}`);
  }

  if (data.top_pages.length > 0) {
    console.log("");
    console.log(`${indent}상위 페이지`);

    const maxViews = data.top_pages[0]?.views ?? 1;

    for (const page of data.top_pages.slice(0, 5)) {
      const ratio = maxViews > 0 ? page.views / maxViews : 0;
      const pct = data.total_views > 0
        ? Math.round((page.views / data.total_views) * 100)
        : 0;
      const url = page.url.padEnd(20).slice(0, 20);
      const views = fmt(page.views).padStart(6);
      console.log(
        `${indent}${url}  ${views}  ${bar(ratio)}  ${String(pct).padStart(3)}%`
      );
    }
  }

  console.log("");
}

export function formatEvents(
  project: string,
  period: "today" | "week" | "month",
  data: EventsResponse
): void {
  const indent = "  ";

  console.log("");
  console.log(`${indent}jabb · ${project} · ${periodLabel(period)} · 이벤트`);
  console.log("");

  if (data.events.length === 0) {
    console.log(`${indent}이벤트 데이터가 없습니다.`);
    console.log("");
    return;
  }

  const maxCount = data.events[0]?.count ?? 1;

  for (const ev of data.events) {
    const ratio = maxCount > 0 ? ev.count / maxCount : 0;
    const name = ev.name.padEnd(24).slice(0, 24);
    const count = fmt(ev.count).padStart(6);
    console.log(`${indent}${name}  ${count}  ${bar(ratio)}`);
  }

  console.log("");
}

export function formatNoData(project: string): void {
  const indent = "  ";
  console.log("");
  console.log(`${indent}jabb · ${project}`);
  console.log("");
  console.log(`${indent}데이터가 없습니다.`);
  console.log("");
  console.log(`${indent}시작하기:`);
  console.log(
    `${indent}<script src="https://jabb.vercel.app/t.js" data-project="${project}"></script>`
  );
  console.log("");
}
