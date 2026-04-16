const BLOCKS = "▁▂▃▄▅▆▇█";

export function sparkline(values: number[]): string {
  if (values.length === 0) return "";

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;

  return values
    .map((v) => {
      if (range === 0) return BLOCKS[3] ?? "▄";
      const idx = Math.round(((v - min) / range) * (BLOCKS.length - 1));
      return BLOCKS[idx] ?? BLOCKS[BLOCKS.length - 1] ?? "█";
    })
    .join("");
}
