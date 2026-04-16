interface PercentItem {
  label: string;
  value: number;
}

interface PercentBarProps {
  items: PercentItem[];
}

export function PercentBar({ items }: PercentBarProps) {
  const total = items.reduce((sum, i) => sum + i.value, 0) || 1;

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.value / total) * 100);
        return (
          <li key={item.label} className="text-sm">
            <div className="flex items-baseline justify-between mb-1.5 gap-2">
              <span className="text-zinc-700 dark:text-zinc-300 truncate">{item.label}</span>
              <span className="text-zinc-400 dark:text-zinc-500 tabular-nums text-xs flex-shrink-0">
                {pct}%
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
