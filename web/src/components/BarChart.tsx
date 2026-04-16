interface BarItem {
  label: string;
  value: number;
}

interface BarChartProps {
  items: BarItem[];
  maxValue?: number;
}

export function BarChart({ items, maxValue }: BarChartProps) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <li key={item.label}>
            <div className="flex items-baseline justify-between text-sm mb-1.5 gap-2">
              <span className="truncate text-zinc-700 dark:text-zinc-300 min-w-0">
                {item.label || '(direct)'}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 tabular-nums flex-shrink-0 text-xs">
                {item.value.toLocaleString('en-US')}
              </span>
            </div>
            <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-800 dark:bg-zinc-200 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
