import { fetchOverview, fetchEvents } from "./api.js";
import {
  formatOverview,
  formatEvents,
  formatNoData,
} from "./format.js";

interface Args {
  project: string;
  period: "today" | "week" | "month";
  events: boolean;
  json: boolean;
  api: string;
}

function parseArgs(argv: string[]): Args {
  const args = argv.slice(2);

  if (args.length === 0 || args[0]?.startsWith("--")) {
    console.error("  사용법: jabb <project> [--week|--month|--events|--json]");
    process.exit(1);
  }

  const project = args[0] as string;
  const flags = new Set(args.slice(1));

  let period: "today" | "week" | "month" = "today";
  if (flags.has("--week")) period = "week";
  else if (flags.has("--month")) period = "month";

  let api = "https://jabb.vercel.app/api";
  for (const flag of flags) {
    if (flag.startsWith("--api=")) {
      api = flag.slice(6);
    }
  }

  return {
    project,
    period,
    events: flags.has("--events"),
    json: flags.has("--json"),
    api,
  };
}

async function main(): Promise<void> {
  const { project, period, events, json, api } = parseArgs(process.argv);

  try {
    if (events) {
      const data = await fetchEvents(project, period, api);
      if (json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }
      if (data.events.length === 0) {
        formatNoData(project);
        return;
      }
      formatEvents(project, period, data);
    } else {
      const data = await fetchOverview(project, period, api);
      if (json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }
      if (data.total_views === 0 && data.top_pages.length === 0) {
        formatNoData(project);
        return;
      }
      formatOverview(project, period, data);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  오류: ${message}`);
    process.exit(1);
  }
}

main();
