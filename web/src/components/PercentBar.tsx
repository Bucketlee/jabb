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
    <ul className="space-y-2">
      {items.map((item) => {
        const pct = Math.round((item.value / total) * 100);
        return (
          <li key={item.label} className="flex items-center gap-3 text-sm">
            <span className="w-20 flex-shrink-0 text-zinc-700 dark:text-zinc-300 truncate">
              {item.label}
            </span>
            <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right text-zinc-500 dark:text-zinc-400 tabular-nums">
              {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
