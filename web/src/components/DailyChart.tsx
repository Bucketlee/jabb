interface DailyItem {
  day: string;
  views: number;
}

interface DailyChartProps {
  data: DailyItem[];
  from: string;
  to: string;
}

function fillDays(data: DailyItem[], from: string, to: string): DailyItem[] {
  const map = new Map(data.map((d) => [d.day, d.views]));
  const result: DailyItem[] = [];
  const cursor = new Date(from);
  const end = new Date(to);
  while (cursor <= end) {
    const day = cursor.toISOString().slice(0, 10);
    result.push({ day, views: map.get(day) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

export function DailyChart({ data, from, to }: DailyChartProps) {
  const filled = fillDays(data, from, to);
  const max = Math.max(...filled.map((d) => d.views), 1);

  return (
    <div className="flex items-end gap-px h-16 w-full">
      {filled.map((item) => {
        const heightPct = (item.views / max) * 100;
        return (
          <div
            key={item.day}
            title={`${item.day.slice(5)}: ${item.views.toLocaleString('en-US')}`}
            className="flex-1 flex flex-col items-center justify-end h-full group relative"
          >
            <div
              className="w-full bg-zinc-300 dark:bg-zinc-600 group-hover:bg-zinc-700 dark:group-hover:bg-zinc-300 transition-colors rounded-sm"
              style={{ height: `${Math.max(heightPct, 2)}%` }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              {item.day.slice(5)}: {item.views.toLocaleString('en-US')}
            </div>
          </div>
        );
      })}
    </div>
  );
}
