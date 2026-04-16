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
    <ul className="space-y-2">
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <li key={item.label} className="group">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="truncate max-w-[60%] text-zinc-700 dark:text-zinc-300">
                {item.label || '(direct)'}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">
                {item.value.toLocaleString('en-US')}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
