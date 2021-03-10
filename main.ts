import { BasicAggregator, WebSessionMetricsReporter } from "./src";

const flushFrequency = 5;
const logGroupName = "WebsiteLogs";
const logsEndpoint = process.env.CW_ENDPOINT!;
const aggregator = new BasicAggregator({ namespace: "WebsiteMetrics" });
const reporter = new WebSessionMetricsReporter({ aggregator, logsEndpoint, logGroupName, flushFrequency });

async function main() {
  await reporter.startReporting("@mihilmy");
}

main();
